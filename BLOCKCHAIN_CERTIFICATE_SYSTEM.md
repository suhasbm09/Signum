# Blockchain Certificate System Documentation

## Overview

Signum mints **NFT certificates on Solana blockchain** when users complete courses with required scores. The system combines smart contract validation, dynamic certificate image generation, and decentralized metadata storage.

**Blockchain:** Solana Devnet (Anchor framework)  
**Smart Contract:** On-chain eligibility validation + NFT minting  
**Certificate Images:** Pillow/PIL template-based generation  
**Metadata Storage:** IPFS (Pinata) or data URIs  
**Wallet Integration:** Phantom wallet for transaction signing  

**Key Features:**
- Multi-user support on same wallet (userId-based PDA)
- Eligibility validation (quiz ≥85%, completion ≥90%)
- Dynamic certificate images with user data
- Metaplex-compliant NFT metadata
- Certificate revocation support


---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  File: CertificationsContent.jsx                                │
│  ├── Phantom Wallet Connection                                  │
│  ├── Eligibility Checking (quiz ≥85%, completion ≥90%)         │
│  ├── Solana Transaction Execution                               │
│  └── Certificate Display                                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                        HTTP POST Request
                     localhost:8000/blockchain/mint
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                     BACKEND (FastAPI)                           │
├─────────────────────────────────────────────────────────────────┤
│  Endpoint: POST /blockchain/mint                                │
│  ├── Verifies eligibility (quiz, completion, anti-cheat)       │
│  ├── CertificateTemplate.generate_certificate()                │
│  ├── MetadataService.generate_metadata()                       │
│  └── Returns metadata URI + certificate image                  │
│                                                                  │
│  Files:                                                         │
│  ├── app/routes/blockchain.py                                  │
│  ├── app/services/metadata_service.py                          │
│  └── app/services/certificate_template.py                      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    Certificate Image + Metadata
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                 SOLANA BLOCKCHAIN                               │
├─────────────────────────────────────────────────────────────────┤
│  Smart Contract: solana/program/programs/program/src/lib.rs     │
│  Program ID: 2EWf5TXq3jW8iQ1yuQorrgmaBc4Wjd8PMwDEBCWod5tp       │
│                                                                  │
│  Instruction: mint_certificate()                                │
│  ├── Validates eligibility (score ≥85, completion ≥90)         │
│  ├── Calculates final score: (quiz × 0.7) + (completion × 0.3) │
│  ├── Mints NFT with metadata URI                               │
│  └── Stores certificate data on-chain                          │
│                                                                  │
│  PDA Derivation:                                                │
│  seeds = ["certificate", wallet, courseId, userId]             │
│  (userId ensures unique certificate per user per wallet)        │
└─────────────────────────────────────────────────────────────────┘
```


---

## Smart Contract Implementation

### Program Details

**File:** `solana/program/programs/program/src/lib.rs`  
**Program ID:** `2EWf5TXq3jW8iQ1yuQorrgmaBc4Wjd8PMwDEBCWod5tp`  
**Framework:** Anchor (Solana smart contract framework)

### Instruction: mint_certificate()

```rust
pub fn mint_certificate(
    ctx: Context<MintCertificate>,
    course_id: String,
    user_id: String,              // Multi-user support
    quiz_score: u8,
    completion_percentage: u8,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    // Eligibility validation
    require!(quiz_score >= 85, ErrorCode::InsufficientQuizScore);
    require!(completion_percentage >= 90, ErrorCode::InsufficientCompletion);

    // Calculate final score (70% quiz + 30% completion)
    let final_score = ((quiz_score as u16 * 70 + completion_percentage as u16 * 30) / 100) as u8;

    // Store certificate data
    certificate.user_id = user_id;
    certificate.quiz_score = quiz_score;
    certificate.completion_percentage = completion_percentage;
    certificate.final_score = final_score;
    // ... NFT minting logic
}
```

### PDA (Program Derived Address)

**Multi-User Support:** The PDA includes `userId` to allow multiple users on the same wallet.

```rust
#[derive(Accounts)]
#[instruction(course_id: String, user_id: String)]
pub struct MintCertificate<'info> {
    #[account(
        init,
        payer = recipient,
        space = 8 + Certificate::SIZE,
        seeds = [
            b"certificate",
            recipient.key().as_ref(),      // Wallet address
            course_id.as_bytes(),          // Course ID
            user_id.as_bytes()             // User ID (enables multi-user)
        ],
        bump
    )]
    pub certificate: Account<'info, Certificate>,
    // ... other accounts
}
```

**Why userId in PDA?**
- **Without userId:** One wallet = One certificate per course (conflict if shared wallet)
- **With userId:** Multiple users can share wallet, each gets unique certificate
- **Example:** `wallet1 + data-structures + user123` vs `wallet1 + data-structures + user456`

### Certificate Account Structure

```rust
#[account]
pub struct Certificate {
    pub owner: Pubkey,              // Wallet address
    pub course_id: String,          // Course identifier
    pub user_id: String,            // User identifier (Firebase UID)
    pub quiz_score: u8,             // Quiz score (≥85)
    pub completion_percentage: u8,  // Completion (≥90)
    pub final_score: u8,            // Calculated score
    pub mint_address: Pubkey,       // NFT mint address
    pub minted_at: i64,             // Unix timestamp
    pub is_revoked: bool,           // Revocation status
}
```

### Error Codes

```rust
#[error_code]
pub enum ErrorCode {
    #[msg("Quiz score must be at least 85%")]
    InsufficientQuizScore,
    #[msg("Course completion must be at least 90%")]
    InsufficientCompletion,
    #[msg("Certificate has been revoked")]
    CertificateRevoked,
}
```


---

## Certificate Template System

### Overview

**File:** `backend/app/services/certificate_template.py`  
**Library:** Pillow (PIL) for image manipulation  
**Template:** PNG files with dynamic text overlay  

### Template Structure

```
backend/app/templates/certificates/
├── data-structures/
│   └── certificate_template.png  (976 x 693px)
└── [other-courses]/
    └── certificate_template.png
