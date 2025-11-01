# Anti-Cheat System Documentation

## Overview

Signum implements a **real-time academic integrity monitoring system** for both quiz and coding assessments. The system detects suspicious activities, tracks violations, and enforces progressive blocking to ensure fair evaluation of student performance.

**Coverage:** Quiz assessments and coding challenges  
**Detection:** Client-side monitoring with server-side enforcement  
**Enforcement:** Progressive time-based blocking  
**Storage:** Immutable violation logs in Firestore  

---

## System Architecture

### Components

**Frontend (React)**
- Real-time violation detection
- Event listeners for suspicious activities
- Local violation count display
- Block timer UI

**Backend (FastAPI)**
- Violation logging (`anti_cheat_events` collection)
- Block creation and management
- Status checking and validation
- Auto-expiry handling

**Database (Firestore)**
- Violation records (append-only, immutable)
- Block records (time-based expiration)
- Per-user, per-course, per-assessment tracking

---

## Detection Mechanisms

### Quiz Anti-Cheat

**Detected Activities:**

| Violation Type | Description | Detection Method |
|----------------|-------------|------------------|
| **Tab/Window Switch** | User switches to another tab or application | `document.visibilitychange` event |
| **Copy/Paste** | User attempts to copy or paste content | `Ctrl+C`, `Ctrl+V` keyboard events |
| **Right-Click** | User opens context menu | `contextmenu` event prevention |
| **Developer Tools** | User opens browser DevTools | Window size difference detection |
| **Fullscreen Exit** | User exits fullscreen mode | `fullscreenchange` event |
| **Browser Blur** | Quiz window loses focus | `blur` and `focus` events |
| **Forbidden Keys** | F5 (refresh), F11 (fullscreen), F12 (devtools) | `keydown` event filtering |
| **Restricted Shortcuts** | Ctrl+S (save), Ctrl+P (print), Ctrl+U (view source) | Keyboard combination blocking |

**Implementation:**
```javascript
// Frontend Detection (QuizPage.jsx)
MAX_VIOLATIONS = 3  // Violation threshold before block

// Event Listeners:
- document.addEventListener('visibilitychange', detectTabSwitch)
- document.addEventListener('contextmenu', detectRightClick)
- document.addEventListener('keydown', detectKeyboardShortcuts)
- window.addEventListener('blur', detectWindowBlur)
- document.addEventListener('fullscreenchange', detectFullscreenExit)
```

### Coding Challenge Anti-Cheat

**Detected Activities:**

| Violation Type | Description | Detection Method |
|----------------|-------------|------------------|
| **Tab Switch** | User switches away from coding page | `document.hidden` state change |
| **Copy Attempt** | User tries to copy code | `copy` event prevention |
| **Paste Attempt** | User tries to paste code | `paste` event prevention |
| **Window Blur** | Coding window loses focus | `blur` event tracking |

**Implementation:**
```javascript
// Frontend Detection (CodingChallengePage.jsx)
MAX_VIOLATIONS = 3  // Violation threshold before block

// Event Listeners:
- document.addEventListener('visibilitychange', handleVisibilityChange)
- document.addEventListener('copy', handleCopy)
- document.addEventListener('paste', handlePaste)
- window.addEventListener('blur', handleBlur)
```

---

## Violation Workflow

### 1. Violation Detection (Frontend)

```javascript
// User triggers suspicious activity (e.g., tab switch)
↓
addViolation(type)
  ├─ Check if assessment started (quiz/coding)
  ├─ Check if at MAX_VIOLATIONS (3)
  ├─ Create violation object:
  │    {
  │      type: "Tab Switch",
  │      timestamp: ISO 8601,
  │      id: unique ID
  │    }
  ├─ Add to local state (violations array)
  └─ Send to backend API
```

### 2. Violation Reporting (Backend)

