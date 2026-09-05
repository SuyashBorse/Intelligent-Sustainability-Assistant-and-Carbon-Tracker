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
// Animation Engine & Visual Motion Utilities
// ==========================================================================

/**
 * Universal high-performance number animator with cubic-bezier ease-out interpolation
 */
export function animateValue(element, start, end, duration = 650, formatter = v => String(Math.round(v))) {
  if (!element) return;
  const startNum = Number(start) || 0;
  const endNum = Number(end) || 0;
  if (startNum === endNum) {
    element.textContent = formatter(endNum);
    return;
  }

  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // easeOutCubic: fast responsive start, silky smooth deceleration
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = startNum + (endNum - startNum) * ease;
    element.textContent = formatter(current);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = formatter(endNum);
    }
  }

  requestAnimationFrame(step);
}

/**
 * Smooth modal exit animation helper
 */
export function closeModalSmooth(modalEl, callback) {
  if (!modalEl) return;
  modalEl.classList.add("modal-closing");
  setTimeout(() => {
    modalEl.classList.remove("open");
    modalEl.classList.remove("modal-closing");
    if (typeof callback === "function") callback();
  }, 240);
}

/**
 * Zero-dependency celebration confetti burst engine on canvas
 */
export function launchConfetti(originX = null, originY = null) {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const startX = originX !== null ? originX : canvas.width / 2;
  const startY = originY !== null ? originY : canvas.height * 0.4;

  const colors = ["#10b981", "#059669", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
  const particles = [];
  const count = 70;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const velocity = 6 + Math.random() * 8;
    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - 3,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 14,
      gravity: 0.22,
      opacity: 1,
      shape: Math.random() > 0.4 ? "rect" : "circle"
    });
  }

  let animationFrameId;
  const startTime = performance.now();

  function renderFrame(now) {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeCount = 0;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.985;
      p.rotation += p.vRot;
      p.opacity = Math.max(0, 1 - elapsed / 1800);

      if (p.opacity > 0 && p.y < canvas.height + 20) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    });

    if (activeCount > 0 && elapsed < 2000) {
      animationFrameId = requestAnimationFrame(renderFrame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrameId);
    }
  }

  animationFrameId = requestAnimationFrame(renderFrame);
}

/**
 * Spawns a delightful floating step bubble (+1 Step) over the clicked button
 */
