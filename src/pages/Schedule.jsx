import { useState } from 'react';
import { ai, extractJSON } from '../utils/ai';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TYPE_CLASS = { study: 'time-block-study', habit: 'time-block-habit', break: 'time-block-break', other: 'time-block-other' };

export default function Schedule() {
  const [goal, setGoal] = useState('');
  const [hours, setHours] = useState('2');
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [tip, setTip] = useState('');
  const [error, setError] = useState('');

  const generate = async () => {
    if (!goal.trim()) { setError('Please enter your goal.'); return; }
    setLoading(true); setError('');
    try {
      const sys = 'Return ONLY raw JSON. Start { end }.';
      const prompt = `Create a realistic 7-day weekly schedule for someone with the goal: "${goal}". Available: ${hours} hours/day for focused work.
Return JSON: { "schedule": { "Monday": [{"time": "HH:MM", "duration": "Xmin", "task": string, "type": "study|habit|break|other"}], ... same for Tue-Sun }, "tip": string }
Include realistic meal/break times, study blocks, habit times. 5-8 blocks per day max.`;
      const raw = await ai(prompt, sys, 3000);
      const data = extractJSON(raw);
      if (!data.schedule) throw new Error('Invalid schedule format');
      setSchedule(data.schedule);
      setTip(data.tip || '');
    } catch (e) {
      setError('Failed to generate schedule: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">⊡ Weekly Schedule</h1>
        <p className="page-subtitle">AI-generated 7-day schedule tailored to your goals</p>
      </div>

      <div className="gc card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label>Your Goal</label>
            <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Get a job as a Data Scientist in 60 days" />
          </div>
          <div style={{ minWidth: 120 }}>
            <label>Hours/day</label>
            <select value={hours} onChange={e => setHours(e.target.value)}>
              {['1', '2', '3', '4'].map(h => <option key={h} value={h}>{h} hr{h !== '1' ? 's' : ''}/day</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ alignSelf: 'flex-end' }}>
            {loading ? <><div className="spinner" />Generating…</> : '⊡ Generate'}
          </button>
        </div>
        {error && <div className="error-box" style={{ marginTop: 10 }}>{error}</div>}
        {tip && <div className="ai-box fade-in" style={{ marginTop: 12 }}>💡 {tip}</div>}
      </div>

      {schedule && (
        <div className="schedule-grid fade-in">
          {DAYS.map(day => (
            <div key={day} className="day-col">
              <div className="day-header">{day.slice(0, 3)}</div>
              {(schedule[day] || []).map((block, i) => (
                <div key={i} className={`time-block ${TYPE_CLASS[block.type] || 'time-block-other'}`}>
                  <div className="time-label">{block.time} · {block.duration}</div>
                  <div className="block-task">{block.task}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {!schedule && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--t3)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⊡</div>
          <p>Enter your goal and generate a personalized weekly schedule</p>
        </div>
      )}
    </div>
  );
}
