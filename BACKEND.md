# Backend Architecture Documentation

## Overview

Signum backend is built using **FastAPI** with a **Domain-Driven Design (DDD)** architecture pattern. The system is organized into 5 independent domains, each handling specific business logic with dedicated repositories for data access, ensuring clean separation of concerns and maintainability.

**Framework:** FastAPI v2.0.0  
**Architecture:** Domain-Driven Design (DDD)  
**Database:** Google Cloud Firestore (via Repository Pattern)  
**Authentication:** Firebase Authentication  
**AI Service:** Google Gemini 2.5 Flash  
**Language:** Python 3.x

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                        # FastAPI application entry point
│   │
│   ├── core/                          # Core infrastructure
│   │   ├── database.py                # Firestore client singleton
│   │   ├── exceptions.py              # Custom HTTP exceptions
│   │   └── models.py                  # Shared Pydantic models
│   │
│   ├── repositories/                  # Data Access Layer
│   │   ├── base.py                    # Base repository (CRUD operations)
│   │   ├── user_repository.py         # User data access
│   │   ├── progress_repository.py     # Progress tracking data
│   │   ├── assessment_repository.py   # Quiz/coding submissions + anti-cheat
│   │   └── certification_repository.py # NFT certificate records
│   │
│   ├── domains/                       # Business Logic Layer (5 domains)
│   │   ├── auth/
│   │   │   ├── routes.py              # Authentication endpoints
│   │   │   └── models.py              # Auth request/response models
│   │   │
│   │   ├── progress/
│   │   │   ├── routes.py              # Progress tracking endpoints
│   │   │   └── models.py              # Progress sync models
│   │   │
│   │   ├── assessment/
│   │   │   ├── routes.py              # Unified quiz/coding/anti-cheat endpoints
│   │   │   ├── models.py              # Assessment request models
│   │   │   ├── quiz_service.py        # Quiz business logic
│   │   │   ├── coding_service.py      # Code evaluation logic
│   │   │   └── anti_cheat_service.py  # Violation detection logic
│   │   │
│   │   ├── certification/
│   │   │   ├── routes.py              # NFT certification endpoints
│   │   │   └── models.py              # Certification models
│   │   │
│   │   └── ai/
│   │       └── routes.py              # AI chat assistant endpoints
│   │
│   ├── services/                      # Shared Services
│   │   ├── firebase_admin.py          # Firebase initialization
│   │   ├── certificate_template.py    # NFT certificate HTML generation
│   │   ├── metadata_service.py        # IPFS/Arweave metadata upload
│   │   └── ai/
│   │       ├── ai_service.py          # Gemini AI integration
│   │       ├── course_content_store.py # Course content for context
│   │       └── coding_evaluation_service.py # AI code evaluation
│   │
│   └── templates/                     # HTML Templates
│       └── certificates/              # Course-specific certificate templates
│
├── requirements.txt                   # Python dependencies
├── Dockerfile                         # Container configuration
└── serviceAccountKey.json             # Firebase service account (gitignored)
```

---

## Domain Architecture

### Domain-Driven Design Principles

Each domain is **self-contained** with:
- **Routes** - HTTP endpoints (controllers)
- **Models** - Request/response validation (Pydantic)
- **Services** - Business logic (optional, for complex domains)
- **Repository Access** - Data persistence via repository pattern

**Benefits:**
- ✅ **Modularity** - Domains can be developed/tested independently
- ✅ **Scalability** - Easy to add new domains without affecting existing ones
- ✅ **Maintainability** - Clear responsibility boundaries
- ✅ **Testability** - Mock repositories for unit testing

---

## 5 Core Domains

### 1. **Authentication Domain** (`/auth`)
**Responsibility:** User identity, session management, profile updates, wallet integration

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/verify-firebase-token` | Verify Firebase JWT and create session |
| POST | `/auth/logout` | Destroy user session |
| GET | `/auth/me` | Get current user profile |
| GET | `/auth/courses` | Get all available courses |
| POST | `/auth/courses/enroll` | Enroll user in a course |
| PUT | `/auth/profile` | Update user profile (bio, interests) |
| PUT | `/auth/phantom-wallet` | Save Phantom wallet address |
| DELETE | `/auth/account` | Soft delete user account |

