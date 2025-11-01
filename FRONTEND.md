# FRONTEND DOCUMENTATION

## Overview

The Signum frontend is a modern single-page application built with React 19, designed to deliver an interactive learning platform for data structures and blockchain courses. The architecture emphasizes real-time state synchronization, client-side routing without external routing libraries, and modular component design. The application integrates Firebase Authentication for user management, Solana Web3.js for blockchain interactions, and a custom AI assistant powered by Gemini 2.5 Flash.

The frontend operates as a thin client that communicates with the backend through a RESTful API layer, using React Context for global state management and sessionStorage for state persistence across page reloads. The application supports feature flags for production control, enabling or disabling AI assistance, anti-cheat systems, blockchain certificates, and voice input capabilities.

## Technology Stack

**Core Framework:**
- React 19.1.1 (concurrent rendering, automatic batching)
- Vite 7.1.2 (build tool with HMR)
- Tailwind CSS 4.1.11 (utility-first styling)

**State Management:**
- React Context API (ProgressContext, AIContext)
- sessionStorage for persistence
- No Redux or external state libraries

**Authentication:**
- Firebase Auth 12.2.1 (Google OAuth)
- Firebase Firestore (progress synchronization)
- HTTP-only cookies for backend sessions

**Blockchain:**
- @solana/web3.js 1.98.4 (Solana blockchain interactions)
- @coral-xyz/anchor 0.32.1 (Anchor program client)
- Phantom wallet integration

**Code & Content:**
- Monaco Editor 4.7.0 (code editing with syntax highlighting)
- React Markdown 10.1.0 (course content rendering)
- highlight.js 11.11.2 (syntax highlighting)
- KaTeX 0.16.17 (mathematical notation)

**UI Components:**
- Lucide React 0.547.0 (icon library)
- Custom components (no external UI library)

## Application Architecture

### Entry Point

**main.jsx**: Renders the application root with React 19 StrictMode, mounts to `#root` element.

**App.jsx**: Main application container managing:
- Authentication state (Firebase auth listener)
- Global navigation state (currentPage, selectedCourse, selectedTopic)
- Session persistence (loads/saves state to sessionStorage)
- Provider composition (AIProvider → ProgressProvider → application)
- Client-side routing logic

### Routing System

The application uses a **custom client-side routing system** without React Router. Navigation is managed through state variables:

**State-Based Routing:**
```javascript
currentPage: 'dashboard' | 'course' | 'quiz' | 'coding-challenge' | 'profile' | 'about' | 'login'
selectedCourse: 'data-structures' | 'solana-blockchain' | null
selectedTopic: string | null
```

**Navigation Flow:**
1. User clicks navigation element (e.g., course card, header link)
2. Parent component calls `onNavigate()` or `navigateTo()`
3. App.jsx updates state variables
4. React re-renders with new page component
5. State saved to sessionStorage for persistence
6. Browser history API updates URL (history.pushState)

**Session Persistence:**
- On load: Check sessionStorage for saved state
- On navigation: Save state to sessionStorage
- On reload: Restore state from sessionStorage
- Session cleared on logout

### Page Components

**1. Login Page (Login.jsx)**
- Google OAuth authentication via Firebase
- Animated feature showcase (typewriter effect)
- Backend token verification on successful login
- Responsive design with logo and feature highlights

**2. Dashboard (Dashboard.jsx)**
- Course catalog display (2 courses: Data Structures, Solana Blockchain)
- "Continue Learning" section for enrolled courses with progress
- "Available Courses" section for unenrolled courses
- Course enrollment flow
- Progress percentage and quiz scores per course

**3. Course Content (CourseContent.jsx)**
- Dynamic course outline rendering from courseRegistry
- Auto-hide header/footer on scroll (better reading experience)
- Progress bar showing completion percentage
- Module navigation with locked/unlocked indicators
- Content rendering: Markdown, visualizations, quiz, coding challenge, certification
- Module completion tracking integrated with ProgressContext

