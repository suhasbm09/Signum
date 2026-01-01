"""
AI Service - Simple, Scalable, Reusable
Three pipelines: Q&A with RAG, Evaluation, Anti-Cheat
"""

import os
import re
from typing import List, Dict, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv
from .rag.rag_service import rag_service

# Load environment variables
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
client = genai.Client(api_key=GEMINI_API_KEY)


class AIService:
    """Main AI Service with 3 pipelines"""
    
    def __init__(self):
        self.client = client
        self.model_name = GEMINI_MODEL
        
        # System prompt for Q&A - FORMATTED RESPONSES
        self.qa_system_prompt = """You are an AI tutor for Signum Learning Platform.

CRITICAL RESPONSE FORMAT - NEVER USE LONG PARAGRAPHS:

1. Start with ONE SHORT sentence (max 15 words) answering the question
2. Then use this structure:

**Key Points:**
• Bullet 1
• Bullet 2  
• Bullet 3

**Quick Example:**
```
[code or simple example]
```

**Why It Matters:**
One sentence explanation

**Try This:** [Question to check understanding]

RULES:
❌ NO long paragraphs - NEVER more than 2 sentences in a row
❌ NO walls of text
❌ NO overly formal language
✅ Use bullets, numbered lists, code blocks
✅ Keep each point to 1-2 lines MAX
✅ Be conversational and friendly
✅ Use emojis for visual breaks (📌 💡 ⚠️)

SPECIAL: NFT Certificate & Blockchain Questions
If the user asks about "certificate", "NFT", "minting", "blockchain", or "how to mint":

**Step-by-Step NFT Minting Guide:**

📋 **Prerequisites:**
• Complete 100% of all course modules
• Score 85%+ on the final quiz
• Complete the coding challenge
• Install Phantom wallet extension

👛 **Step 1: Set Up Phantom Wallet**
• Visit phantom.app and install browser extension
• Create new wallet & save recovery phrase securely
• ⚠️ Never share your recovery phrase!

💰 **Step 2: Get Free Devnet SOL**
• Go to faucet.solana.com
• Paste your wallet address
• Request 1-2 SOL (free test tokens)

🎨 **Step 3: Connect & Mint**
• Click "Connect Phantom" on certificate page
• Approve connection in popup
• Click "Mint Achievement NFT"
• Approve transaction (~0.01 SOL fee)
• Wait 30 seconds for confirmation

✅ **Step 4: View Your NFT**
• Open Phantom wallet
• Go to "Collectibles" tab
• See your certificate NFT!

💡 **Pro Tips:**
• Certificate is minted on Solana blockchain
• Permanently verifiable proof of achievement
• Can share on LinkedIn/Twitter
• Free to mint (only gas fees on Devnet)

🔗 **Useful Links:**
• Phantom: phantom.app
• Faucet: faucet.solana.com

Current Page Context: {context}
Screen Content: {screen_content}
"""
    
    # ============ PIPELINE 1: Q&A with RAG ============
    def is_in_scope(self, message: str, context: str = "", screen_content: str = "") -> bool:
        """Strict scope guard.

        IMPORTANT: We never send unrelated questions to Gemini.

        Logic:
        - Allow obvious Signum/platform/course questions (keyword match)
        - Otherwise require RAG similarity to be strong enough
        - If index is missing, fail closed (out-of-scope) to avoid hallucinations
        """

        in_scope, _reason = rag_service.in_scope(
            message=message,
            context=context,
            screen_content=screen_content,
        )
        return in_scope

    def out_of_scope_response(self) -> Dict:
        return {
            "success": True,
            "response": (
                "I can only help with Signum courses and features.\n\n"
                "**Try asking about:**\n"
                "• Course concepts (e.g., arrays, stacks, queues)\n"
                "• Quizzes and scoring\n"
                "• Coding challenges and test cases\n"
                "• Certificates / NFT minting on Solana\n"
            ),
            "filtered": "out_of_scope"
        }

    async def chat(
        self, 
        message: str, 
        context: str = "General Learning",
        screen_content: str = "",
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Q&A pipeline with course content awareness
        
        Args:
            message: User's question
            context: Current page/course (e.g., "Data Structures - Arrays")
            screen_content: Content visible on screen (like Copilot's window awareness)
            conversation_history: Previous messages
            
        Returns:
            Dict with success, response, context
        """
        try:
            # STEP 0: Scope guard (skip Gemini call if out-of-scope)
            if not self.is_in_scope(message=message, context=context, screen_content=screen_content):
                return self.out_of_scope_response()

            # STEP 1: Get relevant course content (RAG)
            rag_context, sources, _best_distance = rag_service.retrieve(
                question=message,
                context=context,
                screen_content=screen_content,
            )
            
            # STEP 2: Build system prompt with ALL context
            system_prompt = self.qa_system_prompt.format(
                context=context,
                screen_content=screen_content[:1500] if screen_content else "No screen content provided"
            )

            system_prompt += (
                "\n\nCITATIONS RULE: If you used any provided sources, end with **Sources:** and list the source IDs you used (e.g., S1, S2). "
                "Never invent sources."
            )
            
            # Add course content if found
            if rag_context:
                system_prompt += f"\n\n**Relevant Signum Material (RAG):**\n{rag_context}\n"
                system_prompt += "Use this material to answer accurately. Prefer it over general knowledge.\n"
            
            # Build conversation
            full_prompt = f"{system_prompt}\n\n"
            
            # Add recent history (last 3 messages only - keep it simple)
            if conversation_history:
                for msg in conversation_history[-3:]:
                    role = "User" if msg.get("role") == "user" else "Assistant"
                    full_prompt += f"{role}: {msg.get('content')}\n"
            
            # Add current message
            full_prompt += f"\nUser: {message}\nAssistant:"
            
            # Generate response
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=full_prompt
            )
            
            return {
                "success": True,
                "response": response.text,
                "context": context,
                "model": GEMINI_MODEL,
                "sources": [
                    {
                        "id": s.source_id,
                        "title": s.title,
                        "path": s.path,
                        "distance": s.distance,
                    }
                    for s in sources
                ],
            }
            
        except Exception as e:
            return {
                "success": False,
                "response": "Sorry, I encountered an error. Please try again.",
                "error": str(e)
            }
    
    # ============ PIPELINE 2: Evaluation ============
    async def evaluate_code(
        self,
        code: str,
        language: str,
        problem_id: str,
        expected_complexity: Dict[str, str]
    ) -> Dict:
        """
        Evaluation pipeline - for coding challenges
        Analyzes time/space complexity using AI
        
        Args:
            code: Student's code solution
            language: Programming language (python, java, cpp, c)
            problem_id: Problem identifier
            expected_complexity: Dict with 'time' and 'space' complexity
            
        Returns:
            Dict with complexity analysis and score
        """
        try:
            prompt = f"""Analyze the time and space complexity of the following code for solving the '{problem_id}' problem.

Code ({language}):
```{language}
{code}
```

Expected Complexity:
- Time: {expected_complexity['time']}
- Space: {expected_complexity['space']}

Provide a JSON response with:
1. "detected_time_complexity": The actual time complexity (e.g., "O(n)", "O(n^2)")
2. "detected_space_complexity": The actual space complexity
3. "matches_expected": true if complexity matches expected, false otherwise
4. "score": Score from 0-100 based on complexity analysis
5. "explanation": Brief explanation of the complexity
6. "suggestions": Any suggestions for optimization

Return ONLY valid JSON, no markdown formatting."""

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            analysis_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if analysis_text.startswith('```'):
                analysis_text = analysis_text.split('```')[1]
                if analysis_text.startswith('json'):
                    analysis_text = analysis_text[4:]
                analysis_text = analysis_text.strip()
            
            import json
            analysis = json.loads(analysis_text)
            
            return {
                "success": True,
                **analysis
            }
            
        except Exception as e:
            # Fallback if AI analysis fails
            return {
                "success": False,
                'detected_time_complexity': 'Unknown',
                'detected_space_complexity': 'Unknown',
                'matches_expected': False,
                'score': 50,
                'explanation': f'Could not analyze complexity: {str(e)}',
                'suggestions': []
            }
    
    # ============ PIPELINE 3: Anti-Cheat (Future) ============
    async def analyze_proctoring(
        self,
        video_data: Optional[bytes] = None,
        audio_data: Optional[bytes] = None
    ) -> Dict:
        """
        Anti-cheat pipeline - analyzes video/audio for cheating
        PLACEHOLDER for future implementation
        """
        return {
            "success": False,
            "message": "Anti-cheat pipeline - Coming soon"
        }


# Singleton instance
ai_service = AIService()
