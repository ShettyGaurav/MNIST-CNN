// Get elements
const uploadInput = document.getElementById("uploadInput");
const uploadBtn = document.getElementById("uploadBtn");
const predictBtn = document.getElementById("predictBtn");
const preview = document.getElementById("preview");
const resultDiv = document.getElementById("result");

let uploadedImage = null;

// Upload image
uploadBtn.addEventListener("click", () => {
  uploadInput.click();
});

uploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = function () {
    // Clear preview
    preview.innerHTML = "";
    // Show image
    preview.appendChild(img);
    // Store image
    uploadedImage = img;

    // Enable predict button
    predictBtn.disabled = false;
    resultDiv.textContent = "✅ Image loaded! Click Predict.";
  };
  img.src = URL.createObjectURL(file);
});

// Predict
predictBtn.addEventListener("click", async () => {
  if (!uploadedImage) {
    resultDiv.textContent = "❌ No image to predict!";
    return;
  }

  try {
    // Create a temporary canvas to resize and preprocess
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext("2d");

    // Draw uploaded image to 28x28
    tempCtx.drawImage(uploadedImage, 0, 0, 28, 28);

    // Invert colors: white digit on black → black digit on white (MNIST style)
    const imageData = tempCtx.getImageData(0, 0, 28, 28);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = 255 - data[i]; // Invert
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
      data[i + 3] = 255;
    }
    tempCtx.putImageData(imageData, 0, 0);

    // Convert to blob and send
    tempCanvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "digit.png");

      resultDiv.textContent = "🔍 Predicting...";

      try {
        const response = await fetch("http://127.0.0.1:8000/predict", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        resultDiv.innerHTML = `
          ✅ Prediction: <strong>${result.prediction}</strong> 
          (Confidence: ${(result.confidence * 100).toFixed(2)}%)
        `;
      } catch (err) {
        resultDiv.textContent = "❌ Error: Cannot reach backend.";
        console.error(err);
      }
    }, "image/png");
  } catch (err) {
    resultDiv.textContent = "❌ Prediction failed.";
    console.error(err);
  }
});