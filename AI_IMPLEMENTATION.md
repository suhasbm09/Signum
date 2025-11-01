# AI Implementation Documentation

## Overview

Signum integrates **Google Gemini 2.5 Flash** as an AI-powered learning assistant with context-aware tutoring capabilities. The system implements **Retrieval-Augmented Generation (RAG)** to provide accurate, course-specific responses by combining real-time course content with generative AI.

**AI Model:** Google Gemini 2.5 Flash  
**Architecture:** Three-pipeline system (Q&A, Code Evaluation, Anti-Cheat placeholder)  
**Context Awareness:** Screen content + course material + conversation history  
**Integration:** FastAPI backend with React frontend  

---

## System Components

### Backend Components

**1. AI Service** (`app/services/ai/ai_service.py`)
- Main AI orchestration service
- Three independent pipelines
- Gemini API integration
- Response formatting and error handling

**2. Course Content Store** (`app/services/ai/course_content_store.py`)
- In-memory course content storage
- Keyword-based content retrieval (RAG foundation)
- Topic-to-content mapping
- Dynamic content addition support

**3. AI Routes** (`app/domains/ai/routes.py`)
- `/ai/chat` - Send messages with context
- `/ai/status` - Check AI service availability

### Frontend Components

**1. AIChat Component** (`components/AI/AIChat.jsx`)
- Chat interface with markdown rendering
- Voice input support (Speech Recognition API)
- Message history display
- Context-aware messaging

**2. AIAssistant Component** (`components/AI/AIAssistant.jsx`)
- Floating chat widget
- Minimizable interface
- Global accessibility across all pages

**3. AIContext** (`contexts/AIContext.jsx`)
- Centralized AI state management
- Conversation history tracking
- Context switching
- API communication layer

---

## Three AI Pipelines

### Pipeline 1: Q&A with RAG (Active)

**Purpose:** Context-aware tutoring and question answering

**Features:**
- Course content retrieval based on user query
- Screen content awareness (Copilot-style)
- Conversation history maintenance
- Formatted responses (bullets, code blocks, emojis)

**Input:**
```javascript
{
  message: "How does binary search work?",
  context: "Data Structures - Arrays",
  screen_content: "Current page text...",
  conversation_history: [...]
}
```

**Output:**
```javascript
{
  success: true,
  response: "Binary search is an efficient O(log n) algorithm...",
  context: "Data Structures - Arrays",
  model: "gemini-2.5-flash"
}
```

### Pipeline 2: Code Evaluation (Active)

**Purpose:** Analyze time/space complexity of coding solutions

**Features:**
- Complexity detection using AI analysis
- Expected vs actual complexity comparison
- Scoring (0-100) based on efficiency
- Optimization suggestions

**Input:**
```javascript
{
  code: "def binary_search(arr, target): ...",
  language: "python",
  problem_id: "binary-search",
  expected_complexity: {
    time: "O(log n)",
    space: "O(1)"
  }
}
```

**Output:**
```javascript
{
  success: true,
  detected_time_complexity: "O(log n)",
  detected_space_complexity: "O(1)",
  matches_expected: true,
  score: 95,
  explanation: "Efficient binary search implementation",
  suggestions: []
}
```

### Pipeline 3: Anti-Cheat (Placeholder)

**Purpose:** Video/audio proctoring analysis (future implementation)

**Status:** Not implemented (returns placeholder response)

---

## RAG Implementation

### What is RAG?

**Retrieval-Augmented Generation** combines:
1. **Retrieval** - Fetch relevant course content from knowledge base
2. **Augmentation** - Add retrieved content to AI prompt
3. **Generation** - AI generates response using both query and retrieved content

**Benefits:**
- Accurate answers based on actual course material
- Reduces AI hallucinations
- Course-specific responses
- Up-to-date information without model retraining

### Current Implementation

**Content Storage:**
```python
courses = {
  "Data Structures": {
    "Arrays": "Arrays are linear data structures...",
    "Stacks": "Stack is LIFO data structure...",
    "Queues": "Queue is FIFO data structure...",
    ...
  }
}
```

**Retrieval Strategy:**
- **Keyword-based search** - Match query terms with topic names and content
- **Context filtering** - Prioritize current course/topic
- **Limited results** - Return top 2 most relevant topics
- **Fallback** - Search all courses if no context match

