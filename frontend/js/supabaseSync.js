import { supabase } from './supabaseClient.js';
import { store } from './store.js';

// Optimistic UI Sync Manager for Supabase

let activeHydrationPromise = null;

export function hydrateStoreFromSupabase(force = false) {
  if (activeHydrationPromise && !force) {
    return activeHydrationPromise;
  }

  activeHydrationPromise = (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      const user = session.user;
      
      // Switch local store to the authenticated user's profile
      store.switchAccount(user.email, user.user_metadata?.full_name || user.email);
      
      // Fetch all user data concurrently
      const [
        { data: profile },
        { data: activities },
        { data: goals }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('activity_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);
      
      if (profile) {
        store.state.user.points = profile.points || 0;
        store.state.user.streak = profile.streak || 0;
        store.state.user.name = profile.full_name || store.state.user.name;
      }
      
      if (activities) {
        store.state.activities = activities.map(a => ({
          id: a.id,
          category: a.category,
          activityType: a.activity_type,
          quantity: a.quantity,
          unit: a.unit,
          emissionFactorId: a.emission_factor_id,
          co2eKg: a.co2e_kg,
          date: a.activity_date,
          notes: a.notes,
          createdAt: a.created_at
        }));
      }
      
      if (goals && goals.length > 0) {
        store.state.goals = goals.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description,
          targetCo2eReductionKg: g.target_co2e_reduction,
          targetDate: g.target_date,
          currentProgressPercent: g.current_progress,
          status: g.status,
          category: g.category,
          createdAt: g.created_at
        }));
      } else {
        store.state.goals = [];
      }
      
      // Save to local and trigger UI update
      store.saveState();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ecotrack_hydrated", {
          detail: {
            user,
            email: user.email,
            activityCount: store.state.activities.length
          }
        }));
      }

      return { user, activityCount: store.state.activities.length };
    } catch (err) {
      console.error("Failed to hydrate from Supabase:", err);
      return null;
    } finally {
      activeHydrationPromise = null;
    }
  })();

  return activeHydrationPromise;
}

// Intercept Store Mutators to sync to Supabase in background
const originalLogActivity = store.logActivity.bind(store);
store.logActivity = function(data) {
  const result = originalLogActivity(data);
  
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) return;
    supabase.from('activity_logs').insert({
      id: result.id,
      user_id: session.user.id,
      category: result.category,
      activity_type: result.activityType,
      quantity: result.quantity,
      unit: result.unit,
      emission_factor_id: result.emissionFactorId,
      co2e_kg: result.co2eKg,
      activity_date: result.date,
      notes: result.notes,
      created_at: result.createdAt
    }).then(({error}) => { if(error) console.error("Sync error:", error); });
    
    // Also sync points/streak
    syncProfile(session.user.id);
  });
  
  return result;
};

const originalDeleteActivity = store.deleteActivity.bind(store);
store.deleteActivity = function(id) {
  originalDeleteActivity(id);
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) return;
    supabase.from('activity_logs').delete().eq('id', id).eq('user_id', session.user.id)
      .then(({error}) => { if(error) console.error("Sync error:", error); });
  });
};

const originalClearActivities = store.clearActivities.bind(store);
store.clearActivities = async function(options = { revertAiGoals: true }) {
  const result = originalClearActivities(options);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const userId = session.user.id;
      // 1. Permanently delete all activity logs from Supabase
      const delActPromise = supabase.from('activity_logs').delete().eq('user_id', userId);

      // 2. Permanently delete goals from Supabase if requested
      const delGoalPromise = (options.revertAiGoals || options.clearAllGoals)
        ? supabase.from('goals').delete().eq('user_id', userId)
        : Promise.resolve();

      // 3. Clear any saved AI recommendations from Supabase
      const delAiPromise = supabase.from('ai_recommendations').delete().eq('user_id', userId);

      // 4. Reset profile points and streak in Supabase
      const syncProfPromise = supabase.from('profiles').upsert({
        id: userId,
        points: 0,
        streak: 0,
        last_logged_date: null,
        full_name: store.state.user.name
      }, { onConflict: 'id' });

      await Promise.allSettled([delActPromise, delGoalPromise, delAiPromise, syncProfPromise]);
    }
  } catch (err) {
    console.error("Failed to permanently delete records from Supabase:", err);
  }
  return result;
};

const originalAddGoal = store.addGoal.bind(store);
store.addGoal = function(goalData) {
  const result = originalAddGoal(goalData);
  if (result.success && result.goal) {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from('goals').insert({
        id: result.goal.id,
        user_id: session.user.id,
        title: result.goal.title,
        description: result.goal.description,
        target_co2e_reduction: result.goal.targetCo2eReductionKg,
        target_date: result.goal.targetDate,
        current_progress: result.goal.currentProgressPercent,
        status: result.goal.status,
        category: result.goal.category,
        created_at: result.goal.createdAt
      }).then(({error}) => { if(error) console.error("Sync error:", error); });
    });
  }
  return result;
};

const originalDeleteGoal = store.deleteGoal.bind(store);
store.deleteGoal = function(id) {
  const success = originalDeleteGoal(id);
  if (success) {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from('goals').delete().eq('id', id).eq('user_id', session.user.id)
        .then(({error}) => { if(error) console.error("Sync error:", error); });
    });
  }
  return success;
};

const originalAddGoalProgress = store.addGoalProgress.bind(store);
store.addGoalProgress = function(id, incrementPercent) {
  const result = originalAddGoalProgress(id, incrementPercent);
  if (result && result.goal) {
    syncGoalUpdate(result.goal);
  }
  return result;
};

const originalSetGoalProgress = store.setGoalProgress.bind(store);
store.setGoalProgress = function(id, targetPercent) {
  const result = originalSetGoalProgress(id, targetPercent);
  if (result && result.goal) {
    syncGoalUpdate(result.goal);
  }
  return result;
};

function syncGoalUpdate(goal) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) return;
    supabase.from('goals').update({
      current_progress: goal.currentProgressPercent,
      status: goal.status
    }).eq('id', goal.id).eq('user_id', session.user.id)
      .then(({error}) => { if(error) console.error("Sync error:", error); });
    
    syncProfile(session.user.id);
  });
}

function syncProfile(userId) {
  supabase.from('profiles').upsert({
    id: userId,
    points: store.state.user.points,
    streak: store.state.user.streak,
    last_logged_date: store.state.user.lastLoggedDate,
    full_name: store.state.user.name
  }, { onConflict: 'id' })
    .then(({error}) => { if(error) console.error("Sync error:", error); });
}

// Real-time Auth state change hook
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN') {
    await hydrateStoreFromSupabase(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ecotrack_account_switched", {
        detail: { session, email: session?.user?.email }
      }));
    }
  } else if (event === 'SIGNED_OUT') {
    store.logout();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ecotrack_account_switched", {
        detail: { session: null, email: null }
      }));
    }
  }
});

// Run once on load
hydrateStoreFromSupabase();
