// frontend/js/navbar.js
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isActive = menuToggle.classList.toggle("is-active");
      mobileMenu.classList.toggle("is-open");
      document.body.style.overflow = isActive ? "hidden" : "";
    });
  }
});
