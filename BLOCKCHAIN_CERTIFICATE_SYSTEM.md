# 🏆 Signum Blockchain Certificate System - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Smart Contract Implementation](#smart-contract-implementation)
4. [Certificate Template System](#certificate-template-system)
5. [NFT Metadata Generation](#nft-metadata-generation)
6. [Backend API Endpoints](#backend-api-endpoints)
7. [Frontend Implementation](#frontend-implementation)
8. [Security & Validation](#security--validation)
9. [Deployment Guide](#deployment-guide)

---

## 🎯 Overview

Signum's blockchain certificate system mints NFT certificates on Solana Devnet when users complete courses with required scores. The system uses:
- **Solana Smart Contract** (Anchor framework) for on-chain certification
- **Metaplex Token Metadata** for NFT standards
- **Certificate Templates** (Pillow/PIL) for personalized certificate images
- **IPFS (Pinata)** for decentralized metadata storage
- **Phantom Wallet** integration for user authentication

### Key Features
- ✅ On-chain certificate minting via Solana smart contract
- ✅ Dynamic certificate image generation with user data
- ✅ NFT metadata with course scores and completion data
- ✅ Phantom wallet integration for Solana transactions
- ✅ Multi-user support on same wallet (userId-based PDA)
- ✅ Eligibility validation (quiz ≥85%, completion ≥90%)
- ✅ Certificate revocation support
- ✅ Testing mode for development

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  File: CertificationsContent.jsx                                │
│  ├── Phantom Wallet Connection                                  │
│  ├── Eligibility Checking                                       │
│  ├── Solana Transaction Execution                               │
│  ├── Certificate Display                                        │
│  └── State Management (minting, NFT status)                     │
│                                                                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                        HTTP POST Request
                     localhost:8000/blockchain/mint
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                     BACKEND (FastAPI)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Endpoint: POST /blockchain/mint                                │
│  ├── Verifies eligibility (quiz, completion)                   │
│  ├── Calls MetadataService.generate_metadata()                 │
│  ├── Calls CertificateTemplate.generate_certificate()          │
│  └── Returns metadata URI + certificate image                  │
│                                                                  │
│  Files:                                                         │
│  ├── app/routes/blockchain.py                                  │
│  ├── app/services/metadata_service.py                          │
│  └── app/services/certificate_template.py                      │
│                                                                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    Certificate Image + Metadata
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                 SOLANA BLOCKCHAIN                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Smart Contract: solana/program/programs/program/src/lib.rs     │
│  ├── Program ID: 2EWf5TXq3jW8iQ1yuQorrgmaBc4Wjd8PMwDEBCWod5tp   │
│  ├── Instruction: mint_certificate()                            │
│  ├── Validates eligibility (score ≥85, completion ≥90)         │
│  ├── Mints NFT with metadata URI                               │
│  └── Stores certificate data on-chain                          │
│                                                                  │
│  PDA Derivation:                                                │
│  seeds = ["certificate", wallet, courseId, userId]             │
│  (userId ensures unique certificate per user per wallet)        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Smart Contract Implementation

### File: `solana/program/programs/program/src/lib.rs`

#### Program ID
```rust
declare_id!("2EWf5TXq3jW8iQ1yuQorrgmaBc4Wjd8PMwDEBCWod5tp");
```

#### Instruction: mint_certificate()

```rust
pub fn mint_certificate(
    ctx: Context<MintCertificate>,
    course_id: String,
    user_id: String,              // ← Added for multi-user support
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
    certificate.user_id = user_id;  // ← Stored on-chain
    certificate.quiz_score = quiz_score;
    certificate.completion_percentage = completion_percentage;
    certificate.final_score = final_score;
    // ... rest of minting logic
}
```

#### PDA (Program Derived Address) Derivation

**IMPORTANT**: The PDA now includes `userId` to support multiple users on the same wallet:

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
            user_id.as_bytes()             // User ID ← Added for uniqueness
        ],
        bump
    )]
    pub certificate: Account<'info, Certificate>,
```

**Why userId in PDA?**
- Without userId: One wallet = One certificate per course (conflict if different users)
- With userId: Multiple users can use same wallet, each gets unique certificate
- Example: `wallet1 + data-structures + user123` vs `wallet1 + data-structures + user456`

#### Certificate Account Structure

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

#### Other Instructions

```rust
// Verify certificate (check not revoked)
pub fn verify_certificate(ctx: Context<VerifyCertificate>) -> Result<()> {
    let certificate = &ctx.accounts.certificate;
    require!(!certificate.is_revoked, ErrorCode::CertificateRevoked);
    Ok(())
}

// Close certificate (testing only - returns rent)
pub fn close_certificate(ctx: Context<CloseCertificate>) -> Result<()> {
    Ok(())
}
```

#### Error Codes

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

## 🖼️ Certificate Template System

### File: `backend/app/services/certificate_template.py`

Generates personalized certificate images using Pillow (PIL) and course-specific PNG templates.

#### Template Structure

```
backend/app/templates/certificates/
├── data-structures/
│   └── certificate_template.png  (976 x 693px)
```

#### CertificateTemplate Class

```python
class CertificateTemplate:
    def __init__(self):
        self.width = 1200
        self.height = 850
        # Load DejaVu fonts
        self.name_font = ImageFont.truetype(..., 32)
        self.score_font = ImageFont.truetype(..., 27)
        self.wallet_font = ImageFont.truetype(..., 16)
        self.text_font = ImageFont.truetype(..., 20)

    def generate_certificate(
        self,
        course_id: str,
        wallet_address: str,
        final_score: int,
        timestamp: str,
        user_name: str
    ) -> bytes:
        # Returns PNG bytes
```

#### Dynamic Fields Overlaid

1. **User Name** (Position: 47% down, centered)
   - Font: 32px bold
   - Color: Black (#000000)
   - Position: Below "This is to certify that"

2. **Wallet Address** (Position: 54% down, centered)
   - Font: 16px regular
   - Color: Gray (#555555)
   - Full address displayed for blockchain verification

3. **Final Score** (Position: 68.5% down, 51% right)
   - Font: 27px bold
   - Color: Black (#000000)
   - Format: "85%" appended to "with overall score"

4. **Timestamp** (Position: 82% down, centered)
   - Font: 20px regular
   - Color: Black (#000000)
   - Format: "January 15, 2025" (IST timezone)
   - Location: In "Certified on [date]" section

#### Certificate Image Output

- **Format**: PNG
- **Return**: Bytes (for base64 encoding or IPFS upload)
- **Size**: 976 x 693px (from template)
- **Use Case**: Embedded in NFT metadata as image URI

---

## 📝 NFT Metadata Generation

### File: `backend/app/services/metadata_service.py`

Generates Metaplex-compliant NFT metadata JSON with embedded certificate image.

#### MetadataService Class

```python
class MetadataService:
    def __init__(self):
        self.template_generator = CertificateTemplate()
        self.use_ipfs = bool(os.getenv('PINATA_JWT'))
        
    def generate_metadata(...) -> Dict[str, Any]:
        # Returns: {metadata, metadata_uri, image_uri}
```

#### Generate Metadata Flow

```python
def generate_metadata(
    self,
    course_id: str,
    user_id: str,
    quiz_score: int,
    completion_percentage: int,
    final_score: int,
    wallet_address: str,
    user_name: str
) -> Dict[str, Any]:
    # 1. Generate certificate image
    certificate_image = self.template_generator.generate_certificate(...)
    
    # 2. Upload image to IPFS (or use data URI)
    if self.use_ipfs:
        image_uri = self._upload_image_sync(...)
    else:
        image_uri = f"data:image/png;base64,{base64_image}"
    
    # 3. Create metadata JSON
    metadata = {
        "name": f"{course_name} NFT",
        "symbol": "SGN",
        "description": "Certificate of completion for...",
        "image": image_uri,  # Certificate image
        "attributes": [
            {"trait_type": "Course", "value": course_id},
            {"trait_type": "Quiz Score", "value": quiz_score},
            {"trait_type": "Completion", "value": completion_percentage},
            {"trait_type": "Final Score", "value": final_score},
        ],
        "properties": {
            "category": "certificate",
            "files": [{"uri": image_uri, "type": "image/png"}]
        }
    }
    
    # 4. Upload metadata to IPFS (optional)
    metadata_uri = self._upload_metadata_sync(metadata)
    
    return {
        "metadata": metadata,
        "metadata_uri": metadata_uri,  # Used in Solana mint
        "image_uri": image_uri,        # For display
        "certificate_image": base64_image
    }
```

#### IPFS Integration (Pinata)

**Configuration** (`.env`):
```env
PINATA_API_KEY=your_key
PINATA_SECRET_API_KEY=your_secret
PINATA_JWT=your_jwt  # Preferred
```

**Fallback**: If Pinata not configured, uses data URIs (base64 encoded images)

---

## 🌐 Backend API Endpoints

### File: `backend/app/routes/blockchain.py`

#### POST /blockchain/mint

**Purpose**: Generate certificate metadata and image for Solana minting

**Request**:
```json
{
  "user_id": "firebase_uid_123",
  "course_id": "data-structures",
  "wallet_address": "SolanaWalletAddress...",
  "user_name": "John Doe"
}
```

**Response**:
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
      "description": "...",
      "image": "ipfs://Qm...",
      "attributes": [...]
    },
    "metadata_uri": "ipfs://Qm...",
    "certificate_image_url": "data:image/png;base64,..."
  }
}
```

**Validation**:
- Checks quiz score ≥ 85%
- Checks course completion ≥ 90%
- Verifies anti-cheat eligibility
- Returns error if requirements not met

---

## 💻 Frontend Implementation

### File: `frontend/src/courses/data-structures/components/CertificationsContent.jsx`

#### Key Features

1. **Wallet Integration**
   - Phantom wallet connection
   - Wallet state management (connected/disconnected)
   - Address storage in Firebase

2. **Eligibility Checking**
   - Displays quiz score and completion percentage
   - Shows final exam status
   - Validates before allowing mint

3. **Mint NFT Flow**
   ```javascript
   const handleMintNFT = async () => {
     // 1. Request metadata from backend
     const metadataResponse = await fetch('http://localhost:8000/blockchain/mint', {
       method: 'POST',
       body: JSON.stringify({ user_id, course_id, wallet_address, user_name })
     });
     
     // 2. Generate certificate PDA with userId
     const [certificatePda] = PublicKey.findProgramAddressSync(
       [
         Buffer.from('certificate'),
         provider.wallet.publicKey.toBuffer(),
         Buffer.from(courseId),
         Buffer.from(userId)  // ← Multi-user support
       ],
       program.programId
     );
     
     // 3. Call Solana program
     const tx = await program.methods
       .mintCertificate(courseId, userId, quizScore, completion, name, symbol, uri)
       .accounts({ certificate: certificatePda, mint, ... })
       .rpc();
     
     // 4. Save to Firebase
     await saveNFTStatusToFirebase(imageUrl, tx, mintAddress);
   };
   ```

4. **PDA Derivation (Frontend)**
   - Seeds: `["certificate", wallet, courseId, userId]`
   - Matches smart contract PDA derivation
   - Ensures uniqueness per user

5. **Error Handling**
   - Duplicate transaction detection ("already been processed")
   - Quiz score too low
   - Completion too low
   - Wallet errors
   - Insufficient SOL

6. **State Management**
   - `nftMinted`: Boolean flag for existing certificate
   - `minting`: Loading state during transaction
   - `nftImageUrl`: Certificate image for display
   - `walletConnected`: Phantom wallet state

#### Firebase Integration

**Stores**:
- NFT status (minted/not minted)
- Certificate image URL
- Transaction signature
- Mint address
- Timestamp

**Backend Endpoints**:
- `GET /progress/nft-certificate/:userId/:courseId` - Load NFT status
- `POST /progress/nft-certificate` - Save NFT status
- `DELETE /progress/nft-certificate/:userId/:courseId` - Delete NFT status

---

## 🔒 Security & Validation

### Eligibility Requirements

1. **Quiz Score**: ≥ 85%
2. **Course Completion**: ≥ 90%
3. **Anti-Cheat**: No violations detected
4. **Final Exam**: Passed (if applicable)

### Validation Layers

1. **Backend Validation** (`blockchain.py`)
   - Verifies scores against database
   - Checks anti-cheat status
   - Returns error if ineligible

2. **Smart Contract Validation** (`lib.rs`)
   - Re-validates scores on-chain
   - Enforces >= 85 and >= 90 requirements
   - Reverts transaction if validation fails

### Security Features

- ✅ No private keys stored on backend
- ✅ Client-side signing (Phantom wallet)
- ✅ On-chain data immutability
- ✅ Certificate revocation support
- ✅ Testing mode (can close certificates)
- ✅ Multi-user support (userId-based uniqueness)

---

## 🚀 Deployment Guide

### 1. Smart Contract Deployment

```bash
cd solana/program
anchor build
anchor deploy
# Copy new IDL to frontend
cp target/idl/signum_certificate.json ../frontend/src/signum_certificate_idl.json
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Configure .env
echo "GEMINI_API_KEY=your_key" >> .env
echo "PINATA_JWT=your_jwt" >> .env

# Run backend
uvicorn app.main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Update IDL file after smart contract deployment
# File: src/signum_certificate_idl.json

# Run frontend
npm run dev
```

### 4. Testing

1. Connect Phantom wallet (Devnet)
2. Complete course (quiz + all modules)
3. Navigate to Certifications page
4. Click "Mint NFT Certificate"
5. Approve transaction in Phantom
6. View certificate in wallet

---

## 📊 Data Flow Summary

```
1. User completes course → Scores saved to Firebase
2. User visits Certifications page → Frontend checks eligibility
3. User clicks "Mint NFT" → Frontend requests metadata from backend
4. Backend generates certificate image → Overlays user data on template
5. Backend creates metadata JSON → Embeds certificate image
6. Backend returns metadata_uri → Frontend receives data
7. Frontend calls Solana smart contract → Mint transaction sent
8. Solana program validates → Checks scores, mints NFT
9. Certificate NFT minted → User receives in Phantom wallet
10. Certificate displayed → Image shown on frontend
```

---

## 🏷️ File Map

### Smart Contract
- `solana/program/programs/program/src/lib.rs` - Anchor program
- `solana/program/Anchor.toml` - Anchor configuration
- `frontend/src/signum_certificate_idl.json` - IDL for frontend

### Backend
- `backend/app/routes/blockchain.py` - Mint endpoint
- `backend/app/services/metadata_service.py` - Metadata generation
- `backend/app/services/certificate_template.py` - Image generation
- `backend/app/templates/certificates/` - PNG templates

### Frontend
- `frontend/src/courses/data-structures/components/CertificationsContent.jsx` - Mint UI
- `frontend/src/contexts/ProgressContext.jsx` - Progress state
- `frontend/src/services/progressService.js` - Firebase communication

---

## 🎉 Summary

Signum's blockchain certificate system provides:
- ✅ On-chain NFT certification via Solana smart contract
- ✅ Dynamic certificate images with user data
- ✅ Metaplex-compliant NFT metadata
- ✅ IPFS integration for decentralized storage
- ✅ Multi-user support on same wallet
- ✅ Eligibility validation (quiz ≥85%, completion ≥90%)
- ✅ Full testing and deployment workflow

**Ready for production. Ready for students. Ready for the blockchain.**
