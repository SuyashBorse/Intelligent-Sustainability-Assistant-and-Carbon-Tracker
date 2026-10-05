/**
 * Chart.js Visualization Engine
 * Implements modern SaaS data visualizations:
 * 1. Trend Line/Area Chart with responsive gradients
 * 2. Category Doughnut Chart with center label
 * 3. Analytics Comparison Bar Chart
 */

import { store } from "./store.js";

let trendChartInstance = null;
let categoryChartInstance = null;
let analyticsChartInstance = null;

// Palette definitions matching CSS variables
const COLORS = {
  transportation: "#3b82f6",
  energy: "#f59e0b",
  food: "#10b981",
  water: "#06b6d4",
  shopping: "#8b5cf6",
  primary: "#059669",
  primaryGradientStart: "rgba(16, 185, 129, 0.28)",
  primaryGradientEnd: "rgba(16, 185, 129, 0.0)"
};

export function getThemeChartColors() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  return {
    gridColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
    tickColor: isDark ? "#71717a" : "#64748b",
    legendColor: isDark ? "#a1a1aa" : "#475569",
    tooltipBg: isDark ? "#18181b" : "#0f172a",
    emptyDoughnut: isDark ? "#27272a" : "#e2e8f0",
    doughnutBorder: isDark ? "#141417" : "#ffffff",
    pointBg: isDark ? "#141417" : "#ffffff"
  };
}

/**
 * Initialize or update the Trend Line/Area chart
 * @param {string} canvasId 
 * @param {string} filter '7d' | '30d' | 'year'
 */
export function renderTrendChart(canvasId, filter = "7d") {
  if (typeof window.Chart === "undefined") return;
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const state = store.getState();

  // Aggregate emissions by date
  const dateMap = {};
  const dayCount = filter === "30d" ? 30 : filter === "year" ? 12 : 7;
  const labels = [];
  const dataPoints = [];

  const now = new Date();
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date();
    if (filter === "year") {
      d.setMonth(now.getMonth() - i);
      const key = d.toLocaleString("default", { month: "short" });
      labels.push(key);
      dateMap[key] = 0;
    } else {
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      const display = d.toLocaleDateString(undefined, { weekday: "short", month: "numeric", day: "numeric" });
      labels.push(filter === "7d" ? d.toLocaleDateString(undefined, { weekday: "short" }) : display);
      dateMap[iso] = 0;
    }
  }

  // Accumulate from activities
  state.activities.forEach(act => {
    if (filter === "year") {
      const actDate = new Date(act.date);
      const key = actDate.toLocaleString("default", { month: "short" });
      if (dateMap[key] !== undefined) {
        dateMap[key] += Number(act.co2eKg);
      }
    } else {
      if (dateMap[act.date] !== undefined) {
        dateMap[act.date] += Number(act.co2eKg);
      }
    }
  });

  const keys = Object.keys(dateMap);
  keys.forEach(k => {
    dataPoints.push(Number(dateMap[k].toFixed(2)));
  });

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, COLORS.primaryGradientStart);
  gradient.addColorStop(1, COLORS.primaryGradientEnd);

  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  const tc = getThemeChartColors();

  // @ts-ignore
  trendChartInstance = new window.Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Estimated CO₂e (kg)",
          data: dataPoints,
          borderColor: COLORS.primary,
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: tc.pointBg,
          pointBorderColor: COLORS.primary,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tc.tooltipBg,
          padding: 10,
          titleFont: { size: 12, weight: "bold" },
          bodyFont: { size: 13 },
          displayColors: false,
          callbacks: {
            label: context => `${context.parsed.y} kg CO₂e`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: tc.gridColor },
          ticks: {
            color: tc.tickColor,
            callback: value => `${value} kg`
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: tc.tickColor }
        }
      }
    }
  });
}

/**
 * Initialize or update the Category Breakdown Doughnut chart
 * @param {string} canvasId 
 */
