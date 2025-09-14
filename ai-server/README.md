# Ayurveda AI Server

An AI-powered Ayurvedic meal planning system that generates personalized 7-day meal plans based on individual constitution (prakriti), health conditions, and lifestyle factors.

## Features

- 🧠 **AI-Powered**: Uses T5 transformer model fine-tuned for Ayurvedic meal planning
- 🕸️ **Knowledge Graph**: Incorporates Ayurvedic food relationships and properties
- 📅 **7-Day Plans**: Generates complete weekly meal plans
- 🔧 **Customizable**: Adapts to individual prakriti, health conditions, and allergies
- 🚀 **FastAPI**: RESTful API with automatic documentation
- 💾 **Model Persistence**: Saves and loads trained models for reuse

## Architecture

The system is split into three main components:

### 1. Model (`model.py`)
- **GraphNeuralNetwork**: Processes food relationships using Graph Convolutional Networks
- **T5MealPlanner**: Fine-tuned T5 model for text-to-text meal plan generation
- **HybridNeuralEngine**: Combines GNN and T5 for comprehensive meal planning
- **Data Structures**: Ayurvedic food, patient, and meal plan representations

### 2. Training (`train.py`)
- **Data Loading**: Loads foods, patients, and meal plans from CSV files
- **Dataset Preparation**: Creates training datasets for both daily and weekly plans
- **Model Training**: Fine-tunes T5 model with Ayurvedic meal planning data
- **Model Persistence**: Saves trained models for production use

### 3. API (`app.py`)
- **FastAPI Application**: RESTful API with automatic OpenAPI documentation
- **Meal Plan Generation**: Endpoints for single-day and weekly meal plans
- **Model Management**: Load, save, and train models via API
- **Health Checks**: Monitor system status and model availability

## Quick Start

### 1. Setup Environment

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Start the Server

```bash
# Using the startup script
./start_server.sh

# Or manually
source venv/bin/activate
python app.py
```

### Optional: Quick Weekly Plan Smoke Test

Run a tiny script to ensure weekly generation reliably returns 7 days with content:

```bash
source venv/bin/activate
python smoke_test_weekly.py
```
You should see: `OK: Generated a valid 7-day plan with content for each day.`

### 3. Access the API

- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Interactive API**: http://localhost:8000/redoc

## API Endpoints

### Generate Meal Plans

#### Single Day Plan
```bash
curl -X POST "http://localhost:8000/generate/single" \
  -H "Content-Type: application/json" \
  -d '{
    "patient": {
      "age": 35,
      "gender": "male",
      "weight": 70,
      "height": 175,
      "lifestyle": "moderate",
      "prakriti": "vata",
      "health_conditions": [],
      "allergies": []
    },
    "day": 1,
    "temperature": 0.9
  }'
```

#### Weekly Plan
```bash
curl -X POST "http://localhost:8000/generate/weekly" \
  -H "Content-Type: application/json" \
  -d '{
    "patient": {
      "age": 28,
      "gender": "female",
      "weight": 60,
      "height": 165,
      "lifestyle": "active",
      "prakriti": "pitta",
      "health_conditions": ["acidity"],
      "allergies": ["nuts"]
    },
    "temperature": 0.8
  }'
```

### Model Management

#### Get Model Info
```bash
curl -X GET "http://localhost:8000/model/info"
```

#### Train Model
```bash
curl -X POST "http://localhost:8000/train" \
  -H "Content-Type: application/json" \
  -d '{
    "epochs": 3,
    "batch_size": 2,
    "learning_rate": 0.0003,
    "weekly_mode": true
  }'
```

## Data Format

### Sample Patient Data
```csv
id,age,gender,weight,height,lifestyle,prakriti,health_conditions,allergies
P001,35,male,70,175,moderate,vata,"","" 
P002,28,female,60,165,active,pitta,acidity,nuts
```

