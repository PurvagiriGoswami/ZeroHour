# ZeroHour V5.0 — Master Implementation Prompt

> **Stack:** React 18 + Vite 5 + Zustand 5 + Firebase Firestore + Tailwind CSS v4 + Recharts  
> **Target:** zerohour-pvg.vercel.app | GitHub: PurvagiriGoswami/ZeroHour  
> **Scope:** Interconnected data architecture, dashboard overhaul, date system, real-time analytics, pixel-perfect UI  
> **Last updated:** June 2026

---

## 0. GROUND RULES BEFORE YOU TOUCH ANY FILE

1. **Do NOT read README.md for feature reference** — it is outdated. All feature truth comes from the live JSX pages and `useStore.js`.
2. **Single source of truth = Zustand store** (`src/store/useStore.js`). Every feature reads from and writes to this store. No component holds authoritative data in local state.
3. **Every mutation in the store must trigger derived-state recomputation** via a `computeDerived()` function called at the end of every `set()` action.
4. **Dates always use ISO strings (`YYYY-MM-DD`) as keys**, never timestamps or locale strings, to avoid timezone bugs.
5. **All UI colours, spacing, and typography must use the existing CSS variable system** in `src/index.css`. Do not hardcode hex values anywhere.
6. **The old "Smart Planner" page is fully replaced** by the new Weekly Planner. Remove the Smart Planner component and all references to it. Do not keep it as a separate page or panel.
7. **No bottom navigation bar on mobile.** Navigation on all screen sizes uses a left sidebar that is collapsible/slideable on mobile (overlay drawer with backdrop on small screens, persistent collapsed rail on desktop).

---

## 1. DATA ARCHITECTURE OVERHAUL — The Interconnection Engine

This is the most critical change in V5.0. Implement a **reactive derived-state layer** inside Zustand that makes every feature aware of changes in every other feature automatically.

### 1.1 Exam Configuration (Single Editable Source)

Add an `exams` array to the store. This is the **only place** exam dates are stored. Every countdown, progress bar, and tag across the entire app derives from this array.

```js
// In useStore.js — initial state
exams: [
  {
    id: 'afcat1_2026',
    label: 'AFCAT 1 2026',
    date: '2026-08-08',
    subjects: ['GK', 'English', 'Reasoning', 'Maths'],
  },
  {
    id: 'cds2_2026',
    label: 'CDS II 2026',
    date: '2026-09-13',
    subjects: ['Maths', 'English', 'GK'],
  },
  {
    id: 'cds1_2027',
    label: 'CDS I 2027',
    date: '2027-02-08',
    subjects: ['Maths', 'English', 'GK'],
  },
],
```

The Settings page must allow the user to:
- Add a new exam (label, date, subjects)
- Edit an existing exam's date or label
- Delete an exam

Every change to `exams` must call `computeDerived()` so all countdown displays update instantly everywhere.

---

### 1.2 Weekly Planner → Daily Targets → Session Log — The Core Pipeline

This three-stage pipeline is the backbone of V5.0. Every stage feeds the next automatically.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE INTERCONNECTION PIPELINE                        │
│                                                                             │
│  WEEKLY PLANNER          DAILY TARGETS          SESSION LOG                 │
│                                                                             │
│  User sets:              computeDerived()        User clicks [Start]:       │
│  Subject + Topic    ───► auto-populates     ───► session skeleton           │
│  Duration               today's targets          auto-created               │
│  Day of week            from the plan            with start time            │
│  Exam tag                                                                   │
│                          User clicks [Done]:      User edits:               │
│                          status = 'done'     ───► actual time               │
│                          session closes           Q attempted/correct        │
│                                                   notes, mood               │
│                                ↓                        ↓                   │
│                         computeDerived() fires on every change              │
│                                ↓                                            │
│              Dashboard ◄── Analytics ◄── Habits ◄── all update             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 1.3 Store Shape — New Keys

Add these keys to `useStore.js` initial state. Do not remove any existing keys.

```js
// --- WEEKLY PLAN ---
// Keys are DOW abbreviations: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
// Each entry is a template that repeats every week by default.
// Topic is editable per-week via weeklyPlanOverrides.
weeklyPlan: {
  Mon: [],
  Tue: [],
  Wed: [],
  Thu: [],
  Fri: [],
  Sat: [],
  Sun: [],
},

// Per-week topic overrides: key = 'YYYY-WW:planItemId' → topic string
// Allows user to keep recurring structure but change the topic each week
weeklyPlanOverrides: {},

// --- DAILY TARGETS ---
// Auto-populated by computeDerived() from weeklyPlan for today's DOW.
// User can also add one-off ad-hoc targets for any specific date.
dailyTargets: {
  // 'YYYY-MM-DD': [ ...targetObjects ]
},

// --- SESSION LOG ---
// Auto-created when user starts a daily target; also supports manual entries.
sessionLog: {
  // 'YYYY-MM-DD': [ ...sessionObjects ]
},

// --- DERIVED STATE (read-only, never synced to Firebase) ---
derived_todayCompletion: 0,          // 0–100
derived_subjectTimeToday: {},        // { Maths: 90, GK: 60, ... }
derived_weeklyHours: [],             // [{ date, minutes }, ...]
derived_examCountdowns: [],          // sorted ascending by daysLeft
derived_analytics: {},               // rolling stats
derived_streak: 0,                   // consecutive study days
```

**Weekly plan item shape:**

```js
{
  id: 'uuid',                        // crypto.randomUUID()
  subject: 'Maths',                  // 'Maths'|'English'|'GK'|'PYQ'|'Mock'|'Revision'|'Free'
  topic: 'Trigonometry',             // default topic; overridden per-week via weeklyPlanOverrides
  targetMinutes: 90,
  examTag: 'cds2_2026',             // optional — links to exams[].id
  recurring: true,                   // true = repeats every week; false = one-off week instance
  order: 0,                          // display order within the day column
}
```

**Daily target item shape:**

