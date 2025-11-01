# Database Schema Documentation

## Overview

Signum uses **Google Cloud Firestore** as its primary NoSQL database. The database architecture follows a **Domain-Driven Design (DDD)** pattern with 5 optimized collections that support the complete learning platform lifecycle: user management, progress tracking, assessments, anti-cheat monitoring, and blockchain certification.

**Total Collections:** 5  
**Database Type:** Cloud Firestore (NoSQL)  
**Access Pattern:** Repository Pattern with domain-specific services

---

## Collections

### 1. `users`
**Purpose:** Core user identity, authentication, profile management, and course enrollment tracking.

**Document ID:** User email address (e.g., `user@example.com`)

**Schema:**
```javascript
{
  // Identity
  uid: string,                          // Firebase Auth UID
  email: string,                        // Primary identifier
  displayName: string,                  // User's full name
  photoURL: string,                     // Profile picture URL
  
  // Profile
  bio: string,                          // User biography
  interests: [string],                  // Array of interests/skills
  
  // Blockchain
  phantomWalletAddress: string,         // Solana Phantom wallet address
  
  // Course Management
  coursesEnrolled: [string],            // Array of course IDs
  
  // Account Status
  isDeleted: boolean,                   // Soft delete flag
  deletedAt: timestamp,                 // Deletion timestamp
  
  // Audit
  createdAt: timestamp,                 // Account creation time
  lastLoginAt: timestamp                // Last login time
}
```

**Key Operations:**
- User registration and authentication
- Profile updates (bio, interests)
- Phantom wallet connection
- Course enrollment management
- Soft account deletion

**Indexes:** Email (primary key)

---

### 2. `course_progress`
**Purpose:** Track learning module completion, quiz scores, coding challenge results, and certification eligibility.

**Document ID:** `{user_id}_{course_id}` (e.g., `user123_data-structures`)

**Schema:**
```javascript
{
  // Identification
  user_id: string,                      // Reference to user
  course_id: string,                    // Course identifier
  
  // Learning Progress
  modules_completed: [string],          // Array of completed module IDs
  completion_percentage: number,        // 0-100, learning modules only
  
  // Quiz Performance
  quiz: {
    best_score: number,                 // Highest score achieved (0-100)
    last_score: number,                 // Most recent score
    attempts: number,                   // Total quiz attempts
    passed: boolean,                    // True if score >= 85%
    last_attempt: timestamp             // Last quiz submission time
  },
  
  // Coding Challenge Performance
  coding: {
    completed: boolean,                 // Challenge completion status
    best_score: number,                 // Highest score achieved (0-100)
    last_score: number,                 // Most recent score
    problem_id: string,                 // Challenge problem identifier
    language: string,                   // Programming language used
    code: string,                       // Last submitted code
    last_submission: timestamp          // Last coding submission time
  },
  
  // Tracking
  last_updated: timestamp               // Last progress sync time
}
```

**Certification Eligibility Calculation:**
- Learning Progress: 100% of modules completed
- Quiz: Score ≥ 85% (50% of final exam)
- Coding: Challenge completed (50% of final exam)
- Overall: `(learning_progress × 0.7) + (final_exam_score × 0.3) = 100%`

**Key Operations:**
- Sync module completion
- Update quiz/coding scores
- Calculate certification eligibility
- Track best scores across attempts

**Indexes:** Composite index on `(user_id, course_id)`

---

### 3. `assessment_submissions`
**Purpose:** Store complete submission history for quizzes and coding challenges with detailed results.

**Document ID:** UUID (auto-generated)

**Schema:**
```javascript
{
  // Identification
  id: string,                           // UUID submission ID
  user_id: string,                      // Reference to user
  course_id: string,                    // Course identifier
  type: string,                         // "quiz" or "coding"
  
  // Results
  score: number,                        // Final score (0-100)
  submitted_at: timestamp,              // Submission time
  
  // Quiz-Specific Fields (when type = "quiz")
  answers: [
    {
      question_id: string,              // Question identifier
      user_answer: string,              // Selected answer
      correct_answer: string,           // Correct answer
      is_correct: boolean               // Correctness flag
    }
  ],
  
  // Coding-Specific Fields (when type = "coding")
  code: string,                         // Submitted source code
  problem_id: string,                   // Challenge problem ID
  language: string,                     // Programming language
  test_results: [
    {
      test_case: number,                // Test case number
      passed: boolean,                  // Test result
      input: string,                    // Test input
      expected: string,                 // Expected output
      output: string,                   // Actual output
      execution_time: number            // Time in milliseconds
    }
  ],
  time_complexity: {
    analysis: string,                   // Big-O notation
    explanation: string                 // Complexity explanation
  }
}
```

