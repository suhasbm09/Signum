# 🎓 Signum - AI-Powered Learning Platform with Blockchain Credentials

**"Unforgettable Learning. Unforgeable Credentials"**

A next-generation e-learning platform combining **AI-powered personalized tutoring**, **anti-cheat protection**, and **blockchain-verified NFT certificates** for computer science education.

---

## 🌟 Key Features

### 🎨 Interactive Visualizations 
- **5 Live Visualizers** - Binary Search Trees, Stacks, Queues, 2D Arrays, 1D Arrays
- **Step-by-Step Animations** - Watch algorithms execute in real-time
- **Pseudocode Highlighting** - Synchronized code execution display
- **Interactive Controls** - Manipulate data structures directly
- **Algorithm Demonstrations** - Search, traversal, min/max operations

### 🤖 AI Tutor Assistant 
- **Context-Aware Q&A** - Powered by Google Gemini 2.5 Flash
- **Screen Content Awareness** - Like MS Edge Copilot, knows what you're viewing
- **Voice Input** - Speech-to-text for natural conversation
- **RAG Implementation** - Retrieves course-specific knowledge for accurate answers
- **Structured Responses** - Bullet points, examples, and step-by-step explanations

### 🛡️ Anti-Cheat System 
- **Real-time Violation Detection** - Tab switching, copy/paste, DevTools monitoring
- **3-Strike Policy** - Users blocked after 3 violations
- **Firebase-Backed** - Persistent violation tracking
- **NFT Eligibility Enforcement** - Only clean records can mint certificates
- **5 Detection Methods** - Tab switch, right-click, keyboard shortcuts, DevTools, paste

### 💻 Coding Challenges 
- **AI-Powered Evaluation** - Google Gemini analyzes code correctness
- **Real-Time Feedback** - Instant analysis with suggestions
- **Anti-Cheat Protected** - Same monitoring as quizzes
- **Test Case Validation** - Automated solution verification
- **50% of Final Exam** - Combines with quiz score for certification

### 🔗 Blockchain NFT Certificates 
- **Solana Devnet** - Decentralized certificate minting
- **Metaplex Standard** - Compatible with all major NFT marketplaces
- **Phantom Wallet Integration** - Seamless blockchain authentication
- **Trustless Verification** - Full wallet address displayed for Solana Explorer verification
- **Social Sharing** - LinkedIn and X (Twitter) integration
- **Pinata IPFS** - Decentralized metadata storage (production-ready)

### 📊 Progress Tracking
- **Firebase Realtime Database** - Cloud-based progress persistence
- **Multi-Metric System** - Quiz score, coding completion, violations
- **Visual Progress Bars** - Real-time completion tracking
- **Time-Based Module Completion** - Ensures genuine engagement (20-90s minimum)
- **Course Completion Logic** - Quiz ≥85%, Completion ≥90%, Zero Violations

### 🎨 Responsive Full-Width Layout
- **Adaptive Content Display** - Expands to full screen when sidebar is collapsed
- **Optimized Reading Experience** - Maximum space for visualizations and code
- **Smooth Transitions** - Animated sidebar toggle with content reflow
- **Mobile Responsive** - Works seamlessly across all screen sizes

---

## � Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.10+**
- **Firebase Account** ([Create here](https://console.firebase.google.com/))
- **Google Gemini API Key** ([Get here](https://makersuite.google.com/app/apikey))
- **Phantom Wallet** ([Install here](https://phantom.app/)) - For NFT minting

### 1. Clone Repository
```bash
git clone git@github.com:suhasbm09/Signum.git
cd Signum
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

**Create `.env` file** in `frontend/` directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND_URL=http://localhost:8000
```

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

**Create `.env` file** in `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
PINATA_API_KEY=your_pinata_api_key (optional for NFT images)
PINATA_SECRET_KEY=your_pinata_secret (optional)
```

**Add Firebase Service Account Key:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `serviceAccountKey.json` in `backend/` directory

### 4. Solana Program Deployment (Optional - For NFT Minting)
```bash
cd solana/program
npm install
anchor build
anchor deploy --provider.cluster devnet
```

**Copy Program ID** from deployment output and update:
- `frontend/src/courses/data-structures/components/CertificationsContent.jsx`
- `backend/app/services/blockchain_service.py`

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```
✅ Backend runs on: `http://localhost:8000`  
📖 API Docs: `http://localhost:8000/docs`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend runs on: `http://localhost:5173`

---

## 📁 Project Structure

```
Signum/
├── frontend/                      # React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # UI Components
│   │   │   ├── AI/              # AI Chat components
│   │   │   ├── Header.jsx       # Navigation
│   │   │   ├── Toast.jsx        # Notifications
│   │   │   └── ...
│   │   ├── contexts/            # State Management
│   │   │   ├── AIContext.jsx   # AI chat state
│   │   │   └── ProgressContext.jsx  # User progress
│   │   ├── pages/               # Page Components
│   │   │   ├── Dashboard.jsx   # Course dashboard
│   │   │   ├── QuizPage.jsx    # Anti-cheat quizzes
│   │   │   ├── CodingChallengePage.jsx
│   │   │   └── Profile.jsx
│   │   ├── courses/             # Course Content
│   │   │   └── data-structures/
│   │   │       ├── content.js   # Lessons
│   │   │       ├── components/  # Course-specific UI
│   │   │       └── visualizations/
│   │   ├── services/            # API Communication
│   │   │   ├── progressService.js
│   │   │   └── ai/aiService.js
│   │   ├── firebase/            # Firebase Config
│   │   └── config/
│   │       └── features.js      # Feature flags
│   └── .env                     # Environment variables
│
├── backend/                      # FastAPI + Python
│   ├── app/
│   │   ├── routes/              # API Endpoints
│   │   │   ├── ai.py           # AI chat endpoints
│   │   │   ├── auth.py         # Google OAuth
│   │   │   ├── quiz.py         # Quiz submission
│   │   │   ├── coding_challenge.py
│   │   │   ├── blockchain.py   # NFT minting
│   │   │   └── simple_progress.py  # Progress tracking
│   │   ├── services/            # Business Logic
│   │   │   ├── ai/
│   │   │   │   ├── ai_service.py  # Gemini integration
│   │   │   │   ├── coding_evaluation_service.py
│   │   │   │   └── course_content_store.py  # RAG
│   │   │   ├── blockchain_service.py  # Solana integration
│   │   │   ├── metadata_service.py    # NFT metadata
│   │   │   ├── firebase_admin.py      # Firebase
│   │   │   └── simple_progress_service.py
│   │   └── models/              # Data Models
│   ├── .env                     # Environment variables
│   ├── serviceAccountKey.json   # Firebase Admin SDK
│   └── requirements.txt
│
├── solana/program/               # Blockchain Smart Contract
│   ├── programs/program/
│   │   └── src/lib.rs          # Anchor Rust program
│   ├── target/idl/             # Program IDL
│   ├── Anchor.toml             # Anchor config
│   └── tests/program.ts        # Integration tests
│
├── DOCS/                        # 📚 Comprehensive Documentation
│   ├── AI_IMPLEMENTATION.md    # Full AI system docs
│   ├── BLOCKCHAIN_IMPLEMENTATION.md  # NFT minting flow
│   ├── ANTI_CHEAT_SYSTEM.md   # Security measures
│   ├── INTERACTIVE_LEARNING.md  # Future visualizations
│   └── README.md               # This file
│
└── .gitignore                  # Sensitive files excluded
```

---

## �️ Tech Stack

### Frontend
- **React 19** - Modern UI framework with latest features
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first styling framework
- **Monaco Editor** - VS Code-powered code editing
- **Firebase Authentication** - Google OAuth integration
- **Anchor (Solana)** - Blockchain wallet integration
- **Phantom Wallet SDK** - NFT wallet connection

### Backend
- **FastAPI** - High-performance Python API
- **Google Gemini 2.5 Flash** - Advanced AI model
- **Firebase Admin SDK** - Database & auth
- **Solana Web3.js** - Blockchain RPC
- **Metaplex** - NFT standard compliance
- **Pinata** - IPFS metadata storage

### Blockchain
- **Solana Devnet** - Fast, low-cost blockchain
- **Anchor Framework** - Rust smart contract framework
- **Metaplex Token Metadata** - NFT standard
- **Phantom Wallet** - User wallet integration

---

## 🎯 Course Completion Requirements

To earn an NFT certificate, students must meet **all three criteria**:

| Requirement | Minimum | Enforcement |
|------------|---------|-------------|
| **Quiz Score** | ≥85% | Backend validation |
| **Course Completion** | ≥90% | Firebase progress check |
| **Anti-Cheat Violations** | 0 | Firestore violation log |

**Final Score Calculation:**
```
final_score = (quiz_score * 0.5) + (coding_score * 0.5)
```

---

## 🔐 Security & Privacy

### Sensitive Files (Never Commit!)
- ✅ `.env` files (Frontend & Backend)
- ✅ `serviceAccountKey.json` (Firebase Admin SDK)
- ✅ Wallet private keys
- ✅ API keys

All sensitive files are protected by `.gitignore`.

### Anti-Cheat Protection
- Tab/window switching detection
- Copy/paste blocking
- Right-click prevention
- Keyboard shortcut blocking (Ctrl+C, Ctrl+V, F12, etc.)
- DevTools detection
- 3-strike blocking policy

### Blockchain Security
- Client-side wallet signing (private keys never leave browser)
- Phantom Wallet encryption
- Solana Devnet for testing (production uses Mainnet in future)
- Metaplex verified metadata standard

---

## 📊 Current Implementation Status

| Feature | Status | Documentation |
|---------|--------|---------------|
| AI Tutor | ✅ LIVE | [AI_IMPLEMENTATION.md](AI_IMPLEMENTATION.md) |
| Anti-Cheat System | ✅ LIVE | [ANTI_CHEAT_SYSTEM.md](ANTI_CHEAT_SYSTEM.md) |
| Coding Challenges | ✅ LIVE | [AI_IMPLEMENTATION.md](AI_IMPLEMENTATION.md) |
| NFT Certificates | ✅ LIVE | [BLOCKCHAIN_IMPLEMENTATION.md](BLOCKCHAIN_IMPLEMENTATION.md) |
| Interactive Visualizations | ✅ LIVE | [INTERACTIVE_LEARNING.md](INTERACTIVE_LEARNING.md) |
| Progress Tracking | ✅ LIVE | Built-in |
| Social Sharing | ✅ LIVE | LinkedIn & X |
| Full-Width Layout | ✅ LIVE | Responsive Design |

---

## 📚 Documentation

Comprehensive documentation available in project root:

1. **[AI_IMPLEMENTATION.md](AI_IMPLEMENTATION.md)** - Complete AI system architecture, RAG implementation, voice input, coding evaluation
2. **[BLOCKCHAIN_IMPLEMENTATION.md](BLOCKCHAIN_IMPLEMENTATION.md)** - NFT minting flow, Solana integration, Metaplex metadata, wallet management
3. **[ANTI_CHEAT_SYSTEM.md](ANTI_CHEAT_SYSTEM.md)** - Detection methods, violation management, Firebase integration, NFT eligibility
4. **[INTERACTIVE_LEARNING.md](INTERACTIVE_LEARNING.md)** - Live visualizations: BST, Stack, Queue, 2D Arrays, 1D Arrays
5. **[README.md](README.md)** - This file (project overview & quick start)

---

## � Development Team

**Final Year B.Tech CSE Students**
- **Suhas B M** - Developer
- **Suhas B H** - Developer
- **Nischith S** - Developer
- **Rohan P** - Developer

---

## 🎓 Courses Available

### Data Structures Mastery ✅
**Status**: Fully Implemented  
**Topics**: Arrays (1D/2D), Stacks, Queues, Linked Lists, Trees (BST), Graphs, Hashing, Heaps  
**Interactive Visualizations**: 5 live visualizers with step-by-step algorithm demonstrations  
**Assessments**: 100+ Quiz Questions, 5+ Coding Challenges  
**NFT Certificate**: Available on Solana Devnet

### Solana Blockchain Development 🔜
**Status**: Planned  
**Topics**: Smart Contracts, Anchor Framework, Token Programs, NFTs  
**Assessments**: Hands-on blockchain coding challenges

---

## 🚧 Future Roadmap

### Q1 2026
- [ ] Additional interactive visualizers (Graphs, Heaps, Hash Tables)
- [ ] Advanced sorting algorithm animations (QuickSort, MergeSort)
- [ ] Additional courses (Algorithms, System Design, Operating Systems)

### Q2 2026
- [ ] Mobile app (React Native)
- [ ] Peer code reviews and discussion forums
- [ ] Instructor dashboard with analytics

---

## 🐛 Troubleshooting

### Backend fails to start
```bash
# Check Python version
python --version  # Must be 3.10+

# Install dependencies
pip install -r backend/requirements.txt

# Verify .env file exists
ls backend/.env
```

### Frontend build errors
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Phantom Wallet not connecting
1. Ensure Phantom extension is installed: https://phantom.app/
2. Check browser console for errors
3. Switch wallet network to "Devnet" in Phantom settings
4. Refresh page and try connecting again

### NFT minting fails
1. Verify Solana program is deployed: `anchor deploy`
2. Check program ID matches in `CertificationsContent.jsx`
3. Ensure wallet has SOL for gas fees (get devnet SOL from faucet)
4. Confirm quiz score ≥85%, completion ≥90%, violations = 0

---

## 📝 License

© 2025 Signum Learning Platform  
All Rights Reserved

**Academic Project** - Final Year B.Tech CSE  
For educational purposes only.

---

## 📞 Contact & Support

For questions, issues, or contributions:
- **GitHub Issues**: [Create an issue](https://github.com/suhasbm09/issues)
- **Email**: suhasbm2004@gmail.com
- **Documentation**: See comprehensive .md files in project root

---

**Built with ❤️ by the Signum Team**  
_Empowering learners with AI, protecting integrity with anti-cheat, and verifying achievement with blockchain._