```js
{
  id: 'uuid',
  weeklyPlanItemId: 'uuid',         // null for ad-hoc targets
  date: 'YYYY-MM-DD',               // always set explicitly
  subject: 'Maths',
  topic: 'Trigonometry',            // resolved: weeklyPlanOverrides > weeklyPlan default
  targetMinutes: 90,
  examTag: 'cds2_2026',
  status: 'pending',                // 'pending'|'in_progress'|'done'|'skipped'
  sessionLogId: null,               // set when session is auto-created
  completedMinutes: 0,              // updated when session closes
  adHoc: false,                     // true for one-off additions
}
```

**Session log entry shape:**

```js
{
  id: 'uuid',
  date: 'YYYY-MM-DD',
  dailyTargetId: 'uuid',            // null for manually logged sessions
  subject: 'Maths',
  topic: 'Trigonometry',
  startTime: '09:00',               // 'HH:MM' 24h
  endTime: '10:30',                 // null while session is open
  actualMinutes: 90,                // computed from endTime - startTime; user can override
  questionsAttempted: 0,
  questionsCorrect: 0,
  notes: '',
  mood: 3,                          // 1–5
  autoCreated: true,                // false for manually added sessions
}
```

---

### 1.4 `computeDerived()` — The Engine

**Create:** `src/utils/derivedState.js`  
**Call:** at the end of every single store action, before returning from `set()`

```js
import { getTodayISO, getDOW, getLastNDays, diffDays } from './dateUtils';
import { generateId, getCurrentTime } from './helpers';

export function computeDerived(state) {
  const today = getTodayISO();
  const todayDow = getDOW(today);

  // ── 1. SYNC DAILY TARGETS FROM WEEKLY PLAN ─────────────────────────────
  // Resolve the active topic for a plan item on a specific week
  const resolveWeekKey = (isoDate, planItemId) => {
    const weekNum = getISOWeek(isoDate);
    const key = `${isoDate.slice(0, 4)}-W${weekNum}:${planItemId}`;
    return state.weeklyPlanOverrides[key] ?? null;
  };

  const planned = state.weeklyPlan[todayDow] ?? [];
  const existing = state.dailyTargets[today] ?? [];
  const existingPlanIds = new Set(
    existing.filter(t => t.weeklyPlanItemId).map(t => t.weeklyPlanItemId)
  );

  // Only add new items from the plan that aren't already in daily targets for today
  const newTargets = planned
    .filter(p => !existingPlanIds.has(p.id))
    .map(p => ({
      id: generateId(),
      weeklyPlanItemId: p.id,
      date: today,
      subject: p.subject,
      topic: resolveWeekKey(today, p.id) ?? p.topic, // per-week override wins
      targetMinutes: p.targetMinutes,
      examTag: p.examTag ?? null,
      status: 'pending',
      sessionLogId: null,
      completedMinutes: 0,
      adHoc: false,
    }));

  // Merge: preserve existing items (don't touch completion state), add new ones
  state.dailyTargets[today] = [...existing, ...newTargets];

  // ── 2. TODAY'S COMPLETION % ─────────────────────────────────────────────
  const todayTargets = state.dailyTargets[today] ?? [];
  const actionable = todayTargets.filter(t => t.status !== 'skipped');
  const doneCount = todayTargets.filter(t => t.status === 'done').length;
  state.derived_todayCompletion = actionable.length
    ? Math.round((doneCount / actionable.length) * 100)
    : 0;

  // ── 3. SUBJECT TIME TODAY ───────────────────────────────────────────────
  const todaySessions = state.sessionLog[today] ?? [];
  state.derived_subjectTimeToday = {};
  for (const s of todaySessions) {
    state.derived_subjectTimeToday[s.subject] =
      (state.derived_subjectTimeToday[s.subject] ?? 0) + (s.actualMinutes ?? 0);
  }

  // ── 4. WEEKLY HOURS (last 7 days) ───────────────────────────────────────
  state.derived_weeklyHours = getLastNDays(7)
    .reverse() // oldest → newest for chart display
    .map(date => ({
      date,
      minutes: (state.sessionLog[date] ?? []).reduce((s, x) => s + (x.actualMinutes ?? 0), 0),
    }));

  // ── 5. EXAM COUNTDOWNS — sorted ascending by daysLeft ──────────────────
  state.derived_examCountdowns = (state.exams ?? [])
    .map(e => ({
      ...e,
      daysLeft: diffDays(today, e.date),
      totalDays: diffDays(e.announcedDate ?? e.date, e.date) || 180, // fallback 180d window
    }))
    .filter(e => e.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // ── 6. AUTO-COMPLETE HABITS FROM SESSION DATA ───────────────────────────
  // Derived logic only sets habits to TRUE — it never reverts a manual habit toggle.
  const hasAnyStudy = todaySessions.length > 0;
  const hasPYQ = todayTargets.some(t => t.subject === 'PYQ' && t.status === 'done');
  const hasMock = todayTargets.some(t => t.subject === 'Mock' && t.status === 'done');

  if (!state.habits) state.habits = {};
  if (!state.habits[today]) state.habits[today] = {};

  if (hasAnyStudy && !state.habits[today].morningStudy) {
    state.habits[today].morningStudy = true;
  }
  if (hasPYQ && !state.habits[today].pyqPractice) {
    state.habits[today].pyqPractice = true;
  }
  if (hasMock && !state.habits[today].mockRevision) {
    state.habits[today].mockRevision = true;
  }

  // ── 7. STUDY STREAK ─────────────────────────────────────────────────────
  let streak = 0;
  const days = getLastNDays(90);
  for (const d of days) {
    const sessions = state.sessionLog[d] ?? [];
    if (sessions.some(s => s.actualMinutes > 0)) {
      streak++;
    } else {
      break; // streak broken
    }
  }
  state.derived_streak = streak;

  // ── 8. ROLLING ANALYTICS ────────────────────────────────────────────────
  const last30 = getLastNDays(30);

  const subjectAccuracy = {};
  const subjectMinutes = {};
  for (const d of last30) {
    for (const s of state.sessionLog[d] ?? []) {
      if (!subjectAccuracy[s.subject]) subjectAccuracy[s.subject] = { a: 0, c: 0 };
      subjectAccuracy[s.subject].a += s.questionsAttempted ?? 0;
      subjectAccuracy[s.subject].c += s.questionsCorrect ?? 0;
      subjectMinutes[s.subject] = (subjectMinutes[s.subject] ?? 0) + (s.actualMinutes ?? 0);
    }
  }

  const adherenceData = last30.map(d => {
    const targets = state.dailyTargets[d] ?? [];
    const done = targets.filter(t => t.status === 'done').length;
    return { date: d, planned: targets.length, done, pct: targets.length ? done / targets.length : null };
  });

  state.derived_analytics = {
    totalStudyMinutes30d: Object.values(subjectMinutes).reduce((s, v) => s + v, 0),
    subjectAccuracy: Object.entries(subjectAccuracy).map(([subject, { a, c }]) => ({
      subject,
      attempted: a,
      correct: c,
      accuracy: a > 0 ? Math.round((c / a) * 100) : null,
      weak: a > 0 ? c / a < 0.6 : false,
    })),
    subjectMinutes,
    weeklyPlanAdherence: adherenceData,
  };

  return state;
}
```

