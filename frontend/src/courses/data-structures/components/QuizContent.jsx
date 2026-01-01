import { useState, useEffect, useCallback } from 'react';
import { useProgress } from '../../../contexts/ProgressContext';
import progressService from '../../../services/progressService';

/**
 * QuizContent - Server-Side Scored Quiz Component
 * 
 * Flow:
 * 1. Start quiz session on server -> get questions (no answers)
 * 2. User answers questions locally
 * 3. Timer synced with server start_time/expires_at
 * 4. Submit answers to server -> server calculates score
 * 5. Display results from server response
 * 6. Review previous attempts anytime
 */

function QuizContent({ onNavigate, onQuizComplete, courseId, violations = [] }) {
  const { getQuizScore, refreshProgress } = useProgress();
  const [currentLanguage, setCurrentLanguage] = useState('python');
  
  // Quiz state: idle, loading, active, submitting, results, review
  const [quizState, setQuizState] = useState('idle');
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // {question_id: selected_index}
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  // Timer state (synced with server)
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes default
  const [serverExpiresAt, setServerExpiresAt] = useState(null);
  
  // Results state
  const [results, setResults] = useState(null);
  
  // Previous attempt state
  const [previousAttempt, setPreviousAttempt] = useState(null);
  const [loadingPreviousAttempt, setLoadingPreviousAttempt] = useState(false);
  
  // Error state
  const [error, setError] = useState(null);
  
  // Previous attempt tracking
  const existingQuizScore = getQuizScore('data-structures');
  const isAlreadyCompleted = existingQuizScore && existingQuizScore.score >= 95;
  
  // User ID - get from window.currentUser (set by auth system)
  const getUserId = () => {
    if (typeof window !== 'undefined' && window.currentUser) {
      return window.currentUser.uid || window.currentUser.email;
    }
    // Fallback to localStorage
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.uid || user.email || null;
    } catch {
      return null;
    }
  };
  
  const userId = getUserId();

  // Load previous attempt on mount
  useEffect(() => {
    const loadPreviousAttempt = async () => {
      try {
        const attempts = await progressService.getQuizResults(userId, courseId || 'data-structures');
        if (attempts && attempts.length > 0) {
          // Get the most recent attempt (should be first due to sorting)
          const latestAttempt = attempts[0];
          setPreviousAttempt(latestAttempt);
        }
      } catch (err) {
      }
    };
    
    loadPreviousAttempt();
  }, [userId, courseId]);

  // Code examples for questions (display only - stored in frontend since server doesn't need them)
  const codeExamples = {
    3: { // Two pointer question
      python: `def two_sum(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return True
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return False`,
      java: `public boolean twoSum(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return true;
        else if (sum < target) left++;
        else right--;
    }
    return false;
}`,
      cpp: `bool twoSum(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return true;
        else if (sum < target) left++;
        else right--;
    }
    return false;
}`,
      c: `int twoSum(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return 1;
        else if (sum < target) left++;
        else right--;
    }
    return 0;
}`
    },
    6: { // Matrix multiplication
      python: `def matrix_multiply(A, B):
    m, k, n = len(A), len(A[0]), len(B[0])
    C = [[0] * n for _ in range(m)]
    for i in range(m):
        for j in range(n):
            for l in range(k):
                C[i][j] += A[i][l] * B[l][j]
    return C`,
      java: `public void matrixMultiply(int[][] A, int[][] B, int[][] C) {
    int m = A.length, k = A[0].length, n = B[0].length;
    for(int i = 0; i < m; i++) {
        for(int j = 0; j < n; j++) {
            C[i][j] = 0;
            for(int l = 0; l < k; l++) {
                C[i][j] += A[i][l] * B[l][j];
            }
        }
    }
}`,
      cpp: `void matrixMultiply(vector<vector<int>>& A, vector<vector<int>>& B, 
                    vector<vector<int>>& C) {
    int m = A.size(), k = A[0].size(), n = B[0].size();
    for(int i = 0; i < m; i++) {
        for(int j = 0; j < n; j++) {
            C[i][j] = 0;
            for(int l = 0; l < k; l++) {
                C[i][j] += A[i][l] * B[l][j];
            }
        }
    }
}`,
      c: `void matrixMultiply(int A[][k], int B[][n], int C[][n], int m, int k, int n) {
    for(int i = 0; i < m; i++) {
        for(int j = 0; j < n; j++) {
            C[i][j] = 0;
            for(int l = 0; l < k; l++) {
                C[i][j] += A[i][l] * B[l][j];
            }
        }
    }
}`
    },
    9: { // Stack operations
      python: `stack = []
stack.append(1)
stack.append(2)
a = stack.pop()  # First pop
stack.append(3)
b = stack.pop()  # Second pop
c = stack.pop()  # Third pop`,
      java: `Stack<Integer> stack = new Stack<>();
stack.push(1);
stack.push(2);
int a = stack.pop();  // First pop
stack.push(3);
int b = stack.pop();  // Second pop
int c = stack.pop();  // Third pop`,
      cpp: `stack<int> st;
st.push(1);
st.push(2);
int a = st.top(); st.pop();  // First pop
st.push(3);
int b = st.top(); st.pop();  // Second pop
int c = st.top(); st.pop();  // Third pop`,
      c: `// Stack operations using array
push(stack, 1);
push(stack, 2);
int a = pop(stack);  // First pop
push(stack, 3);
int b = pop(stack);  // Second pop
int c = pop(stack);  // Third pop`
    },
    12: { // Queue operations
      python: `class Queue:
    def __init__(self, capacity):
        self.arr = [0] * capacity
        self.front = self.rear = 0
        self.capacity = capacity
    
    def enqueue(self, x):
        self.rear = (self.rear + 1) % self.capacity
        self.arr[self.rear] = x
    
    def dequeue(self):
        self.front = (self.front + 1) % self.capacity
        return self.arr[self.front]`,
      java: `class Queue {
    private int[] arr;
    private int front, rear, capacity;
    
    public void enqueue(int x) {
        rear = (rear + 1) % capacity;
        arr[rear] = x;
    }
    
    public int dequeue() {
        front = (front + 1) % capacity;
        return arr[front];
    }
}`,
      cpp: `class Queue {
    vector<int> arr;
    int front, rear, capacity;
public:
    void enqueue(int x) {
        rear = (rear + 1) % capacity;
        arr[rear] = x;
    }
    
    int dequeue() {
        front = (front + 1) % capacity;
        return arr[front];
    }
};`,
      c: `typedef struct {
    int *arr;
    int front, rear;
    int capacity;
} Queue;

void enqueue(Queue *q, int x) {
    q->rear = (q->rear + 1) % q->capacity;
    q->arr[q->rear] = x;
}

int dequeue(Queue *q) {
    q->front = (q->front + 1) % q->capacity;
    return q->arr[q->front];
}`
    },
    15: { // BST inorder
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorder(root):
    if root:
        inorder(root.left)
        print(root.val, end=" ")
        inorder(root.right)

# Tree: Root(4), Left(2), Right(6)
# 2->Left(1), 2->Right(3), 6->Left(5), 6->Right(7)`,
      java: `class TreeNode {
    int val;
    TreeNode left, right;
}

public void inorder(TreeNode root) {
    if (root != null) {
        inorder(root.left);
        System.out.print(root.val + " ");
        inorder(root.right);
    }
}

// Tree: Root(4), Left(2), Right(6)
// 2->Left(1), 2->Right(3), 6->Left(5), 6->Right(7)`,
      cpp: `struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
};

void inorder(TreeNode* root) {
    if (root) {
        inorder(root->left);
        cout << root->val << " ";
        inorder(root->right);
    }
}

// Tree: Root(4), Left(2), Right(6)
// 2->Left(1), 2->Right(3), 6->Left(5), 6->Right(7)`,
      c: `struct Node {
    int data;
    struct Node* left;
    struct Node* right;
};

void inorder(struct Node* root) {
    if (root != NULL) {
        inorder(root->left);
        printf("%d ", root->data);
        inorder(root->right);
    }
}

// Tree: Root(4), Left(2), Right(6)
// 2->Left(1), 2->Right(3), 6->Left(5), 6->Right(7)`
    }
  };

  // Reference to handle auto-submit on timer expiry
  const handleSubmitRef = useCallback(async () => {
    if (quizState !== 'active') return;
    
    setQuizState('submitting');
    
    // Save current answer before submitting
    const finalAnswers = { ...userAnswers };
    if (selectedAnswer !== null && questions[currentQuestionIndex]) {
      finalAnswers[questions[currentQuestionIndex].id] = selectedAnswer;
    }
    
    try {
      
      // Calculate anti-cheat data from violations
      const antiCheatData = {
        tab_switches: violations.filter(v => 
          v.type?.includes('Tab') || v.type?.includes('Window') || v.type?.includes('Focus')
        ).length,
        copy_attempts: violations.filter(v => v.type?.includes('Copy')).length,
        paste_attempts: violations.filter(v => v.type?.includes('Paste')).length
      };
      
      const response = await progressService.submitQuizServerSide(
        userId,
        courseId || 'data-structures',
        sessionId,
        finalAnswers,
        antiCheatData
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to submit quiz');
      }
      
      
      // Store results
      setResults(response);
      
      // Refresh progress from server to get updated quiz score
      try {
        await refreshProgress(courseId || 'data-structures');
      } catch (err) {
      }
      
      // Notify parent
      if (onQuizComplete) {
        onQuizComplete({
          score: response.score,
          breakdown: response.breakdown,
          answers: response.results,
          violations: violations,
          timestamp: new Date().toISOString()
        });
      }
      
      setQuizState('results');
      
    } catch (err) {
      console.error('❌ Failed to submit quiz:', err);
      setError(err.message);
      setQuizState('active'); // Allow retry
    }
  }, [quizState, userAnswers, selectedAnswer, questions, currentQuestionIndex, violations, userId, courseId, sessionId, refreshProgress, onQuizComplete]);

  // Start quiz - calls server to create session
  const startQuiz = useCallback(async () => {
    setQuizState('loading');
    setError(null);
    
    try {
      const response = await progressService.startQuizSession(userId, courseId || 'data-structures', 10);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to start quiz');
      }
      
      // Set session data
      setSessionId(response.session_id);
      setQuestions(response.questions);
      setServerExpiresAt(response.expires_at);
      setTimeRemaining(response.time_limit);
      
      // Reset state
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setSelectedAnswer(null);
      setResults(null);
      
      setQuizState('active');
      
    } catch (err) {
      console.error('❌ Failed to start quiz:', err);
      setError(err.message);
      setQuizState('idle');
    }
  }, [userId, courseId]);

  // Server-synced timer
  useEffect(() => {
    if (quizState !== 'active' || !serverExpiresAt) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiresAt = new Date(serverExpiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        // Auto-submit when time expires
        clearInterval(interval);
        handleSubmitRef();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [quizState, serverExpiresAt, handleSubmitRef]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      setUserAnswers(prev => ({
        ...prev,
        [questions[currentQuestionIndex].id]: selectedAnswer
      }));
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Load existing answer if going back
      const nextQuestion = questions[currentQuestionIndex + 1];
      setSelectedAnswer(userAnswers[nextQuestion?.id] ?? null);
    } else {
      handleSubmitRef();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer first
      if (selectedAnswer !== null) {
        setUserAnswers(prev => ({
          ...prev,
          [questions[currentQuestionIndex].id]: selectedAnswer
        }));
      }
      
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevQuestion = questions[currentQuestionIndex - 1];
      setSelectedAnswer(userAnswers[prevQuestion?.id] ?? null);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const questionCode = currentQuestion ? codeExamples[currentQuestion.id] : null;

  // ============== RENDER STATES ==============

  // Loading state
  if (quizState === 'loading') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-300 font-quantico-bold">Loading Quiz...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching questions from server</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-quantico-bold text-red-400 mb-4">Quiz Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => { setError(null); setQuizState('idle'); }}
            className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 text-emerald-200 font-quantico-bold py-3 px-6 rounded-xl transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Idle state - quiz not started
  if (quizState === 'idle') {
    return (
      <div className="min-h-full flex items-center justify-center p-3 sm:p-4">
        <div className="max-w-2xl w-full text-center">
          <h2 className="text-xl sm:text-2xl font-quantico-bold text-gray-100 mb-4 sm:mb-6">
            Data Structures Quiz
          </h2>
          
          {/* Show previous attempt with review option */}
          {previousAttempt && (
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-lg font-quantico-bold text-cyan-300 mb-2">
                {previousAttempt.score >= 95 ? '🏆' : previousAttempt.score >= 85 ? '🎖️' : '📊'} Previous Attempt
              </h3>
              <p className="text-cyan-200 mb-1">
                Score: <span className="text-2xl font-bold">{previousAttempt.score}%</span>
              </p>
              <p className="text-gray-400 text-xs mb-3">
                {previousAttempt.submitted_at ? new Date(previousAttempt.submitted_at).toLocaleString() : 'Recently'}
              </p>
              {previousAttempt.answers && previousAttempt.answers.length > 0 && (
                <button 
                  onClick={() => setQuizState('review')}
                  className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 hover:border-cyan-400/60 text-cyan-200 font-quantico-bold py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                >
                  📖 Review Answers
                </button>
              )}
              {previousAttempt.score >= 85 && (
                <p className="text-emerald-400 text-sm mt-2">✓ NFT Certificate Eligible!</p>
              )}
            </div>
          )}
          
          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-quantico-bold text-emerald-300 mb-3 sm:mb-4">Quiz Instructions</h3>
            <div className="text-left space-y-1 sm:space-y-2 text-gray-300 text-xs sm:text-sm">
              <p>• <strong className="text-gray-100">10 questions</strong> randomly selected from server</p>
              <p>• <strong className="text-gray-100">10 marks</strong> per question (Total: 100 marks)</p>
              <p>• <strong className="text-gray-100">15 minutes</strong> time limit (server-synced)</p>
              <p>• Topics: Arrays (1D & 2D), Stacks, Queues, Trees</p>
              <p>• Difficulty: Medium to High level</p>
              <p>• <strong className="text-emerald-400">🔒 Server-side scoring</strong> for security</p>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-emerald-300 font-quantico-bold mb-2 text-xs sm:text-sm">
              Preferred Programming Language (for code examples):
            </label>
            <select 
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="bg-black/40 border border-emerald-500/30 rounded-lg px-3 sm:px-4 py-2 text-gray-100 font-quantico w-full sm:w-48 text-sm"
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
          </div>

          <div className="space-y-4">
            <button 
              onClick={startQuiz}
              className="w-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/40 hover:border-yellow-400/60 text-yellow-200 font-quantico-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              {previousAttempt ? '🔄 Retake Quiz' : 'Start Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Submitting state
  if (quizState === 'submitting') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-yellow-300 font-quantico-bold">Submitting Quiz...</p>
          <p className="text-gray-400 text-sm mt-2">Server is calculating your score</p>
        </div>
      </div>
    );
  }

  // Results state
  if (quizState === 'results' && results) {
    return (
      <div className="h-full flex flex-col">
        {/* Results Header - Fixed */}
        <div className="text-center p-3 bg-black/60 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-quantico-bold text-gray-100 mb-3">
            Quiz Results
          </h2>
          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-4 inline-block">
            <div className="text-3xl font-quantico-bold text-emerald-300 mb-1">
              {results.score}%
            </div>
            <div className="text-base text-gray-100 mb-2">
              {results.score >= 95 ? "Perfect! 🏆" : results.score >= 85 ? "NFT Eligible! 🎖️" : results.score >= 70 ? "Great Job! 👍" : "Keep Learning! 📚"}
            </div>
            <div className="text-gray-300 text-sm mb-2">
              {results.correct_answers}/{results.total_questions} correct answers
            </div>
            <div className="text-gray-400 text-xs">
              Time taken: {Math.floor(results.time_taken / 60)}m {results.time_taken % 60}s
            </div>
            
            {/* NFT Eligibility Badge */}
            {results.passed && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-lg p-2 mt-2">
                <div className="flex items-center justify-center">
                  <span className="text-yellow-300 text-xs font-quantico-bold">🎭 NFT ELIGIBLE</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Results Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="max-w-4xl mx-auto">
            {/* Score Breakdown */}
            <div className="bg-black/30 border border-emerald-500/30 rounded-xl p-4 mb-4">
              <h3 className="text-base font-quantico-bold text-emerald-300 mb-3 text-center">📊 Score Breakdown (Server Calculated)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="text-center">
                  <div className="text-emerald-300 font-quantico-bold">Base Score</div>
                  <div className="text-gray-100">{results.breakdown?.base_score || 0}%</div>
                </div>
                <div className="text-center">
                  <div className="text-cyan-300 font-quantico-bold">Performance</div>
                  <div className="text-gray-100">+{results.breakdown?.bonus_points || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-emerald-300 font-quantico-bold">Time Bonus</div>
                  <div className="text-gray-100">+{results.breakdown?.time_bonus || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-cyan-300 font-quantico-bold">Difficulty</div>
                  <div className="text-gray-100">+{results.breakdown?.difficulty_bonus || 0}</div>
                </div>
                {results.breakdown?.anti_cheat_penalty > 0 && (
                  <div className="text-center">
                    <div className="text-red-400 font-quantico-bold">Penalty</div>
                    <div className="text-red-300">-{results.breakdown?.anti_cheat_penalty || 0}</div>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-base font-quantico-bold text-emerald-300 mb-3 text-center">Review Your Answers</h3>
            <div className="space-y-3">
              {results.results?.map((result, index) => (
                <div key={result.question_id} className={`border rounded-lg p-3 ${result.is_correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-400">Question {index + 1} - {result.topic}</span>
                    <span className={`text-xs font-quantico-bold ${result.is_correct ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.is_correct ? '✓ Correct (+10%)' : '✗ Incorrect (0%)'}
                    </span>
                  </div>
                  <p className="text-gray-100 mb-2 text-sm leading-relaxed">{result.question}</p>
                  
                  <div className="text-xs space-y-1">
                    <p className="text-gray-300">
                      Your answer: 
                      <span className={result.user_answer !== null ? (result.is_correct ? ' text-emerald-400' : ' text-red-400') : ' text-gray-400'}>
                        {result.user_answer !== null 
                          ? ` ${String.fromCharCode(65 + result.user_answer)}. ${result.options[result.user_answer]}`
                          : ' No answer'}
                      </span>
                    </p>
                    {!result.is_correct && (
                      <p className="text-gray-300">
                        Correct answer: 
                        <span className="text-emerald-400">
                          {` ${String.fromCharCode(65 + result.correct_answer)}. ${result.options[result.correct_answer]}`}
                        </span>
                      </p>
                    )}
                    <p className="text-gray-400 text-xs mt-1 italic">{result.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer - Fixed */}
        <div className="text-center p-3 bg-black/60 border-t border-white/10 flex-shrink-0">
          <button 
            onClick={() => onNavigate('course', { courseId: 'data-structures' })}
            className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold py-3 px-6 rounded-lg transition-all duration-300 text-sm"
          >
            ✓ Complete & Return to Course
          </button>
        </div>
      </div>
    );
  }

  // Review previous attempt state
  if (quizState === 'review' && previousAttempt) {
    const reviewAnswers = previousAttempt.answers || [];
    const correctCount = reviewAnswers.filter(a => a.is_correct).length;
    
    return (
      <div className="h-full flex flex-col">
        {/* Review Header - Fixed */}
        <div className="text-center p-3 bg-black/60 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-quantico-bold text-gray-100 mb-3">
            📖 Previous Attempt Review
          </h2>
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4 inline-block">
            <div className="text-3xl font-quantico-bold text-cyan-300 mb-1">
              {previousAttempt.score}%
            </div>
            <div className="text-base text-gray-100 mb-2">
              {previousAttempt.score >= 95 ? "Perfect! 🏆" : previousAttempt.score >= 85 ? "NFT Eligible! 🎖️" : previousAttempt.score >= 70 ? "Great Job! 👍" : "Keep Learning! 📚"}
            </div>
            <div className="text-gray-300 text-sm mb-2">
              {correctCount}/{reviewAnswers.length} correct answers
            </div>
            <div className="text-gray-400 text-xs">
              Attempted: {previousAttempt.submitted_at ? new Date(previousAttempt.submitted_at).toLocaleString() : 'Recently'}
            </div>
          </div>
        </div>

        {/* Scrollable Review Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-base font-quantico-bold text-cyan-300 mb-3 text-center">Your Answers</h3>
            <div className="space-y-3">
              {reviewAnswers.map((answer, index) => (
                <div key={answer.question_id || index} className={`border rounded-lg p-3 ${answer.is_correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-400">Question {index + 1}{answer.topic ? ` - ${answer.topic}` : ''}</span>
                    <span className={`text-xs font-quantico-bold ${answer.is_correct ? 'text-emerald-400' : 'text-red-400'}`}>
                      {answer.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <p className="text-gray-100 mb-2 text-sm leading-relaxed">{answer.question}</p>
                  
                  <div className="text-xs space-y-1">
                    {/* Your Answer */}
                    <p className="text-gray-300">
                      Your answer: 
                      <span className={answer.user_answer !== null && answer.user_answer !== undefined ? (answer.is_correct ? ' text-emerald-400' : ' text-red-400') : ' text-gray-400'}>
                        {answer.user_answer !== null && answer.user_answer !== undefined && answer.options
                          ? ` ${String.fromCharCode(65 + answer.user_answer)}. ${answer.options[answer.user_answer]}`
                          : ' No answer'}
                      </span>
                    </p>
                    
                    {/* Correct Answer (show if wrong) */}
                    {!answer.is_correct && answer.options && answer.correct_answer !== undefined && (
                      <p className="text-gray-300">
                        Correct answer: 
                        <span className="text-emerald-400">
                          {` ${String.fromCharCode(65 + answer.correct_answer)}. ${answer.options[answer.correct_answer]}`}
                        </span>
                      </p>
                    )}
                    
                    {/* Explanation */}
                    {answer.explanation && (
                      <p className="text-gray-400 text-xs mt-1 italic">{answer.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer - Fixed */}
        <div className="flex justify-center gap-3 p-3 bg-black/60 border-t border-white/10 flex-shrink-0">
          <button 
            onClick={() => setQuizState('idle')}
            className="bg-gradient-to-r from-gray-500/20 to-gray-600/20 hover:from-gray-500/30 hover:to-gray-600/30 border border-gray-500/40 text-gray-200 font-quantico-bold py-3 px-6 rounded-lg transition-all duration-300 text-sm"
          >
            ← Back
          </button>
          <button 
            onClick={startQuiz}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/40 hover:border-yellow-400/60 text-yellow-200 font-quantico-bold py-3 px-6 rounded-lg transition-all duration-300 text-sm"
          >
            🔄 Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  // Active quiz state
  return (
    <div className="h-full flex flex-col">
      {/* Quiz Header - Fixed */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-black/60 border-b border-white/10 flex-shrink-0 gap-2 sm:gap-0">
        <div>
          <h2 className="text-base sm:text-lg font-quantico-bold text-gray-100">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="text-emerald-300 text-xs">
            Topic: {currentQuestion?.topic} | Difficulty: {currentQuestion?.difficulty}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <div className={`text-base sm:text-lg font-quantico-bold ${timeRemaining < 300 ? 'text-red-400 animate-pulse' : 'text-emerald-300'}`}>
            ⏱ {formatTime(timeRemaining)}
          </div>
          <div className="text-xs text-gray-400">Server-Synced Timer</div>
        </div>
      </div>

      {/* Progress Bar - Fixed */}
      <div className="w-full bg-black/40 h-1 flex-shrink-0 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-green-400 h-1 transition-all duration-300 shadow-lg shadow-emerald-500/50"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="max-w-5xl mx-auto">
          {/* Question Content */}
          <div className="bg-black/30 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg text-gray-100 font-quantico-bold mb-3 sm:mb-4 leading-relaxed">
              {currentQuestion?.question}
            </h3>

            {/* Code Block if present */}
            {questionCode && (
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
                  <h4 className="text-emerald-300 font-quantico-bold text-xs sm:text-sm">Code Example:</h4>
                  <select 
                    value={currentLanguage}
                    onChange={(e) => setCurrentLanguage(e.target.value)}
                    className="bg-black/40 border border-emerald-500/30 rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-100 font-quantico w-full sm:w-auto"
                  >
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                </div>
                <div className="bg-black/60 border border-gray-700 rounded-lg p-3 sm:p-4 overflow-x-auto max-h-48 sm:max-h-64 overflow-y-auto">
                  <pre className="text-xs sm:text-sm text-gray-300 font-mono">
                    <code>{questionCode[currentLanguage]}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-2 sm:space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 text-xs sm:text-sm leading-relaxed ${
                    selectedAnswer === index 
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300' 
                      : 'border-gray-500/30 bg-black/20 text-gray-300 hover:border-emerald-500/40 hover:bg-black/30'
                  }`}
                >
                  <span className="font-quantico-bold mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer - Fixed */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-black/80 border-t border-white/10 flex-shrink-0 gap-2">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-lg font-quantico-bold transition-all duration-300 text-sm ${
              currentQuestionIndex > 0
                ? 'bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/40 text-gray-200'
                : 'bg-gray-700/20 border border-gray-600/40 text-gray-500 cursor-not-allowed'
            }`}
          >
            ← Previous
          </button>
          <div className="text-gray-400 text-xs sm:text-sm">
            Answered: {Object.keys(userAnswers).length}/{questions.length}
          </div>
        </div>
        <button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
          className={`px-4 py-2 rounded-lg font-quantico-bold transition-all duration-300 text-sm ${
            selectedAnswer !== null
              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/40 hover:border-yellow-400/60 text-yellow-200'
              : 'bg-gray-600/20 border border-gray-500/40 text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Submit Quiz ✓'}
        </button>
      </div>
    </div>
  );
}

export default QuizContent;
