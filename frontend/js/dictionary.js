// frontend/js/dictionary.js (FINAL UNIFIED VERSION)

// This script should be included in `dictionary_search.html`
document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const dictionaryResults = document.getElementById("dictionaryResults");
  const loadingDictionary = document.getElementById("loadingDictionary");
  const noResultsDiv = document.getElementById("noResults");
  const dictionaryErrorDiv = document.getElementById("dictionaryError");
  const dictionaryErrorMessage = document.getElementById(
    "dictionaryErrorMessage"
  );
  const notification = document.getElementById("notification"); // Assuming notification div exists

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

  function showLoading() {
    if (loadingDictionary) loadingDictionary.classList.remove("hidden");
    if (dictionaryResults) dictionaryResults.classList.add("hidden");
    if (noResultsDiv) noResultsDiv.classList.add("hidden");
    if (dictionaryErrorDiv) dictionaryErrorDiv.classList.add("hidden");
  }

  function hideLoading() {
    if (loadingDictionary) loadingDictionary.classList.add("hidden");
  }

  function displayImageResults(results) {
    if (!dictionaryResults) return;
    dictionaryResults.innerHTML = "";
    if (results.length === 0) {
      if (noResultsDiv) noResultsDiv.classList.remove("hidden");
      return;
    }
    if (noResultsDiv) noResultsDiv.classList.add("hidden");
    dictionaryResults.classList.remove("hidden");

    results.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      // Use a placeholder if image fails to load
      const imageUrl =
        item.thumbnail_link || "https://via.placeholder.com/200?text=No+Image";
      card.innerHTML = `
                <a href="${imageUrl}" target="_blank" rel="noopener noreferrer">
                    <img src="${imageUrl}" alt="${item.title}" loading="lazy" 
                         onerror="this.onerror=null;this.src='https://via.placeholder.com/200?text=Image+Error';" />
                </a>
                <h3>${item.title}</h3>
            `;
      dictionaryResults.appendChild(card);
    });
  }

  async function fetchSignImages() {
    if (!searchInput) return;
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) return;

    showLoading();
    if (clearSearchBtn) clearSearchBtn.classList.remove("hidden");

    try {
      const response = await fetch(
        `${BACKEND_URL}/search-dictionary/?query=${encodeURIComponent(
          searchTerm
        )}`
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: `خطأ من الخادم برمز ${response.status}` }));
        throw new Error(errorData.detail);
      }
      const data = await response.json();
      displayImageResults(data.results);
    } catch (error) {
      console.error("Error fetching dictionary:", error);
      // FIX: Add specific check for network errors
      if (error instanceof TypeError) {
        showNotification(
          "فشل الاتصال بالخادم. تأكد من تشغيله ومن اتصالك بالشبكة.",
          true
        );
      } else {
        if (dictionaryErrorMessage)
          dictionaryErrorMessage.textContent = `فشل في البحث: ${error.message}`;
        if (dictionaryErrorDiv) dictionaryErrorDiv.classList.remove("hidden");
      }
    } finally {
      hideLoading();
    }
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      fetchSignImages();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      clearSearchBtn.classList.add("hidden");
      if (dictionaryResults) dictionaryResults.innerHTML = "";
      if (noResultsDiv) noResultsDiv.classList.add("hidden");
      if (dictionaryErrorDiv) dictionaryErrorDiv.classList.add("hidden");
      if (searchInput) searchInput.focus();
    });
  }
});
