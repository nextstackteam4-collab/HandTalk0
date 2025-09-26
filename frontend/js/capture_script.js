// frontend/js/capture_script.js

// --- DOM Elements ---
const cameraFeed = document.getElementById("cameraFeed");
const capturedImagePreview = document.getElementById("capturedImagePreview");
const canvas = document.getElementById("canvas");
const initiateCameraButton = document.getElementById("initiateCameraButton");
const captureButton = document.getElementById("captureButton");
const retakeButton = document.getElementById("retakeButton");
const analyzeButton = document.getElementById("analyzeButton");
const loadingIndicator = document.getElementById("loadingIndicator");
const resultsDiv = document.getElementById("results");
const analysisOutput = document.getElementById("analysisOutput");
const cameraPermissionGuide = document.getElementById("cameraPermissionGuide");
const permissionDeniedMessage = document.getElementById(
  "permissionDeniedMessage"
);
const notification = document.getElementById("notification");

let currentStream;
let capturedFile = null;

// --- UI HELPER ---
function showNotification(message, isError = false) {
  if (!notification) return;
  notification.textContent = message;
  notification.className = `notification ${isError ? "error" : "success"} show`;
  setTimeout(() => {
    notification.classList.remove("show");
  }, 4000);
}

// --- Camera Functions ---
async function startCameraStream() {
  resultsDiv.classList.add("hidden");
  capturedImagePreview.style.display = "none";
  cameraFeed.classList.remove("hidden");
  analyzeButton.disabled = true;
  retakeButton.classList.add("hidden");
  captureButton.classList.remove("hidden");
  cameraPermissionGuide.classList.add("hidden");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraFeed.srcObject = stream;
    currentStream = stream;
    captureButton.disabled = false;
  } catch (err) {
    stopCamera();
    cameraFeed.classList.add("hidden");
    captureButton.classList.add("hidden");

    if (
      err.name === "NotAllowedError" ||
      err.name === "PermissionDeniedError"
    ) {
      permissionDeniedMessage.classList.remove("hidden");
    } else {
      showNotification("فشل الوصول إلى الكاميرا. تأكد من أنها موصولة.", true);
    }
    cameraPermissionGuide.classList.remove("hidden");
  }
}

function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
    currentStream = null;
  }
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showNotification("هذا المتصفح لا يدعم الوصول إلى الكاميرا.", true);
    initiateCameraButton.classList.add("hidden");
  } else {
    initiateCameraButton.classList.remove("hidden");
  }
});

window.addEventListener("beforeunload", stopCamera);

initiateCameraButton.addEventListener("click", startCameraStream);

captureButton.addEventListener("click", () => {
  const context = canvas.getContext("2d");
  canvas.width = cameraFeed.videoWidth;
  canvas.height = cameraFeed.videoHeight;
  context.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (blob) {
      capturedFile = new File([blob], "captured_image.png", {
        type: "image/png",
      });
      capturedImagePreview.src = URL.createObjectURL(blob);
      capturedImagePreview.style.display = "block";
      cameraFeed.classList.add("hidden");
      stopCamera();
      captureButton.classList.add("hidden");
      retakeButton.classList.remove("hidden");
      analyzeButton.disabled = false;
    }
  }, "image/png");
});

retakeButton.addEventListener("click", () => {
  capturedFile = null;
  capturedImagePreview.style.display = "none";
  retakeButton.classList.add("hidden");
  startCameraStream();
});

analyzeButton.addEventListener("click", async () => {
  if (!capturedFile) {
    showNotification("الرجاء التقاط صورة أولاً.", true);
    return;
  }

  loadingIndicator.classList.remove("hidden");
  analyzeButton.disabled = true;
  resultsDiv.classList.add("hidden");

  const formData = new FormData();
  formData.append("file", capturedFile);

  try {
    const response = await fetch(`${BACKEND_URL}/analyze-image/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    const data = await response.json();
    analysisOutput.textContent = data.analysis_result;
    resultsDiv.classList.remove("hidden");
  } catch (error) {
    showNotification(`حدث خطأ: ${error.message}`, true);
  } finally {
    loadingIndicator.classList.add("hidden");
    analyzeButton.disabled = false;
  }
});