---

### 1.5 Store Action Wiring

Every store action must end with `return computeDerived(state)`. Examples:

```js
// ── ADD TO WEEKLY PLAN
addWeeklyTarget: (day, targetData) => set(state => {
  const item = { id: crypto.randomUUID(), order: (state.weeklyPlan[day]?.length ?? 0), ...targetData };
  state.weeklyPlan[day] = [...(state.weeklyPlan[day] ?? []), item];
  return computeDerived(state);
}),

// ── EDIT WEEKLY PLAN ITEM (permanent change to template)
editWeeklyTarget: (day, itemId, updates) => set(state => {
  const idx = state.weeklyPlan[day]?.findIndex(x => x.id === itemId);
  if (idx !== undefined && idx >= 0) Object.assign(state.weeklyPlan[day][idx], updates);
  return computeDerived(state);
}),

// ── OVERRIDE TOPIC FOR THIS WEEK ONLY
overrideWeeklyTopic: (isoDate, planItemId, topic) => set(state => {
  const weekNum = getISOWeek(isoDate);
  const key = `${isoDate.slice(0, 4)}-W${weekNum}:${planItemId}`;
  state.weeklyPlanOverrides[key] = topic;
  return computeDerived(state);
}),

// ── REMOVE FROM WEEKLY PLAN
removeWeeklyTarget: (day, itemId) => set(state => {
  state.weeklyPlan[day] = (state.weeklyPlan[day] ?? []).filter(x => x.id !== itemId);
  return computeDerived(state);
}),

// ── UPDATE DAILY TARGET STATUS (the most complex action)
updateDailyTargetStatus: (date, targetId, status) => set(state => {
  const target = (state.dailyTargets[date] ?? []).find(t => t.id === targetId);
  if (!target) return state;
  target.status = status;

  if (status === 'in_progress' && !target.sessionLogId) {
    // Auto-create session skeleton
    const sessionId = crypto.randomUUID();
    target.sessionLogId = sessionId;
    state.sessionLog[date] = [...(state.sessionLog[date] ?? []), {
      id: sessionId,
      date,
      dailyTargetId: targetId,
      subject: target.subject,
      topic: target.topic,
      startTime: getCurrentTime(),
      endTime: null,
      actualMinutes: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
      notes: '',
      mood: 3,
      autoCreated: true,
    }];
  }

  if (status === 'done') {
    // Auto-close session if open
    const session = (state.sessionLog[date] ?? []).find(s => s.id === target.sessionLogId);
    if (session && !session.endTime) {
      session.endTime = getCurrentTime();
      // actualMinutes computed from times; if same minute, fall back to targetMinutes
      const computed = minutesBetween(session.startTime, session.endTime);
      session.actualMinutes = computed > 0 ? computed : target.targetMinutes;
      target.completedMinutes = session.actualMinutes;
    }
  }

  return computeDerived(state);
}),

// ── UPDATE SESSION LOG ENTRY
updateSessionLog: (date, sessionId, updates) => set(state => {
  const session = (state.sessionLog[date] ?? []).find(s => s.id === sessionId);
  if (!session) return state;
  Object.assign(session, updates);

  // Recompute actualMinutes if times changed
  if (updates.startTime || updates.endTime) {
    if (session.startTime && session.endTime) {
      session.actualMinutes = minutesBetween(session.startTime, session.endTime);
    }
  }

  // Sync completedMinutes back to daily target
  if (session.dailyTargetId) {
    const target = (state.dailyTargets[date] ?? []).find(t => t.id === session.dailyTargetId);
    if (target) target.completedMinutes = session.actualMinutes;
  }

  return computeDerived(state);
}),

// ── MANUAL SESSION LOG ENTRY (no daily target)
addManualSession: (date, sessionData) => set(state => {
  state.sessionLog[date] = [...(state.sessionLog[date] ?? []), {
    id: crypto.randomUUID(),
    date,
    dailyTargetId: null,
    autoCreated: false,
    ...sessionData,
  }];
  return computeDerived(state);
}),

// ── ADD AD-HOC DAILY TARGET (not from weekly plan)
addAdHocTarget: (date, targetData) => set(state => {
  state.dailyTargets[date] = [...(state.dailyTargets[date] ?? []), {
    id: crypto.randomUUID(),
    weeklyPlanItemId: null,
    date,
    status: 'pending',
    sessionLogId: null,
    completedMinutes: 0,
    adHoc: true,
    ...targetData,
  }];
  return computeDerived(state);
}),

// ── UPDATE EXAMS
updateExam: (examId, updates) => set(state => {
  const idx = state.exams.findIndex(e => e.id === examId);
  if (idx >= 0) Object.assign(state.exams[idx], updates);
  return computeDerived(state);
}),
addExam: (exam) => set(state => {
  state.exams = [...state.exams, { id: crypto.randomUUID(), ...exam }];
  return computeDerived(state);
}),
removeExam: (examId) => set(state => {
  state.exams = state.exams.filter(e => e.id !== examId);
  return computeDerived(state);
}),
```

---

## 2. WEEKLY PLANNER — Full Redesign (Replaces Smart Planner)

**File:** `src/pages/WeeklyPlanner.jsx` (new file)  
**Remove:** `src/pages/SmartPlanner.jsx` (or whatever the current file is called) and all imports/routes referencing it.

