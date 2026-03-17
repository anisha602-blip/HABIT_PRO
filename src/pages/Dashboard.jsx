import { calcLevel } from '../utils/gamification';

export default function Dashboard({ user, habits, done, xp, streak, lc, sql, todayKey, onToggle, setPage, setLc, setSql, onSave }) {
  const level = calcLevel(xp);
  const todayDone = done[todayKey] || [];
  const completed = todayDone.length;
  const total = habits.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const firstName = user?.displayName?.split(' ')[0] || 'User';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{greeting}, {firstName} 👋</h1>
        <p className="page-subtitle">{dateStr}</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="gc stat-card">
          <div className="stat-label">Today's Progress</div>
          <div className="stat-value">{pct}%</div>
          <div className="stat-sub">{completed}/{total} habits done</div>
        </div>
        <div className="gc stat-card">
          <div className="stat-label">Total XP</div>
          <div className="stat-value" style={{ color: 'var(--v2)' }}>{xp}</div>
          <div className="stat-sub">Level {level}</div>
        </div>
        <div className="gc stat-card">
          <div className="stat-label">Current Streak</div>
          <div className="stat-value">
            <span className="fire">🔥</span>{streak}
          </div>
          <div className="stat-sub">days in a row</div>
        </div>
        <div className="gc stat-card">
          <div className="stat-label">LeetCode Solved</div>
          <div className="stat-value">{lc}</div>
          <div className="stat-sub">{sql} SQL problems</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Habits List */}
        <div className="gc card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="card-title" style={{ margin: 0 }}>Today's Habits</div>
            <span className="badge badge-violet">{pct}% done</span>
          </div>
          <div className="progress-bar-track" style={{ marginBottom: 14 }}>
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          {habits.length === 0 ? (
            <p style={{ color: 'var(--t3)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>
              No habits yet. <span style={{ color: 'var(--v2)', cursor: 'pointer' }} onClick={() => setPage('habits')}>Add your first habit →</span>
            </p>
          ) : (
            <div className="habits-list">
              {habits.map(h => {
                const isDone = todayDone.includes(h.id);
                return (
                  <div
                    key={h.id}
                    className={`habit-row${isDone ? ' completed' : ''}`}
                    onClick={() => onToggle(h.id)}
                  >
                    <div className={`habit-check${isDone ? ' done' : ''}`} />
                    <span className="habit-emoji">{h.icon}</span>
                    <span className="habit-name">{h.name}</span>
                    <div className="habit-meta">
                      <span className="badge badge-violet">{h.category}</span>
                      <span className="habit-xp-badge">+{h.xp} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* LeetCode Counter */}
          <div className="gc counter-card">
            <div className="counter-header">
              <div className="counter-title">💻 LeetCode Problems</div>
              <a href="https://leetcode.com/problemset/" target="_blank" rel="noopener noreferrer" className="counter-link">Practice →</a>
            </div>
            <div className="counter-controls">
              <button className="counter-btn" onClick={() => { const v = Math.max(0, lc - 1); setLc(v); onSave({ lc: v }); }}>−</button>
              <div className="counter-val">{lc}</div>
              <button className="counter-btn" onClick={() => { const v = lc + 1; setLc(v); onSave({ lc: v }); }}>+</button>
            </div>
          </div>

          {/* SQL Counter */}
          <div className="gc counter-card">
            <div className="counter-header">
              <div className="counter-title">🗄️ SQL Problems</div>
              <a href="https://leetcode.com/problemset/?topicSlugs=database" target="_blank" rel="noopener noreferrer" className="counter-link">Practice →</a>
            </div>
            <div className="counter-controls">
              <button className="counter-btn" onClick={() => { const v = Math.max(0, sql - 1); setSql(v); onSave({ sql: v }); }}>−</button>
              <div className="counter-val">{sql}</div>
              <button className="counter-btn" onClick={() => { const v = sql + 1; setSql(v); onSave({ sql: v }); }}>+</button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="gc card">
            <div className="card-title">Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => setPage('planner')}>✦ Generate AI Roadmap</button>
              <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => setPage('daily')}>◈ Daily Interview Prep</button>
              <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => setPage('analytics')}>▦ View Analytics</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
