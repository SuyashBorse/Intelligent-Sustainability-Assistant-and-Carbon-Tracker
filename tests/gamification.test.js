// Mock browser globals for Node test runner
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] ?? null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  };
}

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { POINTS_CONFIG, evaluateAchievements } from '../frontend/js/gamification.js';
import { store } from '../frontend/js/store.js';

describe('Gamification & Streak Engine', () => {
  let testEmail;

  beforeEach(() => {
    testEmail = `gamification_user_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;
    store.switchAccount(testEmail, 'Tester');
  });

  it('should have standard points configuration defined', () => {
    assert.equal(POINTS_CONFIG.ACTIVITY_LOGGED, 5);
    assert.equal(POINTS_CONFIG.CHALLENGE_COMPLETED, 50);
    assert.equal(POINTS_CONFIG.SEVEN_DAY_STREAK, 30);
    assert.equal(POINTS_CONFIG.GOAL_ACHIEVED, 100);
  });

  it('should award +5 points and set streak to 1 on initial activity log', () => {
    const initialPoints = store.getState().user.points;
    assert.equal(initialPoints, 0);

    store.logActivity({
      category: 'transportation',
      factorId: 'ef_trans_car_petrol',
      quantity: 15,
      date: new Date().toISOString().split('T')[0]
    });

    const state = store.getState();
    assert.equal(state.user.points, 5);
    assert.equal(state.user.streak, 1);
  });

  it('should not double-increment streak when logging multiple activities on same day', () => {
    const today = new Date().toISOString().split('T')[0];

    store.logActivity({
      category: 'energy',
      factorId: 'ef_energy_grid',
      quantity: 10,
      date: today
    });

    store.logActivity({
      category: 'food',
      factorId: 'ef_food_vegetarian',
      quantity: 2,
      date: today
    });

    const state = store.getState();
    // Points increment for both activities (+5 + 5 = 10)
    assert.equal(state.user.points, 10);
    // Streak remains 1 for same-day logs
    assert.equal(state.user.streak, 1);
  });

  it('should unlock "First Step" badge after logging first activity', () => {
    store.logActivity({
      category: 'transportation',
      factorId: 'ef_trans_train',
      quantity: 5,
      date: new Date().toISOString().split('T')[0]
    });

    const unlocked = evaluateAchievements();
    assert.ok(unlocked);
    assert.equal(unlocked.id, 'ach_01');
    assert.equal(unlocked.name, 'First Step');

    // Calling again should not re-unlock
    const secondCall = evaluateAchievements();
    assert.equal(secondCall, null);
  });

  it('should unlock "Green Traveler" badge after 5 public transit activities', () => {
    // Log 5 train trips
    for (let i = 0; i < 5; i++) {
      store.logActivity({
        category: 'transportation',
        factorId: 'ef_trans_train',
        quantity: 10,
        date: new Date().toISOString().split('T')[0]
      });
    }

    const unlocked = evaluateAchievements();
    assert.ok(unlocked);
    assert.ok(store.getState().achievements.find(a => a.id === 'ach_02').unlocked);
  });
});