**4. Quiz Page (QuizPage.jsx)**
- Multi-choice question display
- Anti-cheat detection system (if enabled)
- Real-time answer selection and submission
- Score calculation and feedback
- Integration with backend quiz evaluation
- Retry logic based on course configuration

**5. Coding Challenge Page (CodingChallengePage.jsx)**
- Monaco Editor integration for code editing
- Language selection (Python, JavaScript, C++, Java)
- Code execution via backend sandbox
- Test case validation
- Submission with anti-cheat monitoring
- Real-time output display

**6. Profile Page (Profile.jsx)**
- User profile display and editing
- Phantom wallet connection
- Bio, interests, preferences management
- Enrolled courses list
- Account deletion option
- Backend synchronization for profile updates

**7. About Page (About.jsx)**
- Platform information and mission
- Feature highlights
- Contact information

### State Management

**ProgressContext (Global Progress State):**

Manages course progress, module completion, and quiz attempts across the application.

**State Structure:**
```javascript
{
  moduleProgress: {
    [courseId]: {
      [moduleId]: { completed: boolean, timestamp: Date }
    }
  },
  courseProgress: {
    [courseId]: {
      completedModules: string[],
      totalModules: number,
      lastAccessedModule: string,
      progress: number,
      quiz_score: number,
      coding_score: number,
      final_score: number
    }
  },
  quizAttempts: {
    [courseId]: number
  }
}
```

**Key Functions:**
- `loadProgressFromFirebase(courseId)`: Fetches progress from Firebase Firestore
- `syncCourseProgress(courseId, progressData)`: Syncs progress to backend and Firebase
- `markModuleComplete(courseId, moduleId)`: Marks module as complete, excludes quiz/certification
- `calculateProgressPercentage(courseId)`: Calculates percentage based on completed learning modules
- `getCourseProgress(courseId)`: Returns course-specific progress object

**Firebase Synchronization:**
- User identification: `window.currentUser.uid` from Firebase Auth
- Collection: `user_progress/{userId}/courses/{courseId}`
- Document structure: Matches courseProgress state
- Real-time updates on module completion

**AIContext (AI Assistant State):**

Manages AI chat functionality, conversation history, and feature flag integration.

**State Structure:**
```javascript
{
  conversationHistory: [
    { role: 'user' | 'model', parts: [{ text: string }] }
  ],
  isLoading: boolean,
  currentContext: { courseId, topicId, content } | null,
  aiEnabled: boolean,
  testingMode: boolean
}
```

**Key Functions:**
- `chat(userMessage)`: Sends message to AI backend, updates conversation history
- `clearHistory()`: Resets conversation (e.g., on topic change)
- `setContext(context)`: Sets current learning context for AI (course, topic)

**Feature Flag Integration:**
- Checks `isAIEnabled()` before rendering AI components
- Displays testing mode indicator when in development
- Disables chat functionality if feature flag is off

### Component Architecture

**Layout Components:**

**Layout.jsx**: Wrapper component providing consistent page structure
- Header (user info, navigation, logout)
- Main content area (children)
- Footer (copyright, links)

**Header.jsx**: Top navigation bar
- Logo and navigation links
- User profile display
- Logout functionality
- Active page highlighting

**Footer.jsx**: Bottom page footer
- Copyright information
- Social links (if applicable)

**Utility Components:**

**LoadingButton.jsx**: Button with loading state
- Prevents double-clicks during async operations
- Spinner animation during loading
- Disabled state management

**ProgressBar.jsx**: Visual progress indicator
- Percentage-based bar
- Animated fill transition
- Used in Dashboard and CourseContent

**Toast.jsx**: Notification system
- Success, error, info types
- Auto-dismiss after timeout
- Custom hook: `useToast()`

**EmptyState.jsx**: Placeholder for empty data
- Used when no courses enrolled
- Customizable message and icon

