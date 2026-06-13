```
███████╗███████╗██████╗  ██████╗ ██╗  ██╗ ██████╗ ██╗   ██╗██████╗
╚══███╔╝██╔════╝██╔══██╗██╔═══██╗██║  ██║██╔═══██╗██║   ██║██╔══██╗
  ███╔╝ █████╗  ██████╔╝██║   ██║███████║██║   ██║██║   ██║██████╔╝
 ███╔╝  ██╔══╝  ██╔══██╗██║   ██║██╔══██║██║   ██║██║   ██║██╔══██╗
███████╗███████╗██║  ██║╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║  ██║
╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
```

<div align="center">

### **Prepare Smart. Perform at Zero Hour.**

*AI-powered defence exam preparation for CDS · AFCAT · NDA aspirants*

<br/>

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-zerohour--pvg.vercel.app-00ffc3?style=for-the-badge&logo=vercel&logoColor=black)](https://zerohour-pvg.vercel.app)
[![Version](https://img.shields.io/badge/VERSION-7.1-00ffc3?style=for-the-badge)](#)
[![React](https://img.shields.io/badge/REACT-18-61dafb?style=for-the-badge&logo=react&logoColor=black)](#)
[![Firebase](https://img.shields.io/badge/FIREBASE-SYNC-ffca28?style=for-the-badge&logo=firebase&logoColor=black)](#)
[![Vite](https://img.shields.io/badge/VITE-5-646cff?style=for-the-badge&logo=vite&logoColor=white)](#)
[![Tailwind](https://img.shields.io/badge/TAILWIND-v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](#)
[![Status](https://img.shields.io/badge/STATUS-ACTIVE-00ffc3?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/LICENSE-PERSONAL--USE-orange?style=for-the-badge)](#)

<br/>

> **Zero Hour** — *the decisive moment where preparation meets performance.*

</div>

---

## 📌 Table of Contents

- [What is ZeroHour?](#-what-is-zerohour)
- [Live Demo](#-live-demo)
- [What's New in v7.1?](#-whats-new-in-v71)
- [Feature Suite](#-feature-suite)
- [App Architecture](#-app-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Data Flow](#-data-flow)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Firebase Security Rules](#-firebase-security-rules)
- [Keyboard Shortcuts](#%EF%B8%8F-keyboard-shortcuts)
- [Responsive Design](#-responsive-design)
- [Deployment](#%EF%B8%8F-deployment)
- [Spaced Repetition Algorithm](#-spaced-repetition-algorithm)
- [Roadmap](#%EF%B8%8F-roadmap)
- [Author](#-author)

---

## ⬡ What is ZeroHour?

ZeroHour is a **personal, all-in-one command centre** for defence exam aspirants. It replaces scattered notes, spreadsheets, and revision apps with a single intelligent platform that tracks everything — daily logs, mock scores, vocabulary, spaced revision — and surfaces exactly what needs your attention today.

```
BEFORE ZEROHOUR                          WITH ZEROHOUR
─────────────────────────────────────    ─────────────────────────────────────
📒 Paper notes                    →      📊 Dashboard with live insights
📊 Scattered Excel sheets         →      🔄 Unified Spaced Revision System
📱 Multiple apps                  →      🖥 Single command centre
❌ No progress tracking           →      📈 Analytics + Mock Analysis
❌ Forgot what to revise          →      🧠 Smart Planner auto-generates tasks
❌ Vocab lost in notebooks        →      📖 120+ word engine + quiz system
```

> Built to be used **every single day**. Not once a week, not before exam season — **every day**.

---

## 🌐 Live Demo

<div align="center">

| Platform | URL | Status |
|----------|-----|--------|
| **Vercel** | [zerohour-pvg.vercel.app](https://zerohour-pvg.vercel.app) | ✅ Active |
| **Netlify** | [zerohour.netlify.app](https://zerohour.netlify.app) | ✅ Active |

</div>

---

## ✨ What's New in v7.1?

### 🚀 Key Improvements & Fixes
- **✅ Fixed Zustand Store** - Now supports both object patches and function updaters
- **✅ Fixed Firestore Sync Wiring** - Added onSuccess/onError callbacks, proper sync status updates
- **✅ Fixed Sunday Weekly Planner Trap** - Added standalone mode with finish/skip buttons
- **✅ Fixed Stale Spaced Repetition Test** - Created missing spacedRepetition.js file, all tests pass!
- **✅ Fixed Weekly Timetable Default Mismatch** - Added migration from old array format
- **✅ Fixed Onboarding Reachability** - Added localStorage check for reliable onboarding
- **✅ Fixed Login Firebase Guard** - Added Firebase auth guard with friendly error messages
- **✅ Safer Data Deletion** - Replaced localStorage.clear() with targeted removal
- **✅ Added Sync Center in Settings** - Shows live sync status, allows force sync
- **✅ Added Offline-First Write Queue** - Queues changes for later when offline
- **✅ Improved JSON Backup/Restore** - Added full JSON import functionality
- **✅ Added Study Streak Calendar** - 90-day streak heatmap in Analytics
- **✅ Added Weekly Adherence Heatmap** - Visual target completion rate
- **✅ Fixed Firestore Security Rules** - Updated rules to correct path
- **✅ Cleaned Up Redundant Files** - Removed unused files from project
- **✅ Optimized Build** - Added manual chunking for better load performance

---

## ✦ Feature Suite

ZeroHour ships with **13 fully integrated modules**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ZEROHOUR MODULE MAP                                 │
├─────────────────┬─────────────────┬─────────────────┬────────────────────  │
│  📊 DASHBOARD   │  📅 DAILY LOG   │  🔥 HABITS      │  📚 SYLLABUS        │
│  Command Centre │  Study Diary    │  Heatmap Track  │  Topic Checkboxes   │
├─────────────────┼─────────────────┼─────────────────┼────────────────────  │
│  📝 MOCK TEST   │  🔄 REVISION    │  📖 VOCABULARY  │  🧠 QUIZ ENGINE     │
│  Score Analysis │  Spaced SRS     │  120+ Words     │  Weekly MCQs        │
├─────────────────┼─────────────────┼─────────────────┼────────────────────  │
│  ⏱ POMODORO    │  📋 PLANNER     │  📊 ANALYTICS   │  ⚙ SETTINGS        │
│  Focus Timer    │  Smart Tasks    │  Deep Insights  │  Cloud Sync         │
└─────────────────┴─────────────────┴─────────────────┴────────────────────  │
                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 📊 Command Dashboard
Real-time overview of your entire preparation at a glance:

- ⏳ Exam countdown timers — **CDS I · CDS II · AFCAT · NDA**
- 🍩 Subject-wise progress donut charts
- 📈 Mock score trend chart
- 🚨 Revision overdue alerts
- 📋 Today's plan preview
- 📅 7-day habit bar chart

---

### 📅 Daily Log
Your preparation diary, structured for accountability:

| Field | Options |
|-------|---------|
| Wake / Sleep time | Time picker |
| Energy level | 1–5 scale |
| Topics logged | Maths · English · GS |
| PYQs done | Count input |
| Mock score | Percentage |
| Toggles | Gym · Mock · Revision |
| Notes | Free text |
| Tomorrow's plan | Free text |

---

### 🔥 Habit Tracker
Six core habits — tracked daily, visualised over 30 days:

```
HABIT GRID (sample 7-day view)
                  Mon  Tue  Wed  Thu  Fri  Sat  Sun
Morning Study      ✅   ✅   ✅   ❌   ✅   ✅   ✅
Night Study        ✅   ✅   ❌   ✅   ✅   ✅   ❌
PYQ Practice       ✅   ❌   ✅   ✅   ❌   ✅   ✅
Mock / Revision    ❌   ✅   ✅   ✅   ✅   ❌   ✅
Gym                ✅   ✅   ✅   ✅   ❌   ✅   ✅
Sleep Before 12    ✅   ❌   ✅   ✅   ✅   ✅   ❌

Completion Rate    83%  67%  83% 100%  67%  83%  67%
```

---

### 📚 Syllabus Tracker
Complete CDS / AFCAT syllabus built-in — **50+ topics**:

| Subject | Topics | Features |
|---------|--------|----------|
| **Mathematics** | 20 | Subtopic checkboxes + confidence 1–5 |
| **English** | 15 | Status: Not Started → In Progress → Done |
| **General Studies** | 10 | One-tap ADVANCE to next stage |
| **AFCAT Specific** | 5+ | Full AFCAT expansion |

---

### 📝 Mock Analysis
Every test dissected for maximum insight:

```
MOCK ENTRY STRUCTURE
─────────────────────────────────────────
  Section Scores:  Maths / English / GS
  Error Types:     Silly Errors  vs  Concept Gaps
  Weak Areas:      Auto-tagged by subject
  Key Takeaway:    Personal note
  Charts:          Score trend + Target gap
```

---

### 🔄 Spaced Revision System
Never forget a topic again with the built-in SRS:

```
REVISION CYCLE FLOW
─────────────────────────────────────────────────────────────
Topic Added  →  R1 (1 day)  →  R2 (3 days)  →  R3 (7 days)  →  R4+ (15 days)
     │                │               │                │                │
   NEW            Due Today         Due +3           Due +7          Mastered
```

- ⚠️ Auto-detection of **overdue topics**
- 🔔 Dashboard alerts with days-late count
- ⚙️ Configurable intervals per round

---

### 📖 Vocabulary Engine
120+ pre-loaded defence exam words with full automation:

```
WORD CARD STRUCTURE
──────────────────────────────────
  Word:         TENACIOUS
  Meaning:      Holding firmly; persistent
  Hindi:        दृढ़
  Synonyms:     Persistent · Resolute · Steadfast
  Antonyms:     Yielding · Weak · Vacillating
  Example:      "The tenacious soldier refused to retreat."
  SRS Status:   R2 — Due in 3 days
  Tag:          ⭐ Important
```

---

### 🧠 Weekly Quiz System
Automated MCQ practice drawn from your own vocab bank:

| Type | Description |
|------|-------------|
| Synonym | Pick the closest meaning |
| Antonym | Choose the opposite |
| Meaning | Identify the correct definition |
| Idioms | Phrase interpretation |

---

### ⏱ Pomodoro Focus Timer
Structured deep work with full session analytics:

```
FOCUS SESSION
┌─────────────────────────────┐
│      ● ZEROHOUR FOCUS       │
│                             │
│        ╔═══════╗            │
│        ║ 23:47 ║            │
│        ╚═══════╝            │
│                             │
│  Topic: Chapter 3 — Maths  │
│  Today: 4h 20m total       │
│  ████████░░  7-day bar     │
└─────────────────────────────┘
```

---

### 📋 Smart Planner
Auto-generates your daily task list from:

1. 🚨 **Overdue revision topics** (highest priority)
2. 🧠 **Quiz-identified weak areas**
3. 📖 **Vocabulary revision due**
4. 📚 **High-priority unstarted topics**
5. 🔄 **In-progress topics to continue**

---

### 📊 Analytics
Deep performance insights across all modules:

```
ANALYTICS DASHBOARD — METRICS TRACKED
──────────────────────────────────────────────────────────────
  📈 Quiz accuracy trend          (line chart, 30-day)
  📊 Subject-wise accuracy        (bar chart: Maths/English/GS)
  🥧 Mistake type breakdown       (pie: silly vs concept gaps)
  📈 Mock score trend vs target   (line + target overlay)
  📚 Syllabus completion %        (per subject)
  ⚠️ Weak areas summary           (all topics < 60% accuracy)
  📆 90-Day Study Streak Calendar (heatmap)
  📊 Weekly Adherence Heatmap     (target completion rate)
```

---

### ⚙ Settings
Full configuration and data management:

- 🔄 **Sync Center** - Real-time sync status, force sync button
- 📋 **Notifications** - Toggle notifications on/off
- 📄 **Data Operations** - Excel export, JSON backup/import
- 🗑️ **Data Management** - Safe targeted data deletion
- 📅 **Weekly Timetable** - Configure your study schedule

---

## 🏗 App Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥 Client — React 18 + Vite 5"]
        UI["UI Layer\n(Pages + Components)"]
        STORE["State Layer\n(Zustand Store)"]
        UTILS["Utility Layer\n(SRS · Vocab · Weakness Engine)"]
        CHARTS["Charts Layer\n(Recharts + Custom SVG)"]
    end

    subgraph CLOUD["☁️ Cloud — Firebase"]
        FS["Firestore\n(Real-time Sync)"]
        AUTH["Auth\n(Email/Password + Google)"]
    end

    subgraph EXPORT["📤 Export"]
        EXCEL["Excel (SheetJS)"]
        JSON["JSON Backup + Import"]
    end

    UI <--> STORE
    STORE <--> FS
    STORE --> UTILS
    UTILS --> UI
    CHARTS --> UI
    STORE --> EXCEL
    STORE --> JSON
```

---

## 🏗 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | React | 18 | UI component system |
| **Build Tool** | Vite | 5 | Fast dev server + build |
| **State** | Zustand | 5 | Global state, zero boilerplate |
| **Cloud Sync** | Firebase Firestore | v9 | Real-time cross-device sync |
| **Auth** | Firebase Auth | v9 | Email/Password + Google SSO |
| **Charts** | Recharts + Custom SVG | — | Analytics + dashboard charts |
| **Styling** | Tailwind CSS v4 + Custom CSS | v4 | Utility + bespoke dark theme |
| **Export** | SheetJS (xlsx) | — | Excel export / import |
| **Deployment** | Vercel + Netlify | — | Auto-deploy on push |
| **Fonts** | Orbitron · Share Tech Mono · Rajdhani | — | Brand typography |

```
LANGUAGE BREAKDOWN

  JavaScript  ████████████████████████████░░░  90.4%
  CSS         ██████░░░░░░░░░░░░░░░░░░░░░░░░░   9.2%
  HTML        █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0.4%
```

---

## 📁 Project Structure

```
zerohour/
│
├── 📄 index.html                   # Entry point — splash screen, meta tags
├── ⚙️  vite.config.js
├── 🔧 netlify.toml
├── 🔒 .env                         # Firebase credentials (NOT committed)
├── 📄 .env.example                # Environment variable template
├── 📄 firestore.rules              # Firestore security rules
│
└── src/
    ├── 🚀 App.jsx                  # Root — routing, swipe nav, keyboard shortcuts
    ├── 🎯 main.jsx                 # React entry + console branding
    ├── 🎨 index.css                # Global styles, CSS variables, ZeroHour theme
    ├── 📊 data.js                  # Syllabus, exam data, tab config, constants
    ├── 📈 Charts.jsx               # Custom SVG charts (Donut, Line, Bar)
    ├── 🔔 Toast.jsx                # Notification system
    ├── 💬 Modal.jsx                # Confirm dialog system
    │
    ├── components/
    │   ├── Header.jsx              # Top bar — brand mark, clock, sync status
    │   ├── Nav.jsx                 # Sidebar (desktop) + bottom nav (mobile)
    │   ├── Button.jsx              # Reusable button
    │   └── Card.jsx                # Reusable card
    │
    ├── pages/
    │   ├── 📊 HQDashboard.jsx      # Command centre overview
    │   ├── 📅 DailyTargets.jsx     # Daily study targets
    │   ├── 🔥 WeeklyPlanner.jsx    # Weekly schedule planner
    │   ├── 📚 SyllabusSetup.jsx    # Full syllabus tracker
    │   ├── 📝 MockTestLog.jsx      # Mock test logger + analysis
    │   ├── 📋 RevisionQueue.jsx    # Spaced revision system
    │   ├── ⏱ SessionLogger.jsx     # Focus timer
    │   ├── 📖 Profile.jsx          # User profile + settings
    │   ├── 🧠 Analytics.jsx        # Performance analytics + streak calendar
    │   └── ⚙️  Settings.jsx         # Config + sync center + data management
    │
    ├── store/
    │   └── 🗄️  useStore.js          # Zustand store + Firebase sync logic
    │
    ├── utils/
    │   ├── 📅 dateUtils.js          # Date formatting, streak calc
    │   ├── 🔄 spacedRepetition.js   # SRS algorithm + due-date logic
    │   ├── 🧠 tacticalEngine.js     # Accuracy analysis, weak area detection
    │   ├── 📖 helpers.js            # Utility functions
    │   ├── 📚 derivedState.js       # Derived state calculations
    │   └── timerSound.js            # Pomodoro timer sounds
    │
    └── services/
        ├── 📤 excelService.js       # SheetJS export / import
        └── ☁️ firebaseSync.js       # Firestore sync + offline queue
```

---

## 🔀 Data Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant UI as 🖥 React UI
    participant ZS as 🗄 Zustand Store
    participant FB as ☁️ Firebase Firestore
    participant SW as 🧠 Smart Planner
    participant SRS as 🔄 SRS Engine

    U->>UI: Logs a studied topic
    UI->>ZS: dispatch(addTopic)
    ZS->>FB: setDoc (real-time sync)
    ZS->>SRS: scheduleRevision(topic, R1)
    SRS-->>ZS: dueDate = today + 1 day

    Note over ZS,SW: Next day — dashboard load

    ZS->>SW: getOverdueTasks()
    SW->>SRS: getDueTopics(today)
    SRS-->>SW: [topic1, topic2]
    SW-->>UI: render Smart Planner tasks
    UI-->>U: "2 topics overdue for revision"
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- A Firebase project with Firestore enabled
- Email/Password authentication enabled in Firebase

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/PurvagiriGoswami/ZeroHour.git
cd ZeroHour

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Open .env and fill in your Firebase config keys

# 4. Start the development server
npm run dev

# 5. Open your browser at:
#    http://localhost:5173
```

### Build for Production

```bash
npm run build
# ✅ Output in /dist — ready to deploy
```

### Preview Production Build

```bash
npm run preview
# Spins up a local server serving the /dist build
```

### Run Tests

```bash
npm test
# Runs all tests with Vitest
```

---

## 🔒 Environment Variables

Create a `.env` file in the project root with your Firebase project credentials:

```env
VITE_FB_API_KEY=your_api_key
VITE_FB_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FB_PROJECT_ID=your_project_id
VITE_FB_STORAGE_BUCKET=your_project.appspot.com
VITE_FB_MESSAGING_SENDER_ID=your_sender_id
VITE_FB_APP_ID=your_app_id
VITE_FB_MEASUREMENT_ID=G-XXXXXXXXXX
```

> ⚠️ **Never commit `.env` to Git.** It is already listed in `.gitignore`.

To get these values:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create or select a project
3. Go to **Project Settings → General → Your apps → Web app**
4. Copy the `firebaseConfig` object values

---

## � Firebase Security Rules

The updated security rules are in `firestore.rules`:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/userData/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### How to Deploy Rules:
1. **Via Firebase CLI**:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Via Firebase Console**:
   - Go to Firebase Console → Firestore Database → Rules
   - Copy-paste the rules from `firestore.rules`
   - Click "Publish"!

---

## �🔄 Spaced Repetition Algorithm

ZeroHour uses a **custom SRS (Spaced Repetition System)** inspired by SM-2:

```
REVISION SCHEDULE
─────────────────────────────────────────────────────────────────────
Round    Interval     Trigger Condition
─────────────────────────────────────────────────────────────────────
  R1     +1 day       Topic first logged
  R2     +3 days      R1 completed ✅
  R3     +7 days      R2 completed ✅
  R4+    +15 days     R3+ completed ✅ (repeats)
─────────────────────────────────────────────────────────────────────
Overdue  Alert fires  if today > dueDate
Dashboard shows days-late count per topic
```

```mermaid
graph LR
    A[📚 Topic Logged] --> B[R1: +1 day]
    B -- Revised ✅ --> C[R2: +3 days]
    C -- Revised ✅ --> D[R3: +7 days]
    D -- Revised ✅ --> E[R4+: +15 days]
    E -- Revised ✅ --> E
    B -- Missed ❌ --> F[⚠️ Overdue Alert]
    C -- Missed ❌ --> F
    D -- Missed ❌ --> F
    F --> G[📋 Smart Planner picks up]
    G --> B
```

---

## ⌨️ Keyboard Shortcuts

Navigate the entire app without touching your mouse:

| Key | Page | Key | Page |
|-----|------|-----|------|
| `1` | 📊 HQ Dashboard | `6` | � Daily Targets |
| `2` | 📅 Weekly Planner | `7` | � Mock Test Log |
| `3` | � Revision Queue | `8` | ⏱ Session Logger |
| `4` | 📚 Syllabus Setup | `9` | � Profile |
| `5` | � Analytics | `0` | ⚙️ Settings |

> 📱 On mobile — **swipe left / right** to navigate between pages.

---

## 📱 Responsive Design

ZeroHour is fully responsive across all screen sizes:

```
BREAKPOINT STRATEGY
──────────────────────────────────────────────────────────────────
  Mobile      < 768px     Bottom tab bar · full-screen pages · touch swipe
  Tablet      768–1024px  Icon-only sidebar · two-column grids
  Desktop     > 1024px    Full labelled sidebar · multi-column layouts
  Wide        > 1440px    Expanded content with generous padding
──────────────────────────────────────────────────────────────────
```

```mermaid
graph LR
    subgraph Mobile["📱 Mobile <768px"]
        M1[Bottom Tab Bar]
        M2[Touch Swipe Nav]
        M3[Full-screen Pages]
    end
    subgraph Tablet["📟 Tablet 768–1024px"]
        T1[Icon-only Sidebar]
        T2[Two-column Grids]
    end
    subgraph Desktop["🖥 Desktop >1024px"]
        D1[Full Sidebar]
        D2[Multi-column Layouts]
        D3[Keyboard Shortcuts]
    end
```

---

## ☁️ Deployment

ZeroHour auto-deploys to both Vercel and Netlify on every push to `main`.

### Vercel (Primary)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify (Secondary)

Config via `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### CI/CD Flow

```
git push origin main
       │
       ▼
  GitHub Repo
  ┌────┴────┐
  │         │
Vercel   Netlify
  │         │
Build    Build
  │         │
Deploy   Deploy
  │         │
  └────┬────┘
       │
  Live in ~60s
```

---

## 🗺️ Roadmap

```
ZEROHOUR ROADMAP
─────────────────────────────────────────
  v7.1 (Current)
  ✅  13 fully integrated modules
  ✅  Firebase real-time sync with offline queue
  ✅  Excel + JSON export/import
  ✅  120+ vocabulary engine
  ✅  Custom SRS algorithm
  ✅  Study streak calendar + adherence heatmap
  ✅  Sync center in Settings
  ✅  Fixed all security + reliability issues

  v8.0 (Planned)
  🔲  Push notifications for revision reminders
  🔲  Offline PWA mode + service worker
  🔲  Dark / light theme toggle
  🔲  Improved mobile UI

  v9.0 (Future)
  🔲  AI-generated study schedule from exam date
  🔲  PDF monthly performance report export
  🔲  NDA full syllabus expansion
─────────────────────────────────────────
```

---

## 📊 Module Feature Matrix

| Module | Charts | SRS | Firebase Sync | Export | Mobile |
|--------|--------|-----|---------------|--------|--------|
| HQ Dashboard | ✅ | ✅ | ✅ | — | ✅ |
| Weekly Planner | — | — | ✅ | — | ✅ |
| Daily Targets | — | ✅ | ✅ | — | ✅ |
| Syllabus | ✅ | ✅ | ✅ | — | ✅ |
| Mock Analysis | ✅ | — | ✅ | ✅ | ✅ |
| Revision Queue | ✅ | ✅ | ✅ | ✅ | ✅ |
| Session Logger | ✅ | — | ✅ | — | ✅ |
| Profile | — | — | ✅ | ✅ | ✅ |
| Analytics | ✅ | — | ✅ | — | ✅ |
| Settings | — | — | ✅ | ✅ | ✅ |

---

## 👨‍💻 Author

<div align="center">

**Purvagiri Goswami**
Designer · Developer · Defence Aspirant

[![GitHub](https://img.shields.io/badge/GitHub-PurvagiriGoswami-181717?style=for-the-badge&logo=github)](https://github.com/PurvagiriGoswami)
[![Live App](https://img.shields.io/badge/Live_App-zerohour--pvg.vercel.app-00ffc3?style=for-the-badge&logo=vercel&logoColor=black)](https://zerohour-pvg.vercel.app)

> *Built ZeroHour as a personal tool. Made it production-grade.*

</div>

---

## 📄 License

Personal and educational use only.
Redistribution or commercial use is **not permitted** without explicit written permission from the author.

---

<div align="center">

**ZeroHour © 2026 · All rights reserved**

*"The more you sweat in peace, the less you bleed in war."*

`PREPARE SMART. PERFORM AT ZERO HOUR.`

</div>
