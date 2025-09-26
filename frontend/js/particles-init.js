// frontend/js/particles-init.js
document.addEventListener("DOMContentLoaded", async () => {
  const isDarkMode = document.body.classList.contains("dark-mode");
  const particleColor = isDarkMode ? "#475569" : "#cbd5e1"; // Slate-600 for dark, Slate-300 for light
  const linkColor = isDarkMode ? "#334155" : "#e2e8f0"; // Slate-700 for dark, Slate-200 for light

  await tsParticles.load("particles-js", {
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab",
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 0.8,
          },
        },
      },
    },
    particles: {
      color: {
        value: particleColor,
      },
      links: {
        color: linkColor,
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      collisions: {
        enable: false,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.2,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 4 },
      },
    },
    detectRetina: true,
    background: {
      color: "transparent",
    },
  });
});