```
POST /assessment/{course_id}/anti-cheat/report
Body: {
  user_id: "user123",
  course_id: "data-structures",
  assessment_type: "quiz" | "coding",
  violation_type: "Tab Switch",
  timestamp: "2025-11-01T12:00:00Z"
}

↓
AntiCheatService.report_violation()
  ├─ AssessmentRepository.record_violation()
  │    └─ Save to anti_cheat_events collection (UUID)
  ├─ Get total violation count
  └─ Check blocking thresholds:
       └─ If ≥3 violations → Create block
```

### 3. Progressive Blocking

**Thresholds:**

| Violation Count | Block Duration | Action |
|----------------|----------------|--------|
| 1-2 violations | No block | Warning only |
| 3 violations | 15 minutes | First block |
| 5 violations | 30 minutes | Extended block |
| 7+ violations | 60 minutes | Maximum block |

**Block Creation:**
```
AntiCheatService.create_block()
  └─ AssessmentRepository.create_block()
       ├─ Document ID: {user_id}_{course_id}_{assessment_type}_block
       ├─ block_end_time: current_time + duration_minutes
       ├─ violation_count: total violations
       └─ is_active: true
```

### 4. Block Enforcement

**Frontend Auto-Block:**
```javascript
// Check after each violation
if (violations.length >= MAX_VIOLATIONS) {
  blockQuizAccess() // or blockChallengeAccess()
  ├─ Set blocked state
  ├─ Start countdown timer
  ├─ Disable submit button
  └─ Show block message with time remaining
}
```

**Backend Validation:**
```
Before quiz/coding submission:
  ├─ GET /assessment/{course_id}/anti-cheat/status
  ├─ Check is_blocked status
  └─ If blocked:
       ├─ Return 403 Forbidden
       ├─ Return time_remaining_ms
       └─ Reject submission
```

### 5. Block Expiration

**Auto-Clear (Frontend):**
```javascript
// Countdown timer in QuizPage/CodingChallengePage
useEffect(() => {
  if (blockEndTime && timeRemaining > 0) {
    interval = setInterval(() => {
      remaining = blockEndTime - now
      
      if (remaining <= 0) {
        ├─ Set blocked = false
        ├─ Clear violations array
        ├─ POST /anti-cheat/clear (backend cleanup)
        └─ Allow new quiz/coding attempt
      }
    }, 1000)
  }
}, [blockEndTime])
```

**Backend Status Check:**
```python
AssessmentRepository.get_block_status()
  ├─ Fetch block document
  ├─ Check block_end_time > now
  └─ If expired:
       ├─ Set is_active = false
       └─ Return is_blocked = false
```

---

## Data Models

### Violation Event (Firestore)

```javascript
// Collection: anti_cheat_events
// Document ID: UUID (auto-generated)

{
  id: "550e8400-e29b-41d4-a716-446655440000",
  user_id: "user123@example.com",
  course_id: "data-structures",
  assessment_type: "quiz",  // or "coding"
  event_type: "violation",
  violation_type: "Tab Switch",
  timestamp: "2025-11-01T12:00:00.000Z",
  created_at: Timestamp  // Firestore server timestamp
}
```

### Block Event (Firestore)

```javascript
// Collection: anti_cheat_events
// Document ID: {user_id}_{course_id}_{assessment_type}_block

{
  id: "user123_data-structures_quiz_block",
  user_id: "user123@example.com",
  course_id: "data-structures",
  assessment_type: "quiz",  // or "coding"
  event_type: "block",
  violation_count: 3,
  block_end_time: Timestamp("2025-11-01T12:15:00.000Z"),
  blocked_at: Timestamp("2025-11-01T12:00:00.000Z"),
  is_active: true
}
```

---

## API Endpoints

### Report Violation
```
POST /assessment/{course_id}/anti-cheat/report

Request Body:
{
  "user_id": "user123",
  "course_id": "data-structures",
  "assessment_type": "quiz",
  "violation_type": "Tab Switch",
  "timestamp": "2025-11-01T12:00:00Z"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "violation_type": "Tab Switch",
    "created_at": "timestamp"
  }
}
```

