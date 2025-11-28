import React, { useEffect, useRef, useState } from "react";

// ==============================================================
//  Signum • 2D Array (Matrix) Learner — Visualizer + Code Panel
//  Tech: React + JavaScript + Tailwind (inline utilities) only
//  Theme: Dark + Emerald (same as the rest of the suite)
//  Visual: Grid container (cells are boxes), index chips on each cell
//
//  Features:
//    • Dimension controls (rows/cols), seed, clear
//    • Direct in‑grid editing: click a cell to edit; Enter=save, Esc=cancel, blur=save
//    • set(r,c,val), get(r,c), fill(val), randomize
//    • Row‑major, Column‑major traversals (animated)
//    • Search(target) (animated)
//    • Transpose (animated; resizes if non‑square)
//    • NEW: Spiral traversal (clockwise)
//    • NEW: Rotate 90° clockwise (animated; creates new matrix)
//    • Code panel (25%) with step highlighting; grid is 75%
//    • Clean, non‑overlapping control layout for all screen sizes
//    • DEV self‑tests (console) for transpose/rotate/spiral
// ==============================================================

export default function MatrixLearner() {
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
  // trace item: { msg, cells:[[r,c]], pc:[lineIdx...] }
  const [trace, setTrace] = useState([]);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const playTimer = useRef(null);
  const [pseudo, setPseudo] = useState({ kind: null, lines: [] });
  const [pcHi, setPcHi] = useState(new Set());
  const [hiCells, setHiCells] = useState(new Set()); // key: `${r},${c}`

  // in‑grid editing state
  const [editing, setEditing] = useState(null); // {r,c,val}

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
    setStep(0);
    setIsPlaying(false);
    setPcHi(new Set());
    setHiCells(new Set());
    setPseudo({ kind: null, lines: [] });
  }

  // ------------ Code tracing core ------------
  useEffect(() => {
    const s = trace[step];
    if (!s) return;
    setStatus(s.msg);
    setPcHi(new Set(s.pc || []));
    const set = new Set();
    (s.cells || []).forEach(([r, c]) => set.add(key(r, c)));
    setHiCells(set);
    if (isPlaying && step >= trace.length - 1) setIsPlaying(false);
  }, [step, trace, isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      if (playTimer.current) clearInterval(playTimer.current);
      return;
    }
    if (!trace.length) {
      setIsPlaying(false);
      return;
    }
    playTimer.current = setInterval(() => {
      setStep((s) => Math.min(trace.length - 1, s + 1));
    }, Math.max(150, speed));
    return () => clearInterval(playTimer.current);
  }, [isPlaying, speed, trace]);

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
    setPseudo({ kind: "get", lines: PSEUDO.get });
    setTrace([{ msg: `Index into A[${r0}][${c0}]`, cells: [[r0, c0]], pc: [1, 2] }]);
    setStep(0);
    setIsPlaying(false);
  }
  function onFill() {
    const v = valInput;
    setPseudo({ kind: "fill", lines: PSEUDO.fill });
    const t = [],
      next = makeMatrix(rows, cols);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        t.push({ msg: `Fill (${i + 1},${j + 1})`, cells: [[i, j]], pc: [2, 3] });
        next[i][j] = v;
      }
    }
    setTrace(t);
    setStep(0);
    setIsPlaying(true);
    const total = t.length;
    setTimeout(() => setMat(next), total * Math.max(150, speed));
  }
  function onRandom() {
    setPseudo({ kind: "fill", lines: PSEUDO.fill });
    const t = [],
      next = makeMatrix(rows, cols);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        t.push({ msg: `Rand (${i + 1},${j + 1})`, cells: [[i, j]], pc: [2, 3] });
        next[i][j] = Math.floor(Math.random() * 90 + 10);
      }
    }
    setTrace(t);
    setStep(0);
    setIsPlaying(true);
    const total = t.length;
    setTimeout(() => setMat(next), total * Math.max(150, speed));
  }

  function rowMajor() {
    const t = [];
    setPseudo({ kind: "row", lines: PSEUDO.row });
    for (let i = 0; i < rows; i++) {
      t.push({ msg: `Row ${i + 1}`, cells: [], pc: [1] });
      for (let j = 0; j < cols; j++) t.push({ msg: `Visit (${i + 1},${j + 1})`, cells: [[i, j]], pc: [2] });
    }
    setTrace(t);
    setStep(0);
    setIsPlaying(true);
  }
  function colMajor() {
    const t = [];
    setPseudo({ kind: "col", lines: PSEUDO.col });
    for (let j = 0; j < cols; j++) {
      t.push({ msg: `Col ${j + 1}`, cells: [], pc: [1] });
      for (let i = 0; i < rows; i++) t.push({ msg: `Visit (${i + 1},${j + 1})`, cells: [[i, j]], pc: [2] });
    }
    setTrace(t);
    setStep(0);
    setIsPlaying(true);
  }
  function onSearch() {
    const tgt = target;
    setPseudo({ kind: "search", lines: PSEUDO.search });
    const t = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        t.push({ msg: `Check (${i + 1},${j + 1}) == ${JSON.stringify(tgt)}?`, cells: [[i, j]], pc: [1, 2] });
        if (String(mat[i][j]) === String(tgt)) {
          t.push({ msg: `Found at (${i + 1},${j + 1})`, cells: [[i, j]], pc: [3] });
          setTrace(t);
          setStep(0);
          setIsPlaying(true);
          return;
        }
      }
    }
    t.push({ msg: `Not found`, cells: [], pc: [4] });
    setTrace(t);
    setStep(0);
    setIsPlaying(true);
  }

  function onTranspose() {
    setPseudo({ kind: "transpose", lines: PSEUDO.transpose });
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
    setStep(0);
    setIsPlaying(true);
    const total = t.length;
    setTimeout(() => {
      setRows(r2);
      setCols(c2);
      setMat(next);
    }, total * Math.max(150, speed));
  }

  // NEW: Spiral traversal (clockwise)
  function onSpiral() {
    const t = [];
    setPseudo({ kind: "spiral", lines: PSEUDO.spiral });
    let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
    while (top <= bottom && left <= right) {
      // top row
      for (let j = left; j <= right; j++) t.push({ msg: `Visit (${top + 1},${j + 1})`, cells: [[top, j]], pc: [1] });
      top++;
      if (top > bottom) break;
      // right col
      for (let i = top; i <= bottom; i++) t.push({ msg: `Visit (${i + 1},${right + 1})`, cells: [[i, right]], pc: [2] });
      right--;
      if (left > right) break;
      // bottom row
      for (let j = right; j >= left; j--) t.push({ msg: `Visit (${bottom + 1},${j + 1})`, cells: [[bottom, j]], pc: [3] });
      bottom--;
      if (top > bottom) break;
      // left col
      for (let i = bottom; i >= top; i--) t.push({ msg: `Visit (${i + 1},${left + 1})`, cells: [[i, left]], pc: [4] });
      left++;
    }
    setTrace(t);
    setStep(0);
    setIsPlaying(true);
  }

  // NEW: Rotate 90° clockwise (produces new matrix)
  function onRotate90() {
    setPseudo({ kind: "rot90", lines: PSEUDO.rot90 });
    const t = [];
    const r2 = cols, c2 = rows;
    const next = makeMatrix(r2, c2);
    // map A[i][j] -> B[j][c-1-i]
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const ni = j, nj = c2 - 1 - i;
        t.push({ msg: `B[${ni + 1}][${nj + 1}] ← A[${i + 1}][${j + 1}]`, cells: [[i, j]], pc: [1, 2] });
        next[ni][nj] = mat[i][j];
      }
    }
    setTrace(t);
    setStep(0);
    setIsPlaying(true);
    const total = t.length;
    setTimeout(() => {
      setRows(r2);
      setCols(c2);
      setMat(next);
    }, total * Math.max(150, speed));
  }

  // ---- In‑grid editing handlers ----
  function startEdit(r, c) {
    setEditing({ r, c, val: String(mat[r][c] ?? "") });
    setPseudo({ kind: "set", lines: PSEUDO.set });
    setTrace([{ msg: `Prepare set A[${r + 1}][${c + 1}]`, cells: [[r, c]], pc: [1] }]);
    setStep(0);
    setIsPlaying(false);
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

  // ------------ UI Helpers ------------
  const btn =
    "rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer";
  const btnStrong =
    "rounded-xl px-3 py-2 text-sm font-semibold text-white bg-[#064E3B] ring-1 ring-emerald-400/50 shadow hover:bg-black active:scale-[.98] cursor-pointer";
  const groupLabel = "uppercase tracking-widest text-[10px] text-emerald-300/80 mr-2";

  return (
    <div className="min-h-screen w-full bg-[#060807] text-white visualization-page">
      <StyleTag />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-400 drop-shadow">2D Array (Matrix) Visualization</h1>
          <span className="text-xs text-emerald-300/80">Interactive Visualizer & Pseudocode</span>
        </header>

        {/* Controls */}
        <section className="rounded-2xl border border-emerald-700/10 bg-[#0A0F0E] p-4 shadow-[0_0_40px_-18px_#10B981] visualization-controls">
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            {/* SIZE */}
            <div className="order-1 lg:col-span-5 flex flex-wrap items-end gap-2">
              <span className={groupLabel}>Size</span>
              <label className="text-xs text-white/60">Rows</label>
              <input type="number" min={1} max={10} value={rows} onChange={(e) => applySize(+e.target.value, cols)} className="w-20 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" />
              <label className="ml-2 text-xs text-white/60">Cols</label>
              <input type="number" min={1} max={12} value={cols} onChange={(e) => applySize(rows, +e.target.value)} className="w-20 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" />
              <button onClick={onSeed} className={btn}>Seed</button>
              <button onClick={onClear} className={btn}>Clear</button>
            </div>

            {/* CELL set/get */}
            <div className="order-2 lg:col-span-4 flex flex-wrap items-end gap-2">
              <span className={groupLabel}>Cell</span>
              <input type="number" min={1} max={rows} value={rInput} onChange={(e) => setRInput(+e.target.value || 1)} className="w-16 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" />
              <span className="text-white/60">,</span>
              <input type="number" min={1} max={cols} value={cInput} onChange={(e) => setCInput(+e.target.value || 1)} className="w-16 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" />
              <input value={valInput} onChange={(e) => setValInput(e.target.value)} placeholder="value" className="w-28 rounded-lg bg-white/5 px-2 py-1 ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" />
              <button onClick={onSet} className={btnStrong}>Set</button>
              <button onClick={onGet} className={btn}>Get</button>
            </div>

            {/* SEARCH / FILL */}
            <div className="order-3 lg:col-span-3 flex flex-wrap items-end justify-end gap-2">
              <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="search target" className="w-36 rounded-lg px-2 py-1 ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400 bg-white/5" />
              <button onClick={onSearch} className={btn}>Search</button>
              <button onClick={onFill} className={btn}>Fill</button>
              <button onClick={onRandom} className={btn}>Random</button>
            </div>
          </div>

          {/* Row 2 */}
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
            {/* TRAVERSE */}
            <div className="order-1 lg:col-span-9 flex flex-wrap items-center gap-2">
              <span className={groupLabel}>Traverse</span>
              <button onClick={rowMajor} className={btn}>Row‑major</button>
              <button onClick={colMajor} className={btn}>Column‑major</button>
              <button onClick={onSpiral} className={btn}>Spiral ⤵︎</button>
              <button onClick={onTranspose} className={btn}>Transpose</button>
              <button onClick={onRotate90} className={btn}>Rotate 90°</button>
            </div>

            {/* PLAYBACK */}
            <div className="order-2 lg:col-span-3 flex items-center justify-end gap-2">
              <button onClick={() => setIsPlaying((p) => !p)} disabled={!trace.length} className={btn}>
                {isPlaying ? "Pause" : "Play"}
              </button>
              <input type="range" min={150} max={1500} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="accent-emerald-400" />
              <span className="text-xs text-white/60 w-16">{speed}ms</span>
            </div>
          </div>

          <p className="mt-3 text-sm text-emerald-200/90">{status}</p>
        </section>

        {/* Split view 75 | 25 */}
        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12 visualization-split">
          {/* Visualizer */}
          <div className="lg:col-span-9 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-5">
            <MatrixGrid
              mat={mat}
              rows={rows}
              cols={cols}
              hiCells={hiCells}
              editing={editing}
              setEditing={setEditing}
              startEdit={startEdit}
              commitEdit={commitEdit}
              cancelEdit={cancelEdit}
            />
          </div>
          {/* Code panel */}
          <div className="lg:col-span-3 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-4">
            <div className="mb-2 text-sm text-emerald-300">{pseudo.kind ? TITLE[pseudo.kind] : "Pseudocode"}</div>
            <CodePanel lines={pseudo.lines} active={pcHi} />
          </div>
        </section>

        {/* Tracer card */}
        {trace.length > 0 && (
          <section className="mt-5 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-4 visualization-trace">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} className={btn}>⟵ Prev</button>
              <button onClick={() => setStep((s) => Math.min(trace.length - 1, s + 1))} className={btn}>Next ⟶</button>
              <span className="ml-2 text-xs text-white/70">{step + 1} / {trace.length}</span>
              <button onClick={resetTrace} className={`${btn} ml-auto`}>Reset</button>
            </div>
            <div className="mt-3 rounded-lg bg-black/30 p-3 text-sm ring-1 ring-emerald-500/10">{trace[step]?.msg}</div>
          </section>
        )}
      </div>
    </div>
  );
}