**Retrieval Logic:**
```python
def get_relevant_content(query, context):
  1. Extract keywords from user query
  2. Check current course context (e.g., "Data Structures")
  3. Search topics in context course first
  4. Match keywords in topic names and content
  5. Return top 2 relevant content blocks
  6. If nothing found, search all courses
```

**Prompt Augmentation:**
```python
system_prompt = base_prompt + context + screen_content
if course_content:
  system_prompt += "Relevant Course Material:\n{content}"
full_prompt = system_prompt + conversation_history + user_message
```

---

## Response Formatting

### System Prompt Guidelines

AI responses follow a **strict format** to ensure readability:

**Rules:**
- ❌ No long paragraphs (max 2 sentences in a row)
- ❌ No walls of text
- ✅ Use bullets, numbered lists, code blocks
- ✅ Each point: 1-2 lines maximum
- ✅ Conversational and friendly tone
- ✅ Use emojis for visual breaks (📌 💡 ⚠️)

**Structure:**
```
1. One short sentence answer (max 15 words)

**Key Points:**
• Bullet 1
• Bullet 2

**Quick Example:**
```code```

**Why It Matters:**
One sentence explanation

**Try This:** [Question to check understanding]
```

---

## Context Awareness

### Three Layers of Context

**1. Course Context**
- Current course ID (e.g., "data-structures")
- Specific topic being studied (e.g., "Arrays")
- Passed from frontend via `context` parameter

**2. Screen Content**
- Text visible on user's current page
- Captured via `document.innerText` (first 6000 chars)
- Enables Copilot-style awareness of what user is viewing

**3. Conversation History**
- Last 3 messages stored in memory
- Maintains dialogue continuity
- Prevents repetitive responses

### Context Flow

```
User on "Data Structures - Arrays" page
  ↓
Frontend captures:
  - context: "Data Structures - Arrays"
  - screen_content: "Binary search is an algorithm..."
  - conversation_history: ["What is binary search?", ...]
  ↓
Backend retrieves:
  - Course content for "Arrays" topic
  ↓
AI receives full context:
  - User query
  - Course material (RAG)
  - Screen content
  - Previous conversation
  ↓
Generates context-aware response
```

---

## API Specification

### POST /ai/chat

**Request:**
```json
{
  "message": "Explain time complexity",
  "context": "Data Structures - Arrays",
  "screen_content": "Binary search divides the array...",
  "conversation_history": [
    {
      "role": "user",
      "content": "What is binary search?"
    },
    {
      "role": "assistant",
      "content": "Binary search is..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "Time complexity measures...\n\n**Key Points:**\n• O(1) - constant...",
  "context": "Data Structures - Arrays",
  "model": "gemini-2.5-flash"
}
```

**Error Response:**
```json
{
  "success": false,
  "response": "Sorry, I encountered an error. Please try again.",
  "error": "API key invalid"
}
```

### GET /ai/status

**Response:**
```json
{
  "status": "operational",
  "model": "gemini-2.5-flash",
  "features": ["chat", "code-evaluation", "anti-cheat"]
}
```

---

## Frontend Integration

### AIContext Provider

**State Management:**
```javascript
const AIContext = createContext({
  chat: async (message, context) => {...},
  conversationHistory: [],
  isLoading: false,
  clearHistory: () => {...},
  setContext: (ctx) => {...}
});
```

**Usage:**
```javascript
const { chat, conversationHistory } = useAI();

await chat("What is a stack?", "Data Structures");
```

### Voice Input Support

**Feature:** Speech-to-text for hands-free interaction

**Implementation:**
- Web Speech Recognition API
- `SpeechRecognition` or `webkitSpeechRecognition`
- English language (`en-US`)
- Single utterance mode

**User Flow:**
```
User clicks microphone button
  ↓
recognitionRef.start()
  ↓
User speaks: "What is binary search?"
  ↓
onresult event fires
  ↓
Transcript → input field
  ↓
Auto-submit or manual send
```

---

## Feature Flags

**Configuration:** `frontend/src/config/features.js`

```javascript
AI_ENABLED: true              // Enable/disable AI globally
AI_TESTING_MODE: false        // Show "Testing Mode" banner
VOICE_INPUT_ENABLED: true     // Enable voice input
```