export function spawnFloatingStepBubble(anchorEl, text = "+1 Step") {
  if (!anchorEl) return;
  const rect = anchorEl.getBoundingClientRect();
  const bubble = document.createElement("div");
  bubble.className = "floating-step-bubble";
  bubble.textContent = text;
  bubble.style.left = `${rect.left + rect.width / 2}px`;
  bubble.style.top = `${rect.top}px`;
  document.body.appendChild(bubble);
  setTimeout(() => bubble.remove(), 950);
}

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
  } else if (type === "info") {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    <div style="color: ${type === 'error' ? 'var(--danger)' : type === 'info' ? 'var(--info)' : 'var(--primary)'}">${iconSvg}</div>
    <div style="font-size: 0.88rem; font-weight: 500; flex: 1;">${message}</div>
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px) scale(0.95)";
    setTimeout(() => toast.remove(), 260);
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
  if (topbarPoints) {
    const prevPoints = parseInt(topbarPoints.getAttribute("data-val") || "0", 10) || state.user.points;
    if (prevPoints !== state.user.points) {
      animateValue(topbarPoints, prevPoints, state.user.points, 750, v => `${Math.round(v)} pts`);
      const pill = topbarPoints.closest(".points-pill");
      if (pill) {
        pill.classList.remove("points-bump");
        void pill.offsetWidth;
        pill.classList.add("points-bump");
      }
    } else {
      topbarPoints.textContent = `${state.user.points} pts`;
    }
    topbarPoints.setAttribute("data-val", String(state.user.points));
  }

  // KPI values with smooth count-up
  const kpiToday = document.getElementById("kpiTodayVal");
  if (kpiToday) {
    const prev = parseFloat(kpiToday.getAttribute("data-val") || "0") || aggregates.todayCo2;
    animateValue(kpiToday, prev, aggregates.todayCo2, 700, v => v.toFixed(1));
    kpiToday.setAttribute("data-val", String(aggregates.todayCo2));
  }

  const kpiWeek = document.getElementById("kpiWeekVal");
  if (kpiWeek) {
    const prev = parseFloat(kpiWeek.getAttribute("data-val") || "0") || aggregates.weekCo2;
    animateValue(kpiWeek, prev, aggregates.weekCo2, 700, v => v.toFixed(1));
    kpiWeek.setAttribute("data-val", String(aggregates.weekCo2));
  }

  const kpiMonth = document.getElementById("kpiMonthVal");
  if (kpiMonth) {
    const prev = parseFloat(kpiMonth.getAttribute("data-val") || "0") || aggregates.monthCo2;
    animateValue(kpiMonth, prev, aggregates.monthCo2, 700, v => v.toFixed(1));
    kpiMonth.setAttribute("data-val", String(aggregates.monthCo2));
  }

  // Sustainability Score Gauge
  const scoreVal = document.getElementById("scoreVal");
  if (scoreVal) {
    const prev = parseInt(scoreVal.getAttribute("data-val") || "0", 10) || aggregates.sustainabilityScore;
    animateValue(scoreVal, prev, aggregates.sustainabilityScore, 900, v => String(Math.round(v)));
    scoreVal.setAttribute("data-val", String(aggregates.sustainabilityScore));
  }

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
  if (heroPoints) {
    const prev = parseInt(heroPoints.getAttribute("data-val") || "0", 10) || state.user.points;
    if (prev !== state.user.points) {
      animateValue(heroPoints, prev, state.user.points, 750, v => String(Math.round(v)));
    } else {
      heroPoints.textContent = String(state.user.points);
    }
    heroPoints.setAttribute("data-val", String(state.user.points));
  }

  // Challenges grid
  const challengesGrid = document.getElementById("challengesGrid");
  if (challengesGrid) {
    challengesGrid.innerHTML = state.challenges.map(c => {
      const isCompleted = Boolean(c.completed);
      const isAdopted = Boolean(c.adopted);
      const pct = Math.min(100, Math.round(((c.progress || 0) / c.target) * 100));

      return `
        <div class="challenge-card ${isCompleted ? 'completed' : isAdopted ? 'adopted' : ''}" data-challenge-id="${c.id}">
          <div>
            <div class="challenge-top">
              <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
                <span class="badge badge-${c.category}">${c.category}</span>
                ${isCompleted 
                  ? `<span class="badge badge-completed">✓ Completed</span>` 
                  : isAdopted 
                  ? `<span class="badge badge-in-progress">In Progress</span>` 
                  : `<span class="badge badge-not-started">Available</span>`
                }
              </div>
              <span class="challenge-points-chip">+${c.points} pts</span>
            </div>
            <h4 style="margin: 0.75rem 0 0.25rem;">${c.title}</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted);">${c.description}</p>
          </div>
          
          <div>
            <div class="progress-track" style="margin: 0.5rem 0;">
              <div class="progress-bar-fill" data-challenge-bar="${c.id}" style="width: ${pct}%"></div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.78rem;">
              <span data-challenge-text="${c.id}">Progress: <strong>${c.progress || 0} / ${c.target}</strong> (${pct}%)</span>
              <span class="badge badge-${c.difficulty}">${c.difficulty}</span>
            </div>
            ${isCompleted 
              ? `<button class="btn btn-secondary btn-sm btn-block" disabled style="color: var(--primary); font-weight: 700; background: #ecfdf5; border-color: #a7f3d0;">✓ Completed (+${c.points} pts)</button>`
              : !isAdopted
              ? `<button class="btn btn-primary btn-sm btn-block btn-adopt-challenge" data-id="${c.id}" style="font-weight: 600;">🎯 Adopt Challenge</button>`
              : `
                <div style="display: flex; gap: 0.5rem;">
                  <button class="btn btn-secondary btn-sm btn-quick-challenge-step" data-id="${c.id}" style="flex: 1; white-space: nowrap; font-weight: 600;" title="Quickly add 1 step">+1 Step</button>
                  <button class="btn btn-primary btn-sm btn-open-challenge-progress" data-id="${c.id}" style="flex: 1.5; white-space: nowrap; font-weight: 600;">+ Add Progress</button>
                </div>
              `
            }
          </div>
        </div>
      `;
    }).join("");
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
    <div class="goal-card-item status-${g.status}" data-goal-id="${g.id}">
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
        <div class="progress-bar-fill" data-goal-bar="${g.id}" style="width: ${g.currentProgressPercent}%"></div>
      </div>

      <div class="goal-footer">
        <div class="goal-stats-group">
          <span>Target: <strong>${g.targetCo2eReductionKg} kg CO₂e</strong></span>
          <span>•</span>
          <span>Due: <strong>${g.targetDate}</strong></span>
          <span>•</span>
          <strong data-goal-pct="${g.id}" style="color: ${isCompleted ? 'var(--primary)' : isNotStarted ? 'var(--text-muted)' : 'var(--info)'};">
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

/**
 * Smooth in-place goal card progress animator with number rolling and card highlight pulse
 */
function animateGoalCardProgress(goalId, previousProgress, newProgress, newlyCompleted) {
  const cards = document.querySelectorAll(`.goal-card-item[data-goal-id="${goalId}"]`);
  if (cards.length === 0) {
    updateGoalsUI();
    return;
  }

  cards.forEach(card => {
    // Animate progress bar fill width
    const bar = card.querySelector(`[data-goal-bar="${goalId}"]`);
    if (bar) {
      bar.style.width = `${newProgress}%`;
    }

    // Animate percentage text
    const pctEl = card.querySelector(`[data-goal-pct="${goalId}"]`);
    if (pctEl) {
      animateValue(pctEl, previousProgress, newProgress, 750, v => `${Math.round(v)}% Achieved`);
      if (newProgress >= 100) {
        pctEl.style.color = "var(--primary)";
      }
    }

    // Card highlight pulse animation
    card.classList.remove("card-updated-pulse");
    void card.offsetWidth; // force reflow
    card.classList.add("card-updated-pulse");
  });

  if (newlyCompleted) {
    launchConfetti();
    setTimeout(() => {
      updateGoalsUI();
      updateDashboardUI();
    }, 800);
  } else {
    setTimeout(() => {
      updateGoalsUI();
    }, 750);
  }
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

function updateGoalChipsActiveState(selectedInc) {
  document.querySelectorAll("#goalProgressModal .chip-btn[data-inc]").forEach(chip => {
    const inc = parseInt(chip.getAttribute("data-inc"), 10);
    if (inc === Number(selectedInc)) {
      chip.classList.add("active");
    } else {
      chip.classList.remove("active");
    }
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
  const currentBar = document.getElementById("goalModalCurrentBar");
  const incBar = document.getElementById("goalModalIncBar");
  const previewTrack = document.getElementById("goalModalPreviewTrack");

  if (targetIdInput) targetIdInput.value = goal.id;
  if (titleEl) titleEl.textContent = goal.title;
  if (descEl) descEl.textContent = goal.description;
  if (targetKgEl) targetKgEl.textContent = `${goal.targetCo2eReductionKg} kg`;
  if (curPctEl) curPctEl.textContent = `${goal.currentProgressPercent}%`;

  if (previewTrack) previewTrack.classList.remove("fusing");

  if (statusBadge) {
    statusBadge.className = `badge badge-${goal.status.replace("_", "-")}`;
    statusBadge.textContent = goal.status === "completed" ? "Completed" : goal.status === "not_started" ? "Not Started" : "In Progress";
  }

  const defaultInc = goal.currentProgressPercent === 0 ? 25 : Math.min(20, Math.max(10, 100 - goal.currentProgressPercent));
  if (incInput) incInput.value = String(defaultInc);

  // Initialize bars at 0 for an elegant sliding entrance
  if (currentBar) currentBar.style.width = "0%";
  if (incBar) {
    incBar.style.left = "0%";
    incBar.style.width = "0%";
    incBar.classList.remove("complete");
  }

  updateGoalChipsActiveState(defaultInc);
  modal.classList.remove("modal-closing");
  modal.classList.add("open");

  // Entrance sequence: base progress slides in first, then increment bar blossoms
  requestAnimationFrame(() => {
    if (currentBar) currentBar.style.width = `${goal.currentProgressPercent}%`;
    setTimeout(() => {
      updateGoalModalPreview(goal.currentProgressPercent, defaultInc);
    }, 120);
  });
}

function closeGoalProgressModal() {
  const modal = document.getElementById("goalProgressModal");
  if (!modal) return;
  closeModalSmooth(modal);
}

function updateGoalModalPreview(currentPct, increment) {
  const numCurrent = Number(currentPct) || 0;
  const numInc = Math.max(0, Number(increment) || 0);
  const newPct = Math.min(100, numCurrent + numInc);
  const effectiveInc = Math.max(0, newPct - numCurrent);

  const currentBar = document.getElementById("goalModalCurrentBar");
  const incBar = document.getElementById("goalModalIncBar");
  const projectedText = document.getElementById("goalModalProjectedPct");
  const incBadge = document.getElementById("goalModalIncBadge");

  if (currentBar) currentBar.style.width = `${numCurrent}%`;
  if (incBar) {
    incBar.style.left = `${numCurrent}%`;
    incBar.style.width = `${effectiveInc}%`;
    if (newPct >= 100) {
      incBar.classList.add("complete");
    } else {
      incBar.classList.remove("complete");
    }
  }

  if (incBadge) {
    incBadge.textContent = `+${effectiveInc}%`;
    incBadge.className = newPct >= 100 ? "badge badge-completed" : "badge badge-info";
    incBadge.classList.remove("bounce-pop");
    void incBadge.offsetWidth;
    incBadge.classList.add("bounce-pop");
  }

  if (projectedText) {
    const prevPct = parseInt(projectedText.getAttribute("data-pct") || String(numCurrent), 10);
    animateValue(projectedText, prevPct, newPct, 500, v => `New: ${Math.round(v)}% ${v >= 100 ? '(Goal Complete! 🎯)' : ''}`);
    projectedText.setAttribute("data-pct", String(newPct));
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
  document.querySelectorAll("#goalProgressModal .chip-btn[data-inc]").forEach(chip => {
    chip.addEventListener("click", () => {
      const inc = parseInt(chip.getAttribute("data-inc"), 10);
      if (incInput && !isNaN(inc)) {
        incInput.value = String(inc);
        updateGoalChipsActiveState(inc);
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
        updateGoalChipsActiveState(-1);
        updateGoalModalPreview(goal.currentProgressPercent, remaining);
      }
    });
  }

  if (incInput) {
    incInput.addEventListener("input", () => {
      const goalId = document.getElementById("goalModalTargetId").value;
      const goal = store.getState().goals.find(g => g.id === goalId);
      const inc = parseFloat(incInput.value) || 0;
      updateGoalChipsActiveState(inc);
      if (goal) updateGoalModalPreview(goal.currentProgressPercent, inc);
    });
  }

  // Form Submit with visual fusion animation & smooth card update
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const goalId = document.getElementById("goalModalTargetId").value;
      const increment = parseFloat(incInput.value) || 0;

      if (increment <= 0) {
        showToast("Please enter a positive progress percentage.", "error");
        return;
      }

      // 1. Play visual fusion animation in preview bar
      const previewTrack = document.getElementById("goalModalPreviewTrack");
      if (previewTrack) previewTrack.classList.add("fusing");

      const submitBtn = document.getElementById("btnSubmitGoalProgress");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `✓ Saving...`;
      }

      setTimeout(() => {
        const res = store.addGoalProgress(goalId, increment);
        if (res) {
          closeGoalProgressModal();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Save Progress`;
          }

          if (res.newlyCompleted) {
            showToast(`🎉 Congratulations! Goal "${res.goal.title}" reached 100%! +100 eco-points awarded!`, "success");
            evaluateAchievements();
          } else {
            showToast(`Progress logged! "${res.goal.title}" is now at ${res.goal.currentProgressPercent}%.`, "success");
          }

          // Smoothly animate the target goal card in dashboard & goals view
          animateGoalCardProgress(goalId, res.previousProgress, res.goal.currentProgressPercent, res.newlyCompleted);
          updateDashboardUI();
        }
      }, 300);
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
// Challenge Progress Management Modal
// ==========================================================================
function updateChallengeChipsActiveState(selectedInc) {
  document.querySelectorAll("#challengeProgressModal .chip-btn.challenge-quick-chip").forEach(chip => {
    const inc = parseInt(chip.getAttribute("data-inc"), 10);
    if (inc === Number(selectedInc)) {
      chip.classList.add("active");
    } else {
      chip.classList.remove("active");
    }
  });
}

/**
 * Smooth in-place challenge card progress animator
 */
function animateChallengeCardProgress(challengeId, prevProgress, newProgress, target, completedNow, triggerElement) {
  const cards = document.querySelectorAll(`.challenge-card[data-challenge-id="${challengeId}"]`);
  const prevPct = Math.min(100, Math.round(((prevProgress || 0) / target) * 100));
  const newPct = Math.min(100, Math.round(((newProgress || 0) / target) * 100));

  if (triggerElement) {
    spawnFloatingStepBubble(triggerElement, `+${Math.max(1, newProgress - prevProgress)} Step`);
  }

  cards.forEach(card => {
    const bar = card.querySelector(`[data-challenge-bar="${challengeId}"]`);
    if (bar) {
      bar.style.width = `${newPct}%`;
    }

    const textEl = card.querySelector(`[data-challenge-text="${challengeId}"]`);
    if (textEl) {
      textEl.innerHTML = `Progress: <strong>${newProgress} / ${target}</strong> (${newPct}%)`;
    }

    card.classList.remove("card-updated-pulse");
    void card.offsetWidth;
    card.classList.add("card-updated-pulse");
  });

  if (completedNow) {
    launchConfetti();
    setTimeout(() => {
      updateGamificationUI();
      updateDashboardUI();
    }, 800);
  }
}

function openChallengeProgressModal(challengeId) {
  const state = store.getState();
  const challenge = state.challenges.find(c => c.id === challengeId);
  if (!challenge) return;

  const modal = document.getElementById("challengeProgressModal");
  if (!modal) return;

  const targetIdInput = document.getElementById("challengeModalTargetId");
  const nameEl = document.getElementById("challengeModalName");
  const descEl = document.getElementById("challengeModalDesc");
  const pointsBadge = document.getElementById("challengeModalPointsBadge");
  const catBadge = document.getElementById("challengeModalCatBadge");
  const diffBadge = document.getElementById("challengeModalDiffBadge");
  const curProgressEl = document.getElementById("challengeModalCurrentProgress");
  const targetNumEl = document.getElementById("challengeModalTargetNum");
  const incInput = document.getElementById("challengeIncrementInput");
  const currentBar = document.getElementById("challengeModalCurrentBar");
  const incBar = document.getElementById("challengeModalIncBar");
  const previewTrack = document.getElementById("challengeModalPreviewTrack");

  if (targetIdInput) targetIdInput.value = challenge.id;
  if (nameEl) nameEl.textContent = challenge.title;
  if (descEl) descEl.textContent = challenge.description;
  if (pointsBadge) pointsBadge.textContent = `+${challenge.points} pts`;
  if (catBadge) {
    catBadge.className = `badge badge-${challenge.category}`;
    catBadge.textContent = challenge.category;
  }
  if (diffBadge) {
    diffBadge.className = `badge badge-${challenge.difficulty}`;
    diffBadge.textContent = challenge.difficulty;
  }
  if (curProgressEl) curProgressEl.textContent = `${challenge.progress || 0} / ${challenge.target}`;
  if (targetNumEl) targetNumEl.textContent = String(challenge.target);

  if (previewTrack) previewTrack.classList.remove("fusing");

  const remaining = Math.max(1, challenge.target - (challenge.progress || 0));
  if (incInput) {
    incInput.value = "1";
    incInput.max = String(remaining);
  }

  // Initialize bars at 0 for smooth entrance
  if (currentBar) currentBar.style.width = "0%";
  if (incBar) {
    incBar.style.left = "0%";
    incBar.style.width = "0%";
    incBar.classList.remove("complete");
  }

  updateChallengeChipsActiveState(1);
  modal.classList.remove("modal-closing");
  modal.classList.add("open");

  const curPct = Math.min(100, Math.round(((challenge.progress || 0) / challenge.target) * 100));
  requestAnimationFrame(() => {
    if (currentBar) currentBar.style.width = `${curPct}%`;
    setTimeout(() => {
      updateChallengeModalPreview(challenge.progress || 0, challenge.target, 1);
    }, 120);
  });
}

function closeChallengeProgressModal() {
  const modal = document.getElementById("challengeProgressModal");
  if (!modal) return;
  closeModalSmooth(modal);
}

function updateChallengeModalPreview(currentProgress, target, increment) {
  const numCurrent = Math.max(0, Number(currentProgress) || 0);
  const numTarget = Math.max(1, Number(target) || 1);
  const numInc = Math.max(0, Number(increment) || 0);

  const newProgress = Math.min(numTarget, numCurrent + numInc);
  const curPct = Math.min(100, Math.round((numCurrent / numTarget) * 100));
  const newPct = Math.min(100, Math.round((newProgress / numTarget) * 100));
  const incPct = Math.max(0, newPct - curPct);

  const currentBar = document.getElementById("challengeModalCurrentBar");
  const incBar = document.getElementById("challengeModalIncBar");
  const projectedText = document.getElementById("challengeModalProjectedProgress");
  const incBadge = document.getElementById("challengeModalIncBadge");

  if (currentBar) currentBar.style.width = `${curPct}%`;
  if (incBar) {
    incBar.style.left = `${curPct}%`;
    incBar.style.width = `${incPct}%`;
    if (newProgress >= numTarget) {
      incBar.classList.add("complete");
    } else {
      incBar.classList.remove("complete");
    }
  }

  if (incBadge) {
    incBadge.textContent = `+${numInc} ${numInc === 1 ? 'step' : 'steps'}`;
    incBadge.className = newProgress >= numTarget ? "badge badge-completed" : "badge badge-info";
    incBadge.classList.remove("bounce-pop");
    void incBadge.offsetWidth;
    incBadge.classList.add("bounce-pop");
  }

  if (projectedText) {
    const prevProg = parseInt(projectedText.getAttribute("data-prog") || String(numCurrent), 10);
    animateValue(projectedText, prevProg, newProgress, 500, v => {
      const roundV = Math.round(v);
      const roundPct = Math.min(100, Math.round((roundV / numTarget) * 100));
      return roundV >= numTarget
        ? `New: ${roundV} / ${numTarget} (Complete! 🎉)`
        : `New: ${roundV} / ${numTarget} (${roundPct}%)`;
    });
    projectedText.setAttribute("data-prog", String(newProgress));
    projectedText.style.color = newProgress >= numTarget ? "var(--primary)" : "var(--info)";
  }
}

function setupChallengeProgressModal() {
  const modal = document.getElementById("challengeProgressModal");
  const closeBtn = document.getElementById("challengeModalCloseBtn");
  const cancelBtn = document.getElementById("challengeModalCancelBtn");
  const form = document.getElementById("challengeProgressForm");
  const incInput = document.getElementById("challengeIncrementInput");
  const reachTargetBtn = document.getElementById("btnReachChallengeTarget");

  if (closeBtn) closeBtn.addEventListener("click", closeChallengeProgressModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeChallengeProgressModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeChallengeProgressModal();
    });
  }

  // Quick increment chips
  document.querySelectorAll(".challenge-quick-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const inc = parseInt(chip.getAttribute("data-inc"), 10);
      if (incInput && !isNaN(inc)) {
        incInput.value = String(inc);
        updateChallengeChipsActiveState(inc);
        const challengeId = document.getElementById("challengeModalTargetId")?.value;
        const challenge = store.getState().challenges.find(c => c.id === challengeId);
        if (challenge) {
          updateChallengeModalPreview(challenge.progress || 0, challenge.target, inc);
        }
      }
    });
  });

  if (reachTargetBtn) {
    reachTargetBtn.addEventListener("click", () => {
      const challengeId = document.getElementById("challengeModalTargetId")?.value;
      const challenge = store.getState().challenges.find(c => c.id === challengeId);
      if (challenge && incInput) {
        const remaining = Math.max(1, challenge.target - (challenge.progress || 0));
        incInput.value = String(remaining);
        updateChallengeChipsActiveState(-1);
        updateChallengeModalPreview(challenge.progress || 0, challenge.target, remaining);
      }
    });
  }

  if (incInput) {
    incInput.addEventListener("input", () => {
      const challengeId = document.getElementById("challengeModalTargetId")?.value;
      const challenge = store.getState().challenges.find(c => c.id === challengeId);
      if (challenge) {
        const inc = Math.max(0, parseInt(incInput.value, 10) || 0);
        updateChallengeChipsActiveState(inc);
        updateChallengeModalPreview(challenge.progress || 0, challenge.target, inc);
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const challengeId = document.getElementById("challengeModalTargetId")?.value;
      const inc = Math.max(1, parseInt(incInput?.value, 10) || 1);

      if (challengeId) {
        const previewTrack = document.getElementById("challengeModalPreviewTrack");
        if (previewTrack) previewTrack.classList.add("fusing");

        const submitBtn = document.getElementById("btnSubmitChallengeProgress");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `✓ Saving...`;
        }

        setTimeout(() => {
          const state = store.getState();
          const challenge = state.challenges.find(c => c.id === challengeId);
          const prevProgress = challenge ? challenge.progress || 0 : 0;
          const target = challenge ? challenge.target : 5;

          const res = store.addChallengeProgress(challengeId, inc);
          closeChallengeProgressModal();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Save Progress`;
          }

          if (res) {
            if (res.completedNow) {
              showToast(`🎉 Challenge completed: "${res.challenge.title}"! +${res.challenge.points} points awarded! 🏆`, "success");
              evaluateAchievements();
            } else {
              showToast(`📈 Progress updated for "${res.challenge.title}": ${res.challenge.progress}/${res.challenge.target}`, "info");
            }

            animateChallengeCardProgress(challengeId, prevProgress, res.challenge.progress, target, res.completedNow);
            updateDashboardUI();
          }
        }, 300);
      }
    });
  }
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
    modal.classList.remove("modal-closing");
    modal.classList.add("open");
  }
}

