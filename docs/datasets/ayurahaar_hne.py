import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GraphSAGE, GCNConv, global_mean_pool
from torch_geometric.data import Data, Batch
import networkx as nx
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import json
from dataclasses import dataclass
from enum import Enum
import os
from pathlib import Path

# Hugging Face transformers for pretrained models
from transformers import (
    AutoTokenizer, AutoModel, AutoConfig,
    T5ForConditionalGeneration, T5Tokenizer,
    GPT2LMHeadModel, GPT2Tokenizer,
    BartForConditionalGeneration, BartTokenizer,
    Trainer, TrainingArguments
)
from torch.utils.data import Dataset, DataLoader
from huggingface_hub import login as hf_login

# Data structures for our domain
@dataclass
class Food:
    id: str
    name: str
    category: str
    calories: float
    protein: float
    carbs: float
    fats: float
    fiber: float
    vitamins: Dict[str, float]
    minerals: Dict[str, float]
    dosha_effects: Dict[str, str]  # vata, pitta, kapha effects
    rasa: str  # taste
    guna: List[str]  # qualities
    virya: str  # potency
    vipaka: str  # post-digestive effect
    health_tags: List[str]
    contraindications: List[str]

@dataclass
class Patient:
    id: str
    age: int
    gender: str
    weight: float
    height: float
    bmi: float
    lifestyle: str
    prakriti: str  # constitutional type
    health_conditions: List[str]
    allergies: List[str]
    preferred_cuisine: List[str]

@dataclass
class MealPlan:
    patient_id: str
    day: int
    breakfast: List[str]
    lunch: List[str] 
    dinner: List[str]
    snacks: List[str]
    restrictions: List[str]
    doctor_notes: str

class NodeType(Enum):
    FOOD = "food"
    PATIENT = "patient" 
    DOSHA = "dosha"
    RASA = "rasa"
    GUNA = "guna"
    CONDITION = "condition"
    CATEGORY = "category"

