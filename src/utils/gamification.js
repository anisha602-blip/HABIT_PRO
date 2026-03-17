// ── Gamification Helpers ──

export const XP_PER_LEVEL = 1000;

export const calcLevel = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;

export const xpToNextLevel = (xp) => {
  const rem = xp % XP_PER_LEVEL;
  return rem === 0 ? XP_PER_LEVEL : XP_PER_LEVEL - rem;
};

export const xpProgress = (xp) => ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

export const LEVEL_TITLES = [
  'Beginner',      // Lv 1-3
  'Explorer',      // Lv 4-6
  'Practitioner',  // Lv 7-9
  'Specialist',    // Lv 10-12
  'Expert',        // Lv 13-15
  'Master',        // Lv 16-18
  'Grand Master',  // Lv 19+
];

export const getLevelTitle = (level) => {
  const idx = Math.min(Math.floor((level - 1) / 3), LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[idx];
};

/**
 * Walk backwards from yesterday counting consecutive days with hist[date] > 0.
 * Add 1 if today has completions.
 * @param {Object} hist - { "YYYY-MM-DD": count }
 */
export const calcStreak = (hist) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const fmtDate = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const todayStr = fmtDate(now);
  const hasTodayActivity = hist[todayStr] > 0;

  let streak = hasTodayActivity ? 1 : 0;
  const start = new Date(now);
  if (!hasTodayActivity) start.setDate(start.getDate() - 1);
  else start.setDate(start.getDate() - 1); // start checking from yesterday

  for (let i = 0; i < 365; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() - i);
    const key = fmtDate(d);
    if (hist[key] > 0) streak++;
    else break;
  }

  return streak;
};

/**
 * Generate 90 days of seeded random history (~72% completion rate)
 */
export const seedHistory = () => {
  const hist = {};
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (Math.random() < 0.72) {
      hist[key] = Math.floor(Math.random() * 4) + 1;
    }
  }
  return hist;
};

export const getWeekDots = (hist) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    days.push({
      key,
      done: hist[key] > 0,
      today: i === 0,
    });
  }
  return days;
};
