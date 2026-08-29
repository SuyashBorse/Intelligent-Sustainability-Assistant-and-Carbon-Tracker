/**
 * Intelligent Sustainability Assistant & Carbon Tracker
 * Master Application Controller & Router
 */

import { store } from "./store.js";
import { EMISSION_FACTORS, getFactorsByCategory, getFactorById } from "./emissionFactors.js";
import { calculateEmission, formatCarbonWeight } from "./calculator.js";
import { renderTrendChart, renderCategoryChart, renderAnalyticsChart } from "./charts.js";
import { evaluateAchievements } from "./gamification.js";
import { getRecommendations } from "./aiCoach.js";

// State
let currentSelectedCategory = "transportation";
let activeTrendFilter = "7d";

// ==========================================================================
// Toast Notification Utility
// ==========================================================================
export function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
  if (type === "error") {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  }

  toast.innerHTML = `
    <div style="color: ${type === 'error' ? 'var(--danger)' : 'var(--primary)'}">${iconSvg}</div>
    <div style="font-size: 0.88rem; font-weight: 500;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.25s ease";
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// Make accessible to inline handlers
if (typeof window !== "undefined") {
  // @ts-ignore
  window.showToast = showToast;
}

// ==========================================================================
// View Routing & Navigation
// ==========================================================================
function switchView(viewName) {
  const views = document.querySelectorAll(".page-view");
  views.forEach(v => v.classList.remove("active"));

  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.classList.add("active");
  }

  // Update nav links
  document.querySelectorAll(".nav-item").forEach(item => {
    if (item.getAttribute("data-view") === viewName) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Breadcrumb
  const bc = document.getElementById("breadcrumbCurrent");
  if (bc) {
    bc.textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1).replace("-", " ");
  }

  // Close mobile sidebar if open
  document.body.classList.remove("sidebar-open");

  // Re-render charts when their views become visible
  if (viewName === "dashboard") {
    setTimeout(() => {
      renderTrendChart("trendChartCanvas", activeTrendFilter);
      renderCategoryChart("categoryChartCanvas");
    }, 50);
  } else if (viewName === "analytics") {
    setTimeout(() => {
      renderAnalyticsChart("analyticsBarCanvas");
    }, 50);
  } else if (viewName === "goals") {
    updateGoalsUI();
    updateGamificationUI();
  }
}

// ==========================================================================
// Dashboard UI Updates
// ==========================================================================
function updateDashboardUI() {
  const state = store.getState();
  const aggregates = store.getAggregates();

  // Topbar stats
  const topbarStreak = document.getElementById("topbarStreakVal");
  if (topbarStreak) topbarStreak.textContent = `${state.user.streak} Days`;

  const topbarPoints = document.getElementById("topbarPointsVal");
  if (topbarPoints) topbarPoints.textContent = `${state.user.points} pts`;

  // KPI values
  const kpiToday = document.getElementById("kpiTodayVal");
  if (kpiToday) kpiToday.textContent = aggregates.todayCo2.toFixed(1);

  const kpiWeek = document.getElementById("kpiWeekVal");
  if (kpiWeek) kpiWeek.textContent = aggregates.weekCo2.toFixed(1);

  const kpiMonth = document.getElementById("kpiMonthVal");
  if (kpiMonth) kpiMonth.textContent = aggregates.monthCo2.toFixed(1);

  // Sustainability Score Gauge
  const scoreVal = document.getElementById("scoreVal");
  if (scoreVal) scoreVal.textContent = aggregates.sustainabilityScore;

  const scoreRing = document.getElementById("scoreRingProgress");
  if (scoreRing) {
    // Circumference = 2 * PI * 40 = 251.2
    const offset = 251.2 - (251.2 * aggregates.sustainabilityScore) / 100;
    scoreRing.style.strokeDashoffset = String(offset);
  }

  // Dynamic Dashboard Banner Description
  const bannerDesc = document.getElementById("dashboardBannerDesc");
  if (bannerDesc) {
    if (!state.activities || state.activities.length === 0) {
      bannerDesc.innerHTML = `Welcome to your personal carbon tracker! Start by clicking <strong>Log Emission</strong> to record your daily commute, meals, or electricity and calculate your real-time carbon footprint.`;
    } else {
      bannerDesc.innerHTML = `Your calculated footprint is <strong>14% lower</strong> than your 30-day baseline. Keep up your public transit and plant-based habits to reach your monthly goal!`;
    }
  }

  // Top Contributors List
  const contributorContainer = document.getElementById("topContributorsList");
  if (contributorContainer) {
    contributorContainer.innerHTML = aggregates.topContributors.map(item => `
      <div class="contributor-item">
        <div class="contributor-meta">
          <div class="contributor-icon" style="background: #ecfdf5; color: var(--primary);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="contributor-info">
            <h5>${item.activity}</h5>
            <p>${item.percentage}% of overall emissions</p>
          </div>
        </div>
        <div class="contributor-val">
          <div class="val">${item.co2eKg} kg</div>
          <div class="share">estimated CO₂e</div>
        </div>
      </div>
    `).join("") || `<p class="form-hint" style="padding: 1rem;">No activities logged yet.</p>`;
  }

  // Active Goals (Dashboard & Goals View)
  updateGoalsUI();


  // Recent Activity Table (in Dashboard and Activities view)
  const recentTables = [document.getElementById("dashboardRecentTableBody"), document.getElementById("activitiesFullTableBody")];
  recentTables.forEach(tbody => {
    if (!tbody) return;
    tbody.innerHTML = state.activities.slice(0, 10).map(act => `
      <tr>
        <td><strong>${act.date}</strong></td>
        <td><span class="badge badge-${act.category}">${act.category}</span></td>
        <td>${act.activityType}</td>
        <td>${act.quantity} ${act.unit}</td>
        <td><strong style="color: var(--text-main);">${act.co2eKg} kg</strong></td>
        <td>
          <button class="btn btn-ghost btn-sm btn-delete-act" data-id="${act.id}" title="Delete Activity" style="color: var(--danger);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No activities logged yet.</td></tr>`;
  });

  // Attach delete handlers
  document.querySelectorAll(".btn-delete-act").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.getAttribute("data-id");
      if (id) {
        store.deleteActivity(id);
        showToast("Activity deleted successfully.", "info");
      }
    });
  });

  // Gamification Page Updates
  updateGamificationUI();
}