**Key Operations:**
- Record quiz submissions with detailed answers
- Store coding submissions with test results
- Retrieve submission history
- Calculate best scores

**Indexes:** 
- Composite: `(user_id, course_id, type)`
- Sort: `submitted_at DESC`

---

### 4. `anti_cheat_events`
**Purpose:** Monitor and enforce academic integrity through violation tracking and assessment blocking.

**Document ID:** 
- Violations: UUID (auto-generated)
- Blocks: `{user_id}_{course_id}_{assessment_type}_block`

**Schema:**

**Violation Event:**
```javascript
{
  // Identification
  id: string,                           // UUID event ID
  user_id: string,                      // Reference to user
  course_id: string,                    // Course identifier
  assessment_type: string,              // "quiz" or "coding"
  event_type: "violation",              // Event type marker
  
  // Violation Details
  violation_type: string,               // "tab_switch", "copy_paste", "devtools", etc.
  timestamp: string,                    // ISO 8601 timestamp
  created_at: timestamp                 // Database entry time
}
```

**Block Event:**
```javascript
{
  // Identification
  id: string,                           // Composite ID (user_course_type_block)
  user_id: string,                      // Reference to user
  course_id: string,                    // Course identifier
  assessment_type: string,              // "quiz" or "coding"
  event_type: "block",                  // Event type marker
  
  // Block Details
  violation_count: number,              // Number of violations triggering block
  block_end_time: timestamp,            // Block expiration time
  blocked_at: timestamp,                // Block creation time
  is_active: boolean                    // Block status
}
```

**Violation Thresholds:**
- 3 violations → 5-minute block
- 5 violations → 15-minute block
- 7 violations → 30-minute block
- 10+ violations → 1-hour block

**Detected Violations:**
- Tab switching (fullscreen exit)
- Copy/paste operations
- Developer tools access
- Browser blur/focus events
- Right-click/context menu

**Key Operations:**
- Record real-time violations
- Calculate block duration
- Check block status
- Auto-expire blocks
- Clear violations (testing mode)

**Indexes:**
- Composite: `(user_id, course_id, assessment_type, event_type)`
- Filter: `is_active = true`

---

### 5. `nft_certificates`
**Purpose:** Record blockchain NFT certificate minting details and verification data.

**Document ID:** `{user_id}_{course_id}_nft` (e.g., `user123_data-structures_nft`)

**Schema:**
```javascript
{
  // Identification
  user_id: string,                      // Reference to user
  course_id: string,                    // Course identifier
  
  // Certificate Details
  certificate_image_url: string,        // IPFS/Arweave image URL
  
  // Blockchain Data (Solana)
  transaction_signature: string,        // Solana transaction hash
  mint_address: string,                 // NFT mint public key
  minted_at: string,                    // ISO 8601 minting timestamp
  
  // Tracking
  saved_at: timestamp                   // Database save time
}
```

**Blockchain Integration:**
- Network: Solana Devnet
- Token Standard: Metaplex NFT
- Storage: IPFS/Arweave (off-chain metadata)
- Wallet: Phantom (user-side), System Program (server-side)

**Key Operations:**
- Save NFT minting transaction
- Verify certificate existence
- Retrieve certificate details
- Delete certificate (testing mode only)

**Indexes:** Composite primary key `(user_id, course_id)`

---

## Database Architecture

### Design Principles

1. **Denormalization by Design**
   - Quiz/coding scores stored in both `course_progress` (current best) and `assessment_submissions` (history)
   - Optimizes read performance for dashboard displays
   - Reduces join operations in NoSQL environment

2. **Composite Document IDs**
   - Pattern: `{user_id}_{course_id}_{optional_suffix}`
   - Enables efficient single-document lookups
   - Eliminates need for complex queries