**SkeletonLoader.jsx**: Loading placeholder
- Shimmer animation
- Used during async data fetching

**CourseCard.jsx**: Course display card
- Course title, description, image
- Progress bar (if enrolled)
- Enrollment/continue button

**CompletionTracker.jsx**: Module completion checklist
- Visual checkmarks for completed modules
- Progress percentage
- Used in course content sidebar

**AI Components:**

**AIAssistant.jsx**: Floating AI button
- Bottom-right corner fixed position
- Green glow animation
- Testing mode indicator (yellow dot)
- Opens AIChat modal on click
- Hidden when AI feature is disabled

**AIChat.jsx**: AI chat interface
- Full-screen modal overlay
- Conversation history display
- Message input with send button
- Context-aware responses
- Clear history button
- Close button

**AIHelper.jsx**: Contextual AI integration
- Embedded AI assistance within course content
- Automatically sets context based on current topic

**Visualization Components:**

Seven interactive algorithm visualizations for data structures course:
- **Array1D.jsx**: 1D array visualization with index highlighting
- **Array2D.jsx**: 2D matrix visualization with row/column selection
- **StackVisualization.jsx**: Stack push/pop operations
- **QueueVisualization.jsx**: Queue enqueue/dequeue operations
- **SinglyLinkedList.jsx**: Singly linked list traversal and operations
- **DoublyLinkedList.jsx**: Doubly linked list bidirectional traversal
- **TreeVisualization.jsx**: Binary tree visualization with traversal algorithms

**Common Features:**
- Step-by-step execution with play/pause controls
- Pseudocode highlighting synchronized with visualization
- Auto-play mode with speed control
- Reset functionality
- Educational annotations

### Service Layer

**progressService.js**: Backend API integration for progress and assessments

**Endpoints:**
- `syncCourseProgress(courseId, progressData)`: POST to `/progress/{courseId}/sync`
- `getCourseProgress(courseId)`: GET from `/progress/{courseId}`
- `submitQuiz(courseId, quizId, answers)`: POST to `/assessment/{courseId}/quiz/{quizId}/submit`
- `submitCodingChallenge(courseId, challengeData)`: POST to `/assessment/{courseId}/coding/submit`
- `getNFTCertificate(courseId)`: GET from `/certification/{courseId}/status`

**Error Handling:**
- Try-catch blocks with console logging
- Graceful fallbacks (e.g., return null on error)
- User-facing error messages via Toast

**ai/aiService.js**: AI backend integration

**Endpoints:**
- `sendMessage(conversationHistory, context)`: POST to `/ai/chat`
- `getAIStatus()`: GET from `/ai/status`

**api.js**: Centralized API configuration

**Features:**
- Base URL configuration: `http://localhost:8000`
- Endpoint organization by domain (AUTH, PROGRESS, ASSESSMENT, CERTIFICATION, AI)
- Helper function: `buildUrl(endpoint, params)` for query parameter handling
- Typed endpoint structure for code clarity

**Firebase Integration:**

**config.js**: Firebase initialization and authentication

**Functions:**
- `signInWithGoogle()`: Google OAuth popup, Firebase token → backend verification
- `logOut()`: Firebase sign out + backend session termination

**Firestore Structure:**
```
user_progress/
  {userId}/
    courses/
      {courseId}/
        - completedModules: string[]
        - progress: number
        - quiz_score: number
        - coding_score: number
        - final_score: number
        - lastAccessedModule: string
```

### Feature Flag System

**features.js**: Production feature control

**Feature Flags:**
```javascript
AI_ENABLED: true | false                  // AI assistant availability
QUIZ_ANTI_CHEAT_ENABLED: true | false     // Anti-cheat during quizzes
BLOCKCHAIN_ENABLED: true | false          // NFT certificate minting
VOICE_INPUT_ENABLED: true | false         // Voice input for AI (future)
AI_TESTING_MODE: true | false             // Testing indicator for AI
QUIZ_TESTING_MODE: true | false           // Testing mode for quizzes
```

