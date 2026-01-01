import React, { useEffect, useRef, useState } from "react";
import { VisualizationLayout } from './components/VisualizationLayout';
import { useAnimationEngine } from './hooks/useAnimationEngine';

/**
 * Array 2D (Matrix) Visualization - Refactored & Optimized
 * Clean architecture matching Array1DVisualization
 * Features: Dimension controls, in-grid editing, traversals, transpose, rotate, spiral
 */

export default function MatrixLearner({ embedded = false }) {
  // ------------ State ------------
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [mat, setMat] = useState(makeMatrix(3, 4));
  const [status, setStatus] = useState("Ready. Click a cell to edit, or use controls.");

  const [rInput, setRInput] = useState(1); // 1-based UX
  const [cInput, setCInput] = useState(1);
  const [valInput, setValInput] = useState("");
  const [target, setTarget] = useState("");

  // trace + code panel
  const [trace, setTrace] = useState([]);
  const [algorithmType, setAlgorithmType] = useState(null);
  const [highlightedLines, setHighlightedLines] = useState(new Set());
  const [highlightedCells, setHighlightedCells] = useState(new Set());

  // in‑grid editing state
  const [editing, setEditing] = useState(null); // {r,c,val}

  // Animation engine
  const animation = useAnimationEngine({
    trace,
    onStepChange: (step) => updateVisualization(step),
    baseSpeed: 450
  });

  // ------------ Helpers ------------
  function makeMatrix(r, c, fill = "") {
    return Array.from({ length: r }, () => Array.from({ length: c }, () => fill));
  }
  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }
  function key(r, c) {
    return `${r},${c}`;
  }

  // Update visualization based on current step
  const updateVisualization = (step) => {
    if (!trace[step]) return;
    
    const currentTrace = trace[step];
    setStatus(currentTrace.msg);
    setHighlightedLines(new Set(currentTrace.pc || []));
    
    const cellSet = new Set();
    (currentTrace.cells || []).forEach(([r, c]) => cellSet.add(key(r, c)));
    setHighlightedCells(cellSet);
  };

  // Update visualization when step changes
  useEffect(() => {
    if (trace.length > 0) {
      updateVisualization(animation.step);
    }
  }, [animation.step, trace]);

  function applySize(newR, newC) {
    const r = clamp(newR | 0, 1, 10),
      c = clamp(newC | 0, 1, 12);
    const next = makeMatrix(r, c, "");
    for (let i = 0; i < Math.min(r, rows); i++)
      for (let j = 0; j < Math.min(c, cols); j++) next[i][j] = mat[i][j];
    setRows(r);
    setCols(c);
    setMat(next);
    setStatus(`Resized to ${r}×${c}`);
    setEditing(null);
    resetTrace();
  }

  function resetTrace() {
    setTrace([]);
    animation.reset();
    setAlgorithmType(null);
    setHighlightedCells(new Set());
    setHighlightedLines(new Set());
  }

  // ------------ Code tracing core ------------
  // Removed old useEffect blocks - now handled by useAnimationEngine

  // Run console self-tests once (dev aid, no UI impact)
  useEffect(() => {
    try { runSelfTests(); } catch (e) { /* ignore */ }
  }, []);

  // ------------ Operations ------------
  function onSeed() {
    const demo = [
      ["A", "B", "C", "D"],
      ["E", "F", "G", "H"],
      ["I", "J", "K", "L"],
    ];
    const r = 3,
      c = 4;
    setRows(r);
    setCols(c);
    setMat(demo.map((row) => row.slice()));
    setStatus("Seeded 3×4 with letters A..L");
    setEditing(null);
    resetTrace();
  }
  function onClear() {
    setMat(makeMatrix(rows, cols));
    setStatus("Cleared matrix");
    resetTrace();
  }

  function onSet() {
    const r0 = clamp((rInput | 0) - 1, 0, rows - 1);
    const c0 = clamp((cInput | 0) - 1, 0, cols - 1);
    setMat((prev) => {
      const next = prev.map((row) => row.slice());
      next[r0][c0] = valInput;
      return next;
    });
    setStatus(`Set cell (${r0 + 1},${c0 + 1}) = ${JSON.stringify(valInput)}`);
  }
  function onGet() {
    const r0 = clamp((rInput | 0) - 1, 0, rows - 1);
    const c0 = clamp((cInput | 0) - 1, 0, cols - 1);
    setStatus(`Get cell (${r0 + 1},${c0 + 1}) → ${JSON.stringify(mat[r0][c0])}`);
    setAlgorithmType('get');
    setTrace([{ msg: `Index into A[${r0}][${c0}]`, cells: [[r0, c0]], pc: [1, 2] }]);
    animation.reset();
  }
  
  function onFill() {
    const v = valInput;
    setAlgorithmType('fill');
    const t = [],
      next = makeMatrix(rows, cols);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        t.push({ msg: `Fill (${i + 1},${j + 1})`, cells: [[i, j]], pc: [2, 3] });
        next[i][j] = v;
      }
    }
    setTrace(t);
    animation.reset();
    animation.play();
    
    setTimeout(() => setMat(next), t.length * (450 / animation.speedMultiplier));
  }
  
  function onRandom() {
    setAlgorithmType('fill');
    const t = [],
      next = makeMatrix(rows, cols);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        t.push({ msg: `Rand (${i + 1},${j + 1})`, cells: [[i, j]], pc: [2, 3] });
        next[i][j] = Math.floor(Math.random() * 90 + 10);
      }
    }
    setTrace(t);
    animation.reset();
    animation.play();
    
    setTimeout(() => setMat(next), t.length * (450 / animation.speedMultiplier));
  }

  function rowMajor() {
    const t = [];
    setAlgorithmType('row');
    for (let i = 0; i < rows; i++) {
      t.push({ msg: `Row ${i + 1}`, cells: [], pc: [1] });
      for (let j = 0; j < cols; j++) t.push({ msg: `Visit (${i + 1},${j + 1})`, cells: [[i, j]], pc: [2] });
    }
    setTrace(t);
    animation.reset();
    animation.play();
  }
  
  function colMajor() {
    const t = [];
    setAlgorithmType('col');
    for (let j = 0; j < cols; j++) {
      t.push({ msg: `Col ${j + 1}`, cells: [], pc: [1] });
      for (let i = 0; i < rows; i++) t.push({ msg: `Visit (${i + 1},${j + 1})`, cells: [[i, j]], pc: [2] });
    }
    setTrace(t);
    animation.reset();
    animation.play();
  }
  
  function onSearch() {
    const tgt = target;
    setAlgorithmType('search');
    const t = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        t.push({ msg: `Check (${i + 1},${j + 1}) == ${JSON.stringify(tgt)}?`, cells: [[i, j]], pc: [1, 2] });
        if (String(mat[i][j]) === String(tgt)) {
          t.push({ msg: `Found at (${i + 1},${j + 1})`, cells: [[i, j]], pc: [3] });
          setTrace(t);
          animation.reset();
          animation.play();
          return;
        }
      }
    }
    t.push({ msg: `Not found`, cells: [], pc: [4] });
    setTrace(t);
    animation.reset();
    animation.play();
  }

  function onTranspose() {
    setAlgorithmType('transpose');
    const t = [];
    const r2 = cols,
      c2 = rows;
    const next = makeMatrix(r2, c2);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        t.push({ msg: `B[${j + 1}][${i + 1}] ← A[${i + 1}][${j + 1}]`, cells: [[i, j]], pc: [1, 2] });
        next[j][i] = mat[i][j];
      }
    }
    setTrace(t);
    animation.reset();
    animation.play();
    
    setTimeout(() => {
      setRows(r2);
      setCols(c2);
      setMat(next);
    }, t.length * (450 / animation.speedMultiplier));
  }

  // Spiral traversal (clockwise)
  function onSpiral() {
    const t = [];
    setAlgorithmType('spiral');
    let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
    while (top <= bottom && left <= right) {
      for (let j = left; j <= right; j++) t.push({ msg: `Visit (${top + 1},${j + 1})`, cells: [[top, j]], pc: [1] });
      top++;
      if (top > bottom) break;
      for (let i = top; i <= bottom; i++) t.push({ msg: `Visit (${i + 1},${right + 1})`, cells: [[i, right]], pc: [2] });
      right--;
      if (left > right) break;
      for (let j = right; j >= left; j--) t.push({ msg: `Visit (${bottom + 1},${j + 1})`, cells: [[bottom, j]], pc: [3] });
      bottom--;
      if (top > bottom) break;
      for (let i = bottom; i >= top; i--) t.push({ msg: `Visit (${i + 1},${left + 1})`, cells: [[i, left]], pc: [4] });
      left++;
    }
    setTrace(t);
    animation.reset();
    animation.play();
  }

  // Rotate 90° clockwise
  function onRotate90() {
    setAlgorithmType('rot90');
    const t = [];
    const r2 = cols, c2 = rows;
    const next = makeMatrix(r2, c2);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const ni = j, nj = c2 - 1 - i;
        t.push({ msg: `B[${ni + 1}][${nj + 1}] ← A[${i + 1}][${j + 1}]`, cells: [[i, j]], pc: [1, 2] });
        next[ni][nj] = mat[i][j];
      }
    }
    setTrace(t);
    animation.reset();
    animation.play();
    
    setTimeout(() => {
      setRows(r2);
      setCols(c2);
      setMat(next);
    }, t.length * (450 / animation.speedMultiplier));
  }

  // ---- In‑grid editing handlers ----
  function startEdit(r, c) {
    setEditing({ r, c, val: String(mat[r][c] ?? "") });
    setAlgorithmType('set');
    setTrace([{ msg: `Prepare set A[${r + 1}][${c + 1}]`, cells: [[r, c]], pc: [1] }]);
    animation.reset();
  }
  
  function commitEdit() {
    if (!editing) return;
    const { r, c, val } = editing;
    setMat((prev) => {
      const next = prev.map((row) => row.slice());
      next[r][c] = val;
      return next;
    });
    setStatus(`Set cell (${r + 1},${c + 1}) = ${JSON.stringify(val)}`);
    setTrace([{ msg: `A[${r + 1}][${c + 1}] ← ${JSON.stringify(val)}`, cells: [[r, c]], pc: [2, 3] }]);
    setEditing(null);
  }
  
  function cancelEdit() {
    setEditing(null);
  }

  // ------------ UI Components ------------
  // Controls component
  const controls = (
    <>
      {/* Row 1: Size and Cell operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* SIZE */}
        <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
          <label className="text-xs text-white/60">Rows</label>
          <input 
            type="number" 
            min={1} 
            max={10} 
            value={rows} 
            onChange={(e) => applySize(+e.target.value, cols)} 
            className="w-20 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" 
          />
          <label className="text-xs text-white/60">Cols</label>
          <input 
            type="number" 
            min={1} 
            max={12} 
            value={cols} 
            onChange={(e) => applySize(rows, +e.target.value)} 
            className="w-20 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" 
          />
          <button onClick={onSeed} className="btn">Seed</button>
          <button onClick={onClear} className="btn">Clear</button>
        </div>

        {/* CELL set/get */}
        <div className="lg:col-span-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/60">CELL</span>
          <input 
            type="number" 
            min={1} 
            max={rows} 
            value={rInput} 
            onChange={(e) => setRInput(+e.target.value || 1)} 
            className="w-16 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" 
          />
          <span className="text-white/60">,</span>
          <input 
            type="number" 
            min={1} 
            max={cols} 
            value={cInput} 
            onChange={(e) => setCInput(+e.target.value || 1)} 
            className="w-16 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" 
          />
          <input 
            value={valInput} 
            onChange={(e) => setValInput(e.target.value)} 
            placeholder="value" 
            className="w-28 rounded-lg bg-white/5 px-2 py-1 ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" 
          />
          <button onClick={onSet} className="btn-strong">Set</button>
          <button onClick={onGet} className="btn">Get</button>
        </div>

        {/* SEARCH / FILL */}
        <div className="lg:col-span-3 flex flex-wrap items-center justify-end gap-2">
          <button onClick={onFill} className="btn">Fill</button>
          <button onClick={onRandom} className="btn">Random</button>
        </div>
      </div>

      {/* Row 2: Search and Traversals */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input 
          value={target} 
          onChange={(e) => setTarget(e.target.value)} 
          placeholder="search target" 
          className="w-36 rounded-lg px-2 py-1 ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400 bg-white/5" 
        />
        <button onClick={onSearch} className="btn">Search</button>
        
        <span className="text-xs text-white/60 ml-4 mr-2">TRAVERSE</span>
        <button onClick={rowMajor} className="btn">Row‑major</button>
        <button onClick={colMajor} className="btn">Column‑major</button>
        <button onClick={onSpiral} className="btn">Spiral</button>
        
        <span className="text-xs text-white/60 ml-4 mr-2">TRANSFORM</span>
        <button onClick={onTranspose} className="btn">Transpose</button>
        <button onClick={onRotate90} className="btn">Rotate 90°</button>
      </div>
    </>
  );

  // Visualizer component
  const visualizer = (
    <MatrixGrid
      mat={mat}
      rows={rows}
      cols={cols}
      hiCells={highlightedCells}
      editing={editing}
      setEditing={setEditing}
      startEdit={startEdit}
      commitEdit={commitEdit}
      cancelEdit={cancelEdit}
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
        title="2D Array (Matrix) Visualizer"
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
        onReset={resetTrace}
        embedded={embedded}
      />
    </>
  );
}