**Session Management:**
- In-memory session store (token → user data)
- Session token stored in HTTP-only cookies
- No database calls for session validation

**Key Features:**
- Firebase Authentication integration
- Profile management
- Course enrollment tracking
- Phantom wallet connection

---

### 2. **Progress Domain** (`/progress`)
**Responsibility:** Learning module tracking, progress synchronization, certification eligibility

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/progress/{course_id}` | Get user progress for a course |
| POST | `/progress/{course_id}/sync` | Sync module completion and percentage |
| GET | `/progress/{course_id}/certification-status` | Check certification eligibility |

**Progress Calculation:**
- **Learning Progress:** Percentage of modules completed (0-100%)
- **Quiz Score:** Best score achieved across attempts
- **Coding Status:** Challenge completion flag
- **Overall:** `(learning × 0.7) + (final_exam × 0.3) = 100%` required

**Eligibility Requirements:**
- All learning modules completed (100%)
- Quiz passed with ≥85% score
- Coding challenge completed successfully

---

### 3. **Assessment Domain** (`/assessment`)
**Responsibility:** Quiz management, coding evaluation, anti-cheat monitoring

**Unified Domain:** Combines 3 sub-systems under one domain

#### **Quiz Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assessment/{course_id}/quiz/{quiz_id}` | Get quiz questions |
| POST | `/assessment/{course_id}/quiz/{quiz_id}/submit` | Submit quiz answers |
| GET | `/assessment/{course_id}/quiz/attempts` | Get quiz attempt history |

#### **Coding Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assessment/{course_id}/coding/run` | Run code with first test case (testing) |
| POST | `/assessment/{course_id}/coding/submit` | Submit code for full evaluation |
| GET | `/assessment/{course_id}/coding/submissions` | Get coding submission history |

#### **Anti-Cheat Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assessment/{course_id}/anti-cheat/report` | Report violation (tab switch, copy/paste) |
| GET | `/assessment/{course_id}/anti-cheat/status` | Check if user is blocked |
| POST | `/assessment/{course_id}/anti-cheat/clear` | Clear violations after cooldown |

**Anti-Cheat Logic:**
- **Violations Tracked:** Tab switch, copy/paste, devtools, right-click, browser blur
- **Thresholds:** 3→5min, 5→15min, 7→30min, 10+→60min block
- **Auto-Expiry:** Blocks automatically clear after duration
- **Penalty:** Quiz/coding scores reduced by violation count percentage

**Code Evaluation:**
- Test case execution (input/output validation)
- Time complexity analysis (AI-powered)
- Security checks (restricted imports)
- Execution timeout protection

---

### 4. **Certification Domain** (`/certification`)
**Responsibility:** NFT certificate generation, blockchain minting, verification

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/certification/{course_id}/mint` | Generate NFT metadata and upload to IPFS |
| POST | `/certification/{course_id}/save` | Save minting transaction details |
| GET | `/certification/{course_id}/status` | Check if certificate exists |
| DELETE | `/certification/{course_id}/delete` | Delete certificate (testing mode only) |

**NFT Workflow:**
1. Check eligibility (via progress domain)
2. Generate certificate HTML (user name, course, date, score)
3. Convert to image (HTML → PNG)
4. Upload to IPFS/Arweave (decentralized storage)
5. Create metadata JSON (name, description, image URL)
6. Return metadata for Solana minting (frontend handles blockchain tx)
7. Save transaction signature and mint address

**Certificate Data:**
- User name and wallet address
- Course title and completion date
- Quiz score and coding completion status
- Unique certificate ID
- Solana transaction signature

---

### 5. **AI Domain** (`/ai`)
**Responsibility:** Conversational AI assistant, context-aware tutoring

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | Send message with conversation history |
| GET | `/ai/status` | Check AI service availability |

**AI Features:**
- **Model:** Google Gemini 2.5 Flash
- **Context Awareness:** Receives current screen content from frontend
- **Course Context:** Knows user's current course and topic
- **Conversation History:** Maintains multi-turn dialogue
- **Safety:** Content filtering and moderation enabled

**Request Format:**
```json
{
  "message": "How does binary search work?",
  "conversation_history": ["Previous messages..."],
  "context": "data-structures",
  "screen_content": "Current page text..."
}
```

**Response Format:**
```json
{
  "success": true,
  "response": "Binary search is...",
  "model": "gemini-2.5-flash"
}
```

---

## Repository Pattern

### Base Repository (`base.py`)
Provides generic CRUD operations for all repositories:

```python
class BaseRepository:
    def __init__(self, collection_name: str)
    
    # CRUD Operations
    def create(id: str, data: dict) → dict
    def get(id: str) → dict | None
    def update(id: str, data: dict) → dict
    def delete(id: str) → bool
    def set(id: str, data: dict, merge: bool) → dict
    def query(filters: list, order_by: str, limit: int) → list[dict]