function closeNewProfileModal() {
  const modal = document.getElementById("newProfileModal");
  if (modal) closeModalSmooth(modal);
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
  if (modal) {
    modal.classList.remove("modal-closing");
    modal.classList.add("open");
  }
  const dateInput = document.getElementById("activityDateInput");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
}

export function closeActivityModal() {
  const modal = document.getElementById("logActivityModal");
  if (modal) closeModalSmooth(modal);
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
                <span class="badge badge-priority">Priority: ${rec.priority}</span>
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
          btn.classList.add("btn-secondary", "adopted", "bounce-pop");
          btn.disabled = true;
          btn.style.opacity = "0.8";
          btn.style.cursor = "default";
          btn.textContent = "✓ Goal Adopted";

          spawnFloatingStepBubble(btn, "🎯 Goal Adopted!");
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
  const collapseBtn = document.getElementById("sidebarCollapseBtn");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.querySelector(".app-sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");

  // Restore desktop preference
  const isCollapsed = localStorage.getItem("sidebar_collapsed") === "true";
  if (isCollapsed && window.innerWidth > 1024) {
    document.body.classList.add("sidebar-collapsed");
  }

  // Collapse sidebar button (in sidebar header)
  if (collapseBtn) {
    collapseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.innerWidth <= 1024) {
        document.body.classList.remove("sidebar-open");
      } else {
        document.body.classList.add("sidebar-collapsed");
        localStorage.setItem("sidebar_collapsed", "true");
      }
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 360);
    });
  }

  // When sidebar is in minimum (collapsed), click anywhere on it to open it
  if (sidebar) {
    sidebar.addEventListener("click", (e) => {
      if (window.innerWidth > 1024 && document.body.classList.contains("sidebar-collapsed")) {
        // If clicking logout button, let logout proceed
        if (e.target.closest(".btn-logout")) return;

        // Prevent navigating away to homepage if clicking brand when in minimum
        if (e.target.closest(".sidebar-brand-group")) {
          e.preventDefault();
        }

        document.body.classList.remove("sidebar-collapsed");
        localStorage.setItem("sidebar_collapsed", "false");

        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, 360);
      }
    });
  }

  // Mobile menu button
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-open");
    });
  }

  function closeMobileSidebar() {
    document.body.classList.remove("sidebar-open");
  }

  if (backdrop) backdrop.addEventListener("click", closeMobileSidebar);

  // Close with Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileSidebar();
      closeActivityModal();
      closeGoalProgressModal();
      closeChallengeProgressModal();
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
// Theme Management (Dark / Light Mode)
// ==========================================================================
function initThemeToggle() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const sunIcon = themeToggleBtn?.querySelector(".sun-icon");
  const moonIcon = themeToggleBtn?.querySelector(".moon-icon");

  function syncThemeIcons(theme) {
    if (!themeToggleBtn) return;
    if (theme === "dark") {
      if (sunIcon) sunIcon.style.display = "block";
      if (moonIcon) moonIcon.style.display = "none";
      themeToggleBtn.setAttribute("title", "Switch to Light Mode");
      themeToggleBtn.setAttribute("aria-label", "Switch to Light Mode");
    } else {
      if (sunIcon) sunIcon.style.display = "none";
      if (moonIcon) moonIcon.style.display = "block";
      themeToggleBtn.setAttribute("title", "Switch to Dark Mode");
      themeToggleBtn.setAttribute("aria-label", "Switch to Dark Mode");
    }
  }

  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  syncThemeIcons(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const active = document.documentElement.getAttribute("data-theme") || "light";
      const next = active === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("ecotrack_theme", next);
      syncThemeIcons(next);

      // Dynamically re-render charts with dark/light palette
      try {
        renderTrendChart("trendChartCanvas", activeTrendFilter);
        renderCategoryChart("categoryChartCanvas");
        const analyticsCanvas = document.getElementById("analyticsBarCanvas");
        if (analyticsCanvas && document.getElementById("view-analytics")?.classList.contains("active")) {
          renderAnalyticsChart("analyticsBarCanvas");
        }
      } catch (err) {
        console.warn("Chart re-render on theme toggle:", err);
      }
    });
  }
}