// ==========================================================================
// Gamification UI Updates
// ==========================================================================
function updateGamificationUI() {
  const state = store.getState();

  const heroStreak = document.getElementById("heroStreakCount");
  if (heroStreak) heroStreak.innerHTML = `${state.user.streak} <span>🔥</span>`;

  const heroPoints = document.getElementById("heroPointsCount");
  if (heroPoints) heroPoints.textContent = state.user.points;

  // Challenges grid
  const challengesGrid = document.getElementById("challengesGrid");
  if (challengesGrid) {
    challengesGrid.innerHTML = state.challenges.map(c => `
      <div class="challenge-card ${c.completed ? 'completed' : ''}">
        <div>
          <div class="challenge-top">
            <span class="badge badge-${c.category}">${c.category}</span>
            <span class="challenge-points-chip">+${c.points} pts</span>
          </div>
          <h4 style="margin: 0.75rem 0 0.25rem;">${c.title}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted);">${c.description}</p>
        </div>
        
        <div>
          <div class="progress-track" style="margin: 0.5rem 0;">
            <div class="progress-bar-fill" style="width: ${(c.progress / c.target) * 100}%"></div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.78rem;">
            <span>Progress: ${c.progress} / ${c.target}</span>
            <span class="badge badge-${c.difficulty}">${c.difficulty}</span>
          </div>
          ${c.completed 
            ? `<button class="btn btn-secondary btn-sm btn-block" disabled style="color: var(--primary); font-weight: 700;">✓ Completed (+${c.points} pts)</button>`
            : `<button class="btn btn-primary btn-sm btn-block btn-claim-challenge" data-id="${c.id}">Complete Challenge</button>`
          }
        </div>
      </div>
    `).join("");

    document.querySelectorAll(".btn-claim-challenge").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (id) {
          const finished = store.completeChallenge(id);
          if (finished) {
            showToast(`🎉 Challenge completed! +${finished.points} points awarded!`, "success");
            evaluateAchievements();
          }
        }
      });
    });
  }

  // Badges grid
  const badgesGrid = document.getElementById("badgesGrid");
  if (badgesGrid) {
    badgesGrid.innerHTML = state.achievements.map(b => `
      <div class="badge-card ${b.unlocked ? 'unlocked' : 'locked'}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.name}</div>
        <div class="badge-desc">${b.description}</div>
        <div style="margin-top: 0.75rem; font-size: 0.75rem; font-weight: 700; color: ${b.unlocked ? 'var(--primary)' : 'var(--text-subtle)'};">
          ${b.unlocked ? `Unlocked (${b.unlockedAt})` : 'Locked'}
        </div>
      </div>
    `).join("");
  }
}

// ==========================================================================
// Goal Management (Not Started, In Progress, Completed) & Progress Engine
// ==========================================================================
let activeGoalFilter = "all";

