/**
 * EcoTrack AI — Landing Page Lightweight Performance Engine
 */

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".landing-header");
  const navLinks = document.querySelectorAll(".landing-nav-links a");
  const trackedSections = [
    { id: "features", el: document.getElementById("features") },
    { id: "calculator", el: document.getElementById("calculator") },
    { id: "how-it-works", el: document.getElementById("how-it-works") }
  ];

  // ------------------------------------------------------------------------
  // Throttled Scroll Listener (Sticky Header & ScrollSpy)
  // ------------------------------------------------------------------------
  let isTicking = false;

  function onScroll() {
    const scrollY = window.scrollY;

    // Header shadow
    if (scrollY > 20) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }

    // ScrollSpy active link highlighting using viewport bounding rects & bottom detection
    const isAtBottom = (window.innerHeight + scrollY) >= (document.documentElement.scrollHeight - 60);
    let activeId = "";

    if (isAtBottom) {
      activeId = "how-it-works";
    } else {
      const headerHeight = header ? header.offsetHeight : 80;
      for (let i = trackedSections.length - 1; i >= 0; i--) {
        const section = trackedSections[i];
        if (section.el) {
          const rect = section.el.getBoundingClientRect();
          if (rect.top <= headerHeight + 140 && rect.bottom > headerHeight + 40) {
            activeId = section.id;
            break;
          }
        }
      }
    }

    navLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (activeId && href === `#${activeId}`) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    isTicking = false;
  }

  window.addEventListener("scroll", () => {
    if (!isTicking) {
      requestAnimationFrame(onScroll);
      isTicking = true;
    }
  }, { passive: true });

  onScroll();

  // ------------------------------------------------------------------------
  // Native Clean Anchor Scrolling
  // ------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId !== "#") {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      }
    });
  });

  const brandLink = document.querySelector(".landing-brand");
  if (brandLink) {
    brandLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ------------------------------------------------------------------------
  // Scroll Reveal Animations (Lightweight IntersectionObserver)
  // ------------------------------------------------------------------------
  const revealElements = document.querySelectorAll(".reveal-up");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -20px 0px"
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add("is-visible"));
  }

  // ------------------------------------------------------------------------
  // Login Modal Controls
  // ------------------------------------------------------------------------
  const loginModal = document.getElementById("homepageLoginModal");
  const modalCloseBtn = document.getElementById("loginModalCloseBtn");

  function openLoginModal() {
    if (loginModal) {
      loginModal.classList.add("open");
      const emailInput = document.getElementById("modalLoginEmail");
      if (emailInput) {
        setTimeout(() => emailInput.focus(), 100);
      }
    }
  }

  function closeLoginModal() {
    if (loginModal) {
      loginModal.classList.remove("open");
    }
  }

  document.querySelectorAll(".btn-open-login-modal").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openLoginModal();
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeLoginModal);
  if (loginModal) {
    loginModal.addEventListener("click", (e) => {
      if (e.target === loginModal) closeLoginModal();
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLoginModal();
  });

  function authenticateAndRedirect(name, email) {
    const userName = name || "Eco Advocate";
    const userEmail = email || "user@example.com";

    try {
      localStorage.setItem("ecotrack_current_user", JSON.stringify({
        name: userName,
        email: userEmail
      }));
    } catch (e) {
      console.error("Could not save session", e);
    }
    window.location.href = "dashboard.html";
  }

  const loginForm = document.getElementById("homepageLoginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("modalLoginEmail")?.value || "";
      const name = email ? email.split("@")[0].replace(/[._]/g, " ") : "Eco User";
      authenticateAndRedirect(name, email);
    });
  }

  const btnDemoLogin = document.getElementById("btnModalDemoLogin");
  if (btnDemoLogin) {
    btnDemoLogin.addEventListener("click", () => {
      authenticateAndRedirect("Alex Rivera", "alex.rivera@example.com");
    });
  }

  const btnGoogleLogin = document.getElementById("btnModalGoogleLogin");
  if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener("click", () => {
      const name = prompt("Enter your name for your Google EcoTrack profile:", "Suyash Borse");
      if (name) {
        const email = name.toLowerCase().replace(/\s+/g, ".") + "@gmail.com";
        authenticateAndRedirect(name, email);
      } else {
        authenticateAndRedirect("Google User", "google.user@example.com");
      }
    });
  }

  // ------------------------------------------------------------------------
  // Live Commute Carbon Estimator Math
  // ------------------------------------------------------------------------
  const modeSelect = document.getElementById("heroModeSelect");
  const distanceSlider = document.getElementById("heroDistanceSlider");
  const distanceValDisplay = document.getElementById("heroDistanceVal");
  const calculatedCo2Display = document.getElementById("heroCalculatedCo2");
  const treeEquivDisplay = document.getElementById("heroTreeEquiv");

  const EMISSION_FACTORS = {
    car_petrol: 0.21,
    car_electric: 0.05,
    public_bus: 0.089,
    metro_train: 0.035,
    cycling: 0.00
  };

  function updateHeroCalculator() {
    if (!distanceSlider || !calculatedCo2Display) return;

    const val = parseFloat(distanceSlider.value);
    const kmPerDay = isNaN(val) ? 0 : val;
    const modeKey = modeSelect ? modeSelect.value : "car_petrol";
    const factor = (modeKey in EMISSION_FACTORS) ? EMISSION_FACTORS[modeKey] : 0.21;

    // Update distance readout text
    if (distanceValDisplay) {
      distanceValDisplay.textContent = `${kmPerDay} km / day`;
    }

    // Calculate daily and monthly emissions
    const dailyKg = (kmPerDay * factor).toFixed(1);
    const monthlyKg = Math.round(kmPerDay * 22 * factor);
    const treesNeeded = Math.max(1, Math.round(monthlyKg / 1.8));

    // Update daily CO2 number
    calculatedCo2Display.textContent = dailyKg;

    // Update tree & monthly statement
    if (treeEquivDisplay) {
      if (modeKey === "cycling" || kmPerDay === 0) {
        treeEquivDisplay.textContent = `0 kg CO₂e / month — Zero-emission commute! 🎉`;
      } else {
        treeEquivDisplay.textContent = `${monthlyKg} kg CO₂e / month (needs ~${treesNeeded} mature trees to absorb)`;
      }
    }
  }

  if (distanceSlider) {
    distanceSlider.addEventListener("input", updateHeroCalculator);
    distanceSlider.addEventListener("change", updateHeroCalculator);
  }

  if (modeSelect) {
    modeSelect.addEventListener("change", updateHeroCalculator);
  }

  // Initial calculation on load
  updateHeroCalculator();
});
