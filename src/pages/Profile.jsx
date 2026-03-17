import { calcLevel, getLevelTitle, LEVEL_TITLES } from '../utils/gamification';

const ACHIEVEMENTS = [
  { id: 'streak7', icon: '🔥', name: 'Streak Master', desc: '7+ day streak', check: (d) => d.streak >= 7 },
  { id: 'lc50', icon: '💻', name: 'LeetCoder', desc: '50 LeetCode solved', check: (d) => d.lc >= 50 },
  { id: 'sql30', icon: '🗄️', name: 'SQL Expert', desc: '30 SQL problems', check: (d) => d.sql >= 30 },
  { id: 'habits5', icon: '✦', name: 'Habit Hero', desc: '5+ active habits', check: (d) => d.habits >= 5 },
  { id: 'xp1000', icon: '⚡', name: 'XP Grinder', desc: '1000+ total XP', check: (d) => d.xp >= 1000 },
  { id: 'focused', icon: '🎯', name: 'Focused', desc: '7+ day streak', check: (d) => d.streak >= 7 },
];

const LEVEL_DEFS = [
  { title: 'Beginner', range: '1–3', desc: 'Just getting started' },
  { title: 'Explorer', range: '4–6', desc: 'Building momentum' },
  { title: 'Practitioner', range: '7–9', desc: 'Consistent grinder' },
  { title: 'Specialist', range: '10–12', desc: 'Deeply committed' },
  { title: 'Expert', range: '13–15', desc: 'Interview-ready' },
  { title: 'Master', range: '16–18', desc: 'Top performer' },
  { title: 'Grand Master', range: '19+', desc: 'Elite achiever' },
];

export default function Profile({ user, habits, xp, streak, lc, sql }) {
  const level = calcLevel(xp);
  const title = getLevelTitle(level);
  const firstName = user?.displayName?.split(' ')[0] || 'User';
  const initials = (user?.displayName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const achieveData = { streak, lc, sql, habits: habits.length, xp, level };

  const currentTierIdx = Math.min(Math.floor((level - 1) / 3), LEVEL_DEFS.length - 1);

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">◉ Profile</h1>
        <p className="page-subtitle">Your journey, achievements, and progress</p>
      </div>

      <div className="grid-2">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Profile Card */}
          <div className="gc card" style={{ textAlign: 'center' }}>
            <div className="profile-photo" style={{ margin: '0 auto 14px' }}>
              {user?.photoURL
                ? <img src={user.photoURL} alt={firstName} referrerPolicy="no-referrer" />
                : initials}
            </div>
            <div style={{ fontFamily: 'Syne', fontSize: '1.3rem', fontWeight: 800 }}>{user?.displayName || 'User'}</div>
            <div style={{ color: 'var(--t3)', fontSize: '0.82rem', marginBottom: 8 }}>{user?.email}</div>
            <div className="badge badge-violet" style={{ fontSize: '0.82rem', padding: '5px 14px' }}>{title}</div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Level', value: level, color: 'var(--v2)' },
              { label: 'XP', value: xp, color: 'var(--text)' },
              { label: 'Streak', value: `🔥${streak}`, color: 'var(--warn)' },
              { label: 'Habits', value: habits.length, color: 'var(--ok)' },
            ].map(s => (
              <div key={s.label} className="gc stat-card" style={{ padding: '14px' }}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: '1.6rem', color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Practice Stats */}
          <div className="gc card">
            <div className="card-title">Practice Stats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem' }}>💻 LeetCode Solved</span>
                <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', color: 'var(--v2)' }}>{lc}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem' }}>🗄️ SQL Solved</span>
                <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', color: 'var(--info)' }}>{sql}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Achievements */}
          <div className="gc card">
            <div className="card-title">Achievements</div>
            <div className="achievement-grid">
              {ACHIEVEMENTS.map(ach => {
                const earned = ach.check(achieveData);
                return (
                  <div key={ach.id} className={`gc achievement-card${earned ? '' : ' locked'}`}>
                    <div className="achievement-emoji">{ach.icon}</div>
                    <div className="achievement-name">{ach.name}</div>
                    <div className="achievement-desc">{ach.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level Roadmap */}
          <div className="gc card">
            <div className="card-title">Level Roadmap</div>
            <div className="level-roadmap">
              {LEVEL_DEFS.map((def, i) => {
                const isAchieved = i < currentTierIdx;
                const isCurrent = i === currentTierIdx;
                return (
                  <div key={i} className="level-roadmap-item">
                    <div className={`level-circle ${isAchieved ? 'done' : isCurrent ? 'current' : 'pending'}`}>
                      {isAchieved ? '✓' : isCurrent ? level : '-'}
                    </div>
                    <div>
                      <div className="level-info-title" style={{ color: isCurrent ? 'var(--v2)' : isAchieved ? 'var(--ok)' : 'var(--t3)' }}>
                        {def.title} <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--t3)' }}>Lv {def.range}</span>
                      </div>
                      <div className="level-info-sub">{def.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