```

### Dynamic Fields Overlaid

**Certificate Generator:**
```python
class CertificateTemplate:
    def generate_certificate(
        course_id: str,
        wallet_address: str,
        final_score: int,
        timestamp: str,
        user_name: str
    ) -> bytes:  # Returns PNG bytes
```

**Overlay Positions:**

| Field | Position | Font | Color |
|-------|----------|------|-------|
| **User Name** | 47% down, centered | 32px bold | Black |
| **Wallet Address** | 54% down, centered | 16px regular | Gray (#555555) |
| **Final Score** | 68.5% down, 51% right | 27px bold | Black |
| **Timestamp** | 82% down, centered | 20px regular | Black |

**Timestamp Format:** "January 15, 2025" (IST timezone)  
**Output:** PNG bytes (for base64 encoding or IPFS upload)

---

## NFT Metadata Generation

### MetadataService

**File:** `backend/app/services/metadata_service.py`  
**Purpose:** Generate Metaplex-compliant NFT metadata with embedded certificate image

```python
class MetadataService:
    def generate_metadata(
        course_id, user_id, quiz_score, 
        completion_percentage, final_score,
        wallet_address, user_name
    ) -> Dict[str, Any]:
```

### Metadata Flow

```
1. Generate certificate image (CertificateTemplate)
   ↓
2. Upload image to IPFS (if configured) or use data URI
   ↓
3. Create metadata JSON (Metaplex standard)
   ↓
4. Upload metadata to IPFS (optional)
   ↓
5. Return: {metadata, metadata_uri, image_uri, certificate_image}
```

### Metadata Structure

```json
{
  "name": "Data Structures Master NFT",
  "symbol": "SGN",
  "description": "Certificate of completion for Data Structures course on Signum",
  "image": "ipfs://Qm..." or "data:image/png;base64,...",
  "attributes": [
    {"trait_type": "Course", "value": "data-structures"},
    {"trait_type": "Quiz Score", "value": 90},
    {"trait_type": "Completion", "value": 95},
    {"trait_type": "Final Score", "value": 91}
  ],
  "properties": {
    "category": "certificate",
    "files": [{"uri": "ipfs://Qm...", "type": "image/png"}]
  }
}
```

### IPFS Integration (Pinata)

**Configuration (.env):**
```bash
PINATA_JWT=your_jwt_token
```

**Fallback:** If Pinata not configured, uses data URIs (base64 encoded images)


---

## Backend API

### POST /blockchain/mint

**Purpose:** Generate certificate metadata and image for Solana minting

**Request:**
```json
{
  "user_id": "firebase_uid_123",
  "course_id": "data-structures",
  "wallet_address": "SolanaWalletAddress...",
  "user_name": "John Doe"
}
```

**Validation:**
- Quiz score ≥ 85%
- Course completion ≥ 90%
- No anti-cheat violations

**Response:**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "quiz_score": 90,
    "completion_percentage": 95,
    "final_score": 91,
    "metadata": {
      "name": "Data Structures Master NFT",
      "symbol": "SGN",
      "image": "ipfs://Qm...",
      "attributes": [...]
    },
    "metadata_uri": "ipfs://Qm...",
    "certificate_image_url": "data:image/png;base64,..."
  }
}
```

