/**
 * Gamification & Behavior Change Engine
 * Adheres strictly to GAMIFICATION_SPEC.md:
 * - Configurable points engine (+5 log, +50 challenge, +30 streak, +100 goal)
 * - Streak tracking
 * - Challenge status & rewards
 * - Achievement badge criteria
 */

import { store } from "./store.js";

export const POINTS_CONFIG = {
  ACTIVITY_LOGGED: 5,
  CHALLENGE_COMPLETED: 50,
  SEVEN_DAY_STREAK: 30,
  GOAL_ACHIEVED: 100
};

/**
 * Check and evaluate achievement badges based on user activities and actions
 */
export function evaluateAchievements() {
  const state = store.getState();
  const activities = state.activities;
  const achievements = state.achievements;
  let newUnlock = null;

  achievements.forEach(ach => {
    if (ach.unlocked) return;

    if (ach.id === "ach_01" && activities.length >= 1) {
      ach.unlocked = true;
      ach.unlockedAt = new Date().toISOString().split("T")[0];
      state.user.points += ach.points;
      newUnlock = ach;
    }

    if (ach.id === "ach_02") {
      const transitTrips = activities.filter(a =>
        a.category === "transportation" &&
        (a.activityType.includes("Bus") || a.activityType.includes("Train"))
      );
      if (transitTrips.length >= 5) {
        ach.unlocked = true;
        ach.unlockedAt = new Date().toISOString().split("T")[0];
        state.user.points += ach.points;
        newUnlock = ach;
      }
    }

    if (ach.id === "ach_03" && state.user.streak >= 7) {
      ach.unlocked = true;
      ach.unlockedAt = new Date().toISOString().split("T")[0];
      state.user.points += ach.points;
      newUnlock = ach;
    }

    if (ach.id === "ach_05" && state.user.points >= 500) {
      ach.unlocked = true;
      ach.unlockedAt = new Date().toISOString().split("T")[0];
      state.user.points += ach.points;
      newUnlock = ach;
    }
  });

  if (newUnlock) {
    store.saveState();
  }

  return newUnlock;
}