### Check Status
```
GET /assessment/{course_id}/anti-cheat/status
Query Params: ?user_id={id}&assessment_type={quiz|coding}

Response:
{
  "success": true,
  "data": {
    "violations": [
      {
        "id": "uuid",
        "violation_type": "Tab Switch",
        "timestamp": "2025-11-01T12:00:00Z"
      }
    ],
    "violation_count": 3,
    "is_blocked": true,
    "block_end_time": "2025-11-01T12:15:00Z",
    "time_remaining_ms": 900000  // 15 minutes in milliseconds
  }
}
```

### Clear Violations
```
POST /assessment/{course_id}/anti-cheat/clear
Query Params: ?user_id={id}&assessment_type={quiz|coding}

Response:
{
  "success": true,
  "data": {
    "violations_cleared": 3,
    "block_cleared": true,
    "timestamp": "2025-11-01T12:15:00Z"
  }
}
```

---

## Feature Flags

**Configuration File:** `frontend/src/config/features.js`

### Quiz Anti-Cheat
```javascript
QUIZ_ANTI_CHEAT_ENABLED: true   // Enable/disable anti-cheat
QUIZ_TESTING_MODE: false         // Bypass anti-cheat for testing
```

**Behavior:**
- `QUIZ_ANTI_CHEAT_ENABLED = true` → Full anti-cheat monitoring active
- `QUIZ_TESTING_MODE = true` → Violations detected but not enforced (testing only)
- Both `false` → No anti-cheat (not recommended for production)

### Usage in Code
```javascript
import { isQuizAntiCheatEnabled, isQuizTestingMode } from './config/features';

const antiCheatEnabled = isQuizAntiCheatEnabled() && !isQuizTestingMode();

if (antiCheatEnabled) {
  // Add event listeners and track violations
}
```

---

## User Experience

### Warning System

**Visual Indicators:**
- 🔴 **Red Warning Bar:** Appears when violation detected
- **Violation Counter:** Shows `(1/3)`, `(2/3)`, `(3/3)`
- **Toast Notifications:** "⚠️ Violation detected: Tab Switch (2/3)"

**Progressive Warnings:**
```
1st Violation → Yellow warning: "Warning: 1 violation detected"
2nd Violation → Orange warning: "Caution: 2 violations detected (1 more = block)"
3rd Violation → Red alert: "Blocked for 15 minutes"
```

### Block UI

**Quiz Block Screen:**
```
┌─────────────────────────────────────────┐
│   🚫 Quiz Access Blocked                │
│                                         │
│   You have exceeded the maximum number  │
│   of violations (3).                    │
│                                         │
│   Time Remaining: 14:32                 │
│                                         │
│   Please wait before retrying.          │
│                                         │
│   Violations:                           │
│   • Tab Switch (12:00:05)               │
│   • Copy Attempt (12:01:23)             │
│   • Right-click (12:02:45)              │
└─────────────────────────────────────────┘
```

**Coding Challenge Block Screen:**
```
┌─────────────────────────────────────────┐
│   ⚠️ Challenge Access Blocked           │
│                                         │
│   Anti-cheat violations detected.       │
│   Cooldown: 14:32 remaining             │
│                                         │
│   [Clear Violations] (Testing Mode Only)│
└─────────────────────────────────────────┘
```

---

## System Constraints

**Assessment Context:**
- Violations only tracked when quiz/coding is **actively started**
- Browsing quiz page before starting does NOT trigger violations
- Violations cleared when user returns to page after block expiry

**Testing Mode:**
- `QUIZ_TESTING_MODE = true` disables all enforcement
- Violations still logged but not counted
- Used for development/debugging only

**Block Behavior:**
- Blocks are time-based, not attempt-based
- User can retry immediately after block expires
- Violations reset after successful completion

**Scope:**
- Anti-cheat only applies to quiz and coding assessments
- Does NOT monitor learning modules, course reading, AI chat, or profile pages