---

## Frontend Implementation

### Mint Flow

**File:** `frontend/src/courses/data-structures/components/CertificationsContent.jsx`

```javascript
const handleMintNFT = async () => {
  // 1. Request metadata from backend
  const response = await fetch('/blockchain/mint', {
    method: 'POST',
    body: JSON.stringify({ 
      user_id, 
      course_id, 
      wallet_address, 
      user_name 
    })
  });
  
  // 2. Generate certificate PDA with userId
  const [certificatePda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('certificate'),
      wallet.publicKey.toBuffer(),
      Buffer.from(courseId),
      Buffer.from(userId)  // Multi-user support
    ],
    program.programId
  );
  
  // 3. Call Solana smart contract
  const tx = await program.methods
    .mintCertificate(
      courseId, 
      userId, 
      quizScore, 
      completion, 
      name, 
      symbol, 
      uri
    )
    .accounts({ 
      certificate: certificatePda,
      mint,
      // ... other accounts
    })
    .rpc();
  
  // 4. Save to Firebase
  await saveNFTStatusToFirebase(imageUrl, tx, mintAddress);
};
```

### Features

**Wallet Integration:**
- Phantom wallet connection
- Address storage in Firebase profile

**Eligibility Display:**
- Quiz score and completion percentage
- Final exam status
- Validation before minting

**Error Handling:**
- Duplicate transaction detection
- Insufficient score errors
- Wallet connection errors
- Insufficient SOL balance


---

## Security & Validation

### Eligibility Requirements

**Quiz Score:** ≥ 85%  
**Course Completion:** ≥ 90%  
**Anti-Cheat:** No violations detected  
**Final Exam:** Passed (if applicable)

### Dual Validation Layers

**1. Backend Validation** (`blockchain.py`)
- Verifies scores against Firestore database
- Checks anti-cheat violation status
- Returns error response if ineligible

**2. Smart Contract Validation** (`lib.rs`)
- Re-validates scores on-chain
- Enforces ≥ 85 quiz, ≥ 90 completion requirements
- Reverts transaction if validation fails

### Security Features

- No private keys stored on backend
- Client-side transaction signing (Phantom wallet)
- On-chain data immutability
- Multi-user support via userId-based PDA
- Certificate revocation capability

---

## System Constraints

**Certificate Uniqueness:**
- One certificate per user per course per wallet
- userId in PDA prevents wallet conflicts
- Multiple users can share same wallet safely

**Eligibility Calculation:**
- Final score = (quiz × 0.7) + (completion × 0.3)
- Both thresholds must be met independently
- Anti-cheat violations block certificate minting

**IPFS/Metadata:**
- Pinata JWT required for IPFS uploads
- Falls back to data URIs if IPFS not configured
- Certificate images generated server-side only

**Blockchain:**
- Solana Devnet only (testing environment)
- Requires SOL balance for transaction fees
- Transaction signing requires Phantom wallet
- PDAs are deterministic (same inputs = same address)

**Testing Features:**
- Certificate closure (returns rent to wallet)
- Available only in development mode
- Not available on production/mainnet

---

## Visual Diagrams

