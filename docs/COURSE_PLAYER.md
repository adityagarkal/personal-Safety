The player should work for:

001 Personal Safety
008 Human Relations
017 Steering Gear
Future CBTs

High Level Flow:

User Login
    ↓

Dashboard
    ↓

Start CBT
    ↓

Course Selection
    ↓

Language Selection
    ↓

CBT Player
    ↓

Track Progress
    ↓

Course Complete

┌────────────────────────────────────────────────────┐
│ TOP BAR                                             │
│ Logo | Course Name | User | Progress               │
├─────────────┬──────────────────────────────────────┤
│ LEFT PANEL  │ MAIN CONTENT                         │
│             │                                      │
│ Chapters    │ Page Content                         │
│ Lessons     │ Images                               │
│ Progress    │ Audio                                │
│             │ Quiz                                 │
├─────────────┴──────────────────────────────────────┤
│ Previous | Next | Exit                             │
└────────────────────────────────────────────────────┘

---------
src/

modules/

  course-player/

      components/
      services/
      hooks/
      utils/

      CoursePlayer.jsx
      NavigationPanel.jsx
      ContentRenderer.jsx
      ProgressBar.jsx