/**
 * Binary Search Tree Visualization - Refactored & Optimized
 * Clean architecture with custom hooks and separated concerns
 * Features: Speed controls, mobile responsive, RAF animations
 */

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { VisualizationLayout } from './components/VisualizationLayout';
import { useAnimationEngine } from './hooks/useAnimationEngine';

// Pseudocode definitions for each operation
const PSEUDO_CODES = {
  insert: {
    title: 'Insert Operation',
    lines: [
      '1. cur ← root',
      '2. while cur ≠ null:',
      '3.   if x == cur.val: return (duplicate)',
      '4.   cur ← (x < cur.val) ? cur.left : cur.right',
      '5. attach new node x at null position',
    ],
  },
  search: {
    title: 'Search Operation',
    lines: [
      '1. cur ← root',
      '2. while cur ≠ null:',
      '3.   if x == cur.val: return cur (found)',
      '4.   if x < cur.val: cur ← cur.left',
      '5.   else: cur ← cur.right',
      '6. return not found',
    ],
  },
  delete: {
    title: 'Delete Operation',
    lines: [
      '1. cur ← root',
      '2. while cur and cur.val ≠ x:',
      '3.   if x < cur.val: cur ← cur.left',
      '4.   else: cur ← cur.right',
      '5. if cur is null: return (not found)',
      '6. // found node cur',
      '7. if leaf: remove cur',
      '8. else if single child: promote child',
      '9. else: // two children',
      '10.   s ← leftmost(cur.right)',
      '11.   cur.val ← s.val',
      '12.   delete s from cur.right',
    ],
  },
  inorder: {
    title: 'Inorder Traversal',
    lines: [
      '1. function inorder(node):',
      '2.   if node == null: return',
      '3.   inorder(node.left)',
      '4.   visit(node)',
      '5.   inorder(node.right)',
    ],
  },
  preorder: {
    title: 'Preorder Traversal',
    lines: [
      '1. function preorder(node):',
      '2.   if node == null: return',
      '3.   visit(node)',
      '4.   preorder(node.left)',
      '5.   preorder(node.right)',
    ],
  },
  postorder: {
    title: 'Postorder Traversal',
    lines: [
      '1. function postorder(node):',
      '2.   if node == null: return',
      '3.   postorder(node.left)',
      '4.   postorder(node.right)',
      '5.   visit(node)',
    ],
  },
  levelorder: {
    title: 'Level-Order Traversal',
    lines: [
      '1. q ← [root]',
      '2. while q not empty:',
      '3.   node ← dequeue(q)',
      '4.   visit(node)',
      '5.   if node.left: enqueue(node.left)',
      '6.   if node.right: enqueue(node.right)',
    ],
  },
  min: {
    title: 'Find Minimum',
    lines: [
      '1. cur ← root',
      '2. while cur.left ≠ null:',
      '3.   cur ← cur.left',
      '4. return cur.val',
    ],
  },
  max: {
    title: 'Find Maximum',
    lines: [
      '1. cur ← root',
      '2. while cur.right ≠ null:',
      '3.   cur ← cur.right',
      '4. return cur.val',
    ],
  },
};

