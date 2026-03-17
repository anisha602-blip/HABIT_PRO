import { useState } from 'react';
import { ai } from '../utils/ai';
import { calcLevel, xpProgress, xpToNextLevel } from '../utils/gamification';

const ICONS = ['📖', '💻', '🏃', '🧘', '💪', '🎯', '📝', '🗄️', '🎨', '💰', '🌱', '🎵'];
const CATEGORIES = ['Study', 'Health', 'Work', 'Finance', 'Personal'];
const FREQS = ['Daily', 'Weekly', 'Weekdays', 'Weekends'];

export default function HabitTracker({ habits, setHabits, onSaveHabits, done, todayKey, onToggle, xp }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Study');
  const [freq, setFreq] = useState('Daily');
  const [xpVal, setXpVal] = useState(20);
  const [icon, setIcon] = useState('📖');
  const [formError, setFormError] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachInsights, setCoachInsights] = useState('');

  const level = calcLevel(xp);
  const prog = xpProgress(xp);
  const toNext = xpToNextLevel(xp);
  const todayDone = done[todayKey] || [];

  const addHabit = () => {
    if (!name.trim()) { setFormError('Please enter a habit name.'); return; }
    setFormError('');
    const habit = {
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(), category, freq,
      xp: Number(xpVal) || 20, icon,
    };
    const updated = [...habits, habit];
    setHabits(updated);
    onSaveHabits(updated);
    setName(''); setCategory('Study'); setFreq('Daily'); setXpVal(20); setIcon('📖'); setFormError('');
    setShowForm(false);
  };

  const deleteHabit = (id) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    onSaveHabits(updated);
  };

  const analyzeHabits = async () => {
    if (habits.length === 0) return;
    setCoachLoading(true); setCoachInsights('');
    try {
      const habitList = habits.map(h => `${h.icon} ${h.name} (${h.category}, ${h.freq}, ${h.xp}XP)`).join(', ');
      const completed = todayDone.length;
      const result = await ai(
        `Analyze these habits for a student: ${habitList}. Today completed: ${completed}/${habits.length}.
Provide exactly 3 insights: 1 success observation, 1 warning or risk, 1 actionable improvement.
Format as: ✅ [success]\n⚠️ [warning]\n💡 [improvement]`,
        '', 600
      );
      setCoachInsights(result);
    } catch (e) {
      setCoachInsights('Failed to analyze habits: ' + e.message);
    } finally {
      setCoachLoading(false);
    }
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catHabits = habits.filter(h => h.category === cat);
    if (catHabits.length) acc[cat] = catHabits;
    return acc;
  }, {});

  // XP Ring SVG
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (prog / 100) * circ;

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">◎ Habit Tracker</h1>
          <p className="page-subtitle">Build consistent habits and earn XP every day</p>
        </div>
          <button type="button" className="btn btn-primary" onClick={() => { setShowForm(v => !v); setFormError(''); }}>
            {showForm ? '✕ Cancel' : '+ Add Habit'}
          </button>
      </div>

      {/* Add Habit Form */}
      {showForm && (
        <div className="gc add-habit-form fade-in" style={{ marginBottom: 20 }}>
          <div className="card-title">New Habit</div>
          <div className="form-row">
            <div>
              <label>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning LeetCode" />
            </div>
            <div>
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row-3" style={{ marginBottom: 14 }}>
            <div>
              <label>Frequency</label>
              <select value={freq} onChange={e => setFreq(e.target.value)}>
                {FREQS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label>XP Reward</label>
              <input type="number" value={xpVal} onChange={e => setXpVal(e.target.value)} min="5" max="100" />
            </div>
            <div>
              <label>Selected Icon: {icon}</label>
              <div className="icon-grid">
                {ICONS.map(em => (
                  <button type="button" key={em} className={`icon-opt${icon === em ? ' sel' : ''}`} onClick={() => setIcon(em)}>{em}</button>
                ))}
              </div>
            </div>
          </div>
          {formError && <div className="error-box" style={{ marginBottom: 8 }}>{formError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={addHabit}>+ Add Habit</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Habits List */}
        <div>
          {habits.length === 0 ? (
            <div className="gc card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>◎</div>
              <p>No habits yet. Click "+ Add Habit" to get started!</p>
            </div>
          ) : (
            Object.entries(grouped).map(([cat, catHabits]) => (
              <div key={cat}>
                <div className="habit-group-title">{cat}</div>
                {catHabits.map(h => {
                  const isDone = todayDone.includes(h.id);
                  return (
                    <div key={h.id} className={`habit-row${isDone ? ' completed' : ''}`} style={{ marginBottom: 6 }}>
                      <div className={`habit-check${isDone ? ' done' : ''}`} onClick={() => onToggle(h.id)} />
                      <span className="habit-emoji">{h.icon}</span>
                      <span className="habit-name" style={{ flex: 1 }}>{h.name}</span>
                      <span className="badge badge-violet" style={{ fontSize: '0.7rem' }}>{h.freq}</span>
                      <span className="habit-xp-badge">+{h.xp} XP</span>
                      <button
                        onClick={() => deleteHabit(h.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}
                        title="Delete habit"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* XP Ring */}
          <div className="gc card" style={{ textAlign: 'center' }}>
            <div className="card-title">XP Progress</div>
            <div className="xp-ring-wrap">
              <svg width="130" height="130" viewBox="0 0 130 130">
                <defs>
                  <linearGradient id="xpring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B78FF" />
                    <stop offset="100%" stopColor="#C4B8FF" />
                  </linearGradient>
                </defs>
                <circle cx="65" cy="65" r={r} fill="none" stroke="var(--bg4)" strokeWidth="10" />
                <circle
                  cx="65" cy="65" r={r} fill="none"
                  stroke="url(#xpring)" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                  transform="rotate(-90 65 65)"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
                <text x="65" y="60" textAnchor="middle" fill="var(--text)" fontSize="22" fontWeight="700" fontFamily="Syne,sans-serif">{level}</text>
                <text x="65" y="80" textAnchor="middle" fill="var(--t3)" fontSize="10">LEVEL</text>
              </svg>
              <div style={{ color: 'var(--t3)', fontSize: '0.82rem' }}>{toNext} XP to next level</div>
              <div style={{ color: 'var(--v2)', font: '700 0.9rem Syne,sans-serif' }}>{xp} Total XP</div>
            </div>
          </div>

          {/* AI Habit Coach */}
          <div className="gc card">
            <div className="card-title">🤖 AI Habit Coach</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--t2)', marginBottom: 12 }}>Get personalized insights based on your habits.</p>
            <button className="btn btn-ghost btn-sm" onClick={analyzeHabits} disabled={coachLoading || habits.length === 0}>
              {coachLoading ? <><div className="spinner" style={{ width: 14, height: 14 }} />Analyzing…</> : '🔍 Analyze My Habits'}
            </button>
            {coachInsights && (
              <div className="ai-box fade-in" style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{coachInsights}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
