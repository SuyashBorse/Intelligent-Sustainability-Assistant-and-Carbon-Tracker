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
    gridColor: isDark ? "rgba(255, 255, 255, 0.07)" : "#f1f5f9",
    tickColor: isDark ? "#94a3b8" : "#64748b",
    legendColor: isDark ? "#cbd5e1" : "#475569",
    tooltipBg: isDark ? "#1e293b" : "#0f172a",
    emptyDoughnut: isDark ? "#1e293b" : "#e2e8f0",
    doughnutBorder: isDark ? "#131d31" : "#ffffff",
    pointBg: isDark ? "#131d31" : "#ffffff"
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
    type: "bar",
    data: {
      labels: ["Transportation", "Energy", "Food", "Water", "Shopping"],
      datasets: [
        {
          label: "Current Period (kg CO₂e)",
          data: [cb.transportation, cb.energy, cb.food, cb.water, cb.shopping],
          backgroundColor: [
            COLORS.transportation,
            COLORS.energy,
            COLORS.food,
            COLORS.water,
            COLORS.shopping
          ],
          borderRadius: 6
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
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} kg CO₂e`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: tc.gridColor },
          ticks: {
            color: tc.tickColor,
            callback: val => `${val} kg`
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
