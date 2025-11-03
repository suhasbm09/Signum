import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import DoublyLinkedListVisualization from '../visualizations/DoublyLinkedListVisualization';
import CompletionTracker from '../../../components/CompletionTracker';

const LinkedListDoublyContent = ({ onNavigate, courseId }) => {
  const moduleId = 'linked-list-doubly';

  // Language state for each code section
  const [implementationLang, setImplementationLang] = useState('python');
  const [insertionLang, setInsertionLang] = useState('python');
  const [deletionLang, setDeletionLang] = useState('python');
  const [applicationsLang, setApplicationsLang] = useState('python');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
    <div className="min-h-screen text-white p-8">
      <div className="w-full mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 animate-slideInDown">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">
            Doubly Linked Lists - Bidirectional Data Structure
          </h1>
          <p className="text-xl text-gray-300">
            Master two-way traversal with previous and next pointers
          </p>
        </div>

        {/* Introduction */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10 animate-slideInUp">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">What is a Doubly Linked List?</h2>
          
          <div className="space-y-6">
            <p className="text-lg text-gray-300 leading-relaxed">
              A <span className="text-emerald-400 font-semibold">Doubly Linked List</span> is a linear data structure where each node contains 
              a <span className="text-emerald-400 font-semibold">value</span>, a <span className="text-emerald-400 font-semibold">next pointer</span> to the following node, 
              and a <span className="text-emerald-400 font-semibold">previous pointer</span> to the preceding node. This enables bidirectional traversal.
            </p>

            {/* Visual Representation */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/30">
              <h3 className="text-xl font-semibold mb-4 text-emerald-300">Visual Representation</h3>
              <div className="flex justify-center items-center gap-4">
                {/* Doubly Linked List visualization */}
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-400">NULL</div>
                  <div className="text-emerald-400">⇄</div>
                  {[10, 20, 30, 40].map((value, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-24 h-16 border-2 border-emerald-500 rounded-lg flex flex-col items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 transition-all">
                        <div className="flex justify-between w-full px-2">
                          <span className="text-xs text-blue-400">prev</span>
                          <span className="text-xs text-green-400">next</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-300">{value}</span>
                      </div>
                      {index < 3 && <div className="text-emerald-400">⇄</div>}
                    </div>
                  ))}
                  <div className="text-emerald-400">⇄</div>
                  <div className="text-sm text-gray-400">NULL</div>
                </div>
                
                {/* Operations */}
                <div className="space-y-3 text-gray-300 text-sm">
                  <div className="bg-emerald-500/10 p-3 rounded border border-emerald-500/30">
                    <strong className="text-emerald-400">insertAtHead(5)</strong> → Add 5 at beginning
                  </div>
                  <div className="bg-red-500/10 p-3 rounded border border-red-500/30">
                    <strong className="text-red-400">deleteNode(20)</strong> → Remove specific node
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded border border-blue-500/30">
                    <strong className="text-blue-400">traverseBackwards()</strong> ← Start from tail
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed">
              Doubly linked lists provide <span className="text-emerald-400 font-semibold">O(1)</span> insertions/deletions at both ends and 
              enable <span className="text-emerald-400 font-semibold">bidirectional traversal</span>, at the cost of extra memory for previous pointers.
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
                  <span className="text-2xl">⤴️</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Insert at Head</h3>
              </div>
              <p className="text-gray-300 mb-2">Add element at the beginning</p>
              <code className="text-emerald-400 bg-gray-800 px-2 py-1 rounded text-sm">Time: O(1)</code>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">⤵️</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Insert at Tail</h3>
              </div>
              <p className="text-gray-300 mb-2">Add element at the end</p>
              <code className="text-emerald-400 bg-gray-800 px-2 py-1 rounded text-sm">Time: O(1)</code>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">🗑️</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Delete Node</h3>
              </div>
              <p className="text-gray-300 mb-2">Remove any node in O(1) if pointer given</p>
              <code className="text-emerald-400 bg-gray-800 px-2 py-1 rounded text-sm">Time: O(1)</code>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 to-gray-800/30 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">↔️</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-300">Bidirectional Traversal</h3>
              </div>
              <p className="text-gray-300 mb-2">Traverse forward and backward</p>
              <code className="text-yellow-400 bg-gray-800 px-2 py-1 rounded text-sm">Time: O(n)</code>
            </div>

          </div>
        </section>

        {/* Interactive Visualizer */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-emerald-500/20 shadow-xl shadow-emerald-500/10 overflow-hidden">
          <DoublyLinkedListVisualization />
        </section>

        {/* Implementation */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Implementation</h2>
          
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              Doubly linked lists use nodes with previous and next pointers. Here's a complete implementation:
            </p>

            <LanguageSelector currentLang={implementationLang} setLang={setImplementationLang} />

            {implementationLang === 'c' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node* prev;
    struct Node* next;
} Node;

Node* createNode(int data) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->data = data;
    newNode->prev = NULL;
    newNode->next = NULL;
    return newNode;
}

typedef struct {
    Node* head;
    Node* tail;
} DoublyLinkedList;

void initList(DoublyLinkedList* list) {
    list->head = NULL;
    list->tail = NULL;
}

void insertAtHead(DoublyLinkedList* list, int data) {
    Node* newNode = createNode(data);
    
    if (list->head == NULL) {
        list->head = newNode;
        list->tail = newNode;
    } else {
        newNode->next = list->head;
        list->head->prev = newNode;
        list->head = newNode;
    }
}

void insertAtTail(DoublyLinkedList* list, int data) {
    Node* newNode = createNode(data);
    
    if (list->tail == NULL) {
        list->head = newNode;
        list->tail = newNode;
    } else {
        newNode->prev = list->tail;
        list->tail->next = newNode;
        list->tail = newNode;
    }
}

void deleteNode(DoublyLinkedList* list, Node* node) {
    if (node == NULL) return;
    
    if (node->prev != NULL) {
        node->prev->next = node->next;
    } else {
        list->head = node->next;
    }
    
    if (node->next != NULL) {
        node->next->prev = node->prev;
    } else {
        list->tail = node->prev;
    }
    
    free(node);
}

void printForward(DoublyLinkedList* list) {
    Node* current = list->head;
    printf("Forward: ");
    while (current != NULL) {
        printf("%d <-> ", current->data);
        current = current->next;
    }
    printf("NULL\\n");
}

void printBackward(DoublyLinkedList* list) {
    Node* current = list->tail;
    printf("Backward: ");
    while (current != NULL) {
        printf("%d <-> ", current->data);
        current = current->prev;
    }
    printf("NULL\\n");
}

// Usage
int main() {
    DoublyLinkedList list;
    initList(&list);
    
    insertAtHead(&list, 30);
    insertAtHead(&list, 20);
    insertAtHead(&list, 10);
    insertAtTail(&list, 40);
    
    printForward(&list);   // Output: 10 <-> 20 <-> 30 <-> 40 <-> NULL
    printBackward(&list);  // Output: 40 <-> 30 <-> 20 <-> 10 <-> NULL
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {implementationLang === 'cpp' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <iostream>
using namespace std;

class Node {
public:
    int data;
    Node* prev;
    Node* next;
    
    Node(int data) : data(data), prev(nullptr), next(nullptr) {}
};

class DoublyLinkedList {
private:
    Node* head;
    Node* tail;
    
public:
    DoublyLinkedList() : head(nullptr), tail(nullptr) {}
    
    void insertAtHead(int data) {
        Node* newNode = new Node(data);
        
        if (head == nullptr) {
            head = newNode;
            tail = newNode;
        } else {
            newNode->next = head;
            head->prev = newNode;
            head = newNode;
        }
    }
    
    void insertAtTail(int data) {
        Node* newNode = new Node(data);
        
        if (tail == nullptr) {
            head = newNode;
            tail = newNode;
        } else {
            newNode->prev = tail;
            tail->next = newNode;
            tail = newNode;
        }
    }
    
    void deleteNode(Node* node) {
        if (node == nullptr) return;
        
        if (node->prev != nullptr) {
            node->prev->next = node->next;
        } else {
            head = node->next;
        }
        
        if (node->next != nullptr) {
            node->next->prev = node->prev;
        } else {
            tail = node->prev;
        }
        
        delete node;
    }
    
    void printForward() {
        Node* current = head;
        cout << "Forward: ";
        while (current != nullptr) {
            cout << current->data << " <-> ";
            current = current->next;
        }
        cout << "NULL" << endl;
    }
    
    void printBackward() {
        Node* current = tail;
        cout << "Backward: ";
        while (current != nullptr) {
            cout << current->data << " <-> ";
            current = current->prev;
        }
        cout << "NULL" << endl;
    }
    
    ~DoublyLinkedList() {
        while (head != nullptr) {
            Node* temp = head;
            head = head->next;
            delete temp;
        }
    }
};

// Usage
int main() {
    DoublyLinkedList list;
    list.insertAtHead(30);
    list.insertAtHead(20);
    list.insertAtHead(10);
    list.insertAtTail(40);
    
    list.printForward();   // Output: 10 <-> 20 <-> 30 <-> 40 <-> NULL
    list.printBackward();  // Output: 40 <-> 30 <-> 20 <-> 10 <-> NULL
    
    return 0;
}`}
                </pre>
              </div>
            )}

            {implementationLang === 'python' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`class Node:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
    
    def insert_at_head(self, data):
        """Add node at the beginning - O(1)"""
        new_node = Node(data)
        
        if not self.head:
            self.head = new_node
            self.tail = new_node
        else:
            new_node.next = self.head
            self.head.prev = new_node
            self.head = new_node
    
    def insert_at_tail(self, data):
        """Add node at the end - O(1)"""
        new_node = Node(data)
        
        if not self.tail:
            self.head = new_node
            self.tail = new_node
        else:
            new_node.prev = self.tail
            self.tail.next = new_node
            self.tail = new_node
    
    def delete_node(self, node):
        """Remove specific node - O(1)"""
        if not node:
            return
        
        if node.prev:
            node.prev.next = node.next
        else:
            self.head = node.next
        
        if node.next:
            node.next.prev = node.prev
        else:
            self.tail = node.prev
    
    def print_forward(self):
        """Print list from head to tail"""
        current = self.head
        print("Forward: ", end="")
        while current:
            print(current.data, end=" <-> ")
            current = current.next
        print("None")
    
    def print_backward(self):
        """Print list from tail to head"""
        current = self.tail
        print("Backward: ", end="")
        while current:
            print(current.data, end=" <-> ")
            current = current.prev
        print("None")

# Usage
dll = DoublyLinkedList()
dll.insert_at_head(30)
dll.insert_at_head(20)
dll.insert_at_head(10)
dll.insert_at_tail(40)

dll.print_forward()   # Output: 10 <-> 20 <-> 30 <-> 40 <-> None
dll.print_backward()  # Output: 40 <-> 30 <-> 20 <-> 10 <-> None`}
                </pre>
              </div>
            )}

            {implementationLang === 'java' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`class Node {
    int data;
    Node prev;
    Node next;
    
    Node(int data) {
        this.data = data;
        this.prev = null;
        this.next = null;
    }
}

class DoublyLinkedList {
    private Node head;
    private Node tail;
    
    public DoublyLinkedList() {
        head = null;
        tail = null;
    }
    
    public void insertAtHead(int data) {
        Node newNode = new Node(data);
        
        if (head == null) {
            head = newNode;
            tail = newNode;
        } else {
            newNode.next = head;
            head.prev = newNode;
            head = newNode;
        }
    }
    
    public void insertAtTail(int data) {
        Node newNode = new Node(data);
        
        if (tail == null) {
            head = newNode;
            tail = newNode;
        } else {
            newNode.prev = tail;
            tail.next = newNode;
            tail = newNode;
        }
    }
    
    public void deleteNode(Node node) {
        if (node == null) return;
        
        if (node.prev != null) {
            node.prev.next = node.next;
        } else {
            head = node.next;
        }
        
        if (node.next != null) {
            node.next.prev = node.prev;
        } else {
            tail = node.prev;
        }
    }
    
    public void printForward() {
        Node current = head;
        System.out.print("Forward: ");
        while (current != null) {
            System.out.print(current.data + " <-> ");
            current = current.next;
        }
        System.out.println("NULL");
    }
    
    public void printBackward() {
        Node current = tail;
        System.out.print("Backward: ");
        while (current != null) {
            System.out.print(current.data + " <-> ");
            current = current.prev;
        }
        System.out.println("NULL");
    }
}

// Usage
public class Main {
    public static void main(String[] args) {
        DoublyLinkedList list = new DoublyLinkedList();
        list.insertAtHead(30);
        list.insertAtHead(20);
        list.insertAtHead(10);
        list.insertAtTail(40);
        
        list.printForward();   // Output: 10 <-> 20 <-> 30 <-> 40 <-> NULL
        list.printBackward();  // Output: 40 <-> 30 <-> 20 <-> 10 <-> NULL
    }
}`}
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* Insertion Operations */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Insertion Operations</h2>
          
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              Detailed implementation of different insertion operations in doubly linked lists:
            </p>

            <LanguageSelector currentLang={insertionLang} setLang={setInsertionLang} />

            {insertionLang === 'c' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`// Insert at head - O(1)
void insertAtHead(DoublyLinkedList* list, int data) {
    Node* newNode = createNode(data);
    
    if (list->head == NULL) {
        list->head = newNode;
        list->tail = newNode;
    } else {
        newNode->next = list->head;
        list->head->prev = newNode;
        list->head = newNode;
    }
}

// Insert at tail - O(1)
void insertAtTail(DoublyLinkedList* list, int data) {
    Node* newNode = createNode(data);
    
    if (list->tail == NULL) {
        list->head = newNode;
        list->tail = newNode;
    } else {
        newNode->prev = list->tail;
        list->tail->next = newNode;
        list->tail = newNode;
    }
}

// Insert after specific node - O(1)
void insertAfter(Node* node, int data) {
    if (node == NULL) return;
    
    Node* newNode = createNode(data);
    newNode->prev = node;
    newNode->next = node->next;
    
    if (node->next != NULL) {
        node->next->prev = newNode;
    }
    node->next = newNode;
}`}
                </pre>
              </div>
            )}

            {insertionLang === 'cpp' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`// Insert at head - O(1)
void insertAtHead(int data) {
    Node* newNode = new Node(data);
    
    if (head == nullptr) {
        head = newNode;
        tail = newNode;
    } else {
        newNode->next = head;
        head->prev = newNode;
        head = newNode;
    }
}

// Insert at tail - O(1)
void insertAtTail(int data) {
    Node* newNode = new Node(data);
    
    if (tail == nullptr) {
        head = newNode;
        tail = newNode;
    } else {
        newNode->prev = tail;
        tail->next = newNode;
        tail = newNode;
    }
}

// Insert after specific node - O(1)
void insertAfter(Node* node, int data) {
    if (node == nullptr) return;
    
    Node* newNode = new Node(data);
    newNode->prev = node;
    newNode->next = node->next;
    
    if (node->next != nullptr) {
        node->next->prev = newNode;
    } else {
        tail = newNode;
    }
    
    node->next = newNode;
}`}
                </pre>
              </div>
            )}

            {insertionLang === 'python' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`def insert_at_head(self, data):
    """Insert at beginning - O(1)"""
    new_node = Node(data)
    
    if not self.head:
        self.head = new_node
        self.tail = new_node
    else:
        new_node.next = self.head
        self.head.prev = new_node
        self.head = new_node

def insert_at_tail(self, data):
    """Insert at end - O(1)"""
    new_node = Node(data)
    
    if not self.tail:
        self.head = new_node
        self.tail = new_node
    else:
        new_node.prev = self.tail
        self.tail.next = new_node
        self.tail = new_node

def insert_after(self, node, data):
    """Insert after specific node - O(1)"""
    if not node:
        return
    
    new_node = Node(data)
    new_node.prev = node
    new_node.next = node.next
    
    if node.next:
        node.next.prev = new_node
    else:
        self.tail = new_node
        
    node.next = new_node`}
                </pre>
              </div>
            )}

            {insertionLang === 'java' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`// Insert at head - O(1)
public void insertAtHead(int data) {
    Node newNode = new Node(data);
    
    if (head == null) {
        head = newNode;
        tail = newNode;
    } else {
        newNode.next = head;
        head.prev = newNode;
        head = newNode;
    }
}

// Insert at tail - O(1)
public void insertAtTail(int data) {
    Node newNode = new Node(data);
    
    if (tail == null) {
        head = newNode;
        tail = newNode;
    } else {
        newNode.prev = tail;
        tail.next = newNode;
        tail = newNode;
    }
}

// Insert after specific node - O(1)
public void insertAfter(Node node, int data) {
    if (node == null) return;
    
    Node newNode = new Node(data);
    newNode.prev = node;
    newNode.next = node.next;
    
    if (node.next != null) {
        node.next.prev = newNode;
    } else {
        tail = newNode;
    }
    
    node.next = newNode;
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
              <div className="text-3xl mb-3">🌐</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Browser Navigation</h3>
              <p className="text-gray-300">
                Back/forward buttons with efficient bidirectional traversal
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">🎵</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Music Players</h3>
              <p className="text-gray-300">
                Previous/next song navigation in playlists
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Mobile Apps</h3>
              <p className="text-gray-300">
                Swipe gestures for navigation between screens
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Game Development</h3>
              <p className="text-gray-300">
                Object pools with efficient removal from any position
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">💾</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Cache Systems</h3>
              <p className="text-gray-300">
                LRU (Least Recently Used) cache implementation
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover-lift">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">Text Editors</h3>
              <p className="text-gray-300">
                Undo/redo functionality with bidirectional command history
              </p>
            </div>
          </div>
        </section>

        {/* LRU Cache Implementation Example */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Example: LRU Cache Implementation</h2>
          
          <div className="space-y-6">
            <p className="text-gray-300 leading-relaxed">
              A practical application of doubly linked lists - implementing an LRU (Least Recently Used) cache:
            </p>

            <LanguageSelector currentLang={applicationsLang} setLang={setApplicationsLang} />

            {applicationsLang === 'python' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`class LRUCache:
    class Node:
        def __init__(self, key, value):
            self.key = key
            self.value = value
            self.prev = None
            self.next = None

    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}
        self.head = self.Node(0, 0)  # dummy head
        self.tail = self.Node(0, 0)  # dummy tail
        self.head.next = self.tail
        self.tail.prev = self.head

    def _add_node(self, node):
        """Add node right after head"""
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def _remove_node(self, node):
        """Remove node from linked list"""
        node.prev.next = node.next
        node.next.prev = node.prev

    def _move_to_head(self, node):
        """Move node to head (most recently used)"""
        self._remove_node(node)
        self._add_node(node)

    def _pop_tail(self):
        """Remove tail node (least recently used)"""
        node = self.tail.prev
        self._remove_node(node)
        return node

    def get(self, key):
        if key in self.cache:
            node = self.cache[key]
            self._move_to_head(node)
            return node.value
        return -1

    def put(self, key, value):
        if key in self.cache:
            node = self.cache[key]
            node.value = value
            self._move_to_head(node)
        else:
            if len(self.cache) >= self.capacity:
                tail = self._pop_tail()
                del self.cache[tail.key]
            
            new_node = self.Node(key, value)
            self.cache[key] = new_node
            self._add_node(new_node)

