/**
 * Reactive Client Store & Local Persistence Engine
 * Manages user state, activities history, goals, challenges, achievements, and aggregates.
 * Pre-seeds realistic 30-day data so the dashboard is immediately vibrant and demonstrable.
 */

import { calculateEmission } from "./calculator.js";

const STORAGE_KEY = "carbon_tracker_state_v1";
const ACTIVE_EMAIL_KEY = "ecotrack_active_email";
const REGISTRY_KEY = "ecotrack_accounts_registry";
export const DEMO_EMAIL = "alex.rivera@example.com";

// Helper for generating recent dates
function getPastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

// Helper for generating future dates
function getFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

export function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

export function getAccountStorageKey(email) {
  const norm = normalizeEmail(email) || DEMO_EMAIL;
  return `ecotrack_account_${norm}`;
}

/**
 * Generate fresh, meaningful starter goals at 0% progress for a new user account
 */
export function getStarterGoals(reductionTarget = 20) {
  const targetPct = Number(reductionTarget) || 20;
  return [
    {
      id: "goal_" + Date.now() + "_1",
      title: "Cut Personal Commute Emissions",
      description: "Replace 2 weekly solo car commutes with cycling, train, bus, or carpooling.",
      targetCo2eReductionKg: Math.round(20 * (targetPct / 20)),
      currentProgressPercent: 0,
      targetDate: getFutureDate(30),
      status: "not_started",
      category: "transportation",
      createdAt: new Date().toISOString()
    },
    {
      id: "goal_" + Date.now() + "_2",
      title: "Home Energy Conservation",
      description: "Lower grid electricity consumption through smart thermostat scheduling and phantom load reduction.",
      targetCo2eReductionKg: Math.round(15 * (targetPct / 20)),
      currentProgressPercent: 0,
      targetDate: getFutureDate(45),
      status: "not_started",
      category: "energy",
      createdAt: new Date().toISOString()
    },
    {
      id: "goal_" + Date.now() + "_3",
      title: "Plant-Forward Dining Habit",
      description: "Incorporate 4 plant-based or vegetarian meals each week to lower dietary carbon footprint.",
      targetCo2eReductionKg: Math.round(18 * (targetPct / 20)),
      currentProgressPercent: 0,
      targetDate: getFutureDate(60),
      status: "not_started",
      category: "food",
      createdAt: new Date().toISOString()
    }
  ];
}

/**
 * Creates an isolated, personalized account state for a separate user
 */
export function createFreshAccountState({ name, email, country = "India", preferredUnit = "kg", reductionTarget = 20 }) {
  const normEmail = normalizeEmail(email);
  const derivedName = name && name.trim()
    ? name.trim()
    : normEmail
    ? normEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    : "Eco Pioneer";

  return {
    user: {
      id: "usr_" + Date.now(),
      name: derivedName,
      email: normEmail,
      country: country || "India",
      preferredUnit: preferredUnit || "kg",
      reductionTarget: Number(reductionTarget) || 20,
      points: 0,
      streak: 0,
      lastLoggedDate: null
    },
    activities: [],
    goals: getStarterGoals(reductionTarget),
    challenges: [
      {
        id: "ch_01",
        title: "Transit Pioneer",
        description: "Log at least 5 public transit or cycling trips this week.",
        category: "transportation",
        target: 5,
        progress: 0,
        unit: "trips",
        points: 50,
        difficulty: "easy",
        adopted: false,
        completed: false
      },
      {
        id: "ch_02",
        title: "Plant Power Week",
        description: "Record 4 plant-based meals in the food category.",
        category: "food",
        target: 4,
        progress: 0,
        unit: "meals",
        points: 50,
        difficulty: "medium",
        adopted: false,
        completed: false
      },
      {
        id: "ch_03",
        title: "Phantom Watt Hunter",
        description: "Log energy baseline under 10 kWh for 3 consecutive days.",
        category: "energy",
        target: 3,
        progress: 0,
        unit: "days",
        points: 60,
        difficulty: "hard",
        adopted: false,
        completed: false
      },
      {
        id: "ch_04",
        title: "Mindful Consumer",
        description: "Keep shopping and apparel purchases at 0 for 7 straight days.",
        category: "shopping",
        target: 7,
        progress: 0,
        unit: "days",
        points: 75,
        difficulty: "medium",
        adopted: false,
        completed: false
      }
    ],
    achievements: [
      {
        id: "ach_01",
        name: "First Step",
        description: "Record your very first carbon activity log.",
        icon: "🌱",
        points: 25,
        unlocked: false,
        unlockedAt: null
      },
      {
        id: "ach_02",
        name: "Green Traveler",
        description: "Log 5 public transit or zero-emission commute trips.",
        icon: "🚲",
        points: 50,
        unlocked: false,
        unlockedAt: null
      },
      {
        id: "ach_03",
        name: "7-Day Streak",
        description: "Maintain a continuous daily carbon logging streak for 7 days.",
        icon: "🔥",
        points: 75,
        unlocked: false,
        unlockedAt: null
      },
      {
        id: "ach_04",
        name: "Energy Warden",
        description: "Reduce home electricity consumption by 20% compared to baseline.",
        icon: "⚡",
        points: 100,
        unlocked: false,
        unlockedAt: null
      },
      {
        id: "ach_05",
        name: "Eco Champion",
        description: "Accumulate 500+ sustainability points through active habits.",
        icon: "👑",
        points: 150,
        unlocked: false,
        unlockedAt: null
      }
    ]
  };
}

