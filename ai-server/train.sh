#!/bin/bash
# Training wrapper script for Ayurveda AI Model

echo "🌿 Ayurveda AI Model Training"
echo "=============================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run:"
    echo "   python3 -m venv venv"
    echo "   source venv/bin/activate"
    echo "   pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if datasets exist
if [ ! -d "../docs/datasets" ]; then
    echo "📁 Creating datasets directory..."
    mkdir -p ../docs/datasets
fi

# Default training parameters
EPOCHS=5
BATCH_SIZE=2
LEARNING_RATE=3e-4
MODEL_NAME="t5-small"
OUTPUT_NAME="ayurveda_meal_planner"
WEEKLY_MODE="--weekly-mode"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --epochs)
            EPOCHS="$2"
            shift 2
            ;;
        --batch-size)
            BATCH_SIZE="$2"
            shift 2
            ;;
        --learning-rate)
            LEARNING_RATE="$2"
            shift 2
            ;;
        --model-name)
            MODEL_NAME="$2"
            shift 2
            ;;
        --output-name)
            OUTPUT_NAME="$2"
            shift 2
            ;;
        --daily-mode)
            WEEKLY_MODE="--daily-mode"
            shift
            ;;
        --force)
            FORCE="--force"
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --epochs NUM         Number of training epochs (default: 5)"
            echo "  --batch-size NUM     Training batch size (default: 2)"
            echo "  --learning-rate NUM  Learning rate (default: 3e-4)"
            echo "  --model-name NAME    Base model (t5-small, t5-base, t5-large) (default: t5-small)"
            echo "  --output-name NAME   Output model name (default: ayurveda_meal_planner)"
            echo "  --daily-mode         Train for daily plans instead of weekly"
            echo "  --force              Overwrite existing model"
            echo "  --help               Show this help"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Basic training"
            echo "  $0 --epochs 10 --batch-size 4        # Custom training"
            echo "  $0 --model-name t5-base --force       # Use larger model"
            echo "  $0 --daily-mode --output-name daily   # Train daily model"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "📋 Training Configuration:"
echo "   Epochs: $EPOCHS"
echo "   Batch Size: $BATCH_SIZE"
echo "   Learning Rate: $LEARNING_RATE"
echo "   Model: $MODEL_NAME"
echo "   Output: $OUTPUT_NAME"
echo "   Mode: $(echo $WEEKLY_MODE | sed 's/--//' | sed 's/-mode//')"
echo ""

# Run the training script
echo "🚀 Starting training..."
python train_model.py \
    --epochs $EPOCHS \
    --batch-size $BATCH_SIZE \
    --learning-rate $LEARNING_RATE \
    --model-name $MODEL_NAME \
    --output-name $OUTPUT_NAME \
    $WEEKLY_MODE \
    $FORCE

# Check if training was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Training completed successfully!"
    echo "📁 Model saved in: models/$OUTPUT_NAME"
    echo ""
    echo "🚀 To use the trained model:"
    echo "   python app.py"
    echo "   # Then visit http://localhost:8000/docs"
else
    echo ""
    echo "❌ Training failed!"
    echo "📋 Check training.log for details"
fi