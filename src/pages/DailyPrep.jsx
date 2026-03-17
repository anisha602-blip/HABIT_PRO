import { useState } from 'react';
import { ai, extractJSON } from '../utils/ai';

const CATEGORIES = ['Python', 'SQL', 'Machine Learning', 'Data Structures', 'System Design'];

export default function DailyPrep({ lc, sql, setLc, setSql, onSave }) {
  const [activeCat, setActiveCat] = useState('Python');
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loadingExpl, setLoadingExpl] = useState(false);
  const [error, setError] = useState('');

  const DIFF_COLOR = { Easy: 'badge-green', Medium: 'badge-amber', Hard: 'badge-red' };

  const generate = async () => {
    setLoading(true); setError(''); setQuestion(null);
    setShowHint(false); setShowAnswer(false); setExplanation('');
    try {
      const sys = 'Return ONLY raw JSON. Start { end }.';
      const prompt = `Generate a ${activeCat} interview question for a tech job interview.
Return JSON: { "question": string, "difficulty": "Easy"|"Medium"|"Hard", "hint": string, "answer": string (max 200 words), "followup": string }`;
      const raw = await ai(prompt, sys, 1200);
      setQuestion(extractJSON(raw));
    } catch (e) {
      setError('Failed to generate question: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async () => {
    setShowAnswer(true);
    setLoadingExpl(true);
    try {
      const expl = await ai(
        `Explain the answer to this ${activeCat} question in detail: "${question?.question}"\n\nCover: approach, time/space complexity, common mistakes, real-world use. Keep it under 250 words.`,
        '', 800
      );
      setExplanation(expl);
    } catch {}
    setLoadingExpl(false);
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">◈ Daily Interview Prep</h1>
        <p className="page-subtitle">Practice with AI-generated questions tailored to your target role</p>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Main Content */}
        <div>
          {/* Category pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} className={`cat-pill${activeCat === cat ? ' active' : ''}`} onClick={() => setActiveCat(cat)}>
                {cat}
              </button>
            ))}
          </div>

          <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ marginBottom: 20 }}>
            {loading ? <><div className="spinner" />Generating…</> : '◈ Generate Question'}
          </button>

          {error && <div className="error-box">{error}</div>}

          {question && (
            <div className="gc question-card fade-in">
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <span className="badge badge-violet">{activeCat}</span>
                <span className={`badge ${DIFF_COLOR[question.difficulty] || 'badge-violet'}`}>{question.difficulty}</span>
              </div>
              <div className="question-text">{question.question}</div>

              {!showHint && (
                <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }} onClick={() => setShowHint(true)}>
                  💡 Show Hint
                </button>
              )}
              {showHint && (
                <div className="hint-box">💡 {question.hint}</div>
              )}

              {!showAnswer ? (
                <button className="btn btn-primary btn-sm" onClick={handleReveal}>Reveal Answer</button>
              ) : (
                <div className="fade-in">
                  <div className="code-block">{question.answer}</div>
                  {question.followup && (
                    <div className="followup-box">🔗 Follow-up: {question.followup}</div>
                  )}
                  {loadingExpl
                    ? <div style={{ display: 'flex', gap: 8, padding: '12px 0', color: 'var(--t3)', fontSize: '0.85rem', alignItems: 'center' }}><div className="spinner" style={{ width: 16, height: 16 }} />Loading detailed explanation…</div>
                    : explanation && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Detailed Explanation</div>
                        <div className="ai-box">{explanation}</div>
                      </div>
                    )
                  }
                </div>
              )}
            </div>
          )}

          {!question && !loading && (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--t3)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>◈</div>
              <p>Select a category and generate your first question</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Practice Tracker */}
          <div className="gc counter-card">
            <div className="card-title" style={{ marginBottom: 14 }}>Practice Tracker</div>
            <div style={{ marginBottom: 14 }}>
              <div className="counter-header" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>💻 LeetCode</span>
                <a href="https://leetcode.com/problemset/" target="_blank" rel="noopener noreferrer" className="counter-link">Practice →</a>
              </div>
              <div className="counter-controls">
                <button className="counter-btn" onClick={() => { const v = Math.max(0, lc - 1); setLc(v); onSave({ lc: v }); }}>−</button>
                <div className="counter-val">{lc}</div>
                <button className="counter-btn" onClick={() => { const v = lc + 1; setLc(v); onSave({ lc: v }); }}>+</button>
              </div>
            </div>
            <div className="sep" />
            <div>
              <div className="counter-header" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>🗄️ SQL</span>
                <a href="https://leetcode.com/problemset/?topicSlugs=database" target="_blank" rel="noopener noreferrer" className="counter-link">Practice →</a>
              </div>
              <div className="counter-controls">
                <button className="counter-btn" onClick={() => { const v = Math.max(0, sql - 1); setSql(v); onSave({ sql: v }); }}>−</button>
                <div className="counter-val">{sql}</div>
                <button className="counter-btn" onClick={() => { const v = sql + 1; setSql(v); onSave({ sql: v }); }}>+</button>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="gc card">
            <div className="card-title">💡 Pro Tips</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Practice daily for 30 min — consistency beats intensity.',
                'Explain your thinking out loud as you work.',
                'Review solutions after each problem, even if you solved it.',
                'Focus on patterns, not memorizing solutions.',
              ].map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: '0.82rem', color: 'var(--t2)' }}>
                  <span style={{ color: 'var(--v2)', flexShrink: 0 }}>•</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
