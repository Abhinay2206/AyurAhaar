import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import json
from pathlib import Path
import os
import warnings
warnings.filterwarnings('ignore')

from transformers import (
    Trainer, TrainingArguments, EvalPrediction
)
from torch.utils.data import Dataset, DataLoader
from huggingface_hub import login as hf_login

from model import (
    Food, Patient, MealPlan, WeeklyMealPlan,
    HybridNeuralEngine, AyurvedaKnowledgeGraph
)

# Dataset class for training
class AyurvedaMealPlanDataset(Dataset):
    def __init__(self, patients: List[Patient], meal_plans: List[MealPlan],
                 tokenizer, max_length: int = 512, model_type: str = "t5", 
                 weekly_mode: bool = False):
        self.patients = {p.id: p for p in patients}
        self.meal_plans = meal_plans
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.model_type = model_type
        self.weekly_mode = weekly_mode
        
        if weekly_mode:
            # Group meal plans by patient for weekly training
            self.weekly_plans = self._group_by_patient()
        else:
            # Use individual meal plans
            self.weekly_plans = None

    def _group_by_patient(self) -> List[WeeklyMealPlan]:
        """Group individual meal plans into weekly plans"""
        patient_plans = {}
        
        for plan in self.meal_plans:
            if plan.patient_id not in patient_plans:
                patient_plans[plan.patient_id] = []
            patient_plans[plan.patient_id].append(plan)
        
        weekly_plans = []
        for patient_id, plans in patient_plans.items():
            # Sort by day
            plans.sort(key=lambda x: x.day)
            
            # Take up to 7 days
            if len(plans) >= 7:
                weekly_plan = WeeklyMealPlan(
                    patient_id=patient_id,
                    days=plans[:7],
                    weekly_notes="Training data"
                )
                weekly_plans.append(weekly_plan)
        
        return weekly_plans

    def __len__(self):
        if self.weekly_mode:
            return len(self.weekly_plans) if self.weekly_plans else 0
        else:
            return len(self.meal_plans)

    def __getitem__(self, idx):
        if self.weekly_mode:
            return self._get_weekly_item(idx)
        else:
            return self._get_daily_item(idx)

    def _get_weekly_item(self, idx):
        """Get a weekly meal plan training item"""
        if not self.weekly_plans:
            raise IndexError("No weekly plans available")
        
        weekly_plan = self.weekly_plans[idx]
        patient = self.patients.get(weekly_plan.patient_id)

        if not patient:
            # Create a dummy patient if not found
            patient = Patient(
                id=weekly_plan.patient_id,
                age=30, gender="unknown", weight=70, height=170, bmi=24,
                lifestyle="moderate", prakriti="vata",
                health_conditions=[], allergies=[], preferred_cuisine=[]
            )

        # Format input for weekly plan
        input_text = f"generate weekly meal plan: age {patient.age} {patient.gender} "
        input_text += f"bmi {patient.bmi:.1f} {patient.prakriti} generate 7 days"

        # Format output for weekly plan with better structure
        target_text = ""
        for i, day_plan in enumerate(weekly_plan.days, 1):
            target_text += f"day{i}: "
            
            # Ensure each meal type has content
            breakfast_items = day_plan.breakfast if day_plan.breakfast else ["oatmeal", "fruits"]
            lunch_items = day_plan.lunch if day_plan.lunch else ["rice", "dal", "vegetables"]
            dinner_items = day_plan.dinner if day_plan.dinner else ["chapati", "curry"]
            snack_items = day_plan.snacks if day_plan.snacks else ["fruits"]
            
            target_text += f"breakfast: {', '.join(breakfast_items[:3])} | "
            target_text += f"lunch: {', '.join(lunch_items[:3])} | "
            target_text += f"dinner: {', '.join(dinner_items[:3])} | "
            target_text += f"snacks: {', '.join(snack_items[:2])} | "
        
        target_text = target_text.strip(" | ")

        return self._tokenize_pair(input_text, target_text)

    def _get_daily_item(self, idx):
        """Get a single day meal plan training item"""
        meal_plan = self.meal_plans[idx]
        patient = self.patients.get(meal_plan.patient_id)

        if not patient:
            # Create a dummy patient if not found
            patient = Patient(
                id=meal_plan.patient_id,
                age=30, gender="unknown", weight=70, height=170, bmi=24,
                lifestyle="moderate", prakriti="vata",
                health_conditions=[], allergies=[], preferred_cuisine=[]
            )

        # Simplified format for better training
        input_text = f"generate meal plan: age {patient.age} {patient.gender} "
        input_text += f"bmi {patient.bmi:.1f} {patient.prakriti} day {meal_plan.day}"

        # Improved output format with consistent structure
        breakfast_items = meal_plan.breakfast if meal_plan.breakfast else ["oatmeal", "fruits"]
        lunch_items = meal_plan.lunch if meal_plan.lunch else ["rice", "dal", "vegetables"]
        dinner_items = meal_plan.dinner if meal_plan.dinner else ["chapati", "curry"]
        snack_items = meal_plan.snacks if meal_plan.snacks else ["fruits"]
        
        target_text = f"breakfast: {', '.join(breakfast_items[:3])} | "
        target_text += f"lunch: {', '.join(lunch_items[:3])} | "
        target_text += f"dinner: {', '.join(dinner_items[:3])} | "
        target_text += f"snacks: {', '.join(snack_items[:2])}"

        return self._tokenize_pair(input_text, target_text)

    def _tokenize_pair(self, input_text: str, target_text: str):
        """Tokenize input and target text pair"""
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

        # Replace padding token id with -100 for loss calculation
        targets['input_ids'][targets['input_ids'] == self.tokenizer.pad_token_id] = -100

        return {
            'input_ids': inputs['input_ids'].squeeze(),
            'attention_mask': inputs['attention_mask'].squeeze(),
            'labels': targets['input_ids'].squeeze()
        }

