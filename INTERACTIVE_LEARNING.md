# Interactive Learning System Documentation

## Overview

Signum implements **interactive algorithm visualizations** with synchronized pseudocode to transform passive learning into active exploration. Each visualization demonstrates data structure operations through step-by-step animations with real-time code highlighting.

**Coverage:** 7 data structures with complete operation sets  
**Technology:** React 19 + Pure JavaScript + Tailwind CSS  
**Theme:** Dark background (#060807) with emerald accents (#10B981)  
**Architecture:** Pure frontend with no backend dependency  

**Key Features:**
- Synchronized pseudocode highlighting during operations
- Step-by-step execution with adjustable speed (150-1500ms)
- Auto-play mode with pause/resume controls
- Direct data manipulation (click-to-edit cells)
- Seed data for quick testing
- Responsive layout with 75% visualizer / 25% code split

---

## Implemented Visualizations


---

## Implemented Visualizations

### 1. Binary Search Tree (BST)

**File:** `TreeVisualization.jsx`  
**Visual:** SVG-based tree with automatic layout (in-order columns, depth rows)

**Operations:**
- **Insert** - Visual path highlighting to insertion point
- **Search** - Step-by-step trace with path animation
- **Delete** - All cases demonstrated (leaf, one child, two children with successor)
- **Find Min/Max** - Path trace to extreme nodes

**Traversals:**
- **Inorder** - Sorted output (left → root → right)
- **Preorder** - Root → left → right
- **Postorder** - Left → right → root  
- **Level-order** - Breadth-first traversal

**Features:**
- Auto-play with adjustable speed (200-1500ms)
- Step navigation (prev/next through trace)
- Seed with example tree [50,30,70,20,40,60,80]
- 25% code panel with operation-specific pseudocode
- Node highlighting during operations (emerald → black contrast)
- Traversal output ribbon showing visit order

**Layout Algorithm:**
- In-order traversal assigns X coordinates (68px gap)
- Depth level assigns Y coordinates (100px gap)
- useMemo optimization prevents re-computation
- Dynamic SVG sizing based on tree structure

---

### 2. Stack Data Structure

**File:** `StackVisualization.jsx`  
**Visual:** Vertical container with bottom-aligned elements (LIFO visualization)

**Operations:**
- **Push** - Add element to top (with overflow detection)
- **Pop** - Remove from top (with underflow detection)
- **Peek** - View top element without removal
- **isEmpty** - Check for empty stack
- **isFull** - Check for capacity limit

**Features:**
- Adjustable capacity (1-24 elements)
- Vertical container (52vh height) with emerald glow
- TOP/BOTTOM markers for orientation
- Seed with sample data [A, B, C]
- Enter key support for quick push
- Filled cells highlighted with emerald/80 background
- Step-by-step pseudocode highlighting (380ms per step)

**Visual Design:**
- `flex-col-reverse` for bottom-up rendering
- Capacity indicator in real-time
- Item entrance animation on push

---

### 3. Queue (Circular)

**File:** `QueueVisualization.jsx`  
**Visual:** Horizontal tray with FRONT/REAR markers

**Operations:**
- **Enqueue** - Add to rear (with overflow detection)
- **Dequeue** - Remove from front (with underflow detection)
- **Peek** - View front element
- **isEmpty** - Check for empty queue
- **isFull** - Check for capacity limit

**Circular Queue Implementation:**
- Front/rear pointer visualization
- Modulo arithmetic for wrap-around: `(front + size) % capacity`
- Efficient space utilization
- Next write slot highlighted with ring

**Features:**
- Adjustable capacity (2-20 elements)
- FRONT/REAR badges on appropriate cells
- Index labels (0-based) on each cell
- Seed with sample data
- 360ms step delay for operation visibility
- Real-time metrics: capacity, front pointer, size

---

### 4. 1D Array Operations

**File:** `Array1DVisualization.jsx`  
**Visual:** Horizontal grid with index chips

**Basic Operations:**
- **Set(i, val)** - Direct element assignment
- **Get(i)** - Element retrieval with highlighting
- **Fill(val)** - Populate entire array
- **Randomize** - Generate 2-digit random values
- **Length** - Dynamic resize (1-24 elements)

**Search Algorithms:**
- **Linear Search** - Animated sequential scan
- **Binary Search** - Animated divide-and-conquer (requires sorted array)

**Advanced Operations:**
- **Traverse** - Left-to-right animation
- **Find Min/Max** - Animated search with comparisons
- **Reverse** - Two-pointer swap animation
- **Bubble Sort** - Complete animated sort with compare/swap visualization

**Direct Editing:**
- Click any cell to edit in-place
- Enter to save, Escape to cancel
- Blur auto-saves changes
- Real-time value updates

**Visual Feedback:**
- Active cell: black background with emerald ring
- Filled cells: emerald/80 background
- Empty cells: white/5 background
- Index chips on each cell
- Sort comparison animations (120-1500ms adjustable)

---

### 5. 2D Array (Matrix) Operations

**File:** `Array2DVisualization.jsx`  
**Visual:** CSS Grid layout with row/column labels

**Matrix Operations:**
- **Set(r, c, value)** - Direct cell assignment
- **Get(r, c)** - Cell value retrieval
- **Fill(value)** - Populate entire matrix
- **Randomize** - Generate 2-digit random values
- **Search(target)** - Animated linear search

**Traversal Algorithms:**
- **Row-Major** - Standard iteration (row by row)
- **Column-Major** - Vertical iteration (column by column)
- **Spiral** - Clockwise traversal from outer to inner

**Matrix Transformations:**
- **Transpose** - Row↔column swap with size change
- **Rotate 90°** - Clockwise rotation with animation

**Dimension Controls:**
- Adjustable rows (1-10)
- Adjustable columns (1-12)
- Dynamic resizing preserves existing data
- Auto-layout grid system

**Direct Editing:**
- Click any cell to edit in-place
- Enter to save, Escape to cancel
- Blur auto-saves changes
- Cell coordinates displayed (1-based for UX)

---

### 6. Singly Linked List

**File:** `SinglyLinkedListVisualization.jsx`  
**Visual:** Horizontal nodes with arrows and HEAD/TAIL markers

**Operations:**
- **Insert Head** - Add node at beginning
- **Insert Tail** - Add node at end
- **Delete Head** - Remove first node
- **Delete Tail** - Remove last node
- **Search** - Find node by value
- **Traverse** - Visit all nodes in sequence

**Features:**
- HEAD/TAIL markers for orientation
- Arrow connections between nodes
- Seed with sample data
- Clear list function
- 360ms step delay for visibility
- Pseudocode highlighting for each operation

---

### 7. Doubly Linked List

**File:** `DoublyLinkedListVisualization.jsx`  
**Visual:** Horizontal nodes with bidirectional arrows

**Operations:**
- **Insert Head** - Add node at beginning
- **Insert Tail** - Add node at end
- **Insert After** - Add node after specific index
- **Delete Head** - Remove first node
- **Delete Tail** - Remove last node
- **Delete Node** - Remove specific node
- **Search** - Find node by value
- **Traverse Forward** - HEAD to TAIL
- **Traverse Backward** - TAIL to HEAD

**Features:**
- Bidirectional arrow visualization (prev/next pointers)
- Index-based insertion support
- Forward and backward traversal animations
- Real-time node highlighting during operations

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Visualization Components (Pure Frontend)                       │
│  ├── TreeVisualization.jsx         (BST with SVG rendering)     │
│  ├── StackVisualization.jsx        (Vertical LIFO container)    │
│  ├── QueueVisualization.jsx        (Circular FIFO)              │
│  ├── Array1DVisualization.jsx      (Array + sorting algorithms) │
│  ├── Array2DVisualization.jsx      (Matrix operations)          │
│  ├── SinglyLinkedListVisualization.jsx  (Linked list basics)   │
│  └── DoublyLinkedListVisualization.jsx  (Bidirectional list)   │
│                                                                  │
│  Rendering Technologies                                         │
│  ├── SVG (TreeVisualization - scalable tree rendering)          │
│  ├── CSS Grid (Matrix layout with dynamic sizing)               │
│  ├── Flexbox (Stack/Queue containers)                           │
│  └── Tailwind CSS (Dark theme with emerald accents)             │
│                                                                  │
│  State Management (React Hooks)                                 │
│  ├── useState - Component state (array, tree, list data)        │
│  ├── useRef - Animation timers and DOM references               │
│  ├── useEffect - Auto-play logic and step synchronization       │
│  └── useMemo - Expensive layout calculations (BST positioning)  │
│                                                                  │
│  Algorithm Execution                                            │
│  ├── Pure JavaScript implementations (no external libraries)    │
│  ├── Step-by-step trace generation                              │
│  ├── async/await for animation control                          │
│  ├── Auto-play with pause/resume                                │
│  └── Manual step navigation (prev/next)                         │
│                                                                  │
│  Code Panel Integration (25% split)                             │
│  ├── Operation-specific pseudocode                              │
│  ├── Line-by-line highlighting synchronized with visual steps   │
│  ├── Academic-standard algorithm notation                       │
│  └── Scrollable for longer algorithms                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Design Principles:**

**1. Pure Frontend Architecture**
- No backend API calls for visualizations
- Instant load times and responsiveness
- Works offline after initial page load
- Reduces server load

**2. Consistent Visual Language**
- Dark background (#060807) across all visualizations
- Emerald accents (#10B981, #34D399) for active elements
- 75/25 split: Visualizer | Pseudocode panel
- Tailwind-only styling (no CSS files)

**3. Educational Focus**
- Pseudocode matches academic standards
- Big O notation in algorithm descriptions
- Step-by-step execution for deep understanding
- Active cell highlighting for operation clarity

**4. Performance Optimization**
- `useMemo` for expensive BST layout calculations
- Efficient re-renders via React best practices
- Minimal DOM manipulation for 60 FPS animations
- Web Workers ready for heavy computations

---

## Technology Stack

**Core Technologies:**
- **React 19** - Component framework with hooks API
- **Tailwind CSS** - Utility-first styling with dark theme
- **Pure JavaScript** - Algorithm implementations (no libraries)
- **SVG** - Scalable vector graphics for tree rendering
- **CSS Grid** - Matrix layout system
- **Flexbox** - Stack/queue container alignment

**Animation Control:**
- **async/await** - Step-by-step animation sequencing
- **setTimeout** - Delay control between steps
- **useRef** - Timer management without state updates
- **Speed Control** - 150ms to 1500ms adjustable range

**Layout Algorithms:**
- **BST Layout** - In-order X-axis, depth Y-axis with useMemo optimization
- **Array Grid** - Dynamic columns based on length
- **Matrix Grid** - CSS Grid with `repeat(cols, minmax(56px, 1fr))`

---

## Feature Summary

### Common Features Across All Visualizations

**Control Panel:**
- Input fields with Enter key support
- Operation buttons (Insert, Delete, Search, etc.)
- Seed button for quick data population
- Clear button to reset visualization
- Adjustable speed slider (150-1500ms)
- Auto-play with pause/resume

**Code Panel (25% width):**
- Operation-specific pseudocode
- Line-by-line highlighting synchronized with visual steps
- Scrollable for longer algorithms
- Academic-standard algorithm notation

**Tracer Controls:**
- Step navigation (Previous/Next buttons)
- Current step indicator (e.g., "3 / 15")
- Step description in status area
- Reset button to clear trace

**Visual Feedback:**
- Active cell/node highlighting (emerald accents)
- Smooth transitions (Tailwind animations)
- Real-time status messages
- Operation completion indicators

### Direct Manipulation (Arrays/Matrix)

**In-Place Editing:**
- Click any cell to edit directly
- Enter key saves changes
- Escape key cancels editing
- Blur event auto-saves
- Visual focus indicator during edit

**Dynamic Sizing:**
- Arrays: 1-24 elements
- Matrix: 1-10 rows × 1-12 columns
- Stack: 1-24 capacity
- Queue: 2-20 capacity
- Preserves existing data on resize

---

## System Constraints

**Browser Requirements:**
- Modern browser with ES6+ support
- SVG rendering capability (for BST)
- CSS Grid support (for matrices)
- No Internet Explorer support

**Performance Limits:**
- BST: Optimal for trees with <100 nodes
- Arrays: Maximum 24 elements per visualization
- Matrix: Maximum 10×12 grid (120 cells)
- Animation: 150ms minimum step delay (60 FPS target)

**Data Types:**
- Arrays/Matrices: String or number values
- BST: Numeric values only (for comparison)
- Lists: Any string/number values
- No object or complex type support

**Operation Scope:**
- Visualizations are independent (no cross-component state)
- No persistence (data lost on page refresh)
- No undo/redo functionality
- Single active animation per component

**Editing Constraints:**
- Direct editing only for arrays and matrices
- BST nodes cannot be edited in-place (must delete+insert)
- Lists use separate insert/delete operations
- No bulk edit operations

---

## Visual Diagrams

### Diagram 1: Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                  VISUALIZATION COMPONENT FLOW                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  USER INTERACTION                                                │
└───────────────────┬──────────────────────────────────────────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
┌────────────────┐   ┌──────────────────┐
│ Direct Edit    │   │ Operation Button │
│ (Click cell)   │   │ (Insert/Delete)  │
└────────┬───────┘   └─────────┬────────┘
         │                     │
         │                     ▼
         │          ┌──────────────────────┐
         │          │ Build Trace Steps    │
         │          │ [{msg, cells, pc}]   │
         │          └──────────┬───────────┘
         │                     │
         └─────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Update State        │
        │  - Data structure    │
        │  - Trace array       │
        │  - Pseudocode kind   │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Render Loop         │
        │  (React re-render)   │
        └──────────┬───────────┘
                   │
      ┌────────────┴────────────┐
      │                         │
      ▼                         ▼
┌──────────────┐      ┌──────────────────┐
│ Visualizer   │      │ Code Panel       │
│ (75% width)  │      │ (25% width)      │
├──────────────┤      ├──────────────────┤
│ • Data view  │      │ • Pseudocode     │
│ • Highlight  │      │ • Line highlight │
│ • Animation  │      │ • Scrollable     │
└──────┬───────┘      └────────┬─────────┘
       │                       │
       └───────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Auto-Play Timer     │
        │  (if enabled)        │
        └──────────┬───────────┘
                   │
              useEffect
         setInterval(speed)
                   │
                   ▼
        ┌──────────────────────┐
        │  Increment Step      │
        │  setStep(s => s + 1) │
        └──────────┬───────────┘
                   │
                   │  Loop until
                   │  step >= trace.length
                   │
                   ▼
        ┌──────────────────────┐
        │  Animation Complete  │
        │  setIsPlaying(false) │
        └──────────────────────┘
```

---

### Diagram 2: Data Flow Example (Binary Search)

```
┌─────────────────────────────────────────────────────────────────────┐
│           BINARY SEARCH VISUALIZATION FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

User Input: "Search for 40"
Array: [10, 20, 30, 40, 50, 60, 70]  (sorted)
Speed: 500ms

         │
         ▼
┌──────────────────────────────────┐
│ onBinarySearch() triggered       │
└──────────┬───────────────────────┘
           │
           ▼
Check: Is array sorted?
  ├─ NO → Show error: "Array must be sorted. Use Sort ↑ button."
  └─ YES → Continue
           │
           ▼
┌──────────────────────────────────┐
│ Build Trace Steps                │
│                                  │
│ Initialize:                      │
│  left = 0, right = 6             │
│  target = 40                     │
│                                  │
│ Step 1:                          │
│  msg: "l=0, r=6"                 │
│  cells: []                       │
│  pc: [1]  // Line 1 of pseudocode│
│                                  │
│ Step 2:                          │
│  mid = (0 + 6) / 2 = 3           │
│  msg: "mid=3"                    │
│  cells: [3]  // Highlight A[3]   │
│  pc: [2]  // Line 2 of pseudocode│
│                                  │
│ Step 3:                          │
│  A[3] = 40 == target             │
│  msg: "Found at i=3"             │
│  cells: [3]                      │
│  pc: [3]                         │
│                                  │
│ trace = [Step1, Step2, Step3]    │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Update React State               │
│  setTrace(trace)                 │
│  setStep(0)                      │
│  setIsPlaying(true)              │
│  setPseudo({kind:'bsearch',...}) │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ useEffect (step change)          │
│  Current step: 0                 │
│                                  │
│  s = trace[0]                    │
│  setStatus("l=0, r=6")           │
│  setPcHi(new Set([1]))           │
│  setHiCells(new Set())           │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Render                                   │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ VISUALIZER (75%)                   │  │
│ │                                    │  │
│ │  [10] [20] [30] [40] [50] [60] [70]│  │
│ │   0    1    2    3    4    5    6  │  │
│ │                                    │  │
│ │  (no cells highlighted yet)        │  │
│ │                                    │  │
│ │  Status: "l=0, r=6"                │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ CODE PANEL (25%)                   │  │
│ │                                    │  │
│ │ Binary Search Algorithm            │  │
│ │                                    │  │
│ │ 1. Initialize left=0, right=n-1 ← ✓│  │
│ │ 2. Calculate middle index          │  │
│ │ 3. If A[middle] equals target      │  │
│ │ 4. If target < A[middle]           │  │
│ │ 5. If target > A[middle]           │  │
│ │ 6. Return -1 if not found          │  │
│ │                                    │  │
│ │ (Line 1 highlighted in emerald)    │  │
│ └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
           │
           │ Wait 500ms (speed setting)
           ▼
┌──────────────────────────────────┐
│ Auto-Play Timer fires            │
│  setStep(1)                      │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ useEffect (step change)          │
│  Current step: 1                 │
│                                  │
│  s = trace[1]                    │
│  setStatus("mid=3")              │
│  setPcHi(new Set([2]))           │
│  setHiCells(new Set(['i-3']))    │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Render                                   │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ VISUALIZER (75%)                   │  │
│ │                                    │  │
│ │  [10] [20] [30] ⦗40⦘ [50] [60] [70]│  │
│ │   0    1    2    3    4    5    6  │  │
│ │                  ↑                 │  │
│ │         (emerald highlight)        │  │
│ │                                    │  │
│ │  Status: "mid=3"                   │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ CODE PANEL (25%)                   │  │
│ │                                    │  │
│ │ Binary Search Algorithm            │  │
│ │                                    │  │
│ │ 1. Initialize left=0, right=n-1    │  │
│ │ 2. Calculate middle index        ← ✓│  │
│ │ 3. If A[middle] equals target      │  │
│ │ 4. If target < A[middle]           │  │
│ │ 5. If target > A[middle]           │  │
│ │ 6. Return -1 if not found          │  │
│ │                                    │  │
│ │ (Line 2 highlighted in emerald)    │  │
│ └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
           │
           │ Wait 500ms
           ▼
┌──────────────────────────────────┐
│ Auto-Play Timer fires            │
│  setStep(2)                      │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ useEffect (step change)          │
│  Current step: 2 (FINAL)         │
│                                  │
│  s = trace[2]                    │
│  setStatus("Found at i=3")       │
│  setPcHi(new Set([3]))           │
│  setHiCells(new Set(['i-3']))    │
│                                  │
│  if (step >= trace.length - 1):  │
│    setIsPlaying(false)           │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Final Render                             │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ VISUALIZER (75%)                   │  │
│ │                                    │  │
│ │  [10] [20] [30] ⦗40⦘ [50] [60] [70]│  │
│ │   0    1    2    3    4    5    6  │  │
│ │                  ↑                 │  │
│ │         (emerald highlight)        │  │
│ │                                    │  │
│ │  Status: "Found at i=3"            │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ CODE PANEL (25%)                   │  │
│ │                                    │  │
│ │ Binary Search Algorithm            │  │
│ │                                    │  │
│ │ 1. Initialize left=0, right=n-1    │  │
│ │ 2. Calculate middle index          │  │
│ │ 3. If A[middle] equals target    ← ✓│  │
│ │ 4. If target < A[middle]           │  │
│ │ 5. If target > A[middle]           │  │
│ │ 6. Return -1 if not found          │  │
│ │                                    │  │
│ │ (Line 3 highlighted in emerald)    │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ TRACER CONTROLS                    │  │
│ │                                    │  │
│ │  [⟵ Prev]  [Next ⟶]  [Pause]       │  │
│ │                                    │  │
│ │  Step: 3 / 3                       │  │
│ │                                    │  │
│ │  Status: "Found at i=3"            │  │
│ └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
           │
           ▼
    Animation Complete
    (User can step back/forward or reset)


═══════════════════════════════════════════════════════════════════════
                      STATE MANAGEMENT FLOW
═══════════════════════════════════════════════════════════════════════

React Component State:
┌────────────────────────────────────┐
│ const [arr, setArr] = useState([]) │  ← Data structure
│ const [trace, setTrace] = ...     │  ← Animation steps
│ const [step, setStep] = ...       │  ← Current step index
│ const [isPlaying, setIsPlaying]   │  ← Auto-play state
│ const [speed, setSpeed] = ...     │  ← Animation speed (ms)
│ const [pseudo, setPseudo] = ...   │  ← Current pseudocode
│ const [pcHi, setPcHi] = ...       │  ← Highlighted code lines
│ const [hi, setHi] = ...           │  ← Highlighted cells/nodes
└────────────────────────────────────┘

Auto-Play Mechanism:
┌────────────────────────────────────┐
│ useEffect(() => {                  │
│   if (!isPlaying) return;          │
│   timer = setInterval(() => {      │
│     setStep(s => s + 1);           │
│   }, speed);                       │
│   return () => clearInterval(...); │
│ }, [isPlaying, speed]);            │
└────────────────────────────────────┘

Step Synchronization:
┌────────────────────────────────────┐
│ useEffect(() => {                  │
│   const s = trace[step];           │
│   setStatus(s.msg);                │
│   setPcHi(new Set(s.pc));          │
│   setHi(new Set(s.cells));         │
│   if (step >= trace.length - 1)    │
│     setIsPlaying(false);           │
│ }, [step, trace]);                 │
└────────────────────────────────────┘
```

---

*This interactive learning system provides hands-on algorithm exploration through synchronized visual and code demonstrations, enabling students to understand data structures and algorithms through active learning.*
