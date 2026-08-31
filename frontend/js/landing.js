/**
 * EcoTrack AI — Landing Page Interactive Engine
 * Handles smooth custom scroll glide, scroll reveal animations,
 * Login Window Modal lifecycle, and interactive hero carbon preview.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------------------------------------------------
  // 1. Sticky Header Dynamic Shadow on Scroll
  // ------------------------------------------------------------------------
  const header = document.querySelector(".landing-header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  }, { passive: true });

  // ------------------------------------------------------------------------
  // ------------------------------------------------------------------------
  // ------------------------------------------------------------------------
  // 2. Luxurious Quartic Ease-Out Smooth Scroll Engine (~800ms)
  // ------------------------------------------------------------------------
  let activeScrollAnimation = null;

  function smoothScrollTo(targetY, duration = 800, onComplete) {
    if (activeScrollAnimation) {
      cancelAnimationFrame(activeScrollAnimation);
      activeScrollAnimation = null;
    }

    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) {
      if (onComplete) onComplete();
      return;
    }

    let startTime = null;

    // Quartic Ease-Out: smooth natural deceleration with zero jerkiness
    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeOutQuart(progress);

      window.scrollTo(0, Math.round(startY + distance * ease));

      if (progress < 1) {
        activeScrollAnimation = requestAnimationFrame(step);
      } else {
        activeScrollAnimation = null;
        if (onComplete) onComplete();
      }
    }

    activeScrollAnimation = requestAnimationFrame(step);
  }

  // Gracefully release scroll control if user scrolls manually
  window.addEventListener("wheel", () => {
    if (activeScrollAnimation) {
      cancelAnimationFrame(activeScrollAnimation);
      activeScrollAnimation = null;
    }
  }, { passive: true });

  window.addEventListener("touchmove", () => {
    if (activeScrollAnimation) {
      cancelAnimationFrame(activeScrollAnimation);
      activeScrollAnimation = null;
    }
  }, { passive: true });

  // Smooth scroll for all navbar anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId !== "#") {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerHeight = header ? header.offsetHeight : 70;
          const targetY = Math.max(0, targetEl.getBoundingClientRect().top + window.pageYOffset - (headerHeight + 20));

          smoothScrollTo(targetY, 800, () => {
            const tag = targetEl.querySelector(".section-tag");
            if (tag) {
              tag.classList.remove("arrived");
              void tag.offsetWidth; // trigger reflow
              tag.classList.add("arrived");
            }
          });

          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      }
    });
  });

  // Smooth scroll to top when clicking the brand logo
  const brandLink = document.querySelector(".landing-brand");
  if (brandLink) {
    brandLink.addEventListener("click", (e) => {
      e.preventDefault();
      smoothScrollTo(0, 750);
    });
  }

  // ------------------------------------------------------------------------
  // ScrollSpy: Seamlessly highlight active nav link on scroll
  // ------------------------------------------------------------------------
  const navLinks = document.querySelectorAll(".landing-nav-links a");
  const trackedSections = [
    { id: "features", el: document.getElementById("features") },
    { id: "calculator", el: document.getElementById("calculator") },
    { id: "how-it-works", el: document.getElementById("how-it-works") }
  ];

  function updateActiveNavLink() {
    const scrollPos = window.scrollY + 160;
    let activeId = "";

    for (let i = trackedSections.length - 1; i >= 0; i--) {
      const section = trackedSections[i];
      if (section.el && scrollPos >= section.el.offsetTop) {
        activeId = section.id;
        break;
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
  }

  window.addEventListener("scroll", updateActiveNavLink, { passive: true });
  updateActiveNavLink();

  // ------------------------------------------------------------------------
  // 3. Scroll Reveal Animations (IntersectionObserver)
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
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: make all visible immediately
    revealElements.forEach(el => el.classList.add("is-visible"));
  }

  // ------------------------------------------------------------------------
  // 4. Login Modal Controls
  // ------------------------------------------------------------------------
  const loginModal = document.getElementById("homepageLoginModal");
  const modalCloseBtn = document.getElementById("loginModalCloseBtn");
  const loginForm = document.getElementById("homepageLoginForm");
  const btnDemoLogin = document.getElementById("btnModalDemoLogin");
  const btnGoogleLogin = document.getElementById("btnModalGoogleLogin");

  function openLoginModal() {
    if (loginModal) {
      loginModal.classList.add("open");
      const emailInput = document.getElementById("modalLoginEmail");
      if (emailInput) {
        setTimeout(() => emailInput.focus(), 150);
      }
    }
  }

  function closeLoginModal() {
    if (loginModal) {
      loginModal.classList.remove("open");
    }
  }

  // Bind all buttons that open the login modal
  document.querySelectorAll(".btn-open-login-modal").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openLoginModal();
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeLoginModal);
  }

  if (loginModal) {
    loginModal.addEventListener("click", (e) => {
      if (e.target === loginModal) closeLoginModal();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLoginModal();
  });

  // Session Helper & Redirection
  function authenticateAndRedirect(name, email) {
    const userName = name || "Eco Advocate";
    const userEmail = email || "user@example.com";

    try {
      localStorage.setItem("ecotrack_current_user", JSON.stringify({
        name: userName,
        email: userEmail
      }));

      const STORAGE_KEY = "carbon_tracker_state_v1";
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("ecotrack_state_v1");
      if (stored) {
        const state = JSON.parse(stored);
        if (state && state.user) {
          state.user.name = userName;
          state.user.email = userEmail;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          localStorage.setItem("ecotrack_state_v1", JSON.stringify(state));
        }
      }
    } catch (e) {
      console.error(e);
    }

    window.location.href = "dashboard.html";
  }

  // Handle Login Form Submit
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("modalLoginEmail").value.trim();
      const prefix = email.split("@")[0].replace(/[._-]/g, " ");
      const name = prefix.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      authenticateAndRedirect(name, email);
    });
  }

  // Demo User Sign In
  if (btnDemoLogin) {
    btnDemoLogin.addEventListener("click", () => {
      authenticateAndRedirect("Alex Rivera", "alex.rivera@example.com");
    });
  }

  // Google OAuth Simulation
  if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener("click", () => {
      const name = prompt("Enter your name for your Google profile:", "Suyash Borse");
      if (name) {
        const email = name.toLowerCase().replace(/\s+/g, ".") + "@gmail.com";
        authenticateAndRedirect(name, email);
      } else {
        window.location.href = "dashboard.html";
      }
    });
  }

  // ------------------------------------------------------------------------
  // 5. Interactive Mini Carbon Calculator with Number Bump Effect
  // ------------------------------------------------------------------------
  const distanceSlider = document.getElementById("heroDistanceSlider");
  const distanceValDisplay = document.getElementById("heroDistanceVal");
  const modeSelect = document.getElementById("heroModeSelect");
  const heroCo2Val = document.getElementById("heroCalculatedCo2");
  const heroTreeEquiv = document.getElementById("heroTreeEquiv");
  const co2Container = heroCo2Val?.closest(".preview-co2-number");

  const FACTOR_MAP = {
    car_petrol: 0.21,
    car_electric: 0.05,
    public_bus: 0.089,
    metro_train: 0.035,
    cycling: 0.0
  };

  function updateHeroCalculation() {
    if (!distanceSlider || !modeSelect || !heroCo2Val) return;
    const distance = parseFloat(distanceSlider.value) || 0;
    const factor = FACTOR_MAP[modeSelect.value] || 0.21;
    const co2Kg = distance * factor;
    
    heroCo2Val.textContent = co2Kg.toFixed(1);
    if (distanceValDisplay) {
      distanceValDisplay.textContent = `${distance} km / day`;
    }

    if (heroTreeEquiv) {
      const monthlyKg = co2Kg * 30;
      const treesNeeded = (monthlyKg / 1.8).toFixed(1);
      heroTreeEquiv.textContent = `${monthlyKg.toFixed(0)} kg CO₂e / month (needs ~${treesNeeded} mature trees to absorb)`;
    }

    // Trigger subtle number bump pulse
    if (co2Container) {
      co2Container.classList.remove("bump");
      void co2Container.offsetWidth; // trigger reflow
      co2Container.classList.add("bump");
    }
  }

  if (distanceSlider) {
    distanceSlider.addEventListener("input", updateHeroCalculation);
  }
  if (modeSelect) {
    modeSelect.addEventListener("change", updateHeroCalculation);
  }

  // Initial calculation
  updateHeroCalculation();
});