**Helper Functions:**
- `isAIEnabled()`: Returns AI_ENABLED flag
- `isQuizAntiCheatEnabled()`: Returns QUIZ_ANTI_CHEAT_ENABLED flag
- `isBlockchainEnabled()`: Returns BLOCKCHAIN_ENABLED flag
- `isVoiceInputEnabled()`: Returns VOICE_INPUT_ENABLED flag

**Usage:**
```javascript
import { isAIEnabled } from './config/features';

if (!isAIEnabled()) return null;  // Hide AI components
```

### Course Configuration System

**courseConfig.js**: Centralized course configuration

**Structure:**
```javascript
COURSE_CONFIGS: {
  'data-structures': {
    learningModules: [...],           // List of learning module IDs
    excludedModules: ['quiz', 'certification'],
    finalExam: {
      quiz: { weight: 0.5, id: 'quiz' },
      coding: { weight: 0.5, id: 'coding-challenge' }
    },
    certification: {
      requiredCompletion: 1.0,        // 100% module completion
      requiredFinalScore: 0.825       // 82.5% final exam score
    }
  }
}
```

**Helper Functions:**
- `getCourseConfig(courseId)`: Returns course configuration object
- `calculateProgressPercentage(courseId, completedModules)`: Calculates completion percentage
- `isFinalExamPassed(finalScore, courseId)`: Checks if final exam passed
- `canUnlockCertification(courseId, progressData)`: Checks certification eligibility

**Design Philosophy:**
- Scalable: Easy to add new courses
- Centralized: Single source of truth for course rules
- Typed: Clear structure for course requirements

### Build Configuration

**vite.config.js**: Vite build configuration

**Plugins:**
- `@vitejs/plugin-react`: React support with Fast Refresh
- `@tailwindcss/vite`: Tailwind CSS integration

**Optimizations:**
- Node globals polyfill for Solana Web3.js (Buffer)
- esbuild define: `global` → `globalThis`
- Resolve alias: `buffer` → npm buffer package

**Purpose:**
Solana Web3.js requires Node.js globals (Buffer) that are not available in browsers. The configuration polyfills these dependencies for client-side usage.

## System Constraints

**Browser Requirements:**
- Modern browsers supporting ES2020+ features
- JavaScript enabled
- LocalStorage and sessionStorage enabled
- Cookies enabled (for backend sessions)

**Network Dependencies:**
- Backend API must be running at `http://localhost:8000`
- Firebase Auth and Firestore services must be accessible
- Solana blockchain (devnet/mainnet) must be accessible
- Gemini AI API must be operational (for AI features)

**Authentication Constraints:**
- Google OAuth only (no email/password, GitHub, etc.)
- Session persists until logout or browser close
- Concurrent sessions across devices not supported
- Backend session timeout: 24 hours

**Progress Synchronization Constraints:**
- Firebase Firestore required for progress persistence
- Network errors may result in temporary desynchronization
- Manual refresh required after prolonged offline periods
- Progress saved only on explicit actions (module completion, quiz submission)

**Blockchain Constraints:**
- Phantom wallet required for certificate minting
- Solana devnet used for testing (not mainnet)
- Wallet connection popup blockers may interfere
- Gas fees (lamports) deducted from user wallet

**Performance Constraints:**
- Monaco Editor increases initial bundle size (~2MB)
- Large conversation histories may degrade AI chat performance
- Visualization animations may lag on low-end devices
- Course content Markdown parsing occurs on every render

**Content Constraints:**
- Course content hardcoded in frontend (not CMS)
- Adding new courses requires code changes
- Content updates require rebuild and deployment
- No dynamic content loading from backend

**State Management Constraints:**
- Context API causes entire subtree re-renders
- No state persistence across browser sessions (except sessionStorage)
- State cleared on logout
- No conflict resolution for concurrent state updates

