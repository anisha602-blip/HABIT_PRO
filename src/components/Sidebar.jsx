import { calcLevel, xpProgress, xpToNextLevel, getWeekDots } from '../utils/gamification';
import { signOutUser } from '../firebase';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'planner', label: 'AI Planner', icon: '✦' },
  { id: 'daily', label: 'Daily Prep', icon: '◈', badge: 'NEW' },
  { id: 'habits', label: 'Habits', icon: '◎' },
  { id: 'analytics', label: 'Analytics', icon: '▦' },
  { id: 'schedule', label: 'Schedule', icon: '⊡' },
  { id: 'profile', label: 'Profile', icon: '◉' },
];

export default function Sidebar({ page, setPage, user, xp, streak, history, theme, setTheme }) {
  const level = calcLevel(xp);
  const prog = xpProgress(xp);
  const toNext = xpToNextLevel(xp);
  const weekDots = getWeekDots(history || {});
  const firstName = user?.displayName?.split(' ')[0] || 'User';
  const initials = (user?.displayName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">✦</div>
        <span>HabitPro</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <div
            key={item.id}
            className={`nav-item${page === item.id ? ' active' : ''}`}
            onClick={() => setPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}
      </nav>

      {/* Streak */}
      <div className="sidebar-streak" style={{ margin: '0 8px 8px' }}>
        <div className="streak-label">Current Streak</div>
        <div className="streak-val">
          <span className="fire">🔥</span>
          {streak} days
        </div>
        <div className="week-dots">
          {weekDots.map((d, i) => (
            <div
              key={i}
              className={`week-dot${d.done ? ' done' : ''}${d.today ? ' today' : ''}`}
              title={d.key}
            />
          ))}
        </div>
      </div>

      {/* XP Bar */}
      <div className="sidebar-xp">
        <div className="xp-header">
          <span className="xp-level-badge">LEVEL {level}</span>
          <span className="xp-count">{xp} XP</span>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${prog}%` }} />
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--t3)', marginTop: 5 }}>
          {toNext} XP to next level
        </div>
      </div>

      {/* User */}
      <div className="sidebar-user">
        <div className="user-row">
          <div className="user-avatar">
            {user?.photoURL
              ? <img src={user.photoURL} alt={firstName} referrerPolicy="no-referrer" />
              : initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="user-name">{firstName}</div>
            <div className="user-sub">Lv.{level} · {xp} XP</div>
          </div>
        </div>
        <div className="user-actions">
          <button
            className="icon-btn"
            title="Toggle theme"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            className="icon-btn"
            title="Sign out"
            onClick={signOutUser}
            style={{ color: 'var(--err)' }}
          >
            ⏏
          </button>
        </div>
      </div>
    </aside>
  );
}
