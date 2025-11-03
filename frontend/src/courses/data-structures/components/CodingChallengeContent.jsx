import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { API_BASE_URL } from '../../config/api';

// Code templates for different languages
const codeTemplates = {
  python: `# Write your code here
def factorial(n):
    # Your implementation
    pass

# Test your code
if __name__ == "__main__":
    n = int(input())
    result = factorial(n)
    print(result)`,
  
  java: `import java.util.Scanner;

public class Solution {
    public static long factorial(int n) {
        // Your implementation
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long result = factorial(n);
        System.out.println(result);
    }
}`,
  
  cpp: `#include <iostream>
using namespace std;

long long factorial(int n) {
    // Your implementation
    return 0;
}

int main() {
    int n;
    cin >> n;
    long long result = factorial(n);
    cout << result << endl;
    return 0;
}`,
  
  c: `#include <stdio.h>

long long factorial(int n) {
    // Your implementation
    return 0;
}

int main() {
    int n;
    scanf("%d", &n);
    long long result = factorial(n);
    printf("%lld\\n", result);
    return 0;
}`
};

const CodingChallengeContent = ({ courseId, user, onChallengeComplete }) => {
  const userId = user?.uid || user?.email || 'user_123';
  
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState(codeTemplates['python']);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const editorRef = useRef(null);

  // Monaco language mapping
  const monacoLanguageMap = {
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c'
  };

  // Problem statement (this could be passed as props for different courses)
  const problem = {
    title: "Factorial of a Number",
    difficulty: "Easy",
    description: `Calculate the factorial of a given number n.

The factorial of a non-negative integer n is the product of all positive integers less than or equal to n.

For example:
- factorial(5) = 5 × 4 × 3 × 2 × 1 = 120
- factorial(0) = 1
- factorial(1) = 1

You can implement this using any method (iterative, recursive, etc.)`,
    
    input: "A single integer n (0 ≤ n ≤ 20)",
    output: "The factorial of n",
    
    examples: [
      { input: "5", output: "120" },
      { input: "0", output: "1" },
      { input: "10", output: "3628800" }
    ],
    
    constraints: [
      "0 ≤ n ≤ 20",
      "Time Complexity: O(n) or better",
      "Space Complexity: O(1) for iterative, O(n) for recursive"
    ]
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    setCode(codeTemplates[lang]);
    setOutput('');
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/assessment/${courseId}/coding/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          language: selectedLanguage,
          problem_id: 'factorial'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setOutput(`✅ Output:\n${result.output}\n\nExecution time: ${result.execution_time?.toFixed(3)}s`);
      } else {
        setOutput(`❌ Error:\n${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setOutput(`❌ Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Collect anti-cheat data (will be passed from parent wrapper)
      const antiCheatData = {
        tab_switches: 0,  // This will be tracked by parent
        copy_attempts: 0,
        paste_attempts: 0
      };

      const response = await fetch(`${API_BASE_URL}/assessment/${courseId}/coding/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          code: code,
          language: selectedLanguage,
          problem_id: 'factorial',
          anti_cheat_data: antiCheatData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Pass results to parent (which will show result page)
        onChallengeComplete({
          score: result.score,
          tests_passed: result.tests_passed,
          test_results: result.test_results,
          feedback: result.feedback,
          anti_cheat_penalty: result.anti_cheat_penalty
        });
      } else {
        setOutput(`❌ Submission error: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      setOutput(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex bg-dark-bg">
      {/* Problem Description - Left Panel */}
      <div className="w-2/5 border-r border-emerald-500/20 overflow-y-auto bg-black/30 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-quantico-bold text-emerald-300">
              {problem.title}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-quantico-bold ${
              problem.difficulty === 'Easy' 
                ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                : problem.difficulty === 'Medium'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}>
              {problem.difficulty}
            </span>
          </div>
          
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {problem.description}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-quantico-bold text-emerald-300 mb-3">Input</h3>
          <div className="bg-black/50 border border-emerald-500/20 rounded-lg p-3 text-gray-300 text-sm">
            {problem.input}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-quantico-bold text-emerald-300 mb-3">Output</h3>
          <div className="bg-black/50 border border-emerald-500/20 rounded-lg p-3 text-gray-300 text-sm">
            {problem.output}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-quantico-bold text-emerald-300 mb-3">Examples</h3>
          {problem.examples.map((example, idx) => (
            <div key={idx} className="mb-3 bg-black/50 border border-emerald-500/20 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Example {idx + 1}:</div>
              <div className="text-gray-300 text-sm">
                <div><span className="text-emerald-400">Input:</span> {example.input}</div>
                <div><span className="text-emerald-400">Output:</span> {example.output}</div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-quantico-bold text-emerald-300 mb-3">Constraints</h3>
          <ul className="space-y-2">
            {problem.constraints.map((constraint, idx) => (
              <li key={idx} className="text-gray-300 text-sm flex items-start">
                <span className="text-emerald-400 mr-2">•</span>
                <span>{constraint}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Code Editor - Right Panel */}
      <div className="flex-1 flex flex-col bg-black/20">
        {/* Language Selector & Controls */}
        <div className="bg-black/50 border-b border-emerald-500/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm font-quantico-bold mr-2">Language:</span>
              {Object.keys(codeTemplates).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-4 py-2 rounded-lg font-quantico-bold text-sm transition-all ${
                    selectedLanguage === lang
                      ? 'bg-emerald-500 text-black'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-2 rounded-lg font-quantico-bold transition-all"
              >
                {isRunning ? '⏳ Running...' : '▶️ Run'}
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-700 text-black px-6 py-2 rounded-lg font-quantico-bold transition-all"
              >
                {isSubmitting ? '⏳ Submitting...' : '✓ Submit'}
              </button>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="60%"
            language={monacoLanguageMap[selectedLanguage]}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            onMount={(editor) => { editorRef.current = editor; }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: 'on'
            }}
          />
          
          {/* Output Console */}
          <div className="h-[40%] bg-black/80 border-t border-emerald-500/20 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-emerald-300 font-quantico-bold">Output</h3>
              {output && (
                <button
                  onClick={() => setOutput('')}
                  className="text-gray-400 hover:text-gray-200 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
            <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
              {output || 'Run your code to see output...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingChallengeContent;