// Initial realistic pre-seeded dataset
const INITIAL_STATE = {
  user: {
    id: "usr_demo_01",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    country: "United States",
    preferredUnit: "kg",
    reductionTarget: 20, // percentage
    points: 385,
    streak: 6,
    lastLoggedDate: getPastDate(0)
  },
  activities: [
    {
      id: "act_101",
      category: "transportation",
      activityType: "Car (Petrol / Gasoline)",
      quantity: 32,
      unit: "km",
      emissionFactorId: "ef_trans_car_petrol",
      co2eKg: 6.72,
      date: getPastDate(0),
      notes: "Morning and evening highway commute",
      createdAt: new Date().toISOString()
    },
    {
      id: "act_102",
      category: "food",
      activityType: "Vegetarian Meal (Eggs/Dairy)",
      quantity: 2,
      unit: "meals",
      emissionFactorId: "ef_food_vegetarian",
      co2eKg: 1.8,
      date: getPastDate(0),
      notes: "Lunch salad and dinner pasta",
      createdAt: new Date().toISOString()
    },
    {
      id: "act_103",
      category: "energy",
      activityType: "Grid Electricity",
      quantity: 14.5,
      unit: "kWh",
      emissionFactorId: "ef_energy_grid",
      co2eKg: 6.09,
      date: getPastDate(1),
      notes: "Daily apartment electricity usage",
      createdAt: new Date().toISOString()
    },
    {
      id: "act_104",
      category: "transportation",
      activityType: "Train / Metro / Subway",
      quantity: 18,
      unit: "km",
      emissionFactorId: "ef_trans_train",
      co2eKg: 0.72,
      date: getPastDate(1),
      notes: "Subway trip downtown",
      createdAt: new Date().toISOString()
    },
    {
      id: "act_105",
      category: "food",
      activityType: "Beef Meal",
      quantity: 1,
      unit: "meals",
      emissionFactorId: "ef_food_beef",
      co2eKg: 6.50,
      date: getPastDate(2),
      notes: "Steak restaurant dinner",
      createdAt: new Date().toISOString()
    },
    {
      id: "act_106",
      category: "water",
      activityType: "Hot Shower (8-10 mins)",
      quantity: 2,
      unit: "showers",
      emissionFactorId: "ef_water_shower",
      co2eKg: 1.70,
      date: getPastDate(2),
      notes: "Post-workout shower",
      createdAt: new Date().toISOString()
    },
    {
      id: "act_107",
      category: "shopping",
      activityType: "Clothing / Apparel Item",
      quantity: 2,
      unit: "items",
      emissionFactorId: "ef_shop_clothing",
      co2eKg: 17.00,
      date: getPastDate(3),
      notes: "Two cotton t-shirts",
      createdAt: new Date().toISOString()
    },
    {
      id: "act_108",
      category: "energy",
      activityType: "Grid Electricity",
      quantity: 15.2,
      unit: "kWh",
      emissionFactorId: "ef_energy_grid",
      co2eKg: 6.38,
      date: getPastDate(4),
      notes: "AC running warm afternoon",
      createdAt: new Date().toISOString()
    },
    {
      id: "act_109",
      category: "transportation",
      activityType: "City Bus / Public Transit",
      quantity: 14,
      unit: "km",
      emissionFactorId: "ef_trans_bus",
      co2eKg: 1.12,
      date: getPastDate(5),
      notes: "Bus to farmers market",
      createdAt: new Date().toISOString()
    },
    {
      id: "act_110",
      category: "food",
      activityType: "100% Plant-Based / Vegan Meal",
      quantity: 3,
      unit: "meals",
      emissionFactorId: "ef_food_vegan",
      co2eKg: 1.50,
      date: getPastDate(6),
      notes: "Full vegan weekend day",
      createdAt: new Date().toISOString()
    }
  ],
  goals: [
    {
      id: "goal_01",
      title: "Reduce Monthly Transport Footprint",
      description: "Keep private car travel under 150 km per month by cycling and using transit.",
      targetCo2eReductionKg: 25,
      currentProgressPercent: 65,
      targetDate: "2026-09-30",
      status: "in_progress"
    },
    {
      id: "goal_02",
      title: "Clean Energy Household Habit",
      description: "Lower grid electricity consumption by 15% through smart thermostatic scheduling.",
      targetCo2eReductionKg: 18,
      currentProgressPercent: 0,
      targetDate: "2026-10-15",
      status: "not_started"
    },
    {
      id: "goal_03",
      title: "Zero Waste Plant-Based Week",
      description: "Replaced 10 ruminant meat meals with locally-sourced legumes and seasonal vegetables.",
      targetCo2eReductionKg: 30,
      currentProgressPercent: 100,
      targetDate: "2026-08-25",
      status: "completed"
    }
  ],
  challenges: [
    {
      id: "ch_01",
      title: "Transit Pioneer",
      description: "Choose bus, train, or metro for at least 3 commutes this week.",
      category: "transportation",
      difficulty: "easy",
      points: 50,
      progress: 3,
      target: 3,
      adopted: true,
      completed: true
    },
    {
      id: "ch_02",
      title: "Plant Power Week",
      description: "Log 6 vegetarian or plant-based meals over 7 consecutive days.",
      category: "food",
      difficulty: "medium",
      points: 60,
      progress: 4,
      target: 6,
      adopted: true,
      completed: false
    },
    {
      id: "ch_03",
      title: "Phantom Watt Hunter",
      description: "Unplug idle home electronics and power strips for 5 days.",
      category: "energy",
      difficulty: "easy",
      points: 40,
      progress: 0,
      target: 5,
      adopted: false,
      completed: false
    },
    {
      id: "ch_04",
      title: "Mindful Consumer",
      description: "Avoid buying new fast-fashion or non-essential electronics for 14 days.",
      category: "shopping",
      difficulty: "hard",
      points: 100,
      progress: 0,
      target: 14,
      adopted: false,
      completed: false
    }
  ],
  achievements: [
    {
      id: "ach_01",
      name: "First Step",
      description: "Logged your first environmental carbon activity.",
      icon: "🌱",
      points: 25,
      unlocked: true,
      unlockedAt: "2026-08-10"
    },
    {
      id: "ach_02",
      name: "Green Traveler",
      description: "Avoided high emissions by logging 5 low-carbon transit trips.",
      icon: "🚆",
      points: 50,
      unlocked: true,
      unlockedAt: "2026-08-18"
    },
    {
      id: "ach_03",
      name: "7-Day Streak",
      description: "Tracked daily carbon activities for 7 consecutive days.",
      icon: "🔥",
      points: 75,
      unlocked: true,
      unlockedAt: "2026-08-25"
    },
    {
      id: "ach_04",
      name: "Energy Warden",
      description: "Maintain weekly household electricity under 50 kWh.",
      icon: "⚡",
      points: 100,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: "ach_05",
      name: "Eco Champion",
      description: "Accumulate 500+ sustainability points through active habits.",
      icon: "👑",
      points: 150,
      unlocked: false,
      unlockedAt: null
    }
  ]
};

