"""
AI Code Analysis Service
Analyzes submitted code for quality, complexity, and improvements using Gemini
"""

import os
import json
from typing import Dict, Any, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
client = genai.Client(api_key=GEMINI_API_KEY)


class CodeAnalysisService:
    """Service for AI-powered code analysis and report generation"""
    
    def __init__(self):
        self.client = client
        self.model_name = GEMINI_MODEL
        
        # System prompt for code analysis
        self.analysis_system_prompt = """You are an expert code reviewer and programming mentor for Signum Learning Platform.

Your task is to analyze submitted code and provide a comprehensive, educational report.

RESPONSE FORMAT - MUST be valid JSON with this exact structure:
{
    "overall_rating": "A/B/C/D/F",
    "summary": "One sentence summary of code quality",
    "code_quality": {
        "score": 0-100,
        "strengths": ["strength1", "strength2"],
        "issues": ["issue1", "issue2"],
        "readability": "Good/Fair/Poor",
        "maintainability": "Good/Fair/Poor"
    },
    "time_complexity": {
        "detected": "O(n)/O(n^2)/etc",
        "optimal": "O(n)/O(log n)/etc",
        "explanation": "Brief explanation of the complexity",
        "is_optimal": true/false
    },
    "space_complexity": {
        "detected": "O(1)/O(n)/etc",
        "explanation": "Brief explanation"
    },
    "improvements": [
        {
            "title": "Improvement title",
            "description": "What should be improved",
            "priority": "High/Medium/Low",
            "code_suggestion": "Optional: improved code snippet"
        }
    ],
    "best_practices": {
        "followed": ["practice1", "practice2"],
        "missing": ["practice1", "practice2"]
    },
    "security_concerns": ["concern1"] or [],
    "learning_tips": ["tip1", "tip2", "tip3"],
    "encouraging_message": "A motivational message for the student"
}

RULES:
1. Always respond with ONLY valid JSON - no markdown, no extra text
2. Be constructive and educational - this is for learning
3. Provide actionable improvements
4. Explain complexity in simple terms
5. Give an encouraging message regardless of code quality
6. If code has syntax errors, still analyze what you can
7. Consider the problem context when judging complexity"""

    def analyze_code(
        self,
        code: str,
        language: str,
        problem_id: str,
        problem_title: str,
        test_results: list,
        score: float
    ) -> Dict[str, Any]:
        """
        Analyze code submission and generate comprehensive report
        
        Returns:
            {
                'success': bool,
                'report': dict (the analysis report),
                'error': str (if failed)
            }
        """
        try:
            # Build context about the submission
            tests_passed = sum(1 for t in test_results if t.get('passed', False))
            total_tests = len(test_results)
            
            # Failed test details (without revealing expected output for security)
            failed_tests_info = []
            for i, test in enumerate(test_results):
                if not test.get('passed', False):
                    failed_tests_info.append({
                        'test_number': i + 1,
                        'input': test.get('input', 'hidden'),
                        'got': test.get('actual_output', 'error')[:100]  # Truncate long outputs
                    })
            
            # Build the prompt
            prompt = f"""Analyze this {language} code submission for the problem: "{problem_title}"

**Submitted Code:**
```{language}
{code}
```

**Test Results:**
- Passed: {tests_passed}/{total_tests} test cases
- Score: {score}%

**Failed Tests (if any):**
{json.dumps(failed_tests_info[:3], indent=2) if failed_tests_info else 'All tests passed!'}

Please analyze this code and provide a comprehensive educational report.
Consider:
1. Code quality and style
2. Time and space complexity
3. Edge case handling
4. Best practices for {language}
5. Potential improvements

Respond with ONLY valid JSON following the exact format specified."""

            # Call Gemini API
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=self.analysis_system_prompt,
                    temperature=0.3,  # Lower temperature for more consistent analysis
                    max_output_tokens=2000
                )
            )
            
            # Parse the response
            response_text = response.text.strip()
            
            # Clean up response if it has markdown code blocks
            if response_text.startswith('```'):
                # Remove markdown code block markers
                lines = response_text.split('\n')
                if lines[0].startswith('```'):
                    lines = lines[1:]
                if lines[-1].strip() == '```':
                    lines = lines[:-1]
                response_text = '\n'.join(lines)
            
            try:
                report = json.loads(response_text)
            except json.JSONDecodeError as e:
                # Try to extract JSON from the response
                import re
                json_match = re.search(r'\{[\s\S]*\}', response_text)
                if json_match:
                    report = json.loads(json_match.group())
                else:
                    raise e
            
            # Validate required fields exist
            required_fields = ['overall_rating', 'code_quality', 'time_complexity', 'improvements']
            for field in required_fields:
                if field not in report:
                    report[field] = self._get_default_field(field)
            
            return {
                'success': True,
                'report': report
            }
            
        except json.JSONDecodeError as e:
            return {
                'success': False,
                'error': 'Failed to parse AI response',
                'report': self._get_fallback_report(code, language, score, test_results)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'report': self._get_fallback_report(code, language, score, test_results)
            }
    
    def _get_default_field(self, field: str) -> Any:
        """Get default value for missing report fields"""
        defaults = {
            'overall_rating': 'C',
            'summary': 'Code analysis completed.',
            'code_quality': {
                'score': 50,
                'strengths': ['Code submitted successfully'],
                'issues': [],
                'readability': 'Fair',
                'maintainability': 'Fair'
            },
            'time_complexity': {
                'detected': 'Unknown',
                'optimal': 'Unknown',
                'explanation': 'Could not determine complexity',
                'is_optimal': False
            },
            'space_complexity': {
                'detected': 'Unknown',
                'explanation': 'Could not determine space complexity'
            },
            'improvements': [],
            'best_practices': {
                'followed': [],
                'missing': []
            },
            'security_concerns': [],
            'learning_tips': ['Keep practicing!', 'Review the fundamentals'],
            'encouraging_message': 'Keep up the good work! Every submission is a step forward.'
        }
        return defaults.get(field, None)
    
    def _get_fallback_report(
        self,
        code: str,
        language: str,
        score: float,
        test_results: list
    ) -> Dict[str, Any]:
        """Generate a basic fallback report when AI analysis fails"""
        tests_passed = sum(1 for t in test_results if t.get('passed', False))
        total_tests = len(test_results)
        
        # Determine rating based on score
        if score >= 90:
            rating = 'A'
        elif score >= 75:
            rating = 'B'
        elif score >= 60:
            rating = 'C'
        elif score >= 40:
            rating = 'D'
        else:
            rating = 'F'
        
        return {
            'overall_rating': rating,
            'summary': f'Passed {tests_passed}/{total_tests} test cases with {score}% score.',
            'code_quality': {
                'score': min(score, 100),
                'strengths': ['Code executed successfully'] if tests_passed > 0 else [],
                'issues': ['Some test cases failed'] if tests_passed < total_tests else [],
                'readability': 'Fair',
                'maintainability': 'Fair'
            },
            'time_complexity': {
                'detected': 'Not analyzed',
                'optimal': 'Varies by approach',
                'explanation': 'AI analysis unavailable - manual review recommended',
                'is_optimal': False
            },
            'space_complexity': {
                'detected': 'Not analyzed',
                'explanation': 'AI analysis unavailable'
            },
            'improvements': [
                {
                    'title': 'Review Failed Test Cases',
                    'description': 'Analyze the edge cases where your code failed',
                    'priority': 'High' if tests_passed < total_tests else 'Low',
                    'code_suggestion': None
                }
            ],
            'best_practices': {
                'followed': [],
                'missing': ['Unable to analyze automatically']
            },
            'security_concerns': [],
            'learning_tips': [
                'Test your code with edge cases',
                'Consider time and space complexity',
                f'Practice more {language} problems'
            ],
            'encouraging_message': 'Keep practicing! Every attempt helps you improve. 🚀'
        }


# Singleton instance
code_analysis_service = CodeAnalysisService()
