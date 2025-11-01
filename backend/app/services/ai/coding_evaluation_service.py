"""
Coding Challenge Evaluation Service
Evaluates code submissions using test cases only
Uses Piston API for code execution (no local compilers needed)
"""
import os
import json
import requests
import time
from typing import Dict, List, Any, Tuple

class CodingEvaluationService:
    """Service for evaluating coding challenge submissions"""
    
    # Piston API endpoint (free online code execution)
    PISTON_API_URL = "https://emkc.org/api/v2/piston"
    
    # Problem definitions
    PROBLEMS = {
        'factorial': {
            'title': 'Factorial of a Number',
            'description': 'Calculate the factorial of a given number n',
            'test_cases': [
                {'input': '0', 'expected_output': '1'},
                {'input': '1', 'expected_output': '1'},
                {'input': '2', 'expected_output': '2'},
                {'input': '3', 'expected_output': '6'},
                {'input': '4', 'expected_output': '24'},
                {'input': '5', 'expected_output': '120'},
                {'input': '10', 'expected_output': '3628800'},
                {'input': '12', 'expected_output': '479001600'},
                {'input': '15', 'expected_output': '1307674368000'},
                {'input': '20', 'expected_output': '2432902008176640000'},
            ],
            'expected_complexity': {
                'time': 'O(n)',
                'space': 'O(1) for iterative or O(n) for recursive'
            }
        }
    }
    
    # Language configurations for Piston API
    LANGUAGE_CONFIG = {
        'python': {
            'language': 'python',
            'version': '3.10'
        },
        'java': {
            'language': 'java',
            'version': '15.0'
        },
        'cpp': {
            'language': 'cpp',
            'version': '10.2'
        },
        'c': {
            'language': 'c',
            'version': '10.2'
        }
    }
    
    def __init__(self):
        self.max_execution_time = 10  # seconds
    
    def evaluate_submission(
        self, 
        code: str, 
        language: str, 
        problem_id: str,
        anti_cheat_data: Dict = None
    ) -> Dict[str, Any]:
        """
        Evaluate a code submission
        
        Returns:
            {
                'success': bool,
                'score': float,
                'test_results': list,
                'time_complexity_analysis': dict,
                'anti_cheat_penalty': float,
                'feedback': str
            }
        """
        try:
            problem = self.PROBLEMS.get(problem_id)
            if not problem:
                return {'success': False, 'message': 'Invalid problem ID'}
            
            # Step 1: Run test cases
            test_results = self._run_test_cases(code, language, problem['test_cases'])
            
            # Calculate test pass rate
            # 10 test cases, each worth 5 points = 50 points total
            # Then scaled to 100 (multiply by 2)
            passed_tests = sum(1 for t in test_results if t['passed'])
            test_score_raw = passed_tests * 5  # Each test = 5 points (out of 50)
            test_score = test_score_raw * 2  # Scale to 100
            
            # Step 2: Calculate anti-cheat penalty
            anti_cheat_penalty = self._calculate_anti_cheat_penalty(anti_cheat_data)
            
            # Step 3: Calculate final score (100% from test cases)
            final_score = max(0, test_score - anti_cheat_penalty)
            
            # Reference complexity info (display only, doesn't affect score)
            complexity_info = {
                'expected_time': problem['expected_complexity']['time'],
                'expected_space': problem['expected_complexity']['space'],
                'note': 'Expected complexity - reference only, not evaluated'
            }
            
            # Step 4: Generate feedback
            feedback = self._generate_feedback(
                test_results,
                complexity_info,
                anti_cheat_penalty,
                final_score
            )
            
            return {
                'success': True,
                'score': round(final_score, 2),
                'test_results': test_results,
                'tests_passed': f"{passed_tests}/{len(test_results)}",
                'time_complexity_analysis': complexity_info,
                'anti_cheat_penalty': anti_cheat_penalty,
                'feedback': feedback
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Evaluation error: {str(e)}'
            }
    
    def _run_test_cases(
        self, 
        code: str, 
        language: str, 
        test_cases: List[Dict]
    ) -> List[Dict]:
        """Run code against test cases"""
        results = []
        
        for i, test in enumerate(test_cases):
            try:
                output, execution_time, error = self._execute_code(
                    code, 
                    language, 
                    test['input']
                )
                
                # Clean output for comparison
                expected = test['expected_output'].strip()
                actual = output.strip()
                
                passed = actual == expected
                
                results.append({
                    'test_case': i + 1,
                    'input': test['input'],
                    'expected_output': expected,
                    'actual_output': actual,
                    'passed': passed,
                    'execution_time': execution_time,
                    'error': error
                })
                
            except Exception as e:
                results.append({
                    'test_case': i + 1,
                    'input': test['input'],
                    'expected_output': test['expected_output'],
                    'actual_output': '',
                    'passed': False,
                    'execution_time': 0,
                    'error': str(e)
                })
        
        return results
    
    def _execute_code(
        self, 
        code: str, 
        language: str, 
        stdin_input: str
    ) -> Tuple[str, float, str]:
        """
        Execute code using Piston API (online code execution)
        
        Returns:
            (output, execution_time, error)
        """
        if language not in self.LANGUAGE_CONFIG:
            return '', 0, f"Unsupported language: {language}"
        
        config = self.LANGUAGE_CONFIG[language]
        
        try:
            start_time = time.time()
            
            # Prepare request payload for Piston API
            payload = {
                "language": config['language'],
                "version": config['version'],
                "files": [
                    {
                        "content": code
                    }
                ],
                "stdin": stdin_input
            }
            
            # Execute code via Piston API
            response = requests.post(
                f"{self.PISTON_API_URL}/execute",
                json=payload,
                timeout=10
            )
            
            execution_time = time.time() - start_time
            
            if response.status_code != 200:
                return '', execution_time, f"API Error: {response.status_code}"
            
            result = response.json()
            
            # Check for compilation errors
            if result.get('compile'):
                compile_output = result['compile']
                if compile_output.get('code') != 0:
                    return '', execution_time, f"Compilation Error: {compile_output.get('stderr', compile_output.get('output', 'Unknown error'))}"
            
            # Check for runtime errors
            run_output = result.get('run', {})
            if run_output.get('code') != 0 and run_output.get('signal') is None:
                return '', execution_time, f"Runtime Error: {run_output.get('stderr', run_output.get('output', 'Unknown error'))}"
            
            # Get output
            output = run_output.get('stdout', run_output.get('output', ''))
            stderr = run_output.get('stderr', '')
            
            if stderr and not output:
                return '', execution_time, f"Error: {stderr}"
            
            return output, execution_time, None
            
        except requests.Timeout:
            return '', 10, "Execution Timeout"
        except Exception as e:
            return '', 0, f"Execution Error: {str(e)}"
    
    def _calculate_anti_cheat_penalty(self, anti_cheat_data: Dict) -> float:
        """Calculate score penalty based on anti-cheat violations"""
        if not anti_cheat_data:
            return 0
        
        penalty = 0
        
        # Tab switches: -2% per switch, max -20%
        tab_switches = anti_cheat_data.get('tab_switches', 0)
        penalty += min(tab_switches * 2, 20)
        
        # Copy attempts: -5% per attempt, max -30%
        copy_attempts = anti_cheat_data.get('copy_attempts', 0)
        penalty += min(copy_attempts * 5, 30)
        
        # Paste attempts: -10% per attempt, max -40%
        paste_attempts = anti_cheat_data.get('paste_attempts', 0)
        penalty += min(paste_attempts * 10, 40)
        
        return min(penalty, 50)  # Max 50% penalty
    
    def _generate_feedback(
        self,
        test_results: List[Dict],
        complexity_info: Dict,
        anti_cheat_penalty: float,
        final_score: float
    ) -> str:
        """Generate comprehensive feedback for the submission"""
        feedback_parts = []
        
        # Test results summary
        passed = sum(1 for t in test_results if t['passed'])
        total = len(test_results)
        raw_points = passed * 5  # Each test = 5 points
        scaled_points = raw_points * 2  # Scaled to 100
        
        feedback_parts.append(f"Test Cases: {passed}/{total} passed")
        feedback_parts.append(f"Raw Score: {passed} × 5 = {raw_points} points (out of 50)")
        feedback_parts.append(f"Scaled Score: {raw_points} × 2 = {scaled_points}%")
        
        # Complexity reference (not evaluated)
        feedback_parts.append(f"\nExpected Time Complexity: {complexity_info.get('expected_time', 'Unknown')}")
        feedback_parts.append(f"Expected Space Complexity: {complexity_info.get('expected_space', 'Unknown')}")
        feedback_parts.append("(Reference only - score based on test cases)")
        
        # Anti-cheat feedback
        if anti_cheat_penalty > 0:
            feedback_parts.append(f"\n⚠ Anti-cheat penalty: -{anti_cheat_penalty}%")
        
        # Score breakdown
        feedback_parts.append(f"\nFinal Score: {scaled_points}% - {anti_cheat_penalty}% = {final_score}%")
        
        # Encouragement
        if final_score >= 90:
            feedback_parts.append("🌟 Excellent! Perfect or near-perfect solution!")
        elif final_score >= 70:
            feedback_parts.append("👍 Good job! Strong performance!")
        elif final_score >= 50:
            feedback_parts.append("📚 Passing! Keep practicing for better scores!")
        else:
            feedback_parts.append("💪 Review and try again! You can do better!")
        
        return '\n'.join(feedback_parts)
    
    def run_code_only(self, code: str, language: str, problem_id: str) -> Dict[str, Any]:
        """Run code with first test case only (for testing)"""
        try:
            problem = self.PROBLEMS.get(problem_id)
            if not problem:
                return {'success': False, 'error': 'Invalid problem ID'}
            
            # Use first test case
            test_case = problem['test_cases'][0]
            output, execution_time, error = self._execute_code(
                code, 
                language, 
                test_case['input']
            )
            
            if error:
                return {
                    'success': False,
                    'error': error,
                    'output': output
                }
            
            return {
                'success': True,
                'output': output,
                'execution_time': execution_time
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }


# Singleton instance
coding_evaluation_service = CodingEvaluationService()