# Step 1: Knowledge Graph Foundation (Same as before)
class AyurvedaKnowledgeGraph:
    def __init__(self):
        self.graph = nx.Graph()
        self.node_to_idx = {}
        self.idx_to_node = {}
        self.node_types = {}
        self.node_features = {}
        
    def add_food_node(self, food: Food):
        """Add a food item and its relationships to the graph"""
        food_id = f"food_{food.id}"
        self.graph.add_node(food_id)
        self.node_types[food_id] = NodeType.FOOD
        
        # Store food features
        self.node_features[food_id] = {
            'calories': food.calories,
            'protein': food.protein,
            'carbs': food.carbs,
            'fats': food.fats,
            'fiber': food.fiber,
            'category_embedding': self._encode_category(food.category)
        }
        
        # Add relationships
        for dosha, effect in food.dosha_effects.items():
            dosha_node = f"dosha_{dosha}"
            self._ensure_node_exists(dosha_node, NodeType.DOSHA)
            self.graph.add_edge(food_id, dosha_node, relation=f"affects_{effect}")
        
        rasa_node = f"rasa_{food.rasa}"
        self._ensure_node_exists(rasa_node, NodeType.RASA)
        self.graph.add_edge(food_id, rasa_node, relation="has_taste")
        
        for guna in food.guna:
            guna_node = f"guna_{guna}"
            self._ensure_node_exists(guna_node, NodeType.GUNA)
            self.graph.add_edge(food_id, guna_node, relation="has_quality")
        
        category_node = f"category_{food.category}"
        self._ensure_node_exists(category_node, NodeType.CATEGORY)
        self.graph.add_edge(food_id, category_node, relation="belongs_to")
        
        for tag in food.health_tags:
            condition_node = f"condition_{tag}"
            self._ensure_node_exists(condition_node, NodeType.CONDITION)
            self.graph.add_edge(food_id, condition_node, relation="beneficial_for")
    
    def add_patient_node(self, patient: Patient):
        """Add patient and their characteristics"""
        patient_id = f"patient_{patient.id}"
        self.graph.add_node(patient_id)
        self.node_types[patient_id] = NodeType.PATIENT
        
        self.node_features[patient_id] = {
            'age': patient.age,
            'bmi': patient.bmi,
            'gender_embedding': self._encode_gender(patient.gender),
            'lifestyle_embedding': self._encode_lifestyle(patient.lifestyle)
        }
        
        prakriti_node = f"dosha_{patient.prakriti}"
        self._ensure_node_exists(prakriti_node, NodeType.DOSHA)
        self.graph.add_edge(patient_id, prakriti_node, relation="has_prakriti")
        
        for condition in patient.health_conditions:
            condition_node = f"condition_{condition}"
            self._ensure_node_exists(condition_node, NodeType.CONDITION)
            self.graph.add_edge(patient_id, condition_node, relation="has_condition")
    
    def _ensure_node_exists(self, node_id: str, node_type: NodeType):
        if node_id not in self.graph:
            self.graph.add_node(node_id)
            self.node_types[node_id] = node_type
            self.node_features[node_id] = {}
    
    def _encode_category(self, category: str) -> List[float]:
        categories = ['grains', 'vegetables', 'fruits', 'dairy', 'spices', 'legumes']
        encoding = [1.0 if category.lower() == cat else 0.0 for cat in categories]
        return encoding
    
    def _encode_gender(self, gender: str) -> List[float]:
        return [1.0, 0.0] if gender.lower() == 'male' else [0.0, 1.0]
    
    def _encode_lifestyle(self, lifestyle: str) -> List[float]:
        lifestyles = ['sedentary', 'moderate', 'active', 'very_active']
        encoding = [1.0 if lifestyle.lower() == ls else 0.0 for ls in lifestyles]
        return encoding
    
    def to_pytorch_geometric(self) -> Data:
        """Convert NetworkX graph to PyTorch Geometric format"""
        nodes = list(self.graph.nodes())
        self.node_to_idx = {node: idx for idx, node in enumerate(nodes)}
        self.idx_to_node = {idx: node for node, idx in self.node_to_idx.items()}
        
        edges = list(self.graph.edges())
        edge_index = torch.tensor([[self.node_to_idx[u], self.node_to_idx[v]] 
                                  for u, v in edges], dtype=torch.long).t().contiguous()
        
        node_features = []
        for node in nodes:
            features = []
            node_type = self.node_types[node]
            
            type_embedding = [0.0] * len(NodeType)
            type_embedding[list(NodeType).index(node_type)] = 1.0
            features.extend(type_embedding)
            
            if node in self.node_features:
                for key, value in self.node_features[node].items():
                    if isinstance(value, list):
                        features.extend(value)
                    else:
                        features.append(float(value))
            
            while len(features) < 32:
                features.append(0.0)
                
            node_features.append(features[:32])
        
        x = torch.tensor(node_features, dtype=torch.float)
        return Data(x=x, edge_index=edge_index)