class CarbonStore {
  constructor() {
    this.ensureRegistry();
    this.state = this.loadState();
  }

  getActiveEmail() {
    try {
      const active = localStorage.getItem(ACTIVE_EMAIL_KEY);
      if (active && active.trim()) {
        return normalizeEmail(active);
      }
      const current = localStorage.getItem("ecotrack_current_user");
      if (current) {
        const cu = JSON.parse(current);
        if (cu && cu.email) return normalizeEmail(cu.email);
      }
    } catch (e) {}
    return DEMO_EMAIL;
  }

  setActiveEmail(email) {
    const norm = normalizeEmail(email) || DEMO_EMAIL;
    localStorage.setItem(ACTIVE_EMAIL_KEY, norm);
  }

  ensureRegistry() {
    try {
      let reg = [];
      const raw = localStorage.getItem(REGISTRY_KEY);
      if (raw) {
        try { reg = JSON.parse(raw); } catch (e) {}
      }
      if (!Array.isArray(reg)) reg = [];

      const demoExists = reg.some(a => normalizeEmail(a.email) === DEMO_EMAIL);
      if (!demoExists) {
        reg.unshift({
          email: DEMO_EMAIL,
          name: "Alex Rivera",
          country: "United States",
          isDemo: true,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
      }
      return reg;
    } catch (e) {
      return [];
    }
  }

  getRegisteredAccounts() {
    return this.ensureRegistry();
  }

  saveToRegistry(user) {
    if (!user || !user.email) return;
    const normEmail = normalizeEmail(user.email);
    try {
      let reg = this.ensureRegistry();
      const idx = reg.findIndex(a => normalizeEmail(a.email) === normEmail);
      const accInfo = {
        email: normEmail,
        name: user.name || (normEmail ? normEmail.split("@")[0] : "Eco User"),
        country: user.country || "India",
        isDemo: normEmail === DEMO_EMAIL,
        lastActive: new Date().toISOString()
      };
      if (idx >= 0) {
        reg[idx] = { ...reg[idx], ...accInfo };
      } else {
        reg.push(accInfo);
      }
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
    } catch (e) {
      console.warn("Could not save to accounts registry", e);
    }
  }

  loadState() {
    try {
      const activeEmail = this.getActiveEmail();
      const accountKey = getAccountStorageKey(activeEmail);

      let stored = localStorage.getItem(accountKey);

      // Migration / fallback: if demo account and account key not set yet, check legacy storage
      if (!stored && activeEmail === DEMO_EMAIL) {
        stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("ecotrack_state_v1");
      }

      let parsed = null;
      if (stored) {
        try {
          parsed = JSON.parse(stored);
        } catch (e) {}
      }

      if (!parsed) {
        if (activeEmail === DEMO_EMAIL) {
          parsed = JSON.parse(JSON.stringify(INITIAL_STATE));
        } else {
          // Fresh separate account state
          let name = "";
          const curRaw = localStorage.getItem("ecotrack_current_user");
          if (curRaw) {
            try {
              const cu = JSON.parse(curRaw);
              if (cu && normalizeEmail(cu.email) === activeEmail) name = cu.name;
            } catch (e) {}
          }
          parsed = createFreshAccountState({ name, email: activeEmail });
        }
      }

      // Ensure user object has correct email and defaults
      if (!parsed.user) parsed.user = {};
      parsed.user.email = activeEmail;
      if (!parsed.user.name) {
        parsed.user.name = activeEmail === DEMO_EMAIL ? "Alex Rivera" : activeEmail.split("@")[0];
      }

      // Normalize goals
      if (parsed.goals && Array.isArray(parsed.goals)) {
        parsed.goals.forEach(g => {
          const prog = Number(g.currentProgressPercent) || 0;
          if (prog >= 100) {
            g.status = "completed";
            g.currentProgressPercent = 100;
          } else if (prog > 0) {
            g.status = "in_progress";
          } else {
            g.status = "not_started";
            g.currentProgressPercent = 0;
          }
        });
      } else {
        parsed.goals = activeEmail === DEMO_EMAIL
          ? JSON.parse(JSON.stringify(INITIAL_STATE.goals))
          : getStarterGoals(parsed.user.reductionTarget);
      }

      if (parsed.challenges && Array.isArray(parsed.challenges)) {
        parsed.challenges.forEach(c => {
          if (c.adopted === undefined) {
            c.adopted = Boolean(c.completed || (c.progress > 0));
          }
        });
      }

      this.saveToRegistry(parsed.user);
      return parsed;
    } catch (e) {
      console.warn("Could not parse local storage, loading defaults", e);
    }
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  saveState() {
    try {
      const email = (this.state && this.state.user && this.state.user.email)
        ? normalizeEmail(this.state.user.email)
        : this.getActiveEmail();

      const accountKey = getAccountStorageKey(email);
      const stateStr = JSON.stringify(this.state);

      // 1. Save strictly to user's dedicated account key
      localStorage.setItem(accountKey, stateStr);

      // 2. Keep active email set
      this.setActiveEmail(email);

      // 3. Keep legacy mirror keys in sync for external readers
      localStorage.setItem(STORAGE_KEY, stateStr);
      localStorage.setItem("ecotrack_state_v1", stateStr);

      if (this.state.user) {
        localStorage.setItem("ecotrack_current_user", JSON.stringify({
          name: this.state.user.name,
          email: this.state.user.email,
          country: this.state.user.country
        }));
        this.saveToRegistry(this.state.user);
      }
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
    this.dispatchChange();
  }

  /**
   * Switch active account to another email.
   * If the account exists, loads its isolated state and goals.
   * If it doesn't exist, creates fresh account state with starter goals.
   */
  switchAccount(email, name = "", country = "India") {
    const normEmail = normalizeEmail(email) || DEMO_EMAIL;

    // Save currently active state first
    if (this.state) {
      this.saveState();
    }

    this.setActiveEmail(normEmail);

    const accountKey = getAccountStorageKey(normEmail);
    const existing = localStorage.getItem(accountKey);

    if (existing) {
      try {
        this.state = JSON.parse(existing);
        if (name && (!this.state.user.name || this.state.user.name === "Eco User" || this.state.user.name === "Eco Pioneer")) {
          this.state.user.name = name;
        }
      } catch (e) {
        this.state = normEmail === DEMO_EMAIL
          ? JSON.parse(JSON.stringify(INITIAL_STATE))
          : createFreshAccountState({ name, email: normEmail, country });
      }
    } else {
      if (normEmail === DEMO_EMAIL) {
        this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
      } else {
        this.state = createFreshAccountState({ name, email: normEmail, country });
      }
    }

    this.saveState();
    return this.state;
  }

  /**
   * Explicitly register a brand new account with fresh starter goals
   */
  registerAccount({ name, email, country = "India", preferredUnit = "kg", reductionTarget = 20 }) {
    const normEmail = normalizeEmail(email);
    if (!normEmail) throw new Error("A valid email address is required.");

    this.setActiveEmail(normEmail);
    this.state = createFreshAccountState({ name, email: normEmail, country, preferredUnit, reductionTarget });
    this.saveState();
    return this.state;
  }

  /**
   * Log out active session
   */
  logout() {
    localStorage.removeItem("ecotrack_current_user");
    this.dispatchChange();
  }

  /**
   * Delete an existing goal from active account
   */
  deleteGoal(id) {
    if (!this.state.goals) return false;
    const initialLen = this.state.goals.length;
    this.state.goals = this.state.goals.filter(g => g.id !== id);
    if (this.state.goals.length !== initialLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  dispatchChange() {
    window.dispatchEvent(new CustomEvent("carbon_state_changed", { detail: this.state }));
  }

  getState() {
    return this.state;
  }

  /**
   * Log new activity with automatic points attribution and snapshotting
   */
  logActivity(data) {
    const calc = calculateEmission(data.factorId, data.quantity);
    if (!calc.success) {
      throw new Error(calc.error);
    }

    const newActivity = {
      id: "act_" + Date.now(),
      category: calc.category,
      activityType: calc.activityType,
      quantity: calc.quantity,
      unit: calc.unit,
      emissionFactorId: calc.factorId,
      co2eKg: calc.co2eKg,
      date: data.date || new Date().toISOString().split("T")[0],
      notes: data.notes || "",
      createdAt: new Date().toISOString()
    };

    this.state.activities.unshift(newActivity);

    // Gamification: Award +5 points per activity logged!
    this.state.user.points += 5;

    // Update streak logic
    const todayStr = new Date().toISOString().split("T")[0];
    if (this.state.user.lastLoggedDate !== todayStr) {
      this.state.user.streak += 1;
      this.state.user.lastLoggedDate = todayStr;
    }

    this.saveState();
    return newActivity;
  }

  deleteActivity(id) {
    this.state.activities = this.state.activities.filter(a => a.id !== id);
    this.saveState();
  }

  adoptChallenge(id) {
    const challenge = this.state.challenges.find(c => c.id === id);
    if (challenge && !challenge.completed) {
      challenge.adopted = true;
      if (typeof challenge.progress !== "number") challenge.progress = 0;
      this.saveState();
      return challenge;
    }
    return null;
  }

  addChallengeProgress(id, amount = 1) {
    const challenge = this.state.challenges.find(c => c.id === id);
    if (challenge && !challenge.completed) {
      challenge.adopted = true;
      const numAmount = Math.max(1, Number(amount) || 1);
      challenge.progress = Math.min(challenge.target, (challenge.progress || 0) + numAmount);

      let completedNow = false;
      if (challenge.progress >= challenge.target) {
        challenge.completed = true;
        challenge.progress = challenge.target;
        this.state.user.points += challenge.points;
        completedNow = true;
      }
      this.saveState();
      return { challenge, completedNow };
    }
    return null;
  }

  completeChallenge(id) {
    const challenge = this.state.challenges.find(c => c.id === id);
    if (challenge && !challenge.completed) {
      challenge.adopted = true;
      challenge.completed = true;
      challenge.progress = challenge.target;
      this.state.user.points += challenge.points;
      this.saveState();
      return challenge;
    }
    return null;
  }

  /**
   * Add a new goal (e.g. adopted from AI Coach or created by user)
   */
  addGoal(goalData) {
    if (!this.state.goals) this.state.goals = [];

    // Check if goal with identical title already exists
    const existing = this.state.goals.find(
      g => g.title.toLowerCase().trim() === goalData.title.toLowerCase().trim()
    );
    if (existing) {
      return { success: false, reason: "already_exists", goal: existing };
    }

    const d = new Date();
    d.setDate(d.getDate() + 30);
    const defaultTargetDate = d.toISOString().split("T")[0];

    const newGoal = {
      id: "goal_" + Date.now(),
      title: goalData.title,
      description: goalData.description || goalData.action || "Adopted action from AI Sustainability Coach.",
      targetCo2eReductionKg: Number(goalData.targetCo2eReductionKg || goalData.estimated_impact_kg_co2_per_month || 20),
      currentProgressPercent: 0,
      targetDate: goalData.targetDate || defaultTargetDate,
      status: "not_started",
      category: goalData.category || "general",
      createdAt: new Date().toISOString()
    };

    this.state.goals.unshift(newGoal);
    this.saveState();
    return { success: true, goal: newGoal };
  }

  /**
   * Incrementally add progress to a goal and automatically update status
   * (not_started -> in_progress -> completed with +100 pts)
   */
  addGoalProgress(id, incrementPercent) {
    const goal = this.state.goals.find(g => g.id === id);
    if (!goal) return null;

    const previousProgress = Number(goal.currentProgressPercent) || 0;
    const newProgress = Math.min(100, Math.max(0, previousProgress + Number(incrementPercent)));
    goal.currentProgressPercent = Math.round(newProgress);

    let newlyCompleted = false;

    if (goal.currentProgressPercent >= 100) {
      if (goal.status !== "completed") {
        goal.status = "completed";
        this.state.user.points += 100; // Goal completed reward!
        newlyCompleted = true;
      }
    } else if (goal.currentProgressPercent > 0) {
      goal.status = "in_progress";
    } else {
      goal.status = "not_started";
    }

    this.saveState();
    return { goal, newlyCompleted, previousProgress };
  }

  setGoalProgress(id, targetPercent) {
    const goal = this.state.goals.find(g => g.id === id);
    if (!goal) return null;

    const previousProgress = Number(goal.currentProgressPercent) || 0;
    const newProgress = Math.min(100, Math.max(0, Number(targetPercent)));
    goal.currentProgressPercent = Math.round(newProgress);

    let newlyCompleted = false;

    if (goal.currentProgressPercent >= 100) {
      if (goal.status !== "completed") {
        goal.status = "completed";
        this.state.user.points += 100;
        newlyCompleted = true;
      }
    } else if (goal.currentProgressPercent > 0) {
      goal.status = "in_progress";
    } else {
      goal.status = "not_started";
    }

    this.saveState();
    return { goal, newlyCompleted, previousProgress };
  }

  updateProfile(updates) {
    this.state.user = { ...this.state.user, ...updates };
    this.saveState();
  }

  clearActivities() {
    this.state.activities = [];
    this.saveState();
  }

  createNewUserProfile({ name, email, country = "India", preferredUnit = "kg", reductionTarget = 20 }) {
    return this.registerAccount({ name, email, country, preferredUnit, reductionTarget });
  }

  resetUserAccount(options = {}) {
    return this.createNewUserProfile(options);
  }

  restoreDemoData() {
    this.setActiveEmail(DEMO_EMAIL);
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.saveState();
    return this.state;
  }

  /**
   * Computed KPI Metrics & Aggregates
   */
  getAggregates() {
    const todayStr = new Date().toISOString().split("T")[0];
    const d = new Date();
    const sevenDaysAgo = new Date(d.setDate(d.getDate() - 7)).toISOString().split("T")[0];
    d.setDate(d.getDate() + 7); // reset
    const thirtyDaysAgo = new Date(d.setDate(d.getDate() - 30)).toISOString().split("T")[0];

    let todayCo2 = 0;
    let weekCo2 = 0;
    let monthCo2 = 0;
    let totalCo2 = 0;

    const categoryBreakdown = {
      transportation: 0,
      energy: 0,
      food: 0,
      water: 0,
      shopping: 0
    };

    const contributorMap = {};

    this.state.activities.forEach(act => {
      const kg = Number(act.co2eKg);
      totalCo2 += kg;

      if (act.date === todayStr) {
        todayCo2 += kg;
      }
      if (act.date >= sevenDaysAgo) {
        weekCo2 += kg;
      }
      if (act.date >= thirtyDaysAgo) {
        monthCo2 += kg;
      }

      const cat = act.category.toLowerCase();
      if (categoryBreakdown[cat] !== undefined) {
        categoryBreakdown[cat] += kg;
      }

      contributorMap[act.activityType] = (contributorMap[act.activityType] || 0) + kg;
    });

    // Top 4 contributors ranked
    const topContributors = Object.keys(contributorMap)
      .map(activity => ({
        activity,
        co2eKg: Number(contributorMap[activity].toFixed(2)),
        percentage: totalCo2 > 0 ? Math.round((contributorMap[activity] / totalCo2) * 100) : 0
      }))
      .sort((a, b) => b.co2eKg - a.co2eKg)
      .slice(0, 4);

    // Sustainability score: Baseline monthly average benchmark ~350kg CO2e
    // Lower footprint + high streak & completed challenges -> higher score out of 100
    const footprintRatio = Math.min(monthCo2 / 180, 2);
    let baseScore = Math.max(20, Math.round(95 - (footprintRatio * 35)));
    if (this.state.user.streak >= 5) baseScore += 5;
    const sustainabilityScore = Math.min(99, Math.max(15, baseScore));

    return {
      todayCo2: Number(todayCo2.toFixed(2)),
      weekCo2: Number(weekCo2.toFixed(2)),
      monthCo2: Number(monthCo2.toFixed(2)),
      totalCo2: Number(totalCo2.toFixed(2)),
      sustainabilityScore,
      categoryBreakdown: {
        transportation: Number(categoryBreakdown.transportation.toFixed(2)),
        energy: Number(categoryBreakdown.energy.toFixed(2)),
        food: Number(categoryBreakdown.food.toFixed(2)),
        water: Number(categoryBreakdown.water.toFixed(2)),
        shopping: Number(categoryBreakdown.shopping.toFixed(2))
      },
      topContributors
    };
  }
}

export const store = new CarbonStore();

if (typeof window !== "undefined") {
  window.EcoTrackStore = store;
}
