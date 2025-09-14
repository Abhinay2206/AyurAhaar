#!/usr/bin/env python3
"""Quick smoke test for 7-day weekly meal plan generation."""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from model import HybridNeuralEngine
from train import load_foods_csv, load_patients_csv, load_doctor_plans_csv, create_sample_data


def main():
    base_dir = Path(__file__).parent
    data_dir = base_dir / "datasets"

    # Ensure sample data exists (use local ai-server/datasets to avoid cross-folder issues)
    foods_csv = data_dir / "foods.csv"
    patients_csv = data_dir / "patients.csv"
    plans_csv = data_dir / "doctor_plans.csv"
    if not data_dir.exists() or not all(p.exists() for p in [foods_csv, patients_csv, plans_csv]):
        data_dir.mkdir(parents=True, exist_ok=True)
        create_sample_data(str(foods_csv), str(patients_csv), str(plans_csv))

    # Load data
    foods = load_foods_csv(str(foods_csv))
    patients = load_patients_csv(str(patients_csv))

    # Initialize engine (load existing model if present)
    engine = HybridNeuralEngine(models_dir=str(base_dir / "models"))
    try:
        # Try loading the test model if available
        test_model_dir = base_dir / "models" / "test_model"
        if test_model_dir.exists():
            engine.load_model(str(test_model_dir))
    except Exception:
        pass

    # Build knowledge graph
    graph = engine.build_knowledge_graph(foods, patients)

    # Pick a patient
    patient = patients[0]

    # Generate weekly plan
    weekly = engine.generate_weekly_meal_plan(patient, graph_data=graph)

    assert weekly is not None, "Weekly plan is None"
    assert len(weekly.days) == 7, f"Expected 7 days, got {len(weekly.days)}"
    for idx, day in enumerate(weekly.days, start=1):
        has_any = any([
            bool(day.breakfast), bool(day.lunch), bool(day.dinner), bool(day.snacks)
        ])
        assert has_any, f"Day {idx} has no meals"

    print("OK: Generated a valid 7-day plan with content for each day.")


if __name__ == "__main__":
    main()