# Data loading utilities
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

def _parse_dict(val) -> Dict[str, str]:
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return {}
    if isinstance(val, dict):
        return {str(k): str(v) for k, v in val.items()}
    s = str(val).strip()
    if not s:
        return {}
    # try json
    try:
        parsed = json.loads(s)
        if isinstance(parsed, dict):
            return {str(k): str(v) for k, v in parsed.items()}
    except Exception:
        pass
    # fallback: key:value pairs
    pairs = s.split('|') if '|' in s else s.split(',')
    out = {}
    for p in pairs:
        if ':' in p:
            k, v = p.split(':', 1)
            out[k.strip()] = v.strip()
    return out

def load_foods_csv(path: str) -> List[Food]:
    """Load foods from CSV file"""
    df = pd.read_csv(path)
    foods = []
    for idx, row in df.iterrows():
        foods.append(
            Food(
                id=str(row.get('id', row.get('food_id', idx))),
                name=str(row.get('name', row.get('food_name', 'Unknown'))),
                category=str(row.get('category', 'unknown')),
                calories=_parse_float(row.get('calories', 0)),
                protein=_parse_float(row.get('protein', 0)),
                carbs=_parse_float(row.get('carbs', row.get('carbohydrates', 0))),
                fats=_parse_float(row.get('fats', row.get('fat', 0))),
                fiber=_parse_float(row.get('fiber', 0)),
                vitamins=_parse_dict(row.get('vitamins', {})),
                minerals=_parse_dict(row.get('minerals', {})),
                dosha_effects=_parse_dict(row.get('dosha_effects', {})),
                rasa=str(row.get('rasa', 'sweet')),
                guna=_split_list(row.get('guna', row.get('qualities', ''))),
                virya=str(row.get('virya', 'neutral')),
                vipaka=str(row.get('vipaka', 'sweet')),
                health_tags=_split_list(row.get('health_tags', row.get('tags', ''))),
                contraindications=_split_list(row.get('contraindications', '')),
            )
        )
    return foods

def load_patients_csv(path: str) -> List[Patient]:
    """Load patients from CSV file"""
    df = pd.read_csv(path)
    patients = []
    for idx, row in df.iterrows():
        height = _parse_float(row.get('height', 170))
        weight = _parse_float(row.get('weight', 70))
        bmi = _parse_float(row.get('bmi', 0))
        if not bmi and height and weight:
            try:
                h_m = height / 100.0 if height > 3 else height
                bmi = weight / (h_m * h_m) if h_m else 24.0
            except Exception:
                bmi = 24.0
        patients.append(
            Patient(
                id=str(row.get('id', row.get('patient_id', idx))),
                age=int(_parse_float(row.get('age', 30))),
                gender=str(row.get('gender', 'unknown')),
                weight=weight,
                height=height,
                bmi=bmi,
                lifestyle=str(row.get('lifestyle', 'moderate')),
                prakriti=str(row.get('prakriti', row.get('constitution', 'vata'))),
                health_conditions=_split_list(row.get('health_conditions', row.get('conditions', ''))),
                allergies=_split_list(row.get('allergies', '')),
                preferred_cuisine=_split_list(row.get('preferred_cuisine', row.get('cuisine', ''))),
            )
        )
    return patients

