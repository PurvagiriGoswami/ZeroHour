<div align="center">

```
███████╗███████╗██████╗  ██████╗ ██╗  ██╗ ██████╗ ██╗   ██╗██████╗
╚══███╔╝██╔════╝██╔══██╗██╔═══██╗██║  ██║██╔═══██╗██║   ██║██╔══██╗
  ███╔╝ █████╗  ██████╔╝██║   ██║███████║██║   ██║██║   ██║██████╔╝
 ███╔╝  ██╔══╝  ██╔══██╗██║   ██║██╔══██║██║   ██║██║   ██║██╔══██╗
███████╗███████╗██║  ██║╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║  ██║
╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
```

### **Prepare Smart. Perform at Zero Hour.**

*AI-powered defence exam preparation for CDS · AFCAT · NDA aspirants*

<br/>

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-zerohour.netlify.app-00ffc3?style=for-the-badge&logo=netlify&logoColor=black)](https://zerohour.netlify.app)
[![Version](https://img.shields.io/badge/VERSION-7.0-00ffc3?style=for-the-badge)](#)
[![React](https://img.shields.io/badge/REACT-18-61dafb?style=for-the-badge&logo=react&logoColor=black)](#)
[![Firebase](https://img.shields.io/badge/FIREBASE-SYNC-ffca28?style=for-the-badge&logo=firebase&logoColor=black)](#)
[![Status](https://img.shields.io/badge/STATUS-ACTIVE-00ffc3?style=for-the-badge)](#)

</div>

---

## ⬡ What is ZeroHour?

**Zero Hour** — *the decisive moment where preparation meets performance.*

ZeroHour is a personal, all-in-one command centre for defence exam aspirants. It replaces scattered notes, spreadsheets, and revision apps with a single intelligent platform that tracks everything — daily logs, mock scores, vocabulary, spaced revision — and surfaces exactly what needs your attention today.

> Built to be used every single day. Not once a week, not before exam season — **every day**.

---

## ✦ Feature Suite

<table>
<tr>
<td width="50%">

### 📊 Command Dashboard
Real-time overview of your entire preparation:
- Exam countdown timers (CDS I · CDS II · AFCAT · NDA)
- Subject-wise progress donuts
- Mock score trend chart
- Revision overdue alerts
- Today's plan preview
- 7-day habit bar chart

### 📅 Daily Log
Your preparation diary, structured:
- Wake / sleep time tracking
- Energy level (1–5)
- Subject-wise topic logging (Maths · English · GS)
- PYQs done + mock score
- Gym / Mock / Revision toggles
- Notes & tomorrow's plan

### 🔥 Habit Tracker
Six daily habits — tracked and visualised:
- Morning Study · Night Study
- PYQ Practice · Mock / Revision
- Gym · Sleep before midnight
- 30-day heatmap
- Per-habit 7-day completion rate

### 📚 Syllabus Tracker
Complete CDS / AFCAT syllabus, built-in:
- 50 topics across Maths · English · GS · AFCAT
- Subtopic-level checkboxes
- Confidence scoring (1–5)
- Status: Not Started → In Progress → Done
- One-tap ADVANCE to move topics forward

</td>
<td width="50%">

### 📝 Mock Analysis
Every test, dissected:
- Section scores: Maths / English / GS
- Silly errors vs concept gaps counter
- Weak area tagging
- Key takeaway note
- Score trend line chart
- Target gap tracker

### 🔄 Spaced Revision System
Never forget a topic again:
- Configurable revision cycles (R1 → R4+)
- Intervals: 1d · 3d · 7d · 15d (adjustable)
- Auto-detection of overdue topics
- Dashboard alerts with days-late count
- Per-topic round completion toggles

### 📖 Vocabulary Engine
120+ pre-loaded defence exam words:
- Auto-generated synonyms & antonyms
- Hindi meanings + example sentences
- Spaced revision scheduling
- Important word starring
- Search + filter by tag

### 🧠 Weekly Quiz System
Practice, automated:
- Auto-generated MCQs from your vocab bank
- Types: Synonym · Antonym · Meaning · Idioms
- Weekly scheduling (configurable frequency)
- Mistake review with correct answers
- Accuracy trend tracking

</td>
</tr>
<tr>
<td width="50%">

### ⏱ Pomodoro Focus Timer
Structured deep work:
- Custom focus (1–90 min) & break durations
- Animated circular SVG countdown
- Session labels for tracking topics
- Today's total focus time
- 7-day hours-per-day bar chart

### 📋 Smart Planner
Your day, intelligently planned. Auto-generates tasks from:
- Overdue revision topics (highest priority)
- Quiz-identified weak areas
- Vocabulary revision due
- High-priority unstarted topics
- In-progress topics to continue

</td>
<td width="50%">

### 📊 Analytics
Deep performance insights:
- Quiz accuracy trend line chart
- Subject-wise accuracy bar chart
- Topic-wise performance + weakness levels
- Mistake type pie chart
- Mock score bar chart vs target
- Syllabus completion per subject
- Weak areas summary (< 60% accuracy)

### ⚙ Settings & Sync
Full control:
- Profile: name, target exam, score targets
- Firebase cloud sync (real-time, cross-device)
- Excel export (Vocab · Quiz · Planner · Revision)
- JSON full-backup export / import
- Selective data clear + full reset
- Quiz frequency and difficulty config

</td>
</tr>
</table>

---

## 🏗 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18 + Vite 5 | UI + fast dev/build |
| **State** | Zustand 5 | Global state, zero boilerplate |
| **Cloud Sync** | Firebase Firestore | Real-time cross-device sync |
| **Charts** | Recharts + Custom SVG | Analytics + dashboard charts |
| **Styling** | Tailwind CSS v4 + Custom CSS | Utility + bespoke dark theme |
| **Export** | SheetJS (xlsx) | Excel export / import |
| **Deployment** | Netlify | Auto-deploy on push |
| **Fonts** | Orbitron · Share Tech Mono · Rajdhani | Brand typography |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- A Firebase project (Firestore enabled)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/purvagiri/zerohour.git
cd zerohour

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Open .env and fill in your Firebase config

# 4. Start the development server
npm run dev

# 5. Open http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output in /dist — ready to deploy
```

---

## 🔒 Environment Variables

Create a `.env` file in the project root:

```env
VITE_FB_API_KEY=your_api_key
VITE_FB_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FB_PROJECT_ID=your_project_id
VITE_FB_STORAGE_BUCKET=your_project.appspot.com
VITE_FB_MESSAGING_SENDER_ID=your_sender_id
VITE_FB_APP_ID=your_app_id
VITE_FB_MEASUREMENT_ID=G-XXXXXXXXXX
```

> ⚠️ **Never commit `.env` to Git.** It is listed in `.gitignore`.

---

## 📁 Project Structure

```
zerohour/
│
├── index.html                    # Entry point — splash screen, meta tags
├── vite.config.js
├── netlify.toml
├── .env                          # Firebase credentials (not committed)
│
└── src/
    ├── App.jsx                   # Root — routing, swipe nav, keyboard shortcuts
    ├── main.jsx                  # React entry + console branding
    ├── index.css                 # Global styles, CSS variables, ZeroHour theme
    ├── data.js                   # Syllabus, exam data, tab config, constants
    ├── Charts.jsx                # Custom SVG charts (Donut, Line, Bar)
    ├── Toast.jsx                 # Notification system
    ├── Modal.jsx                 # Confirm dialog system
    │
    ├── components/
    │   ├── Header.jsx            # Top bar — brand mark, clock, sync status
    │   ├── Nav.jsx               # Sidebar (desktop) + bottom nav (mobile)
    │   ├── Button.jsx            # Reusable button
    │   └── Card.jsx              # Reusable card
    │
    ├── pages/
    │   ├── Dashboard.jsx         # Command centre overview
    │   ├── DailyLog.jsx          # Daily study diary
    │   ├── Habits.jsx            # Habit tracker + heatmap
    │   ├── Syllabus.jsx          # Full syllabus tracker
    │   ├── Mocks.jsx             # Mock test logger + analysis
    │   ├── PYQLog.jsx            # PYQ session tracker
    │   ├── Revision.jsx          # Spaced revision system
    │   ├── Pomodoro.jsx          # Focus timer
    │   ├── Vocab.jsx             # Vocabulary bank
    │   ├── Quiz.jsx              # Weekly quiz engine
    │   ├── Planner.jsx           # Smart daily planner
    │   ├── Analytics.jsx         # Performance analytics
    │   └── Settings.jsx          # Config + about + data management
    │
    ├── store/
    │   └── useStore.js           # Zustand store + Firebase sync logic
    │
    ├── utils/
    │   ├── dateUtils.js          # Date formatting, streak calc
    │   ├── spacedRepetition.js   # SRS algorithm + due-date logic
    │   ├── weaknessEngine.js     # Accuracy analysis, weak area detection
    │   ├── vocabEngine.js        # Synonym/antonym generation, idioms bank
    │   └── initialVocab.js       # 120+ pre-loaded defence vocabulary
    │
    └── services/
        └── excelService.js       # SheetJS export / import
```

---

## ⌨️ Keyboard Shortcuts

| Key | Page | Key | Page |
|-----|------|-----|------|
| `1` | Dashboard | `6` | PYQ Log |
| `2` | Daily Log | `7` | Revision |
| `3` | Habits | `8` | Pomodoro |
| `4` | Syllabus | `9` | Vocabulary |
| `5` | Mocks | `0` | Quiz |

> On mobile — **swipe left / right** to navigate between pages.

---

## 📱 Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| **Mobile** `< 768px` | Bottom tab bar · full-screen pages · touch swipe |
| **Tablet** `768–1024px` | Icon-only sidebar · optimised two-column grids |
| **Desktop** `> 1024px` | Full labelled sidebar · multi-column layouts |
| **Large Desktop** `> 1440px` | Wider content with generous padding |

---

## ☁️ Deployment

Auto-deploys to Netlify on every push to `main`.

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🗺 Roadmap

- [ ] Google / Phone SSO authentication
- [ ] Multi-user support with per-account data isolation
- [ ] AI-generated study schedule from exam date
- [ ] Offline PWA mode with service worker
- [ ] Push notifications for revision reminders
- [ ] PDF monthly performance report export
- [ ] NDA full syllabus expansion
- [ ] Dark / light theme toggle

---

## 👨‍💻 Author

**Purvagiri Goswami**
Designer · Developer · Defence Aspirant

> *Built ZeroHour as a personal tool. Made it production-grade.*

---

## 📄 License

Personal and educational use only. Redistribution or commercial use is not permitted without explicit written permission.

---

<div align="center">

**ZeroHour © 2026 · All rights reserved**

*"The more you sweat in peace, the less you bleed in war."*

`PREPARE SMART. PERFORM AT ZERO HOUR.`

</div>