```

### Specialized Repositories

**1. UserRepository** (`users` collection)
- `get_by_email(email)` - Retrieve user by email
- `create_or_update_user(email, data)` - Upsert user
- `update_profile(email, profile_data)` - Update bio/interests
- `update_wallet(email, wallet_address)` - Save Phantom wallet
- `enroll_course(email, course_id)` - Add course to enrollment list
- `soft_delete(email)` - Mark account as deleted

**2. ProgressRepository** (`course_progress` collection)
- `get_user_course_progress(user_id, course_id)` - Get progress document
- `sync_progress(user_id, course_id, modules, percentage)` - Update learning progress
- `update_quiz_progress(user_id, course_id, score, passed)` - Save quiz results
- `update_coding_progress(user_id, course_id, score, code, passed)` - Save coding results
- `get_certification_eligibility(user_id, course_id)` - Calculate if eligible

**3. AssessmentRepository** (`assessment_submissions` + `anti_cheat_events`)
- `create_submission(user_id, course_id, type, score, ...)` - Store quiz/coding submission
- `get_user_submissions(user_id, course_id, type)` - Retrieve submission history
- `get_best_score(user_id, course_id, type)` - Get highest score
- `record_violation(user_id, course_id, type, violation_type)` - Log anti-cheat event
- `get_violations(user_id, course_id, type)` - Get violation count
- `create_block(user_id, course_id, type, duration)` - Block user from assessment
- `get_block_status(user_id, course_id, type)` - Check if currently blocked
- `clear_violations_and_block(user_id, course_id, type)` - Reset after cooldown

**4. CertificationRepository** (`nft_certificates` collection)
- `save_certificate(user_id, course_id, image_url, tx_sig, mint_addr)` - Store NFT data
- `get_certificate(user_id, course_id)` - Retrieve certificate details
- `delete_certificate(user_id, course_id)` - Remove certificate (testing only)

---

## Services Layer

### Shared Services

**1. Firebase Admin** (`firebase_admin.py`)
- Initialize Firebase app with service account
- Provide Firestore client singleton
- Used by all repositories

**2. Certificate Template** (`certificate_template.py`)
- Generate HTML certificate from user data
- Convert HTML to PNG image
- Template customization per course

**3. Metadata Service** (`metadata_service.py`)
- Upload certificate images to IPFS/Arweave
- Create NFT metadata JSON
- Return decentralized URLs

**4. AI Service** (`ai/ai_service.py`)
- Initialize Google Gemini client
- Send chat messages with context
- Parse AI responses
- Handle API errors gracefully

**5. Coding Evaluation** (`ai/coding_evaluation_service.py`)
- Execute Python/JavaScript code safely
- Run test cases with input/output validation
- Calculate time complexity using AI analysis
- Detect restricted imports and malicious code

**6. Course Content Store** (`ai/course_content_store.py`)
- Store course outlines and module content
- Provide context to AI for accurate tutoring
- Map course IDs to content text

---

## Data Flow Patterns

### 1. User Authentication Flow
```
Frontend (Firebase Auth)
    ↓ (Firebase JWT)