3. **Event Sourcing for Anti-Cheat**
   - Immutable violation records
   - Separate block state management
   - Enables violation history audit trails

4. **Soft Deletes**
   - Users: `isDeleted` flag preserves data integrity
   - Certificates: Hard delete only in testing mode
   - Maintains referential context for historical records

### Data Flow

```
User Authentication (Firebase Auth)
    ↓
users collection (profile + enrollment)
    ↓
course_progress (learning tracking)
    ↓
assessment_submissions (quiz/coding results)
    ↓ (if violations detected)
anti_cheat_events (monitoring)
    ↓ (if eligible)
nft_certificates (blockchain proof)
```

---

## Repository Pattern

Each collection has a dedicated repository class providing CRUD operations:

| Repository | Collection | Primary Methods |
|------------|-----------|-----------------|
| `UserRepository` | `users` | `create_or_update_user`, `update_profile`, `enroll_course`, `update_wallet` |
| `ProgressRepository` | `course_progress` | `sync_progress`, `update_quiz_progress`, `update_coding_progress`, `get_certification_eligibility` |
| `AssessmentRepository` | `assessment_submissions` + `anti_cheat_events` | `create_submission`, `get_user_submissions`, `record_violation`, `create_block`, `get_block_status` |
| `CertificationRepository` | `nft_certificates` | `save_certificate`, `get_certificate`, `delete_certificate` |

---

## Query Patterns

### Common Queries

**Get User Progress:**
```python
progress_repo.get_user_course_progress(user_id, course_id)
# Returns: Single document from course_progress
```

**Check Certification Eligibility:**
```python
progress_repo.get_certification_eligibility(user_id, course_id)
# Calculates: learning (70%) + final exam (30%) = 100%
```

**Get Submission History:**
```python
assessment_repo.get_user_submissions(user_id, course_id, type="quiz", limit=10)
# Returns: Last 10 quiz submissions ordered by submitted_at DESC
```

**Check Anti-Cheat Status:**
```python
assessment_repo.get_block_status(user_id, course_id, assessment_type="quiz")
# Returns: Block status with time remaining
```

**Verify NFT Certificate:**
```python
cert_repo.get_certificate(user_id, course_id)
# Returns: Certificate with blockchain transaction details
```

---

## Optimization Strategies

### Indexing
- **Primary Keys:** Email (users), composite IDs (other collections)
- **Query Indexes:** `(user_id, course_id)` across all collections
- **Sort Indexes:** `submitted_at DESC` for chronological queries

### Caching
- Session tokens stored in-memory (not in database)
- User profile cached on frontend after `/auth/me` call
- Progress synced only on module completion (not real-time)

### Data Lifecycle
- **Violations:** Auto-cleared after block expiration
- **Submissions:** Retained indefinitely for audit trails
- **Certificates:** Immutable once minted (blockchain-backed)
- **Users:** Soft-deleted, never hard-deleted

---

## Security & Compliance

### Access Control
- Authentication: Firebase session tokens
- Authorization: Row-level via `user_id` matching
- Wallet Verification: Public key validation before NFT minting

### Data Integrity
- Anti-cheat events: Immutable append-only logs
- Submissions: Cryptographically linked to user sessions
- Blockchain records: Verified against Solana explorer

### Privacy
- Personal data: Email, name, photo (GDPR-compliant soft delete)
- Learning data: Not shared between users
- Blockchain: Public NFT metadata, private user identity

---

## Migration Path

Current schema supports future expansion:

**Planned Additions:**
- `course_analytics` - Aggregated learning metrics
- `leaderboards` - Performance rankings
- `peer_reviews` - Collaborative assessments

**Backward Compatibility:**
- All new fields optional with defaults
- Existing documents auto-migrated on read
- No breaking changes to API contracts

---

## Performance Metrics

**Expected Query Times (95th percentile):**
- User authentication: <100ms
- Progress sync: <150ms
- Submission retrieval: <200ms
- Anti-cheat check: <80ms
- Certificate lookup: <100ms

**Scalability:**
- Supports: 100,000+ concurrent users
- Storage: ~5KB per user, ~50KB per course completion
- Firestore quotas: Well within free tier for development

---

## Technical Stack

