import { useState } from 'react';
import { ai, extractJSON } from '../utils/ai';

const ROLES = ['', 'Software Engineer', 'Data Scientist', 'ML Engineer', 'Data Analyst', 'Backend Engineer', 'Frontend Engineer'];
const TIMELINES = ['30', '60', '90'];
const HOURS = ['1', '2', '4'];
const LANGS = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Tamil', 'Telugu', 'Portuguese'];
const TYPE_ICON = { video: '🎬', code: '💻', article: '📄' };

export default function AIPlanner({ onHabitsAdded, showToast }) {
  const [role, setRole] = useState('');
  const [days, setDays] = useState('60');
  const [hours, setHours] = useState('2');
  const [lang, setLang] = useState('English');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');
  const [expandedTasks, setExpandedTasks] = useState({});
  const [taskTips, setTaskTips] = useState({});
  const [loadingTips, setLoadingTips] = useState({});

  const generate = async () => {
    if (!role.trim()) { setError('Please enter a target role.'); return; }
    setLoading(true); setError(''); setRoadmap(null);
    try {
      const sys = 'Return ONLY raw JSON object, no markdown, no backticks. Start with { end with }.';
      const weeks = Math.ceil(parseInt(days) / 7);
      const prompt = `Create a ${days}-day study roadmap for a ${role} role. ${hours} hours/day, in ${lang}. Weeks: ${weeks}.
Return JSON: { "title": string, "overview": string, "tip": string, "weeks": [{ "week": number, "theme": string, "goal": string, "xp": number, "topics": [string], "tasks": [{ "task": string, "resource": "https://youtube.com/results?search_query=...", "type": "video|code|article" }] }] }`;
      const raw = await ai(prompt, sys, 6000);
      const data = extractJSON(raw);
      if (!data.weeks || data.weeks.length === 0) throw new Error('Invalid roadmap format');
      setRoadmap(data);
      // Auto-add Week 1's first 3 tasks as habits
      const week1Tasks = data.weeks[0]?.tasks?.slice(0, 3) || [];
      if (week1Tasks.length > 0 && onHabitsAdded) {
        onHabitsAdded(week1Tasks.map(t => ({
          id: `plan-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          name: t.task.slice(0, 50),
          category: 'Study',
          freq: 'Daily',
          xp: 25,
          icon: '📖',
        })));
        showToast('3 habits added from roadmap! 📖');
      }
    } catch (e) {
      setError('Failed to generate roadmap: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (wIdx, tIdx) => {
    const key = `${wIdx}-${tIdx}`;
    const isOpen = expandedTasks[key];
    setExpandedTasks(p => ({ ...p, [key]: !isOpen }));
    if (!isOpen && !taskTips[key]) {
      setLoadingTips(p => ({ ...p, [key]: true }));
      try {
        const task = roadmap.weeks[wIdx].tasks[tIdx].task;
        const tips = await ai(`Give 3 practical implementation tips for: "${task}". Format as numbered list. Keep each tip under 60 words.`);
        setTaskTips(p => ({ ...p, [key]: tips }));
      } catch {}
      setLoadingTips(p => ({ ...p, [key]: false }));
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">✦ AI Study Planner</h1>
          <p className="page-subtitle">Generate a personalized learning roadmap for your target role</p>
        </div>
        {roadmap && (
          <button className="btn btn-ghost btn-sm" onClick={generate} disabled={loading}>
            {loading ? '⌛' : '↻'} Regenerate
          </button>
        )}
      </div>

      {/* Config */}
      <div className="gc card" style={{ marginBottom: 20 }}>
        <div className="config-grid">
          <div>
            <label>Target Role</label>
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Data Scientist" list="roles-list" />
            <datalist id="roles-list">{ROLES.filter(Boolean).map(r => <option key={r} value={r} />)}</datalist>
          </div>
          <div>
            <label>Timeline</label>
            <select value={days} onChange={e => setDays(e.target.value)}>
              {TIMELINES.map(d => <option key={d} value={d}>{d} days</option>)}
            </select>
          </div>
          <div>
            <label>Daily Hours</label>
            <select value={hours} onChange={e => setHours(e.target.value)}>
              {HOURS.map(h => <option key={h} value={h}>{h} hr{h !== '1' ? 's' : ''}/day</option>)}
            </select>
          </div>
          <div>
            <label>Language</label>
            <select value={lang} onChange={e => setLang(e.target.value)}>
              {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        {error && <div className="error-box">{error}</div>}
        <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? <><div className="spinner" />Generating Roadmap…</> : '✦ Generate Roadmap'}
        </button>
      </div>

      {/* Roadmap */}
      {roadmap && (
        <div className="fade-in">
          <div className="gc card" style={{ marginBottom: 16, borderColor: 'rgba(139,120,255,0.35)' }}>
            <h2 style={{ fontFamily: 'Syne', fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>{roadmap.title}</h2>
            <p style={{ color: 'var(--t2)', marginBottom: 14, fontSize: '0.9rem' }}>{roadmap.overview}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <span className="badge badge-violet">📅 {days} days</span>
              <span className="badge badge-violet">⏱ {hours}h/day</span>
              <span className="badge badge-violet">🌐 {lang}</span>
              <span className="badge badge-violet">📋 {roadmap.weeks?.length} weeks</span>
            </div>
            <div className="ai-box">💡 {roadmap.tip}</div>
            <div className="badge badge-green" style={{ marginTop: 12, padding: '6px 12px' }}>✓ Week 1 tasks added to habits!</div>
          </div>

          {roadmap.weeks?.map((week, wIdx) => (
            <div key={wIdx} className="gc week-card">
              <div className="week-badge">W{week.week}</div>
              <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{week.theme}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--t2)', marginBottom: 8 }}>{week.goal}</p>
              <div className="topic-tags">
                {week.topics?.map((t, i) => <span key={i} className="topic-tag">{t}</span>)}
                <span className="badge badge-amber">+{week.xp} XP</span>
              </div>
              <div className="sep" />
              {week.tasks?.map((task, tIdx) => {
                const key = `${wIdx}-${tIdx}`;
                const isOpen = expandedTasks[key];
                return (
                  <div key={tIdx}>
                    <div className="task-row">
                      <span className="task-type-icon">{TYPE_ICON[task.type] || '📄'}</span>
                      <span className="task-name">{task.task}</span>
                      {task.resource && (
                        <a href={task.resource} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>▶</a>
                      )}
                      <span className={`task-expand${isOpen ? ' open' : ''}`} onClick={() => toggleTask(wIdx, tIdx)}>▾</span>
                    </div>
                    {isOpen && (
                      <div className="task-tips fade-in">
                        {loadingTips[key]
                          ? <div style={{ display: 'flex', gap: 8, color: 'var(--t3)', fontSize: '0.82rem' }}><div className="spinner" style={{ width: 14, height: 14 }} />Loading tips…</div>
                          : <div style={{ whiteSpace: 'pre-wrap' }}>{taskTips[key] || 'No tips available.'}</div>
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {!roadmap && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t3)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>✦</div>
          <p>Configure your preferences above and generate your personalized roadmap</p>
        </div>
      )}
    </div>
  );
}
