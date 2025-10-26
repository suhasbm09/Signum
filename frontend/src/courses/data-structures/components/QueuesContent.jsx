import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import QueueVisualization from '../visualizations/QueueVisualization';
import CompletionTracker from '../../../components/CompletionTracker';

const QueuesContent = ({ onNavigate, courseId }) => {
  const moduleId = 'queues';

  // Language state for each code section
  const [implementationLang, setImplementationLang] = useState('python');
  const [circularLang, setCircularLang] = useState('python');
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
    <CompletionTracker courseId={courseId} moduleId={moduleId} contentLength="x-long">
      <div className="min-h-screen  text-white p-8">
        <div className="w-full mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4 animate-slideInDown">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">
              Queues - FIFO Data Structure
            </h1>
            <p className="text-xl text-gray-300">
              Master the First In First Out principle
            </p>
          </div>

        {/* Introduction */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10 animate-slideInUp">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">What is a Queue?</h2>
          
          <div className="space-y-6">
            <p className="text-lg text-gray-300 leading-relaxed">
              A <span className="text-emerald-400 font-semibold">Queue</span> is a linear data structure that follows the <span className="text-emerald-400 font-semibold">FIFO (First In First Out)</span> principle. 
              Think of it like a line of people waiting - the first person to join is the first person to be served.
            </p>

            {/* Visual Representation */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/30">
              <h3 className="text-xl font-semibold mb-4 text-emerald-300">Visual Representation</h3>
              <div className="flex flex-col items-center gap-6">
                {/* Queue visualization */}
                <div className="flex items-center gap-2">
                  <div className="text-sm text-emerald-400 font-semibold">Front →</div>
                  {[10, 20, 30, 40, 50].map((value, index) => (
                    <div
                      key={index}
                      className="w-20 h-20 border-2 border-emerald-500 rounded-lg flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                    >
                      <span className="text-xl font-bold text-emerald-300">{value}</span>
                    </div>
                  ))}
                  <div className="text-sm text-emerald-400 font-semibold">← Rear</div>
                </div>
                
                {/* Operations */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl text-gray-300 text-sm">
                  <div className="bg-emerald-500/10 p-3 rounded border border-emerald-500/30">
                    <strong className="text-emerald-400">enqueue(60)</strong> → Add 60 to rear
                  </div>
                  <div className="bg-red-500/10 p-3 rounded border border-red-500/30">
                    <strong className="text-red-400">dequeue()</strong> → Remove 10 from front
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded border border-blue-500/30">
                    <strong className="text-blue-400">front()</strong> → View 10 (no removal)
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded border border-purple-500/30">
                    <strong className="text-purple-400">isEmpty()</strong> → Check if empty
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed">
              Queue operations have <span className="text-emerald-400 font-semibold">O(1)</span> time complexity when using linked lists or circular arrays.
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
                  <span className="text-2xl">📥</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Enqueue</h3>
              </div>
              <p className="text-gray-300 mb-2">Add element to the rear of queue</p>
              <code className="text-emerald-400 bg-gray-800 px-2 py-1 rounded text-sm">Time: O(1)</code>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">📤</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Dequeue</h3>
              </div>
              <p className="text-gray-300 mb-2">Remove and return front element</p>
              <code className="text-emerald-400 bg-gray-800 px-2 py-1 rounded text-sm">Time: O(1)</code>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">👁️</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Front / Peek</h3>
              </div>
              <p className="text-gray-300 mb-2">View front element without removing</p>
              <code className="text-emerald-400 bg-gray-800 px-2 py-1 rounded text-sm">Time: O(1)</code>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">❓</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">isEmpty</h3>
              </div>
              <p className="text-gray-300 mb-2">Check if queue is empty</p>
              <code className="text-emerald-400 bg-gray-800 px-2 py-1 rounded text-sm">Time: O(1)</code>
            </div>

          </div>
        </section>

        {/* Types of Queues */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Types of Queues</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Simple Queue</h3>
              <p className="text-gray-300">
                Standard FIFO queue with enqueue at rear and dequeue from front
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Circular Queue</h3>
              <p className="text-gray-300">
                Last position connects to first, efficient memory utilization
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Priority Queue</h3>
              <p className="text-gray-300">
                Elements dequeued based on priority, not insertion order
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">⏭️</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Deque (Double-Ended)</h3>
              <p className="text-gray-300">
                Add/remove from both front and rear ends
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Visualizer */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-emerald-500/20 shadow-xl shadow-emerald-500/10 overflow-hidden">
          <QueueVisualization />
        </section>

        {/* Implementation */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Simple Queue Implementation</h2>
          
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              Queues can be implemented using arrays, linked lists, or built-in collections:
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
    int front, rear;
} Queue;

// Initialize queue
void init(Queue* q) {
    q->front = -1;
    q->rear = -1;
}

// Check if queue is empty
bool isEmpty(Queue* q) {
    return q->front == -1;
}

// Check if queue is full
bool isFull(Queue* q) {
    return q->rear == MAX_SIZE - 1;
}

// Enqueue element
void enqueue(Queue* q, int value) {
    if (isFull(q)) {
        printf("Queue overflow\\n");
        return;
    }
    if (isEmpty(q)) {
        q->front = 0;
    }
    q->items[++(q->rear)] = value;
}

// Dequeue element
int dequeue(Queue* q) {
    if (isEmpty(q)) {
        printf("Queue underflow\\n");
        return -1;
    }
    int value = q->items[q->front];
    if (q->front == q->rear) {
        // Queue becomes empty
        q->front = q->rear = -1;
    } else {
        q->front++;
    }
    return value;
}

// Get front element
int front(Queue* q) {
    if (isEmpty(q)) {
        printf("Queue is empty\\n");
        return -1;
    }
    return q->items[q->front];
}

// Usage
int main() {
    Queue q;
    init(&q);
    
    enqueue(&q, 10);
    enqueue(&q, 20);
    enqueue(&q, 30);
    
    printf("Front: %d\\n", front(&q));     // Output: 10
    printf("Dequeue: %d\\n", dequeue(&q)); // Output: 10
    printf("Front: %d\\n", front(&q));     // Output: 20
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {implementationLang === 'cpp' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <iostream>
#include <queue>
using namespace std;

// Method 1: Using STL queue
void usingSTL() {
    queue<int> q;
    
    q.push(10);
    q.push(20);
    q.push(30);
    
    cout << "Front: " << q.front() << endl;  // Output: 10
    q.pop();
    cout << "Front after pop: " << q.front() << endl;  // Output: 20
    cout << "Size: " << q.size() << endl;  // Output: 2
}

// Method 2: Custom implementation using deque
#include <deque>

class Queue {
private:
    deque<int> items;
    
public:
    void enqueue(int value) {
        items.push_back(value);
    }
    
    int dequeue() {
        if (isEmpty()) {
            throw runtime_error("Queue underflow");
        }
        int value = items.front();
        items.pop_front();
        return value;
    }
    
    int front() {
        if (isEmpty()) {
            throw runtime_error("Queue is empty");
        }
        return items.front();
    }
    
    bool isEmpty() {
        return items.empty();
    }
    
    int size() {
        return items.size();
    }
};

int main() {
    Queue q;
    q.enqueue(10);
    q.enqueue(20);
    q.enqueue(30);
    
    cout << "Front: " << q.front() << endl;     // Output: 10
    cout << "Dequeue: " << q.dequeue() << endl; // Output: 10
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {implementationLang === 'python' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()
    
    def enqueue(self, item):
        """Add item to rear of queue"""
        self.items.append(item)
    
    def dequeue(self):
        """Remove and return front item"""
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.items.popleft()
    
    def front(self):
        """Return front item without removing"""
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.items[0]
    
    def is_empty(self):
        """Check if queue is empty"""
        return len(self.items) == 0
    
    def size(self):
        """Return number of items"""
        return len(self.items)

# Usage
queue = Queue()
queue.enqueue(10)
queue.enqueue(20)
queue.enqueue(30)

print(f"Front: {queue.front()}")       # Output: 10
print(f"Dequeue: {queue.dequeue()}")   # Output: 10
print(f"Size: {queue.size()}")         # Output: 2

# Alternative: Using deque directly
from collections import deque
q = deque()
q.append(10)        # enqueue
q.append(20)
front = q[0]        # front
popped = q.popleft()  # dequeue`}
                </pre>
              </div>
            )}

            {implementationLang === 'java' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`import java.util.Queue;
import java.util.LinkedList;

// Method 1: Using built-in Queue (LinkedList implementation)
class UsingBuiltIn {
    public static void main(String[] args) {
        Queue<Integer> queue = new LinkedList<>();
        
        queue.offer(10);  // or add()
        queue.offer(20);
        queue.offer(30);
        
        System.out.println("Front: " + queue.peek());  // Output: 10
        System.out.println("Dequeue: " + queue.poll()); // Output: 10
        System.out.println("Size: " + queue.size());   // Output: 2
    }
}

// Method 2: Custom implementation
class CustomQueue {
    private LinkedList<Integer> items;
    
    public CustomQueue() {
        items = new LinkedList<>();
    }
    
    public void enqueue(int value) {
        items.addLast(value);
    }
    
    public int dequeue() {
        if (isEmpty()) {
            throw new RuntimeException("Queue underflow");
        }
        return items.removeFirst();
    }
    
    public int front() {
        if (isEmpty()) {
            throw new RuntimeException("Queue is empty");
        }
        return items.getFirst();
    }
    
    public boolean isEmpty() {
        return items.isEmpty();
    }
    
    public int size() {
        return items.size();
    }
}

// Usage
public class QueueExample {
    public static void main(String[] args) {
        CustomQueue q = new CustomQueue();
        q.enqueue(10);
        q.enqueue(20);
        q.enqueue(30);
        
        System.out.println("Front: " + q.front());     // Output: 10
        System.out.println("Dequeue: " + q.dequeue()); // Output: 10
    }
}`}
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* Circular Queue */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Circular Queue Implementation</h2>
          
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              Circular queues efficiently utilize memory by connecting the last position back to the first:
            </p>

            <LanguageSelector currentLang={circularLang} setLang={setCircularLang} />

            {circularLang === 'c' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <stdio.h>
#include <stdbool.h>

#define MAX_SIZE 5

typedef struct {
    int items[MAX_SIZE];
    int front, rear, count;
} CircularQueue;

void init(CircularQueue* q) {
    q->front = 0;
    q->rear = -1;
    q->count = 0;
}

bool isEmpty(CircularQueue* q) {
    return q->count == 0;
}

bool isFull(CircularQueue* q) {
    return q->count == MAX_SIZE;
}

void enqueue(CircularQueue* q, int value) {
    if (isFull(q)) {
        printf("Queue is full\\n");
        return;
    }
    q->rear = (q->rear + 1) % MAX_SIZE;
    q->items[q->rear] = value;
    q->count++;
}

int dequeue(CircularQueue* q) {
    if (isEmpty(q)) {
        printf("Queue is empty\\n");
        return -1;
    }
    int value = q->items[q->front];
    q->front = (q->front + 1) % MAX_SIZE;
    q->count--;
    return value;
}

int main() {
    CircularQueue q;
    init(&q);
    
    enqueue(&q, 10);
    enqueue(&q, 20);
    enqueue(&q, 30);
    
    printf("Dequeue: %d\\n", dequeue(&q)); // 10
    enqueue(&q, 40);
    enqueue(&q, 50);
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {circularLang === 'cpp' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <iostream>
#include <vector>
using namespace std;

class CircularQueue {
private:
    vector<int> items;
    int front, rear, capacity, count;
    
public:
    CircularQueue(int size) {
        items.resize(size);
        capacity = size;
        front = 0;
        rear = -1;
        count = 0;
    }
    
    void enqueue(int value) {
        if (isFull()) {
            cout << "Queue overflow" << endl;
            return;
        }
        rear = (rear + 1) % capacity;
        items[rear] = value;
        count++;
    }
    
    int dequeue() {
        if (isEmpty()) {
            throw runtime_error("Queue underflow");
        }
        int value = items[front];
        front = (front + 1) % capacity;
        count--;
        return value;
    }
    
    int getFront() {
        if (isEmpty()) {
            throw runtime_error("Queue is empty");
        }
        return items[front];
    }
    
    bool isEmpty() {
        return count == 0;
    }
    
    bool isFull() {
        return count == capacity;
    }
    
    int size() {
        return count;
    }
};

int main() {
    CircularQueue q(5);
    q.enqueue(10);
    q.enqueue(20);
    q.enqueue(30);
    
    cout << "Dequeue: " << q.dequeue() << endl;  // 10
    q.enqueue(40);
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {circularLang === 'python' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`class CircularQueue:
    def __init__(self, size):
        self.items = [None] * size
        self.capacity = size
        self.front = 0
        self.rear = -1
        self.count = 0
    
    def enqueue(self, value):
        """Add item to rear"""
        if self.is_full():
            raise OverflowError("Queue is full")
        self.rear = (self.rear + 1) % self.capacity
        self.items[self.rear] = value
        self.count += 1
    
    def dequeue(self):
        """Remove and return front item"""
        if self.is_empty():
            raise IndexError("Queue is empty")
        value = self.items[self.front]
        self.front = (self.front + 1) % self.capacity
        self.count -= 1
        return value
    
    def get_front(self):
        """Return front item"""
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.items[self.front]
    
    def is_empty(self):
        return self.count == 0
    
    def is_full(self):
        return self.count == self.capacity
    
    def size(self):
        return self.count

# Usage
q = CircularQueue(5)
q.enqueue(10)
q.enqueue(20)
q.enqueue(30)

print(f"Dequeue: {q.dequeue()}")  # Output: 10
q.enqueue(40)
print(f"Size: {q.size()}")        # Output: 3`}
                </pre>
              </div>
            )}

            {circularLang === 'java' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`public class CircularQueue {
    private int[] items;
    private int front, rear, capacity, count;
    
    public CircularQueue(int size) {
        items = new int[size];
        capacity = size;
        front = 0;
        rear = -1;
        count = 0;
    }
    
    public void enqueue(int value) {
        if (isFull()) {
            throw new RuntimeException("Queue overflow");
        }
        rear = (rear + 1) % capacity;
        items[rear] = value;
        count++;
    }
    
    public int dequeue() {
        if (isEmpty()) {
            throw new RuntimeException("Queue underflow");
        }
        int value = items[front];
        front = (front + 1) % capacity;
        count--;
        return value;
    }
    
    public int front() {
        if (isEmpty()) {
            throw new RuntimeException("Queue is empty");
        }
        return items[front];
    }
    
    public boolean isEmpty() {
        return count == 0;
    }
    
    public boolean isFull() {
        return count == capacity;
    }
    
    public int size() {
        return count;
    }
    
    public static void main(String[] args) {
        CircularQueue q = new CircularQueue(5);
        q.enqueue(10);
        q.enqueue(20);
        q.enqueue(30);
        
        System.out.println("Dequeue: " + q.dequeue());  // 10
        q.enqueue(40);
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
              <div className="text-3xl mb-3">🖨️</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Print Queue</h3>
              <p className="text-gray-300">
                Managing print jobs - first document sent is first printed
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">BFS Algorithm</h3>
              <p className="text-gray-300">
                Breadth-First Search for graphs/trees, shortest path finding
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">💻</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">CPU Scheduling</h3>
              <p className="text-gray-300">
                Round-robin scheduling, process management in operating systems
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">📞</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Call Center</h3>
              <p className="text-gray-300">
                Customer service queues - handle calls in order received
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">🌐</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Network Buffers</h3>
              <p className="text-gray-300">
                Data packet transmission, maintaining packet order
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">⌨️</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">IO Buffers</h3>
              <p className="text-gray-300">
                Keyboard buffer, handling input/output operations sequentially
              </p>
            </div>
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
                  <th className="p-4 text-left text-emerald-300 font-semibold">Array (Simple)</th>
                  <th className="p-4 text-left text-emerald-300 font-semibold">Linked List / Circular</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Enqueue</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Dequeue</td>
                  <td className="p-4">
                    <code className="text-yellow-400 bg-gray-800 px-3 py-1 rounded">O(n)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Front/Peek</td>
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
                  <td className="p-4">
                    <code className="text-yellow-400 bg-gray-800 px-3 py-1 rounded">O(n)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-yellow-400 bg-gray-800 px-3 py-1 rounded">O(n)</code>
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-gray-400 text-sm mt-3">
              * Simple array dequeue is O(n) due to shifting. Use circular queue or linked list for O(1).
            </p>
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
                <span><strong>Fair Ordering:</strong> First-come, first-served principle</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Fast Operations:</strong> O(1) enqueue/dequeue with proper implementation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Natural for Tasks:</strong> Perfect for task scheduling and buffering</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Simple Concept:</strong> Easy to understand and implement</span>
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
                <span><strong>Fixed Size:</strong> Array-based queues have size limit</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>No Random Access:</strong> Can only access front element</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Memory Waste:</strong> Simple array queues waste space after dequeue</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Limited Use:</strong> Only suitable for FIFO scenarios</span>
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
                <h3 className="text-xl font-semibold text-emerald-300">1. Implement Queue using Stacks</h3>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">Easy</span>
              </div>
              <p className="text-gray-300 mb-3">
                Build a queue data structure using two stacks.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Microsoft</span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">2. Design Circular Queue</h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Medium</span>
              </div>
              <p className="text-gray-300 mb-3">
                Implement circular queue with fixed size and all operations.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Google</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Facebook</span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">3. First Non-Repeating Character in Stream</h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Medium</span>
              </div>
              <p className="text-gray-300 mb-3">
                Find first non-repeating character in a stream of characters.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Apple</span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">4. Sliding Window Maximum</h3>
                <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">Hard</span>
              </div>
              <p className="text-gray-300 mb-3">
                Find maximum in all sliding windows of size k using deque.
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
            Fantastic progress! You've mastered fundamental linear data structures. Now let's explore hierarchical data structures.
          </p>
          
          {/* Continue Navigation Button */}
          <button
            onClick={() => onNavigate('course', { courseId, topic: 'trees-intro' })}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span className="text-lg">Continue to Trees →</span>
          </button>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer hover-lift">
              <div className="text-2xl mb-2">🔗</div>
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">Linked Lists</h3>
              <p className="text-gray-400 text-sm">Dynamic memory structures</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer hover-lift">
              <div className="text-2xl mb-2">🌳</div>
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">Trees</h3>
              <p className="text-gray-400 text-sm">Hierarchical data structures</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer hover-lift">
              <div className="text-2xl mb-2">🕸️</div>
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">Graphs</h3>
              <p className="text-gray-400 text-sm">Network structures</p>
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

export default QueuesContent;
