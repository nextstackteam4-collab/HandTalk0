// frontend/js/admin.js

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const loginForm = document.getElementById("loginForm");
  const secretKeyInput = document.getElementById("secretKeyInput");
  const loginError = document.getElementById("loginError");
  const logoutButton = document.getElementById("logoutButton");
  const notification = document.getElementById("notification");

  let localDictionary = [];

  // --- UI HELPER ---
  function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.classList.toggle("bg-red-500", isError);
    notification.classList.toggle("bg-green-500", !isError);
    notification.classList.remove("opacity-0");
    notification.classList.remove("-right-full");
    notification.classList.add("right-5");

    setTimeout(() => {
      notification.classList.remove("right-5");
      notification.classList.add("-right-full");
      notification.classList.add("opacity-0");
    }, 3000);
  }

  // --- AUTHENTICATION ---
  function checkAuth() {
    const key = sessionStorage.getItem("admin_secret_key");
    if (key) {
      loginSection.classList.add("hidden");
      dashboardSection.classList.remove("hidden");
      logoutButton.classList.remove("hidden");
      fetchAdminData(key);
    } else {
      loginSection.classList.remove("hidden");
      dashboardSection.classList.add("hidden");
      logoutButton.classList.add("hidden");
    }
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const key = secretKeyInput.value.trim();
    if (!key) {
      loginError.textContent = "الرجاء إدخال مفتاح الوصول.";
      loginError.classList.remove("hidden");
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/admin/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret_key: key }),
      });
      if (response.ok) {
        sessionStorage.setItem("admin_secret_key", key);
        loginError.classList.add("hidden");
        checkAuth();
      } else {
        loginError.textContent = "مفتاح الوصول غير صحيح.";
        loginError.classList.remove("hidden");
      }
    } catch (error) {
      loginError.textContent = "فشل الاتصال بالخادم.";
      loginError.classList.remove("hidden");
    }
  });

  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("admin_secret_key");
    checkAuth();
  });

  // --- DATA FETCHING & DISPLAY ---
  async function fetchAdminData(key) {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret_key: key }),
      });
      const data = await response.json();
      document.getElementById("imagesAnalyzedStat").textContent =
        data.stats.images_analyzed || 0;
      document.getElementById("dictionarySearchesStat").textContent =
        data.stats.dictionary_searches || 0;
      document.getElementById("promptEditor").value = data.prompt;
      localDictionary = data.dictionary;
      renderDictionaryTable();
    } catch (error) {
      showNotification("فشل في تحميل بيانات الإدارة.", true);
    }
  }

  function renderDictionaryTable() {
    const container = document.getElementById("dictionaryTableContainer");
    const table = document.createElement("table");
    table.className = "w-full text-right";
    table.innerHTML = `<thead class="bg-gray-700 text-white sticky top-0"><tr><th class="p-2">الكلمة بالعربية</th><th class="p-2">الكلمة بالإنجليزية</th><th class="p-2">إجراء</th></tr></thead><tbody></tbody>`;
    const tbody = table.querySelector("tbody");
    localDictionary.forEach((item, index) => {
      tbody.insertRow().innerHTML = `<td class="p-2 border-b border-gray-600">${item.word_ar}</td><td class="p-2 border-b border-gray-600">${item.word_en}</td><td class="p-2 border-b border-gray-600"><button data-index="${index}" class="text-red-400 hover:text-red-600 delete-word">حذف</button></td>`;
    });
    container.innerHTML = "";
    container.appendChild(table);
  }

  // --- DATA UPDATING ---
  document
    .getElementById("savePromptButton")
    .addEventListener("click", async () => {
      const key = sessionStorage.getItem("admin_secret_key");
      const newPrompt = document.getElementById("promptEditor").value;
      await fetch(`${BACKEND_URL}/admin/update-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret_key: key, new_prompt: newPrompt }),
      });
      showNotification("تم تحديث التوجيه بنجاح!");
    });

  document
    .getElementById("addWordForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      localDictionary.push({
        word_ar: document.getElementById("newWordAr").value,
        word_en: document.getElementById("newWordEn").value,
        image_url: document.getElementById("newWordUrl").value,
      });
      await updateFullDictionary();
      e.target.reset();
    });

  document
    .getElementById("dictionaryTableContainer")
    .addEventListener("click", async (e) => {
      if (e.target.classList.contains("delete-word")) {
        const index = e.target.dataset.index;
        if (
          confirm(
            `هل أنت متأكد من حذف كلمة "${localDictionary[index].word_ar}"؟`
          )
        ) {
          localDictionary.splice(index, 1);
          await updateFullDictionary();
        }
      }
    });

  async function updateFullDictionary() {
    const key = sessionStorage.getItem("admin_secret_key");
    await fetch(`${BACKEND_URL}/admin/update-dictionary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret_key: key,
        new_dictionary: localDictionary,
      }),
    });
    showNotification("تم تحديث القاموس بنجاح!");
    renderDictionaryTable();
  }

  // --- INITIALIZE ---
  checkAuth();
});
