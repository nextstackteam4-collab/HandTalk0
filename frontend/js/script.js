// frontend/js/script.js (FINAL UNIFIED VERSION)

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const imageUpload = document.getElementById("imageUpload");
  const imagePreview = document.getElementById("imagePreview");
  const fileNameDisplay = document.getElementById("fileName");
  const uploadButtonText = document.getElementById("uploadButtonText");
  const analyzeButton = document.getElementById("analyzeButton");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const resultsDiv = document.getElementById("results");
  const analysisOutput = document.getElementById("analysisOutput");
  const notification = document.getElementById("notification");

  let selectedFile = null;

  function showNotification(message, isError = false) {
    if (!notification) return;
    notification.textContent = message;
    notification.className = `notification ${
      isError ? "error" : "success"
    } show`;
    setTimeout(() => {
      notification.classList.remove("show");
    }, 4000);
  }

  function handleFileSelect(file) {
    if (!file || !file.type.startsWith("image/")) {
      showNotification("الرجاء اختيار ملف صورة صالح.", true);
      return;
    }
    selectedFile = file;
    if (fileNameDisplay)
      fileNameDisplay.textContent = `الصورة المختارة: ${file.name}`;
    if (uploadButtonText) uploadButtonText.textContent = "تغيير الصورة";

    const reader = new FileReader();
    reader.onload = (e) => {
      if (imagePreview) {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
      }
    };
    reader.readAsDataURL(file);

    if (analyzeButton) analyzeButton.disabled = false;
    if (resultsDiv) resultsDiv.classList.add("hidden");
  }

  if (imageUpload) {
    imageUpload.addEventListener("change", (event) => {
      if (event.target.files && event.target.files[0]) {
        handleFileSelect(event.target.files[0]);
      }
    });
  }

  document.addEventListener("paste", (event) => {
    if (analyzeButton && analyzeButton.disabled) return;

    const items = (event.clipboardData || window.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          event.preventDefault();
          handleFileSelect(file);
          showNotification("تم لصق الصورة بنجاح.");
          break;
        }
      }
    }
  });

  if (analyzeButton) {
    analyzeButton.addEventListener("click", async (event) => {
      event.preventDefault();

      if (!selectedFile) {
        showNotification("الرجاء اختيار صورة أولاً.", true);
        return;
      }

      if (imageUpload) imageUpload.disabled = true;
      if (resultsDiv) resultsDiv.classList.add("hidden");
      if (loadingIndicator) loadingIndicator.classList.remove("hidden");
      analyzeButton.disabled = true;

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await fetch(`${BACKEND_URL}/analyze-image/`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ detail: `خطأ من الخادم برمز ${response.status}` }));
          throw new Error(errorData.detail);
        }

        const data = await response.json();

        if (analysisOutput) {
          analysisOutput.textContent = data.analysis_result;
        }
        if (resultsDiv) resultsDiv.classList.remove("hidden");
        showNotification("تم التحليل بنجاح!", false);
      } catch (error) {
        console.error("Error during analysis:", error);
        // FIX: Add specific check for network errors
        if (error instanceof TypeError) {
          showNotification(
            "فشل الاتصال بالخادم. تأكد من تشغيله ومن اتصالك بالشبكة.",
            true
          );
        } else {
          showNotification(`حدث خطأ: ${error.message}`, true);
        }
        if (resultsDiv) resultsDiv.classList.add("hidden");
      } finally {
        if (loadingIndicator) loadingIndicator.classList.add("hidden");
        analyzeButton.disabled = false;
        if (imageUpload) imageUpload.disabled = false;
      }
    });
  }
});
