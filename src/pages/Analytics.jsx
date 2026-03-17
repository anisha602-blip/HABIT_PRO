import { calcLevel } from '../utils/gamification';

const CATEGORIES = ['Study', 'Health', 'Work', 'Finance', 'Personal'];

const cellColor = (count, maxCount) => {
  if (!count || count === 0) return 'var(--bg4)';
  const pct = count / Math.max(maxCount, 1);
  if (pct <= 0.25) return 'rgba(139,120,255,0.2)';
  if (pct <= 0.5) return 'rgba(139,120,255,0.42)';
  if (pct <= 0.75) return 'rgba(139,120,255,0.65)';
  return 'var(--v)';
};

export default function Analytics({ habits, done, history, xp, streak, todayKey }) {
  const level = calcLevel(xp);
  const todayDone = done[todayKey] || [];

  // Build 18x7 grid (126 days)
  const cells = [];
  const now = new Date();
  const maxCount = Math.max(...Object.values(history), 1);

  for (let week = 17; week >= 0; week--) {
    for (let day = 6; day >= 0; day--) {
      const d = new Date(now);
      d.setDate(d.getDate() - (week * 7 + day));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      cells.push({ key, count: history[key] || 0, d });
    }
  }
  // reverse so earliest first, row-major (week columns)
  cells.reverse();

  // Stats
  const totalCompleted = Object.values(history).reduce((s, v) => s + (v || 0), 0);
  const activeDays = Object.values(history).filter(v => v > 0).length;

  // Category breakdown
  const catCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = habits.filter(h => h.category === cat).length;
    return acc;
  }, {});
  const totalHabits = habits.length || 1;

  // Today summary
  const todayXP = todayDone.reduce((sum, id) => {
    const h = habits.find(hb => hb.id === id);
    return sum + (h?.xp || 0);
  }, 0);
  const todayPct = habits.length > 0 ? Math.round((todayDone.length / habits.length) * 100) : 0;

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">▦ Analytics</h1>
        <p className="page-subtitle">Track your consistency and progress over time</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="gc stat-card">
          <div className="stat-label">Total Completed</div>
          <div className="stat-value">{totalCompleted}</div>
          <div className="stat-sub">habit check-ins</div>
        </div>
        <div className="gc stat-card">
          <div className="stat-label">Active Days</div>
          <div className="stat-value">{activeDays}</div>
          <div className="stat-sub">days with activity</div>
        </div>
        <div className="gc stat-card">
          <div className="stat-label">Current Level</div>
          <div className="stat-value" style={{ color: 'var(--v2)' }}>{level}</div>
          <div className="stat-sub">{xp} total XP</div>
        </div>
        <div className="gc stat-card">
          <div className="stat-label">Streak</div>
          <div className="stat-value"><span className="fire">🔥</span>{streak}</div>
          <div className="stat-sub">days in a row</div>
        </div>
      </div>

      {/* Contribution Grid */}
      <div className="gc" style={{ marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 8px', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem' }}>Activity Grid</div>
        <div className="contrib-grid" style={{ gridTemplateColumns: 'repeat(18, 12px)', gridTemplateRows: 'repeat(7, 12px)' }}>
          {cells.map((cell, i) => (
            <div
              key={cell.key}
              className="contrib-cell"
              title={`${cell.key}: ${cell.count} check-ins`}
              style={{
                width: 12, height: 12, borderRadius: 2,
                background: cellColor(cell.count, maxCount),
              }}
            />
          ))}
        </div>
        <div className="contrib-legend">
          <span>Less</span>
          {['var(--bg4)', 'rgba(139,120,255,0.20)', 'rgba(139,120,255,0.42)', 'rgba(139,120,255,0.65)', 'var(--v)'].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="grid-2">
        {/* Category Breakdown */}
        <div className="gc card">
          <div className="card-title">Habits by Category</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CATEGORIES.map(cat => {
              const count = catCounts[cat] || 0;
              const pct = Math.round((count / totalHabits) * 100);
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{cat}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>{count} habits</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today Summary */}
        <div className="gc card">
          <div className="card-title">Today's Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--t2)', fontSize: '0.875rem' }}>Habits completed</span>
              <span style={{ fontWeight: 700 }}>{todayDone.length} / {habits.length}</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${todayPct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--t2)', fontSize: '0.875rem' }}>XP earned today</span>
              <span style={{ fontWeight: 700, color: 'var(--v2)' }}>+{todayXP} XP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--t2)', fontSize: '0.875rem' }}>Completion rate</span>
              <span style={{ fontWeight: 700 }}>{todayPct}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--t2)', fontSize: '0.875rem' }}>Current streak</span>
              <span style={{ fontWeight: 700 }}><span className="fire">🔥</span>{streak} days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