The Weekly Planner is a **persistent template** — it defines the study structure that repeats every week. Topics can be changed per-week without altering the base template.

### 2.1 Layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  WEEKLY PLANNER          Week of 9–15 Jun 2026          [◄ Prev]  [Next ►]    │
│  [Copy This Week ▼]  [Copy to Next 4 Weeks]  [Reset to Template]              │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬─────────────┤
│  MON     │  TUE     │  WED     │  THU     │  FRI     │  SAT     │  SUN        │
│  9 Jun   │  10 Jun  │  11 Jun  │  12 Jun  │  13 Jun  │  14 Jun  │  15 Jun     │
│  ●TODAY  │          │          │          │          │          │             │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼─────────────┤
│ [MATHS]  │ [ENGLISH]│ [GK]     │ [MATHS]  │ [PYQ]    │ [MOCK]   │  REST       │
│ Trig     │ Vocab    │ History  │ Algebra  │ 2023 GK  │ Full test│             │
│ 90m ⏱   │ 60m ⏱   │ 90m ⏱   │ 90m ⏱   │ 60m ⏱   │ 180m ⏱  │             │
│ 74% ✓   │          │          │          │          │          │             │  ← % if past
│          │          │          │          │          │          │             │
│ [+ Add]  │ [+ Add]  │ [+ Add]  │ [+ Add]  │ [+ Add]  │ [+ Add]  │ [+ Add]    │
│          │          │          │          │          │          │             │
│ Total:   │ Total:   │ Total:   │ Total:   │ Total:   │ Total:   │             │
│ 180m     │ 60m      │ 90m      │ 90m      │ 120m     │ 180m     │             │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴─────────────┘
```

**Column behaviour:**
- Today's column gets a distinct top border in `var(--accent)` and a "● TODAY" badge
- Past day columns show a faint completion ring % at the top, derived from `dailyTargets[date]`
- Future day columns show planned targets only
- Each target pill shows: coloured subject badge, topic text, duration, optional exam tag chip
- Hovering a pill shows edit/delete icons
- Dragging a pill within the column reorders it (update `order` field)

### 2.2 Add / Edit Target Modal

Fields:

| Field | Control | Notes |
|---|---|---|
| Subject | Dropdown | Maths / English / GK / PYQ / Mock / Revision / Free |
| Default Topic | Text input | Autocomplete from `syllabusTopics[subject]` |
| Duration | Number input (minutes) | Preset buttons: 30 / 45 / 60 / 90 / 120 |
| Exam Tag | Dropdown (optional) | Populated from `state.exams[].label` |
| Recurring | Toggle | ON = repeats every week; OFF = this week only |

**When Recurring = ON:** the item lives in `weeklyPlan[day]` permanently.  
**When Recurring = OFF:** the item is written directly to `dailyTargets[isoDate]` as an ad-hoc entry with `adHoc: true` and `weeklyPlanItemId: null`.

### 2.3 Per-Week Topic Override

Each recurring item has an **"Edit topic this week"** inline text field visible when viewing a non-current week. Saving it calls `overrideWeeklyTopic(isoDate, planItemId, topic)`. The base template topic is untouched. This override only applies to the specific ISO week of that date.

### 2.4 Bulk Actions

- **Copy This Week:** copies current week's `weeklyPlan` overrides to the next selected week
- **Copy to Next 4 Weeks:** applies current week's plan as the base template for the next 4 ISO weeks (writes to `weeklyPlanOverrides`)
- **Reset to Template:** clears all `weeklyPlanOverrides` for the viewed week, reverting to the base `weeklyPlan` topics

---

## 3. DAILY TARGETS — Full Redesign

**File:** `src/pages/DailyTargets.jsx`  
Rename existing `DailyLog.jsx` to `DailyTargets.jsx`. Keep the day notes / wake-sleep / mood section as a collapsible **"Day Notes"** card at the bottom of the page.

### 3.1 Layout

```
╔══════════════════════════════════════════════════════════════════════════╗
║  DAILY TARGETS            Saturday, 13 June 2026                        ║
║  [◄ Yesterday]                                          [Tomorrow ►]    ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Completion: ████████░░  60%   (3 done / 5 targets)                    ║
╠══════════════════════════════════════════════════════════════════════════╣
║  [MATHS]  Trigonometry                    90m    [Start ▶]  [Skip ⊘]   ║  ← pending
║  [GK]     Indian History                  60m    [Start ▶]  [Skip ⊘]   ║
║  [ENG]    Vocabulary Practice        ● Active    [Done ✓]  [Skip ⊘]    ║  ← in_progress
║           └─ Session #2 started 10:15  →  [Edit Session]               ║
║  [PYQ]    2023 GK Questions          ✓ Done 60m  [View Session]        ║  ← done
║  [MOCK]   Full Mock Test             ⊘ Skipped                         ║  ← skipped
╠══════════════════════════════════════════════════════════════════════════╣
║  [+ Add Ad-hoc Target for Today]                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  ▼ Day Notes (collapse/expand)                                          ║
║    Wake: 06:00   Sleep target: 22:30   Mood: ●●●●○   Energy: ●●●○○     ║
║    Notes: [                                                           ] ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Row behaviour:**

- **Pending row:** shows [Start ▶] and [Skip ⊘] buttons
  - [Start ▶] → calls `updateDailyTargetStatus(date, id, 'in_progress')` → session auto-creates → row updates
- **In-progress row:** highlighted with `var(--accent)` left border, shows elapsed timer, [Done ✓] and [Skip ⊘]
  - Timer counts up from session startTime in real-time
  - [Edit Session] link opens Session Log entry inline or navigates to Session Log page
- **Done row:** green tick, actual minutes shown, [View Session] link
- **Skipped row:** grey, strike-through, optional skip reason shown
- **Ad-hoc targets** shown with a small "AD-HOC" chip instead of a subject colour tag

**Date navigation:** ◄/► arrows change the viewed date. Targets for other days are read-only (cannot Start/Done from non-today dates, but can be viewed).

---

## 4. SESSION LOG — Full Redesign

**File:** `src/pages/SessionLog.jsx` (new page)