def load_doctor_plans_csv(path: str) -> List[MealPlan]:
    """Load meal plans from CSV file"""
    df = pd.read_csv(path)
    plans = []
    for idx, row in df.iterrows():
        plans.append(
            MealPlan(
                patient_id=str(row.get('patient_id', row.get('id', idx))),
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

def create_sample_data(foods_path: str, patients_path: str, plans_path: str):
    """Create sample CSV files if they don't exist"""

    # Create directories if needed
    for path in [foods_path, patients_path, plans_path]:
        Path(path).parent.mkdir(parents=True, exist_ok=True)

    # Sample foods data
    foods_data = {
        'id': ['F001', 'F002', 'F003', 'F004', 'F005', 'F006', 'F007', 'F008'],
        'name': ['Rice', 'Moong Dal', 'Ghee', 'Turmeric Milk', 'Almonds', 'Quinoa', 'Sweet Potato', 'Green Tea'],
        'category': ['grains', 'legumes', 'oils', 'dairy', 'nuts', 'grains', 'vegetables', 'beverages'],
        'calories': [130, 347, 900, 80, 579, 368, 86, 2],
        'protein': [2.7, 24, 0, 3.5, 21, 14, 2, 0],
        'carbs': [28, 63, 0, 12, 22, 64, 20, 0],
        'fats': [0.3, 1.2, 100, 3, 50, 6, 0.1, 0],
        'fiber': [0.4, 16, 0, 0, 12, 7, 3, 0],
        'rasa': ['sweet', 'sweet', 'sweet', 'sweet', 'sweet', 'sweet', 'sweet', 'bitter'],
        'virya': ['cooling', 'cooling', 'cooling', 'heating', 'heating', 'cooling', 'cooling', 'cooling'],
        'vipaka': ['sweet', 'sweet', 'sweet', 'sweet', 'sweet', 'sweet', 'sweet', 'pungent'],
        'dosha_effects': ['vata:-,pitta:-,kapha:+', 'vata:-,pitta:-,kapha:-',
                         'vata:-,pitta:-,kapha:+', 'vata:-,pitta:-,kapha:-',
                         'vata:-,pitta:+,kapha:+', 'vata:0,pitta:-,kapha:-',
                         'vata:-,pitta:-,kapha:-', 'vata:0,pitta:-,kapha:-'],
        'health_tags': ['digestion', 'protein|digestion', 'immunity', 'sleep|immunity', 
                       'brain|heart', 'digestion|energy', 'diabetes|immunity', 'weight_loss|antioxidant'],
        'guna': ['light|soft', 'light|dry', 'heavy|oily', 'light|oily', 
                'heavy|oily', 'light|dry', 'light|sweet', 'light|bitter']
    }

    # Sample patients data
    patients_data = {
        'id': ['P001', 'P002', 'P003', 'P004', 'P005'],
        'age': [35, 28, 45, 32, 38],
        'gender': ['male', 'female', 'male', 'female', 'male'],
        'weight': [70, 60, 80, 65, 75],
        'height': [175, 165, 180, 160, 170],
        'bmi': [22.9, 22.0, 24.7, 25.4, 25.9],
        'lifestyle': ['moderate', 'active', 'sedentary', 'active', 'moderate'],
        'prakriti': ['vata', 'pitta', 'kapha', 'vata-pitta', 'pitta-kapha'],
        'health_conditions': ['', 'acidity', 'diabetes|obesity', 'anxiety', 'hypertension'],
        'allergies': ['', 'nuts', '', 'dairy', 'gluten'],
        'preferred_cuisine': ['indian', 'indian', 'indian', 'continental', 'mixed']
    }

    # Expanded meal plans data for better training
    plans_data = {
        'patient_id': ['P001'] * 7 + ['P002'] * 7 + ['P003'] * 7 + ['P004'] * 7 + ['P005'] * 7,
        'day': list(range(1, 8)) * 5,
        'breakfast': [
            # P001 - Vata
            'Rice porridge|Almonds|Warm milk', 'Oatmeal|Dates|Ghee', 'Quinoa porridge|Nuts|Honey',
            'Rice|Milk|Sweet fruits', 'Warm cereal|Almonds|Ghee', 'Sweet breakfast|Nuts|Milk',
            'Rice pudding|Dates|Warm milk',
            # P002 - Pitta
            'Fruit salad|Yogurt|Coconut', 'Cereal|Coconut water|Sweet fruits', 'Quinoa|Cool milk|Berries',
            'Oats|Yogurt|Cooling foods', 'Sweet fruits|Milk|Coconut', 'Cool breakfast|Yogurt|Fruits',
            'Coconut rice|Sweet fruits|Cool milk',
            # P003 - Kapha
            'Green tea|Apple|Light breakfast', 'Herbal tea|Berries|Honey water', 'Millet|Ginger tea|Light foods',
            'Warm tea|Pear|Spices', 'Light breakfast|Green tea|Berries', 'Honey water|Apple|Warming spices',
            'Barley|Ginger tea|Light fruits',
            # P004 - Vata-Pitta
            'Oatmeal|Sweet fruits|Milk', 'Rice|Coconut|Almonds', 'Quinoa|Cool milk|Dates',
            'Sweet breakfast|Coconut water|Nuts', 'Rice porridge|Sweet fruits|Milk', 'Oats|Coconut|Almonds',
            'Sweet quinoa|Cool milk|Honey',
            # P005 - Pitta-Kapha
            'Green tea|Sweet fruits|Light breakfast', 'Quinoa|Coconut water|Berries', 'Millet|Cool milk|Fruits',
            'Light oats|Coconut|Herbal tea', 'Sweet breakfast|Green tea|Fruits', 'Barley|Cool milk|Berries',
            'Light quinoa|Coconut water|Sweet fruits'
        ],
        'lunch': [
            # P001 - Vata
            'Rice|Moong dal|Ghee|Cooked vegetables', 'Khichdi|Yogurt|Warm salad|Ghee', 
            'Rice|Dal|Steamed vegetables|Ghee', 'Quinoa|Lentils|Cooked vegetables|Oil',
            'Rice|Moong dal|Ghee|Warm vegetables', 'Khichdi|Dal|Cooked greens|Ghee',
            'Rice|Lentil curry|Ghee|Steamed vegetables',
            # P002 - Pitta
            'Quinoa|Green vegetables|Cucumber|Yogurt', 'Rice|Dal|Cool salad|Coconut',
            'Barley|Green vegetables|Yogurt|Cooling foods', 'Quinoa|Lentils|Cucumber|Cool herbs',
            'Rice|Green dal|Cool vegetables|Yogurt', 'Barley|Green vegetables|Coconut|Cool salad',
            'Quinoa|Green lentils|Cucumber|Cooling herbs',
            # P003 - Kapha
            'Millet|Bitter vegetables|Spiced buttermilk|Warming spices', 'Barley|Mixed vegetables|Ginger|Spices',
            'Quinoa|Bitter greens|Spiced water|Warming herbs', 'Millet|Spicy vegetables|Ginger tea|Spices',
            'Barley|Bitter vegetables|Warming spices|Light dal', 'Quinoa|Spicy greens|Ginger|Warming herbs',
            'Millet|Mixed vegetables|Spiced buttermilk|Warming spices',
            # P004 - Vata-Pitta
            'Rice|Green dal|Ghee|Cool vegetables', 'Quinoa|Moong dal|Coconut|Mild vegetables',
            'Rice|Lentils|Cool salad|Ghee', 'Quinoa|Green dal|Coconut|Cooling vegetables',
            'Rice|Moong dal|Cool herbs|Ghee', 'Quinoa|Lentils|Coconut|Mild greens',
            'Rice|Green dal|Cool vegetables|Ghee',
            # P005 - Pitta-Kapha
            'Quinoa|Green vegetables|Light spices|Coconut', 'Barley|Mixed vegetables|Mild spices|Cool herbs',
            'Millet|Green vegetables|Light spices|Coconut water', 'Quinoa|Bitter vegetables|Mild spices|Cool water',
            'Barley|Green vegetables|Light spices|Coconut', 'Quinoa|Mixed vegetables|Mild spices|Cool herbs',
            'Millet|Green vegetables|Light spices|Coconut water'
        ],
        'dinner': [
            # P001 - Vata
            'Soup|Bread|Cooked vegetables|Warm tea', 'Rice|Dal|Spinach|Ghee', 
            'Khichdi|Soup|Cooked greens|Warm water', 'Rice|Lentil soup|Cooked vegetables|Herbal tea',
            'Soup|Quinoa|Steamed vegetables|Warm beverages', 'Rice|Dal|Cooked spinach|Ghee',
            'Warm soup|Bread|Cooked vegetables|Herbal tea',
            # P002 - Pitta
            'Sweet potato|Green beans|Cool salad|Herbal tea', 'Pasta|Cool vegetables|Coconut|Cool water',
            'Quinoa|Green vegetables|Cool herbs|Coconut water', 'Rice|Cool vegetables|Coconut|Herbal tea',
            'Sweet potato|Green beans|Cool salad|Cool water', 'Quinoa|Cool vegetables|Coconut|Herbal tea',
            'Rice|Green vegetables|Cool herbs|Coconut water',
            # P003 - Kapha
            'Vegetable soup|Brown rice|Warming spices|Ginger tea', 'Clear soup|Steamed vegetables|Spices|Warm water',
            'Light soup|Quinoa|Warming herbs|Ginger tea', 'Vegetable broth|Barley|Spices|Warm beverages',
            'Clear soup|Mixed vegetables|Warming spices|Ginger tea', 'Light broth|Quinoa|Warming herbs|Warm water',
            'Vegetable soup|Barley|Warming spices|Ginger tea',
            # P004 - Vata-Pitta
            'Soup|Rice|Cool vegetables|Herbal tea', 'Quinoa|Cool soup|Mild vegetables|Cool water',
            'Rice|Light soup|Cool greens|Herbal tea', 'Quinoa|Vegetable soup|Cool herbs|Cool water',
            'Rice|Light soup|Cool vegetables|Herbal tea', 'Quinoa|Cool soup|Mild greens|Cool water',
            'Rice|Light soup|Cool vegetables|Herbal tea',
            # P005 - Pitta-Kapha
            'Light soup|Quinoa|Mild spices|Cool water', 'Vegetable soup|Barley|Light spices|Herbal tea',
            'Clear soup|Mixed vegetables|Mild spices|Cool water', 'Light broth|Quinoa|Gentle spices|Herbal tea',
            'Vegetable soup|Barley|Light spices|Cool water', 'Clear soup|Mixed vegetables|Mild spices|Herbal tea',
            'Light soup|Quinoa|Gentle spices|Cool water'
        ],
        'snacks': [
            # P001 - Vata
            'Banana|Soaked almonds|Warm beverages', 'Dates|Warm milk|Nuts', 'Sweet fruits|Almonds|Warm tea',
            'Banana|Nuts|Warm water', 'Dates|Soaked almonds|Herbal tea', 'Sweet fruits|Nuts|Warm beverages',
            'Banana|Almonds|Warm milk',
            # P002 - Pitta
            'Watermelon|Coconut water|Cool drinks', 'Apple|Herbal tea|Cool water', 'Sweet fruits|Coconut|Cool beverages',
            'Watermelon|Cool water|Coconut', 'Apple|Coconut water|Cool drinks', 'Sweet fruits|Cool beverages|Coconut',
            'Watermelon|Coconut water|Cool herbal tea',
            # P003 - Kapha
            'Pear|Green tea|Warm beverages', 'Apple|Ginger tea|Warming drinks', 'Light fruits|Green tea|Warm water',
            'Pear|Warming tea|Ginger', 'Apple|Green tea|Warm beverages', 'Light fruits|Ginger tea|Warm water',
            'Pear|Warming beverages|Green tea',
            # P004 - Vata-Pitta
            'Sweet fruits|Cool beverages|Almonds', 'Apple|Cool water|Nuts', 'Sweet fruits|Coconut water|Almonds',
            'Apple|Cool beverages|Nuts', 'Sweet fruits|Cool water|Almonds', 'Apple|Coconut water|Nuts',
            'Sweet fruits|Cool beverages|Almonds',
            # P005 - Pitta-Kapha
            'Apple|Green tea|Light snacks', 'Pear|Cool water|Light fruits', 'Apple|Herbal tea|Light snacks',
            'Pear|Green tea|Light fruits', 'Apple|Cool beverages|Light snacks', 'Pear|Herbal tea|Light fruits',
            'Apple|Green tea|Light snacks'
        ],
        'restrictions': [''] * 35,  # No restrictions for simplicity
        'doctor_notes': [
            'Increase warm foods', 'Focus on grounding foods', 'Maintain warmth', 'Nourishing foods', 'Calming diet', 'Warm preparations', 'Grounding meals',
            'Cooling foods recommended', 'Avoid heating foods', 'Keep cool', 'Soothing foods', 'Cool preparations', 'Calming coolness', 'Refreshing meals',
            'Light foods, avoid heavy meals', 'Increase metabolism', 'Stimulating foods', 'Light diet', 'Energizing foods', 'Warming metabolism', 'Light and warm',
            'Balance warm and cool', 'Mild preparations', 'Gentle foods', 'Balanced nutrition', 'Moderate approach', 'Gentle balance', 'Harmonious diet',
            'Light but nourishing', 'Balanced approach', 'Gentle metabolism', 'Moderate foods', 'Balanced nutrition', 'Light preparation', 'Gentle balance'
        ]
    }

    # Save CSVs
    pd.DataFrame(foods_data).to_csv(foods_path, index=False)
    pd.DataFrame(patients_data).to_csv(patients_path, index=False)
    pd.DataFrame(plans_data).to_csv(plans_path, index=False)

    print(f"✓ Created sample data files")

def huggingface_login(token: Optional[str] = None):
    """Login to Hugging Face using a token"""
    tok = token or os.environ.get('HUGGINGFACE_TOKEN') or os.environ.get('HF_TOKEN')
    if tok:
        try:
            hf_login(token=tok)
            print('✓ Logged in to Hugging Face Hub')
        except Exception as e:
            print(f"⚠ Hugging Face login failed: {e}")
    else:
        print('ℹ No Hugging Face token provided; proceeding without login')

def compute_metrics(p: EvalPrediction) -> Dict[str, float]:
    """Compute metrics for evaluation"""
    # EvalPrediction has predictions and label_ids, not metrics
    # For now, just return empty dict since loss is computed automatically
    return {}

class MealPlanTrainer:
    """Trainer class for meal planning models"""
    
    def __init__(self, model_type: str = "t5", model_name: str = "t5-small", 
                 models_dir: str = "./models"):
        self.model_type = model_type
        self.model_name = model_name
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(exist_ok=True)
        self.engine = None
        
    def initialize_engine(self):
        """Initialize the hybrid neural engine"""
        self.engine = HybridNeuralEngine(
            model_type=self.model_type,
            model_name=self.model_name,
            models_dir=str(self.models_dir)
        )
        return self.engine
    
    def prepare_data(self, foods_path: str, patients_path: str, plans_path: str,
                    create_if_missing: bool = True):
        """Load and prepare training data"""
        # Check if files exist
        paths_exist = all(Path(p).exists() for p in [foods_path, patients_path, plans_path])
        
        if not paths_exist and create_if_missing:
            print("⚠ Data files not found, creating sample data...")
            create_sample_data(foods_path, patients_path, plans_path)
        
        # Load data
        print("📊 Loading data...")
        foods = load_foods_csv(foods_path)
        patients = load_patients_csv(patients_path)
        plans = load_doctor_plans_csv(plans_path)
        
        print(f"✓ Loaded {len(foods)} foods, {len(patients)} patients, {len(plans)} meal plans")
        
        return foods, patients, plans
    
    def train(self, foods: List[Food], patients: List[Patient], plans: List[MealPlan],
             output_dir: str = None, num_epochs: int = 3, batch_size: int = 2,
             learning_rate: float = 3e-4, weekly_mode: bool = True, 
             val_split: float = 0.1, save_model: bool = True):
        """Train the meal planning model"""
        
        if self.engine is None:
            self.initialize_engine()
        
        if output_dir is None:
            output_dir = self.models_dir / "ayurveda_meal_planner"
        
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Build knowledge graph
        print("🔗 Building knowledge graph...")
        graph_data = self.engine.build_knowledge_graph(foods, patients)
        print(f"✓ Graph built with {graph_data.x.shape[0]} nodes")
        
        # Prepare dataset
        print(f"📚 Preparing {'weekly' if weekly_mode else 'daily'} training dataset...")
        dataset = AyurvedaMealPlanDataset(
            patients, plans, self.engine.tokenizer, 
            model_type=self.model_type, weekly_mode=weekly_mode
        )
        
        if len(dataset) == 0:
            raise ValueError("No training data available. Check your data files.")
        
        # Split into train and validation
        train_size = int((1 - val_split) * len(dataset))
        val_size = len(dataset) - train_size
        
        if train_size > 0:
            train_dataset, val_dataset = torch.utils.data.random_split(
                dataset, [train_size, val_size]
            )
            
            print(f"✓ Train set: {len(train_dataset)} samples")
            print(f"✓ Validation set: {len(val_dataset)} samples")
            
            # Training arguments
            training_args = TrainingArguments(
                output_dir=str(output_dir),
                num_train_epochs=num_epochs,
                per_device_train_batch_size=batch_size,
                per_device_eval_batch_size=batch_size,
                learning_rate=learning_rate,
                warmup_steps=min(50, len(train_dataset) // 4),
                logging_dir=f"{output_dir}/logs",
                logging_steps=max(1, len(train_dataset) // (batch_size * 4)),
                save_steps=max(10, len(train_dataset) // (batch_size * 2)),
                eval_steps=max(10, len(train_dataset) // (batch_size * 2)) if val_size > 0 else None,
                eval_strategy="steps" if val_size > 0 else "no",
                save_total_limit=2,
                load_best_model_at_end=True if val_size > 0 else False,
                metric_for_best_model="eval_loss" if val_size > 0 else None,
                greater_is_better=False,
                fp16=torch.cuda.is_available(),
                dataloader_pin_memory=False,
                report_to="none",
                prediction_loss_only=False,
                remove_unused_columns=False,
            )
            
            # Initialize trainer
            trainer = Trainer(
                model=self.engine.planner.model,
                args=training_args,
                train_dataset=train_dataset,
                eval_dataset=val_dataset if val_size > 0 else None,
                tokenizer=self.engine.tokenizer,
                compute_metrics=compute_metrics if val_size > 0 else None,
            )
            
            # Train the model
            print(f"🎯 Starting training for {num_epochs} epochs...")
            trainer.train()
            
            # Save the model
            if save_model:
                print("💾 Saving model...")
                model_path = self.engine.save_model(output_dir)
                print(f"✓ Model saved to {model_path}")
                return model_path
            else:
                return str(output_dir)
        else:
            raise ValueError("Not enough data for training")

def main():
    """Main training function"""
    
    # Configuration
    CONFIG = {
        'model_type': 't5',
        'model_name': 't5-small',
        'models_dir': './models',
        'data_dir': '../docs/datasets',  # Relative to ai-server folder
        'epochs': 3,
        'batch_size': 1,
        'learning_rate': 3e-4,
        'weekly_mode': True,  # Train for weekly plans
        'val_split': 0.1,
    }
    
    # Setup paths
    data_dir = Path(CONFIG['data_dir'])
    foods_csv = data_dir / "foods.csv"
    patients_csv = data_dir / "patients.csv"
    plans_csv = data_dir / "doctor_plans.csv"
    
    print("=" * 60)
    print("🌿 Ayurveda Meal Planning Model Training")
    print("=" * 60)
    
    # Initialize trainer
    trainer = MealPlanTrainer(
        model_type=CONFIG['model_type'],
        model_name=CONFIG['model_name'],
        models_dir=CONFIG['models_dir']
    )
    
    # Prepare data
    try:
        foods, patients, plans = trainer.prepare_data(
            str(foods_csv), str(patients_csv), str(plans_csv)
        )
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return
    
    # Train model
    try:
        model_path = trainer.train(
            foods=foods,
            patients=patients,
            plans=plans,
            num_epochs=CONFIG['epochs'],
            batch_size=CONFIG['batch_size'],
            learning_rate=CONFIG['learning_rate'],
            weekly_mode=CONFIG['weekly_mode'],
            val_split=CONFIG['val_split']
        )
        
        print("\n" + "=" * 60)
        print(f"✅ Training completed! Model saved to: {model_path}")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Training failed: {e}")
        raise

if __name__ == "__main__":
    main()