**Testing Mode:**
- Displays banner: "AI Assistant - Testing Mode"
- Same functionality as production
- Used for development/QA

---

## Environment Variables

**Backend (.env):**
```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

**Frontend (Vite):**
```bash
VITE_BACKEND_URL=http://localhost:8000
```

---

## Visual Diagrams

### Diagram 1: AI System Connection

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AI SYSTEM ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────┘

                      ┌──────────────────┐
                      │   React Frontend │
                      └────────┬─────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
        ┌──────────────┐            ┌──────────────────┐
        │  AIAssistant │            │    AIChat.jsx    │
        │  (Widget)    │            │  (Interface)     │
        └──────┬───────┘            └────────┬─────────┘
               │                             │
               └──────────┬──────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │   AIContext     │
                 │  (State Mgmt)   │
                 └────────┬────────┘
                          │
                   Captures context:
                   ├─ Current course/topic
                   ├─ Screen content (6000 chars)
                   └─ Conversation history (last 3)
                          │
                          │ POST /ai/chat
                          │ {message, context, screen_content, history}
                          ▼
              ┌───────────────────────────┐
              │   FastAPI Backend         │
              │   /ai/chat                │
              └───────────┬───────────────┘
                          │
                          ▼
              ┌───────────────────────────┐
              │   AIService               │
              │   ai_service.chat()       │
              └───────────┬───────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│ CourseContentStore│             │  Build Prompt    │
│ (RAG Retrieval)  │              │  - System prompt │
└────────┬─────────┘              │  - Course content│
         │                        │  - Screen content│
         │                        │  - History       │
  get_relevant_content()          │  - User message  │
         │                        └────────┬─────────┘
         │                                 │
  Extract keywords                         │
  Match with course topics                 │
  Return top 2 relevant blocks             │
         │                                 │
         └─────────────┬───────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  Google Gemini API   │
            │  gemini-2.5-flash    │
            └──────────┬───────────┘
                       │
                       │ AI generates response
                       │ (formatted: bullets, code, emojis)
                       │
                       ▼
            ┌──────────────────────┐
            │  Response            │
            │  {                   │
            │    success: true,    │
            │    response: "...",  │
            │    context: "...",   │
            │    model: "..."      │
            │  }                   │
            └──────────┬───────────┘
                       │
                       │ Return to frontend
                       ▼
            ┌──────────────────────┐
            │  AIChat displays     │
            │  - Markdown rendering│
            │  - Code highlighting │
            │  - Message history   │
            └──────────────────────┘


═══════════════════════════════════════════════════════════════════════
                      DATA FLOW EXAMPLE
═══════════════════════════════════════════════════════════════════════

User on Arrays page types: "What is binary search?"
         │
         ▼
AIChat captures:
  ├─ message: "What is binary search?"
  ├─ context: "Data Structures - Arrays"
  ├─ screen_content: "Binary search is an efficient algorithm..."
  └─ conversation_history: []
         │
         │ POST /ai/chat
         ▼
AIService receives request
         │
         ├─── RAG Retrieval ────────────────────┐
         │                                      │
         │   CourseContentStore                 │
         │   .get_relevant_content()            │
         │                                      │
         │   Keywords: ["binary", "search"]     │
         │   Context: "Data Structures - Arrays"│
         │                                      │
         │   Matches:                           │
         │   ✅ Topic: "Arrays"                 │
         │   ✅ Content: "...binary search..."  │
         │                                      │
         │   Returns:                           │
         │   "**Arrays:**                       │
         │    Binary search is O(log n)..."     │
         │                                      │
         └──────────────┬───────────────────────┘
                        │
                        ▼
         Build Full Prompt:
         ┌─────────────────────────────────────┐
         │ System: "You are an AI tutor..."    │
         │                                     │
         │ Context: "Data Structures - Arrays" │
         │                                     │
         │ Screen: "Binary search divides..."  │
         │                                     │
         │ Course Material:                    │
         │ "**Arrays:** Binary search is..."   │
         │                                     │
         │ User: "What is binary search?"      │
         └─────────────┬───────────────────────┘
                       │
                       │ Send to Gemini API
                       ▼
         ┌─────────────────────────────────────┐
         │ Gemini 2.5 Flash generates:        │
         │                                     │
         │ "Binary search finds elements       │
         │  in sorted arrays efficiently.      │
         │                                     │
         │ **Key Points:**                     │
         │ • O(log n) time complexity          │
         │ • Requires sorted array             │
         │ • Divides search space in half      │
         │                                     │
         │ **Quick Example:**                  │
         │ ```python                           │
         │ def binary_search(arr, target):     │
         │   left, right = 0, len(arr)-1       │
         │   while left <= right:              │
         │     mid = (left + right) // 2       │
         │     if arr[mid] == target:          │
         │       return mid                    │
         │     elif arr[mid] < target:         │
         │       left = mid + 1                │
         │     else:                           │
         │       right = mid - 1               │
         │   return -1                         │
         │ ```                                 │
         │                                     │
         │ **Try This:** What's the complexity │
         │ if the array isn't sorted?"         │
         └─────────────┬───────────────────────┘
                       │
                       │ Return response
                       ▼
         AIChat renders with:
         ├─ Markdown formatting (ReactMarkdown)
         ├─ Code syntax highlighting
         ├─ Bullet points
         └─ Add to conversation history
```