**Routing Constraints:**
- No deep linking support (URLs not synced with routing state)
- Browser back/forward buttons do not navigate pages
- Bookmarking specific pages not supported
- No URL-based state sharing

**Feature Flag Constraints:**
- Feature flags hardcoded in `features.js`
- Require rebuild to change flags
- No user-specific feature flags
- No A/B testing support

## Visual Diagrams

### Application Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND APPLICATION                               │
│                          (React 19 Single Page App)                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                        ┌─────────────┴─────────────┐
                        │        main.jsx           │
                        │   (React 19 StrictMode)   │
                        └─────────────┬─────────────┘
                                      │
                        ┌─────────────▼─────────────┐
                        │         App.jsx           │
                        │  - Auth State Management  │
                        │  - Navigation State       │
                        │  - Session Persistence    │
                        │  - Provider Composition   │
                        └─────────────┬─────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
      ┌─────────▼──────────┐ ┌───────▼────────┐ ┌─────────▼──────────┐
      │   AIProvider       │ │ ProgressProvider│ │  Firebase Auth     │
      │  (AIContext.jsx)   │ │(ProgressContext) │ │   Listener         │
      │                    │ │                  │ │                    │
      │ - conversationHist │ │ - moduleProgress │ │ - onAuthChange     │
      │ - chat()           │ │ - courseProgress │ │ - signInWithGoogle │
      │ - clearHistory()   │ │ - quizAttempts   │ │ - logOut()         │
      │ - setContext()     │ │ - markModuleComp │ │                    │
      │ - aiEnabled flag   │ │ - syncProgress() │ │                    │
      └─────────┬──────────┘ └───────┬──────────┘ └─────────┬──────────┘
                │                    │                       │
                └────────────────────┼───────────────────────┘
                                     │
              ┌──────────────────────┴───────────────────────┐
              │            ROUTING LOGIC                     │
              │  (State-based: currentPage, selectedCourse)  │
              └──────────────────────┬───────────────────────┘
                                     │
          ┌──────────┬──────────┬────┴────┬──────────┬──────────┬─────────┐
          │          │          │         │          │          │         │
     ┌────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌──▼─────┐ ┌──▼──────┐ ┌▼────────┐ │
     │ Login  │ │Dashboard│ │ Course │ │  Quiz  │ │ Coding  │ │ Profile │ │
     │ Page   │ │  Page   │ │Content │ │  Page  │ │Challenge│ │  Page   │ │
     └────┬───┘ └───┬────┘ └───┬────┘ └──┬─────┘ └──┬──────┘ └┬────────┘ │
          │         │          │         │          │         │          │
          │    ┌────▼──────────▼─────────▼──────────▼─────────▼───┐      │
          │    │              Layout.jsx                           │      │
          │    │  ┌──────────────────────────────────────────┐    │      │
          │    │  │         Header.jsx (Navigation)          │    │      │
          │    │  └──────────────────────────────────────────┘    │      │
          │    │  ┌──────────────────────────────────────────┐    │      │
          │    │  │        Main Content (children)           │    │      │
          │    │  └──────────────────────────────────────────┘    │      │
          │    │  ┌──────────────────────────────────────────┐    │      │
          │    │  │         Footer.jsx (Copyright)           │    │      │
          │    │  └──────────────────────────────────────────┘    │      │
          │    └──────────────────────────────────────────────────┘      │
          │                                                               │
          └───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI ASSISTANT COMPONENTS                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │   AIAssistant.jsx       │
                        │  (Floating Button)      │
                        │  - Green glow animation │
                        │  - Testing mode dot     │
                        │  - Hidden if disabled   │
                        └────────────┬────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │     AIChat.jsx          │
                        │   (Modal Interface)     │
                        │  - Conversation display │
                        │  - Message input        │
                        │  - Clear history button │
                        └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    VISUALIZATION COMPONENTS (7 Total)                        │
