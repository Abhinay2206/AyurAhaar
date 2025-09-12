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
import warnings
warnings.filterwarnings('ignore')

# Hugging Face transformers for pretrained models
from transformers import (
    AutoTokenizer, AutoModel, AutoConfig,
    T5ForConditionalGeneration, T5Tokenizer,
    GPT2LMHeadModel, GPT2Tokenizer,
    BartForConditionalGeneration, BartTokenizer,
    Trainer, TrainingArguments
)
from torch.utils.data import Dataset, DataLoader

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

@dataclass
class WeeklyMealPlan:
    patient_id: str
    days: List[MealPlan]  # 7 days of meal plans
    weekly_notes: str = ""

class NodeType(Enum):
    FOOD = "food"
    PATIENT = "patient"
    DOSHA = "dosha"
    RASA = "rasa"
    GUNA = "guna"
    CONDITION = "condition"
    CATEGORY = "category"

# Knowledge Graph Foundation
class AyurvedaKnowledgeGraph:
    def __init__(self):
        self.graph = nx.Graph()
        self.node_to_idx = {}
        self.idx_to_node = {}
        self.node_types = {}
        self.node_features = {}
        self.food_names_by_category = {}  # Store food names by category

    def add_food_node(self, food: Food):
        """Add a food item and its relationships to the graph"""
        food_id = f"food_{food.id}"
        self.graph.add_node(food_id)
        self.node_types[food_id] = NodeType.FOOD

        # Store food name for recommendation
        if food.category not in self.food_names_by_category:
            self.food_names_by_category[food.category] = []
        self.food_names_by_category[food.category].append(food.name)

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

        if food.rasa:
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
        categories = ['grains', 'vegetables', 'fruits', 'dairy', 'spices', 'legumes', 'nuts', 'oils']
        encoding = [1.0 if category.lower() == cat else 0.0 for cat in categories]
        if sum(encoding) == 0:  # Unknown category
            encoding.append(1.0)
        else:
            encoding.append(0.0)
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
            node_type = self.node_types.get(node, NodeType.FOOD)

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

# Graph Neural Network for Food Embeddings
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

# Pretrained Transformer Models with Better Generation
class T5MealPlanner(nn.Module):
    """Using T5 for text-to-text meal planning with 7-day support"""

    def __init__(self, model_name: str = "t5-small", graph_embedding_dim: int = 256):
        super().__init__()
        self.tokenizer = T5Tokenizer.from_pretrained(model_name)
        self.model = T5ForConditionalGeneration.from_pretrained(model_name)

        # Add special tokens for Ayurveda concepts
        special_tokens = [
            "<patient>", "</patient>", "<week>", "</week>",
            "<day1>", "</day1>", "<day2>", "</day2>", "<day3>", "</day3>",
            "<day4>", "</day4>", "<day5>", "</day5>", "<day6>", "</day6>", "<day7>", "</day7>",
            "<breakfast>", "</breakfast>", "<lunch>", "</lunch>",
            "<dinner>", "</dinner>", "<snacks>", "</snacks>",
            "<vata>", "<pitta>", "<kapha>",
            "<diabetes>", "<hypertension>", "<obesity>", "<digestion>"
        ]

        self.tokenizer.add_tokens(special_tokens)
        self.model.resize_token_embeddings(len(self.tokenizer))

        # Graph embeddings integration
        self.graph_encoder = GraphNeuralNetwork(32, 128, graph_embedding_dim)
        self.graph_projection = nn.Linear(graph_embedding_dim, self.model.config.d_model)

    def format_patient_input_weekly(self, patient: Patient) -> str:
        """Convert patient data to structured text input for weekly meal plan"""
        input_text = "generate weekly meal plan: "
        input_text += f"patient age {patient.age} gender {patient.gender} "
        input_text += f"bmi {patient.bmi:.1f} lifestyle {patient.lifestyle} "
        input_text += f"prakriti {patient.prakriti} "

        if patient.health_conditions:
            conditions = " ".join(patient.health_conditions)
            input_text += f"conditions {conditions} "

        if patient.allergies:
            input_text += f"allergies {' '.join(patient.allergies)} "

        input_text += "generate 7 days"
        return input_text

    def format_patient_input(self, patient: Patient, day: int) -> str:
        """Convert patient data to structured text input for single day"""
        input_text = "generate meal plan: "
        input_text += f"patient age {patient.age} gender {patient.gender} "
        input_text += f"bmi {patient.bmi:.1f} lifestyle {patient.lifestyle} "
        input_text += f"prakriti {patient.prakriti} "

        if patient.health_conditions:
            conditions = " ".join(patient.health_conditions)
            input_text += f"conditions {conditions} "

        if patient.allergies:
            input_text += f"allergies {' '.join(patient.allergies)} "

        input_text += f"day {day}"
        return input_text

    def format_weekly_meal_plan_output(self, weekly_plan: WeeklyMealPlan) -> str:
        """Convert weekly meal plan to structured text output"""
        output_text = ""
        for i, day_plan in enumerate(weekly_plan.days, 1):
            output_text += f"day{i}: "
            if day_plan.breakfast:
                output_text += f"breakfast: {', '.join(day_plan.breakfast)} "
            if day_plan.lunch:
                output_text += f"lunch: {', '.join(day_plan.lunch)} "
            if day_plan.dinner:
                output_text += f"dinner: {', '.join(day_plan.dinner)} "
            if day_plan.snacks:
                output_text += f"snacks: {', '.join(day_plan.snacks)} "
            output_text += " | "
        return output_text.strip(" | ")

    def format_meal_plan_output(self, meal_plan: MealPlan) -> str:
        """Convert meal plan to structured text output"""
        output_text = ""
        if meal_plan.breakfast:
            output_text += "breakfast: " + ", ".join(meal_plan.breakfast) + " "
        if meal_plan.lunch:
            output_text += "lunch: " + ", ".join(meal_plan.lunch) + " "
        if meal_plan.dinner:
            output_text += "dinner: " + ", ".join(meal_plan.dinner) + " "
        if meal_plan.snacks:
            output_text += "snacks: " + ", ".join(meal_plan.snacks)
        return output_text.strip()