This is extracted from the existing Daily Log. It is the editing interface for all session data.

### 4.1 Layout

```
╔══════════════════════════════════════════════════════════════════════════╗
║  SESSION LOG              Saturday, 13 June 2026                        ║
║  [◄ Prev Day]                                          [Next Day ►]     ║
╠══════════════════════════════════════════════════════════════════════════╣
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │  #1  [MATHS]  Trigonometry                  [auto-created]       │   ║
║  │  ⏱  09:00 → 10:30  │  90 min                                    │   ║
║  │  Qs: 25 attempted  20 correct  80% accuracy                     │   ║
║  │  Mood: ●●●○○                                                     │   ║
║  │  Notes: Struggled with compound angles. Review tomorrow.         │   ║
║  │                                              [Edit]  [Delete]    │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │  #2  [GK]  Indian History                   [auto-created]       │   ║
║  │  ⏱  11:00 → 12:10  │  70 min    (target was 90m)                │   ║
║  │  Qs: 40 attempted  30 correct  75% accuracy                     │   ║
║  │  Mood: ●●●●○                                                     │   ║
║  │  Notes: [                                                      ] │   ║
║  │                                              [Edit]  [Delete]    │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Today total: 160 min   Avg accuracy: 77%                               ║
║  [+ Log Manual Session]                                                 ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### 4.2 Inline Edit Mode

Clicking [Edit] expands the card into edit mode in-place (no modal):

```
Start time:  [09:00]   End time:  [10:30]   → actualMinutes: 90 (auto)
Questions:   [25] attempted   [20] correct   → 80% (auto)
Mood:        ○ ○ ● ○ ○  (click to rate 1–5)
Notes:       [multiline textarea                               ]
Topic:       [Trigonometry                 ] (editable)
              [Save]  [Cancel]
```

All fields call `updateSessionLog()` on Save → `computeDerived()` fires → Analytics updates instantly.

### 4.3 Manual Session Modal

Fields: Subject, Topic, Date (defaults today), Start Time, End Time, Questions Attempted, Questions Correct, Notes, Mood.  
Calls `addManualSession()`.

---

## 5. DASHBOARD — Full Redesign

**File:** `src/pages/Dashboard.jsx`

### 5.1 Page Structure

```
┌────────────────────────────────────────────────────────────────────┐
│  [Overdue revision alert strip — full width, dismissible]          │
├─────────────────────────┬──────────────────────────────────────────┤
│  EXAM COUNTDOWNS        │  TODAY'S OVERVIEW                        │
│  (cards, sorted asc)    │  (targets + completion)                  │
├─────────────────────────┼──────────────────────────────────────────┤
│  7-DAY STUDY BAR CHART  │  QUICK STATS ROW                         │
├─────────────────────────┼──────────────────────────────────────────┤
│  SUBJECT TIME (donut)   │  SUBJECT ACCURACY (donut)                │
└─────────────────────────┴──────────────────────────────────────────┘
```

### 5.2 Exam Countdown Cards

Source: `state.derived_examCountdowns` — always sorted ascending by `daysLeft`.

The closest exam (currently AFCAT 1 2026, 56 days) must always appear first.

**Card design — circular SVG progress ring:**

```jsx
function ExamCountdownCard({ label, date, daysLeft, totalDays, urgency }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const elapsed = Math.max(0, totalDays - daysLeft);
  const filled = elapsed / totalDays;
  const strokeColor =
    urgency === 'critical' ? 'var(--danger)' :
    urgency === 'warning'  ? 'var(--warning)' : 'var(--accent)';

  return (
    <div className="zh-card exam-countdown-card" data-urgency={urgency}
         style={{ boxShadow: `var(--glow-${urgency})` }}>
      <svg width={96} height={96} viewBox="0 0 96 96">
        {/* Track */}
        <circle cx={48} cy={48} r={r} fill="none"
          stroke="var(--border)" strokeWidth={7} />
        {/* Progress arc */}
        <circle cx={48} cy={48} r={r} fill="none"
          stroke={strokeColor} strokeWidth={7}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - filled)}
          strokeLinecap="round"
          transform="rotate(-90 48 48)" />
        {/* Days count */}
        <text x={48} y={44} textAnchor="middle"
          fill={strokeColor} fontSize={18} fontWeight={700} fontFamily="'Orbitron', sans-serif">
          {daysLeft}
        </text>
        <text x={48} y={60} textAnchor="middle"
          fill="var(--muted)" fontSize={9} fontWeight={500}>
          DAYS LEFT
        </text>
      </svg>
      <div className="exam-info">
        <div className="exam-label">{label}</div>
        <div className="exam-date">{formatShort(date)}</div>
        {urgency === 'critical' && <span className="urgency-badge">URGENT</span>}
        {urgency === 'warning'  && <span className="urgency-badge warning">SOON</span>}
      </div>
    </div>
  );
}
```

**Urgency thresholds:**
- `daysLeft ≤ 30` → `critical` (red glow, red ring, URGENT badge)
- `31 ≤ daysLeft ≤ 75` → `warning` (amber glow, amber ring, SOON badge)
- `daysLeft > 75` → `normal` (green/accent ring, no badge)

### 5.3 Today's Overview Panel

```jsx
// Reads from: state.derived_todayCompletion, state.dailyTargets[today]
<TodayOverviewPanel>
  <header>
    <h2>TODAY</h2>
    <span>{formatDisplay(today)}</span>
    <CompletionBar pct={state.derived_todayCompletion} />
  </header>
  {todayTargets.map(target => (
    <TargetRow
      key={target.id}
      target={target}
      onClick={() => navigate('/daily-targets')} // click through to full page
    />
  ))}
  <footer>
    <Link to="/daily-targets">View All Targets →</Link>
  </footer>
</TodayOverviewPanel>
```

### 5.4 7-Day Study Bar Chart

```jsx
// Source: state.derived_weeklyHours — array of { date, minutes } oldest→newest
<ResponsiveContainer width="100%" height={160}>
  <BarChart data={state.derived_weeklyHours} barSize={28}>
    <XAxis dataKey="date" tickFormatter={d => formatShort(d)} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
    <YAxis unit="m" tick={{ fill: 'var(--muted)', fontSize: 11 }} width={36} />
    <Tooltip
      formatter={v => [`${v} min`, 'Study time']}
      contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
    />
    <Bar dataKey="minutes" fill="var(--accent)" radius={[4, 4, 0, 0]}
      label={{ position: 'top', fill: 'var(--muted)', fontSize: 10,
               formatter: v => v > 0 ? `${Math.round(v/60*10)/10}h` : '' }} />
  </BarChart>