function getGoalStatusBadge(status, progress) {
  if (status === "completed" || progress >= 100) {
    return `<span class="badge badge-completed">✓ Completed</span>`;
  }
  if (status === "not_started" || progress === 0) {
    return `<span class="badge badge-not-started">Not Started</span>`;
  }
  return `<span class="badge badge-in-progress">In Progress (${progress}%)</span>`;
}

function renderGoalCardHtml(g) {
  const isCompleted = g.status === "completed" || g.currentProgressPercent >= 100;
  const isNotStarted = g.status === "not_started" || g.currentProgressPercent === 0;

  return `
    <div class="goal-card-item status-${g.status}">
      <div class="goal-header-row">
        <div>
          <div class="goal-title">${g.title}</div>
          <div class="goal-desc">${g.description}</div>
        </div>
        <div class="goal-meta-badges">
          ${getGoalStatusBadge(g.status, g.currentProgressPercent)}
        </div>
      </div>

      <div class="progress-track">
        <div class="progress-bar-fill" style="width: ${g.currentProgressPercent}%"></div>
      </div>

      <div class="goal-footer">
        <div class="goal-stats-group">
          <span>Target: <strong>${g.targetCo2eReductionKg} kg CO₂e</strong></span>
          <span>•</span>
          <span>Due: <strong>${g.targetDate}</strong></span>
          <span>•</span>
          <strong style="color: ${isCompleted ? 'var(--primary)' : isNotStarted ? 'var(--text-muted)' : 'var(--info)'};">
            ${g.currentProgressPercent}% Achieved
          </strong>
        </div>

        <div>
          ${isCompleted 
            ? `<span class="badge badge-completed" style="font-size: 0.78rem; padding: 0.35rem 0.75rem;">🎉 Target Achieved (+100 pts)</span>`
            : isNotStarted
            ? `<button class="btn btn-secondary btn-sm btn-open-goal-progress" data-id="${g.id}">+ Start & Add Progress</button>`
            : `<button class="btn btn-primary btn-sm btn-open-goal-progress" data-id="${g.id}">+ Add Progress</button>`
          }
        </div>
      </div>
    </div>
  `;
}

function updateGoalsUI() {
  const state = store.getState();
  const goals = state.goals || [];

  // Update counts in filter tabs
  const countAll = document.getElementById("countGoalAll");
  const countInProg = document.getElementById("countGoalInProgress");
  const countNotStarted = document.getElementById("countGoalNotStarted");
  const countComp = document.getElementById("countGoalCompleted");

  if (countAll) countAll.textContent = String(goals.length);
  if (countInProg) countInProg.textContent = String(goals.filter(g => g.status === "in_progress").length);
  if (countNotStarted) countNotStarted.textContent = String(goals.filter(g => g.status === "not_started").length);
  if (countComp) countComp.textContent = String(goals.filter(g => g.status === "completed").length);

  // Render in Dashboard
  const dashboardContainer = document.getElementById("activeGoalsList");
  if (dashboardContainer) {
    const emptyDashboardGoalsHtml = `
      <div style="padding: 2.25rem 1.5rem; text-align: center; background: #f8fafc; border-radius: var(--radius-md); border: 1.5px dashed var(--border); margin: 0.5rem 0;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎯</div>
        <h4 style="font-size: 0.95rem; margin-bottom: 0.25rem; color: var(--text-main);">No active reduction goals yet</h4>
        <p style="font-size: 0.84rem; color: var(--text-muted); max-width: 380px; margin: 0 auto 1.25rem;">
          Start your personal sustainability roadmap! Head to AI Coach to adopt customized reduction targets.
        </p>
        <button type="button" class="btn btn-secondary btn-sm" onclick="switchView('ai-coach')">
          ⚡ Explore AI Coach Goals
        </button>
      </div>
    `;
    dashboardContainer.innerHTML = goals.length > 0 ? goals.map(renderGoalCardHtml).join("") : emptyDashboardGoalsHtml;
  }

  // Render in Goals & Gamification View (Filtered)
  const goalsViewContainer = document.getElementById("viewGoalsContainer");
  if (goalsViewContainer) {
    const filteredGoals = goals.filter(g => {
      if (activeGoalFilter === "all") return true;
      return g.status === activeGoalFilter;
    });

    const emptyFilteredGoalsHtml = `
      <div style="padding: 3rem 1.5rem; text-align: center; background: #f8fafc; border-radius: var(--radius-md); border: 1.5px dashed var(--border);">
        <div style="font-size: 2.25rem; margin-bottom: 0.5rem;">🎯</div>
        <h4 style="font-size: 1rem; margin-bottom: 0.35rem; color: var(--text-main);">No reduction goals ${activeGoalFilter === 'all' ? 'created yet' : 'in this filter'}</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 400px; margin: 0 auto 1.25rem;">
          Adopt reduction milestones recommended by your AI Coach to monitor your personal decarbonization progress.
        </p>
        <button type="button" class="btn btn-primary btn-sm" onclick="switchView('ai-coach')">
          ⚡ Adopt Goals from AI Coach
        </button>
      </div>
    `;

    goalsViewContainer.innerHTML = filteredGoals.length > 0 ? filteredGoals.map(renderGoalCardHtml).join("") : emptyFilteredGoalsHtml;
  }

  // Bind "+ Add Progress" buttons
  document.querySelectorAll(".btn-open-goal-progress").forEach(btn => {
    btn.addEventListener("click", () => {
      const goalId = btn.getAttribute("data-id");
      if (goalId) openGoalProgressModal(goalId);
    });
  });
}

