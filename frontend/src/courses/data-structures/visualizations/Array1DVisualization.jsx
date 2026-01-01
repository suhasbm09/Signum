/**
 * Array 1D Visualization - Refactored & Optimized
 * Clean architecture with custom hooks and separated concerns
 * Features: Speed controls, mobile responsive, RAF animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { VisualizationLayout } from './components/VisualizationLayout';
import { useAnimationEngine } from './hooks/useAnimationEngine';
import { arrayOperations } from './utils/arrayOperations';

export default function Array1DVisualization({ embedded = false }) {
  // Array state
  const [length, setLength] = useState(10);
  const [arr, setArr] = useState(Array(10).fill(''));
  const [status, setStatus] = useState('Array visualizer ready. Select an operation to begin.');
  
  // Input states
  const [index, setIndex] = useState(0); // 0-based indexing
  const [value, setValue] = useState('');
  const [target, setTarget] = useState('');
  
  // Animation state
  const [trace, setTrace] = useState([]);
  const [algorithmType, setAlgorithmType] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState(new Set());
  const [highlightedLines, setHighlightedLines] = useState(new Set());
  
  // View array for operations with mutations (reverse, sort)
  const [viewBase, setViewBase] = useState(null);
  const [viewArr, setViewArr] = useState(null);
  
  // Inline editing
  const [editing, setEditing] = useState(null);
  
  // Animation engine
  const animation = useAnimationEngine({
    trace,
    onStepChange: (step) => updateVisualization(step),
    baseSpeed: 450
  });

  // Update visualization based on current step
  const updateVisualization = (step) => {
    if (!trace[step]) return;
    
    const currentTrace = trace[step];
    setStatus(currentTrace.msg);
    setHighlightedLines(new Set(currentTrace.pc || []));
    setHighlightedCells(new Set((currentTrace.cells || []).map(i => `i-${i}`)));
    
    // Handle operations with mutations (swap, set)
    if (currentTrace.op) {
      applyOperation(step);
    }
  };

  // Apply operations for animated changes
  const applyOperation = (step) => {
    const hasOps = trace.some(t => t.op);
    if (!hasOps) return;
    
    if (!viewBase) {
      setViewBase(arr.slice(0, length));
    }
    
    const base = (viewBase || arr.slice(0, length)).slice();
    
    for (let k = 0; k <= step && k < trace.length; k++) {
      const op = trace[k].op;
      if (!op) continue;
      
      if (op.type === 'swap') {
        [base[op.i], base[op.j]] = [base[op.j], base[op.i]];
      } else if (op.type === 'set') {
        base[op.i] = op.value;
      }
    }
    
    setViewArr(base);
    
    // Commit changes when animation completes
    if (animation.isPlaying && step >= trace.length - 1) {
      setTimeout(() => {
        setArr(prev => [...base, ...prev.slice(length)]);
        setViewBase(null);
        setViewArr(null);
      }, 50);
    }
  };

  // Update visualization when step changes
  useEffect(() => {
    if (trace.length > 0) {
      updateVisualization(animation.step);
    }
  }, [animation.step, trace]);

  // Helper functions
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  
  const cmp = (a, b) => {
    const na = Number(a), nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b));
  };
  
  const isSorted = (arr) => {
    for (let i = 1; i < arr.length; i++) {
      if (cmp(arr[i - 1], arr[i]) > 0) return false;
    }
    return true;
  };

  const resetAnimation = () => {
    setTrace([]);
    animation.reset();
    setAlgorithmType(null);
    setHighlightedCells(new Set());
    setHighlightedLines(new Set());
    setViewBase(null);
    setViewArr(null);
  };

  // Array operations
  const handleResize = (newLength) => {
    const n = clamp(newLength, 1, 24);
    const newArr = Array(n).fill('');
    for (let i = 0; i < Math.min(n, length); i++) {
      newArr[i] = arr[i];
    }
    setLength(n);
    setArr(newArr);
    setStatus(`Array resized to ${n} elements`);
    resetAnimation();
    setEditing(null);
  };

  const handleSeed = () => {
    const demo = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    handleResize(demo.length);
    setArr(demo);
    setStatus('Array initialized with sample data (A-J)');
  };

  const handleClear = () => {
    setArr(Array(length).fill(''));
    setStatus('Array cleared');
    resetAnimation();
    setEditing(null);
  };

  const handleSet = () => {
    const idx = clamp(index, 0, length - 1);
    setArr(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
    setAlgorithmType('set');
    setTrace(arrayOperations.generateSetTrace(idx, value));
    animation.reset();
  };

  const handleGet = () => {
    const idx = clamp(index, 0, length - 1);
    setAlgorithmType('get');
    setTrace(arrayOperations.generateGetTrace(idx, arr[idx]));
    animation.reset();
  };

  const handleFill = () => {
    setAlgorithmType('fill');
    const newTrace = arrayOperations.generateFillTrace(length, value);
    setTrace(newTrace);
    animation.reset();
    animation.play();
    
    setTimeout(() => {
      setArr(Array(length).fill(value));
    }, newTrace.length * (450 / animation.speedMultiplier));
  };

  const handleRandom = () => {
    setAlgorithmType('fill');
    const newTrace = [];
    const newArr = Array(length);
    
    for (let i = 0; i < length; i++) {
      const val = Math.floor(Math.random() * 90 + 10);
      newArr[i] = val;
      newTrace.push({ msg: `Random A[${i}] = ${val}`, cells: [i], pc: [1, 2] });
    }
    
    setTrace(newTrace);
    animation.reset();
    animation.play();
    
    setTimeout(() => {
      setArr(newArr);
    }, newTrace.length * (450 / animation.speedMultiplier));
  };

  const handleSort = () => {
    const sorted = [...arr.slice(0, length)].sort(cmp);
    setArr([...sorted, ...arr.slice(length)]);
    setStatus('Array sorted in ascending order');
    resetAnimation();
  };

  const handleTraverse = () => {
    setAlgorithmType('trav');
    setTrace(arrayOperations.generateTraverseTrace(length));
    animation.reset();
    animation.play();
  };

  const handleLinearSearch = () => {
    setAlgorithmType('search');
    setTrace(arrayOperations.generateLinearSearchTrace(arr.slice(0, length), target));
    animation.reset();
    animation.play();
  };

  const handleBinarySearch = () => {
    const currentArr = arr.slice(0, length);
    if (!isSorted(currentArr)) {
      setStatus('Array must be sorted for binary search. Click "Sort ↑" first.');
      setTrace([{ msg: 'Binary search requires sorted array', cells: [], pc: [1] }]);
      animation.reset();
      return;
    }
    
    setAlgorithmType('bsearch');
    setTrace(arrayOperations.generateBinarySearchTrace(currentArr, target));
    animation.reset();
    animation.play();
  };

  const handleMin = () => {
    setAlgorithmType('min');
    setTrace(arrayOperations.generateMinTrace(arr.slice(0, length)));
    animation.reset();
    animation.play();
  };

  const handleMax = () => {
    setAlgorithmType('max');
    setTrace(arrayOperations.generateMaxTrace(arr.slice(0, length)));
    animation.reset();
    animation.play();
  };

  const handleReverse = () => {
    setAlgorithmType('reverse');
    const arrCopy = arr.slice(0, length);
    setViewBase(arrCopy);
    setTrace(arrayOperations.generateReverseTrace(arrCopy));
    animation.reset();
    animation.play();
  };

  const handleBubbleSort = () => {
    setAlgorithmType('bsort');
    const arrCopy = arr.slice(0, length);
    setViewBase(arrCopy);
    setTrace(arrayOperations.generateBubbleSortTrace(arrCopy));
    animation.reset();
    animation.play();
  };

  // Inline editing
  const startEdit = (i) => {
    setEditing({ i, val: String(arr[i] ?? '') });
    resetAnimation();
  };

  const commitEdit = () => {
    if (!editing) return;
    const { i, val } = editing;
    setArr(prev => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
    setStatus(`Set A[${i}] = ${JSON.stringify(val)}`);
    setEditing(null);
  };

  const cancelEdit = () => setEditing(null);

  // Controls component
  const controls = (
    <>
      {/* Row 1: Length, Search, Sort */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-4 flex flex-wrap items-center gap-2">
          <label className="text-xs text-white/60">Length</label>
          <input
            type="number"
            min={1}
            max={24}
            value={length}
            onChange={(e) => handleResize(+e.target.value)}
            className="w-24 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400"
          />
          <button onClick={handleSeed} className="btn">Seed</button>
          <button onClick={handleClear} className="btn">Clear</button>
        </div>
        
        <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="search target"
            className="w-40 rounded-lg bg-white/5 px-2 py-1 ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400"
          />
          <button onClick={handleLinearSearch} className="btn">Linear</button>
          <button onClick={handleBinarySearch} className="btn">Binary</button>
          <button onClick={handleSort} className="btn">Sort ↑</button>
        </div>
      </div>

      {/* Row 2: Set/Get operations */}
      <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/60">INDEX (0-based)</span>
          <input
            type="number"
            min={0}
            max={length - 1}
            value={index}
            onChange={(e) => setIndex(+e.target.value || 0)}
            className="w-24 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="value"
            className="w-36 rounded-lg bg-white/5 px-2 py-1 ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400"
          />
          <button onClick={handleSet} className="btn-strong">Set</button>
          <button onClick={handleGet} className="btn">Get</button>
        </div>
        
        <div className="lg:col-span-5 flex items-center justify-end gap-2">
          <button onClick={handleFill} className="btn">Fill</button>
          <button onClick={handleRandom} className="btn">Random</button>
        </div>
      </div>

      {/* Row 3: Advanced operations */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-white/60 mr-2">TRAVERSE</span>
        <button onClick={handleTraverse} className="btn">Left → Right</button>
        <button onClick={handleMin} className="btn">Min</button>
        <button onClick={handleMax} className="btn">Max</button>
        
        <span className="text-xs text-white/60 ml-4 mr-2">ADVANCED</span>
        <button onClick={handleReverse} className="btn">Reverse ↔</button>
        <button onClick={handleBubbleSort} className="btn">Bubble Sort</button>
      </div>
    </>
  );

  // Visualizer component
  const displayArr = viewArr || arr;
  const visualizer = (
    <ArrayVisualizer
      arr={displayArr}
      length={length}
      highlightedCells={highlightedCells}
      editing={editing}
      setEditing={setEditing}
      onStartEdit={startEdit}
      onCommitEdit={commitEdit}
      onCancelEdit={cancelEdit}
    />
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
      `}</style>
      
      <VisualizationLayout
        title="Array Operations Visualizer"
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

// Array Visualizer Component
function ArrayVisualizer({ arr, length, highlightedCells, editing, setEditing, onStartEdit, onCommitEdit, onCancelEdit }) {
  return (
    <div className="w-full flex justify-center py-4">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.min(length, 12)}, minmax(64px, 1fr))`,
          maxWidth: '100%'
        }}
      >
        {arr.slice(0, length).map((v, i) => {
          const isHighlighted = highlightedCells.has(`i-${i}`);
          const isEditing = editing && editing.i === i;
          
          return (
            <div
              key={i}
              className={`
                relative h-16 rounded-xl border flex items-center justify-center font-bold text-lg
                transition-all duration-200
                ${isHighlighted
                  ? 'bg-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white'
                  : v !== ''
                  ? 'bg-emerald-500/80 border-emerald-400/60 text-black'
                  : 'bg-white/5 border-emerald-500/10 text-white/60 hover:bg-white/10'
                }
              `}
            >
              {isEditing ? (
                <input
                  autoFocus
                  value={editing.val}
                  onChange={(e) => setEditing({ i, val: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onCommitEdit();
                    if (e.key === 'Escape') onCancelEdit();
                  }}
                  onBlur={onCommitEdit}
                  className="w-[90%] rounded-lg bg-black/60 px-2 py-1 text-center text-white ring-1 ring-emerald-400 focus:ring-2 focus:ring-emerald-300"
                />
              ) : (
                <button
                  onClick={() => onStartEdit(i)}
                  className="w-full h-full cursor-text"
                  title={`Click to edit A[${i}]`}
                >
                  {String(v)}
                </button>
              )}
              
              <span className="pointer-events-none absolute left-2 top-1 rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white/70 font-mono">
                {i}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
