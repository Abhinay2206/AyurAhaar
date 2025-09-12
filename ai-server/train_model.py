#!/usr/bin/env python3
"""
Dedicated Training Script for Ayurveda Meal Planning AI

This script trains the AI model using datasets from the docs/datasets folder
and saves the trained model to the models folder for production use.

Usage:
    python train_model.py [options]

Options:
    --epochs INT        Number of training epochs (default: 5)
    --batch-size INT    Training batch size (default: 2)
    --learning-rate FLOAT Learning rate (default: 3e-4)
    --model-name STR    Base model name (default: t5-small)
    --weekly-mode       Train for weekly plans (default: True)
    --output-name STR   Output model directory name (default: ayurveda_meal_planner)
    --force             Overwrite existing model
    --help              Show this help message
"""

import os
import sys
import argparse
import logging
from pathlib import Path
from datetime import datetime
import json

# Add the current directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model import HybridNeuralEngine
from train import (
    MealPlanTrainer, 
    load_foods_csv, 
    load_patients_csv, 
    load_doctor_plans_csv,
    create_sample_data
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('training.log')
    ]
)
logger = logging.getLogger(__name__)

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Train Ayurveda Meal Planning AI Model",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Basic training with default settings
    python train_model.py
    
    # Custom training configuration
    python train_model.py --epochs 10 --batch-size 4 --learning-rate 1e-4
    
    # Train with specific model name
    python train_model.py --model-name t5-base --output-name large_model
    
    # Force overwrite existing model
    python train_model.py --force --output-name my_model
        """
    )
    
    parser.add_argument(
        '--epochs', 
        type=int, 
        default=5,
        help='Number of training epochs (default: 5)'
    )
    
    parser.add_argument(
        '--batch-size', 
        type=int, 
        default=2,
        help='Training batch size (default: 2)'
    )
    
    parser.add_argument(
        '--learning-rate', 
        type=float, 
        default=3e-4,
        help='Learning rate (default: 3e-4)'
    )
    
    parser.add_argument(
        '--model-name', 
        type=str, 
        default='t5-small',
        choices=['t5-small', 't5-base', 't5-large'],
        help='Base model name (default: t5-small)'
    )
    
    parser.add_argument(
        '--weekly-mode', 
        action='store_true',
        default=True,
        help='Train for weekly plans (default: True)'
    )
    
    parser.add_argument(
        '--daily-mode', 
        action='store_true',
        help='Train for daily plans instead of weekly'
    )
    
    parser.add_argument(
        '--output-name', 
        type=str, 
        default='ayurveda_meal_planner',
        help='Output model directory name (default: ayurveda_meal_planner)'
    )
    
    parser.add_argument(
        '--force', 
        action='store_true',
        help='Overwrite existing model'
    )
    
    parser.add_argument(
        '--val-split', 
        type=float, 
        default=0.1,
        help='Validation split ratio (default: 0.1)'
    )
    
    parser.add_argument(
        '--seed', 
        type=int, 
        default=42,
        help='Random seed for reproducibility (default: 42)'
    )
    
    return parser.parse_args()

def setup_directories():
    """Setup required directories"""
    # Dataset directory (relative to script location)
    dataset_dir = Path(__file__).parent.parent / "docs" / "datasets"
    models_dir = Path(__file__).parent / "models"
    
    # Create models directory if it doesn't exist
    models_dir.mkdir(exist_ok=True)
    
    # Check if dataset directory exists
    if not dataset_dir.exists():
        logger.warning(f"Dataset directory not found: {dataset_dir}")
        logger.info("Creating sample dataset...")
        dataset_dir.mkdir(parents=True, exist_ok=True)
        
        # Create sample data
        create_sample_data(
            str(dataset_dir / "foods.csv"),
            str(dataset_dir / "patients.csv"),
            str(dataset_dir / "doctor_plans.csv")
        )
        logger.info("✓ Sample dataset created")
    
    return dataset_dir, models_dir

def load_datasets(dataset_dir: Path):
    """Load training datasets"""
    logger.info("📊 Loading datasets...")
    
    # Define file paths
    foods_path = dataset_dir / "foods.csv"
    patients_path = dataset_dir / "patients.csv"
    plans_path = dataset_dir / "doctor_plans.csv"
    
    # Check if all files exist
    missing_files = []
    for path, name in [(foods_path, "foods"), (patients_path, "patients"), (plans_path, "doctor_plans")]:
        if not path.exists():
            missing_files.append(f"{name}.csv")
    
    if missing_files:
        logger.error(f"Missing dataset files: {', '.join(missing_files)}")
        logger.info("Creating sample data...")
        create_sample_data(str(foods_path), str(patients_path), str(plans_path))
    
    # Load datasets
    try:
        foods = load_foods_csv(str(foods_path))
        patients = load_patients_csv(str(patients_path))
        plans = load_doctor_plans_csv(str(plans_path))
        
        logger.info(f"✓ Loaded {len(foods)} foods")
        logger.info(f"✓ Loaded {len(patients)} patients") 
        logger.info(f"✓ Loaded {len(plans)} meal plans")
        
        return foods, patients, plans
        
    except Exception as e:
        logger.error(f"Failed to load datasets: {e}")
        raise

def save_training_config(config: dict, output_dir: Path):
    """Save training configuration for reproducibility"""
    config_path = output_dir / "training_config.json"
    
    # Convert any non-serializable values
    serializable_config = {}
    for key, value in config.items():
        if isinstance(value, Path):
            serializable_config[key] = str(value)
        else:
            serializable_config[key] = value
    
    # Add timestamp
    serializable_config['trained_at'] = datetime.now().isoformat()
    
    with open(config_path, 'w') as f:
        json.dump(serializable_config, f, indent=2)
    
    logger.info(f"✓ Training config saved to {config_path}")

def main():
    """Main training function"""
    logger.info("=" * 60)
    logger.info("🌿 Ayurveda AI Model Training")
    logger.info("=" * 60)
    
    # Parse arguments
    args = parse_arguments()
    
    # Override weekly mode if daily mode is specified
    if args.daily_mode:
        args.weekly_mode = False
    
    # Setup directories
    dataset_dir, models_dir = setup_directories()
    output_dir = models_dir / args.output_name
    
    # Check if model already exists
    if output_dir.exists() and not args.force:
        logger.error(f"Model directory already exists: {output_dir}")
        logger.error("Use --force to overwrite or choose a different --output-name")
        sys.exit(1)
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load datasets
    try:
        foods, patients, plans = load_datasets(dataset_dir)
    except Exception as e:
        logger.error(f"Failed to load datasets: {e}")
        sys.exit(1)
    
    # Validate datasets
    if len(foods) == 0:
        logger.error("No foods found in dataset")
        sys.exit(1)
    
    if len(patients) == 0:
        logger.error("No patients found in dataset")
        sys.exit(1)
    
    if len(plans) == 0:
        logger.error("No meal plans found in dataset")
        sys.exit(1)
    
    # Initialize trainer
    logger.info("🤖 Initializing AI trainer...")
    trainer = MealPlanTrainer(
        model_type="t5",
        model_name=args.model_name,
        models_dir=str(models_dir)
    )
    
    # Initialize engine
    try:
        engine = trainer.initialize_engine()
        logger.info(f"✓ Engine initialized with {args.model_name}")
    except Exception as e:
        logger.error(f"Failed to initialize engine: {e}")
        sys.exit(1)
    
    # Training configuration
    training_config = {
        'model_name': args.model_name,
        'epochs': args.epochs,
        'batch_size': args.batch_size,
        'learning_rate': args.learning_rate,
        'weekly_mode': args.weekly_mode,
        'val_split': args.val_split,
        'seed': args.seed,
        'output_dir': output_dir,
        'dataset_dir': dataset_dir,
        'num_foods': len(foods),
        'num_patients': len(patients),
        'num_plans': len(plans)
    }
    
    logger.info("📋 Training Configuration:")
    for key, value in training_config.items():
        if key not in ['output_dir', 'dataset_dir']:
            logger.info(f"  {key}: {value}")
    
    # Save training configuration
    save_training_config(training_config, output_dir)
    
    # Start training
    logger.info("🎯 Starting model training...")
    start_time = datetime.now()
    
    try:
        model_path = trainer.train(
            foods=foods,
            patients=patients,
            plans=plans,
            output_dir=str(output_dir),
            num_epochs=args.epochs,
            batch_size=args.batch_size,
            learning_rate=args.learning_rate,
            weekly_mode=args.weekly_mode,
            val_split=args.val_split,
            save_model=True
        )
        
        end_time = datetime.now()
        training_duration = end_time - start_time
        
        logger.info("=" * 60)
        logger.info("✅ Training completed successfully!")
        logger.info(f"📁 Model saved to: {model_path}")
        logger.info(f"⏱️  Training duration: {training_duration}")
        logger.info(f"📊 Final model stats:")
        logger.info(f"   - Model type: T5 ({args.model_name})")
        logger.info(f"   - Training mode: {'Weekly' if args.weekly_mode else 'Daily'}")
        logger.info(f"   - Epochs: {args.epochs}")
        logger.info(f"   - Batch size: {args.batch_size}")
        logger.info(f"   - Learning rate: {args.learning_rate}")
        logger.info("=" * 60)
        
        # Test the trained model
        logger.info("🧪 Testing trained model...")
        try:
            # Load the trained model
            test_engine = HybridNeuralEngine(models_dir=str(models_dir))
            test_engine.load_model(model_path)
            
            # Build knowledge graph
            graph_data = test_engine.build_knowledge_graph(foods, patients)
            
            # Test with a sample patient
            if len(patients) > 0:
                test_patient = patients[0]
                logger.info(f"   Testing with patient: {test_patient.prakriti} constitution")
                
                if args.weekly_mode:
                    result = test_engine.generate_weekly_meal_plan(test_patient, graph_data=graph_data)
                    logger.info(f"   ✓ Generated {len(result.days)}-day meal plan")
                else:
                    result = test_engine.generate_meal_plan(test_patient, day=1, graph_data=graph_data)
                    parsed = test_engine.parse_generated_plan(result)
                    logger.info(f"   ✓ Generated meal plan with {len(parsed['breakfast'])} breakfast items")
                
                logger.info("   ✓ Model test successful!")
            
        except Exception as e:
            logger.warning(f"Model test failed: {e}")
            logger.warning("Model was saved but may need debugging")
        
        return 0
        
    except Exception as e:
        logger.error(f"❌ Training failed: {e}")
        logger.error("Check the error details above and try again")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        logger.info("\n🛑 Training interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"💥 Unexpected error: {e}")
        sys.exit(1)