---

### Diagram 2: RAG (Retrieval-Augmented Generation) Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│              RAG: RETRIEVAL-AUGMENTED GENERATION                    │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ STEP 1: USER QUERY                                                 │
└────────────────────────────────────────────────────────────────────┘

        User asks: "Explain time complexity of quicksort"
                           │
                           ▼
                ┌──────────────────────┐
                │  Frontend captures:  │
                │  - Query             │
                │  - Context           │
                │  - Screen content    │
                └──────────┬───────────┘
                           │
                           ▼

┌────────────────────────────────────────────────────────────────────┐
│ STEP 2: RETRIEVAL (Find Relevant Course Content)                  │
└────────────────────────────────────────────────────────────────────┘

                ┌──────────────────────────────┐
                │  CourseContentStore          │
                │  get_relevant_content()      │
                └──────────┬───────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌──────────────────┐              ┌──────────────────┐
│ Keyword Extract  │              │ Context Filter   │
├──────────────────┤              ├──────────────────┤
│ "quicksort"      │              │ Course:          │
│ "time"           │              │ "Data Structures"│
│ "complexity"     │              │                  │
└────────┬─────────┘              └────────┬─────────┘
         │                                 │
         └─────────────┬───────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │  Search Course Topics            │
        │                                  │
        │  Match keywords in:              │
        │  ├─ Topic names                  │
        │  └─ Topic content                │
        └──────────┬───────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │  Matches Found:                  │
        │                                  │
        │  ✅ "Arrays" topic               │
        │     Contains: "quicksort O(n²)"  │
        │                                  │
        │  ✅ "Sorting Algorithms"         │
        │     Contains: "quicksort..."     │
        └──────────┬───────────────────────┘
                   │
                   │ Return top 2
                   ▼
        ┌──────────────────────────────────┐
        │  Retrieved Content:              │
        │                                  │
        │  "**Arrays:**                    │
        │   Quicksort is a divide-and-     │
        │   conquer algorithm with         │
        │   O(n log n) average time        │
        │   complexity and O(n²) worst     │
        │   case."                         │
        │                                  │
        │  "**Sorting Algorithms:**        │
        │   Quicksort uses pivot-based     │
        │   partitioning..."               │
        └──────────┬───────────────────────┘
                   │
                   ▼

┌────────────────────────────────────────────────────────────────────┐
│ STEP 3: AUGMENTATION (Add Retrieved Content to Prompt)            │
└────────────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────┐
        │  Build Enhanced Prompt:          │
        │                                  │
        │  ┌────────────────────────────┐  │
        │  │ System Prompt:             │  │
        │  │ "You are an AI tutor..."   │  │
        │  └────────────────────────────┘  │
        │             +                    │
        │  ┌────────────────────────────┐  │
        │  │ Context:                   │  │
        │  │ "Data Structures - Arrays" │  │
        │  └────────────────────────────┘  │
        │             +                    │
        │  ┌────────────────────────────┐  │
        │  │ Screen Content:            │  │
        │  │ "Sorting algorithms..."    │  │
        │  └────────────────────────────┘  │
        │             +                    │
        │  ┌────────────────────────────┐  │
        │  │ ⭐ Retrieved Course        │  │
        │  │    Material (RAG):         │  │
        │  │                            │  │
        │  │ "**Arrays:**               │  │
        │  │  Quicksort is O(n log n)...│  │
        │  │                            │  │
        │  │ **Sorting Algorithms:**    │  │
        │  │  Quicksort uses pivot..."  │  │
        │  └────────────────────────────┘  │
        │             +                    │
        │  ┌────────────────────────────┐  │
        │  │ User Query:                │  │
        │  │ "Explain time complexity   │  │
        │  │  of quicksort"             │  │
        │  └────────────────────────────┘  │
        └──────────┬───────────────────────┘
                   │
                   ▼

