"""
AI Service - Simple, Scalable, Reusable
Three pipelines: Q&A with RAG, Evaluation, Anti-Cheat
"""

import os
from typing import List, Dict, Optional
import google.generativeai as genai
from dotenv import load_dotenv
from .course_content_store import course_store

# Load environment variables
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
genai.configure(api_key=GEMINI_API_KEY)


class AIService:
    """Main AI Service with 3 pipelines"""
    
    def __init__(self):
        self.model = genai.GenerativeModel(GEMINI_MODEL)
        
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

Current Page Context: {context}
Screen Content: {screen_content}
"""
    
    # ============ PIPELINE 1: Q&A with RAG ============
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
            # STEP 1: Get relevant course content (RAG)
            course_content = course_store.get_relevant_content(message, context)
            
            # STEP 2: Build system prompt with ALL context
            system_prompt = self.qa_system_prompt.format(
                context=context,
                screen_content=screen_content[:500] if screen_content else "No screen content provided"
            )
            
            # Add course content if found
            if course_content:
                system_prompt += f"\n\n**Relevant Course Material:**\n{course_content}\n"
                system_prompt += "Use this course material to answer the question accurately.\n"
            
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
            response = self.model.generate_content(full_prompt)
            
            return {
                "success": True,
                "response": response.text,
                "context": context,
                "model": GEMINI_MODEL
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

            response = self.model.generate_content(prompt)
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