export default function TreeVisualization({ embedded = false }) {
  // BST state
  const [root, setRoot] = useState(null);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('BST visualizer ready. Insert values or click Seed to begin.');
  const idRef = useRef(1);
  
  // Animation state
  const [trace, setTrace] = useState([]);
  const [algorithmType, setAlgorithmType] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [highlightedLines, setHighlightedLines] = useState(new Set());
  
  // Traversal output ribbon
  const [traversalOutput, setTraversalOutput] = useState({ type: null, list: [] });
  
  // Pending delete operation
  const [pendingDelete, setPendingDelete] = useState(null);
  
  // Animation engine
  const animation = useAnimationEngine({
    trace,
    onStepChange: (step) => updateVisualization(step),
    baseSpeed: 500,
  });

  // Update visualization based on current step
  const updateVisualization = (step) => {
    if (!trace[step]) return;
    
    const currentTrace = trace[step];
    setStatus(currentTrace.msg);
    setHighlightedLines(new Set(currentTrace.pc || []));
    setHighlightedNodes(new Set(currentTrace.ids || []));
  };

  // Update visualization when step changes
  useEffect(() => {
    if (trace.length > 0) {
      updateVisualization(animation.step);
      
      // Apply delete when animation finishes
      if (!animation.isPlaying && animation.step >= trace.length - 1 && pendingDelete !== null) {
        applyDelete(pendingDelete);
        setPendingDelete(null);
      }
    }
  }, [animation.step, trace, animation.isPlaying]);

  // Helper: create node
  const makeNode = (val, parent = null) => ({
    id: idRef.current++,
    value: Number(val),
    left: null,
    right: null,
    parent,
  });

  // Clone root to trigger re-render
  const cloneRoot = () => setRoot((r) => (r ? { ...r } : r));

  // Reset animation state
  const resetAnimation = () => {
    setTrace([]);
    animation.reset();
    setAlgorithmType(null);
    setHighlightedNodes(new Set());
    setHighlightedLines(new Set());
    setTraversalOutput({ type: null, list: [] });
    setPendingDelete(null);
  };

  // Flash highlight helper
  const flash = (ids, msg, kind = null) => {
    setHighlightedNodes(new Set(ids));
    setStatus(msg);
    if (kind) {
      setAlgorithmType(kind);
    }
    setTimeout(() => setHighlightedNodes(new Set()), 900);
  };

  // ================= BST OPERATIONS =================
  
  // Insert value
  const onInsert = () => {
    const v = Number(value);
    if (!value || Number.isNaN(v)) return;
    
    resetAnimation();
    setAlgorithmType('insert');
    
    if (!root) {
      const n = makeNode(v);
      setRoot(n);
      flash([n.id], `Inserted ${v} as root`, 'insert');
      setValue('');
      return;
    }
    
    let cur = root, parent = null;
    const path = [];
    
    while (cur) {
      path.push(cur.id);
      parent = cur;
      if (v === cur.value) {
        flash(path, `Value ${v} already exists`, 'insert');
        setValue('');
        return;
      }
      cur = v < parent.value ? parent.left : parent.right;
    }
    
    const n = makeNode(v, parent);
    if (v < parent.value) parent.left = n;
    else parent.right = n;
    cloneRoot();
    flash([...path, n.id], `Inserted ${v}`, 'insert');
    setValue('');
  };

  // Build search trace
  const buildSearchTrace = (x) => {
    const out = [];
    let cur = root;
    out.push({ msg: `Start at root`, ids: cur ? [cur.id] : [], pc: [1] });
    
    while (cur) {
      out.push({ msg: `Compare ${x} with ${cur.value}`, ids: [cur.id], pc: [2] });
      if (x === cur.value) {
        out.push({ msg: `Found ${x}!`, ids: [cur.id], pc: [3] });
        return out;
      }
      if (x < cur.value) {
        out.push({ msg: `${x} < ${cur.value} → go left`, ids: [cur.id], pc: [4] });
        cur = cur.left;
      } else {
        out.push({ msg: `${x} > ${cur.value} → go right`, ids: [cur.id], pc: [5] });
        cur = cur.right;
      }
    }
    out.push({ msg: `Reached null — ${x} not in tree`, ids: [], pc: [6] });
    return out;
  };

  // Search operation
  const onSearch = () => {
    const v = Number(value);
    if (!value || Number.isNaN(v)) return;
    
    resetAnimation();
    setAlgorithmType('bstSearch');
    const t = buildSearchTrace(v);
    setTrace(t);
    animation.reset();
    setStatus(`Tracing search for ${v}`);
  };

  // Build delete trace
  const buildDeleteTrace = (x) => {
    const out = [];
    let cur = root;
    out.push({ msg: `Start at root`, ids: cur ? [cur.id] : [], pc: [1] });
    
    while (cur && cur.value !== x) {
      out.push({ msg: `At ${cur.value}`, ids: [cur.id], pc: [2] });
      if (x < cur.value) {
        out.push({ msg: `${x} < ${cur.value} → go left`, ids: [cur.id], pc: [3] });
        cur = cur.left;
      } else {
        out.push({ msg: `${x} > ${cur.value} → go right`, ids: [cur.id], pc: [4] });
        cur = cur.right;
      }
    }
    
    if (!cur) {
      out.push({ msg: `${x} not found`, ids: [], pc: [5] });
      return out;
    }
    
    out.push({ msg: `Found ${x}`, ids: [cur.id], pc: [6] });
    
    if (!cur.left && !cur.right) {
      out.push({ msg: `Leaf node → remove directly`, ids: [cur.id], pc: [7] });
    } else if (!cur.left || !cur.right) {
      out.push({ msg: `One child → promote child`, ids: [cur.id], pc: [8] });
    } else {
      out.push({ msg: `Two children → find successor`, ids: [cur.id], pc: [9] });
      let s = cur.right;
      while (s?.left) {
        out.push({ msg: `Finding successor: at ${s.value}`, ids: [s.id], pc: [10] });
        s = s.left;
      }
      if (s) out.push({ msg: `Successor is ${s.value} → swap values`, ids: [s.id, cur.id], pc: [11] });
      out.push({ msg: `Delete successor node`, ids: [], pc: [12] });
    }
    
    out.push({ msg: `Deletion complete`, ids: [], pc: [] });
    return out;
  };

  // Apply delete mutation
  const applyDelete = (x) => {
    const del = (node, val) => {
      if (!node) return null;
      
      if (val < node.value) {
        node.left = del(node.left, val);
        if (node.left) node.left.parent = node;
        return node;
      }
      if (val > node.value) {
        node.right = del(node.right, val);
        if (node.right) node.right.parent = node;
        return node;
      }
      
      // Found node to delete
      if (!node.left && !node.right) return null;
      if (!node.left) {
        node.right.parent = node.parent;
        return node.right;
      }
      if (!node.right) {
        node.left.parent = node.parent;
        return node.left;
      }
      
      // Two children: find successor
      let s = node.right;
      while (s.left) s = s.left;
      node.value = s.value;
      node.right = del(node.right, s.value);
      return node;
    };
    
    const newRoot = del(root, x);
    if (newRoot) newRoot.parent = null;
    setRoot(newRoot);
    cloneRoot();
    setStatus(`Deleted ${x}`);
  };

  // Delete operation
  const onDelete = () => {
    const v = Number(value);
    if (!value || Number.isNaN(v)) return;
    
    resetAnimation();
    setAlgorithmType('delete');
    setPendingDelete(v);
    const t = buildDeleteTrace(v);
    setTrace(t);
    animation.reset();
    setStatus(`Tracing deletion of ${v}`);
  };

  // Build min/max trace
  const buildMinMaxTrace = (kind) => {
    const leftMost = kind === 'min';
    const out = [];
    let cur = root;
    
    if (!cur) {
      out.push({ msg: 'Tree is empty', ids: [], pc: [1] });
      return out;
    }
    
    out.push({ msg: 'Start at root', ids: [cur.id], pc: [1] });
    
    while (leftMost ? cur.left : cur.right) {
      out.push({
        msg: leftMost ? `Go left from ${cur.value}` : `Go right from ${cur.value}`,
        ids: [cur.id],
        pc: [2, 3],
      });
      cur = leftMost ? cur.left : cur.right;
    }
    
    out.push({
      msg: leftMost ? `Minimum is ${cur.value}` : `Maximum is ${cur.value}`,
      ids: [cur.id],
      pc: [4],
    });
    return out;
  };

  const onMin = () => {
    resetAnimation();
    setAlgorithmType('bstMin');
    const t = buildMinMaxTrace('min');
    setTrace(t);
    animation.reset();
    setStatus('Finding minimum (leftmost)');
  };

  const onMax = () => {
    resetAnimation();
    setAlgorithmType('bstMax');
    const t = buildMinMaxTrace('max');
    setTrace(t);
    animation.reset();
    setStatus('Finding maximum (rightmost)');
  };

  // Build traversal trace
  const buildTraversalTrace = (kind) => {
    const order = [];
    const t = [];
    
    const visit = (n, pc) => {
      t.push({ msg: `Visit ${n.value}`, ids: [n.id], pc });
      order.push(n.value);
    };
    
    const inorder = (n) => {
      if (!n) return;
      inorder(n.left);
      visit(n, [3, 4]);
      inorder(n.right);
    };
    
    const preorder = (n) => {
      if (!n) return;
      visit(n, [3]);
      preorder(n.left);
      preorder(n.right);
    };
    
    const postorder = (n) => {
      if (!n) return;
      postorder(n.left);
      postorder(n.right);
      visit(n, [5]);
    };
    
    const levelorder = (n) => {
      if (!n) return;
      const q = [n];
      t.push({ msg: 'Initialize queue with root', ids: [n.id], pc: [1] });
      
      while (q.length) {
        const node = q.shift();
        visit(node, [3, 4]);
        if (node.left) q.push(node.left);
        if (node.right) q.push(node.right);
      }
    };
    
    if (kind === 'inorder') inorder(root);
    else if (kind === 'preorder') preorder(root);
    else if (kind === 'postorder') postorder(root);
    else if (kind === 'levelorder') levelorder(root);
    
    return { trace: t, order };
  };

  const onTraversal = (kind) => {
    resetAnimation();
    setAlgorithmType(kind);
    const { trace: t, order } = buildTraversalTrace(kind);
    setTrace(t);
    setTraversalOutput({ type: kind, list: order });
    animation.reset();
    
    const labels = {
      inorder: 'Inorder',
      preorder: 'Preorder',
      postorder: 'Postorder',
      levelorder: 'Level-Order',
    };
    setStatus(`${labels[kind]} traversal`);
  };

  // Seed tree with example values
  const onSeed = () => {
    resetAnimation();
    const arr = [50, 30, 70, 20, 40, 60, 80];
    let r = null;
    
    const mk = (v, p = null) => ({ id: -1, value: v, left: null, right: null, parent: p });
    const ins = (t, v) => {
      if (!t) return mk(v);
      let c = t, p = null;
      while (c) {
        p = c;
        c = v < c.value ? c.left : c.right;
      }
      if (v < p.value) p.left = mk(v, p);
      else p.right = mk(v, p);
      return t;
    };
    
    for (const v of arr) r = ins(r, v);
    
    const rebuild = (n, p = null) => n
      ? { id: idRef.current++, value: n.value, left: rebuild(n.left, n), right: rebuild(n.right, n), parent: p }
      : null;
    
    setRoot(rebuild(r));
    setStatus('Seeded example tree [50, 30, 70, 20, 40, 60, 80]');
  };

  // Clear tree
  const onClear = () => {
    setRoot(null);
    resetAnimation();
    setStatus('Tree cleared');
  };

  // ================= LAYOUT COMPUTATION =================
  const layout = useMemo(() => {
    let xCounter = 0;
    const nodes = [];
    const edges = [];
    
    const walk = (n, d = 0) => {
      if (!n) return;
      walk(n.left, d + 1);
      nodes.push({ id: n.id, value: n.value, depth: d, ref: n, x: xCounter++ });
      if (n.left) edges.push([n.id, n.left.id]);
      if (n.right) edges.push([n.id, n.right.id]);
      walk(n.right, d + 1);
    };
    
    walk(root);
    
    if (!nodes.length) return { nodes: [], edges: [], w: 640, h: 320, pos: new Map() };
    
    const xGap = 68, yGap = 88, mx = 60, my = 50;
    const width = mx * 2 + xCounter * xGap;
    const maxDepth = nodes.reduce((m, n) => Math.max(m, n.depth), 0);
    const height = my * 2 + (maxDepth + 1) * yGap;
    
    const pos = new Map();
    nodes.forEach((n) => pos.set(n.id, { X: mx + n.x * xGap, Y: my + n.depth * yGap }));
    
    const edgePos = edges.map(([a, b]) => ({
      from: pos.get(a),
      to: pos.get(b),
      key: `${a}-${b}`,
    }));
    
    return {
      nodes,
      edges: edgePos,
      w: Math.max(640, width),
      h: Math.max(320, height),
      pos,
    };
  }, [root]);

  // ================= RENDER =================
  
  // Controls component
  const controls = (
    <>
      {/* Row 1: Insert, Search, Delete */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onInsert()}
            placeholder="Enter value"
            className="w-32 rounded-lg bg-white/5 px-3 py-2 text-white ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400 placeholder:text-white/50"
          />
          <button onClick={onInsert} className="btn-strong">Insert</button>
          <button onClick={onSearch} className="btn">Search</button>
          <button onClick={onDelete} className="btn">Delete</button>
        </div>
        
        <div className="lg:col-span-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/60">FIND</span>
          <button onClick={onMin} className="btn">Min</button>
          <button onClick={onMax} className="btn">Max</button>
        </div>
        
        <div className="lg:col-span-3 flex items-center justify-end gap-2">
          <button onClick={onSeed} className="btn">Seed</button>
          <button onClick={onClear} className="btn">Clear</button>
        </div>
      </div>

      {/* Row 2: Traversals */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-white/60 mr-2">TRAVERSALS</span>
        <button onClick={() => onTraversal('inorder')} className="btn">Inorder</button>
        <button onClick={() => onTraversal('preorder')} className="btn">Preorder</button>
        <button onClick={() => onTraversal('postorder')} className="btn">Postorder</button>
        <button onClick={() => onTraversal('levelorder')} className="btn">Level-Order</button>
      </div>

      {/* Traversal Output Ribbon */}
      {traversalOutput.type && traversalOutput.list.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-black/40 border border-emerald-500/20">
          <div className="text-xs text-emerald-300 mb-2">
            {traversalOutput.type.charAt(0).toUpperCase() + traversalOutput.type.slice(1)} Order:
          </div>
          <div className="flex flex-wrap gap-2">
            {traversalOutput.list.map((v, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 text-sm ring-1 ring-emerald-500/30"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Visualizer component
  const visualizer = (
    <TreeSVG layout={layout} highlight={highlightedNodes} />
  );

  return (
    <>
      <style>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: white;
          background: linear-gradient(135deg, #064E3B 0%, #065F46 100%);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .btn:hover {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          border-color: rgba(16, 185, 129, 0.6);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          transform: translateY(-1px);
        }
        .btn:active {
          transform: translateY(0) scale(0.98);
        }
        .btn-strong {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: black;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        .btn-strong:hover {
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          color: #10B981;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6);
          transform: translateY(-2px);
        }
        .btn-strong:active {
          transform: translateY(0) scale(0.98);
        }
        .node {
          fill: #10B981;
          stroke: #064E3B;
          stroke-width: 2px;
          filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.25));
          transition: all 0.3s ease;
        }
        .node-active {
          fill: #000;
          stroke: #10B981;
          stroke-width: 3px;
          filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.5));
        }
      `}</style>
      
      <VisualizationLayout
        title="Binary Search Tree Visualizer"
        controls={controls}
        visualizer={visualizer}
        algorithmType={algorithmType}
        highlightedLines={highlightedLines}
        status={status}
        trace={trace}
        currentStep={animation.step}
        animationControls={animation}
        onNext={animation.nextStep}
        onPrev={animation.prevStep}
        onReset={resetAnimation}
        embedded={embedded}
      />
    </>
  );
}

// Tree SVG Renderer Component
function TreeSVG({ layout, highlight }) {
  const hi = highlight || new Set();
  const { nodes, edges, w, h, pos } = layout;
  
  if (!nodes.length) {
    return (
      <div className="py-16 text-center text-white/60">
        Tree is empty — click <span className="text-emerald-400 font-semibold">Seed</span> or insert values to begin.
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto block h-auto w-full"
        style={{ minWidth: `${Math.min(w, 640)}px`, maxHeight: '60vh' }}
      >
        {/* Edges */}
        {edges.map((e) => (
          <line
            key={e.key}
            x1={e.from.X}
            y1={e.from.Y}
            x2={e.to.X}
            y2={e.to.Y}
            stroke="#34D399"
            strokeOpacity="0.4"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
        
        {/* Nodes */}
        {nodes.map((n) => {
          const p = pos.get(n.id);
          const active = hi.has(n.id);
          
          return (
            <g
              key={n.id}
              transform={`translate(${p.X}, ${p.Y})`}
              className="transition-transform duration-300"
            >
              <circle r="24" className={active ? 'node-active' : 'node'} />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className={`font-bold text-sm ${active ? 'fill-emerald-400' : 'fill-black'}`}
              >
                {n.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