**Database:** Google Cloud Firestore  
**ORM Pattern:** Repository Pattern with Firebase Admin SDK  
**Authentication:** Firebase Authentication  
**Blockchain:** Solana (Devnet)  
**Storage:** IPFS/Arweave (NFT metadata)

---

## Visual Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SIGNUM DATABASE ARCHITECTURE                         │
│                        Google Cloud Firestore (NoSQL)                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────┐
│  COLLECTION: users        │
│  ID: email                │
├───────────────────────────┤
│ ▸ uid                     │──┐
│ ▸ email                   │  │
│ ▸ displayName             │  │
│ ▸ photoURL                │  │
│ ▸ bio                     │  │ USER IDENTITY
│ ▸ interests []            │  │ & PROFILE
│ ▸ phantomWalletAddress    │  │
│ ▸ coursesEnrolled []      │  │
│ ▸ isDeleted               │  │
│ ▸ createdAt               │  │
│ ▸ lastLoginAt             │──┘
└───────────────────────────┘
         │
         │ enrolled in
         ▼
┌────────────────────────────────────┐
│  COLLECTION: course_progress       │
│  ID: {user_id}_{course_id}         │
├────────────────────────────────────┤
│ ▸ user_id                          │──┐
│ ▸ course_id                        │  │
│ ▸ modules_completed []             │  │ LEARNING
│ ▸ completion_percentage            │  │ PROGRESS
│ ▸ quiz: {                          │  │ TRACKING
│     best_score, last_score,        │  │
│     attempts, passed               │  │
│   }                                │  │
│ ▸ coding: {                        │  │
│     completed, best_score,         │  │
│     problem_id, language, code     │  │
│   }                                │  │
│ ▸ last_updated                     │──┘
└────────────────────────────────────┘
         │
         │ submissions
         ▼
┌─────────────────────────────────────────┐
│  COLLECTION: assessment_submissions     │
│  ID: UUID                               │
├─────────────────────────────────────────┤
│ ▸ id                                    │──┐
│ ▸ user_id                               │  │
│ ▸ course_id                             │  │
│ ▸ type ("quiz" | "coding")              │  │ SUBMISSION
│ ▸ score                                 │  │ HISTORY
│ ▸ submitted_at                          │  │
│                                         │  │
│ [IF type = "quiz"]                      │  │
│ ▸ answers: [{                           │  │
│     question_id, user_answer,           │  │
│     correct_answer, is_correct          │  │
│   }]                                    │  │
│                                         │  │
│ [IF type = "coding"]                    │  │
│ ▸ code, problem_id, language            │  │
│ ▸ test_results: [{                      │  │
│     test_case, passed, input,           │  │
│     expected, output, execution_time    │  │
│   }]                                    │  │
│ ▸ time_complexity: {                    │  │
│     analysis, explanation               │  │
│   }                                     │──┘
└─────────────────────────────────────────┘
         │
         │ monitored by
         ▼
┌──────────────────────────────────────────┐
│  COLLECTION: anti_cheat_events           │
│  ID: UUID | {user_course_type}_block     │
├──────────────────────────────────────────┤
│ [VIOLATION EVENT]                        │──┐
│ ▸ id                                     │  │
│ ▸ user_id                                │  │
│ ▸ course_id                              │  │
│ ▸ assessment_type                        │  │ ACADEMIC
│ ▸ event_type: "violation"                │  │ INTEGRITY
│ ▸ violation_type                         │  │ MONITORING
│ ▸ timestamp                              │  │
│                                          │  │
│ [BLOCK EVENT]                            │  │
│ ▸ id                                     │  │
│ ▸ user_id                                │  │
│ ▸ course_id                              │  │
│ ▸ assessment_type                        │  │
│ ▸ event_type: "block"                    │  │
│ ▸ violation_count                        │  │
│ ▸ block_end_time                         │  │
│ ▸ is_active                              │──┘
└──────────────────────────────────────────┘

         [WHEN ELIGIBLE: 100% completion]
         
┌─────────────────────────────────────────┐
│  COLLECTION: nft_certificates           │
│  ID: {user_id}_{course_id}_nft          │
├─────────────────────────────────────────┤
│ ▸ user_id                               │──┐
│ ▸ course_id                             │  │
│ ▸ certificate_image_url (IPFS)          │  │ BLOCKCHAIN
│ ▸ transaction_signature (Solana)        │  │ CERTIFICATES
│ ▸ mint_address (NFT)                    │  │
│ ▸ minted_at                             │  │
│ ▸ saved_at                              │──┘
└─────────────────────────────────────────┘
         │
         │ verified on
         ▼
    ┌─────────────────┐
    │ Solana Devnet   │
    │ (Blockchain)    │
    └─────────────────┘


