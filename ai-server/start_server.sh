#!/bin/bash
# Startup script for Ayurveda AI Server

echo "🌿 Starting Ayurveda AI Server..."

# Activate virtual environment
source venv/bin/activate

# Check if models directory exists
if [ ! -d "models" ]; then
    echo "Creating models directory..."
    mkdir -p models
fi

# Check if data directory exists
if [ ! -d "../docs/datasets" ]; then
    echo "Creating datasets directory..."
    mkdir -p ../docs/datasets
fi

# Start the server
echo "Starting FastAPI server on http://localhost:8000"
python app.py