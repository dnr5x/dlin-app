# هاوەڵی خوێندنی دلین · Dlin's Study Companion

A mobile-first, RTL, Kurdish-Sorani **Progressive Web App** that helps a 12th-grade
student prepare for the ministry final exams. Notes, quizzes, a Pomodoro
focus timer, and an exam countdown — all stored locally on the device.

## ✨ Features

- **داشبۆردی کەسی (Home)** — warm greeting, live exam countdown, daily Kurdish quote, quick links.
- **بابەتەکان (Subjects)** — Math, Physics, Chemistry, Biology, Kurdish, English. Each subject has two tabs:
  - **تێبینییەکان (Notes)** — clean editor with **auto-save** (no save button needed).
  - **کویزەکان (Quizzes)** — create / edit / delete multiple-choice questions.
- **کویز (Quiz mode)** — questions one at a time, live scoring, and encouraging Kurdish feedback at the end.
- **مۆدی فۆکەس (Focus / Pomodoro)** — large circular timer, adjustable work/break lengths, gentle chime + vibration when finished.
- **ڕێکخستنەکان (Settings)** — dark-mode toggle, student name, exam date, full data reset.

## 🎨 Design

- **Mobile-first** — constrained to a phone-sized frame and centered on desktop.
- **RTL everywhere** (`dir="rtl"`, `lang="ckb"`) with the *Vazirmatn* Kurdish/Arabic font.
- Soft pastel palette (purples, pinks, blues) with a seamless **dark mode** (deep navy).
- Touch-optimized: every interactive control meets the 44×44px minimum.
- Smooth, native-like transitions via **Framer Motion**.

## 🧱 Tech Stack

| Layer        | Choice                                    |
| ------------ | ----------------------------------------- |
| Framework    | React 18 + Vite                           |
| Routing      | react-router-dom                          |
| Styling      | Tailwind CSS (class-based dark mode, RTL) |
| Animation    | Framer Motion                             |
| Icons        | lucide-react                              |
| State/Storage| Context API + `localStorage`              |
| PWA          | Web App Manifest + service worker         |

## 🚀 Getting Started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (also exposed on your local network for phone testing)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

Open the **Network** URL printed by `npm run dev` on your phone (same Wi-Fi) to try
it as a real mobile app, or "Add to Home Screen" to install the PWA.

## 📁 Project Structure

```
src/
├── main.jsx                 # entry + service-worker registration
├── App.jsx                  # routes
├── index.css                # Tailwind layers + design tokens
├── context/
│   └── AppContext.jsx       # theme, notes, quizzes, settings (persisted)
├── hooks/
│   └── useLocalStorage.js   # persistent state hook
├── data/
│   ├── subjects.js          # subject list (Kurdish)
│   └── quotes.js            # daily study quotes (Kurdish)
├── components/
│   ├── Layout.jsx           # mobile frame
│   ├── BottomNav.jsx        # fixed bottom navigation
│   ├── PageTransition.jsx   # shared page animation
│   ├── Modal.jsx            # bottom-sheet modal
│   ├── ConfirmDialog.jsx    # delete confirmation
│   ├── CountdownTimer.jsx   # exam countdown
│   ├── QuoteWidget.jsx      # quote of the day
│   ├── NotesEditor.jsx      # auto-saving notes
│   ├── QuizForm.jsx         # create/edit MCQ questions
│   └── QuizManager.jsx      # list + CRUD + launch quiz
└── pages/
    ├── Home.jsx
    ├── Subjects.jsx
    ├── SubjectDetail.jsx     # Notes / Quizzes tabs
    ├── QuizPlayer.jsx        # take-quiz mode
    ├── Focus.jsx             # Pomodoro timer
    └── Settings.jsx
```

All data lives in `localStorage` under the `dlin:` prefix — nothing leaves the device.