POST /auth/verify-firebase-token
    ↓
Validate JWT → Create Session
    ↓
UserRepository.create_or_update_user()
    ↓
Return session token (HTTP-only cookie)
```

### 2. Progress Tracking Flow
```
Frontend (Module Completed)
    ↓
POST /progress/{course_id}/sync
    ↓
ProgressRepository.sync_progress()
    ↓
Update modules_completed[] & completion_percentage
    ↓
Return updated progress
```

### 3. Quiz Submission Flow
```
Frontend (Quiz Answers)
    ↓
POST /assessment/{course_id}/quiz/{quiz_id}/submit
    ↓
QuizService.submit_quiz()
    ├─→ Calculate score (correct/total × 100)
    ├─→ AssessmentRepository.create_submission() [history]
    └─→ ProgressRepository.update_quiz_progress() [current best]
    ↓
Return score, passed status, detailed results
```

### 4. Anti-Cheat Violation Flow
```
Frontend (Violation Detected: tab switch)
    ↓
POST /assessment/{course_id}/anti-cheat/report
    ↓
AntiCheatService.report_violation()
    ├─→ AssessmentRepository.record_violation()
    ├─→ Get total violation count
    └─→ If threshold reached:
        └─→ AssessmentRepository.create_block(duration)
    ↓
Return block status (if blocked, return time remaining)
```

### 5. NFT Certificate Minting Flow
```
Frontend (Request Certificate)
    ↓
GET /progress/{course_id}/certification-status
    ├─→ Check: learning 100%, quiz ≥85%, coding complete
    └─→ If eligible: continue
    ↓
POST /certification/{course_id}/mint
    ├─→ Generate certificate HTML (user data)
    ├─→ Convert to PNG image
    ├─→ Upload to IPFS (MetadataService)
    └─→ Create metadata JSON
    ↓
Return metadata URI (frontend mints on Solana)
    ↓
Frontend (Mint NFT on blockchain)
    ↓
POST /certification/{course_id}/save
    └─→ CertificationRepository.save_certificate()
        (tx_signature, mint_address, image_url)
```

### 6. AI Chat Flow
```
Frontend (User Message + Screen Content)
    ↓
POST /ai/chat
    ↓
AIService.send_message()
    ├─→ Add course content context
    ├─→ Include screen content
    ├─→ Append conversation history
    └─→ Send to Gemini 2.5 Flash API
    ↓
Return AI response to frontend
```

---

## Request/Response Models (Pydantic)

### Authentication Models
```python
# Profile Update
{
  "displayName": "John Doe",
  "bio": "Software Engineer",
  "interests": ["AI", "Blockchain"],
  "preferredLanguage": "en",
  "timezone": "UTC"
}

# Wallet Update
{
  "walletAddress": "5ZWj7a1f2WNaH9..."
}
```

### Progress Models
```python
# Progress Sync
{
  "user_id": "user123",
  "course_id": "data-structures",
  "modules_completed": ["arrays", "stacks", "trees"],
  "completion_percentage": 75.5
}
```

### Assessment Models
```python
# Quiz Submission
{
  "user_id": "user123",
  "answers": ["a", "b", "c", "d"],
  "time_taken": 1800  # seconds
}

# Coding Submission
{
  "user_id": "user123",
  "code": "def binary_search(arr, target): ...",
  "language": "python",
  "problem_id": "binary-search",
  "anti_cheat_data": {
    "violations": 0,
    "time_taken": 3600
  }
}