function openGoalProgressModal(goalId) {
  const state = store.getState();
  const goal = state.goals.find(g => g.id === goalId);
  if (!goal) return;

  const modal = document.getElementById("goalProgressModal");
  if (!modal) return;

  const targetIdInput = document.getElementById("goalModalTargetId");
  const titleEl = document.getElementById("goalModalGoalTitle");
  const descEl = document.getElementById("goalModalGoalDesc");
  const targetKgEl = document.getElementById("goalModalTargetKg");
  const curPctEl = document.getElementById("goalModalCurrentPct");
  const statusBadge = document.getElementById("goalModalStatusBadge");
  const incInput = document.getElementById("goalIncrementInput");

  if (targetIdInput) targetIdInput.value = goal.id;
  if (titleEl) titleEl.textContent = goal.title;
  if (descEl) descEl.textContent = goal.description;
  if (targetKgEl) targetKgEl.textContent = `${goal.targetCo2eReductionKg} kg`;
  if (curPctEl) curPctEl.textContent = `${goal.currentProgressPercent}%`;

  if (statusBadge) {
    statusBadge.className = `badge badge-${goal.status.replace("_", "-")}`;
    statusBadge.textContent = goal.status === "completed" ? "Completed" : goal.status === "not_started" ? "Not Started" : "In Progress";
  }

  const defaultInc = goal.currentProgressPercent === 0 ? 25 : 15;
  if (incInput) incInput.value = String(defaultInc);

  updateGoalModalPreview(goal.currentProgressPercent, defaultInc);

  modal.classList.add("open");
}

function closeGoalProgressModal() {
  const modal = document.getElementById("goalProgressModal");
  if (modal) modal.classList.remove("open");
}

function updateGoalModalPreview(currentPct, increment) {
  const newPct = Math.min(100, Math.max(0, Number(currentPct) + Number(increment)));
  const previewBar = document.getElementById("goalModalPreviewBar");
  const projectedText = document.getElementById("goalModalProjectedPct");
  if (previewBar) previewBar.style.width = `${newPct}%`;
  if (projectedText) {
    projectedText.textContent = `New: ${newPct}% ${newPct >= 100 ? '(Goal Complete! 🎯)' : ''}`;
    projectedText.style.color = newPct >= 100 ? 'var(--primary)' : 'var(--info)';
  }
}

function setupGoalProgressModal() {
  const modal = document.getElementById("goalProgressModal");
  const closeBtn = document.getElementById("goalModalCloseBtn");
  const cancelBtn = document.getElementById("goalModalCancelBtn");
  const form = document.getElementById("goalProgressForm");
  const incInput = document.getElementById("goalIncrementInput");
  const fillHundredBtn = document.getElementById("btnFillToHundred");

  if (closeBtn) closeBtn.addEventListener("click", closeGoalProgressModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeGoalProgressModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeGoalProgressModal();
    });
  }

  // Quick Chips
  document.querySelectorAll(".chip-btn[data-inc]").forEach(chip => {
    chip.addEventListener("click", () => {
      const inc = parseInt(chip.getAttribute("data-inc"), 10);
      if (incInput && !isNaN(inc)) {
        incInput.value = String(inc);
        const goalId = document.getElementById("goalModalTargetId").value;
        const goal = store.getState().goals.find(g => g.id === goalId);
        if (goal) updateGoalModalPreview(goal.currentProgressPercent, inc);
      }
    });
  });

  if (fillHundredBtn) {
    fillHundredBtn.addEventListener("click", () => {
      const goalId = document.getElementById("goalModalTargetId").value;
      const goal = store.getState().goals.find(g => g.id === goalId);
      if (goal && incInput) {
        const remaining = Math.max(0, 100 - goal.currentProgressPercent);
        incInput.value = String(remaining);
        updateGoalModalPreview(goal.currentProgressPercent, remaining);
      }
    });
  }

  if (incInput) {
    incInput.addEventListener("input", () => {
      const goalId = document.getElementById("goalModalTargetId").value;
      const goal = store.getState().goals.find(g => g.id === goalId);
      const inc = parseFloat(incInput.value) || 0;
      if (goal) updateGoalModalPreview(goal.currentProgressPercent, inc);
    });
  }

  // Form Submit
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const goalId = document.getElementById("goalModalTargetId").value;
      const increment = parseFloat(incInput.value) || 0;

      if (increment <= 0) {
        showToast("Please enter a positive progress percentage.", "error");
        return;
      }

      const res = store.addGoalProgress(goalId, increment);
      if (res) {
        if (res.newlyCompleted) {
          showToast(`🎉 Congratulations! Goal "${res.goal.title}" reached 100%! +100 eco-points awarded!`, "success");
          evaluateAchievements();
        } else {
          showToast(`Progress logged! "${res.goal.title}" is now at ${res.goal.currentProgressPercent}%.`, "success");
        }
        closeGoalProgressModal();
      }
    });
  }

  // Filter Buttons
  document.querySelectorAll(".goal-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".goal-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeGoalFilter = btn.getAttribute("data-goal-filter") || "all";
      updateGoalsUI();
    });
  });
}

