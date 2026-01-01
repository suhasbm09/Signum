/**
 * Pseudocode Panel Component
 * Displays algorithm pseudocode with highlighted lines
 * Fixed 25% width, scrollable, collapsible on mobile
 */

import React, { useState } from 'react';

const TITLES = {
  // Array operations
  set: "Array Assignment",
  get: "Array Access",
  fill: "Fill Operation",
  trav: "Traversal",
  search: "Linear Search",
  bsearch: "Binary Search",
  min: "Find Minimum",
  max: "Find Maximum",
  reverse: "Reverse Array",
  bsort: "Bubble Sort",
  
  // Stack operations
  push: "Push Operation",
  pop: "Pop Operation",
  peek: "Peek / Top",
  isempty: "Is Empty Check",
  isfull: "Is Full Check",
  
  // Queue operations
  enqueue: "Enqueue Operation",
  dequeue: "Dequeue Operation",
  front: "Front / Peek",
  
  // Linked List operations
  insertHead: "Insert at Head",
  insertTail: "Insert at Tail",
  deleteHead: "Delete Head",
  deleteTail: "Delete Tail",
  listSearch: "Search (Linked List)",
  traverse: "Traverse List",
  
  // Doubly Linked List operations (additional)
  insertAfter: "Insert After Index",
  insertBefore: "Insert Before Index",
  deleteAtIndex: "Delete at Index",
  deleteByValue: "Delete by Value",
  
  // Tree operations
  insert: "BST Insert",
  bstSearch: "BST Search",
  delete: "BST Delete",
  inorder: "Inorder Traversal",
  preorder: "Preorder Traversal",
  postorder: "Postorder Traversal",
  levelorder: "Level-Order Traversal",
  bstMin: "BST Minimum",
  bstMax: "BST Maximum",
};

const PSEUDOCODE = {
  // Array operations
  set: [
    "Validate array bounds for index i",
    "Assign value to A[i]",
  ],
  get: [
    "Validate array bounds for index i",
    "Return element at A[i]",
  ],
  fill: [
    "For each index i from 0 to n-1:",
    "  Set A[i] = specified value",
  ],
  trav: [
    "For each index i from 0 to n-1:",
    "  Process element A[i]",
  ],
  search: [
    "For each index i from 0 to n-1:",
    "  Compare A[i] with target value",
    "  If match found, return index i",
    "Return -1 (not found)",
  ],
  bsearch: [
    "Initialize left = 0, right = n-1",
    "Calculate middle = (left + right) / 2",
    "If A[middle] equals target: return middle",
    "If target < A[middle]: search left half",
    "If target > A[middle]: search right half",
    "Return -1 if not found",
  ],
  min: [
    "Initialize minIndex = 0",
    "For each index i from 1 to n-1:",
    "  If A[i] < A[minIndex]: minIndex = i",
    "Return minIndex",
  ],
  max: [
    "Initialize maxIndex = 0",
    "For each index i from 1 to n-1:",
    "  If A[i] > A[maxIndex]: maxIndex = i",
    "Return maxIndex",
  ],
  reverse: [
    "Set l = 0, r = n - 1",
    "While l < r:",
    "  swap A[l] and A[r]",
    "  l = l + 1, r = r - 1",
    "End",
  ],
  bsort: [
    "For i = 0 … n-2:",
    "  (new pass) set swapped = false",
    "  For j = 0 … n-2-i: compare A[j], A[j+1]",
    "    If A[j] > A[j+1]: swap, set swapped = true",
    "  End pass (last index fixed)",
    "  If swapped == false: early exit",
  ],
  
  // Stack operations
  push: [
    "if size == capacity: return overflow",
    "else: top ← top + 1",
    "stack[top] ← value",
    "size ← size + 1",
    "return success",
  ],
  pop: [
    "if size == 0: return underflow",
    "value ← stack[top]",
    "top ← top - 1, size ← size - 1",
    "return value",
  ],
  peek: [
    "if size == 0: return null",
    "return stack[top]",
    "end",
  ],
  isempty: [
    "return (size == 0)",
    "end",
  ],
  isfull: [
    "return (size == capacity)",
    "end",
  ],
  
  // Queue operations
  enqueue: [
    "if size == capacity: return overflow",
    "rear ← (front + size) % capacity",
    "queue[rear] ← value",
    "size ← size + 1",
    "return success",
  ],
  dequeue: [
    "if size == 0: return underflow",
    "value ← queue[front]",
    "front ← (front + 1) % capacity",
    "size ← size - 1",
    "return value",
  ],
  front: [
    "if size == 0: return null",
    "return queue[front]",
    "end",
  ],
  
  // Singly Linked List operations
  insertHead: [
    "Create new node with value",
    "Point new node.next to current head",
    "Update head to new node",
  ],
  insertTail: [
    "Create new node with value",
    "If list empty, set as head",
    "Traverse to last node",
    "Link last.next to new node",
  ],
  deleteHead: [
    "Check if list is empty",
    "Save head node value",
    "Move head to next node",
  ],
  deleteTail: [
    "Check if list is empty",
    "Traverse to second-last node",
    "Remove link to last node",
  ],
  listSearch: [
    "Start at head node",
    "Compare current value with target",
    "Return null if not found",
  ],
  traverse: [
    "Start at head",
    "Visit each node until end",
  ],
  
  // Doubly Linked List operations
  insertAfter: [
    "Find node at target index",
    "Create new node with value",
    "Update new node pointers (prev/next)",
    "Update adjacent node pointers",
  ],
  insertBefore: [
    "Find node at target index",
    "Create new node with value",
    "Update new node pointers (prev/next)",
    "Update adjacent node pointers",
  ],
  deleteAtIndex: [
    "Find node at target index",
    "Update previous node's next pointer",
    "Update next node's prev pointer",
    "Remove target node",
  ],
  deleteByValue: [
    "Search for node with value",
    "Update previous node's next pointer",
    "Update next node's prev pointer",
    "Remove target node",
  ],
  
  // Tree operations
  insert: [
    "cur ← root",
    "while cur ≠ null:",
    "  if x == cur.val: return (duplicate)",
    "  cur ← (x < cur.val) ? cur.left : cur.right",
    "attach new node x at null position",
  ],
  bstSearch: [
    "cur ← root",
    "while cur ≠ null:",
    "  if x == cur.val: return cur (found)",
    "  if x < cur.val: cur ← cur.left",
    "  else: cur ← cur.right",
    "return not found",
  ],
  delete: [
    "cur ← root",
    "while cur and cur.val ≠ x:",
    "  if x < cur.val: cur ← cur.left",
    "  else: cur ← cur.right",
    "if cur is null: return (not found)",
    "// found node cur",
    "if leaf: remove cur",
    "else if single child: promote child",
    "else: // two children",
    "  s ← leftmost(cur.right)",
    "  cur.val ← s.val",
    "  delete s from cur.right",
  ],
  inorder: [
    "function inorder(node):",
    "  if node == null: return",
    "  inorder(node.left)",
    "  visit(node)",
    "  inorder(node.right)",
  ],
  preorder: [
    "function preorder(node):",
    "  if node == null: return",
    "  visit(node)",
    "  preorder(node.left)",
    "  preorder(node.right)",
  ],
  postorder: [
    "function postorder(node):",
    "  if node == null: return",
    "  postorder(node.left)",
    "  postorder(node.right)",
    "  visit(node)",
  ],
  levelorder: [
    "q ← [root]",
    "while q not empty:",
    "  node ← dequeue(q)",
    "  visit(node)",
    "  if node.left: enqueue(node.left)",
    "  if node.right: enqueue(node.right)",
  ],
  bstMin: [
    "cur ← root",
    "while cur.left ≠ null:",
    "  cur ← cur.left",
    "return cur.val",
  ],
  bstMax: [
    "cur ← root",
    "while cur.right ≠ null:",
    "  cur ← cur.right",
    "return cur.val",
  ],
};