┌────────────────────────────────────────────────────────────────────┐
│ STEP 4: GENERATION (AI Creates Response)                          │
└────────────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────┐
        │  Send to Gemini 2.5 Flash:       │
        │  - Enhanced prompt with RAG      │
        │  - Course content included       │
        └──────────┬───────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │  AI Processing:                  │
        │                                  │
        │  1. Reads user query             │
        │  2. Sees retrieved course content│
        │  3. Combines knowledge with      │
        │     course material              │
        │  4. Generates accurate response  │
        └──────────┬───────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────────┐
        │  Generated Response:                     │
        │                                          │
        │  "Quicksort's time complexity varies:    │
        │                                          │
        │  **Key Points:**                         │
        │  • Average: O(n log n) - most cases      │
        │  • Worst: O(n²) - already sorted         │
        │  • Best: O(n log n) - random pivot       │
        │                                          │
        │  **Why?**                                │
        │  Divide-and-conquer splits array in half │
        │  recursively, leading to log n levels.   │
        │                                          │
        │  **Quick Example:**                      │
        │  ```                                     │
        │  [3,1,4,1,5] → pivot=3                   │
        │  [1,1] | 3 | [4,5]                       │
        │  Each partition takes O(n)               │
        │  ```                                     │
        │                                          │
        │  **Try This:** What pivot choice         │
        │  avoids worst case?"                     │
        └──────────┬───────────────────────────────┘
                   │
                   ▼

┌────────────────────────────────────────────────────────────────────┐
│ STEP 5: DISPLAY (Show to User)                                    │
└────────────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────┐
        │  Frontend Rendering:             │
        │  - ReactMarkdown formatting      │
        │  - Syntax highlighting           │
        │  - Add to conversation history   │
        └──────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                       RAG BENEFITS
═══════════════════════════════════════════════════════════════════════

┌────────────────────┐          ┌────────────────────┐
│ Without RAG        │          │ With RAG           │
├────────────────────┤          ├────────────────────┤
│ • Generic answers  │          │ • Course-specific  │
│ • May hallucinate  │          │ • Accurate content │
│ • No course link   │    VS    │ • Verified info    │
│ • Outdated info    │          │ • Context-aware    │
└────────────────────┘          └────────────────────┘

Example:
  User: "What is quicksort complexity?"
  
  ❌ Without RAG: "Quicksort is O(n log n) [generic answer]"
  
  ✅ With RAG: "According to the Arrays module in this course,
                quicksort has O(n log n) average complexity
                and O(n²) worst case when... [course-specific]"


═══════════════════════════════════════════════════════════════════════
                     CURRENT VS FUTURE RAG
═══════════════════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────────────────────┐
│ CURRENT: Keyword-Based Retrieval                                  │
├────────────────────────────────────────────────────────────────────┤
│ • In-memory Python dictionary                                      │
│ • Simple keyword matching                                          │
│ • Fast but limited accuracy                                        │
│ • Works for small course catalogs                                  │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ FUTURE: Vector-Based Retrieval (ChromaDB/Pinecone)                │
├────────────────────────────────────────────────────────────────────┤
│ • Semantic similarity search                                       │
│ • Understands meaning, not just keywords                           │
│ • Better accuracy for complex queries                              │
│ • Scales to large course libraries                                 │
└────────────────────────────────────────────────────────────────────┘
```

---

*This AI implementation provides intelligent, context-aware tutoring using Retrieval-Augmented Generation to ensure accurate, course-specific responses.*