### Diagram 1: Certificate Minting Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│              CERTIFICATE MINTING WORKFLOW                           │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │  User completes  │
                    │  course (quiz +  │
                    │  all modules)    │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Navigate to         │
                  │  Certifications page │
                  └──────────┬───────────┘
                             │
                             ▼
               ┌─────────────────────────────┐
               │  Check Eligibility          │
               │  ├─ Quiz ≥ 85%?             │
               │  ├─ Completion ≥ 90%?       │
               │  └─ Anti-cheat OK?          │
               └──────────┬──────────────────┘
                          │
             ┌────────────┴─────────────┐
             │                          │
          ❌ NO                      ✅ YES
             │                          │
             ▼                          ▼
    ┌─────────────────┐      ┌──────────────────┐
    │ Show ineligible │      │ Enable "Mint NFT"│
    │ message         │      │ button           │
    └─────────────────┘      └────────┬─────────┘
                                      │
                                      │ User clicks "Mint NFT"
                                      ▼
                         ┌────────────────────────┐
                         │ Connect Phantom wallet │
                         └───────────┬────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │ Frontend: handleMintNFT()      │
                    └───────────┬────────────────────┘
                                │
      ┌─────────────────────────┴──────────────────────────┐
      │                                                     │
      ▼                                                     ▼
┌──────────────────────┐                      ┌────────────────────────┐
│ STEP 1:              │                      │ STEP 2:                │
│ Request Metadata     │                      │ Generate PDA           │
├──────────────────────┤                      ├────────────────────────┤
│ POST /blockchain/mint│                      │ PublicKey.find         │
│                      │                      │ ProgramAddressSync()   │
│ Body:                │                      │                        │
│ {                    │                      │ Seeds:                 │
│   user_id,           │                      │ ["certificate",        │
│   course_id,         │                      │  wallet,               │
│   wallet_address,    │                      │  courseId,             │
│   user_name          │                      │  userId]               │
│ }                    │                      │                        │
└──────────┬───────────┘                      └────────┬───────────────┘
           │                                           │
           ▼                                           │
┌──────────────────────────────────────┐              │
│ Backend Processing                   │              │
├──────────────────────────────────────┤              │
│ 1. Verify eligibility (quiz, etc)    │              │
│                                      │              │
│ 2. CertificateTemplate               │              │
│    .generate_certificate()           │              │
│    ├─ Load PNG template              │              │
│    ├─ Overlay: user name             │              │
│    ├─ Overlay: wallet address        │              │
│    ├─ Overlay: final score           │              │
│    └─ Overlay: timestamp             │              │
│    → Returns PNG bytes               │              │
│                                      │              │
│ 3. MetadataService                   │              │
│    .generate_metadata()              │              │
│    ├─ Upload image to IPFS/Pinata    │              │
│    │   (or data URI fallback)        │              │
│    ├─ Create metadata JSON           │              │
│    │   {                              │              │
│    │     name, symbol, description,   │              │
│    │     image: "ipfs://...",         │              │
│    │     attributes: [quiz, completion]│             │
│    │   }                              │              │
│    └─ Upload metadata to IPFS        │              │
│    → Returns metadata_uri            │              │
│                                      │              │
│ 4. Return response:                  │              │
│    {                                 │              │
│      eligible: true,                 │              │
│      quiz_score, completion,         │              │
│      final_score,                    │              │
│      metadata: {...},                │              │
│      metadata_uri: "ipfs://...",     │              │
│      certificate_image_url           │              │
│    }                                 │              │
└──────────┬───────────────────────────┘              │
           │                                           │
           │                                           │
           └───────────────┬───────────────────────────┘
                           │
                           ▼
               ┌───────────────────────────┐
               │ STEP 3:                   │
               │ Call Solana Smart Contract│
               └───────────┬───────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │ program.methods.mintCertificate(         │
        │   courseId,                              │
        │   userId,  // Multi-user support         │
        │   quizScore,                             │
        │   completionPercentage,                  │
        │   name,                                  │
        │   symbol,                                │
        │   metadataUri                            │
        │ )                                        │
        │ .accounts({                              │
        │   certificate: certificatePda,           │
        │   mint,                                  │
        │   recipient,                             │
        │   ...                                    │
        │ })                                       │
        │ .rpc()                                   │
        └──────────────┬───────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────────┐
        │ Solana Smart Contract Execution          │
        ├──────────────────────────────────────────┤
        │ lib.rs: mint_certificate()               │
        │                                          │
        │ 1. Validate eligibility on-chain:        │
        │    require!(quiz_score >= 85)            │
        │    require!(completion >= 90)            │
        │                                          │
        │ 2. Calculate final score:                │
        │    (quiz × 70 + completion × 30) / 100   │
        │                                          │
        │ 3. Create certificate account (PDA):     │
        │    {                                     │
        │      owner: wallet,                      │
        │      course_id,                          │
        │      user_id,                            │
        │      quiz_score,                         │
        │      completion_percentage,              │
        │      final_score,                        │
        │      mint_address,                       │
        │      minted_at: timestamp,               │
        │      is_revoked: false                   │
        │    }                                     │
        │                                          │
        │ 4. Mint NFT with metadata URI            │
        │    (Metaplex Token Metadata)             │
        │                                          │
        │ 5. Return transaction signature          │
        └──────────────┬───────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────────┐
        │ STEP 4:                                  │
        │ Save to Firebase                         │
        ├──────────────────────────────────────────┤
        │ POST /progress/nft-certificate           │
        │                                          │
        │ {                                        │
        │   user_id,                               │
        │   course_id,                             │
        │   nft_minted: true,                      │
        │   certificate_image_url,                 │
        │   transaction_signature,                 │
        │   mint_address,                          │
        │   timestamp                              │
        │ }                                        │
        └──────────────┬───────────────────────────┘
                       │
                       ▼
               ┌───────────────────┐
               │ SUCCESS!          │
               │                   │
               │ ✅ NFT minted      │
               │ ✅ Stored on-chain │
               │ ✅ Saved to Firebase│
               │ ✅ Display certificate│
               └───────────────────┘


