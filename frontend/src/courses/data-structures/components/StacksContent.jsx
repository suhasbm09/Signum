import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import StackVisualization from '../visualizations/StackVisualization';
import CompletionTracker from '../../../components/CompletionTracker';

const StacksContent = ({ onNavigate, courseId }) => {
  const moduleId = 'stacks';

  // Language state for each code section
  const [implementationLang, setImplementationLang] = useState('python');
  const [pushLang, setPushLang] = useState('python');
  const [popLang, setPopLang] = useState('python');
  const [applicationsLang, setApplicationsLang] = useState('python');

  // Language selector component
  const LanguageSelector = ({ currentLang, setLang }) => (
    <div className="flex gap-2 mb-3">
      {['C', 'C++', 'Python', 'Java'].map((lang) => (
        <button
          key={lang}
          onClick={() => setLang(lang.toLowerCase().replace('++', 'pp'))}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            currentLang === lang.toLowerCase().replace('++', 'pp')
              ? 'bg-emerald-500 text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );

  return (
    <CompletionTracker 
      courseId={courseId} 
      moduleId={moduleId} 
      contentLength="x-long"
    >
    <div className="min-h-screen  text-white p-8">
      <div className="w-full mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 animate-slideInDown">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">
            Stacks - LIFO Data Structure
          </h1>
          <p className="text-xl text-gray-300">
            Master the Last In First Out principle
          </p>
        </div>

        {/* Introduction */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10 animate-slideInUp">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">What is a Stack?</h2>
          
          <div className="space-y-6">
            <p className="text-lg text-gray-300 leading-relaxed">
              A <span className="text-emerald-400 font-semibold">Stack</span> is a linear data structure that follows the <span className="text-emerald-400 font-semibold">LIFO (Last In First Out)</span> principle. 
              Think of it like a stack of plates - you can only add or remove plates from the top.
            </p>

            {/* Visual Representation */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/30">
              <h3 className="text-xl font-semibold mb-4 text-emerald-300">Visual Representation</h3>
              <div className="flex justify-center items-end gap-8">
                {/* Stack visualization */}
                <div className="flex flex-col-reverse items-center gap-2">
                  <div className="text-sm text-gray-400 mb-2">Bottom</div>
                  {[10, 20, 30, 40, 50].map((value, index) => (
                    <div
                      key={index}
                      className="w-32 h-16 border-2 border-emerald-500 rounded-lg flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                    >
                      <span className="text-xl font-bold text-emerald-300">{value}</span>
                    </div>
                  ))}
                  <div className="text-sm text-emerald-400 mt-2 font-semibold">← Top (push/pop here)</div>
                </div>
                
                {/* Operations */}
                <div className="space-y-3 text-gray-300 text-sm">
                  <div className="bg-emerald-500/10 p-3 rounded border border-emerald-500/30">
                    <strong className="text-emerald-400">push(60)</strong> → Add 60 to top
                  </div>
                  <div className="bg-red-500/10 p-3 rounded border border-red-500/30">
                    <strong className="text-red-400">pop()</strong> → Remove 50 from top
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded border border-blue-500/30">
                    <strong className="text-blue-400">peek()</strong> → View 50 (no removal)
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed">
              All stack operations (push, pop, peek) have <span className="text-emerald-400 font-semibold">O(1)</span> time complexity, making stacks extremely efficient.
            </p>
          </div>
        </section>

        {/* Key Concepts */}
        <section className="animate-slideInUp">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Core Operations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            
            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">⬆️</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Push</h3>
              </div>
              <p className="text-gray-300 mb-2">Add element to the top of stack</p>
              <code className="text-emerald-400 bg-gray-800 px-2 py-1 rounded text-sm">Time: O(1)</code>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">⬇️</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Pop</h3>
              </div>
              <p className="text-gray-300 mb-2">Remove and return top element</p>
              <code className="text-emerald-400 bg-gray-800 px-2 py-1 rounded text-sm">Time: O(1)</code>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">👁️</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Peek / Top</h3>
              </div>
              <p className="text-gray-300 mb-2">View top element without removing</p>
              <code className="text-emerald-400 bg-gray-800 px-2 py-1 rounded text-sm">Time: O(1)</code>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">❓</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">isEmpty</h3>
              </div>
              <p className="text-gray-300 mb-2">Check if stack is empty</p>
              <code className="text-emerald-400 bg-gray-800 px-2 py-1 rounded text-sm">Time: O(1)</code>
            </div>

          </div>
        </section>

        {/* Interactive Visualizer */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-emerald-500/20 shadow-xl shadow-emerald-500/10 overflow-hidden">
          <StackVisualization />
        </section>

        {/* Implementation */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Implementation</h2>
          
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              Stacks can be implemented using arrays or linked lists. Here's a complete implementation:
            </p>

            <LanguageSelector currentLang={implementationLang} setLang={setImplementationLang} />

            {implementationLang === 'c' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAX_SIZE 100

typedef struct {
    int items[MAX_SIZE];
    int top;
} Stack;

// Initialize stack
void init(Stack* s) {
    s->top = -1;
}

// Check if stack is empty
bool isEmpty(Stack* s) {
    return s->top == -1;
}

// Check if stack is full
bool isFull(Stack* s) {
    return s->top == MAX_SIZE - 1;
}

// Push element
void push(Stack* s, int value) {
    if (isFull(s)) {
        printf("Stack overflow\\n");
        return;
    }
    s->items[++(s->top)] = value;
}

// Pop element
int pop(Stack* s) {
    if (isEmpty(s)) {
        printf("Stack underflow\\n");
        return -1;
    }
    return s->items[(s->top)--];
}

// Peek top element
int peek(Stack* s) {
    if (isEmpty(s)) {
        printf("Stack is empty\\n");
        return -1;
    }
    return s->items[s->top];
}

// Usage
int main() {
    Stack s;
    init(&s);
    
    push(&s, 10);
    push(&s, 20);
    push(&s, 30);
    
    printf("Top: %d\\n", peek(&s));  // Output: 30
    printf("Pop: %d\\n", pop(&s));   // Output: 30
    printf("Top: %d\\n", peek(&s));  // Output: 20
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {implementationLang === 'cpp' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <iostream>
#include <stack>
#include <vector>
using namespace std;

// Method 1: Using STL stack
void usingSTL() {
    stack<int> s;
    
    s.push(10);
    s.push(20);
    s.push(30);
    
    cout << "Top: " << s.top() << endl;  // Output: 30
    s.pop();
    cout << "Top after pop: " << s.top() << endl;  // Output: 20
    cout << "Size: " << s.size() << endl;  // Output: 2
}

// Method 2: Custom implementation using vector
class Stack {
private:
    vector<int> items;
    
public:
    void push(int value) {
        items.push_back(value);
    }
    
    int pop() {
        if (isEmpty()) {
            throw runtime_error("Stack underflow");
        }
        int value = items.back();
        items.pop_back();
        return value;
    }
    
    int peek() {
        if (isEmpty()) {
            throw runtime_error("Stack is empty");
        }
        return items.back();
    }
    
    bool isEmpty() {
        return items.empty();
    }
    
    int size() {
        return items.size();
    }
};

int main() {
    Stack s;
    s.push(10);
    s.push(20);
    s.push(30);
    
    cout << "Top: " << s.peek() << endl;  // Output: 30
    cout << "Pop: " << s.pop() << endl;   // Output: 30
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {implementationLang === 'python' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        """Add item to top of stack"""
        self.items.append(item)
    
    def pop(self):
        """Remove and return top item"""
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items.pop()
    
    def peek(self):
        """Return top item without removing"""
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items[-1]
    
    def is_empty(self):
        """Check if stack is empty"""
        return len(self.items) == 0
    
    def size(self):
        """Return number of items"""
        return len(self.items)

# Usage
stack = Stack()
stack.push(10)
stack.push(20)
stack.push(30)

print(f"Top: {stack.peek()}")   # Output: 30
print(f"Pop: {stack.pop()}")    # Output: 30
print(f"Size: {stack.size()}")  # Output: 2

# Alternative: Using list directly
stack_simple = []
stack_simple.append(10)  # push
stack_simple.append(20)
top = stack_simple[-1]   # peek
popped = stack_simple.pop()  # pop`}
                </pre>
              </div>
            )}

            {implementationLang === 'java' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`import java.util.Stack;
import java.util.ArrayList;

// Method 1: Using built-in Stack class
class UsingBuiltIn {
    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<>();
        
        stack.push(10);
        stack.push(20);
        stack.push(30);
        
        System.out.println("Top: " + stack.peek());  // Output: 30
        System.out.println("Pop: " + stack.pop());   // Output: 30
        System.out.println("Empty: " + stack.isEmpty());  // false
    }
}

// Method 2: Custom implementation
class CustomStack {
    private ArrayList<Integer> items;
    
    public CustomStack() {
        items = new ArrayList<>();
    }
    
    public void push(int value) {
        items.add(value);
    }
    
    public int pop() {
        if (isEmpty()) {
            throw new RuntimeException("Stack underflow");
        }
        return items.remove(items.size() - 1);
    }
    
    public int peek() {
        if (isEmpty()) {
            throw new RuntimeException("Stack is empty");
        }
        return items.get(items.size() - 1);
    }
    
    public boolean isEmpty() {
        return items.isEmpty();
    }
    
    public int size() {
        return items.size();
    }
}

// Usage
public class StackExample {
    public static void main(String[] args) {
        CustomStack s = new CustomStack();
        s.push(10);
        s.push(20);
        s.push(30);
        
        System.out.println("Top: " + s.peek());  // Output: 30
        System.out.println("Pop: " + s.pop());   // Output: 30
    }
}`}
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* Real-World Applications */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Real-World Applications</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">🔙</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Browser History</h3>
              <p className="text-gray-300">
                Back button uses stack - last visited page is first to return to
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">↩️</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Undo/Redo</h3>
              <p className="text-gray-300">
                Text editors use stacks to track changes for undo operations
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">📞</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Function Calls</h3>
              <p className="text-gray-300">
                Call stack manages function execution and recursion in programming
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">🧮</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Expression Evaluation</h3>
              <p className="text-gray-300">
                Convert infix to postfix, evaluate mathematical expressions
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">DFS Algorithm</h3>
              <p className="text-gray-300">
                Depth-First Search uses stack for graph/tree traversal
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">✓</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Syntax Parsing</h3>
              <p className="text-gray-300">
                Validate balanced parentheses, brackets, HTML/XML tags
              </p>
            </div>
          </div>
        </section>

        {/* Bracket Matching Example */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Example: Valid Parentheses</h2>
          
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              A classic stack problem - check if brackets are balanced:
            </p>

            <LanguageSelector currentLang={applicationsLang} setLang={setApplicationsLang} />

            {applicationsLang === 'c' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <stdio.h>
#include <string.h>
#include <stdbool.h>

#define MAX 100

bool isValid(char* s) {
    char stack[MAX];
    int top = -1;
    
    for (int i = 0; s[i] != '\\0'; i++) {
        char c = s[i];
        
        // Push opening brackets
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        }
        // Check closing brackets
        else {
            if (top == -1) return false;
            
            char last = stack[top--];
            if ((c == ')' && last != '(') ||
                (c == '}' && last != '{') ||
                (c == ']' && last != '[')) {
                return false;
            }
        }
    }
    
    return top == -1;  // Stack should be empty
}

int main() {
    printf("%d\\n", isValid("()[]{}"));    // 1 (true)
    printf("%d\\n", isValid("([)]"));      // 0 (false)
    printf("%d\\n", isValid("{[()]}"));    // 1 (true)
    return 0;
}`}
                </pre>
              </div>
            )}

            {applicationsLang === 'cpp' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isValid(string s) {
    stack<char> st;
    
    for (char c : s) {
        // Push opening brackets
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        }
        // Check closing brackets
        else {
            if (st.empty()) return false;
            
            char top = st.top();
            st.pop();
            
            if ((c == ')' && top != '(') ||
                (c == '}' && top != '{') ||
                (c == ']' && top != '[')) {
                return false;
            }
        }
    }
    
    return st.empty();  // Stack should be empty
}

int main() {
    cout << isValid("()[]{}") << endl;    // 1 (true)
    cout << isValid("([)]") << endl;      // 0 (false)
    cout << isValid("{[()]}") << endl;    // 1 (true)
    return 0;
}`}
                </pre>
              </div>
            )}

            {applicationsLang === 'python' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`def is_valid(s):
    """Check if parentheses are balanced"""
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        # If closing bracket
        if char in mapping:
            # Check if it matches top of stack
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            # Opening bracket - push to stack
            stack.append(char)
    
    # Stack should be empty if balanced
    return len(stack) == 0

# Test cases
print(is_valid("()[]{}"))    # True
print(is_valid("([)]"))      # False
print(is_valid("{[()]}"))    # True
print(is_valid("(("))        # False`}
                </pre>
              </div>
            )}

            {applicationsLang === 'java' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`import java.util.Stack;
import java.util.HashMap;

public class ValidParentheses {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        HashMap<Character, Character> mapping = new HashMap<>();
        mapping.put(')', '(');
        mapping.put('}', '{');
        mapping.put(']', '[');
        
        for (char c : s.toCharArray()) {
            // If closing bracket
            if (mapping.containsKey(c)) {
                char top = stack.isEmpty() ? '#' : stack.pop();
                if (top != mapping.get(c)) {
                    return false;
                }
            } else {
                // Opening bracket - push to stack
                stack.push(c);
            }
        }
        
        // Stack should be empty if balanced
        return stack.isEmpty();
    }
    
    public static void main(String[] args) {
        System.out.println(isValid("()[]{}"));    // true
        System.out.println(isValid("([)]"));      // false
        System.out.println(isValid("{[()]}"));    // true
    }
}`}
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* Time Complexity */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Time & Space Complexity</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-emerald-500/20 border-b-2 border-emerald-500/50">
                  <th className="p-4 text-left text-emerald-300 font-semibold">Operation</th>
                  <th className="p-4 text-left text-emerald-300 font-semibold">Time Complexity</th>
                  <th className="p-4 text-left text-emerald-300 font-semibold">Space Complexity</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Push</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Pop</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Peek/Top</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">isEmpty</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Overall Space</td>
                  <td className="p-4 text-gray-400">-</td>
                  <td className="p-4">
                    <code className="text-yellow-400 bg-gray-800 px-3 py-1 rounded">O(n)</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Advantages and Disadvantages */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-2xl p-8 border border-emerald-500/30">
            <h3 className="text-2xl font-semibold mb-6 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8" />
              Advantages
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Fast Operations:</strong> All operations are O(1)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Simple:</strong> Easy to implement and understand</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Memory Efficient:</strong> No extra pointers (array-based)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>LIFO Access:</strong> Natural for backtracking problems</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-900/30 to-gray-800/30 rounded-2xl p-8 border border-red-500/30">
            <h3 className="text-2xl font-semibold mb-6 text-red-300 flex items-center gap-3">
              <AlertCircle className="w-8 h-8" />
              Disadvantages
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Fixed Size:</strong> Array-based stacks have size limit</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>No Random Access:</strong> Can only access top element</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Stack Overflow:</strong> Too many pushes cause overflow</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Limited Use:</strong> Only suitable for LIFO scenarios</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Practice Problems */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Practice Problems</h2>
          
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">1. Min Stack</h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Medium</span>
              </div>
              <p className="text-gray-300 mb-3">
                Design a stack with push, pop, top, and getMin() in O(1) time.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Google</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">2. Evaluate Postfix Expression</h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Medium</span>
              </div>
              <p className="text-gray-300 mb-3">
                Calculate the result of a postfix (Reverse Polish) notation.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Microsoft</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">3. Next Greater Element</h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Medium</span>
              </div>
              <p className="text-gray-300 mb-3">
                Find the next greater element for each element in an array.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Google</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Facebook</span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">4. Largest Rectangle in Histogram</h3>
                <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">Hard</span>
              </div>
              <p className="text-gray-300 mb-3">
                Find the largest rectangle area in a histogram using stack.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Google</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Microsoft</span>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-2xl p-8 border border-emerald-500/30">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Next Steps</h2>
          <p className="text-gray-300 mb-6 text-lg">
            Excellent! Now let's explore Queues - the FIFO counterpart to stacks.
          </p>
          
          {/* Continue Navigation Button */}
          <button
            onClick={() => onNavigate('course', { courseId, topic: 'queues' })}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span className="text-lg">Continue to Queues →</span>
          </button>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer hover-lift">
              <div className="text-2xl mb-2">📤</div>
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">Queues</h3>
              <p className="text-gray-400 text-sm">Learn FIFO data structures</p>
            </div>
            
          </div>
        </section>

      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideInDown {
          animation: slideInDown 0.6s ease-out;
        }

        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }

        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
        }
      `}</style>
    </div>
    </CompletionTracker>
  );
};

export default StacksContent;
