from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
import torch
import torchvision.transforms as transforms
import io
from fastapi.middleware.cors import CORSMiddleware

from model import CNN

app = FastAPI(title="MNIST Digit Classifier")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",   # ← Your frontend URL
        "http://localhost:5500",   # Also allow localhost
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allows POST, GET, etc.
    allow_headers=["*"],  # Allows all headers
)
# Device config
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model
try:
    model = CNN().to(device)
    model.load_state_dict(torch.load("mnist_cnn.pth", map_location=device))
    model.eval()  # Important: set to evaluation mode
    print("✅ Model loaded successfully.")
except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")

# Preprocessing pipeline (MUST match training)
transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((28, 28)),
    transforms.ToTensor(),  # ← Must come before Lambda!
    transforms.Lambda(lambda x: 1 - x),  # Invert: white → black, black → white
    transforms.Normalize((0.5,), (0.5,))
])

@app.get("/")
def home():
    return {
        "message": "Welcome to the MNIST CNN API!",
        "docs": "Visit /docs for API documentation"
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))

        # Preprocess
        input_tensor = transform(image).unsqueeze(0).to(device)  # Add batch dim

        # Inference
        with torch.no_grad():
            output = model(input_tensor)
            probabilities = torch.softmax(output, dim=1)
            confidence, predicted = torch.max(probabilities, 1)
            predicted_label = predicted.item()
            confidence_score = confidence.item()

        return {
            "prediction": predicted_label,
            "confidence": round(confidence_score, 4)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")