export function renderCategoryChart(canvasId) {
  if (typeof window.Chart === "undefined") return;
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const aggregates = store.getAggregates();
  const cb = aggregates.categoryBreakdown;

  const labels = ["Transportation", "Energy", "Food", "Water", "Shopping"];
  const values = [cb.transportation, cb.energy, cb.food, cb.water, cb.shopping];
  const bgColors = [
    COLORS.transportation,
    COLORS.energy,
    COLORS.food,
    COLORS.water,
    COLORS.shopping
  ];

  const total = values.reduce((a, b) => a + b, 0);
  const tc = getThemeChartColors();
  const isZero = total === 0;
  const chartLabels = isZero ? ["No emissions logged yet"] : labels;
  const chartData = isZero ? [1] : values;
  const chartBgColors = isZero ? [tc.emptyDoughnut] : bgColors;

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  // @ts-ignore
  categoryChartInstance = new window.Chart(ctx, {
    type: "doughnut",
    data: {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          backgroundColor: chartBgColors,
          borderWidth: 2,
          borderColor: tc.doughnutBorder,
          hoverOffset: isZero ? 0 : 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: {
        legend: {
          display: !isZero,
          position: "bottom",
          labels: {
            boxWidth: 12,
            padding: 14,
            color: tc.legendColor,
            font: { size: 12, weight: "500" }
          }
        },
        tooltip: {
          backgroundColor: tc.tooltipBg,
          padding: 10,
          callbacks: {
            label: context => {
              if (isZero) return " No emissions logged yet";
              const val = context.raw || 0;
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              return ` ${context.label}: ${val.toFixed(1)} kg (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Initialize deep analytics comparative chart
 * @param {string} canvasId 
 */
export function renderAnalyticsChart(canvasId) {
  if (typeof window.Chart === "undefined") return;
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const aggregates = store.getAggregates();
  const cb = aggregates.categoryBreakdown;
  const tc = getThemeChartColors();

  if (analyticsChartInstance) {
    analyticsChartInstance.destroy();
  }

  // @ts-ignore
  analyticsChartInstance = new window.Chart(ctx, {
    type: "polarArea",
    data: {
      labels: ["Transportation", "Energy", "Food", "Water", "Shopping"],
      datasets: [
        {
          label: "Emissions (kg CO₂e)",
          data: [cb.transportation, cb.energy, cb.food, cb.water, cb.shopping],
          backgroundColor: [
            COLORS.transportation + "aa", 
            COLORS.energy + "aa",
            COLORS.food + "aa",
            COLORS.water + "aa",
            COLORS.shopping + "aa"
          ],
          borderColor: [
            COLORS.transportation,
            COLORS.energy,
            COLORS.food,
            COLORS.water,
            COLORS.shopping
          ],
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'right',
          labels: {
            color: tc.legendColor,
            font: { size: 13, weight: "500" },
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: tc.tooltipBg,
          padding: 12,
          titleFont: { size: 13, weight: "bold" },
          bodyFont: { size: 13 },
          displayColors: true,
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.raw.toFixed(1)} kg CO₂e`
          }
        }
      },
      scales: {
        r: {
          grid: { 
            color: tc.gridColor
          },
          ticks: {
            display: false, // hide the internal numbers to keep it clean
            backdropColor: "transparent"
          }
        }
      }
    }
  });
}

export function renderGoalsChallengesChart(canvasId) {
  if (typeof window.Chart === "undefined") return;
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const state = store.getState();
  const tc = getThemeChartColors();

  if (window.goalsChartInstance) {
    window.goalsChartInstance.destroy();
  }

  // Accumulate titles for tooltips
  let gCompleted = [], gInProgress = [], gNotStarted = [];
  if (state.goals) {
    state.goals.forEach(g => {
      if (g.status === "completed") gCompleted.push(g.title);
      else if (g.status === "in_progress") gInProgress.push(g.title);
      else gNotStarted.push(g.title);
    });
  }

  let cCompleted = [], cInProgress = [], cNotStarted = [];
  if (state.challenges) {
    state.challenges.forEach(c => {
      if (c.completed) cCompleted.push(c.title);
      else if (c.adopted) cInProgress.push(c.title);
      else cNotStarted.push(c.title);
    });
  }

  // Create Gradients for a premium look
  const completedGradient = ctx.createLinearGradient(0, 0, 400, 0);
  completedGradient.addColorStop(0, "#34d399"); // Emerald 400
  completedGradient.addColorStop(1, "#059669"); // Emerald 600

  const inProgressGradient = ctx.createLinearGradient(0, 0, 400, 0);
  inProgressGradient.addColorStop(0, "#60a5fa"); // Blue 400
  inProgressGradient.addColorStop(1, "#2563eb"); // Blue 600

  const notStartedGradient = ctx.createLinearGradient(0, 0, 400, 0);
  notStartedGradient.addColorStop(0, "#cbd5e1"); // Slate 300
  notStartedGradient.addColorStop(1, "#94a3b8"); // Slate 400

  // @ts-ignore
  window.goalsChartInstance = new window.Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Reduction Goals", "Weekly Challenges"],
      datasets: [
        {
          label: "Completed",
          data: [gCompleted.length, cCompleted.length],
          itemsList: [gCompleted, cCompleted],
          backgroundColor: completedGradient,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 36
        },
        {
          label: "In Progress",
          data: [gInProgress.length, cInProgress.length],
          itemsList: [gInProgress, cInProgress],
          backgroundColor: inProgressGradient,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 36
        },
        {
          label: "Not Started",
          data: [gNotStarted.length, cNotStarted.length],
          itemsList: [gNotStarted, cNotStarted],
          backgroundColor: notStartedGradient,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 36
        }
      ]
    },
    options: {
      indexAxis: 'y', // Makes it horizontal
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { 
            color: tc.legendColor, 
            font: { size: 13, weight: "500" },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: tc.tooltipBg,
          padding: 12,
          titleFont: { size: 14, weight: "bold" },
          bodyFont: { size: 13 },
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} items`,
            afterLabel: (ctx) => {
              const items = ctx.dataset.itemsList[ctx.dataIndex];
              if (items && items.length > 0) {
                return items.map(item => `  • ${item}`);
              }
              return "  (None)";
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { 
            color: tc.gridColor,
            drawBorder: false
          },
          ticks: { 
            color: tc.tickColor,
            precision: 0,
            font: { size: 12 }
          }
        },
        y: {
          stacked: true,
          grid: { 
            display: false,
            drawBorder: false
          },
          ticks: { 
            color: tc.tickColor,
            font: { size: 14, weight: "600" },
            padding: 10
          }
        }
      }
    }
  });
}