</ResponsiveContainer>
```

Today's bar should be brighter (`var(--accent)`) vs past days (slightly dimmed — `var(--accent-dim)`).

### 5.5 Quick Stats Row

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  Study Streak   │  Sessions Today │  30d Study Time │  Avg Accuracy   │
│  🔥 12 days     │  📘 3 sessions  │  ⏱ 47h 20m     │  📊 74%         │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

Sources:
- Streak: `state.derived_streak`
- Sessions today: `(state.sessionLog[today] ?? []).length`
- 30d time: `state.derived_analytics.totalStudyMinutes30d`
- Avg accuracy: computed from `state.derived_analytics.subjectAccuracy`

### 5.6 Subject Donut Charts

Two side-by-side donuts:
- **Left:** Today's time split by subject — from `state.derived_subjectTimeToday`
- **Right:** 30-day accuracy by subject — from `state.derived_analytics.subjectAccuracy`

Use the shared `--subject-*` CSS variables for consistent colouring across both donuts and throughout the app.

### 5.7 Overdue Revision Alerts

Dismissible strip at the top of the dashboard (above everything else). Source from existing revision logic.

```jsx
{overdueTopics.length > 0 && (
  <div className="overdue-alert-strip">
    <span>⚠️ {overdueTopics.length} revision topics overdue</span>
    {overdueTopics.slice(0, 3).map(t => (
      <span key={t.id} className="overdue-chip">
        {t.topic} <span className="overdue-days">+{t.overdueDays}d</span>
      </span>
    ))}
    <Link to="/revision" className="review-link">Review Now →</Link>
    <button onClick={() => setAlertDismissed(true)}>×</button>
  </div>
)}
```

---

## 6. ANALYTICS — Live-Updating

**File:** `src/pages/Analytics.jsx`

All charts subscribe to Zustand derived state only. Remove any manual refresh triggers or local state caches.

### 6.1 Date Range Selector

Compact toggle at the top of the page. Drives a `selectedRange` local state (not stored in Zustand):

```
[7D]  [30D]  [90D]  [Custom ▼]
```

When range changes, all charts re-render using `getLastNDays(selectedRange)` as the date set.

### 6.2 Charts

| Chart | Source | Type |
|---|---|---|
| Study Hours Trend | Session log, by day | Line chart |
| Subject Time Split | `subjectMinutes` (rolling) | Donut |
| Accuracy by Subject | `subjectAccuracy` | Horizontal bar |
| Weekly Plan Adherence | `weeklyPlanAdherence` | Bar chart |
| Mock Score Trend | `state.mocks[].score` over time | Line chart |
| Habit Completion | `state.habits` heatmap | Calendar heatmap |
| Session Count | Count per day | Sparkline |

### 6.3 Weakness Detector Panel

Auto-derived from `state.derived_analytics.subjectAccuracy`. Display as a table:

```
Subject     │  Attempts  │  Correct  │  Accuracy  │  Status
────────────┼────────────┼───────────┼────────────┼──────────
Maths       │  340       │  272      │  80%       │  ✓ Good
English     │  220       │  165      │  75%       │  ✓ Good
GK          │  280       │  154      │  55%       │  ⚠ Weak   ← red row highlight
```

Weak = accuracy < 60%. Highlight entire row with `rgba(var(--danger-rgb), 0.12)` background.

---

## 7. NAVIGATION — Left Sidebar (All Screen Sizes)

**File:** `src/components/Sidebar.jsx`

### 7.1 Behaviour

- **Desktop (≥ 1024px):** Persistent sidebar, expanded (shows icons + labels) or collapsed (icons only). Toggle with a pin button or keyboard shortcut.
- **Tablet (768–1023px):** Collapsed rail by default (icons only). Click icon to expand as overlay.
- **Mobile (< 768px):** Hidden by default. Hamburger button (top-left of every page header) opens as a full overlay drawer sliding in from the left with a dark backdrop. Tapping backdrop or pressing Escape closes it.

**No bottom navigation bar on any screen size.** Remove any existing bottom nav completely.

### 7.2 Sidebar Structure

```
╔═══════════════════════╗
║  ⚡ ZERO HOUR         ║  ← logo, collapsed shows icon only
║  [◄ collapse]         ║
╠═══════════════════════╣
║  Primary              ║
║  ● Dashboard      1   ║
║  ● Weekly Planner 2   ║  ← replaces Smart Planner
║  ● Daily Targets  3   ║
║  ● Session Log    4   ║
║  ● Analytics      A   ║
╠═══════════════════════╣
║  Study Tools          ║
║  ○ Habits         H   ║
║  ○ Syllabus       L   ║
║  ○ Mocks          M   ║
║  ○ PYQ Log        P   ║
║  ○ Revision       R   ║
║  ○ Pomodoro       T   ║
║  ○ Vocabulary     V   ║
║  ○ Quiz           Q   ║
╠═══════════════════════╣
║  ○ Settings       S   ║
╚═══════════════════════╝
```

Keyboard shortcuts listed above are active globally (not when typing in an input). Letters shown are examples — preserve any existing shortcuts and extend for new pages.

### 7.3 Active State

Active nav item: `var(--accent)` left border + slightly lighter background. Icon coloured with `var(--accent)`. All other items: `var(--muted)` icon colour.

---

## 8. DATE SYSTEM — Complete Rewrite

**File:** `src/utils/dateUtils.js` — full replacement.

### 8.1 Canonical Functions

```js
/**
 * Returns today's date as 'YYYY-MM-DD' in the user's LOCAL timezone.
 * Never use new Date().toISOString() for this — it returns UTC.
 */
export function getTodayISO() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * Parse an ISO date string safely, always at midnight local time.
 * Use this everywhere instead of new Date(isoString) to avoid UTC offset bugs.
 */