└─────────────────────────────────────────────────────────────────────────────┘
      │
      ├── Array1D.jsx (1D array with index highlighting)
      ├── Array2D.jsx (2D matrix with row/column selection)
      ├── StackVisualization.jsx (Push/Pop operations)
      ├── QueueVisualization.jsx (Enqueue/Dequeue operations)
      ├── SinglyLinkedList.jsx (Singly linked list traversal)
      ├── DoublyLinkedList.jsx (Bidirectional traversal)
      └── TreeVisualization.jsx (Binary tree with traversal algorithms)

           Common Pattern: Step controls + Pseudocode + Animation

┌─────────────────────────────────────────────────────────────────────────────┐
│                          UTILITY COMPONENTS                                  │
└─────────────────────────────────────────────────────────────────────────────┘
      │
      ├── LoadingButton.jsx (async operation state)
      ├── ProgressBar.jsx (visual completion indicator)
      ├── Toast.jsx (notification system)
      ├── EmptyState.jsx (no-data placeholder)
      ├── SkeletonLoader.jsx (loading placeholder)
      ├── CourseCard.jsx (course display card)
      └── CompletionTracker.jsx (module checklist)

┌─────────────────────────────────────────────────────────────────────────────┐
│                      CONFIGURATION & FEATURE FLAGS                           │
└─────────────────────────────────────────────────────────────────────────────┘
      │
      ├── features.js (AI, anti-cheat, blockchain, voice flags)
      ├── courseConfig.js (course rules, final exam weights, certification)
      └── api.js (centralized endpoint definitions)
