#!/usr/bin/env python3
"""Example: Generate and print a 7-day Ayurvedic meal plan for a sample patient."""

from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent))

from model import HybridNeuralEngine
from train import load_foods_csv, load_patients_csv, create_sample_data


def print_weekly_plan(weekly):
    print(f"\nPatient ID: {weekly.patient_id}")
    print("Weekly Notes:", weekly.weekly_notes)
    print("\n=== 7-Day Meal Plan ===")
    for day in weekly.days:
        print(f"\nDay {day.day}")
        print("  Breakfast:", ", ".join(day.breakfast) if day.breakfast else "-")
        print("  Lunch:    ", ", ".join(day.lunch) if day.lunch else "-")
        print("  Dinner:   ", ", ".join(day.dinner) if day.dinner else "-")
        print("  Snacks:   ", ", ".join(day.snacks) if day.snacks else "-")


def main():
    base_dir = Path(__file__).parent
    data_dir = base_dir / "datasets"

    # Ensure dataset exists locally
    foods_csv = data_dir / "foods.csv"
    patients_csv = data_dir / "patients.csv"
    plans_csv = data_dir / "doctor_plans.csv"
    if not data_dir.exists() or not all(p.exists() for p in [foods_csv, patients_csv, plans_csv]):
        data_dir.mkdir(parents=True, exist_ok=True)
        create_sample_data(str(foods_csv), str(patients_csv), str(plans_csv))

    # Load data
    foods = load_foods_csv(str(foods_csv))
    patients = load_patients_csv(str(patients_csv))

    # Choose a sample patient
    patient = patients[0]
    print(f"Using sample patient: age={patient.age}, gender={patient.gender}, prakriti={patient.prakriti}")

    # Initialize engine and load model if available
    engine = HybridNeuralEngine(models_dir=str(base_dir / "models"))
    test_model_dir = base_dir / "models" / "test_model"
    if test_model_dir.exists():
        try:
            engine.load_model(str(test_model_dir))
        except Exception:
            pass

    # Build knowledge graph and generate weekly plan
    graph = engine.build_knowledge_graph(foods, patients)
    weekly = engine.generate_weekly_meal_plan(patient, graph_data=graph)

    # Basic sanity checks
    assert weekly is not None, "No weekly plan was produced"
    assert len(weekly.days) == 7, f"Expected 7 days, got {len(weekly.days)}"

    print_weekly_plan(weekly)


if __name__ == "__main__":
    main()
