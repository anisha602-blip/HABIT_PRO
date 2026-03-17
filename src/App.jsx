import { useState, useEffect, useRef, useCallback } from 'react';
import './styles.css';

import { onAuthChange, loadUserData, saveUserData, isConfigured } from './firebase';
import { calcLevel, calcStreak, seedHistory } from './utils/gamification';
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

// ── Default habits for new users ──
const DEFAULT_HABITS = [
  { id: 'default-1', name: 'Morning LeetCode', category: 'Study', freq: 'Daily', xp: 30, icon: '💻' },
  { id: 'default-2', name: 'SQL Practice', category: 'Study', freq: 'Daily', xp: 25, icon: '🗄️' },
  { id: 'default-3', name: 'Morning Run', category: 'Health', freq: 'Daily', xp: 20, icon: '🏃' },
  { id: 'default-4', name: 'Read 20 pages', category: 'Work', freq: 'Daily', xp: 15, icon: '📖' },
  { id: 'default-5', name: 'Meditation', category: 'Health', freq: 'Daily', xp: 15, icon: '🧘' },
];

const MOBILE_NAV_ITEMS = [
  { id: 'dashboard', icon: '⊞', label: 'Home' },
  { id: 'planner', icon: '✦', label: 'Planner' },
  { id: 'daily', icon: '◈', label: 'Prep' },
  { id: 'habits', icon: '◎', label: 'Habits' },
  { id: 'profile', icon: '◉', label: 'Me' },
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

// ── Mobile Header ──
function MobileHeader({ xp, streak, theme, setTheme }) {
  const level = calcLevel(xp);
  return (
    <div className="mobile-header">
      <div className="mobile-header-left">
        <div className="logo-icon" style={{ width: 28, height: 28, fontSize: '0.85rem' }}>✦</div>
        <span className="mobile-header-title">HabitPro</span>
      </div>
      <div className="mobile-header-right">
        <span className="mobile-stat-pill">🔥 {streak}</span>
        <span className="mobile-stat-pill">Lv.{level}</span>
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
  const [page, setPage] = useState('landing');
  const [theme, setTheme] = useState(() => localStorage.getItem('hp-theme') || 'dark');
  const [toast, setToast] = useState('');

  const [todayKey] = useState(() => fmtDate(new Date()));
  const [habits, setHabits] = useState([]);
  const [done, setDone] = useState({});
  const [history, setHistory] = useState({});
  const [xp, setXp] = useState(840);
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
            const hist = seedHistory();
            data = {
              habits: DEFAULT_HABITS,
              done: {},
              history: hist,
              xp: 840,
              level: calcLevel(840),
              streak: calcStreak(hist),
              lc: 0,
              sql: 0,
            };
            await saveUserData(firebaseUser.uid, data);
          }
          setHabits(data.habits || DEFAULT_HABITS);
          setDone(data.done || {});
          setHistory(data.history || {});
          setXp(data.xp || 840);
          setStreak(data.streak || calcStreak(data.history || {}));
          setLc(data.lc || 0);
          setSql(data.sql || 0);
        } catch (e) {
          console.error('Failed to load user data:', e);
          const hist = seedHistory();
          setHabits(DEFAULT_HABITS);
          setHistory(hist);
          setStreak(calcStreak(hist));
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
      default:          return <Dashboard {...pageProps} setLc={setLc} setSql={setSql} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} user={user} xp={xp} streak={streak} history={history} theme={theme} setTheme={setTheme} />
      <MobileHeader xp={xp} streak={streak} theme={theme} setTheme={setTheme} />
      <main className="main-content">{renderPage()}</main>
      <MobileNav page={page} setPage={setPage} />
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}

export default App;