// ---------------- Grid renderer ----------------
function MatrixGrid({ mat, rows, cols, hiCells, editing, setEditing, startEdit, commitEdit, cancelEdit }) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mx-auto grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(56px, 1fr))` }}>
        {mat.map((row, i) =>
          row.map((val, j) => {
            const active = hiCells.has(`${i},${j}`);
            const isEditing = editing && editing.r === i && editing.c === j;
            return (
              <div
                key={`${i}-${j}`}
                className={`relative m-[6px] h-14 rounded-xl border flex items-center justify-center font-bold ${
                  active
                    ? 'bg-black border-emerald-400 shadow-[0_0_0_2px_#10B98188_inset] text-white'
                    : val !== ''
                      ? 'bg-emerald-500/80 border-emerald-400/60 text-black'
                      : 'bg-white/5 border-emerald-500/10 text-white/60'
                }`}
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
                <span className="pointer-events-none absolute left-2 top-1 rounded bg-black/40 px-1 text-[10px] text-white/60">{i + 1},{j + 1}</span>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-white/40">
        <span>Rows: {rows}</span>
        <span>Cols: {cols}</span>
      </div>
    </div>
  );
}

// ---------------- Pseudocode ----------------
const TITLE = {
  row: "Row‑Major Traversal",
  col: "Column‑Major Traversal",
  search: "Search Operation",
  transpose: "Matrix Transpose",
  fill: "Fill Operation",
  get: "Get Element",
  set: "Set Element",
  spiral: "Spiral Traversal (Clockwise)",
  rot90: "Rotate 90° Clockwise",
};

const PSEUDO = {
  row: ["1. for i in 0..rows-1:", "2.   for j in 0..cols-1: visit(A[i][j])"],
  col: ["1. for j in 0..cols-1:", "2.   for i in 0..rows-1: visit(A[i][j])"],
  search: [
    "1. for each cell A[i][j]:",
    "2.   if A[i][j] == target: return (i,j)",
    "3.   continue",
    "4. return not found",
  ],
  transpose: ["1. B[j][i] ← A[i][j] for all i,j", "2. return B (size cols×rows)"],
  fill: ["1. for each cell A[i][j]:", "2.   A[i][j] ← x", "3. return"],
  get: ["1. access A[r][c] in O(1)", "2. return A[r][c]"],
  set: ["1. index (r,c) in bounds", "2. A[r][c] ← x", "3. return"],
  spiral: [
    "1. Maintain top, bottom, left, right bounds",
    "2. Traverse top row left→right",
    "3. Traverse right col top→bottom",
    "4. Traverse bottom row right→left",
    "5. Traverse left col bottom→top; shrink bounds; repeat",
  ],
  rot90: [
    "1. Create B of size (cols × rows)",
    "2. For all i,j: B[j][rows-1-i] ← A[i][j]",
  ],
};

function CodePanel({ lines, active }) {
  return (
    <div className="max-h-[60vh] overflow-auto rounded-xl bg-black/30 p-3 ring-1 ring-emerald-500/10">
      {!lines?.length ? (
        <div className="text-xs text-white/50">Choose an operation to view pseudocode with highlights.</div>
      ) : (
        <ol className="space-y-1 text-sm leading-6">
          {lines.map((ln, i) => (
            <li key={i} className={active?.has(i + 1) ? "rounded-lg bg-emerald-500/15 px-2 text-emerald-200" : "px-2 text-white/80"}>
              {ln}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

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
  console.log(`MatrixLearner self‑tests — transpose:${okT?'✅':'❌'} rotate90:${okR?'✅':'❌'} spiral:${okS?'✅':'❌'}`);
}

// ---------------- Styles ----------------
function StyleTag() {
  return (
    <style>{`
      /* no extra styles needed beyond Tailwind utilities */
    `}</style>
  );
}
