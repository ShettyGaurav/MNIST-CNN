# MNIST-CNN

A simple project demonstrating a CNN model for MNIST digit recognition with a FastAPI backend and a frontend for testing.

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/ShettyGaurav/MNIST-CNN.git
cd MNIST-CNN
```
### 2. Run the backend
Navigate to the MNIST Pytorch folder and start the FastAPI server:
```bash

cd "MNIST Pytorch"
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000

This will start the backend at:
👉 http://localhost:8000
```
### 3. Explore the Model
```
Open Mnist.ipynb in Google Colab or Jupyter Notebook and run each cell to train and explore the model.

If you only want to test the pretrained model, use the included mnist_cnn.pth.
```
### 4. Frontend
```
Navigate to the Mnist frontend folder and open index.html with Live Server:

Right-click index.html → Open with Live Server.

The frontend will run in your browser and connect with the backend.
```
### 5. FolderStructure
```
MNIST-CNN/
│── MNIST Pytorch/      # Backend with FastAPI and model files
│── Mnist frontend/     # Frontend for testing predictions
│── Mnist.ipynb         # Notebook to train & explore CNN model
│── mnist_cnn.pth       # Pretrained model weights
