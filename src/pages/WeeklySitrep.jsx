import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { SUBJECT_COLORS } from '../data';

export default function WeeklySitrep() {
  const { 
    zh_mocks, streak, settings, sitrep, setSitrep, 
    zh_weeklyJournals, setWeeklyJournals, zh_xp, setXP,
    zh_dailyChecklist, zh_sessionLogs 
  } = useAppStore(
    useShallow(s => ({
      zh_mocks: s.zh_mocks,
      streak: s.streak,
      settings: s.settings,
      sitrep: s.sitrep,
      setSitrep: s.setSitrep,
      zh_weeklyJournals: s.zh_weeklyJournals,
      setWeeklyJournals: s.setWeeklyJournals,
      zh_xp: s.zh_xp,
      setXP: s.setXP,
      zh_dailyChecklist: s.zh_dailyChecklist,
      zh_sessionLogs: s.zh_sessionLogs
    }))
  );

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const weekInfo = useMemo(() => {
    const now = new Date();
    // Monday is start of the week
    now.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) + (currentWeekOffset * 7));
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const weekNum = Math.ceil((((start - new Date(start.getFullYear(), 0, 1)) / 8.64e7) + new Date(start.getFullYear(), 0, 1).getDay() + 1) / 7);
    const weekKey = `${start.getFullYear()}-W${weekNum}`;
    
    return { start, end, weekNum, weekKey };
  }, [currentWeekOffset]);

  // Aggregate completion stats per slot type for the week
  const weekChecklistStats = useMemo(() => {
    const counts = {
      'Maths': { done: 0, total: 0 },
      'Economics': { done: 0, total: 0 },
      'GS-Subject': { done: 0, total: 0 },
      'Revision': { done: 0, total: 0 },
      'PYQ': { done: 0, total: 0 },
      'Mock': { done: 0, total: 0 },
      'Current Affairs': { done: 0, total: 0 }
    };

    Object.entries(zh_dailyChecklist || {}).forEach(([dateStr, dayData]) => {
      const d = new Date(dateStr);
      if (d >= weekInfo.start && d <= weekInfo.end) {
        if (dayData.maths) {
          counts['Maths'].total++;
          if (dayData.maths.done) counts['Maths'].done++;
        }
        if (dayData.economics) {
          counts['Economics'].total++;
          if (dayData.economics.done) counts['Economics'].done++;
        }
        if (dayData.revision) {
          counts['Revision'].total++;
          if (dayData.revision.done) counts['Revision'].done++;
        }
        if (dayData.pyq) {
          counts['PYQ'].total++;
          if (dayData.pyq.done) counts['PYQ'].done++;
        }
        if (dayData.currentAffairs) {
          counts['Current Affairs'].total++;
          if (dayData.currentAffairs.done) counts['Current Affairs'].done++;
        }
        if (dayData.mock) {
          counts['Mock'].total++;
          if (dayData.mock.done) counts['Mock'].done++;
        }
        if (dayData.subjects) {
          Object.keys(dayData.subjects).forEach(subName => {
            const topics = dayData.subjects[subName];
            Object.values(topics).forEach(topicState => {
              counts['GS-Subject'].total += 2;
              if (topicState.understood) counts['GS-Subject'].done++;
              if (topicState.onepager) counts['GS-Subject'].done++;
            });
          });
        }
      }
    });

    return counts;
  }, [zh_dailyChecklist, weekInfo]);

  // Aggregate study hours logged this week
  const weekTotalHours = useMemo(() => {
    const mins = (zh_sessionLogs || []).filter(log => {
      const d = new Date(log.date);
      return d >= weekInfo.start && d <= weekInfo.end;
    }).reduce((acc, log) => acc + log.duration, 0);
    return Math.round((mins / 60) * 10) / 10;
  }, [zh_sessionLogs, weekInfo]);

  // Subject hours breakdown for this week
  const subBreakdown = useMemo(() => {
    const breakdown = {};
    (zh_sessionLogs || []).forEach(log => {
      const d = new Date(log.date);
      if (d >= weekInfo.start && d <= weekInfo.end) {
        breakdown[log.subject] = (breakdown[log.subject] || 0) + log.duration / 60;
      }
    });
    return breakdown;
  }, [zh_sessionLogs, weekInfo]);

  // Find neglected subject (lowest hours this week)
  const neglectedSubject = useMemo(() => {
    const activeSubjects = [
      'Physics', 'Chemistry', 'Biology', 'Polity', 'Geography', 'Economics',
      'History-Ancient', 'History-Medieval', 'History-Modern', 'Maths'
    ];
    let minHrs = Infinity;
    let minSub = 'None';
    
    activeSubjects.forEach(sub => {
      const hrs = subBreakdown[sub] || 0;
      if (hrs < minHrs) {
        minHrs = hrs;
        minSub = sub;
      }
    });
    
    return minSub === 'None' ? 'None' : minSub;
  }, [subBreakdown]);

  // Mock aggregates for the week
  const mockStats = useMemo(() => {
    const weekMocks = zh_mocks.filter(m => {
      const d = new Date(m.date);
      return d >= weekInfo.start && d <= weekInfo.end;
    });

    const lastWeekMocks = zh_mocks.filter(m => {
      const d = new Date(m.date);
      const lastStart = new Date(weekInfo.start);
      lastStart.setDate(lastStart.getDate() - 7);
      const lastEnd = new Date(weekInfo.end);
      lastEnd.setDate(lastEnd.getDate() - 7);
      return d >= lastStart && d <= lastEnd;
    });

    const avgScore = weekMocks.length > 0 ? weekMocks.reduce((a, b) => a + (b.calculated?.totalMarks || 0), 0) / weekMocks.length : 0;
    const lastAvgScore = lastWeekMocks.length > 0 ? lastWeekMocks.reduce((a, b) => a + (b.calculated?.totalMarks || 0), 0) / lastWeekMocks.length : 0;
    const delta = avgScore - lastAvgScore;

    return { avgScore, delta };
  }, [zh_mocks, weekInfo]);

  const handleNotesBlur = (val) => {
    const newSitrep = { ...sitrep };
    if (!newSitrep[weekInfo.weekKey]) newSitrep[weekInfo.weekKey] = {};
    newSitrep[weekInfo.weekKey].manualNotes = val;
    setSitrep(newSitrep);
  };

  const journal = zh_weeklyJournals[weekInfo.weekKey] || {
    best: '', worst: '', distraction: '', fix: ''
  };

  const updateJournal = (key, val) => {
    const updated = { ...zh_weeklyJournals, [weekInfo.weekKey]: { ...journal, [key]: val } };
    setWeeklyJournals(updated);
  };

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: 5 }}>WEEKLY SITREP Rollup</h1>
          <p style={{ color: 'var(--text4)', fontSize: 11 }}>Intelligence rollup report for operational week {weekInfo.weekNum}.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={() => setCurrentWeekOffset(o => o - 1)} style={{ padding: '4px 12px' }}>←</button>
          <div className="label-caps" style={{ alignSelf: 'center', fontSize: 10 }}>{weekInfo.weekKey}</div>
          <button className="btn" onClick={() => setCurrentWeekOffset(o => o + 1)} style={{ padding: '4px 12px' }}>→</button>
        </div>
      </div>

      {/* Structured Tactical Summary */}
      <div className="card" style={{ 
        fontFamily: 'monospace', borderColor: 'var(--indigo)', background: 'rgba(99, 102, 241, 0.02)',
        padding: '25px', marginBottom: 30, borderStyle: 'dashed', fontSize: 12
      }}>
        <div style={{ textAlign: 'center', borderBottom: '1px solid var(--indigo)', paddingBottom: 15, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>WEEKLY DEPLOYMENT INTEL</div>
          <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 5 }}>CLASSIFIED: READ-ONLY ROLLUP REPORT</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
          <div>
            {/* Slot Completion Rates */}
            <div style={{ marginBottom: 15 }}>
              <div className="label-caps" style={{ fontSize: 10, marginBottom: 8, color: 'var(--text4)' }}>SLOT COMPLETION RATES:</div>
              {Object.entries(weekChecklistStats).map(([name, stats]) => {
                const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                return (
                  <div key={name} style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                      <span>{name.toUpperCase()}</span>
                      <span>{percent}% ({stats.done}/{stats.total})</span>
                    </div>
                    <div style={{ height: 2, background: 'var(--bg4)', marginTop: 2 }}>
                      <div style={{ height: '100%', background: 'var(--indigo)', width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ fontSize: 11, marginTop: 15 }}>
              <span style={{ color: 'var(--red)' }}>NEGLECTED SECTOR:</span>
              <span style={{ marginLeft: 10, fontWeight: 800 }}>{neglectedSubject.toUpperCase()}</span>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: 15 }}>
              <span style={{ color: 'var(--text4)' }}>SESSION LOGS:</span>
              <span style={{ marginLeft: 10, fontWeight: 900 }}>{weekTotalHours}h total study time</span>
            </div>

            <div style={{ marginBottom: 15 }}>
              <span style={{ color: 'var(--text4)' }}>STREAK STATUS:</span>
              <span style={{ marginLeft: 10, fontWeight: 900, color: 'var(--green)' }}>{streak.current} DAYS (ACTIVE)</span>
            </div>

            <div style={{ marginBottom: 15 }}>
              <span style={{ color: 'var(--text4)' }}>MOCK PERFORMANCE:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                <span style={{ fontWeight: 900, fontSize: 18 }}>{mockStats.avgScore.toFixed(1)}M</span>
                {mockStats.delta !== 0 && (
                  <span style={{ color: mockStats.delta > 0 ? 'var(--green)' : 'var(--red)', fontSize: 12 }}>
                    {mockStats.delta > 0 ? '▲' : '▼'} {Math.abs(mockStats.delta).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            
            {/* Subject study distribution list */}
            {Object.keys(subBreakdown).length > 0 && (
              <div style={{ marginTop: 15 }}>
                <div className="label-caps" style={{ fontSize: 9, color: 'var(--text4)', marginBottom: 5 }}>DISTRIBUTION BREAKDOWN:</div>
                {Object.entries(subBreakdown).map(([sub, h]) => (
                  <div key={sub} style={{ fontSize: 10, color: 'var(--text3)' }}>
                    • {sub}: {Math.round(h * 10) / 10}h
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strategic Assessment Journal */}
      <div className="card" style={{ borderColor: 'var(--amber)', marginBottom: 30 }}>
        <div className="label-caps" style={{ color: 'var(--amber)', marginBottom: 20 }}>Weekly Review — Strategic Assessment</div>
        <div className="g2">
          <div>
            <label className="label-caps" style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>Best Subject this week?</label>
            <input className="inp" value={journal.best} onChange={e => updateJournal('best', e.target.value)} placeholder="..." />
          </div>
          <div>
            <label className="label-caps" style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>Worst Subject / Needs Focus?</label>
            <input className="inp" value={journal.worst} onChange={e => updateJournal('worst', e.target.value)} placeholder="..." />
          </div>
          <div>
            <label className="label-caps" style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>Biggest Distraction?</label>
            <input className="inp" value={journal.distraction} onChange={e => updateJournal('distraction', e.target.value)} placeholder="..." />
          </div>
          <div>
            <label className="label-caps" style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>One thing to fix next week?</label>
            <input className="inp" value={journal.fix} onChange={e => updateJournal('fix', e.target.value)} placeholder="..." />
          </div>
        </div>
      </div>

      {/* Personal reflections */}
      <div className="card">
        <div className="label-caps" style={{ marginBottom: 15 }}>Mission Debrief — Personal Reflections</div>
        <textarea 
          className="ta"
          defaultValue={sitrep[weekInfo.weekKey]?.manualNotes || ''}
          onBlur={(e) => handleNotesBlur(e.target.value)}
          placeholder="Enter reflections on this week's deployment..."
          style={{ minHeight: 150 }}
        />
      </div>

      <style>{`
        .ta { width: 100%; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 15px; color: var(--text); resize: vertical; }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
