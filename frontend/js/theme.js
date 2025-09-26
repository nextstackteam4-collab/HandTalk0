// frontend/js/theme.js (FINAL VERSION)

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return; // Exit if the toggle doesn't exist on the page

  const body = document.body;

  // Function to apply the saved theme on page load
  const applyTheme = () => {
    // Default to 'light' if nothing is saved
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      body.classList.add("dark-mode");
      themeToggle.checked = true;
    } else {
      body.classList.remove("dark-mode");
      themeToggle.checked = false;
    }
  };

  // Event listener for the toggle switch
  themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
      body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  });

  // Apply the theme when the page loads
  applyTheme();
});