// ==========================================================================
// Initialization & Global Event Listeners
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Initialize responsive sidebar & theme toggle
  initSidebarControls();
  initThemeToggle();

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
        window.location.href = "index.html";
      }, 500);
    });
  });

  // Setup forms & first render
  setupActivityForm();
  setupGoalProgressModal();
  setupChallengeProgressModal();
  setupProfileHandlers();
  updateUserProfileUI();
  updateDashboardUI();
  renderTrendChart("trendChartCanvas", "7d");
  renderCategoryChart("categoryChartCanvas");
  loadAICoachRecommendations();

  // Delegated click handler for Goal & Challenge Progress Buttons
  document.addEventListener("click", (e) => {
    // Goal progress
    const goalBtn = e.target.closest(".btn-open-goal-progress");
    if (goalBtn) {
      e.preventDefault();
      const goalId = goalBtn.getAttribute("data-id");
      if (goalId) openGoalProgressModal(goalId);
      return;
    }

    // Adopt challenge
    const adoptBtn = e.target.closest(".btn-adopt-challenge");
    if (adoptBtn) {
      e.preventDefault();
      const id = adoptBtn.getAttribute("data-id");
      if (id) {
        const adopted = store.adoptChallenge(id);
        if (adopted) {
          showToast(`🎯 Challenge adopted: "${adopted.title}"! Start logging progress.`, "success");
          updateGamificationUI();
        }
      }
      return;
    }

    // Quick +1 step challenge
    const quickStepBtn = e.target.closest(".btn-quick-challenge-step");
    if (quickStepBtn) {
      e.preventDefault();
      const id = quickStepBtn.getAttribute("data-id");
      if (id) {
        const state = store.getState();
        const ch = state.challenges.find(c => c.id === id);
        const prevProg = ch ? ch.progress || 0 : 0;
        const target = ch ? ch.target : 5;

        const res = store.addChallengeProgress(id, 1);
        if (res) {
          if (res.completedNow) {
            showToast(`🎉 Challenge completed: "${res.challenge.title}"! +${res.challenge.points} points awarded! 🏆`, "success");
            evaluateAchievements();
          } else {
            showToast(`📈 Progress added to "${res.challenge.title}": ${res.challenge.progress}/${res.challenge.target}`, "info");
          }
          animateChallengeCardProgress(id, prevProg, res.challenge.progress, target, res.completedNow, quickStepBtn);
          updateDashboardUI();
        }
      }
      return;
    }

    // Open challenge progress modal
    const challengeProgBtn = e.target.closest(".btn-open-challenge-progress");
    if (challengeProgBtn) {
      e.preventDefault();
      const id = challengeProgBtn.getAttribute("data-id");
      if (id) openChallengeProgressModal(id);
      return;
    }
  });

  // Export to window for global access
  window.switchView = switchView;
  window.openGoalProgressModal = openGoalProgressModal;
  window.closeGoalProgressModal = closeGoalProgressModal;
  window.openChallengeProgressModal = openChallengeProgressModal;
  window.closeChallengeProgressModal = closeChallengeProgressModal;
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