═══════════════════════════════════════════════════════════════════════
                           DATA FLOW EXAMPLE
═══════════════════════════════════════════════════════════════════════

User: John Doe
Course: Data Structures
Quiz Score: 90%
Completion: 95%

         │
         ▼
Frontend checks eligibility → ✅ Pass
         │
         ▼
POST /blockchain/mint
  {
    user_id: "user123",
    course_id: "data-structures",
    wallet_address: "5Yq7...",
    user_name: "John Doe"
  }
         │
         ▼
Backend generates:
  ├─ Certificate Image (PNG)
  │  ├─ Name: "John Doe"
  │  ├─ Wallet: "5Yq7..."
  │  ├─ Score: "91%"
  │  └─ Date: "November 1, 2025"
  │
  ├─ Upload to IPFS → ipfs://QmABC123...
  │
  └─ Metadata JSON
     {
       "name": "Data Structures Master NFT",
       "symbol": "SGN",
       "image": "ipfs://QmABC123...",
       "attributes": [
         {"trait_type": "Quiz Score", "value": 90},
         {"trait_type": "Completion", "value": 95},
         {"trait_type": "Final Score", "value": 91}
       ]
     }
     Upload to IPFS → ipfs://QmXYZ789...
         │
         ▼
Frontend receives metadata_uri: "ipfs://QmXYZ789..."
         │
         ▼
Generate PDA:
  seeds = [
    "certificate",
    "5Yq7...",           // wallet
    "data-structures",   // courseId
    "user123"            // userId
  ]
  → PDA: "Cert8kL9..."
         │
         ▼
Call smart contract:
  program.methods.mintCertificate(
    "data-structures",
    "user123",
    90,
    95,
    "Data Structures Master NFT",
    "SGN",
    "ipfs://QmXYZ789..."
  )
         │
         ▼
Solana processes transaction:
  ├─ Validate: 90 ≥ 85 ✅
  ├─ Validate: 95 ≥ 90 ✅
  ├─ Calculate: (90×70 + 95×30)/100 = 91
  ├─ Create certificate account at PDA
  └─ Mint NFT with metadata URI
         │
         ▼
Transaction signature: "3Kz9..."
         │
         ▼
Save to Firebase:
  nft_certificates/user123_data-structures
  {
    nft_minted: true,
    certificate_image_url: "ipfs://QmABC123...",
    transaction_signature: "3Kz9...",
    mint_address: "NFTMint4X...",
    timestamp: "2025-11-01T12:00:00Z"
  }
         │
         ▼
