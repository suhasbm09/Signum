# 🤖 Signum AI Integration - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features Implemented](#features-implemented)
4. [File Structure](#file-structure)
5. [Setup & Configuration](#setup--configuration)
6. [API Documentation](#api-documentation)
7. [Frontend Components](#frontend-components)
8. [Backend Services](#backend-services)
9. [Data Flow](#data-flow)
10. [Usage Examples](#usage-examples)

---

## 🎯 Overview

Signum's AI Assistant is a context-aware tutoring system powered by Google Gemini 2.5 Flash. It provides:
- **Real-time Q&A** with course-specific knowledge
- **Screen Content Awareness** - knows what page you're viewing (like MS Edge Copilot)
- **Voice Input** - speech-to-text for natural interaction
- **RAG Implementation** - retrieves relevant course content for accurate responses
- **Structured Responses** - bullet points and examples, not walls of text

### Key Design Principle
**SIMPLE & SCALABLE** - Built with clean architecture for easy expansion

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React 19)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Interface                                                   │
│  ├── AIAssistant.jsx (Floating square button - bright green)   │
│  └── AIChat.jsx (Modal with chat + voice input)                 │
│                                                                  │
│  State Management                                                 │
│  └── AIContext.jsx (Conversation history, loading states)       │
│                                                                  │
│  API Communication                                                │
│  └── aiService.js (HTTP calls + screen content capture)         │
│                                                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                     HTTP POST (JSON)
                  localhost:8000/ai/chat
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                     BACKEND (FastAPI)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  API Routes                                                       │
│  └── app/routes/ai.py (POST /ai/chat, GET /ai/status)          │
│                                                                  │
│  AI Services (3 Pipelines)                                       │
│  ├── ai_service.py                                              │
│  │   ├── chat() ✅ WORKING - Q&A with RAG                      │
│  │   ├── evaluate_answer() 🔜 Placeholder                      │
│  │   └── analyze_proctoring() 🔜 Placeholder                   │
│  │                                                                
│  └── course_content_store.py (RAG content storage)             │
│                                                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                    Google Gemini API
                  (gemini-2.5-flash)
                            │
                     ┌──────┴──────┐
                     │  Gemini 2.5 │
                     │   AI Model  │
                     └─────────────┘
```

---

## ✅ Features Implemented

### 1. **Context-Aware AI Assistant** ✅
- **Screen Content Capture**: Reads 6000 characters of visible page content
- **Page Context**: Knows if user is on Dashboard, Course page, or About page
- **Course Context**: Understands which course/topic user is currently studying
- **Like MS Edge Copilot**: Automatically sends screen content with every query

### 2. **RAG (Retrieval-Augmented Generation)** ✅
- **Simple Keyword-Based Search**: Fast and effective for current content
- **Course Content Store**: In-memory storage of Data Structures content
- **Context-Specific Answers**: AI retrieves relevant course material before responding
- **Upgradeable**: Ready for vector database (ChromaDB) when needed

### 3. **Voice Input (Speech-to-Text)** ✅
- **Web Speech API**: Built-in browser functionality (no external dependencies)
- **Microphone Button**: Green 🎤 icon in chat input
- **Visual Feedback**: Red pulsing animation when listening
- **Automatic Transcription**: Fills input field with spoken text

### 4. **Structured Response Format** ✅
- **NO PARAGRAPHS**: System prompt enforces bullet-point responses
- **Format Template**:
  - Quick answer sentence
  - **Key Points**: Bullet list
  - **Quick Example**: Code or real-world example
  - **Why It Matters**: Brief context
  - **Try This**: Follow-up question

### 5. **Markdown Rendering** ✅
- **react-markdown**: Renders formatted AI responses
- **remark-gfm**: GitHub Flavored Markdown support
- **Custom Styling**: Emerald/green theme-matched formatting
- **Code Blocks**: Syntax highlighting support

### 6. **User Experience Features** ✅
- **Toast Notifications**: Professional notifications (no more alerts)
- **Confirmation Modals**: Clear chat with user confirmation
- **Message History**: Persistent conversation in session
- **Loading States**: Animated indicators during AI processing
- **Auto-Scroll**: Chat scrolls to newest message

---

## 📁 File Structure

### Backend Structure
```
backend/
├── .env                                    # API keys and configuration
├── requirements.txt                        # Python dependencies
├── app/
│   ├── main.py                            # FastAPI app entry point
│   ├── routes/
│   │   └── ai.py                          # AI endpoints (chat, status)
│   └── services/
│       └── ai/
│           ├── ai_service.py              # Main AI service (3 pipelines)
│           └── course_content_store.py    # RAG content storage
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   └── AI/
│   │       ├── AIAssistant.jsx           # Floating button
│   │       └── AIChat.jsx                # Chat modal interface
│   ├── contexts/
│   │   └── AIContext.jsx                 # State management
│   ├── services/
│   │   └── ai/
│   │       └── aiService.js              # API communication
│   └── config/
│       └── features.js                   # AI feature flags
```

---

## ⚙️ Setup & Configuration

### Backend Setup

1. **Environment Variables** (`backend/.env`):
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

2. **Install Dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

**Key Dependencies**:
- `fastapi` - Web framework
- `google-generativeai` - Gemini AI SDK
- `langchain` - AI orchestration
- `langchain-google-genai` - Gemini integration for LangChain

3. **Run Backend**:
```bash
uvicorn app.main:app --reload
```

Backend runs on: `http://localhost:8000`

### Frontend Setup

1. **Install Dependencies**:
```bash
cd frontend
npm install
```

**Key Dependencies**:
- `react` 19.1.1 - UI framework
- `react-markdown` - Markdown rendering
- `remark-gfm` - GitHub Flavored Markdown

2. **Run Frontend**:
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 📡 API Documentation

### Endpoint: Chat with AI

**POST** `/ai/chat`

**Request Body**:
```json
{
  "message": "What are arrays in data structures?",
  "conversation_history": [
    {
      "role": "user",
      "content": "Previous question"
    },
    {
      "role": "assistant",
      "content": "Previous answer"
    }
  ],
  "context": "Data Structures Course - Arrays Section",
  "screen_content": "Arrays Overview\n\nArrays are contiguous memory locations..."
}
```

**Response**:
```json
{
  "success": true,
  "response": "**Arrays** are fundamental data structures! 🎯\n\n**Key Points:**\n• Contiguous memory blocks...",
  "context": "Data Structures Course - Arrays Section",
  "model": "gemini-2.5-flash"
}
```

### Endpoint: Check AI Status

**GET** `/ai/status`

**Response**:
```json
{
  "status": "operational",
  "model": "gemini-2.5-flash",
  "pipelines": ["chat", "evaluation (coming soon)", "anti-cheat (coming soon)"]
}
```

---

## 🎨 Frontend Components

### AIAssistant.jsx
**Purpose**: Floating button to open AI chat

**Features**:
- Square button with bright green gradient
- Double-layer glow effect for visibility
- Pulse animation on hover
- Tooltip on hover
- Conditional rendering (only shows when user logged in)

**Code Location**: `frontend/src/components/AI/AIAssistant.jsx`

### AIChat.jsx
**Purpose**: Main chat interface modal

**Features**:
- Full-screen modal overlay
- Message history display
- User messages (right-aligned, green bubble)
- AI messages (left-aligned, black bubble with markdown)
- Text input with send button
- Voice input button (microphone)
- Clear chat button with confirmation
- Auto-scroll to latest message
- Loading indicator (animated dots)

**Code Location**: `frontend/src/components/AI/AIChat.jsx`

### AIContext.jsx
**Purpose**: Global state management for AI features

**State**:
```javascript
{
  conversationHistory: [],  // Array of {role, content}
  isLoading: false,          // Loading state
  currentContext: null       // Current page context
}
```

**Code Location**: `frontend/src/contexts/AIContext.jsx`

---

## 🔧 Backend Services

### ai_service.py
**Main AI Service with 3 Pipelines**

#### Pipeline 1: chat() ✅ WORKING
```python
async def chat(
    message: str,
    conversation_history: List[Dict] = None,
    context: str = None,
    screen_content: str = None
) -> Dict
```

**What it does**:
1. Receives user message + context + screen content
2. Searches course content store for relevant material (RAG)
3. Builds system prompt with:
   - Response format instructions (bullets, not paragraphs)
   - Retrieved course content
   - Current screen content
   - Page context
4. Sends to Gemini API with conversation history
5. Returns formatted response

**Code Location**: `backend/app/services/ai/ai_service.py`

### course_content_store.py
**RAG Content Storage**

**Class**: `CourseContentStore`

**Methods**:
```python
add_course_content(course, topic, content, metadata)
get_relevant_content(query, course, max_results)
```

**Current Content**:
- Data Structures course content
- Topics: Overview, Arrays, Stacks, Queues, Trees, etc.
- Keyword-based search using simple string matching

**Code Location**: `backend/app/services/ai/course_content_store.py`

---

## 🔄 Data Flow

### Complete Chat Flow

```
1. USER TYPES MESSAGE
   ↓
2. FRONTEND (AIChat.jsx)
   - handleSendMessage() triggered
   - Adds user message to local state
   ↓
3. FRONTEND (AIContext.jsx)
   - chat() function called
   - Updates conversation history
   ↓
4. FRONTEND (aiService.js)
   - sendChatMessage() makes HTTP POST
   - getScreenContent() captures 6000 chars
   - Sends: message + history + context + screen_content
   ↓
5. BACKEND (app/routes/ai.py)
   - POST /ai/chat endpoint receives request
   - Validates with Pydantic model
   ↓
6. BACKEND (ai_service.py)
   - chat() function called
   - Retrieves relevant course content (RAG)
   - Builds comprehensive system prompt
   - Calls Gemini API with history
   ↓
7. GOOGLE GEMINI API
   - Processes prompt with conversation history
   - Generates structured response
   - Returns markdown-formatted text
   ↓
8. BACKEND (ai_service.py)
   - Receives Gemini response
   - Wraps in success/error format
   ↓
9. BACKEND (app/routes/ai.py)
   - Returns JSON response to frontend
   ↓
10. FRONTEND (AIContext.jsx)
    - Receives response
    - Adds AI message to conversation history
    - Updates state
    ↓
11. FRONTEND (AIChat.jsx)
    - Renders new message with markdown
    - Auto-scrolls to bottom
    - Shows message with formatting
```

### Screen Content Capture Flow

```javascript
// frontend/src/services/ai/aiService.js

const getScreenContent = () => {
  try {
    // Get main content from page
    const mainContent = document.querySelector('main')?.innerText || 
                       document.querySelector('.content')?.innerText ||
                       document.body.innerText;
    
    // Limit to 6000 characters
    return mainContent?.substring(0, 6000) || '';
  } catch (error) {
    return '';
  }
};

// Automatically called on every chat message
const response = await fetch(`${API_BASE_URL}/chat`, {
  method: 'POST',
  body: JSON.stringify({
    message,
    conversation_history,
    context,
    screen_content: getScreenContent() // ← Automatic!
  })
});
```

---

## 💡 Usage Examples

### Example 1: Basic Question
**User**: "What are arrays?"

**AI Response**:
```markdown
**Arrays** are fundamental data structures that store elements in contiguous memory! 🎯

**Key Points:**
• Fixed-size collection of elements
• Elements accessed by index (0-based)
• Constant-time O(1) access to any element

**Quick Example:**
```python
numbers = [10, 20, 30, 40, 50]
print(numbers[2])  # Output: 30
```

**Why It Matters:**
Arrays are the building blocks for more complex data structures!

**Try This:** 💡 How would you find the maximum element in an array?
```

### Example 2: Context-Aware Question
**User on Trees page**: "How does this work?"

**AI Response** (knows user is viewing Trees content):
```markdown
**Binary Trees** work by organizing data hierarchically! 🌳

**Key Points:**
• Each node has at most 2 children (left and right)
• Root node at the top
• Leaf nodes at the bottom (no children)

**Try This:** 💡 Can you trace an inorder traversal of this tree?
```

### Example 3: Voice Input
1. User clicks 🎤 microphone button
2. Browser asks for mic permission
3. User says: "Explain binary search"
4. Text appears in input: "explain binary search"
5. User clicks send
6. AI responds with structured explanation

---

## 🎉 Summary

Signum's AI Assistant is a **production-ready, context-aware tutoring system** that provides:
- ✅ Real-time Q&A with RAG
- ✅ Screen content awareness
- ✅ Voice input
- ✅ Structured responses
- ✅ Full conversation history
- ✅ Dark theme with emerald accents

**Powered by Google Gemini 2.5 Flash** for fast, accurate, and helpful tutoring.

**Ready for students. Ready for scale. Ready for the future.**