// ==========================================================================
// User Profile Management & Reactive Personal Identity
// ==========================================================================
function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function updateUserProfileUI() {
  const state = store.getState();
  const user = state.user || {};
  const name = user.name || "Eco Advocate";
  const email = user.email || "user@example.com";
  const initials = getInitials(name);
  const firstName = name.split(" ")[0];
  const level = Math.min(10, Math.floor((user.points || 0) / 100) + 1);

  // Sidebar user footer
  const sbAvatar = document.getElementById("sidebarUserAvatar");
  const sbName = document.getElementById("sidebarUserName");
  const sbRole = document.getElementById("sidebarUserRole");
  if (sbAvatar) sbAvatar.textContent = initials;
  if (sbName) sbName.textContent = name;
  if (sbRole) sbRole.textContent = `Eco Advocate • Lvl ${level}`;

  // Dashboard greeting
  const dashGreeting = document.getElementById("dashboardGreeting");
  if (dashGreeting) dashGreeting.textContent = `Welcome back, ${firstName} 🌱`;

  // Profile view card
  const profAvatar = document.getElementById("profileCardAvatar");
  const profName = document.getElementById("profileCardName");
  const profEmail = document.getElementById("profileCardEmail");
  const profRole = document.getElementById("profileCardRole");
  if (profAvatar) profAvatar.textContent = initials;
  if (profName) profName.textContent = name;
  if (profEmail) profEmail.textContent = email;
  if (profRole) profRole.textContent = `Eco Advocate • Lvl ${level}`;

  // Profile form inputs
  const nameInput = document.getElementById("profileNameInput");
  const emailInput = document.getElementById("profileEmailInput");
  const countrySelect = document.getElementById("profileCountrySelect");
  const unitSelect = document.getElementById("profileUnitSelect");
  const targetSelect = document.getElementById("profileTargetSelect");

  if (nameInput && !nameInput.matches(":focus")) nameInput.value = name;
  if (emailInput && !emailInput.matches(":focus")) emailInput.value = email;
  if (countrySelect && user.country) countrySelect.value = user.country;
  if (unitSelect) unitSelect.value = user.preferredUnit || "kg";
  if (targetSelect && user.reductionTarget) targetSelect.value = String(user.reductionTarget);

  // Demo Notice Banner (Shown only when using demo user)
  const demoBanner = document.getElementById("demoBanner");
  if (demoBanner) {
    if (name === "Alex Rivera" && !localStorage.getItem("dismissed_demo_banner")) {
      demoBanner.style.display = "flex";
    } else {
      demoBanner.style.display = "none";
    }
  }
}

function openNewProfileModal() {
  const modal = document.getElementById("newProfileModal");
  if (modal) {
    const user = store.getState().user || {};
    const nameInput = document.getElementById("createUserName");
    const emailInput = document.getElementById("createUserEmail");
    if (nameInput) nameInput.value = user.name === "Alex Rivera" ? "" : (user.name || "");
    if (emailInput) emailInput.value = user.email === "alex.rivera@example.com" ? "" : (user.email || "");
    modal.classList.add("open");
  }
}

function closeNewProfileModal() {
  const modal = document.getElementById("newProfileModal");
  if (modal) modal.classList.remove("open");
}