Display certificate to user ✅
```

---

### Diagram 2: Multi-User PDA Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│            MULTI-USER PDA (Program Derived Address)                 │
└─────────────────────────────────────────────────────────────────────┘

Problem: What if multiple users share the same Phantom wallet?

┌──────────────────────────────────────────────────────────────────┐
│ WITHOUT userId in PDA (Old Approach)                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User A                   User B                                 │
│  ├─ user_id: "alice"      ├─ user_id: "bob"                     │
│  └─ wallet: "Wallet1..."  └─ wallet: "Wallet1..." (same!)       │
│                                                                  │
│  Both try to mint for "data-structures" course                  │
│                                                                  │
│  PDA seeds:                                                      │
│  ├─ "certificate"                                                │
│  ├─ "Wallet1..."                                                 │
│  └─ "data-structures"                                            │
│                                                                  │
│  Generated PDA: "CertXYZ..."                                     │
│                                                                  │
│  ❌ CONFLICT: Same PDA for both users!                           │
│  ❌ Second mint transaction fails: "Account already exists"      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────┐
│ WITH userId in PDA (Current Approach)                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User A                                                          │
│  ├─ user_id: "alice"                                             │
│  ├─ wallet: "Wallet1..."                                         │
│  └─ course: "data-structures"                                    │
│                                                                  │
│  PDA seeds:                                                      │
│  ├─ "certificate"                                                │
│  ├─ "Wallet1..."                                                 │
│  ├─ "data-structures"                                            │
│  └─ "alice"  ← Unique identifier                                 │
│                                                                  │
│  Generated PDA: "CertABC..."                                     │
│                                                                  │
│  ✅ Certificate minted successfully                              │
│                                                                  │
│  ───────────────────────────────────────────────────────────     │
│                                                                  │
│  User B                                                          │
│  ├─ user_id: "bob"                                               │
│  ├─ wallet: "Wallet1..." (same wallet!)                          │
│  └─ course: "data-structures"                                    │
│                                                                  │
│  PDA seeds:                                                      │
│  ├─ "certificate"                                                │
│  ├─ "Wallet1..."                                                 │
│  ├─ "data-structures"                                            │
│  └─ "bob"  ← Different userId                                    │
│                                                                  │
│  Generated PDA: "CertDEF..."  (different from User A!)           │
│                                                                  │
│  ✅ Certificate minted successfully                              │
│                                                                  │
│  ───────────────────────────────────────────────────────────     │
│                                                                  │
│  Result:                                                         │
│  ✅ Both users have unique certificates                          │
│  ✅ Same wallet, different PDAs                                  │
│  ✅ No conflicts                                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                        PDA GENERATION LOGIC
═══════════════════════════════════════════════════════════════════════

Frontend (JavaScript):
┌──────────────────────────────────────────────────────────────────┐
│ const [certificatePda, bump] = PublicKey.findProgramAddressSync( │
│   [                                                              │
│     Buffer.from('certificate'),                                  │
│     wallet.publicKey.toBuffer(),                                 │
│     Buffer.from(courseId),                                       │
│     Buffer.from(userId)  // ← Added for uniqueness               │
│   ],                                                             │
│   programId                                                      │
│ );                                                               │
└──────────────────────────────────────────────────────────────────┘

Smart Contract (Rust):
┌──────────────────────────────────────────────────────────────────┐
│ #[account(                                                       │
│   init,                                                          │
│   seeds = [                                                      │
│     b"certificate",                                              │
│     recipient.key().as_ref(),                                    │
│     course_id.as_bytes(),                                        │
│     user_id.as_bytes()  // ← Added for uniqueness                │
│   ],                                                             │
│   bump                                                           │
│ )]                                                               │
│ pub certificate: Account<'info, Certificate>                     │
└──────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                         REAL-WORLD EXAMPLE
═══════════════════════════════════════════════════════════════════════

Scenario: Family sharing one Phantom wallet

Family Wallet: "5Yq7mKGPXJb..."

├─ Dad (user_id: "dad123")
│  Completes: Data Structures
│  PDA: ["certificate", "5Yq7...", "data-structures", "dad123"]
│  Certificate: ✅ Minted at CertABC...
│
├─ Mom (user_id: "mom456")
│  Completes: Data Structures (same course!)
│  PDA: ["certificate", "5Yq7...", "data-structures", "mom456"]
│  Certificate: ✅ Minted at CertDEF... (different PDA!)
│
└─ Kid (user_id: "kid789")
   Completes: Data Structures (same course!)
   PDA: ["certificate", "5Yq7...", "data-structures", "kid789"]
   Certificate: ✅ Minted at CertGHI... (different PDA!)

All three certificates exist on-chain simultaneously! ✅
```
