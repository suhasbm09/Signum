import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import CompletionTracker from '../../../components/CompletionTracker';
import CodeView from '../../../components/CodeView';
import SinglyLinkedListVisualization from '../visualizations/SinglyLinkedListVisualization';

const LinkedListSinglyContent = ({ courseId, onNavigate }) => {
  const moduleId = 'linked-list-singly';
  const [implementationLang, setImplementationLang] = useState('python');
  const [applicationsLang, setApplicationsLang] = useState('python');
  const [insertionLang, setInsertionLang] = useState('python');
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Language selector component
  const LanguageSelector = ({ currentLang, setLang }) => (
    <div className="flex gap-2 mb-4">
      {['C', 'C++', 'Python', 'Java'].map((lang) => (
        <button
          key={lang}
          onClick={() => setLang(lang.toLowerCase().replace('++', 'pp'))}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            currentLang === lang.toLowerCase().replace('++', 'pp')
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
              : 'bg-black/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
  
  return (
    <CompletionTracker courseId={courseId} moduleId={moduleId} contentLength="x-long">
      <div className="text-white p-4 sm:p-6 lg:p-8" style={{ contain: 'layout style' }}>
        <div className="w-full mx-auto space-y-6 sm:space-y-8">
        
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-400">
              Singly Linked Lists
            </h1>
            <p className="text-lg sm:text-xl text-gray-300">
              Master dynamic data structures with efficient insertions and deletions
            </p>
          </div>

        {/* Introduction */}
        <section className="bg-black/80 rounded-xl p-6 sm:p-8 border border-emerald-500/20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-emerald-400">What is a Singly Linked List?</h2>
  
  <div className="space-y-6">
    <p className="text-lg text-gray-300 leading-relaxed">
      A <span className="text-emerald-400 font-semibold">Singly Linked List</span> is a linear data structure where each node contains 
      a <span className="text-emerald-400 font-semibold">value</span> and a <span className="text-emerald-400 font-semibold">next pointer</span> to the following node. 
      This enables unidirectional traversal from head to tail.
    </p>

            {/* Visual Representation */}
            <div className="bg-black/80 rounded-xl p-6 border border-emerald-500/20">
      <h3 className="text-xl font-semibold mb-4 text-emerald-300">Visual Representation</h3>
      <div className="flex justify-center items-center gap-4">
        {/* Singly Linked List visualization */}
        <div className="flex items-center gap-2">
          <div className="text-sm text-emerald-400 font-semibold">HEAD →</div>
          {[10, 20, 30, 40].map((value, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-24 h-16 border-2 border-emerald-500 rounded-lg flex flex-col items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 transition-all">
                <div className="flex justify-center w-full px-2">
                  <span className="text-xs text-green-400">next</span>
                </div>
                <span className="text-lg font-bold text-emerald-300">{value}</span>
              </div>
              {index < 3 && <div className="text-emerald-400">→</div>}
            </div>
          ))}
          <div className="text-gray-400">NULL</div>
        </div>
        
        {/* Operations */}
        <div className="space-y-3 text-gray-300 text-sm">
          <div className="bg-emerald-500/10 p-3 rounded border border-emerald-500/30">
            <strong className="text-emerald-400">insertAtHead(5)</strong> → Add 5 at beginning
          </div>
          <div className="bg-red-500/10 p-3 rounded border border-red-500/30">
            <strong className="text-red-400">deleteHead()</strong> → Remove first node
          </div>
          <div className="bg-green-500/10 p-3 rounded border border-green-500/30">
            <strong className="text-green-400">search(20)</strong> → Find node with value 20
          </div>
        </div>
      </div>
    </div>

            <p className="text-gray-300 leading-relaxed">
              Singly linked lists provide <span className="text-emerald-400">O(1) insertion/deletion at head</span> and 
              efficient dynamic memory allocation. Unlike arrays, they require <span className="text-yellow-400">O(n) traversal</span> to access elements.
            </p>
          </div>
        </section>

        {/* Key Concepts */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-emerald-400">Core Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            <div className="bg-black/80 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">⤴️</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Insert at Head</h3>
              </div>
              <p className="text-gray-300 mb-2">Add element at the beginning</p>
              <code className="text-emerald-400 bg-black/80 px-2 py-1 rounded text-sm">Time: O(1)</code>
            </div>

            <div className="bg-black/80 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">⤵️</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Insert at Tail</h3>
              </div>
              <p className="text-gray-300 mb-2">Add element at the end</p>
              <code className="text-yellow-400 bg-black/80 px-2 py-1 rounded text-sm">Time: O(n)</code>
            </div>

            <div className="bg-black/80 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">🗑️</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Delete Head</h3>
              </div>
              <p className="text-gray-300 mb-2">Remove first element</p>
              <code className="text-emerald-400 bg-black/80 px-2 py-1 rounded text-sm">Time: O(1)</code>
            </div>

            <div className="bg-black/80 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Search</h3>
              </div>
              <p className="text-gray-300 mb-2">Find element by value</p>
              <code className="text-yellow-400 bg-black/80 px-2 py-1 rounded text-sm">Time: O(n)</code>
            </div>

          </div>
        </section>

        {/* Interactive Visualizer */}
        <section className="bg-black/80 rounded-xl p-4 sm:p-6 border border-emerald-500/20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-emerald-400">Interactive Singly Linked List Visualizer</h2>
          <div className="bg-black/60 rounded-lg border border-emerald-500/30 p-3 min-w-0">
            <SinglyLinkedListVisualization embedded={true} />
          </div>
        </section>

        {/* Implementation */}
        <section className="bg-black/80 rounded-2xl p-8 border border-emerald-500/20 ">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Implementation</h2>
          
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              Linked lists can be implemented using nodes with value and next pointer. Here's a complete implementation:
            </p>

            <LanguageSelector currentLang={implementationLang} setLang={setImplementationLang} />

            {implementationLang === 'c' && (
              <div className="bg-black/90 rounded-lg p-5 border border-emerald-500/40 shadow-md shadow-emerald-500/5 overflow-x-auto">
                <CodeView code={`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node* next;
} Node;

Node* createNode(int data) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->data = data;
    newNode->next = NULL;
    return newNode;
}

typedef struct {
    Node* head;
} LinkedList;

void initList(LinkedList* list) {
    list->head = NULL;
}

void insertAtHead(LinkedList* list, int data) {
    Node* newNode = createNode(data);
    newNode->next = list->head;
    list->head = newNode;
}

void insertAtTail(LinkedList* list, int data) {
    Node* newNode = createNode(data);
    if (list->head == NULL) {
        list->head = newNode;
        return;
    }
    
    Node* current = list->head;
    while (current->next != NULL) {
        current = current->next;
    }
    current->next = newNode;
}

int deleteHead(LinkedList* list) {
    if (list->head == NULL) {
        printf("List is empty\\n");
        return -1;
    }
    
    Node* temp = list->head;
    int data = temp->data;
    list->head = list->head->next;
    free(temp);
    return data;
}

void printList(LinkedList* list) {
    Node* current = list->head;
    while (current != NULL) {
        printf("%d -> ", current->data);
        current = current->next;
    }
    printf("NULL\\n");
}

// Usage
int main() {
    LinkedList list;
    initList(&list);
    
    insertAtHead(&list, 30);
    insertAtHead(&list, 20);
    insertAtHead(&list, 10);
    insertAtTail(&list, 40);
    
    printList(&list);  // Output: 10 -> 20 -> 30 -> 40 -> NULL
    
    printf("Deleted: %d\\n", deleteHead(&list));  // Output: 10
    printList(&list);  // Output: 20 -> 30 -> 40 -> NULL
    
    return 0;
}`} language={implementationLang} />
              </div>
            )}

            {implementationLang === 'cpp' && (
              <div className="bg-black/90 rounded-lg p-5 border border-emerald-500/40 shadow-md shadow-emerald-500/5 overflow-x-auto">
                <CodeView code={`#include <iostream>
using namespace std;

class Node {
public:
    int data;
    Node* next;
    
    Node(int data) : data(data), next(nullptr) {}
};

class LinkedList {
private:
    Node* head;
    
public:
    LinkedList() : head(nullptr) {}
    
    void insertAtHead(int data) {
        Node* newNode = new Node(data);
        newNode->next = head;
        head = newNode;
    }
    
    void insertAtTail(int data) {
        Node* newNode = new Node(data);
        if (head == nullptr) {
            head = newNode;
            return;
        }
        
        Node* current = head;
        while (current->next != nullptr) {
            current = current->next;
        }
        current->next = newNode;
    }
    
    int deleteHead() {
        if (head == nullptr) {
            throw runtime_error("List is empty");
        }
        
        Node* temp = head;
        int data = temp->data;
        head = head->next;
        delete temp;
        return data;
    }
    
    bool search(int data) {
        Node* current = head;
        while (current != nullptr) {
            if (current->data == data) {
                return true;
            }
            current = current->next;
        }
        return false;
    }
    
    void print() {
        Node* current = head;
        while (current != nullptr) {
            cout << current->data << " -> ";
            current = current->next;
        }
        cout << "NULL" << endl;
    }
    
    ~LinkedList() {
        while (head != nullptr) {
            deleteHead();
        }
    }
};

// Usage
int main() {
    LinkedList list;
    list.insertAtHead(30);
    list.insertAtHead(20);
    list.insertAtHead(10);
    list.insertAtTail(40);
    
    list.print();  // Output: 10 -> 20 -> 30 -> 40 -> NULL
    
    cout << "Deleted: " << list.deleteHead() << endl;  // Output: 10
    cout << "Search 20: " << list.search(20) << endl;  // Output: 1 (true)
    
    return 0;
}`} language={implementationLang} />
              </div>
            )}

            {implementationLang === 'python' && (
              <div className="bg-black/90 rounded-lg p-5 border border-emerald-500/40 shadow-md shadow-emerald-500/5 overflow-x-auto">
                <CodeView code={`class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def insert_at_head(self, data):
        """Add node at the beginning"""
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
    
    def insert_at_tail(self, data):
        """Add node at the end"""
        new_node = Node(data)
        if self.head is None:
            self.head = new_node
            return
        
        current = self.head
        while current.next is not None:
            current = current.next
        current.next = new_node
    
    def delete_head(self):
        """Remove and return first node"""
        if self.head is None:
            raise IndexError("List is empty")
        
        temp = self.head
        self.head = self.head.next
        return temp.data
    
    def search(self, data):
        """Search for a value in the list"""
        current = self.head
        while current is not None:
            if current.data == data:
                return True
            current = current.next
        return False
    
    def print_list(self):
        """Print the entire list"""
        current = self.head
        while current is not None:
            print(current.data, end=" -> ")
            current = current.next
        print("None")

# Usage
ll = LinkedList()
ll.insert_at_head(30)
ll.insert_at_head(20)
ll.insert_at_head(10)
ll.insert_at_tail(40)

ll.print_list()  # Output: 10 -> 20 -> 30 -> 40 -> None

print(f"Deleted: {ll.delete_head()}")  # Output: 10
print(f"Search 20: {ll.search(20)}")   # Output: True`} language={implementationLang} />
              </div>
            )}

            {implementationLang === 'java' && (
              <div className="bg-black/90 rounded-lg p-5 border border-emerald-500/40 shadow-md shadow-emerald-500/5 overflow-x-auto">
                <CodeView code={`class Node {
    int data;
    Node next;
    
    Node(int data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    private Node head;
    
    public LinkedList() {
        head = null;
    }
    
    public void insertAtHead(int data) {
        Node newNode = new Node(data);
        newNode.next = head;
        head = newNode;
    }
    
    public void insertAtTail(int data) {
        Node newNode = new Node(data);
        if (head == null) {
            head = newNode;
            return;
        }
        
        Node current = head;
        while (current.next != null) {
            current = current.next;
        }
        current.next = newNode;
    }
    
    public int deleteHead() {
        if (head == null) {
            throw new RuntimeException("List is empty");
        }
        
        int data = head.data;
        head = head.next;
        return data;
    }
    
    public boolean search(int data) {
        Node current = head;
        while (current != null) {
            if (current.data == data) {
                return true;
            }
            current = current.next;
        }
        return false;
    }
    
    public void printList() {
        Node current = head;
        while (current != null) {
            System.out.print(current.data + " -> ");
            current = current.next;
        }
        System.out.println("NULL");
    }
}

// Usage
public class Main {
    public static void main(String[] args) {
        LinkedList list = new LinkedList();
        list.insertAtHead(30);
        list.insertAtHead(20);
        list.insertAtHead(10);
        list.insertAtTail(40);
        
        list.printList();  // Output: 10 -> 20 -> 30 -> 40 -> NULL
        
        System.out.println("Deleted: " + list.deleteHead());  // Output: 10
        System.out.println("Search 20: " + list.search(20));  // Output: true
    }
}`} language={implementationLang} />
              </div>
            )}
          </div>
        </section>

        {/* Insertion Operations */}
        <section className="bg-black/80 rounded-2xl p-6 border border-emerald-500/20 shadow-md shadow-emerald-500/5">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Insertion Operations</h2>
          
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              Detailed implementation of different insertion operations:
            </p>

            <LanguageSelector currentLang={insertionLang} setLang={setInsertionLang} />

            {insertionLang === 'c' && (
              <div className="bg-black/90 rounded-lg p-5 border border-emerald-500/40 shadow-md shadow-emerald-500/5 overflow-x-auto">
                <CodeView code={`// Insert at head - O(1)
void insertAtHead(LinkedList* list, int data) {
    Node* newNode = createNode(data);
    newNode->next = list->head;
    list->head = newNode;
}

// Insert at tail - O(n)
void insertAtTail(LinkedList* list, int data) {
    Node* newNode = createNode(data);
    if (list->head == NULL) {
        list->head = newNode;
        return;
    }
    
    Node* current = list->head;
    while (current->next != NULL) {
        current = current->next;
    }
    current->next = newNode;
}

// Insert after specific node - O(1) if node is given
void insertAfter(Node* prevNode, int data) {
    if (prevNode == NULL) return;
    
    Node* newNode = createNode(data);
    newNode->next = prevNode->next;
    prevNode->next = newNode;
}`} language={insertionLang} />
              </div>
            )}

            {insertionLang === 'cpp' && (
              <div className="bg-black/90 rounded-lg p-5 border border-emerald-500/40 shadow-md shadow-emerald-500/5 overflow-x-auto">
                <CodeView code={`// Insert at head - O(1)
void insertAtHead(int data) {
    Node* newNode = new Node(data);
    newNode->next = head;
    head = newNode;
}

// Insert at tail - O(n)
void insertAtTail(int data) {
    Node* newNode = new Node(data);
    if (head == nullptr) {
        head = newNode;
        return;
    }
    
    Node* current = head;
    while (current->next != nullptr) {
        current = current->next;
    }
    current->next = newNode;
}

// Insert after specific node - O(1)
void insertAfter(Node* prevNode, int data) {
    if (prevNode == nullptr) return;
    
    Node* newNode = new Node(data);
    newNode->next = prevNode->next;
    prevNode->next = newNode;
}`} language={insertionLang} />
              </div>
            )}

            {insertionLang === 'python' && (
              <div className="bg-black/90 rounded-lg p-5 border border-emerald-500/40 shadow-md shadow-emerald-500/5 overflow-x-auto">
                <CodeView code={`def insert_at_head(self, data):
    """Insert at beginning - O(1)"""
    new_node = Node(data)
    new_node.next = self.head
    self.head = new_node

def insert_at_tail(self, data):
    """Insert at end - O(n)"""
    new_node = Node(data)
    if not self.head:
        self.head = new_node
        return
    
    current = self.head
    while current.next:
        current = current.next
    current.next = new_node

def insert_after(self, prev_node, data):
    """Insert after specific node - O(1)"""
    if not prev_node:
        return
    
    new_node = Node(data)
    new_node.next = prev_node.next
    prev_node.next = new_node`} language={insertionLang} />
              </div>
            )}

            {insertionLang === 'java' && (
              <div className="bg-black/90 rounded-lg p-5 border border-emerald-500/40 shadow-md shadow-emerald-500/5 overflow-x-auto">
                <CodeView code={`// Insert at head - O(1)
public void insertAtHead(int data) {
    Node newNode = new Node(data);
    newNode.next = head;
    head = newNode;
}

// Insert at tail - O(n)
public void insertAtTail(int data) {
    Node newNode = new Node(data);
    if (head == null) {
        head = newNode;
        return;
    }
    
    Node current = head;
    while (current.next != null) {
        current = current.next;
    }
    current.next = newNode;
}

// Insert after specific node - O(1)
public void insertAfter(Node prevNode, int data) {
    if (prevNode == null) return;
    
    Node newNode = new Node(data);
    newNode.next = prevNode.next;
    prevNode.next = newNode;
}`} language={insertionLang} />
              </div>
            )}
          </div>
        </section>

        {/* Real-World Applications */}
        <section className="bg-black/80 rounded-2xl p-6 border border-emerald-500/20 shadow-md shadow-emerald-500/5">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Real-World Applications</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/80/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Music Playlist</h3>
              <p className="text-gray-300">
                Next/previous song navigation using linked list structure
              </p>
            </div>

            <div className="bg-black/80/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">🌐</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Web Browser History</h3>
              <p className="text-gray-300">
                Back/forward navigation through visited pages
              </p>
            </div>

            <div className="bg-black/80/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">File Systems</h3>
              <p className="text-gray-300">
                Directory structures and file allocation tables
              </p>
            </div>

            <div className="bg-black/80/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Game Development</h3>
              <p className="text-gray-300">
                Managing game objects, particle systems, and undo systems
              </p>
            </div>

            <div className="bg-black/80/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Hash Tables</h3>
              <p className="text-gray-300">
                Handling collisions using linked lists in hash buckets
              </p>
            </div>

            <div className="bg-black/80/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Memory Management</h3>
              <p className="text-gray-300">
                Free memory blocks management in operating systems
              </p>
            </div>
          </div>
        </section>

        {/* Reverse Linked List Example */}
        <section className="bg-black/80 rounded-2xl p-6 border border-emerald-500/20 shadow-md shadow-emerald-500/5">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Example: Reverse Linked List</h2>
          
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              A classic linked list problem - reverse the list in-place:
            </p>

            <LanguageSelector currentLang={applicationsLang} setLang={setApplicationsLang} />

            {applicationsLang === 'c' && (
              <div className="bg-black/90 rounded-lg p-5 border border-emerald-500/40 shadow-md shadow-emerald-500/5 overflow-x-auto">
                <CodeView code={`Node* reverseList(Node* head) {
    Node* prev = NULL;
    Node* current = head;
    Node* next = NULL;
    
    while (current != NULL) {
        next = current->next;  // Store next node
        current->next = prev;  // Reverse pointer
        prev = current;        // Move prev forward
        current = next;        // Move current forward
    }
    
    return prev;  // New head
}

// Usage
int main() {
    LinkedList list;
    initList(&list);
    insertAtHead(&list, 30);
    insertAtHead(&list, 20);
    insertAtHead(&list, 10);
    
    printf("Original: ");
    printList(&list);  // 10 -> 20 -> 30 -> NULL
    
    list.head = reverseList(list.head);
    
    printf("Reversed: ");
    printList(&list);  // 30 -> 20 -> 10 -> NULL
    
    return 0;
}`} language={applicationsLang} />
              </div>
            )}

            {applicationsLang === 'cpp' && (
              <div className="bg-black/90 rounded-lg p-5 border border-emerald-500/40 shadow-md shadow-emerald-500/5 overflow-x-auto">
                <CodeView code={`Node* reverseList(Node* head) {
    Node* prev = nullptr;
    Node* current = head;
    Node* next = nullptr;
    
    while (current != nullptr) {
        next = current->next;  // Store next node
        current->next = prev;  // Reverse pointer
        prev = current;        // Move prev forward
        current = next;        // Move current forward
    }
    
    return prev;  // New head
}

// Recursive approach
Node* reverseListRecursive(Node* head) {
    if (head == nullptr || head->next == nullptr) {
        return head;
    }
    
    Node* newHead = reverseListRecursive(head->next);
    head->next->next = head;
    head->next = nullptr;
    return newHead;
}`} language={applicationsLang} />
              </div>
            )}

            {applicationsLang === 'python' && (
              <div className="bg-black/90 rounded-lg p-5 border border-emerald-500/40 shadow-md shadow-emerald-500/5 overflow-x-auto">
                <CodeView code={`def reverse_list(head):
    """Reverse linked list iteratively"""
    prev = None
    current = head
    
    while current:
        next_node = current.next  # Store next node
        current.next = prev       # Reverse pointer
        prev = current           # Move prev forward
        current = next_node      # Move current forward
    
    return prev  # New head

def reverse_list_recursive(head):
    """Reverse linked list recursively"""
    if not head or not head.next:
        return head
    
    new_head = reverse_list_recursive(head.next)
    head.next.next = head
    head.next = None
    return new_head

# Test
ll = LinkedList()
ll.insert_at_head(30)
ll.insert_at_head(20)
ll.insert_at_head(10)

print("Original:", end=" ")
ll.print_list()  # 10 -> 20 -> 30 -> None

ll.head = reverse_list(ll.head)
print("Reversed:", end=" ")
ll.print_list()  # 30 -> 20 -> 10 -> None`} language={applicationsLang} />
              </div>
            )}

            {applicationsLang === 'java' && (
              <div className="bg-black/90 rounded-lg p-5 border border-emerald-500/40 shadow-md shadow-emerald-500/5 overflow-x-auto">
                <CodeView code={`public Node reverseList(Node head) {
    Node prev = null;
    Node current = head;
    Node next = null;
    
    while (current != null) {
        next = current.next;  // Store next node
        current.next = prev;  // Reverse pointer
        prev = current;       // Move prev forward
        current = next;       // Move current forward
    }
    
    return prev;  // New head
}

// Recursive approach
public Node reverseListRecursive(Node head) {
    if (head == null || head.next == null) {
        return head;
    }
    
    Node newHead = reverseListRecursive(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}

// Usage
LinkedList list = new LinkedList();
list.insertAtHead(30);
list.insertAtHead(20);
list.insertAtHead(10);

System.out.print("Original: ");
list.printList();  // 10 -> 20 -> 30 -> NULL

list.head = reverseList(list.head);
System.out.print("Reversed: ");
list.printList();  // 30 -> 20 -> 10 -> NULL`} language={applicationsLang} />
              </div>
            )}
          </div>
        </section>

        {/* Time Complexity */}
        <section className="bg-black/80 rounded-2xl p-6 border border-emerald-500/20 shadow-md shadow-emerald-500/5">
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
                <tr className="border-b border-emerald-500/10 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Insert at Head</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-black/80 px-3 py-1 rounded">O(1)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-black/80 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="border-b border-emerald-500/10 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Insert at Tail</td>
                  <td className="p-4">
                    <code className="text-yellow-400 bg-black/80 px-3 py-1 rounded">O(n)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-black/80 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="border-b border-emerald-500/10 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Delete Head</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-black/80 px-3 py-1 rounded">O(1)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-black/80 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="border-b border-emerald-500/10 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Delete Tail</td>
                  <td className="p-4">
                    <code className="text-yellow-400 bg-black/80 px-3 py-1 rounded">O(n)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-black/80 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="border-b border-emerald-500/10 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Search</td>
                  <td className="p-4">
                    <code className="text-yellow-400 bg-black/80 px-3 py-1 rounded">O(n)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-black/80 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Overall Space</td>
                  <td className="p-4 text-gray-400">-</td>
                  <td className="p-4">
                    <code className="text-yellow-400 bg-black/80 px-3 py-1 rounded">O(n)</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Advantages and Disadvantages */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-2xl p-6 border border-emerald-500/30">
            <h3 className="text-2xl font-semibold mb-6 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8" />
              Advantages
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Dynamic Size:</strong> No fixed capacity, grows as needed</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Efficient Insertions/Deletions:</strong> O(1) at head</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>No Memory Waste:</strong> Allocates memory only when needed</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Flexible:</strong> Easy to rearrange elements</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-900/30 to-gray-800/30 rounded-2xl p-6 border border-red-500/30">
            <h3 className="text-2xl font-semibold mb-6 text-red-300 flex items-center gap-3">
              <AlertCircle className="w-8 h-8" />
              Disadvantages
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Memory Overhead:</strong> Extra memory for pointers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>No Random Access:</strong> Must traverse from head</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Cache Unfriendly:</strong> Nodes not contiguous in memory</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Reverse Traversal:</strong> Difficult without doubly linked list</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Practice Problems */}
        <section className="bg-black/80 rounded-2xl p-6 border border-emerald-500/20 shadow-md shadow-emerald-500/5">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Practice Problems</h2>

          <div className="space-y-6">
            {/* 1. Reverse Linked List */}
            <div className="bg-black/80/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">
                  1. Reverse Linked List
                </h3>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Easy</span>
              </div>
              <p className="text-gray-300 mb-4">
                Reverse a singly linked list both iteratively and recursively.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Google</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Microsoft</span>
              </div>
              <a 
                href="https://leetcode.com/problems/reverse-linked-list/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
                <span>Solve on LeetCode</span>
                <span>→</span>
              </a>
            </div>

            {/* 2. Detect Cycle */}
            <div className="bg-black/80/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">
                  2. Linked List Cycle
                </h3>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Easy</span>
              </div>
              <p className="text-gray-300 mb-4">
                Detect if a linked list has a cycle using Floyd's cycle detection.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Facebook</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
              </div>
              <a 
                href="https://leetcode.com/problems/linked-list-cycle/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
                <span>Solve on LeetCode</span>
                <span>→</span>
              </a>
            </div>

            {/* 3. Merge Two Sorted Lists */}
            <div className="bg-black/80/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">
                  3. Merge Two Sorted Lists
                </h3>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Easy</span>
              </div>
              <p className="text-gray-300 mb-4">
                Merge two sorted linked lists into one sorted linked list.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Google</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Microsoft</span>
              </div>
              <a 
                href="https://leetcode.com/problems/merge-two-sorted-lists/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
                <span>Solve on LeetCode</span>
                <span>→</span>
              </a>
            </div>

            {/* 4. Remove Nth Node From End */}
            <div className="bg-black/80/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">
                  4. Remove Nth Node From End
                </h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Medium</span>
              </div>
              <p className="text-gray-300 mb-4">
                Remove the nth node from the end of the list using two pointers.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Facebook</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
              </div>
              <a 
                href="https://leetcode.com/problems/remove-nth-node-from-end-of-list/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
                <span>Solve on LeetCode</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <div className="mt-10 p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl animate-slideInUp">
          <h3 className="text-lg font-quantico-bold text-emerald-300 mb-2 flex items-center gap-2">
            <span>🚀</span> Next Steps
          </h3>
          <p className="text-gray-300 mb-4">
            Great job! Now let's explore <strong>Doubly Linked Lists</strong> - the bidirectional version with previous pointers for efficient backwards traversal!
          </p>
          <button
            onClick={() => onNavigate('course', { courseId, topic: 'linked-list-doubly' })}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold rounded-lg transition-all duration-300 hover-lift"
          >
            Continue to Doubly Linked Lists →
          </button>
        </div>

      </div>

      {/* Custom Animations */}
      <style jsx='true'>{`
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

export default LinkedListSinglyContent;