function setupProfileHandlers() {
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("profileNameInput").value.trim();
      const email = document.getElementById("profileEmailInput").value.trim();
      const country = document.getElementById("profileCountrySelect").value;
      const preferredUnit = document.getElementById("profileUnitSelect").value;
      const reductionTarget = parseInt(document.getElementById("profileTargetSelect").value, 10) || 20;

      store.updateProfile({ name, email, country, preferredUnit, reductionTarget });
      showToast(`Profile updated! Welcome, ${name}.`, "success");
      updateUserProfileUI();
      updateDashboardUI();
    });
  }

  const openNewProfileBtn = document.getElementById("btnOpenNewProfileModal");
  const closeNewProfileBtn = document.getElementById("newProfileCloseBtn");
  const cancelNewProfileBtn = document.getElementById("newProfileCancelBtn");
  const newProfileModal = document.getElementById("newProfileModal");
  const newProfileForm = document.getElementById("newProfileForm");
  const btnBannerCreate = document.getElementById("btnBannerCreateProfile");
  const btnDismissBanner = document.getElementById("btnDismissDemoBanner");

  if (btnBannerCreate) btnBannerCreate.addEventListener("click", openNewProfileModal);
  if (btnDismissBanner) {
    btnDismissBanner.addEventListener("click", () => {
      localStorage.setItem("dismissed_demo_banner", "true");
      const demoBanner = document.getElementById("demoBanner");
      if (demoBanner) demoBanner.style.display = "none";
    });
  }

  if (openNewProfileBtn) openNewProfileBtn.addEventListener("click", openNewProfileModal);
  if (closeNewProfileBtn) closeNewProfileBtn.addEventListener("click", closeNewProfileModal);
  if (cancelNewProfileBtn) cancelNewProfileBtn.addEventListener("click", closeNewProfileModal);

  if (newProfileModal) {
    newProfileModal.addEventListener("click", (e) => {
      if (e.target === newProfileModal) closeNewProfileModal();
    });
  }

  if (newProfileForm) {
    newProfileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("createUserName").value.trim();
      const email = document.getElementById("createUserEmail").value.trim();
      const country = document.getElementById("createUserCountry").value;

      store.createNewUserProfile({
        name,
        email,
        country
      });

      closeNewProfileModal();
      showToast(`🎉 Welcome to EcoTrack, ${name}! Your fresh profile is ready.`, "success");
      updateUserProfileUI();
      updateDashboardUI();
      switchView("dashboard");
    });
  }

  const clearActivitiesBtn = document.getElementById("btnClearActivitiesBtn");
  if (clearActivitiesBtn) {
    clearActivitiesBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all logged activities and start tracking fresh?")) {
        store.clearActivities();
        showToast("Activity history cleared. Ready for your personal tracking!", "info");
        updateDashboardUI();
      }
    });
  }
}

// ==========================================================================
// Activity Logging Modal & Dynamic Factor Picker
// ==========================================================================
function setupActivityForm() {
  const categoryButtons = document.querySelectorAll(".cat-pill-btn");
  const activitySelect = document.getElementById("activitySelect");
  const quantityInput = document.getElementById("quantityInput");
  const unitLabel = document.getElementById("unitLabel");
  const previewValue = document.getElementById("calcPreviewVal");
  const previewFormula = document.getElementById("calcPreviewFormula");
  const factorSourceTag = document.getElementById("calcFactorTag");

  function populateActivityOptions(category) {
    currentSelectedCategory = category;
    const factors = getFactorsByCategory(category);

    activitySelect.innerHTML = factors.map(f => `
      <option value="${f.id}" data-unit="${f.unit}">${f.activityType} (${f.emissionFactor} kg CO₂e/${f.unit})</option>
    `).join("");

    updateCalculationPreview();
  }

  function updateCalculationPreview() {
    const factorId = activitySelect.value;
    const factor = getFactorById(factorId);
    if (!factor) return;

    if (unitLabel) unitLabel.textContent = factor.unit;

    const qty = parseFloat(quantityInput.value) || 0;
    const result = calculateEmission(factorId, qty > 0 ? qty : 1);

    if (previewValue) {
      previewValue.textContent = qty > 0 ? `${result.co2eKg} kg CO₂e` : "0.00 kg CO₂e";
    }

    if (previewFormula) {
      previewFormula.textContent = qty > 0 ? result.formulaText : `Formula: quantity × ${factor.emissionFactor} kg CO₂e/${factor.unit}`;
    }

    if (factorSourceTag) {
      factorSourceTag.innerHTML = `<strong>Source:</strong> ${factor.source}<br><strong>Region:</strong> ${factor.region}`;
    }
  }

  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      const cat = btn.getAttribute("data-category");
      populateActivityOptions(cat);
    });
  });

  if (activitySelect) {
    activitySelect.addEventListener("change", updateCalculationPreview);
  }

  if (quantityInput) {
    quantityInput.addEventListener("input", updateCalculationPreview);
  }

  // Initial population
  populateActivityOptions("transportation");

  // Form submission
  const form = document.getElementById("logActivityForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const factorId = activitySelect.value;
      const quantity = parseFloat(quantityInput.value);
      const date = document.getElementById("activityDateInput").value;
      const notes = document.getElementById("activityNotesInput").value;

      if (!quantity || quantity <= 0) {
        showToast("Please enter a valid quantity greater than 0.", "error");
        return;
      }

      try {
        store.logActivity({ factorId, quantity, date, notes });
        showToast("Activity logged! +5 points awarded.", "success");
        closeActivityModal();
        form.reset();
        populateActivityOptions("transportation");
        evaluateAchievements();
      } catch (err) {
        showToast(err.message || "Failed to save activity", "error");
      }
    });
  }
}

