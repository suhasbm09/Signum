import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import TreeVisualization from '../visualizations/TreeVisualization';
import CompletionTracker from '../../../components/CompletionTracker';

const TreesIntroContent = ({ onNavigate, courseId }) => {
  const moduleId = 'trees-intro';

  const [implementationLang, setImplementationLang] = useState('python');
  const [traversalLang, setTraversalLang] = useState('python');
  const [applicationsLang, setApplicationsLang] = useState('python');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
    <CompletionTracker courseId={courseId} moduleId={moduleId} contentLength="long">
      <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
        <div className="w-full mx-auto space-y-6 sm:space-y-8">
          
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-2">Trees</h1>
                <p className="text-sm sm:text-base text-gray-400">Hierarchical data structures for organized storage and efficient retrieval</p>
              </div>
            </div>
          </div>

        {/* Introduction to Trees */}
        <section className="bg-gray-800/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-emerald-500/20">
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-400 mb-4">Introduction to Trees</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              A <span className="text-emerald-300 font-semibold">tree</span> is a non-linear hierarchical data structure consisting of nodes connected by edges. 
              Unlike linear structures (arrays, stacks, queues), trees organize data hierarchically - like a family tree or company organization chart.
            </p>
            
            <div className="bg-gray-900/50 rounded-lg p-4 border border-emerald-500/20">
              <p className="font-mono text-sm text-emerald-300 mb-2">Tree Example:</p>
              <pre className="text-xs text-gray-400 overflow-x-auto">{`        Root (1)
        /      \\
       2        3
      / \\      / \\
     4   5    6   7

- 1: Root node
- 2,3: Children of 1
- 4,5,6,7: Leaf nodes
- Height: 2 (longest path from root)`}</pre>
            </div>

            <p>
              Trees are fundamental in computer science. They're used in file systems, databases, DOM structures, compilers, and machine learning algorithms. 
              Understanding trees is essential for solving complex problems efficiently.
            </p>
          </div>
        </section>

        {/* Key Terminology */}
        <section>
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">Key Terminology</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <p className="font-semibold text-emerald-300 mb-2">🌳 Root</p>
              <p className="text-gray-400 text-sm">The topmost node with no parent</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <p className="font-semibold text-emerald-300 mb-2">⭕ Node</p>
              <p className="text-gray-400 text-sm">Contains data and references to children</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <p className="font-semibold text-emerald-300 mb-2">─ Edge</p>
              <p className="text-gray-400 text-sm">Connection between parent and child nodes</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <p className="font-semibold text-emerald-300 mb-2">🍃 Leaf</p>
              <p className="text-gray-400 text-sm">Node with no children</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <p className="font-semibold text-emerald-300 mb-2">👨 Parent</p>
              <p className="text-gray-400 text-sm">Node with children</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <p className="font-semibold text-emerald-300 mb-2">📏 Height</p>
              <p className="text-gray-400 text-sm">Longest path from root to leaf</p>
            </div>
          </div>
        </section>

        {/* Types of Trees */}
        <section>
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">Types of Trees</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20">
              <p className="font-semibold text-emerald-300 mb-2">Binary Tree</p>
              <p className="text-gray-400 text-sm">Each node has at most 2 children (left and right)</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20">
              <p className="font-semibold text-emerald-300 mb-2">Binary Search Tree (BST)</p>
              <p className="text-gray-400 text-sm">Left ≤ Parent ≤ Right ordering for efficient search</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20">
              <p className="font-semibold text-emerald-300 mb-2">AVL Tree</p>
              <p className="text-gray-400 text-sm">Self-balancing BST with height difference ≤ 1</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20">
              <p className="font-semibold text-emerald-300 mb-2">Heap</p>
              <p className="text-gray-400 text-sm">Complete binary tree with min/max heap property</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20">
              <p className="font-semibold text-emerald-300 mb-2">N-ary Tree</p>
              <p className="text-gray-400 text-sm">Each node can have N children</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20">
              <p className="font-semibold text-emerald-300 mb-2">Red-Black Tree</p>
              <p className="text-gray-400 text-sm">Self-balancing BST with color-based rules</p>
            </div>
          </div>
        </section>

        {/* Binary Search Tree */}
        <section className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20">
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">1. Binary Search Tree (BST)</h2>
          
          <div className="space-y-4 text-gray-300 mb-6">
            <p>
              A <span className="text-emerald-300 font-semibold">Binary Search Tree</span> is a binary tree where each node follows the BST property: 
              <span className="text-emerald-300"> all values in left subtree ≤ node value ≤ all values in right subtree</span>. 
              This ordering enables efficient searching, insertion, and deletion.
            </p>

            <div className="bg-gray-900/50 rounded-lg p-4 border border-emerald-500/20">
              <p className="font-mono text-sm text-emerald-300 mb-2">Valid BST:</p>
              <pre className="text-xs text-gray-400">{`        50
       /  \\
      30   70
     / \\   / \\
    20 40 60 80

All nodes: left ≤ parent ≤ right`}</pre>
            </div>
          </div>

          {/* Visualization Component */}
          <div className="mb-6">
            <TreeVisualization />
          </div>

          {/* Node Structure */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3">Node Structure</h3>
            <LanguageSelector currentLang={implementationLang} setLang={setImplementationLang} />
            
            {implementationLang === 'c' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`struct TreeNode {
    int value;
    struct TreeNode* left;
    struct TreeNode* right;
};

struct TreeNode* createNode(int value) {
    struct TreeNode* node = (struct TreeNode*)malloc(sizeof(struct TreeNode));
    node->value = value;
    node->left = NULL;
    node->right = NULL;
    return node;
}`}
              </pre>
            )}

            {implementationLang === 'cpp' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`struct TreeNode {
    int value;
    TreeNode* left;
    TreeNode* right;
    
    TreeNode(int val) : value(val), left(nullptr), right(nullptr) {}
};

TreeNode* root = new TreeNode(50);
root->left = new TreeNode(30);
root->right = new TreeNode(70);`}
              </pre>
            )}

            {implementationLang === 'python' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

# Example
root = TreeNode(50)
root.left = TreeNode(30)
root.right = TreeNode(70)`}
              </pre>
            )}

            {implementationLang === 'java' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`public class TreeNode {
    public int value;
    public TreeNode left, right;
    
    public TreeNode(int value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

TreeNode root = new TreeNode(50);
root.left = new TreeNode(30);
root.right = new TreeNode(70);`}
              </pre>
            )}
          </div>

          {/* Insert Operation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3">Insert Operation</h3>
            <p className="text-gray-400 text-sm mb-3">Add elements while maintaining BST property - O(log n) average</p>
            <LanguageSelector currentLang={implementationLang} setLang={setImplementationLang} />
            
            {implementationLang === 'c' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`struct TreeNode* insert(struct TreeNode* node, int value) {
    if (node == NULL) {
        return createNode(value);
    }
    
    if (value <= node->value) {
        node->left = insert(node->left, value);
    } else {
        node->right = insert(node->right, value);
    }
    return node;
}

// Example: insert 20, 30, 40
root = insert(root, 30);
root = insert(root, 20);
root = insert(root, 40);`}
              </pre>
            )}

            {implementationLang === 'cpp' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`TreeNode* insert(TreeNode* node, int value) {
    if (node == nullptr) {
        return new TreeNode(value);
    }
    
    if (value <= node->value) {
        node->left = insert(node->left, value);
    } else {
        node->right = insert(node->right, value);
    }
    return node;
}

root = insert(root, 30);
root = insert(root, 20);
root = insert(root, 40);`}
              </pre>
            )}

            {implementationLang === 'python' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`def insert(node, value):
    if node is None:
        return TreeNode(value)
    
    if value <= node.value:
        node.left = insert(node.left, value)
    else:
        node.right = insert(node.right, value)
    
    return node

root = insert(root, 30)
root = insert(root, 20)
root = insert(root, 40)`}
              </pre>
            )}

            {implementationLang === 'java' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`public TreeNode insert(TreeNode node, int value) {
    if (node == null) {
        return new TreeNode(value);
    }
    
    if (value <= node.value) {
        node.left = insert(node.left, value);
    } else {
        node.right = insert(node.right, value);
    }
    return node;
}

root = insert(root, 30);
root = insert(root, 20);
root = insert(root, 40);`}
              </pre>
            )}
          </div>

          {/* Search Operation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3">Search Operation</h3>
            <p className="text-gray-400 text-sm mb-3">Find elements efficiently using binary elimination - O(log n) average</p>
            <LanguageSelector currentLang={implementationLang} setLang={setImplementationLang} />
            
            {implementationLang === 'c' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`bool search(struct TreeNode* node, int target) {
    if (node == NULL) return false;
    
    if (node->value == target) {
        return true;
    } else if (target < node->value) {
        return search(node->left, target);
    } else {
        return search(node->right, target);
    }
}

if (search(root, 20)) {
    printf("Found!\\n");
}`}
              </pre>
            )}

            {implementationLang === 'cpp' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`bool search(TreeNode* node, int target) {
    if (node == nullptr) return false;
    
    if (node->value == target) {
        return true;
    } else if (target < node->value) {
        return search(node->left, target);
    } else {
        return search(node->right, target);
    }
}

if (search(root, 20)) {
    cout << "Found!" << endl;
}`}
              </pre>
            )}

            {implementationLang === 'python' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`def search(node, target):
    if node is None:
        return False
    
    if node.value == target:
        return True
    elif target < node.value:
        return search(node.left, target)
    else:
        return search(node.right, target)

if search(root, 20):
    print("Found!")`}
              </pre>
            )}

            {implementationLang === 'java' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`public boolean search(TreeNode node, int target) {
    if (node == null) return false;
    
    if (node.value == target) {
        return true;
    } else if (target < node.value) {
        return search(node.left, target);
    } else {
        return search(node.right, target);
    }
}

if (search(root, 20)) {
    System.out.println("Found!");
}`}
              </pre>
            )}
          </div>

          {/* Traversals */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3">Tree Traversals</h3>
            <p className="text-gray-400 text-sm mb-3">Visit all nodes in specific order - O(n) for all</p>
            <LanguageSelector currentLang={traversalLang} setLang={setTraversalLang} />
            
            {traversalLang === 'c' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`// In-Order (Left → Root → Right) - gives sorted output
void inOrder(struct TreeNode* node) {
    if (node == NULL) return;
    inOrder(node->left);
    printf("%d ", node->value);
    inOrder(node->right);
}

// Pre-Order (Root → Left → Right) - copy tree
void preOrder(struct TreeNode* node) {
    if (node == NULL) return;
    printf("%d ", node->value);
    preOrder(node->left);
    preOrder(node->right);
}

// Post-Order (Left → Right → Root) - delete tree
void postOrder(struct TreeNode* node) {
    if (node == NULL) return;
    postOrder(node->left);
    postOrder(node->right);
    printf("%d ", node->value);
}`}
              </pre>
            )}

            {traversalLang === 'cpp' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`// In-Order (sorted)
void inOrder(TreeNode* node) {
    if (node == nullptr) return;
    inOrder(node->left);
    cout << node->value << " ";
    inOrder(node->right);
}

// Pre-Order
void preOrder(TreeNode* node) {
    if (node == nullptr) return;
    cout << node->value << " ";
    preOrder(node->left);
    preOrder(node->right);
}

// Post-Order
void postOrder(TreeNode* node) {
    if (node == nullptr) return;
    postOrder(node->left);
    postOrder(node->right);
    cout << node->value << " ";
}`}
              </pre>
            )}

            {traversalLang === 'python' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`# In-Order (sorted)
def inOrder(node):
    if node is None: return
    inOrder(node.left)
    print(node.value, end=' ')
    inOrder(node.right)

# Pre-Order
def preOrder(node):
    if node is None: return
    print(node.value, end=' ')
    preOrder(node.left)
    preOrder(node.right)

# Post-Order
def postOrder(node):
    if node is None: return
    postOrder(node.left)
    postOrder(node.right)
    print(node.value, end=' ')`}
              </pre>
            )}

            {traversalLang === 'java' && (
              <pre className="bg-gray-900/50 rounded-lg p-4 text-emerald-300 text-xs overflow-x-auto border border-emerald-500/20">
{`// In-Order
public void inOrder(TreeNode node) {
    if (node == null) return;
    inOrder(node.left);
    System.out.print(node.value + " ");
    inOrder(node.right);
}

// Pre-Order
public void preOrder(TreeNode node) {
    if (node == null) return;
    System.out.print(node.value + " ");
    preOrder(node.left);
    preOrder(node.right);
}

// Post-Order
public void postOrder(TreeNode node) {
    if (node == null) return;
    postOrder(node.left);
    postOrder(node.right);
    System.out.print(node.value + " ");
}`}
              </pre>
            )}
          </div>

          {/* Complexity */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3">Time & Space Complexity</h3>
            <div className="overflow-x-auto text-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-500/30 bg-emerald-500/10">
                    <th className="px-4 py-2 text-left text-emerald-300">Operation</th>
                    <th className="px-4 py-2 text-left text-emerald-300">Best</th>
                    <th className="px-4 py-2 text-left text-emerald-300">Average</th>
                    <th className="px-4 py-2 text-left text-emerald-300">Worst</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700/50 hover:bg-gray-900/50">
                    <td className="px-4 py-2">Insert</td>
                    <td className="px-4 py-2">O(log n)</td>
                    <td className="px-4 py-2">O(log n)</td>
                    <td className="px-4 py-2 text-red-400">O(n)</td>
                  </tr>
                  <tr className="border-b border-gray-700/50 hover:bg-gray-900/50">
                    <td className="px-4 py-2">Search</td>
                    <td className="px-4 py-2">O(1)</td>
                    <td className="px-4 py-2">O(log n)</td>
                    <td className="px-4 py-2 text-red-400">O(n)</td>
                  </tr>
                  <tr className="border-b border-gray-700/50 hover:bg-gray-900/50">
                    <td className="px-4 py-2">Delete</td>
                    <td className="px-4 py-2">O(log n)</td>
                    <td className="px-4 py-2">O(log n)</td>
                    <td className="px-4 py-2 text-red-400">O(n)</td>
                  </tr>
                  <tr className="hover:bg-gray-900/50">
                    <td className="px-4 py-2">Traversal</td>
                    <td className="px-4 py-2">O(n)</td>
                    <td className="px-4 py-2">O(n)</td>
                    <td className="px-4 py-2">O(n)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Advantages & Disadvantages */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Advantages
              </h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Efficient search - O(log n) average</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Maintains sorted order</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Dynamic insertion/deletion</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>No extra data structure needed</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Disadvantages
              </h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex gap-2">
                  <span className="text-red-400">✗</span>
                  <span>Worst case O(n) if skewed</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">✗</span>
                  <span>No random access by index</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">✗</span>
                  <span>Complex deletion operation</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">✗</span>
                  <span>Requires pointer management</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Advanced Content */}
        <section className="bg-gray-800/50 rounded-xl p-6 border border-emerald-500/20">
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">Advanced Content Coming Soon</h2>
          <div className="space-y-3 text-gray-400 text-sm">
            <p>More advanced tree topics will be available soon:</p>
            <ul className="space-y-2 ml-4">
              <li>• AVL Trees - Self-balancing BSTs</li>
              <li>• Red-Black Trees - Color-based balancing</li>
              <li>• B-Trees - Database indexing</li>
              <li>• Segment Trees - Range queries</li>
              <li>• Trie Trees - String matching</li>
            </ul>
          </div>
        </section>

        </div>
      </div>
    </CompletionTracker>
  );
};

export default TreesIntroContent;