**Database:**
- Violation records are append-only (immutable)
- Block records auto-expire based on timestamp
- Manual clearing available via testing mode only

---

## Visual System Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                    ANTI-CHEAT SYSTEM ARCHITECTURE                     │
└───────────────────────────────────────────────────────────────────────┘

                         ┌──────────────┐
                         │     USER     │
                         │  (Browser)   │
                         └──────┬───────┘
                                │
                    Suspicious Activity Detected
                                │
        ┌───────────────────────┴────────────────────────┐
        │                                                │
        ▼                                                ▼
┌──────────────────┐                          ┌──────────────────┐
│   QuizPage.jsx   │                          │CodingChallenge   │
│                  │                          │  Page.jsx        │
├──────────────────┤                          ├──────────────────┤
│ Event Listeners: │                          │ Event Listeners: │
│ • visibilitychange│                         │ • visibilitychange│
│ • contextmenu    │                          │ • copy           │
│ • keydown        │                          │ • paste          │
│ • blur/focus     │                          │ • blur           │
│ • fullscreenchange│                         └────────┬─────────┘
└────────┬─────────┘                                   │
         │                                             │
         └─────────────────┬───────────────────────────┘
                           │
                    addViolation(type)
                           │
                ┌──────────┴─────────┐
                │                    │
         Check Conditions:           │
         ├─ Quiz/Coding Started?     │
         ├─ At MAX_VIOLATIONS?       │
         └─ Anti-Cheat Enabled?      │
                │                    │
                ▼                    │
         Create Violation            │
         Object:                     │
         {                           │
           type,                     │
           timestamp,                │
           id                        │
         }                           │
                │                    │
                ├─ Update Local      │
                │  State (UI)        │
                │                    │
                └─ Send to Backend ──┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │   FastAPI Backend                │
        │   POST /anti-cheat/report        │
        └──────────┬───────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │   AntiCheatService               │
        │   report_violation()             │
        └──────────┬───────────────────────┘
                   │
        ┌──────────┴────────────────────┐
        │                               │
        ▼                               ▼
┌────────────────┐            ┌──────────────────┐
│AssessmentRepo  │            │  Get Violation   │
│record_violation│            │  Count           │
└───────┬────────┘            └────────┬─────────┘
        │                              │
        ▼                              ▼
┌─────────────────────────┐   Check Thresholds:
│ anti_cheat_events       │   ├─ 3 violations → 15min
│ collection              │   ├─ 5 violations → 30min
│                         │   └─ 7+ violations → 60min
│ Document (Violation):   │            │
│ {                       │            ▼
│   id: UUID,             │   ┌─────────────────┐
│   user_id,              │   │  Create Block   │
│   course_id,            │   │  (if threshold  │
│   assessment_type,      │   │   reached)      │
│   event_type: "violation"│  └────────┬────────┘
│   violation_type,       │            │
│   timestamp             │            ▼
│ }                       │   ┌─────────────────────────┐
└─────────────────────────┘   │ anti_cheat_events       │
                              │ collection              │
                              │                         │
                              │ Document (Block):       │
                              │ {                       │
                              │   id: composite_key,    │
                              │   user_id,              │
                              │   course_id,            │
                              │   assessment_type,      │
                              │   event_type: "block",  │
                              │   violation_count,      │
                              │   block_end_time,       │
                              │   is_active: true       │
                              │ }                       │
                              └────────┬────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  Return Status  │
                              │  to Frontend    │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  Frontend UI    │
                              ├─────────────────┤
                              │ if blocked:     │
                              │ ├─ Show timer   │
                              │ ├─ Disable submit│
                              │ └─ Show violations│
                              │                 │
                              │ if not blocked: │
                              │ ├─ Show warning │
                              │ └─ Allow continue│
                              └─────────────────┘


═══════════════════════════════════════════════════════════════════════
                        VIOLATION FLOW SEQUENCE