# Main Hybrid Neural Engine
class HybridNeuralEngine:
    def __init__(self, model_type: str = "t5", model_name: str = None, models_dir: str = "./models"):
        self.model_type = model_type
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(exist_ok=True)
        self.knowledge_graph = AyurvedaKnowledgeGraph()

        # Use smaller models for faster inference
        if model_type == "t5":
            model_name = model_name or "t5-small"
            self.planner = T5MealPlanner(model_name)
            self.tokenizer = self.planner.tokenizer
        else:
            raise ValueError(f"Currently only T5 is fully implemented. Got: {model_type}")

        # Determine device
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.planner.model.to(self.device)
        print(f"Using device: {self.device}")

    def save_model(self, output_dir: str = None):
        """Save the fine-tuned model and tokenizer"""
        if output_dir is None:
            output_dir = self.models_dir / "ayurveda_meal_planner"
        
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save model and tokenizer
        self.planner.model.save_pretrained(output_dir)
        self.tokenizer.save_pretrained(output_dir)
        
        # Save knowledge graph
        import pickle
        with open(output_dir / "knowledge_graph.pkl", "wb") as f:
            pickle.dump(self.knowledge_graph, f)
        
        print(f"✓ Model saved to {output_dir}")
        return str(output_dir)

    def load_model(self, model_dir: str):
        """Load a pre-trained model and tokenizer"""
        model_dir = Path(model_dir)
        
        if not model_dir.exists():
            raise FileNotFoundError(f"Model directory not found: {model_dir}")
        
        # Load model and tokenizer
        self.planner.model = T5ForConditionalGeneration.from_pretrained(model_dir)
        self.tokenizer = T5Tokenizer.from_pretrained(model_dir)
        self.planner.tokenizer = self.tokenizer
        self.planner.model.to(self.device)
        
        # Load knowledge graph if exists
        kg_path = model_dir / "knowledge_graph.pkl"
        if kg_path.exists():
            import pickle
            with open(kg_path, "rb") as f:
                self.knowledge_graph = pickle.load(f)
        
        print(f"✓ Model loaded from {model_dir}")

    def build_knowledge_graph(self, foods: List[Food], patients: List[Patient]):
        """Build the knowledge graph from data"""
        print(f"Building knowledge graph with {len(foods)} foods and {len(patients)} patients...")
        for food in foods:
            self.knowledge_graph.add_food_node(food)
        for patient in patients:
            self.knowledge_graph.add_patient_node(patient)
        graph_data = self.knowledge_graph.to_pytorch_geometric()
        return graph_data.to(self.device)

    def get_food_recommendations(self, patient: Patient) -> Dict[str, List[str]]:
        """Get food recommendations based on patient profile and knowledge graph"""
        recommendations = {
            'breakfast': [],
            'lunch': [],
            'dinner': [],
            'snacks': []
        }

        # Use knowledge graph to get suitable foods
        breakfast_categories = ['grains', 'fruits', 'dairy', 'nuts']
        lunch_dinner_categories = ['grains', 'vegetables', 'legumes', 'dairy']
        snack_categories = ['fruits', 'nuts', 'dairy']

        # Get foods from each category
        for cat in breakfast_categories:
            if cat in self.knowledge_graph.food_names_by_category:
                foods = self.knowledge_graph.food_names_by_category[cat]
                recommendations['breakfast'].extend(foods[:2])

        for cat in lunch_dinner_categories:
            if cat in self.knowledge_graph.food_names_by_category:
                foods = self.knowledge_graph.food_names_by_category[cat]
                recommendations['lunch'].extend(foods[:2])
                recommendations['dinner'].extend(foods[2:4] if len(foods) > 2 else foods[:2])

        for cat in snack_categories:
            if cat in self.knowledge_graph.food_names_by_category:
                foods = self.knowledge_graph.food_names_by_category[cat]
                recommendations['snacks'].extend(foods[:1])

        # Limit recommendations
        recommendations['breakfast'] = recommendations['breakfast'][:4]
        recommendations['lunch'] = recommendations['lunch'][:5]
        recommendations['dinner'] = recommendations['dinner'][:5]
        recommendations['snacks'] = recommendations['snacks'][:2]

        return recommendations

    def generate_weekly_meal_plan(self, patient: Patient,
                                 graph_data: Data = None,
                                 max_length: int = 512,
                                 temperature: float = 0.9,
                                 use_knowledge_graph: bool = True) -> WeeklyMealPlan:
        """Generate a 7-day meal plan for a patient"""
        
        # Ensure graph_data is on the correct device
        if graph_data is not None and graph_data.x.device != self.device:
            graph_data = graph_data.to(self.device)

        if use_knowledge_graph and not self.knowledge_graph.food_names_by_category:
            print("⚠ No foods in knowledge graph, using default recommendations")
            return self._generate_default_weekly_plan(patient)

        # Format input for weekly plan
        input_text = self.planner.format_patient_input_weekly(patient)

        # Tokenize and move to device
        inputs = self.tokenizer(
            input_text,
            return_tensors="pt",
            max_length=512,
            truncation=True
        ).to(self.device)

        # Generate
        with torch.no_grad():
            outputs = self.planner.model.generate(
                **inputs,
                max_length=max_length,
                min_length=50,
                temperature=temperature,
                do_sample=True,
                top_k=50,
                top_p=0.95,
                num_beams=3,
                early_stopping=True,
                pad_token_id=self.tokenizer.pad_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
            )

        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Parse the generated text into a weekly plan
        weekly_plan = self.parse_generated_weekly_plan(generated_text, patient.id)

        # If generation fails, use knowledge graph recommendations
        if not self._has_valid_weekly_content(weekly_plan) and use_knowledge_graph:
            weekly_plan = self._generate_default_weekly_plan(patient)

        return weekly_plan

    def generate_meal_plan(self, patient: Patient, day: int,
                          graph_data: Data = None,
                          max_length: int = 256,
                          temperature: float = 0.9,
                          use_knowledge_graph: bool = True) -> str:
        """Generate meal plan for a single day"""

        # Ensure graph_data is on the correct device
        if graph_data is not None and graph_data.x.device != self.device:
            graph_data = graph_data.to(self.device)

        if use_knowledge_graph and not self.knowledge_graph.food_names_by_category:
            print("⚠ No foods in knowledge graph, using default recommendations")
            return self._generate_default_plan(patient, day)

        # Format input
        input_text = self.planner.format_patient_input(patient, day)

        # Tokenize and move to device
        inputs = self.tokenizer(
            input_text,
            return_tensors="pt",
            max_length=512,
            truncation=True
        ).to(self.device)

        # Generate
        with torch.no_grad():
            outputs = self.planner.model.generate(
                **inputs,
                max_length=max_length,
                min_length=20,
                temperature=temperature,
                do_sample=True,
                top_k=50,
                top_p=0.95,
                num_beams=3,
                early_stopping=True,
                pad_token_id=self.tokenizer.pad_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
            )

        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # If generation fails, use knowledge graph recommendations
        if not self._has_valid_content(generated_text) and use_knowledge_graph:
            recommendations = self.get_food_recommendations(patient)
            generated_text = self._format_recommendations(recommendations)

        return generated_text

    def _generate_default_weekly_plan(self, patient: Patient) -> WeeklyMealPlan:
        """Generate a default 7-day meal plan based on patient profile"""
        weekly_plans = []
        
        for day in range(1, 8):
            # Vary the plan across days
            default_plan = self._generate_default_plan(patient, day)
            parsed_plan = self.parse_generated_plan(default_plan)
            
            meal_plan = MealPlan(
                patient_id=patient.id,
                day=day,
                breakfast=parsed_plan['breakfast'],
                lunch=parsed_plan['lunch'],
                dinner=parsed_plan['dinner'],
                snacks=parsed_plan['snacks'],
                restrictions=[],
                doctor_notes=f"Day {day} - tailored for {patient.prakriti} constitution"
            )
            weekly_plans.append(meal_plan)
        
        return WeeklyMealPlan(
            patient_id=patient.id,
            days=weekly_plans,
            weekly_notes=f"7-day meal plan for {patient.prakriti} constitution"
        )

    def _generate_default_plan(self, patient: Patient, day: int) -> str:
        """Generate a default meal plan based on patient profile"""
        # Vary meals based on day and prakriti
        base_foods = {
            'vata': {
                'breakfast': ['oatmeal', 'warm milk', 'almonds', 'dates', 'honey'],
                'lunch': ['rice', 'moong dal', 'ghee', 'cooked vegetables', 'yogurt'],
                'dinner': ['khichdi', 'soup', 'bread', 'cooked spinach', 'warm tea'],
                'snacks': ['banana', 'soaked almonds', 'warm beverages']
            },
            'pitta': {
                'breakfast': ['coconut water', 'sweet fruits', 'milk', 'cereal', 'cooling foods'],
                'lunch': ['basmati rice', 'green vegetables', 'cucumber', 'yogurt', 'salad'],
                'dinner': ['quinoa', 'salad', 'sweet potato', 'green beans', 'herbal tea'],
                'snacks': ['watermelon', 'coconut', 'cooling drinks']
            },
            'kapha': {
                'breakfast': ['honey water', 'light breakfast', 'berries', 'green tea', 'spices'],
                'lunch': ['millet', 'bitter vegetables', 'spices', 'legumes', 'warm water'],
                'dinner': ['barley soup', 'steamed vegetables', 'ginger tea', 'light foods'],
                'snacks': ['apple', 'pear', 'warm beverages']
            }
        }

        # Select based on prakriti and add day variation
        prakriti = patient.prakriti.lower()
        foods = base_foods.get(prakriti, base_foods['vata'])
        
        # Add variety based on day
        day_variation = (day - 1) % 3
        
        selected_foods = {
            'breakfast': foods['breakfast'][day_variation:day_variation+3],
            'lunch': foods['lunch'][day_variation:day_variation+3],
            'dinner': foods['dinner'][day_variation:day_variation+3],
            'snacks': foods['snacks'][day_variation:day_variation+2]
        }

        return self._format_recommendations(selected_foods)

    def _format_recommendations(self, recommendations: Dict[str, List[str]]) -> str:
        """Format recommendations into text"""
        text = ""
        if recommendations.get('breakfast'):
            text += f"breakfast: {', '.join(recommendations['breakfast'])} "
        if recommendations.get('lunch'):
            text += f"lunch: {', '.join(recommendations['lunch'])} "
        if recommendations.get('dinner'):
            text += f"dinner: {', '.join(recommendations['dinner'])} "
        if recommendations.get('snacks'):
            text += f"snacks: {', '.join(recommendations['snacks'])}"
        return text.strip()

    def _has_valid_content(self, text: str) -> bool:
        """Check if generated text has valid meal content"""
        return any(meal in text.lower() for meal in ['breakfast', 'lunch', 'dinner', 'snacks'])

    def _has_valid_weekly_content(self, weekly_plan: WeeklyMealPlan) -> bool:
        """Check if weekly plan has valid content"""
        return len(weekly_plan.days) == 7 and all(
            len(day.breakfast) > 0 or len(day.lunch) > 0 or len(day.dinner) > 0 
            for day in weekly_plan.days
        )

    def parse_generated_weekly_plan(self, generated_text: str, patient_id: str) -> WeeklyMealPlan:
        """Parse the generated text into a structured weekly meal plan"""
        weekly_plans = []
        text = generated_text.lower()
        
        # Try to parse day by day
        for day_num in range(1, 8):
            day_plan = MealPlan(
                patient_id=patient_id,
                day=day_num,
                breakfast=[],
                lunch=[],
                dinner=[],
                snacks=[],
                restrictions=[],
                doctor_notes=""
            )
            
            # Look for day-specific content
            day_pattern = f"day{day_num}:"
            if day_pattern in text:
                # Find the section for this day
                start = text.index(day_pattern) + len(day_pattern)
                end = len(text)
                
                # Find the next day or end
                for next_day in range(day_num + 1, 8):
                    next_pattern = f"day{next_day}:"
                    if next_pattern in text[start:]:
                        next_pos = text.index(next_pattern, start)
                        if next_pos < end:
                            end = next_pos
                
                day_section = text[start:end]
                day_plan = self._parse_day_section(day_section, patient_id, day_num)
            else:
                # If no day-specific content, generate default for this day
                default_plan_text = self._generate_default_plan_for_day(day_num)
                parsed_plan = self.parse_generated_plan(default_plan_text)
                day_plan.breakfast = parsed_plan['breakfast']
                day_plan.lunch = parsed_plan['lunch']
                day_plan.dinner = parsed_plan['dinner']
                day_plan.snacks = parsed_plan['snacks']
            
            weekly_plans.append(day_plan)
        
        return WeeklyMealPlan(
            patient_id=patient_id,
            days=weekly_plans,
            weekly_notes="Generated 7-day meal plan"
        )

    def _parse_day_section(self, day_section: str, patient_id: str, day_num: int) -> MealPlan:
        """Parse a single day section from generated text"""
        plan = self.parse_generated_plan(day_section)
        return MealPlan(
            patient_id=patient_id,
            day=day_num,
            breakfast=plan['breakfast'],
            lunch=plan['lunch'],
            dinner=plan['dinner'],
            snacks=plan['snacks'],
            restrictions=[],
            doctor_notes=f"Day {day_num} plan"
        )

    def _generate_default_plan_for_day(self, day_num: int) -> str:
        """Generate a simple default plan for a specific day"""
        base_foods = {
            'breakfast': ['oatmeal', 'fruits', 'milk', 'nuts'],
            'lunch': ['rice', 'dal', 'vegetables', 'yogurt'],
            'dinner': ['soup', 'bread', 'salad'],
            'snacks': ['fruits', 'nuts']
        }
        
        # Add slight variation based on day
        variation = (day_num - 1) % 3
        
        selected = {
            'breakfast': base_foods['breakfast'][variation:variation+2],
            'lunch': base_foods['lunch'][variation:variation+3],
            'dinner': base_foods['dinner'][variation:variation+2],
            'snacks': base_foods['snacks'][variation:variation+1]
        }
        
        return self._format_recommendations(selected)

    def parse_generated_plan(self, generated_text: str) -> Dict[str, List[str]]:
        """Parse the generated text into structured meal plan"""
        plan = {
            'breakfast': [],
            'lunch': [],
            'dinner': [],
            'snacks': []
        }

        text = generated_text.lower()

        # Strategy 1: Look for meal keywords followed by colon
        for meal_type in ['breakfast', 'lunch', 'dinner', 'snacks']:
            if f'{meal_type}:' in text:
                start = text.index(f'{meal_type}:') + len(f'{meal_type}:')
                end = len(text)
                for next_meal in ['breakfast', 'lunch', 'dinner', 'snacks']:
                    if next_meal != meal_type and f'{next_meal}:' in text[start:]:
                        next_pos = text.index(f'{next_meal}:', start)
                        if next_pos < end:
                            end = next_pos

                section = text[start:end].strip()
                section = section.replace('</', ' ').replace('<', ' ')
                items = [item.strip() for item in section.split(',')]
                cleaned_items = []
                for item in items:
                    item = ' '.join(item.split())
                    item = item.rstrip('.,;')
                    if item and len(item) > 1 and not item.startswith('/'):
                        cleaned_items.append(item)

                plan[meal_type] = cleaned_items[:5]

        # If no meals found, use default plan
        if not any(plan.values()):
            plan = {
                'breakfast': ['oatmeal', 'fruits', 'milk'],
                'lunch': ['rice', 'dal', 'vegetables', 'yogurt'],
                'dinner': ['chapati', 'vegetables', 'soup'],
                'snacks': ['nuts', 'fruits']
            }

        return plan