export function parseISO(isoDate) {
  return new Date(isoDate + 'T00:00:00');
}

/**
 * Calendar days between two ISO strings (fromISO → toISO).
 * Positive if toISO is in the future.
 */
export function diffDays(fromISO, toISO) {
  return Math.ceil((parseISO(toISO) - parseISO(fromISO)) / 86_400_000);
}

/**
 * DOW abbreviation for weekly plan key: 'Mon' | 'Tue' | ... | 'Sun'
 */
export function getDOW(isoDate) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseISO(isoDate).getDay()];
}

/**
 * ISO week number for a date (ISO 8601 — week starts Monday).
 */
export function getISOWeek(isoDate) {
  const d = parseISO(isoDate);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86_400_000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

/**
 * Array of last N days as ISO strings, today first (descending).
 */
export function getLastNDays(n) {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  });
}

/**
 * Mon–Sun ISO dates for the week containing isoDate.
 */
export function getWeekDays(isoDate) {
  const d = parseISO(isoDate);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const wd = new Date(monday);
    wd.setDate(monday.getDate() + i);
    return [wd.getFullYear(), String(wd.getMonth()+1).padStart(2,'0'), String(wd.getDate()).padStart(2,'0')].join('-');
  });
}

/** Long display: 'Saturday, 13 June 2026' */
export function formatDisplay(isoDate) {
  return parseISO(isoDate).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/** Short display: '13 Jun' */
export function formatShort(isoDate) {
  return parseISO(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  });
}

/** Current time as 'HH:MM' */
export function getCurrentTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

/** Minutes between two 'HH:MM' strings */
export function minutesBetween(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
}
```

### 8.2 Audit — Remove All Bad Date Patterns

**Grep for and fix each of these before shipping:**

| Bad pattern | Replace with |
|---|---|
| `new Date().toLocaleDateString()` used as store key | `getTodayISO()` |
| `new Date().toISOString().split('T')[0]` | `getTodayISO()` |
| `Date.now()` used as a date key | `getTodayISO()` |
| `new Date(someString)` without `'T00:00:00'` | `parseISO(someString)` |
| Inline countdown: `Math.floor((examDate - new Date()) / 86400000)` | `diffDays(getTodayISO(), exam.date)` |
| `new Date().getDay()` used for DOW key | `getDOW(getTodayISO())` |

---

## 9. UI/UX — Design Token Additions

**File:** `src/index.css` — add inside the existing `:root {}` block. Do not rename or remove existing variables.

```css
:root {
  /* ── Urgency ───────────────────────────────────── */
  --danger:        #ef4444;
  --danger-dim:    rgba(239, 68, 68, 0.15);
  --danger-rgb:    239, 68, 68;
  --warning:       #f59e0b;
  --warning-dim:   rgba(245, 158, 11, 0.15);

  /* ── Subject colours (shared across ALL features) ─ */
  --subject-maths:    #3b82f6;
  --subject-english:  #22c55e;
  --subject-gk:       #f59e0b;
  --subject-pyq:      #a855f7;
  --subject-mock:     #ef4444;
  --subject-revision: #14b8a6;
  --subject-free:     #6b7280;

  /* ── Status colours ────────────────────────────── */
  --status-done:      #22c55e;
  --status-active:    var(--accent);
  --status-pending:   var(--muted);
  --status-skipped:   #6b7280;

  /* ── Card effects ──────────────────────────────── */
  --card-hover-glow:  0 0 0 1px var(--accent), 0 4px 24px rgba(0, 255, 195, 0.08);
  --card-active-glow: 0 0 0 2px var(--accent), 0 8px 32px rgba(0, 255, 195, 0.15);

  /* ── Countdown card glows ──────────────────────── */
  --glow-critical: 0 0 20px rgba(239, 68, 68, 0.35);
  --glow-warning:  0 0 20px rgba(245, 158, 11, 0.25);
  --glow-normal:   0 0 16px rgba(0, 255, 195, 0.10);

  /* ── Accent dimmed (past-day chart bars, etc.) ─── */
  --accent-dim:    rgba(0, 255, 195, 0.35);
}
```

### 9.1 Shared Components to Create

**`SubjectPill`** — used everywhere a subject tag appears:

```jsx
// src/components/SubjectPill.jsx
const SUBJECT_COLORS = {
  Maths:    'var(--subject-maths)',
  English:  'var(--subject-english)',
  GK:       'var(--subject-gk)',
  PYQ:      'var(--subject-pyq)',
  Mock:     'var(--subject-mock)',
  Revision: 'var(--subject-revision)',
  Free:     'var(--subject-free)',
};

export function SubjectPill({ subject, size = 'md' }) {
  const color = SUBJECT_COLORS[subject] ?? 'var(--muted)';
  return (
    <span className={`subject-pill subject-pill--${size}`}
          style={{ background: `${color}20`, color, borderColor: `${color}40` }}>
      {subject.slice(0, 3).toUpperCase()}
    </span>
  );
}
```

```css
.subject-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  border: 1px solid;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}
.subject-pill--sm { padding: 1px 6px; font-size: 9px; }
.subject-pill--lg { padding: 3px 12px; font-size: 12px; }
```

**`CompletionBar`** — shared progress bar:

```jsx
// src/components/CompletionBar.jsx
export function CompletionBar({ pct, showLabel = true }) {
  const color = pct === 100 ? 'var(--status-done)' : pct >= 60 ? 'var(--accent)' : 'var(--warning)';
  return (
    <div className="completion-bar-wrapper">
      <div className="completion-bar-track">
        <div className="completion-bar-fill"
             style={{ width: `${pct}%`, background: color }} />
      </div>
      {showLabel && <span className="completion-bar-label" style={{ color }}>{pct}%</span>}
    </div>
  );
}
```

---

## 10. FIREBASE SYNC UPDATE

**File:** `src/store/useStore.js` — Firestore sync section.

### 10.1 Sync Key List

Add all new keys. `derived_*` fields must NEVER be synced.

```js
const SYNC_KEYS = [
  'weeklyPlan',
  'weeklyPlanOverrides',   // ← NEW
  'dailyTargets',          // ← NEW
  'sessionLog',            // ← NEW
  'exams',                 // ← NEW
  'habits',
  'mocks',
  'syllabusProgress',
  'revision',
  'vocab',
  'quiz',
  'pomodoro',
  // ...any other existing raw data keys
  // DO NOT include: derived_*, any computed field
];
```

### 10.2 On Cloud Sync — Always Recompute Derived

```js
unsubscribe = onSnapshot(docRef, (snap) => {
  if (snap.exists()) {
    const data = snap.data();
    set(state => {
      // Only overwrite known sync keys; never touch derived_ fields from cloud
      SYNC_KEYS.forEach(key => {
        if (data[key] !== undefined) state[key] = data[key];
      });
      return computeDerived(state); // ← always recompute after any cloud sync
    });
  }
});
```

---

## 11. IMPLEMENTATION ORDER

Strictly follow this sequence. Each phase depends on the previous being complete.

```
PHASE 1 — FOUNDATION  (nothing else works without this)
  1a.  Rewrite src/utils/dateUtils.js with canonical safe functions
  1b.  Create src/utils/derivedState.js with computeDerived()
  1c.  Add new store keys to useStore.js initial state
       (weeklyPlan, weeklyPlanOverrides, dailyTargets, sessionLog, exams, derived_*)
  1d.  Wire computeDerived() into ALL existing store actions
  1e.  Run date pattern audit across all files (Section 8.2 table)
  1f.  Add exam CRUD actions + Settings exam UI