// ---------------- Grid renderer ----------------
function MatrixGrid({ mat, rows, cols, hiCells, editing, setEditing, startEdit, commitEdit, cancelEdit }) {
  return (
    <div className="w-full flex justify-center py-4">
      <div className="mx-auto grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(56px, 1fr))`, maxWidth: '100%' }}>
        {mat.map((row, i) =>
          row.map((val, j) => {
            const active = hiCells.has(`${i},${j}`);
            const isEditing = editing && editing.r === i && editing.c === j;
            return (
              <div
                key={`${i}-${j}`}
                className={`
                  relative h-14 rounded-xl border flex items-center justify-center font-bold text-lg
                  transition-all duration-200
                  ${active
                    ? 'bg-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white'
                    : val !== ''
                      ? 'bg-emerald-500/80 border-emerald-400/60 text-black'
                      : 'bg-white/5 border-emerald-500/10 text-white/60 hover:bg-white/10'
                  }
                `}
              >
                {isEditing ? (
                  <input
                    autoFocus
                    value={editing.val}
                    onChange={(e) => setEditing({ ...editing, val: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    onBlur={commitEdit}
                    className="w-[90%] rounded-lg bg-black/60 px-2 py-1 text-center text-white ring-1 ring-emerald-400 focus:ring-2 focus:ring-emerald-300"
                    placeholder="value"
                  />
                ) : (
                  <button
                    onClick={() => startEdit(i, j)}
                    className="w-full h-full cursor-text"
                    title={`Click to edit A[${i + 1}][${j + 1}]`}
                  >
                    {String(val)}
                  </button>
                )}
                <span className="pointer-events-none absolute left-2 top-1 rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white/70 font-mono">
                  {i + 1},{j + 1}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---------------- Pseudocode mapping ----------------
const PSEUDO = {
  row: {
    title: "Row‑Major Traversal",
    code: `1. for i in 0..rows-1:
2.   for j in 0..cols-1: visit(A[i][j])`
  },
  col: {
    title: "Column‑Major Traversal",
    code: `1. for j in 0..cols-1:
2.   for i in 0..rows-1: visit(A[i][j])`
  },
  search: {
    title: "Search Operation",
    code: `1. for each cell A[i][j]:
2.   if A[i][j] == target: return (i,j)
3.   continue
4. return not found`
  },
  transpose: {
    title: "Matrix Transpose",
    code: `1. B[j][i] ← A[i][j] for all i,j
2. return B (size cols×rows)`
  },
  fill: {
    title: "Fill Operation",
    code: `1. for each cell A[i][j]:
2.   A[i][j] ← x
3. return`
  },
  get: {
    title: "Get Element",
    code: `1. access A[r][c] in O(1)
2. return A[r][c]`
  },
  set: {
    title: "Set Element",
    code: `1. index (r,c) in bounds
2. A[r][c] ← x
3. return`
  },
  spiral: {
    title: "Spiral Traversal (Clockwise)",
    code: `1. Maintain top, bottom, left, right bounds
2. Traverse top row left→right
3. Traverse right col top→bottom
4. Traverse bottom row right→left
5. Traverse left col bottom→top; shrink bounds; repeat`
  },
  rot90: {
    title: "Rotate 90° Clockwise",
    code: `1. Create B of size (cols × rows)
2. For all i,j: B[j][rows-1-i] ← A[i][j]`
  },
};

// ---------------- DEV Self‑tests (console only) ----------------
function deepEq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function transpose(A) {
  const r = A.length, c = A[0].length; const B = Array.from({length:c},()=>Array(r));
  for (let i=0;i<r;i++) for (let j=0;j<c;j++) B[j][i]=A[i][j];
  return B;
}
function rotate90(A) {
  const r = A.length, c = A[0].length; const B = Array.from({length:c},()=>Array(r));
  for (let i=0;i<r;i++) for (let j=0;j<c;j++) B[j][r-1-i]=A[i][j];
  return B;
}
function spiralOrder(A){
  const out=[]; let top=0,bottom=A.length-1,left=0,right=A[0].length-1;
  while(top<=bottom && left<=right){
    for(let j=left;j<=right;j++) out.push(A[top][j]); top++; if(top>bottom) break;
    for(let i=top;i<=bottom;i++) out.push(A[i][right]); right--; if(left>right) break;
    for(let j=right;j>=left;j--) out.push(A[bottom][j]); bottom--; if(top>bottom) break;
    for(let i=bottom;i>=top;i--) out.push(A[i][left]); left++;
  }
  return out;
}
function runSelfTests(){
  const A = [[1,2,3],[4,5,6]]; // 2x3
  const expT = [[1,4],[2,5],[3,6]];
  const expR = [[4,1],[5,2],[6,3]]; // 90° clockwise
  const expS = [1,2,3,6,5,4];
  const okT = deepEq(transpose(A), expT);
  const okR = deepEq(rotate90(A), expR);
  const okS = deepEq(spiralOrder(A), expS);
  // eslint-disable-next-line no-console
}
