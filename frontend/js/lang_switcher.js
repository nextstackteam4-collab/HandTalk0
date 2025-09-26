// frontend/js/lang_switcher.js (FINAL VERSION with Hidden Google Translate UI)

document.addEventListener("DOMContentLoaded", () => {
  const langToggleAr = document.getElementById("langToggleAr");
  const langToggleEn = document.getElementById("langToggleEn");
  const googleTranslateElementDiv = document.getElementById(
    "google_translate_element"
  );

  // Function to set the googtrans cookie and refresh the page
  // The format is /source_lang/target_lang
  function setGTranslateCookieAndReload(targetLang) {
    const cookieValue = `/ar/${targetLang}`; // Assuming Arabic is the base language

    // Setting the googtrans cookie to trigger the translation
    document.cookie = `googtrans=${cookieValue}; path=/; expires=${new Date(
      Date.now() + 31536000000
    ).toUTCString()}`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${
      window.location.hostname
    }; expires=${new Date(Date.now() + 31536000000).toUTCString()}`;

    // Attempt to directly trigger the translation if the widget is already loaded
    const selectElement = googleTranslateElementDiv
      ? googleTranslateElementDiv.querySelector("select.goog-te-combo")
      : null;
    if (selectElement) {
      selectElement.value = targetLang;
      selectElement.dispatchEvent(new Event("change"));
      // If the translation doesn't apply instantly, a reload might still be necessary
      // or a small delay could be added before reload.
      // For now, let's keep reload for reliability, or uncomment if issues persist
      // window.location.reload();
    } else {
      // If widget not ready or select not found, force a reload to ensure it applies
      window.location.reload();
    }

    // After setting the cookie and trying to trigger, ensure the page reloads
    // as the Google Translate widget often requires a full page load to apply the language change consistently.
    // We add a small timeout before reloading to give the widget a chance to process if it's already present.
    setTimeout(() => {
      window.location.reload();
    }, 100); // Small delay before reload
  }

  // Initialize language buttons' active state based on current translation
  function initializeLanguageButtons() {
    let currentLang = "ar"; // Default to Arabic if no cookie or translation
    const googtransCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("googtrans="));
    if (googtransCookie) {
      const parts = googtransCookie.split("=")[1].split("/");
      if (parts.length > 2) {
        currentLang = parts[2]; // e.g., 'en' from '/ar/en'
      }
    }

    if (langToggleAr && langToggleEn) {
      if (currentLang === "en") {
        langToggleEn.classList.add("active-lang");
        langToggleAr.classList.remove("active-lang");
        document.documentElement.lang = "en"; // Update HTML lang attribute
        document.documentElement.dir = "ltr"; // Update HTML dir attribute
      } else {
        // 'ar'
        langToggleAr.classList.add("active-lang");
        langToggleEn.classList.remove("active-lang");
        document.documentElement.lang = "ar"; // Update HTML lang attribute
        document.documentElement.dir = "rtl"; // Update HTML dir attribute
      }
    }
  }

  // Event listeners for custom language buttons
  if (langToggleAr) {
    langToggleAr.addEventListener("click", () => {
      if (!langToggleAr.classList.contains("active-lang")) {
        setGTranslateCookieAndReload("ar");
      }
    });
  }

  if (langToggleEn) {
    langToggleEn.addEventListener("click", () => {
      if (!langToggleEn.classList.contains("active-lang")) {
        setGTranslateCookieAndReload("en");
      }
    });
  }

  // Initial setup when the DOM is loaded
  initializeLanguageButtons();

  // The Google Translate widget initialization function
  // This is called by the Google Translate script itself
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement(
      {
        pageLanguage: "ar", // Set original page language to Arabic
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false, // Important: prevent default dropdown from auto-displaying
      },
      "google_translate_element" // The ID of the hidden div
    );
    // Ensure the correct language is set when the widget itself loads
    // This is crucial for when the page loads already translated
    initializeLanguageButtons();
  };

  // Dynamically load the Google Translate script
  // This script will call window.googleTranslateElementInit()
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src =
    "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.head.appendChild(script);
});