export function PseudocodePanel({ algorithmType, highlightedLines, isMobile }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const lines = PSEUDOCODE[algorithmType] || [];
  const title = TITLES[algorithmType] || "Pseudocode";

  if (isMobile && isCollapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsCollapsed(false)}
          className="rounded-full bg-emerald-500 p-3 shadow-lg ring-2 ring-emerald-400/50 hover:bg-emerald-600"
        >
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`
      ${isMobile ? 'fixed bottom-0 left-0 right-0 z-40 max-h-[50vh]' : 'h-full'}
      flex flex-col
      rounded-2xl border border-emerald-500/10 bg-[#0B0F0E]/95 backdrop-blur-sm
      ${isMobile ? 'rounded-b-none' : ''}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-500/10 p-3">
        <div>
          <div className="text-xs text-emerald-400/60 font-semibold tracking-wide">PSEUDOCODE</div>
          <div className="text-sm text-emerald-300 font-medium mt-0.5">{title}</div>
        </div>
        {isMobile && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="rounded-lg p-1.5 hover:bg-white/5"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto p-4">
        {!lines.length ? (
          <div className="text-xs text-white/50 text-center py-8">
            Select an algorithm to view its pseudocode implementation.
          </div>
        ) : (
          <ol className="space-y-1.5 text-sm leading-relaxed font-mono">
            {lines.map((line, i) => {
              const lineNumber = i + 1;
              const isHighlighted = highlightedLines?.has(lineNumber);
              
              return (
                <li
                  key={i}
                  className={`
                    flex items-start gap-3 px-2 py-1.5 rounded-lg transition-all
                    ${isHighlighted 
                      ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30' 
                      : 'text-white/70 hover:bg-white/5'
                    }
                  `}
                >
                  <span className={`
                    flex-shrink-0 w-6 text-right text-xs
                    ${isHighlighted ? 'text-emerald-400 font-bold' : 'text-white/40'}
                  `}>
                    {lineNumber}
                  </span>
                  <span className="flex-1">{line}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