═══════════════════════════════════════════════════════════════════════════
                            DATA RELATIONSHIPS
═══════════════════════════════════════════════════════════════════════════

users.email ──────────► course_progress.user_id
                             │
                             ├──────► assessment_submissions.user_id
                             │
                             ├──────► anti_cheat_events.user_id
                             │
                             └──────► nft_certificates.user_id

users.coursesEnrolled[] ───► course_progress.course_id


═══════════════════════════════════════════════════════════════════════════
                          CERTIFICATION FLOW
═══════════════════════════════════════════════════════════════════════════

  ┌─────────────┐
  │ User Login  │
  └──────┬──────┘
         │
         ▼
  ┌──────────────────┐
  │ Enroll in Course │ ───► users.coursesEnrolled[]
  └──────┬───────────┘
         │
         ▼
  ┌──────────────────────┐
  │ Complete Modules     │ ───► course_progress.modules_completed[]
  │ (100% required)      │      course_progress.completion_percentage = 100
  └──────┬───────────────┘
         │
         ▼
  ┌──────────────────────┐
  │ Take Quiz            │ ───► assessment_submissions (type: quiz)
  │ (85%+ required)      │      course_progress.quiz.best_score >= 85
  └──────┬───────────────┘      course_progress.quiz.passed = true
         │
         │ [Anti-Cheat Monitoring Active]
         │ ───► anti_cheat_events.event_type = "violation"
         │      (tab switch, copy/paste, devtools, etc.)
         │
         ▼
  ┌──────────────────────┐
  │ Coding Challenge     │ ───► assessment_submissions (type: coding)
  │ (Pass all tests)     │      course_progress.coding.completed = true
  └──────┬───────────────┘      course_progress.coding.best_score
         │
         │ [Anti-Cheat Monitoring Active]
         │ ───► anti_cheat_events.event_type = "violation"
         │
         ▼
  ┌──────────────────────┐
  │ Eligibility Check    │
  │ Learning: 100%       │
  │ Quiz: Passed (85%+)  │ ───► course_progress (eligibility calculation)
  │ Coding: Completed    │      (learning × 0.7) + (final_exam × 0.3) = 100%
  │ Overall: 100%        │
  └──────┬───────────────┘
         │
         ▼
  ┌──────────────────────┐
  │ Connect Phantom      │ ───► users.phantomWalletAddress
  │ Wallet               │
  └──────┬───────────────┘
         │
         ▼
  ┌──────────────────────┐
  │ Mint NFT Certificate │ ───► nft_certificates.transaction_signature
  │ (Solana Blockchain)  │      nft_certificates.mint_address
  └──────────────────────┘      nft_certificates.certificate_image_url (IPFS)


═══════════════════════════════════════════════════════════════════════════
                        ANTI-CHEAT VIOLATION FLOW
═══════════════════════════════════════════════════════════════════════════

  Violation Detected
  (tab switch, copy, devtools, etc.)
         │
         ▼
  ┌─────────────────────┐
  │ Record Violation    │ ───► anti_cheat_events (event_type: "violation")
  └──────┬──────────────┘
         │
         ▼
  Check Total Violations
         │
         ├─── 3 violations ───► 5-minute block
         ├─── 5 violations ───► 15-minute block
         ├─── 7 violations ───► 30-minute block
         └─── 10+ violations ─► 1-hour block
         │
         ▼
  ┌─────────────────────┐
  │ Create Block Event  │ ───► anti_cheat_events (event_type: "block")
  │                     │      block_end_time, is_active = true
  └──────┬──────────────┘
         │
         ▼
  User Cannot Submit Quiz/Coding
  Until block_end_time Expires
         │
         ▼
  Auto-Clear on Expiration
  (is_active = false)
```

---

*This schema is optimized for the Signum AI-powered learning platform, supporting interactive education, real-time anti-cheat monitoring, and blockchain-verified credentials.*