# Step 2: Graph Neural Network for Food Embeddings
class GraphNeuralNetwork(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        super().__init__()
        self.conv1 = GCNConv(input_dim, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, hidden_dim)
        self.conv3 = GCNConv(hidden_dim, output_dim)
        self.dropout = nn.Dropout(0.2)
        
    def forward(self, x, edge_index, batch=None):
        h1 = F.relu(self.conv1(x, edge_index))
        h1 = self.dropout(h1)
        
        h2 = F.relu(self.conv2(h1, edge_index))
        h2 = self.dropout(h2)
        
        h3 = self.conv3(h2, edge_index)
        return h3

# Step 3: Pretrained Transformer Models
class T5MealPlanner(nn.Module):
    """Using T5 for text-to-text meal planning"""
    
    def __init__(self, model_name: str = "t5-base", graph_embedding_dim: int = 256):
        super().__init__()
        self.tokenizer = T5Tokenizer.from_pretrained(model_name)
        self.model = T5ForConditionalGeneration.from_pretrained(model_name)
        
        # Add special tokens for Ayurveda concepts
        special_tokens = [
            "<patient>", "</patient>", "<day>", "</day>",
            "<breakfast>", "</breakfast>", "<lunch>", "</lunch>", 
            "<dinner>", "</dinner>", "<snacks>", "</snacks>",
            "<vata>", "<pitta>", "<kapha>", 
            "<sweet>", "<sour>", "<salty>", "<pungent>", "<bitter>", "<astringent>",
            "<diabetes>", "<hypertension>", "<obesity>", "<digestion>"
        ]
        
        self.tokenizer.add_tokens(special_tokens)
        self.model.resize_token_embeddings(len(self.tokenizer))
        
        # Graph embeddings integration
        self.graph_encoder = GraphNeuralNetwork(32, 128, graph_embedding_dim)
        self.graph_projection = nn.Linear(graph_embedding_dim, self.model.config.d_model)
        
    def format_patient_input(self, patient: Patient, day: int) -> str:
        """Convert patient data to structured text input"""
        input_text = f"<patient> "
        input_text += f"Age: {patient.age}, Gender: {patient.gender}, "
        input_text += f"BMI: {patient.bmi:.1f}, Lifestyle: {patient.lifestyle}, "
        input_text += f"Prakriti: <{patient.prakriti.lower()}>, "
        
        if patient.health_conditions:
            conditions = ", ".join([f"<{cond.lower()}>" for cond in patient.health_conditions])
            input_text += f"Conditions: {conditions}, "
        
        if patient.allergies:
            input_text += f"Allergies: {', '.join(patient.allergies)}, "
            
        if patient.preferred_cuisine:
            input_text += f"Cuisine: {', '.join(patient.preferred_cuisine)}"
            
        input_text += f" </patient> <day> {day} </day> Generate meal plan:"
        
        return input_text
    
    def format_meal_plan_output(self, meal_plan: MealPlan) -> str:
        """Convert meal plan to structured text output"""
        output_text = ""
        
        if meal_plan.breakfast:
            output_text += "<breakfast> " + ", ".join(meal_plan.breakfast) + " </breakfast> "
        
        if meal_plan.lunch:
            output_text += "<lunch> " + ", ".join(meal_plan.lunch) + " </lunch> "
        
        if meal_plan.dinner:
            output_text += "<dinner> " + ", ".join(meal_plan.dinner) + " </dinner> "
            
        if meal_plan.snacks:
            output_text += "<snacks> " + ", ".join(meal_plan.snacks) + " </snacks>"
            
        return output_text.strip()

class BARTMealPlanner(nn.Module):
    """Using BART for sequence-to-sequence meal planning"""
    
    def __init__(self, model_name: str = "facebook/bart-base"):
        super().__init__()
        self.tokenizer = BartTokenizer.from_pretrained(model_name)
        self.model = BartForConditionalGeneration.from_pretrained(model_name)
        
        # Add Ayurveda-specific tokens
        ayurveda_tokens = [
            "[VATA]", "[PITTA]", "[KAPHA]", "[TRIDOSHIC]",
            "[SWEET]", "[SOUR]", "[SALTY]", "[PUNGENT]", "[BITTER]", "[ASTRINGENT]",
            "[DIABETES]", "[HYPERTENSION]", "[OBESITY]", "[DIGESTION]",
            "[BREAKFAST]", "[LUNCH]", "[DINNER]", "[SNACKS]"
        ]
        
        self.tokenizer.add_tokens(ayurveda_tokens)
        self.model.resize_token_embeddings(len(self.tokenizer))
        
        # Graph integration
        self.graph_encoder = GraphNeuralNetwork(32, 128, 256)
        
    def create_patient_prompt(self, patient: Patient, day: int) -> str:
        """Create a natural language prompt for the patient"""
        prompt = f"Create an Ayurvedic meal plan for Day {day}. "
        prompt += f"Patient: {patient.age}y {patient.gender}, BMI {patient.bmi:.1f}, "
        prompt += f"{patient.lifestyle} lifestyle, {patient.prakriti} constitution. "
        
        if patient.health_conditions:
            prompt += f"Health conditions: {', '.join(patient.health_conditions)}. "
            
        if patient.allergies:
            prompt += f"Allergies: {', '.join(patient.allergies)}. "
            
        prompt += "Provide breakfast, lunch, dinner, and snacks."
        
        return prompt

class GPT2MealPlanner(nn.Module):
    """Using GPT-2 for autoregressive meal planning"""
    
    def __init__(self, model_name: str = "gpt2"):
        super().__init__()
        self.tokenizer = GPT2Tokenizer.from_pretrained(model_name)
        self.model = GPT2LMHeadModel.from_pretrained(model_name)
        
        # Add padding token (GPT-2 doesn't have one by default)
        self.tokenizer.pad_token = self.tokenizer.eos_token
        
        # Add special tokens
        special_tokens = ["[PATIENT]", "[PLAN]", "[DAY1]", "[DAY2]", "[DAY3]", "[DAY4]", "[DAY5]", "[DAY6]", "[DAY7]"]
        self.tokenizer.add_tokens(special_tokens)
        self.model.resize_token_embeddings(len(self.tokenizer))

# Dataset class for training
class AyurvedaMealPlanDataset(Dataset):
    def __init__(self, patients: List[Patient], meal_plans: List[MealPlan], 
                 tokenizer, max_length: int = 512, model_type: str = "t5"):
        self.patients = {p.id: p for p in patients}
        self.meal_plans = meal_plans
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.model_type = model_type
        
    def __len__(self):
        return len(self.meal_plans)
    
    def __getitem__(self, idx):
        meal_plan = self.meal_plans[idx]
        patient = self.patients[meal_plan.patient_id]
        
        if self.model_type == "t5":
            return self._get_t5_item(patient, meal_plan)
        elif self.model_type == "bart":
            return self._get_bart_item(patient, meal_plan)
        else:  # GPT-2
            return self._get_gpt2_item(patient, meal_plan)
    
    def _get_t5_item(self, patient: Patient, meal_plan: MealPlan):
        # Create input text
        input_text = f"<patient> Age: {patient.age}, Gender: {patient.gender}, "
        input_text += f"BMI: {patient.bmi:.1f}, Prakriti: {patient.prakriti}, "
        input_text += f"Conditions: {', '.join(patient.health_conditions)} </patient> "
        input_text += f"<day> {meal_plan.day} </day> Generate meal plan:"
        
        # Create target text
        target_text = ""
        if meal_plan.breakfast:
            target_text += f"<breakfast> {', '.join(meal_plan.breakfast)} </breakfast> "
        if meal_plan.lunch:
            target_text += f"<lunch> {', '.join(meal_plan.lunch)} </lunch> "
        if meal_plan.dinner:
            target_text += f"<dinner> {', '.join(meal_plan.dinner)} </dinner> "
        if meal_plan.snacks:
            target_text += f"<snacks> {', '.join(meal_plan.snacks)} </snacks>"
        
        # Tokenize
        inputs = self.tokenizer(
            input_text, 
            max_length=self.max_length, 
            padding='max_length', 
            truncation=True, 
            return_tensors='pt'
        )
        
        targets = self.tokenizer(
            target_text, 
            max_length=self.max_length, 
            padding='max_length', 
            truncation=True, 
            return_tensors='pt'
        )
        
        return {
            'input_ids': inputs['input_ids'].squeeze(),
            'attention_mask': inputs['attention_mask'].squeeze(),
            'labels': targets['input_ids'].squeeze()
        }

# -----------------------------
# Data loading utilities (custom CSV datasets)
# -----------------------------

def _split_list(val: Optional[str]) -> List[str]:
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return []
    if isinstance(val, list):
        return val
    s = str(val).strip()
    if not s:
        return []
    # try JSON array
    try:
        parsed = json.loads(s)
        if isinstance(parsed, list):
            return [str(x).strip() for x in parsed if str(x).strip()]
    except Exception:
        pass
    # fallback: split by | or ,
    sep = '|' if '|' in s else ','
    return [p.strip() for p in s.split(sep) if p.strip()]

def _parse_float(val, default: float = 0.0) -> float:
    try:
        if val is None or (isinstance(val, float) and np.isnan(val)):
            return default
        return float(val)
    except Exception:
        return default

def _parse_dict(val) -> Dict[str, float]:
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return {}
    if isinstance(val, dict):
        # ensure float values where possible
        out = {}
        for k, v in val.items():
            try:
                out[str(k)] = float(v)
            except Exception:
                # keep as-is if not convertible
                try:
                    out[str(k)] = float(str(v).strip())
                except Exception:
                    pass
        return out
    s = str(val).strip()
    if not s:
        return {}
    # try json
    try:
        parsed = json.loads(s)
        if isinstance(parsed, dict):
            return {str(k): _parse_float(v) for k, v in parsed.items()}
    except Exception:
        pass
    # fallback: key:value pairs separated by | or ,
    pairs = s.split('|') if '|' in s else s.split(',')
    out: Dict[str, float] = {}
    for p in pairs:
        if ':' in p:
            k, v = p.split(':', 1)
            out[k.strip()] = _parse_float(v.strip())
        elif p.strip():
            out[p.strip()] = 1.0
    return out

def load_foods_csv(path: str) -> List[Food]:
    df = pd.read_csv(path)
    foods: List[Food] = []
    for _, row in df.iterrows():
        foods.append(
            Food(
                id=str(row.get('id', row.get('food_id', _))),
                name=str(row.get('name', row.get('food_name', 'Unknown'))),
                category=str(row.get('category', 'unknown')),
                calories=_parse_float(row.get('calories', 0)),
                protein=_parse_float(row.get('protein', 0)),
                carbs=_parse_float(row.get('carbs', row.get('carbohydrates', 0))),
                fats=_parse_float(row.get('fats', row.get('fat', 0))),
                fiber=_parse_float(row.get('fiber', 0)),
                vitamins=_parse_dict(row.get('vitamins', {})),
                minerals=_parse_dict(row.get('minerals', {})),
                dosha_effects={str(k).lower(): str(v) for k, v in _parse_dict(row.get('dosha_effects', {})).items()},
                rasa=str(row.get('rasa', '')) or 'neutral',
                guna=_split_list(row.get('guna', row.get('qualities', ''))),
                virya=str(row.get('virya', '')) or 'neutral',
                vipaka=str(row.get('vipaka', '')) or 'neutral',
                health_tags=_split_list(row.get('health_tags', row.get('tags', ''))),
                contraindications=_split_list(row.get('contraindications', '')),
            )
        )
    return foods

def load_patients_csv(path: str) -> List[Patient]:
    df = pd.read_csv(path)
    patients: List[Patient] = []
    for _, row in df.iterrows():
        height = _parse_float(row.get('height', 0))
        weight = _parse_float(row.get('weight', 0))
        bmi = _parse_float(row.get('bmi', 0))
        if not bmi and height and weight:
            try:
                h_m = height / 100.0 if height > 3 else height
                bmi = weight / (h_m * h_m) if h_m else 0.0
            except Exception:
                bmi = 0.0
        patients.append(
            Patient(
                id=str(row.get('id', row.get('patient_id', _))),
                age=int(_parse_float(row.get('age', 0))),
                gender=str(row.get('gender', 'unknown')),
                weight=weight,
                height=height,
                bmi=bmi,
                lifestyle=str(row.get('lifestyle', 'moderate')),
                prakriti=str(row.get('prakriti', row.get('constitution', 'tridoshic'))),
                health_conditions=_split_list(row.get('health_conditions', row.get('conditions', ''))),
                allergies=_split_list(row.get('allergies', '')),
                preferred_cuisine=_split_list(row.get('preferred_cuisine', row.get('cuisine', ''))),
            )
        )
    return patients

def load_doctor_plans_csv(path: str) -> List[MealPlan]:
    df = pd.read_csv(path)
    plans: List[MealPlan] = []
    for _, row in df.iterrows():
        plans.append(
            MealPlan(
                patient_id=str(row.get('patient_id', row.get('id', ''))),
                day=int(_parse_float(row.get('day', 1))),
                breakfast=_split_list(row.get('breakfast', '')),
                lunch=_split_list(row.get('lunch', '')),
                dinner=_split_list(row.get('dinner', '')),
                snacks=_split_list(row.get('snacks', '')),
                restrictions=_split_list(row.get('restrictions', '')),
                doctor_notes=str(row.get('doctor_notes', row.get('notes', ''))),
            )
        )
    return plans

def huggingface_login(token: Optional[str] = None):
    """Login to Hugging Face using a token. Token can come from arg or env.
    Environment variable names checked: HUGGINGFACE_TOKEN, HF_TOKEN.
    """
    tok = token or os.environ.get('HUGGINGFACE_TOKEN') or os.environ.get('HF_TOKEN')
    if tok:
        try:
            hf_login(token=tok)
            print('Logged in to Hugging Face Hub.')
        except Exception as e:
            print(f"Hugging Face login failed: {e}")
    else:
        print('No Hugging Face token provided; proceeding without login.')

# Main Hybrid Neural Engine with Pretrained Models
class HybridNeuralEngine:
    def __init__(self, model_type: str = "t5", model_name: str = None):
        self.model_type = model_type
        self.knowledge_graph = AyurvedaKnowledgeGraph()
        
        # Initialize the appropriate model
        if model_type == "t5":
            model_name = model_name or "t5-base"
            self.planner = T5MealPlanner(model_name)
            self.tokenizer = self.planner.tokenizer
        elif model_type == "bart":
            model_name = model_name or "facebook/bart-base"
            self.planner = BARTMealPlanner(model_name)
            self.tokenizer = self.planner.tokenizer
        elif model_type == "gpt2":
            model_name = model_name or "gpt2"
            self.planner = GPT2MealPlanner(model_name)
            self.tokenizer = self.planner.tokenizer
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
    
    def build_knowledge_graph(self, foods: List[Food], patients: List[Patient]):
        """Build the knowledge graph from data"""
        for food in foods:
            self.knowledge_graph.add_food_node(food)
        for patient in patients:
            self.knowledge_graph.add_patient_node(patient)
        return self.knowledge_graph.to_pytorch_geometric()
    
    def fine_tune(self, train_dataset: AyurvedaMealPlanDataset, 
                  val_dataset: AyurvedaMealPlanDataset = None,
                  output_dir: str = "./ayurveda_meal_planner",
                  num_epochs: int = 3,
                  batch_size: int = 8,
                  learning_rate: float = 5e-5):
        """Fine-tune the pretrained model"""
        
        training_args = TrainingArguments(
            output_dir=output_dir,
            num_train_epochs=num_epochs,
            per_device_train_batch_size=batch_size,
            per_device_eval_batch_size=batch_size,
            learning_rate=learning_rate,
            warmup_steps=100,
            logging_dir=f"{output_dir}/logs",
            logging_steps=50,
            save_steps=500,
            eval_steps=500 if val_dataset else None,
            evaluation_strategy="steps" if val_dataset else "no",
            save_total_limit=3,
            load_best_model_at_end=True if val_dataset else False,
            metric_for_best_model="eval_loss" if val_dataset else None,
            greater_is_better=False,
            dataloader_pin_memory=False,
        )
        
        trainer = Trainer(
            model=self.planner.model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=val_dataset,
            tokenizer=self.tokenizer,
        )
        
        # Start training
        trainer.train()
        
        # Save the fine-tuned model
        trainer.save_model()
        self.tokenizer.save_pretrained(output_dir)
        
        print(f"Model fine-tuned and saved to {output_dir}")
    
    def generate_meal_plan(self, patient: Patient, day: int, 
                          graph_data: Data = None,
                          max_length: int = 256,
                          temperature: float = 0.8) -> str:
        """Generate meal plan for a patient"""
        
        if self.model_type == "t5":
            input_text = self.planner.format_patient_input(patient, day)
            inputs = self.tokenizer(
                input_text, 
                return_tensors="pt", 
                max_length=512, 
                truncation=True
            )
            
            with torch.no_grad():
                outputs = self.planner.model.generate(
                    **inputs,
                    max_length=max_length,
                    temperature=temperature,
                    do_sample=True,
                    top_p=0.9,
                    pad_token_id=self.tokenizer.pad_token_id
                )
            
            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=False)
            
        elif self.model_type == "bart":
            input_text = self.planner.create_patient_prompt(patient, day)
            inputs = self.tokenizer(
                input_text, 
                return_tensors="pt", 
                max_length=512, 
                truncation=True
            )
            
            with torch.no_grad():
                outputs = self.planner.model.generate(
                    **inputs,
                    max_length=max_length,
                    temperature=temperature,
                    do_sample=True,
                    top_p=0.9
                )
            
            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
        else:  # GPT-2
            prompt = f"[PATIENT] {patient.prakriti} constitution, age {patient.age}, "
            prompt += f"conditions: {', '.join(patient.health_conditions)} [PLAN] [DAY{day}] "
            
            inputs = self.tokenizer(prompt, return_tensors="pt")
            
            with torch.no_grad():
                outputs = self.planner.model.generate(
                    **inputs,
                    max_length=max_length,
                    temperature=temperature,
                    do_sample=True,
                    top_p=0.9,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return generated_text
    
    def parse_generated_plan(self, generated_text: str) -> Dict[str, List[str]]:
        """Parse the generated text into structured meal plan"""
        plan = {
            'breakfast': [],
            'lunch': [],
            'dinner': [],
            'snacks': []
        }
        
        # Simple parsing logic - you can make this more sophisticated
        if '<breakfast>' in generated_text:
            breakfast_section = generated_text.split('<breakfast>')[1].split('</breakfast>')[0]
            plan['breakfast'] = [item.strip() for item in breakfast_section.split(',')]
        
        if '<lunch>' in generated_text:
            lunch_section = generated_text.split('<lunch>')[1].split('</lunch>')[0]
            plan['lunch'] = [item.strip() for item in lunch_section.split(',')]
        
        if '<dinner>' in generated_text:
            dinner_section = generated_text.split('<dinner>')[1].split('</dinner>')[0]
            plan['dinner'] = [item.strip() for item in dinner_section.split(',')]
        
        if '<snacks>' in generated_text:
            snacks_section = generated_text.split('<snacks>')[1].split('</snacks>')[0]
            plan['snacks'] = [item.strip() for item in snacks_section.split(',')]
        
        return plan

# Usage Example
def main():
    # Simple configuration block for Colab or scripts. Edit these variables as needed.
    HF_TOKEN = os.environ.get('HUGGINGFACE_TOKEN') or os.environ.get('HF_TOKEN') or ""
    FOODS_CSV = "foods.csv"  # e.g., "/content/drive/MyDrive/datasets/foods.csv"
    PATIENTS_CSV = "patients.csv"  # e.g., "/content/drive/MyDrive/datasets/patients.csv"
    PLANS_CSV = "doctor_plans.csv"  # e.g., "/content/drive/MyDrive/datasets/doctor_plans.csv"

    MODEL_TYPE = "t5"  # one of: "t5", "bart", "gpt2"
    MODEL_NAME = None   # override model name if needed, else default per type
    DO_TRAIN = False    # set to True to fine-tune
    OUTPUT_DIR = "./ayurveda_meal_planner"
    EPOCHS = 1
    BATCH_SIZE = 1
    LEARNING_RATE = 5e-5

    # Login to Hugging Face if token available
    huggingface_login(HF_TOKEN)

    # Load custom datasets
    foods_path = FOODS_CSV
    patients_path = PATIENTS_CSV
    plans_path = PLANS_CSV

    if not Path(foods_path).exists():
        raise FileNotFoundError(f"Foods CSV not found: {foods_path}")
    if not Path(patients_path).exists():
        raise FileNotFoundError(f"Patients CSV not found: {patients_path}")
    if not Path(plans_path).exists():
        raise FileNotFoundError(f"Doctor plans CSV not found: {plans_path}")

    foods = load_foods_csv(foods_path)
    patients = load_patients_csv(patients_path)
    plans = load_doctor_plans_csv(plans_path)

    # Initialize engine
    engine = HybridNeuralEngine(model_type=MODEL_TYPE, model_name=MODEL_NAME)

    # Build knowledge graph
    graph_data = engine.build_knowledge_graph(foods, patients)

    # Dataset for training
    dataset = AyurvedaMealPlanDataset(patients, plans, engine.tokenizer, model_type=MODEL_TYPE)

    # Optional fine-tune
    if DO_TRAIN and len(dataset) > 0:
        engine.fine_tune(
            dataset,
            output_dir=OUTPUT_DIR,
            num_epochs=EPOCHS,
            batch_size=BATCH_SIZE,
            learning_rate=LEARNING_RATE,
        )

    # Generate one example plan per patient for day 1
    for p in patients:
        gen_text = engine.generate_meal_plan(p, day=1, graph_data=graph_data)
        parsed = engine.parse_generated_plan(gen_text)
        print(f"Patient {p.id} - Generated Meal Plan (Day 1):")
        print(f"  Breakfast: {parsed['breakfast']}")
        print(f"  Lunch: {parsed['lunch']}")
        print(f"  Dinner: {parsed['dinner']}")
        print(f"  Snacks: {parsed['snacks']}")

if __name__ == "__main__":
    main()