PHASE 2 — CORE PAGES
  2a.  WeeklyPlanner.jsx (complete with recurring + per-week override)
  2b.  DailyTargets.jsx (auto-population via derived, Start/Done/Skip flow)
  2c.  SessionLog.jsx (auto-created + manual, inline edit)
  2d.  Remove SmartPlanner.jsx and all its references

PHASE 3 — DASHBOARD
  3a.  Exam countdown cards (sorted ascending, circular rings, urgency colours)
  3b.  Today's overview panel (live from derived_todayCompletion)
  3c.  7-day bar chart (from derived_weeklyHours)
  3d.  Quick stats row (streak, sessions, 30d time, accuracy)
  3e.  Subject donuts (time today + 30d accuracy)
  3f.  Overdue revision alert strip

PHASE 4 — SIDEBAR NAVIGATION
  4a.  Create Sidebar.jsx with persistent desktop / overlay mobile behaviour
  4b.  Remove any bottom nav bar code entirely
  4c.  Update all routes in App.jsx / router config
  4d.  Update keyboard shortcuts to cover all new pages

PHASE 5 — ANALYTICS
  5a.  Wire all charts to derived_* store fields only
  5b.  Add date range selector (7D / 30D / 90D / Custom)
  5c.  Weakness detector table with red-highlight rows

PHASE 6 — POLISH
  6a.  Add CSS variables to :root in index.css
  6b.  Create SubjectPill.jsx and CompletionBar.jsx shared components
  6c.  Audit every component for hardcoded colour hex values
  6d.  Replace all inline subject colour logic with SubjectPill
  6e.  Update Firebase SYNC_KEYS list
  6f.  Final end-to-end testing (Section 12 checklist)
```

---

## 12. TESTING CHECKLIST

Verify all of these end-to-end after implementation:

- [ ] Add a recurring Maths target to Monday in Weekly Planner → it auto-appears in Daily Targets every Monday
- [ ] Override the topic for this week only → base template is unchanged, override applies only this week
- [ ] Click [Start] on a Daily Target → Session Log entry auto-creates with correct start time
- [ ] Edit session log end time → actualMinutes recalculates, Analytics accuracy updates immediately
- [ ] Edit questions attempted/correct in session log → subject accuracy in Analytics updates instantly
- [ ] Mark a Daily Target [Done] → completion % on Dashboard updates, session auto-closes
- [ ] Mark habit "Morning Study" manually → completing a session later does not revert the manual toggle
- [ ] Add a new exam in Settings → Dashboard countdowns re-sort with new exam in correct position
- [ ] Change AFCAT exam date in Settings → daysLeft recalculates everywhere instantly
- [ ] View previous week in Weekly Planner → past day columns show completion % rings from dailyTargets
- [ ] Navigate to tomorrow in Daily Targets → shows pending targets from weeklyPlan for that DOW
- [ ] Open app on a new day (midnight) → getTodayISO() returns new date, derived re-runs with fresh data
- [ ] Add ad-hoc target for today → appears in Daily Targets and Session Log, analytics include it
- [ ] On mobile: hamburger opens left sidebar overlay, tapping backdrop closes it
- [ ] Sidebar collapse button → only icons visible, tooltips on hover

---

## 13. NOTES FOR THE AI ASSISTANT IMPLEMENTING THIS

- **Do not remove existing features** unless this document explicitly says "Remove" or "Replace". Vocab, Quiz, Syllabus, Revision, Pomodoro, Mocks, PYQ Log all stay — only interconnect them via derived state.
- **Do not rename or remove existing CSS variables** — only add new ones to `:root`.
- **Confirm Zustand immer middleware** is configured before writing mutating syntax. If immer is present, `computeDerived(state)` may mutate `state` directly and return it. If not, it must return a new object.
- **Use `crypto.randomUUID()`** for all new ID generation.
- **`computeDerived()` must be fast** — it runs on every state mutation. Use `Map` and `Set` for O(1) lookups. Never use `.find()` inside a loop over large arrays.
- **`derived_*` fields are read-only outputs** — no component should write to them. They are computed, not stored.
- **The Smart Planner page is fully deleted** — do not keep it as a hidden route, commented-out component, or panel anywhere. All its AI suggestion logic, if any, is discarded.
- **Bottom nav is fully deleted** — no `BottomNav.jsx`, no mobile-only nav bar, no fixed bottom element except the sidebar drawer on mobile.
- **Weekly plan recurring items** repeat every week by default. The user changes the topic via `weeklyPlanOverrides`, not by editing the base template each week.
- **Sidebar keyboard shortcut** to toggle: `Ctrl+\` or `Cmd+\`. Escape key closes the overlay on mobile.

---

*ZeroHour V5.0 — Prepare Smart. Perform at Zero Hour.*