### Sample Food Data
```csv
id,name,category,calories,protein,carbs,fats,rasa,dosha_effects
F001,Rice,grains,130,2.7,28,0.3,sweet,"vata:-,pitta:-,kapha:+"
F002,Moong Dal,legumes,347,24,63,1.2,sweet,"vata:-,pitta:-,kapha:-"
```

### Sample Meal Plan Data
```csv
patient_id,day,breakfast,lunch,dinner,snacks
P001,1,"Rice porridge|Almonds","Rice|Moong dal|Ghee","Soup|Bread","Banana|Nuts"
```

## Training Your Own Model

### 1. Prepare Data
Place your CSV files in `../docs/datasets/`:
- `foods.csv` - Food items with Ayurvedic properties
- `patients.csv` - Patient profiles
- `doctor_plans.csv` - Expert meal plans for training

### 2. Train Model
```python
from train import MealPlanTrainer

# Initialize trainer
trainer = MealPlanTrainer(model_type="t5", model_name="t5-small")

# Load data and train
foods, patients, plans = trainer.prepare_data(
    "foods.csv", "patients.csv", "doctor_plans.csv"
)

# Train model
model_path = trainer.train(
    foods=foods,
    patients=patients, 
    plans=plans,
    num_epochs=5,
    weekly_mode=True
)
```

### 3. Use Trained Model
```python
from model import HybridNeuralEngine

# Load trained model
engine = HybridNeuralEngine()
engine.load_model(model_path)

# Generate meal plan
patient = Patient(...)
weekly_plan = engine.generate_weekly_meal_plan(patient)
```

## Ayurvedic Principles

The system incorporates key Ayurvedic concepts:

- **Prakriti**: Constitutional types (Vata, Pitta, Kapha)
- **Rasa**: Six tastes (sweet, sour, salty, pungent, bitter, astringent)
- **Guna**: Food qualities (light/heavy, dry/oily, etc.)
- **Virya**: Heating/cooling potency
- **Vipaka**: Post-digestive effect
- **Dosha Effects**: How foods affect each dosha

## Configuration

Key configuration options in the code:

```python
CONFIG = {
    'model_type': 't5',           # Model architecture
    'model_name': 't5-small',     # Pretrained model size
    'epochs': 3,                  # Training epochs
    'batch_size': 2,              # Training batch size
    'learning_rate': 3e-4,        # Learning rate
    'weekly_mode': True,          # Train for 7-day plans
    'temperature': 0.9,           # Generation creativity
}
```

## Development

### Project Structure
```
ai-server/
├── model.py              # Core AI models and data structures
├── train.py              # Training logic and data loading
├── app.py                # FastAPI application
├── requirements.txt      # Python dependencies
├── start_server.sh       # Startup script
├── models/               # Trained model storage
└── venv/                # Virtual environment
```

### Adding New Features

1. **New Food Properties**: Extend the `Food` dataclass in `model.py`
2. **Custom Models**: Implement new architectures in `model.py`
3. **API Endpoints**: Add new routes in `app.py`
4. **Training Logic**: Enhance training in `train.py`

## Troubleshooting

### Common Issues

1. **Missing Dependencies**: Ensure all packages in `requirements.txt` are installed
2. **CUDA/GPU Issues**: The system automatically detects and uses available hardware
3. **Memory Issues**: Reduce batch size or use smaller model (e.g., `t5-small`)
4. **Data Loading**: Check CSV file formats and paths

### Logs and Debugging

The system uses Python logging. Check console output for detailed information about:
- Model loading status
- Training progress  
- API request processing
- Error messages

## Performance

### Optimization Tips

1. **GPU Usage**: Use CUDA-compatible GPU for faster training/inference
2. **Batch Size**: Increase batch size if you have sufficient memory
3. **Model Size**: Use larger models (t5-base, t5-large) for better quality
4. **Caching**: Models and knowledge graphs are cached after first load

### Benchmarks

On typical hardware:
- **Model Loading**: 2-5 seconds
- **Single Day Generation**: 1-3 seconds  
- **Weekly Plan Generation**: 3-8 seconds
- **Training (3 epochs)**: 10-30 minutes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the AyurAhaar system for educational and research purposes.