# Usage
cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))    # returns 1
cache.put(3, 3)        # evicts key 2
print(cache.get(2))    # returns -1 (not found)`}
                </pre>
              </div>
            )}

            {applicationsLang === 'java' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`import java.util.HashMap;
import java.util.Map;

class LRUCache {
    class Node {
        int key, value;
        Node prev, next;
        Node(int k, int v) { key = k; value = v; }
    }
    
    private Map<Integer, Node> cache;
    private Node head, tail;
    private int capacity;
    
    public LRUCache(int capacity) {
        this.capacity = capacity;
        cache = new HashMap<>();
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head.next = tail;
        tail.prev = head;
    }
    
    private void addNode(Node node) {
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }
    
    private void removeNode(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    
    private void moveToHead(Node node) {
        removeNode(node);
        addNode(node);
    }
    
    private Node popTail() {
        Node node = tail.prev;
        removeNode(node);
        return node;
    }
    
    public int get(int key) {
        Node node = cache.get(key);
        if (node == null) return -1;
        moveToHead(node);
        return node.value;
    }
    
    public void put(int key, int value) {
        Node node = cache.get(key);
        if (node == null) {
            if (cache.size() >= capacity) {
                Node tail = popTail();
                cache.remove(tail.key);
            }
            node = new Node(key, value);
            cache.put(key, node);
            addNode(node);
        } else {
            node.value = value;
            moveToHead(node);
        }
    }
}`}
                </pre>
              </div>
            )}

            {applicationsLang === 'cpp' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <unordered_map>
using namespace std;

class LRUCache {
private:
    struct Node {
        int key, value;
        Node *prev, *next;
        Node(int k, int v) : key(k), value(v), prev(nullptr), next(nullptr) {}
    };
    
    unordered_map<int, Node*> cache;
    Node *head, *tail;
    int capacity;
    
    void addNode(Node* node) {
        node->prev = head;
        node->next = head->next;
        head->next->prev = node;
        head->next = node;
    }
    
    void removeNode(Node* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }
    
    void moveToHead(Node* node) {
        removeNode(node);
        addNode(node);
    }
    
    Node* popTail() {
        Node* node = tail->prev;
        removeNode(node);
        return node;
    }
    
public:
    LRUCache(int capacity) : capacity(capacity) {
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head->next = tail;
        tail->prev = head;
    }
    
    int get(int key) {
        if (cache.find(key) == cache.end()) return -1;
        Node* node = cache[key];
        moveToHead(node);
        return node->value;
    }
    
    void put(int key, int value) {
        if (cache.find(key) != cache.end()) {
            Node* node = cache[key];
            node->value = value;
            moveToHead(node);
        } else {
            if (cache.size() >= capacity) {
                Node* tail_node = popTail();
                cache.erase(tail_node->key);
                delete tail_node;
            }
            Node* newNode = new Node(key, value);
            cache[key] = newNode;
            addNode(newNode);
        }
    }
    
    ~LRUCache() {
        Node* curr = head;
        while (curr) {
            Node* next = curr->next;
            delete curr;
            curr = next;
        }
    }
};`}
                </pre>
              </div>
            )}

            {applicationsLang === 'c' && (
              <div className="bg-gray-900 rounded-lg p-6 border border-emerald-500/30 overflow-x-auto">
                <pre className="text-emerald-300 font-mono text-sm">
{`#include <stdio.h>
#include <stdlib.h>

#define MAX_SIZE 1000

typedef struct Node {
    int key;
    int value;
    struct Node* prev;
    struct Node* next;
} Node;

typedef struct {
    Node* head;
    Node* tail;
    Node* cache[MAX_SIZE];
    int capacity;
    int size;
} LRUCache;

Node* createNode(int key, int value) {
    Node* node = (Node*)malloc(sizeof(Node));
    node->key = key;
    node->value = value;
    node->prev = NULL;
    node->next = NULL;
    return node;
}

void addNode(LRUCache* obj, Node* node) {
    node->prev = obj->head;
    node->next = obj->head->next;
    obj->head->next->prev = node;
    obj->head->next = node;
}

void removeNode(Node* node) {
    node->prev->next = node->next;
    node->next->prev = node->prev;
}

void moveToHead(LRUCache* obj, Node* node) {
    removeNode(node);
    addNode(obj, node);
}

Node* popTail(LRUCache* obj) {
    Node* node = obj->tail->prev;
    removeNode(node);
    return node;
}

LRUCache* lRUCacheCreate(int capacity) {
    LRUCache* obj = (LRUCache*)malloc(sizeof(LRUCache));
    obj->capacity = capacity;
    obj->size = 0;
    obj->head = createNode(0, 0);
    obj->tail = createNode(0, 0);
    obj->head->next = obj->tail;
    obj->tail->prev = obj->head;
    
    for (int i = 0; i < MAX_SIZE; i++) {
        obj->cache[i] = NULL;
    }
    return obj;
}

int lRUCacheGet(LRUCache* obj, int key) {
    if (key < 0 || key >= MAX_SIZE || obj->cache[key] == NULL) {
        return -1;
    }
    Node* node = obj->cache[key];
    moveToHead(obj, node);
    return node->value;
}

void lRUCachePut(LRUCache* obj, int key, int value) {
    if (key < 0 || key >= MAX_SIZE) return;
    
    if (obj->cache[key] != NULL) {
        Node* node = obj->cache[key];
        node->value = value;
        moveToHead(obj, node);
    } else {
        if (obj->size >= obj->capacity) {
            Node* tail = popTail(obj);
            obj->cache[tail->key] = NULL;
            free(tail);
            obj->size--;
        }
        Node* newNode = createNode(key, value);
        obj->cache[key] = newNode;
        addNode(obj, newNode);
        obj->size++;
    }
}

void lRUCacheFree(LRUCache* obj) {
    Node* curr = obj->head;
    while (curr) {
        Node* next = curr->next;
        free(curr);
        curr = next;
    }
    free(obj);
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
                  <td className="p-4 text-gray-300">Insert at Head</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Insert at Tail</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Delete Node</td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Search</td>
                  <td className="p-4">
                    <code className="text-yellow-400 bg-gray-800 px-3 py-1 rounded">O(n)</code>
                  </td>
                  <td className="p-4">
                    <code className="text-emerald-400 bg-gray-800 px-3 py-1 rounded">O(1)</code>
                  </td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 text-gray-300">Traversal (Forward/Backward)</td>
                  <td className="p-4">
                    <code className="text-yellow-400 bg-gray-800 px-3 py-1 rounded">O(n)</code>
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
                <span><strong>Bidirectional Traversal:</strong> Can traverse both forward and backward</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Efficient Deletions:</strong> O(1) deletion if node pointer is given</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Flexible Operations:</strong> Easy insertions at both ends</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span><strong>Better Cache Implementation:</strong> Ideal for LRU cache</span>
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
                <span><strong>Memory Overhead:</strong> Extra memory for previous pointers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Complex Implementation:</strong> More pointer operations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Higher Maintenance:</strong> Need to update both next and prev pointers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <span><strong>Slower Operations:</strong> Slightly slower due to extra pointer updates</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Practice Problems */}
        <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">Practice Problems</h2>

          <div className="space-y-6">
            {/* 1. LRU Cache */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">
                  1. LRU Cache
                </h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Medium</span>
              </div>
              <p className="text-gray-300 mb-4">
                Design and implement an LRU cache using doubly linked list and hash map.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Google</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Microsoft</span>
              </div>
              <a 
                href="https://leetcode.com/problems/lru-cache/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
                <span>Solve on LeetCode</span>
                <span>→</span>
              </a>
            </div>

            {/* 2. Flatten Multilevel Doubly Linked List */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">
                  2. Flatten Multilevel Doubly Linked List
                </h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Medium</span>
              </div>
              <p className="text-gray-300 mb-4">
                Flatten a multilevel doubly linked list into a single level.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Facebook</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
              </div>
              <a 
                href="https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
                <span>Solve on LeetCode</span>
                <span>→</span>
              </a>
            </div>

            {/* 3. Browser History */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">
                  3. Design Browser History
                </h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Medium</span>
              </div>
              <p className="text-gray-300 mb-4">
                Implement browser history with back and forward navigation.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Google</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Microsoft</span>
              </div>
              <a 
                href="https://leetcode.com/problems/design-browser-history/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
                <span>Solve on LeetCode</span>
                <span>→</span>
              </a>
            </div>

            {/* 4. Copy List with Random Pointer */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover-lift">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-emerald-300">
                  4. Copy List with Random Pointer
                </h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Medium</span>
              </div>
              <p className="text-gray-300 mb-4">
                Create a deep copy of a linked list with additional random pointers.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Facebook</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Amazon</span>
              </div>
              <a 
                href="https://leetcode.com/problems/copy-list-with-random-pointer/" 
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
            Excellent! You've mastered doubly linked lists. Now let's explore <strong>Stacks</strong> - a fundamental LIFO (Last In First Out) data structure used everywhere in programming!
          </p>
          <button
            onClick={() => onNavigate('course', { courseId, topic: 'stacks' })}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-200 font-quantico-bold rounded-lg transition-all duration-300 hover-lift"
          >
            Continue to Stacks →
          </button>
        </div>

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

export default LinkedListDoublyContent;