# Violation Report
{
  "user_id": "user123",
  "course_id": "data-structures",
  "assessment_type": "quiz",
  "violation_type": "tab_switch",
  "timestamp": "2025-11-01T12:00:00Z"
}
```

---

## Middleware & Configuration

### CORS Configuration
```python
allow_origins = [
  "http://localhost:5173",  # Vite dev server
  "http://localhost:5174",
  "http://localhost:3000"
]
allow_credentials = True  # Cookies allowed
allow_methods = ["*"]
allow_headers = ["*"]
```

### Error Handling
Custom exception classes with HTTP status codes:
- `NotFoundError` (404) - Resource not found
- `UnauthorizedError` (401) - Authentication required
- `ForbiddenError` (403) - Insufficient permissions
- `BadRequestError` (400) - Invalid request data
- `ConflictError` (409) - Resource already exists

---

## Environment Variables

```bash
# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Google AI
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Server
PORT=8000
HOST=0.0.0.0

# CORS
FRONTEND_URL=http://localhost:5173

# NFT Storage (for IPFS/Arweave)
NFT_STORAGE_API_KEY=your_key_here
```

---

## API Versioning

**Current Version:** 2.0.0

**Version Strategy:**
- Major version changes for breaking API changes
- Minor version for new features (backward compatible)
- Patch version for bug fixes

**Version Information Endpoint:**
```
GET /
Returns: API version, status, architecture, endpoints
```

---

## Security Features

### Authentication
- Firebase JWT validation
- Session token management (HTTP-only cookies)
- Automatic token expiration
- Session invalidation on logout

### Data Validation
- Pydantic models for all request/response
- Type checking and validation
- Sanitization of user inputs

### Anti-Cheat
- Real-time violation monitoring
- Progressive blocking system
- Immutable violation logs
- Auto-expiring blocks

### Code Execution Safety
- Restricted imports (no `os`, `sys`, `subprocess`)
- Execution timeout limits
- Resource usage constraints
- Input sanitization

---

## Testing Strategy

### Unit Tests
- Repository layer (mock Firestore)
- Service layer business logic
- Model validation

### Integration Tests
- Full request/response cycle
- Database operations
- External API calls (AI, IPFS)

### End-to-End Tests
- Complete user workflows
- Authentication → Progress → Assessment → Certification
- Anti-cheat violation scenarios

---

## Deployment

### Docker Support
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Running Locally
```bash
# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --port 8000