```

### State Management & Data Synchronization Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        USER AUTHENTICATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

    User Clicks "Sign in with Google"
              │
              ▼
    ┌─────────────────────────┐
    │  signInWithGoogle()     │
    │  (firebase/config.js)   │
    └──────────┬──────────────┘
               │
               ├──► Firebase Auth (Google OAuth Popup)
               │
               ▼
    ┌─────────────────────────┐
    │  Get Firebase ID Token  │
    └──────────┬──────────────┘
               │
               ▼    POST /auth/verify-firebase-token
    ┌─────────────────────────┐         {idToken}
    │   Backend Verification  │◄────────────────────────────
    │  - Verify token         │
    │  - Create/update user   │
    │  - Set HTTP-only cookie │
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │  Return user data       │
    │  + session cookie       │
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │  App.jsx updates state  │
    │  - setUser(userData)    │
    │  - window.currentUser   │
    │  - Save to sessionStorage│
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │  Navigate to Dashboard  │
    └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     PROGRESS TRACKING & SYNCHRONIZATION                      │
└─────────────────────────────────────────────────────────────────────────────┘

    User Completes Module
              │
              ▼
    ┌─────────────────────────────────┐
    │  markModuleComplete(courseId,   │
    │       moduleId)                 │
    │  (ProgressContext)              │
    └──────────┬──────────────────────┘
               │
               ├──► Update Local State (moduleProgress)
               │
               ├──► Calculate Progress Percentage
               │    (excludes quiz & certification modules)
               │
               ▼
    ┌─────────────────────────────────┐
    │  syncCourseProgress(courseId,   │
    │      progressData)              │
    └──────────┬──────────────────────┘
               │
               ├────────────────────────────────────────────┐
               │                                            │
               ▼                                            ▼
    ┌──────────────────────┐              ┌─────────────────────────┐
    │  Firebase Firestore  │              │   Backend API           │
    │                      │              │  POST /progress/{id}/sync│
    │  user_progress/      │              │                         │
    │    {userId}/         │              │  - Save to PostgreSQL   │
    │      courses/        │              │  - Update user_progress │
    │        {courseId}    │              │  - Return confirmation  │
    │                      │              │                         │
    │  Document:           │              └─────────────────────────┘
    │  - completedModules  │
    │  - progress          │
    │  - quiz_score        │
    │  - coding_score      │
    │  - final_score       │
    └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          QUIZ SUBMISSION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

    User Submits Quiz Answers
              │
              ▼
    ┌─────────────────────────────────┐
    │  submitQuiz(courseId, quizId,   │
    │      answers)                   │
    │  (progressService.js)           │
    └──────────┬──────────────────────┘
               │
               ▼    POST /assessment/{courseId}/quiz/{quizId}/submit
    ┌─────────────────────────────────┐
    │   Backend Quiz Service          │
    │  - Validate answers             │
    │  - Calculate score              │
    │  - Check anti-cheat violations  │
    │  - Update quiz_attempts         │
    │  - Calculate final_score        │
    └──────────┬──────────────────────┘
               │
               ▼
    ┌─────────────────────────────────┐
    │  Return score & feedback        │
    │  {score, passed, feedback}      │
    └──────────┬──────────────────────┘
               │
               ▼
    ┌─────────────────────────────────┐
    │  Update ProgressContext         │
    │  - Update courseProgress        │
    │  - Update quiz_score            │
    │  - Increment quizAttempts       │
    │  - Recalculate final_score      │
    └──────────┬──────────────────────┘
               │
               ▼
    ┌─────────────────────────────────┐
    │  Sync to Firebase & Backend     │
    │  (same as module completion)    │
    └─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      CODING CHALLENGE SUBMISSION FLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

    User Submits Code
              │
              ▼
    ┌─────────────────────────────────┐
    │  submitCodingChallenge(courseId,│
    │      challengeData)             │
    │  (progressService.js)           │
    └──────────┬──────────────────────┘
               │
               ▼    POST /assessment/{courseId}/coding/submit
    ┌─────────────────────────────────┐
    │   Backend Coding Service        │
    │  - Run code in sandbox          │
    │  - Validate test cases          │
    │  - AI code evaluation           │
    │  - Check anti-cheat violations  │
    │  - Calculate coding_score       │
    │  - Calculate final_score        │
    └──────────┬──────────────────────┘
               │
               ▼
    ┌─────────────────────────────────┐
    │  Return results                 │
    │  {score, passed, testResults,   │
    │   aiEvaluation}                 │
    └──────────┬──────────────────────┘
               │
               ▼
    ┌─────────────────────────────────┐
    │  Update ProgressContext         │
    │  - Update courseProgress        │
    │  - Update coding_score          │
    │  - Recalculate final_score      │
    └──────────┬──────────────────────┘
               │
               ▼
    ┌─────────────────────────────────┐
    │  Sync to Firebase & Backend     │
    └─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          AI CHAT INTERACTION FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

    User Sends Message to AI
              │
              ▼
    ┌─────────────────────────────────┐
    │  Check isAIEnabled()            │
    │  (features.js)                  │
    └──────────┬──────────────────────┘
               │
               ├──► If disabled: Return null (no AI components)
               │
               ▼    If enabled
    ┌─────────────────────────────────┐
    │  chat(userMessage)              │
    │  (AIContext.jsx)                │
    └──────────┬──────────────────────┘
               │
               ├──► Add user message to conversationHistory
               │
               ├──► Set isLoading = true
               │
               ▼
    ┌─────────────────────────────────┐
    │  sendMessage(conversationHistory│
    │      , currentContext)          │
    │  (ai/aiService.js)              │
    └──────────┬──────────────────────┘
               │
               ▼    POST /ai/chat
    ┌─────────────────────────────────┐
    │   Backend AI Service            │
    │  - RAG: Retrieve course content │
    │  - Build context-aware prompt   │
    │  - Send to Gemini 2.5 Flash     │
    │  - Return AI response           │
    └──────────┬──────────────────────┘
               │
               ▼
    ┌─────────────────────────────────┐
    │  Add AI response to             │
    │  conversationHistory            │
    └──────────┬──────────────────────┘
               │
               ├──► Set isLoading = false
               │
               ▼
    ┌─────────────────────────────────┐
    │  AIChat.jsx renders updated     │
    │  conversation                   │
    └─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    CERTIFICATION UNLOCKING FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

    User Completes All Requirements
              │
              ▼
    ┌─────────────────────────────────┐
    │  canUnlockCertification()       │
    │  (courseConfig.js)              │
    │                                 │
    │  Check:                         │
    │  - 100% module completion       │
    │  - quiz_score ≥ 0 (submitted)   │
    │  - coding_score ≥ 0 (submitted) │
    │  - final_score ≥ 82.5%          │
    └──────────┬──────────────────────┘
               │
               ├──► If not passed: Show locked state
               │
               ▼    If passed
    ┌─────────────────────────────────┐
    │  Unlock Certification Module    │
    │  (CourseContent.jsx)            │
    └──────────┬──────────────────────┘
               │
               ▼    User Clicks "Mint Certificate"
    ┌─────────────────────────────────┐
    │  Check isBlockchainEnabled()    │
    │  (features.js)                  │
    └──────────┬──────────────────────┘
               │
               ├──► If disabled: Save to database only
               │
               ▼    If enabled
    ┌─────────────────────────────────┐
    │  Connect Phantom Wallet         │
    │  (window.solana.connect())      │
    └──────────┬──────────────────────┘
               │
               ▼
    ┌─────────────────────────────────┐
    │  POST /certification/{id}/mint  │
    │  {walletAddress}                │
    └──────────┬──────────────────────┘
               │
               ▼
    ┌─────────────────────────────────┐
    │   Backend Certification Service │
    │  - Generate certificate metadata│
    │  - Upload to IPFS               │
    │  - Mint NFT on Solana (PDA)     │
    │  - Save to database             │
    │  - Return NFT mint address      │
    └──────────┬──────────────────────┘
               │
               ▼
    ┌─────────────────────────────────┐
    │  Display Certificate            │
    │  - Download PDF option          │
    │  - View on Solana Explorer      │
    └─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    SESSION PERSISTENCE MECHANISM                             │
└─────────────────────────────────────────────────────────────────────────────┘

    Page Load
       │
       ▼
    ┌─────────────────────────────────┐
    │  App.jsx useEffect (mount)      │
    └──────────┬──────────────────────┘
               │
               ├──► Check sessionStorage for 'appState'
               │
               ▼    If exists
    ┌─────────────────────────────────┐
    │  Parse JSON                     │
    │  {user, currentPage,            │
    │   selectedCourse, selectedTopic}│
    └──────────┬──────────────────────┘
               │
               ├──► Restore state
               │
               ├──► Set window.currentUser = user
               │
               ├──► Firebase Auth listener verifies token
               │
               ▼
    ┌─────────────────────────────────┐
    │  Render last viewed page        │
    └─────────────────────────────────┘

    Navigation Event
       │
       ▼
    ┌─────────────────────────────────┐
    │  App.jsx updates state          │
    │  (currentPage, selectedCourse,  │
    │   selectedTopic)                │
    └──────────┬──────────────────────┘
               │
               ├──► Save to sessionStorage
               │    JSON.stringify(appState)
               │
               ├──► history.pushState() (browser history)
               │
               ▼
    ┌─────────────────────────────────┐
    │  React re-renders with new page │
    └─────────────────────────────────┘

    Logout Event
       │
       ▼
    ┌─────────────────────────────────┐
    │  logOut() (firebase/config.js)  │
    └──────────┬──────────────────────┘
               │
               ├──► Firebase signOut()
               │
               ├──► POST /auth/logout (clear cookie)
               │
               ├──► sessionStorage.clear()
               │
               ├──► window.currentUser = null
               │
               ▼
    ┌─────────────────────────────────┐
    │  Navigate to Login Page         │
    └─────────────────────────────────┘
```

---

**End of Frontend Documentation**