// Modal Toggle
export function openActivityModal() {
  const modal = document.getElementById("logActivityModal");
  if (modal) modal.classList.add("open");
  const dateInput = document.getElementById("activityDateInput");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
}

export function closeActivityModal() {
  const modal = document.getElementById("logActivityModal");
  if (modal) modal.classList.remove("open");
}

// ==========================================================================
// AI Sustainability Coach UI
// ==========================================================================
async function loadAICoachRecommendations(promptTopic = null) {
  const deck = document.getElementById("aiRecommendationsDeck");
  const summaryBox = document.getElementById("aiSummaryBox");
  if (!deck) return;

  deck.innerHTML = `
    <div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
      <div style="font-size: 1.5rem; margin-bottom: 0.5rem; animation: spin 1s linear infinite;">⏳</div>
      <strong>Analyzing your carbon history with Gemini...</strong>
    </div>
  `;

  try {
    const data = await getRecommendations(promptTopic);
    
    if (summaryBox) {
      summaryBox.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
          <span style="font-size: 1.5rem;">🤖</span>
          <div>
            <strong>AI Coach Summary:</strong>
            <p style="margin-top: 0.25rem; font-size: 0.92rem; color: var(--text-secondary);">${data.summary}</p>
          </div>
        </div>
      `;
    }

    const activeGoals = store.getState().goals || [];

    deck.innerHTML = data.recommendations.map((rec, index) => {
      const isAlreadyAdopted = activeGoals.some(
        g => g.title.toLowerCase().trim() === rec.title.toLowerCase().trim()
      );

      return `
        <div class="rec-card">
          <div class="rec-card-top">
            <div>
              <div class="rec-title">${rec.title}</div>
              <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span class="badge badge-${rec.category}">${rec.category}</span>
                <span class="badge badge-${rec.difficulty}">${rec.difficulty}</span>
                <span class="badge" style="background: #f1f5f9; color: #475569;">Priority: ${rec.priority}</span>
              </div>
              <div class="rec-reason">${rec.reason}</div>
            </div>
          </div>

          <div class="rec-action-box">
            <strong>Recommended Action:</strong> ${rec.action}
          </div>

          <div class="rec-footer">
            <div class="rec-impact-pill">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Estimated ~${rec.estimated_impact_kg_co2_per_month} kg CO₂e saved / month
            </div>
            <button class="btn ${isAlreadyAdopted ? 'btn-secondary adopted' : 'btn-primary'} btn-sm btn-adopt-goal" data-rec-index="${index}" ${isAlreadyAdopted ? 'disabled style="opacity: 0.8; cursor: default;"' : ''}>
              ${isAlreadyAdopted ? '✓ Already in Goals' : '+ Adopt as Goal'}
            </button>
          </div>
        </div>
      `;
    }).join("");

    document.querySelectorAll(".btn-adopt-goal:not([disabled])").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-rec-index"), 10);
        const rec = data.recommendations[idx];
        if (!rec) return;

        const res = store.addGoal({
          title: rec.title,
          description: rec.action,
          targetCo2eReductionKg: rec.estimated_impact_kg_co2_per_month,
          category: rec.category
        });

        if (res.success) {
          btn.classList.remove("btn-primary");
          btn.classList.add("btn-secondary", "adopted");
          btn.disabled = true;
          btn.style.opacity = "0.8";
          btn.style.cursor = "default";
          btn.textContent = "✓ Goal Adopted";

          showToast(`🎯 Adopted "${rec.title}"! Added to your Goals as "Not Started".`, "success");
          updateGoalsUI();
        } else if (res.reason === "already_exists") {
          showToast(`Goal "${rec.title}" is already in your goals list!`, "info");
        }
      });
    });

  } catch (err) {
    deck.innerHTML = `
      <div style="padding: 2rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-md); color: var(--danger);">
        <strong>Failed to load recommendations:</strong> ${err.message}
        <br><button class="btn btn-secondary btn-sm" style="margin-top: 1rem;" id="retryAiBtn">Retry</button>
      </div>
    `;
    const retryBtn = document.getElementById("retryAiBtn");
    if (retryBtn) retryBtn.addEventListener("click", () => loadAICoachRecommendations());
  }
}

// ==========================================================================
// Responsive & Smooth Sidebar Management
// ==========================================================================
function initSidebarControls() {
  const toggleBtn = document.getElementById("sidebarToggleBtn");
  const collapseBtn = document.getElementById("sidebarCollapseBtn");
  const backdrop = document.getElementById("sidebarBackdrop");

  // Restore desktop preference
  const isCollapsed = localStorage.getItem("sidebar_collapsed") === "true";
  if (isCollapsed && window.innerWidth > 1024) {
    document.body.classList.add("sidebar-collapsed");
  }

  function toggleSidebar() {
    if (window.innerWidth <= 1024) {
      // Mobile / Tablet overlay mode
      document.body.classList.toggle("sidebar-open");
    } else {
      // Desktop collapse mode
      document.body.classList.toggle("sidebar-collapsed");
      const collapsed = document.body.classList.contains("sidebar-collapsed");
      localStorage.setItem("sidebar_collapsed", String(collapsed));
    }

    // Smoothly re-adjust Chart.js canvas once animation completes
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 360);
  }

  function closeMobileSidebar() {
    document.body.classList.remove("sidebar-open");
  }

  if (toggleBtn) toggleBtn.addEventListener("click", toggleSidebar);
  if (collapseBtn) collapseBtn.addEventListener("click", toggleSidebar);
  if (backdrop) backdrop.addEventListener("click", closeMobileSidebar);

  // Close with Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileSidebar();
      closeActivityModal();
      closeGoalProgressModal();
      closeNewProfileModal();
    }
  });

  // Auto-close on mobile when clicking nav items
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 1024) {
        closeMobileSidebar();
      }
    });
  });
}

// ==========================================================================
// Initialization & Global Event Listeners
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Initialize responsive sidebar
  initSidebarControls();

  // Navigation
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      if (view) switchView(view);
    });
  });

  // Quick Action Buttons
  document.querySelectorAll(".btn-open-log-modal").forEach(btn => {
    btn.addEventListener("click", openActivityModal);
  });

  const modalCloseBtn = document.getElementById("modalCloseBtn");
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeActivityModal);

  const modalOverlay = document.getElementById("logActivityModal");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeActivityModal();
    });
  }

  // Trend Filter Buttons
  document.querySelectorAll(".chart-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".chart-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeTrendFilter = btn.getAttribute("data-filter") || "7d";
      renderTrendChart("trendChartCanvas", activeTrendFilter);
    });
  });

  // AI Prompt Chips
  document.querySelectorAll(".prompt-chip-btn").forEach(chip => {
    chip.addEventListener("click", () => {
      const prompt = chip.getAttribute("data-topic");
      loadAICoachRecommendations(prompt);
    });
  });

  const generateAiBtn = document.getElementById("generateAiBtn");
  if (generateAiBtn) {
    generateAiBtn.addEventListener("click", () => loadAICoachRecommendations());
  }

  // Handle Logout
  document.querySelectorAll(".btn-logout").forEach(btn => {
    btn.addEventListener("click", () => {
      showToast("Logging out...", "info");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 500);
    });
  });

  // Setup forms & first render
  setupActivityForm();
  setupGoalProgressModal();
  setupProfileHandlers();
  updateUserProfileUI();
  updateDashboardUI();
  renderTrendChart("trendChartCanvas", "7d");
  renderCategoryChart("categoryChartCanvas");
  loadAICoachRecommendations();

  // Delegated click handler for Goal Progress Buttons
  document.addEventListener("click", (e) => {
    const goalBtn = e.target.closest(".btn-open-goal-progress");
    if (goalBtn) {
      e.preventDefault();
      const goalId = goalBtn.getAttribute("data-id");
      if (goalId) openGoalProgressModal(goalId);
    }
  });

  // Export to window for global access
  window.switchView = switchView;
  window.openGoalProgressModal = openGoalProgressModal;
  window.closeGoalProgressModal = closeGoalProgressModal;
  window.openNewProfileModal = openNewProfileModal;
  window.closeNewProfileModal = closeNewProfileModal;

  // Listen to store updates
  window.addEventListener("carbon_state_changed", () => {
    updateUserProfileUI();
    updateDashboardUI();
    renderTrendChart("trendChartCanvas", activeTrendFilter);
    renderCategoryChart("categoryChartCanvas");
    const analyticsCanvas = document.getElementById("analyticsBarCanvas");
    if (analyticsCanvas && analyticsCanvas.offsetParent !== null) {
      renderAnalyticsChart("analyticsBarCanvas");
    }
  });
});