# Access API
http://localhost:8000
```

---

## Visual Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SIGNUM BACKEND ARCHITECTURE                        │
│                    FastAPI + Domain-Driven Design                       │
└─────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────┐
                         │   Frontend   │
                         │  (React App) │
                         └───────┬──────┘
                                 │ HTTP/REST API
                                 ▼
                    ┌────────────────────────┐
                    │   FastAPI Router       │
                    │   (main.py)            │
                    └────────┬───────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Middleware   │    │  CORS        │    │ Exception    │
│ Layer        │    │  Config      │    │ Handlers     │
└──────────────┘    └──────────────┘    └──────────────┘
                             │
        ┌────────────────────┼────────────────────────────┐
        │                    │                            │
        ▼                    ▼                            ▼
┌──────────────┐    ┌──────────────┐    ┌────────────────────┐
│ /auth        │    │ /progress    │    │ /assessment        │
│ Routes       │    │ Routes       │    │ Routes             │
└──────┬───────┘    └──────┬───────┘    └──────┬─────────────┘
       │                   │                    │
       │                   │                    │
        ▼                  ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌────────────────────┐
│ /certification│   │ /ai          │    │                    │
│ Routes       │    │ Routes       │    │                    │
└──────┬───────┘    └──────┬───────┘    └────────────────────┘
       │                   │                    
       │                   │                    
       └───────────────────┴──────────────────────┐
                                                  │
                           ┌──────────────────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  DOMAIN SERVICES    │
                ├─────────────────────┤
                │ ▸ QuizService       │
                │ ▸ CodingService     │
                │ ▸ AntiCheatService  │
                │ ▸ AIService         │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  REPOSITORIES       │
                ├─────────────────────┤
                │ ▸ UserRepository    │
                │ ▸ ProgressRepository│
                │ ▸ AssessmentRepo    │
                │ ▸ CertificationRepo │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  DATABASE CLIENT    │
                │  (Firestore)        │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  Google Cloud       │
                │  Firestore          │
                │  (5 Collections)    │
                └─────────────────────┘


═══════════════════════════════════════════════════════════════════════
                          DOMAIN BREAKDOWN
═══════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│  DOMAIN 1: AUTHENTICATION (/auth)                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐    │
│  │ Auth Routes  │─────▶│    Session   │─────▶│     User     │    │
│  │   8 endpoints│      │  Management  │      │  Repository  │    │
│  └──────────────┘      └──────────────┘      └──────────────┘    │
│                                                       │            │
│                                                       ▼            │
│                                              ┌──────────────┐     │
│                                              │    users     │     │
│  Handles:                                    │  collection  │     │
│  • Firebase JWT validation                   └──────────────┘     │
│  • User profile management                                        │
│  • Course enrollment                                              │
│  • Phantom wallet connection                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  DOMAIN 2: PROGRESS (/progress)                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐    │
│  │   Progress   │─────▶│  Eligibility │─────▶│   Progress   │    │
│  │    Routes    │      │  Calculator  │      │  Repository  │    │
│  │ 3 endpoints  │      └──────────────┘      └──────────────┘    │
│  └──────────────┘                                     │            │
│                                                       ▼            │
│                                              ┌──────────────┐     │
│  Handles:                                    │course_progress│    │
│  • Module completion tracking                │  collection  │     │
│  • Quiz/coding score updates                 └──────────────┘     │
│  • Certification eligibility                                      │
│    (learning×0.7 + exam×0.3 = 100%)                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  DOMAIN 3: ASSESSMENT (/assessment)                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐    │
│  │  Assessment  │─────▶│Quiz Service  │─────▶│  Assessment  │    │
│  │   Routes     │      │Coding Service│      │  Repository  │    │
│  │ 9 endpoints  │      │AntiCheat Svc │      └──────────────┘    │
│  └──────────────┘      └──────────────┘              │            │
│                                                       ▼            │
│  Sub-Systems:                            ┌──────────────────────┐ │
│  ┌─────────────────────┐                 │assessment_submissions││
│  │ 1. Quiz (3 routes)  │                 │  collection          ││
│  │    • Get questions  │                 ├──────────────────────┤│
│  │    • Submit answers │                 │anti_cheat_events     ││
│  │    • Get attempts   │                 │  collection          ││
│  └─────────────────────┘                 └──────────────────────┘│
│  ┌─────────────────────┐                                          │
│  │ 2. Coding (3 routes)│                                          │
│  │    • Run test       │                                          │
│  │    • Submit code    │                                          │
│  │    • Get submissions│                                          │
│  └─────────────────────┘                                          │
│  ┌─────────────────────┐                                          │
│  │ 3. Anti-Cheat       │                                          │
│  │    • Report violation│                                         │
│  │    • Check status   │                                          │
│  │    • Clear violations│                                         │
│  └─────────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  DOMAIN 4: CERTIFICATION (/certification)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐    │
│  │Certification │─────▶│   Metadata   │─────▶│Certification │    │
│  │   Routes     │      │   Service    │      │  Repository  │    │
│  │ 4 endpoints  │      │  (IPFS)      │      └──────────────┘    │
│  └──────────────┘      └──────────────┘              │            │
│                                                       ▼            │
│                                              ┌──────────────┐     │
│  NFT Workflow:                               │nft_certificates│   │
│  1. Generate certificate HTML                │  collection  │     │
│  2. Convert to PNG image                     └──────────────┘     │
│  3. Upload to IPFS/Arweave                           │            │
│  4. Create metadata JSON                             │            │
│  5. Return URI for Solana mint                       ▼            │
│  6. Save transaction details             ┌──────────────────┐    │
│                                           │ Solana Blockchain│    │
│                                           │   (Devnet)       │    │
│                                           └──────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  DOMAIN 5: AI ASSISTANT (/ai)                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐    │
│  │  AI Routes   │─────▶│  AI Service  │─────▶│Google Gemini │    │
│  │ 2 endpoints  │      │              │      │  2.5 Flash   │    │
│  └──────────────┘      └──────────────┘      └──────────────┘    │
│                               │                                    │
│                               ▼                                    │
│  Features:            ┌──────────────┐                            │
│  • Context-aware chat │Course Content│                            │
│  • Screen content     │    Store     │                            │
│  • Conversation history└──────────────┘                           │
│  • Safety filtering                                               │
│                                                                     │
│  Use Cases:                                                        │
│  • Answer learning questions                                      │
│  • Explain code concepts                                          │
│  • Debug assistance                                               │
│  • Quiz preparation                                               │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                       REPOSITORY PATTERN LAYER
═══════════════════════════════════════════════════════════════════════

                    ┌────────────────────────┐
                    │   BaseRepository       │
                    ├────────────────────────┤
                    │ + create(id, data)     │
                    │ + get(id)              │
                    │ + update(id, data)     │
                    │ + delete(id)           │
                    │ + set(id, data, merge) │
                    │ + query(filters)       │
                    └───────────┬────────────┘
                                │ (inherits)
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│UserRepository   │   │ProgressRepo     │   │AssessmentRepo   │
├─────────────────┤   ├─────────────────┤   ├─────────────────┤
│+ get_by_email   │   │+ sync_progress  │   │+ create_submission│
│+ create_or_update│  │+ update_quiz    │   │+ get_submissions │
│+ update_profile │   │+ update_coding  │   │+ record_violation│
│+ update_wallet  │   │+ get_eligibility│   │+ create_block   │
│+ enroll_course  │   └─────────────────┘   │+ get_block_status│
│+ soft_delete    │                         │+ clear_violations│
└─────────────────┘                         └─────────────────┘
        │                                            │
        ▼                                            ▼
┌─────────────────┐                         ┌─────────────────┐
│CertificationRepo│                         │assessment_      │
├─────────────────┤                         │ submissions     │
│+ save_certificate│                        │                 │
│+ get_certificate│                         │anti_cheat_events│
│+ delete_cert    │                         └─────────────────┘
└─────────────────┘
        │
        ▼
┌─────────────────┐
│nft_certificates │
└─────────────────┘


═══════════════════════════════════════════════════════════════════════
                         REQUEST FLOW EXAMPLE
                    (User Submits Quiz with Violation)
═══════════════════════════════════════════════════════════════════════

┌─────────────┐
│  Frontend   │ User completes quiz, detects tab switch
└──────┬──────┘
       │
       ├─── 1. Report Violation ────────────────────────────────────┐
       │                                                            │
       │    POST /assessment/{course_id}/anti-cheat/report          │
       │    Body: {violation_type: "tab_switch", timestamp: ...}    │
       │                                                            │
       │    ▼                                                       │
       │    AntiCheatService.report_violation()                     │
       │    ├─→ AssessmentRepo.record_violation()                  │
       │    ├─→ Count total violations (3)                          │
       │    └─→ Create 5-minute block                              │
       │                                                            │
       │    Response: {is_blocked: true, time_remaining: 300000}    │
       │                                                            │
       ├─── 2. Submit Quiz Answers ─────────────────────────────────┤
       │                                                            │
       │    POST /assessment/{course_id}/quiz/{quiz_id}/submit      │
       │    Body: {answers: ["a","b","c"], time_taken: 600}         │
       │                                                            │
       │    ▼                                                       │
       │    QuizService.submit_quiz()                               │
       │    ├─→ Check block status (BLOCKED - reject submission)   │
       │    └─→ Return error: "You are blocked for 5 minutes"      │
       │                                                            │
       └────────────────────────────────────────────────────────────┘
              User must wait 5 minutes before retrying
                           │
                           ▼ (after 5 minutes)
       ┌───────────────────────────────────────┐
       │ Block auto-expires (is_active = false)│
       │ User can submit quiz again            │
       └───────────────────────────────────────┘
```

---

*This backend architecture is designed for scalability, maintainability, and clean separation of concerns using Domain-Driven Design principles.*