═══════════════════════════════════════════════════════════════════════

  User starts quiz/coding
         │
         ▼
  ┌─────────────────┐
  │ Anti-Cheat      │
  │ Listeners       │
  │ Activated       │
  └────────┬────────┘
           │
    ┌──────┴────────────────────────────┐
    │                                   │
    ▼                                   ▼
Violation 1:                    Violation 2:
Tab Switch                      Copy Attempt
    │                                   │
    ├─ addViolation()                   ├─ addViolation()
    ├─ Local: violations = [V1]         ├─ Local: violations = [V1, V2]
    ├─ Backend: Save to Firestore       ├─ Backend: Save to Firestore
    └─ UI: Show warning (1/3)           └─ UI: Show warning (2/3)
                                               │
                                               ▼
                                        Violation 3:
                                        Right-click
                                               │
                                        ┌──────┴─────────┐
                                        │                │
                                 addViolation()          │
                                        │                │
                                 Check: count >= 3?      │
                                        │                │
                                        ▼                │
                                    ┌──YES               │
                                    │                    │
                                    ▼                    │
                            blockQuizAccess()            │
                            ├─ Set blocked = true        │
                            ├─ blockEndTime = now + 15min│
                            ├─ Disable submit button     │
                            └─ Show block UI             │
                                    │                    │
                                    │                    │
                        Backend: create_block()          │
                        ├─ Save block record             │
                        ├─ block_end_time = T + 15min    │
                        └─ is_active = true              │
                                    │                    │
                                    │                    │
                            ┌───────┴────────┐           │
                            │                │           │
                         Timer Loop          │           │
                      (every 1 second)       │           │
                            │                │           │
                            ▼                │           │
                    remaining = end - now    │           │
                            │                │           │
                    if remaining <= 0:       │           │
                    ├─ blocked = false       │           │
                    ├─ violations = []       │           │
                    ├─ POST /clear           │           │
                    └─ Allow retry           │           │
                            │                │           │
                            └────────────────┴───────────┘
                                      │
                                      ▼
                              User can retry quiz/coding


═══════════════════════════════════════════════════════════════════════
                          BLOCK EXPIRATION FLOW
═══════════════════════════════════════════════════════════════════════

  Block Created (block_end_time = T + 15min)
         │
         ▼
  ┌─────────────────────────────────────┐
  │ Frontend Countdown Timer            │
  │ useEffect([blockEndTime])           │
  │                                     │
  │ setInterval(() => {                 │
  │   remaining = blockEndTime - now    │
  │   setTimeRemaining(remaining)       │
  │                                     │
  │   if (remaining <= 0) {             │
  │     ├─ Set blocked = false          │
  │     ├─ Clear violations             │
  │     └─ POST /anti-cheat/clear       │
  │   }                                 │
  │ }, 1000)                            │
  └──────────────┬──────────────────────┘
                 │
                 ▼ (after 15 minutes)
  ┌─────────────────────────────────────┐
  │ POST /anti-cheat/clear              │
  │ Query: user_id, course_id, type     │
  └──────────────┬──────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────────────┐
  │ Backend: clear_violations_and_block │
  │                                     │
  │ 1. Delete all violation events      │
  │    (event_type = "violation")       │
  │                                     │
  │ 2. Delete block event               │
  │    (composite key)                  │
  │                                     │
  │ 3. Return: {                        │
  │      violations_cleared: 3,         │
  │      block_cleared: true            │
  │    }                                │
  └──────────────┬──────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────────────┐
  │ Frontend State Update               │
  │ ├─ violations = []                  │
  │ ├─ blocked = false                  │
  │ ├─ blockEndTime = null              │
  │ └─ Allow quiz/coding retry          │
  └─────────────────────────────────────┘
         │
         ▼
  User can start new attempt
  (fresh violation tracking)
```

---

*This anti-cheat system provides robust academic integrity monitoring while maintaining clear constraints and user-friendly violation management.*