import { useState, useEffect, useRef, useCallback } from 'react';
import './styles.css';

import { onAuthChange, loadUserData, saveUserData, isConfigured } from './firebase';
import { calcLevel, calcStreak } from './utils/gamification';
import { signOutUser } from './firebase';

import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AIPlanner from './pages/AIPlanner';
import DailyPrep from './pages/DailyPrep';
import HabitTracker from './pages/HabitTracker';
import Analytics from './pages/Analytics';
import Schedule from './pages/Schedule';
import Profile from './pages/Profile';



const ALL_NAV_ITEMS = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'planner', icon: '✦', label: 'AI Planner' },
  { id: 'daily', icon: '◈', label: 'Daily Prep' },
  { id: 'habits', icon: '◎', label: 'Habit Tracker' },
  { id: 'analytics', icon: '◫', label: 'Analytics' },
  { id: 'schedule', icon: '▦', label: 'Schedule' },
  { id: 'profile', icon: '◉', label: 'Profile' },
];

const MOBILE_NAV_ITEMS = [
  { id: 'dashboard', icon: '⊞', label: 'Home' },
  { id: 'habits', icon: '◎', label: 'Habits' },
  { id: 'analytics', icon: '◫', label: 'Analytics' },
];

let saveTimer = null;
const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// ── Mobile Bottom Nav ──
function MobileNav({ page, setPage }) {
  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-inner">
        {MOBILE_NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`mobile-nav-item${page === item.id ? ' active' : ''}`}
            onClick={() => setPage(item.id)}
          >
            <span className="mnav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── Mobile Drawer Sidebar ──
function MobileDrawer({ open, onClose, page, setPage, user, xp, streak, theme, setTheme }) {
  const level = calcLevel(xp);
  const goTo = (id) => { setPage(id); onClose(); };

  return (
    <>
      <div className={`mobile-drawer-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`mobile-drawer${open ? ' open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-logo">
            <div className="logo-icon" style={{ width: 28, height: 28, fontSize: '0.85rem' }}>✦</div>
            HabitPro
          </div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-nav">
          {ALL_NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`drawer-nav-item${page === item.id ? ' active' : ''}`}
              onClick={() => goTo(item.id)}
            >
              <span className="drawer-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="drawer-footer">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            <span className="mobile-stat-pill">🔥 {streak} streak</span>
            <span className="mobile-stat-pill">Lv.{level}</span>
            <span className="mobile-stat-pill">{xp} XP</span>
          </div>
          {user && (
            <div className="drawer-user-row">
              <div className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                {user.photoURL ? <img src={user.photoURL} alt="" /> : (user.displayName?.[0] || '?')}
              </div>
              <span className="drawer-user-name">{user.displayName || user.email}</span>
            </div>
          )}
          <div className="drawer-actions">
            <button className="icon-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button className="icon-btn" onClick={() => { signOutUser(); onClose(); }}>
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Mobile Header ──
function MobileHeader({ xp, streak, theme, setTheme, onMenuOpen }) {
  const level = calcLevel(xp);
  return (
    <div className="mobile-header">
      <div className="mobile-header-left">
        <button className="hamburger-btn" onClick={onMenuOpen}>☰</button>
        <span className="mobile-header-title">HabitPro</span>
      </div>
      <div className="mobile-header-right">
        <span className="mobile-stat-pill">🔥 {streak}</span>
        <span className="mobile-stat-pill">Lv.{level}</span>
        <button
          className="icon-btn"
          style={{ flex: 'none', width: 30, height: 30, fontSize: '0.7rem', color: 'var(--err)' }}
          title="Sign out"
          onClick={signOutUser}
        >
          🚪
        </button>
        <button
          className="icon-btn"
          style={{ flex: 'none', width: 30, height: 30, fontSize: '0.8rem' }}
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}

// ── Setup Banner shown when .env is not configured ──
function SetupBanner() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: 'rgba(251,191,36,0.12)', borderBottom: '1px solid rgba(251,191,36,0.35)',
      padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12,
      fontSize: '0.85rem', color: 'var(--warn)',
    }}>
      <span>⚠️</span>
      <span>
        <strong>Firebase not configured.</strong> Create a <code style={{ background: 'rgba(251,191,36,0.15)', padding: '1px 6px', borderRadius: 4 }}>.env</code> file with your Firebase keys to enable Google Sign-In and cloud sync.
      </span>
    </div>
  );
}

function App() {
  const [authState, setAuthState] = useState('loading');
  const [user, setUser] = useState(null);
  const [dataReady, setDataReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState('landing');
  const [theme, setTheme] = useState(() => localStorage.getItem('hp-theme') || 'dark');
  const [toast, setToast] = useState('');

  const [todayKey] = useState(() => fmtDate(new Date()));
  const [habits, setHabits] = useState([]);
  const [done, setDone] = useState({});
  const [history, setHistory] = useState({});
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lc, setLc] = useState(0);
  const [sql, setSql] = useState(0);

  const habitsRef = useRef(habits);
  useEffect(() => { habitsRef.current = habits; }, [habits]);

  // Theme sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hp-theme', theme);
  }, [theme]);

  // Auth listener
  useEffect(() => {
    return onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setAuthState('loggedIn');
        setPage('dashboard');
        try {
          let data = await loadUserData(firebaseUser.uid);
          if (!data) {
            data = {
              habits: [],
              done: {},
              history: {},
              xp: 0,
              level: 1,
              streak: 0,
              lc: 0,
              sql: 0,
            };
            await saveUserData(firebaseUser.uid, data);
          }
          setHabits(data.habits || []);
          setDone(data.done || {});
          setHistory(data.history || {});
          setXp(data.xp || 0);
          setStreak(data.streak || calcStreak(data.history || {}));
          setLc(data.lc || 0);
          setSql(data.sql || 0);
        } catch (e) {
          console.error('Failed to load user data:', e);
          setHabits([]);
          setHistory({});
          setStreak(0);
        }
        setDataReady(true);
      } else {
        setUser(null);
        setAuthState('loggedOut');
        setDataReady(false);
        setPage('landing');
      }
    });
  }, []);

  const debouncedSave = useCallback((data) => {
    if (!user) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveUserData(user.uid, data).catch(console.error);
    }, 900);
  }, [user]);

  const onSave = useCallback((partial) => {
    debouncedSave(partial);
  }, [debouncedSave]);

  const toggle = useCallback((id) => {
    const currentHabits = habitsRef.current;

    setDone((prevDone) => {
      const arr = prevDone[todayKey] || [];
      const isDone = arr.includes(id);
      const newArr = isDone ? arr.filter(x => x !== id) : [...arr, id];
      const newDone = { ...prevDone, [todayKey]: newArr };
      debouncedSave({ done: newDone });
      return newDone;
    });

    setXp((prevXp) => {
      const arr = (done[todayKey] || []);
      const isDone = arr.includes(id);
      if (isDone) return prevXp;
      const habit = currentHabits.find(h => h.id === id);
      const gained = habit?.xp || 20;
      const newXp = prevXp + gained;
      const newLevel = calcLevel(newXp);
      debouncedSave({ xp: newXp, level: newLevel });
      setToast(`+${gained} XP earned! ${habit?.icon || '⭐'}`);
      return newXp;
    });

    setHistory((prevHist) => {
      const arr = (done[todayKey] || []);
      const isDone = arr.includes(id);
      if (isDone) return prevHist;
      const newHist = { ...prevHist, [todayKey]: (prevHist[todayKey] || 0) + 1 };
      const newStreak = calcStreak(newHist);
      setStreak(newStreak);
      debouncedSave({ history: newHist, streak: newStreak });
      return newHist;
    });
  }, [done, todayKey, debouncedSave]);

  const onSaveHabits = useCallback((updatedHabits) => {
    debouncedSave({ habits: updatedHabits });
  }, [debouncedSave]);

  const onHabitsAdded = useCallback((newHabits) => {
    setHabits(prev => {
      const updated = [...prev, ...newHabits];
      debouncedSave({ habits: updated });
      return updated;
    });
  }, [debouncedSave]);

  const onDeleteHabit = useCallback((id) => {
    setHabits(prev => {
      const updated = prev.filter(h => h.id !== id);
      debouncedSave({ habits: updated });
      return updated;
    });
  }, [debouncedSave]);

  // ── Render ──

  if (authState === 'loading') {
    return (
      <>
        {!isConfigured && <SetupBanner />}
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 20, paddingTop: isConfigured ? 0 : 48 }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(139,120,255,0.2)', borderTopColor: 'var(--v)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <div style={{ color: 'var(--t3)', fontSize: '0.9rem', fontFamily: 'Syne,sans-serif' }}>Loading HabitPro…</div>
        </div>
      </>
    );
  }

  if (authState === 'loggedOut') {
    return (
      <>
        {!isConfigured && <SetupBanner />}
        <div style={{ paddingTop: isConfigured ? 0 : 48 }}>
          {page === 'login' ? <LoginPage /> : <LandingPage onLogin={() => setPage('login')} />}
        </div>
      </>
    );
  }

  if (!dataReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(139,120,255,0.2)', borderTopColor: 'var(--v)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  const pageProps = { user, habits, done, history, xp, streak, lc, sql, todayKey, onToggle: toggle, setPage, onSave };

  const renderPage = () => {
    switch (page) {
      case 'planner':   return <AIPlanner onHabitsAdded={onHabitsAdded} showToast={setToast} />;
      case 'daily':     return <DailyPrep lc={lc} sql={sql} setLc={setLc} setSql={setSql} onSave={onSave} />;
      case 'habits':    return <HabitTracker habits={habits} setHabits={setHabits} onSaveHabits={onSaveHabits} done={done} todayKey={todayKey} onToggle={toggle} xp={xp} />;
      case 'analytics': return <Analytics habits={habits} done={done} history={history} xp={xp} streak={streak} todayKey={todayKey} />;
      case 'schedule':  return <Schedule />;
      case 'profile':   return <Profile user={user} habits={habits} xp={xp} streak={streak} lc={lc} sql={sql} />;
      default:          return <Dashboard {...pageProps} setLc={setLc} setSql={setSql} onDeleteHabit={onDeleteHabit} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} user={user} xp={xp} streak={streak} history={history} theme={theme} setTheme={setTheme} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} page={page} setPage={setPage} user={user} xp={xp} streak={streak} theme={theme} setTheme={setTheme} />
      <MobileHeader xp={xp} streak={streak} theme={theme} setTheme={setTheme} onMenuOpen={() => setDrawerOpen(true)} />
      <main className="main-content">{renderPage()}</main>
      <MobileNav page={page} setPage={setPage} />
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}

export default App;
