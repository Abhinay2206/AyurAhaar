from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Union
import asyncio
import uvicorn
from pathlib import Path
import json
import logging
from datetime import datetime
import os

from model import (
    Patient, MealPlan, WeeklyMealPlan, HybridNeuralEngine, 
    Food, AyurvedaKnowledgeGraph
)
from train import (
    load_foods_csv, load_patients_csv, load_doctor_plans_csv,
    MealPlanTrainer, create_sample_data
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Ayurveda Meal Planning API",
    description="AI-powered Ayurvedic meal planning system with 7-day plan generation",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
engine: Optional[HybridNeuralEngine] = None
graph_data = None
models_dir = Path("./models")
data_dir = Path("./datasets")

# Pydantic models for API
class PatientCreate(BaseModel):
    age: int = Field(..., ge=1, le=120, description="Patient age")
    gender: str = Field(..., description="Patient gender (male/female)")
    weight: float = Field(..., gt=0, description="Weight in kg")
    height: float = Field(..., gt=0, description="Height in cm")
    lifestyle: str = Field(..., description="Lifestyle (sedentary/moderate/active/very_active)")
    prakriti: str = Field(..., description="Ayurvedic constitution (vata/pitta/kapha)")
    health_conditions: List[str] = Field(default=[], description="List of health conditions")
    allergies: List[str] = Field(default=[], description="List of allergies")
    preferred_cuisine: List[str] = Field(default=[], description="Preferred cuisine types")

class PatientResponse(BaseModel):
    id: str
    age: int
    gender: str
    weight: float
    height: float
    bmi: float
    lifestyle: str
    prakriti: str
    health_conditions: List[str]
    allergies: List[str]
    preferred_cuisine: List[str]

class MealPlanResponse(BaseModel):
    patient_id: str
    day: int
    breakfast: List[str]
    lunch: List[str]
    dinner: List[str]
    snacks: List[str]
    restrictions: List[str]
    doctor_notes: str

class WeeklyMealPlanResponse(BaseModel):
    patient_id: str
    days: List[MealPlanResponse]
    weekly_notes: str

class GenerationRequest(BaseModel):
    patient: PatientCreate
    day: Optional[int] = Field(1, ge=1, le=7, description="Day number for single day plan")
    weekly: bool = Field(False, description="Generate 7-day plan instead of single day")
    temperature: float = Field(0.9, ge=0.1, le=2.0, description="Generation temperature")
    use_knowledge_graph: bool = Field(True, description="Use knowledge graph for recommendations")

class TrainingRequest(BaseModel):
    epochs: int = Field(3, ge=1, le=20, description="Number of training epochs")
    batch_size: int = Field(1, ge=1, le=8, description="Training batch size")
    learning_rate: float = Field(3e-4, gt=0, description="Learning rate")
    weekly_mode: bool = Field(True, description="Train for weekly plans")

class ModelInfo(BaseModel):
    model_type: str
    model_name: str
    is_loaded: bool
    models_available: List[str]
    last_trained: Optional[str] = None

# Utility functions
def calculate_bmi(weight: float, height: float) -> float:
    """Calculate BMI from weight and height"""
    height_m = height / 100.0
    return round(weight / (height_m * height_m), 1)

def convert_patient_create_to_patient(patient_create: PatientCreate, patient_id: str) -> Patient:
    """Convert PatientCreate to Patient object"""
    bmi = calculate_bmi(patient_create.weight, patient_create.height)
    return Patient(
        id=patient_id,
        age=patient_create.age,
        gender=patient_create.gender,
        weight=patient_create.weight,
        height=patient_create.height,
        bmi=bmi,
        lifestyle=patient_create.lifestyle,
        prakriti=patient_create.prakriti,
        health_conditions=patient_create.health_conditions,
        allergies=patient_create.allergies,
        preferred_cuisine=patient_create.preferred_cuisine
    )

def convert_meal_plan_to_response(meal_plan: MealPlan) -> MealPlanResponse:
    """Convert MealPlan to MealPlanResponse"""
    return MealPlanResponse(
        patient_id=meal_plan.patient_id,
        day=meal_plan.day,
        breakfast=meal_plan.breakfast,
        lunch=meal_plan.lunch,
        dinner=meal_plan.dinner,
        snacks=meal_plan.snacks,
        restrictions=meal_plan.restrictions,
        doctor_notes=meal_plan.doctor_notes
    )

def convert_weekly_plan_to_response(weekly_plan: WeeklyMealPlan) -> WeeklyMealPlanResponse:
    """Convert WeeklyMealPlan to WeeklyMealPlanResponse"""
    return WeeklyMealPlanResponse(
        patient_id=weekly_plan.patient_id,
        days=[convert_meal_plan_to_response(day) for day in weekly_plan.days],
        weekly_notes=weekly_plan.weekly_notes
    )

async def initialize_engine():
    """Initialize the AI engine"""
    global engine, graph_data
    
    try:
        logger.info("Initializing AI engine...")
        
        # Try to find and load any existing trained model
        available_models = []
        if models_dir.exists():
            for model_path in models_dir.iterdir():
                if model_path.is_dir() and (model_path / "config.json").exists():
                    available_models.append(model_path)
        
        if available_models:
            # Load the most recent model (or first available)
            model_to_load = available_models[0]  # You could sort by modification time
            logger.info(f"Found trained model: {model_to_load.name}")
            logger.info(f"Loading existing model from {model_to_load}")
            engine = HybridNeuralEngine(models_dir=str(models_dir))
            engine.load_model(str(model_to_load))
        else:
            logger.info("No existing trained models found, initializing new model")
            engine = HybridNeuralEngine(models_dir=str(models_dir))
        
        # Load data and build knowledge graph
        await load_and_build_graph()
        
        logger.info("✓ AI engine initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize AI engine: {e}")
        # Initialize with basic engine as fallback
        engine = HybridNeuralEngine(models_dir=str(models_dir))

async def load_and_build_graph():
    """Load data and build knowledge graph"""
    global graph_data
    
    try:
        # Setup data paths
        foods_csv = data_dir / "foods.csv"
        patients_csv = data_dir / "patients.csv"
        plans_csv = data_dir / "doctor_plans.csv"
        
        # Check if data files exist, create sample data if not
        if not all(p.exists() for p in [foods_csv, patients_csv, plans_csv]):
            logger.info("Creating sample data files...")
            data_dir.mkdir(parents=True, exist_ok=True)
            create_sample_data(str(foods_csv), str(patients_csv), str(plans_csv))
        
        # Load data
        logger.info("Loading knowledge base data...")
        foods = load_foods_csv(str(foods_csv))
        patients = load_patients_csv(str(patients_csv))
        
        # Build knowledge graph
        logger.info("Building knowledge graph...")
        graph_data = engine.build_knowledge_graph(foods, patients)
        logger.info(f"✓ Knowledge graph built with {graph_data.x.shape[0]} nodes")
        
    except Exception as e:
        logger.error(f"Failed to load data and build graph: {e}")
        graph_data = None

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the application"""
    await initialize_engine()

# API Routes

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint"""
    return {
        "message": "Ayurveda Meal Planning API",
        "version": "1.0.0",
        "status": "healthy" if engine else "initializing"
    }

@app.get("/health", response_model=Dict[str, Union[str, bool]])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "engine_loaded": engine is not None,
        "graph_loaded": graph_data is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/model/info", response_model=ModelInfo)
async def get_model_info():
    """Get information about the current model"""
    if not engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    
    # List available models
    available_models = []
    if models_dir.exists():
        for model_path in models_dir.iterdir():
            if model_path.is_dir():
                if (model_path / "config.json").exists() or (model_path / "pytorch_model.bin").exists() or (model_path / "model.safetensors").exists():
                    available_models.append(model_path.name)
    
    return ModelInfo(
        model_type=engine.model_type,
        model_name=getattr(engine, 'model_name', 'unknown'),
        is_loaded=True,
        models_available=available_models,
        last_trained=None  # Could be enhanced to track training timestamps
    )

@app.post("/model/load/{model_name}")
async def load_model(model_name: str):
    """Load a specific model"""
    global engine
    
    model_path = models_dir / model_name
    if not model_path.exists():
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found")
    
    try:
        engine.load_model(str(model_path))
        return {"message": f"Model {model_name} loaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")

@app.post("/generate/single", response_model=MealPlanResponse)
async def generate_single_day_plan(request: GenerationRequest):
    """Generate a single day meal plan"""
    if not engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    
    try:
        # Convert request to Patient object
        patient = convert_patient_create_to_patient(request.patient, "temp_patient")
        
        # Generate meal plan
        generated_text = engine.generate_meal_plan(
            patient=patient,
            day=request.day,
            graph_data=graph_data,
            temperature=request.temperature,
            use_knowledge_graph=request.use_knowledge_graph
        )
        
        # Parse the generated text
        parsed_plan = engine.parse_generated_plan(generated_text)
        
        # Create meal plan object
        meal_plan = MealPlan(
            patient_id=patient.id,
            day=request.day,
            breakfast=parsed_plan['breakfast'],
            lunch=parsed_plan['lunch'],
            dinner=parsed_plan['dinner'],
            snacks=parsed_plan['snacks'],
            restrictions=[],
            doctor_notes=f"AI-generated plan for {patient.prakriti} constitution"
        )
        
        return convert_meal_plan_to_response(meal_plan)
        
    except Exception as e:
        logger.error(f"Error generating single day plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate meal plan: {str(e)}")

@app.post("/generate/weekly", response_model=WeeklyMealPlanResponse)
async def generate_weekly_plan(request: GenerationRequest):
    """Generate a 7-day meal plan"""
    if not engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    
    try:
        # Convert request to Patient object
        patient = convert_patient_create_to_patient(request.patient, "temp_patient")
        
        # Generate weekly meal plan
        weekly_plan = engine.generate_weekly_meal_plan(
            patient=patient,
            graph_data=graph_data,
            temperature=request.temperature,
            use_knowledge_graph=request.use_knowledge_graph
        )
        
        return convert_weekly_plan_to_response(weekly_plan)
        
    except Exception as e:
        logger.error(f"Error generating weekly plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate weekly meal plan: {str(e)}")

@app.post("/generate", response_model=Union[MealPlanResponse, WeeklyMealPlanResponse])
async def generate_meal_plan(request: GenerationRequest):
    """Generate meal plan (single day or weekly based on request)"""
    if request.weekly:
        return await generate_weekly_plan(request)
    else:
        return await generate_single_day_plan(request)

@app.post("/train")
async def train_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Train or fine-tune the model"""
    if not engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    
    # Add training to background tasks
    background_tasks.add_task(run_training, request)
    
    return {
        "message": "Training started in background",
        "status": "started",
        "epochs": request.epochs,
        "batch_size": request.batch_size,
        "weekly_mode": request.weekly_mode
    }

async def run_training(request: TrainingRequest):
    """Run training in background"""
    try:
        logger.info("Starting model training...")
        
        # Initialize trainer
        trainer = MealPlanTrainer(
            model_type=engine.model_type,
            model_name=getattr(engine, 'model_name', 't5-small'),
            models_dir=str(models_dir)
        )
        trainer.engine = engine  # Use existing engine
        
        # Setup data paths
        foods_csv = data_dir / "foods.csv"
        patients_csv = data_dir / "patients.csv"
        plans_csv = data_dir / "doctor_plans.csv"
        
        # Load data
        foods, patients, plans = trainer.prepare_data(
            str(foods_csv), str(patients_csv), str(plans_csv)
        )
        
        # Train model
        model_path = trainer.train(
            foods=foods,
            patients=patients,
            plans=plans,
            num_epochs=request.epochs,
            batch_size=request.batch_size,
            learning_rate=request.learning_rate,
            weekly_mode=request.weekly_mode
        )
        
        logger.info(f"✓ Training completed! Model saved to: {model_path}")
        
        # Rebuild knowledge graph with updated engine
        await load_and_build_graph()
        
    except Exception as e:
        logger.error(f"Training failed: {e}")

@app.get("/patients/sample", response_model=List[PatientResponse])
async def get_sample_patients():
    """Get sample patients for testing"""
    try:
        # Load sample patients
        patients_csv = data_dir / "patients.csv"
        if not patients_csv.exists():
            # Create sample data if not exists
            create_sample_data(
                str(data_dir / "foods.csv"),
                str(patients_csv),
                str(data_dir / "doctor_plans.csv")
            )
        
        patients = load_patients_csv(str(patients_csv))
        
        # Convert to response format
        return [
            PatientResponse(
                id=p.id,
                age=p.age,
                gender=p.gender,
                weight=p.weight,
                height=p.height,
                bmi=p.bmi,
                lifestyle=p.lifestyle,
                prakriti=p.prakriti,
                health_conditions=p.health_conditions,
                allergies=p.allergies,
                preferred_cuisine=p.preferred_cuisine
            )
            for p in patients
        ]
        
    except Exception as e:
        logger.error(f"Error getting sample patients: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get sample patients: {str(e)}")

@app.get("/foods/categories", response_model=Dict[str, List[str]])
async def get_food_categories():
    """Get available food categories and items"""
    if not engine or not engine.knowledge_graph:
        raise HTTPException(status_code=503, detail="Knowledge graph not available")
    
    try:
        return engine.knowledge_graph.food_names_by_category
    except Exception as e:
        logger.error(f"Error getting food categories: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get food categories: {str(e)}")

# Error handlers
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}")
    return {"error": "Internal server error", "detail": str(exc)}

# Development server configuration
if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )