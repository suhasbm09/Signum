import React, { useMemo, useRef, useState, useEffect } from "react";

// ================================================
//  Signum • BST Learner (complete, with code panel)
//  • React + JavaScript + Tailwind only
//  • Dark + emerald theme to match Signum
//  Features
//    - Insert + Search tracer + Delete tracer
//    - Traversals (in, pre, post, level)
//    - Min / Max tracer
//    - Auto‑Play with speed control
//    - Split view: 75% Tree | 25% Pseudocode (highlighted)
// ================================================

export default function BSTLearner() {
  // ---------- State ----------
  const [root, setRoot] = useState(null);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("Ready. Insert a few numbers to start.");
  const [highlight, setHighlight] = useState(new Set()); // node ids to accent
  const idRef = useRef(1);

  // Tracer (search/delete/traversals)
  const [trace, setTrace] = useState([]); // [{msg, ids, pc:[lineIdx,...]}]
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(700); // ms per step
  const playTimer = useRef(null);

  // Traversal result ribbon
  const [travOut, setTravOut] = useState({ type: null, list: [] });

  // Pseudocode panel
  const [pseudo, setPseudo] = useState({ kind: null, lines: [] });
  const [pcHi, setPcHi] = useState(new Set()); // active code lines

  // ---------- Helpers ----------
  const makeNode = (val, parent = null) => ({
    id: idRef.current++,
    value: Number(val),
    left: null,
    right: null,
    parent,
  });

  const cloneRoot = () => setRoot((r) => (r ? { ...r } : r));

  // ---------- Core BST ops ----------
  function insert(valRaw) {
    const v = Number(valRaw);
    if (Number.isNaN(v)) return;
    if (!root) {
      const n = makeNode(v);
      setRoot(n);
      flash([n.id], `Inserted ${v} as root`);
      setPseudo({ kind: "insert", lines: PSEUDO.insert });
      return;
    }
    let cur = root, parent = null;
    const path = [];
    while (cur) {
      path.push(cur.id);
      parent = cur;
      if (v === cur.value) {
        flash(path, `Value ${v} already exists`);
        setPseudo({ kind: "insert", lines: PSEUDO.insert });
        return;
      }
      cur = v < parent.value ? parent.left : parent.right;
    }
    const n = makeNode(v, parent);
    if (v < parent.value) parent.left = n; else parent.right = n;
    cloneRoot();
    flash([...path, n.id], `Inserted ${v}`);
    setPseudo({ kind: "insert", lines: PSEUDO.insert });
  }

  // Build a step trace for searching a key (with pc mapping)
  function buildSearchTrace(xRaw) {
    const x = Number(xRaw);
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
        out.push({ msg: `${x} < ${cur.value} → left`, ids: [cur.id], pc: [4] });
        cur = cur.left;
      } else {
        out.push({ msg: `${x} > ${cur.value} → right`, ids: [cur.id], pc: [5] });
        cur = cur.right;
      }
    }
    out.push({ msg: `Reached null — ${x} not in tree`, ids: [], pc: [6] });
    return out;
  }

  // Delete with trace (cases: leaf, one child, two children)
  function buildDeleteTrace(xRaw) {
    const x = Number(xRaw);
    const out = [];
    let cur = root;
    out.push({ msg: `Start at root`, ids: cur ? [cur.id] : [], pc: [1] });
    while (cur && cur.value !== x) {
      out.push({ msg: `At ${cur.value}`, ids: [cur.id], pc: [2] });
      if (x < cur.value) { out.push({ msg: `${x} < ${cur.value} → left`, ids: [cur.id], pc: [3] }); cur = cur.left; }
      else { out.push({ msg: `${x} > ${cur.value} → right`, ids: [cur.id], pc: [4] }); cur = cur.right; }
    }
    if (!cur) { out.push({ msg: `${x} not found`, ids: [], pc: [5] }); return out; }

    out.push({ msg: `Found ${x}`, ids: [cur.id], pc: [6] });
    if (!cur.left && !cur.right) {
      out.push({ msg: `Leaf → remove`, ids: [cur.id], pc: [7] });
    } else if (!cur.left || !cur.right) {
      out.push({ msg: `One child → promote`, ids: [cur.id], pc: [8] });
    } else {
      out.push({ msg: `Two children`, ids: [cur.id], pc: [9] });
      let s = cur.right; while (s?.left) { out.push({ msg: `Find successor: ${s.value}`, ids: [s.id], pc: [10] }); s = s.left; }
      if (s) out.push({ msg: `Successor ${s.value} → swap`, ids: [s.id, cur.id], pc: [11] });
      out.push({ msg: `Delete successor node`, ids: [], pc: [12] });
    }
    out.push({ msg: `Deletion complete`, ids: [], pc: [13] });
    return out;
  }

  // Min/Max trace (walk extreme)
  function buildMinMaxTrace(kind) {
    const leftMost = kind === "min";
    const out = [];
    let cur = root;
    if (!cur) { out.push({ msg: "Tree is empty", ids: [], pc: [1] }); return out; }
    out.push({ msg: "Start at root", ids: [cur.id], pc: [1] });
    while ((leftMost ? cur.left : cur.right)) {
      out.push({ msg: leftMost ? `Go left from ${cur.value}` : `Go right from ${cur.value}`, ids: [cur.id], pc: [2] });
      cur = leftMost ? cur.left : cur.right;
    }
    out.push({ msg: leftMost ? `Min is ${cur.value}` : `Max is ${cur.value}`, ids: [cur.id], pc: [3] });
    return out;
  }

  function applyDelete(xRaw) {
    const x = Number(xRaw);
    const del = (node) => {
      if (!node) return null;
      if (x < node.value) { node.left = del(node.left); if (node.left) node.left.parent = node; return node; }
      if (x > node.value) { node.right = del(node.right); if (node.right) node.right.parent = node; return node; }
      if (!node.left && !node.right) return null;
      if (!node.left) { node.right.parent = node.parent; return node.right; }
      if (!node.right) { node.left.parent = node.parent; return node.left; }
      let s = node.right; while (s.left) s = s.left;
      node.value = s.value;
      node.right = deleteNode(node.right, s.value);
      function deleteNode(n, val) {
        if (!n) return null;
        if (val < n.value) { n.left = deleteNode(n.left, val); if (n.left) n.left.parent = n; return n; }
        if (val > n.value) { n.right = deleteNode(n.right, val); if (n.right) n.right.parent = n; return n; }
        if (!n.left && !n.right) return null;
        if (!n.left) { n.right.parent = n.parent; return n.right; }
        if (!n.right) { n.left.parent = n.parent; return n.left; }
        let s2 = n.right; while (s2.left) s2 = s2.left; n.value = s2.value; n.right = deleteNode(n.right, s2.value); return n;
      }
      return node;
    };
    const newRoot = del(root);
    if (newRoot) newRoot.parent = null;
    setRoot(newRoot);
    cloneRoot();
  }

  // Traversals (produce order list & trace for animation)
  function makeTraversal(kind) {
    const order = [];
    const t = [];
    const visit = (n) => { if (!n) return; t.push({ msg: `Visit ${n.value}`, ids: [n.id], pc: [2] }); order.push(n.value); };
    const pre = (n) => { if (!n) return; t.push({ msg: `Pre: ${n.value}`, ids: [n.id], pc: [1] }); visit(n); pre(n.left); pre(n.right); };
    const ino = (n) => { if (!n) return; ino(n.left); visit(n); ino(n.right); };
    const post = (n) => { if (!n) return; post(n.left); post(n.right); visit(n); };
    const level = (n) => {
      if (!n) return; const q = [n]; t.push({ msg: `Init queue`, ids: [n.id], pc: [1] });
      while (q.length) { const a = q.shift(); visit(a); if (a.left) q.push(a.left); if (a.right) q.push(a.right); }
    };
    setPseudo({ kind: kind, lines: PSEUDO[kind] || [] });
    if (kind === "pre") pre(root);
    else if (kind === "in") ino(root);
    else if (kind === "post") post(root);
    else if (kind === "level") level(root);
    else if (kind === "min" || kind === "max") {
      // no-op here; handled by onMin/onMax
    }
    setTravOut({ type: kind, list: order });
    setTrace(t); setStep(0); setStatus(labelForTraversal(kind));
    if (t[0]) { setHighlight(new Set(t[0].ids)); setPcHi(new Set(t[0].pc||[])); } else { setHighlight(new Set()); setPcHi(new Set()); }
  }

  function labelForTraversal(k) {
    return ({ pre: "Preorder", in: "Inorder", post: "Postorder", level: "Level Order" })[k] || "Traversal";
  }

  // ---------- UX helpers ----------
  function flash(ids, msg) {
    setHighlight(new Set(ids));
    setStatus(msg);
    const token = Symbol();
    flash.token = token;
    setTimeout(() => {
      if (flash.token === token) setHighlight(new Set());
    }, 900);
  }

  function onInsert() {
    if (value === "") return; insert(value); setValue("");
  }

  function onSearch() {
    if (value === "") return;
    setPseudo({ kind: "search", lines: PSEUDO.search });
    const t = buildSearchTrace(value);
    setTrace(t); setStep(0);
    if (t[0]) { setHighlight(new Set(t[0].ids)); setPcHi(new Set(t[0].pc||[])); }
    setStatus(`Tracing search for ${Number(value)}`);
  }

  function onDelete() {
    if (value === "") return;
    setPseudo({ kind: "delete", lines: PSEUDO.delete });
    const t = buildDeleteTrace(value);
    setTrace(t); setStep(0);
    if (t[0]) { setHighlight(new Set(t[0].ids)); setPcHi(new Set(t[0].pc||[])); }
    setStatus(`Deleting ${Number(value)} (step through or hit Play)`);
  }

  function onMin() {
    setPseudo({ kind: "min", lines: PSEUDO.min });
    const t = buildMinMaxTrace("min");
    setTrace(t); setStep(0);
    if (t[0]) { setHighlight(new Set(t[0].ids)); setPcHi(new Set(t[0].pc||[])); }
    setStatus("Tracing minimum (left-most)");
  }

  function onMax() {
    setPseudo({ kind: "max", lines: PSEUDO.max });
    const t = buildMinMaxTrace("max");
    setTrace(t); setStep(0);
    if (t[0]) { setHighlight(new Set(t[0].ids)); setPcHi(new Set(t[0].pc||[])); }
    setStatus("Tracing maximum (right-most)");
  }

  function applyIfFinished() {
    const last = trace[trace.length - 1]?.msg;
    if (!last) return;
    if (last.includes("Deletion complete")) {
      applyDelete(value); setStatus(`Deleted ${Number(value)}`);
    }
  }

  function clearTree() {
    setRoot(null); setTrace([]); setStep(0); setHighlight(new Set());
    setTravOut({ type: null, list: [] });
    setIsPlaying(false);
    setPseudo({ kind: null, lines: [] }); setPcHi(new Set());
    setStatus("Tree cleared");
  }

  function seedTree() {
    const arr = [50, 30, 70, 20, 40, 60, 80];
    let r = null;
    const mk = (v, p = null) => ({ id: -1, value: v, left: null, right: null, parent: p });
    const ins = (t, v) => {
      if (!t) return mk(v);
      let c = t, p = null; while (c) { p = c; c = v < c.value ? c.left : c.right; }
      if (v < p.value) p.left = mk(v, p); else p.right = mk(v, p); return t;
    };
    for (const v of arr) r = ins(r, v);
    const rebuild = (n, p = null) => n ? { id: idRef.current++, value: n.value, left: rebuild(n.left, n), right: rebuild(n.right, n), parent: p } : null;
    setRoot(rebuild(r));
    setTrace([]); setStep(0); setHighlight(new Set()); setPcHi(new Set());
    setTravOut({ type: null, list: [] }); setPseudo({ kind: null, lines: [] });
    setStatus("Seeded example tree [50,30,70,20,40,60,80]");
  }

  // when changing step in tracer
  useEffect(() => {
    const s = trace[step];
    if (!s) return;
    setHighlight(new Set(s.ids)); setStatus(s.msg); setPcHi(new Set(s.pc || []));
    if (isPlaying && step >= trace.length - 1) {
      setIsPlaying(false);
      applyIfFinished();
    }
  }, [step, trace]);

  // auto play logic
  useEffect(() => {
    if (!isPlaying) { if (playTimer.current) clearInterval(playTimer.current); return; }
    if (!trace.length) { setIsPlaying(false); return; }
    playTimer.current = setInterval(() => {
      setStep((s) => Math.min(trace.length - 1, s + 1));
    }, Math.max(200, speed));
    return () => clearInterval(playTimer.current);
  }, [isPlaying, speed, trace]);

  // ---------- Layout (in‑order columns, depth rows) ----------
  const layout = useMemo(() => {
    let xCounter = 0; const nodes = []; const edges = [];
    const walk = (n, d = 0) => {
      if (!n) return; walk(n.left, d + 1);
      nodes.push({ id: n.id, value: n.value, depth: d, ref: n, x: xCounter++ });
      if (n.left) edges.push([n.id, n.left.id]); if (n.right) edges.push([n.id, n.right.id]);
      walk(n.right, d + 1);
    };
    walk(root);
    if (!nodes.length) return { nodes: [], edges: [], w: 800, h: 320, pos: new Map() };
    const xGap = 68, yGap = 100, mx = 80, my = 60;
    const width = mx * 2 + (xCounter) * xGap;
    const maxDepth = nodes.reduce((m, n) => Math.max(m, n.depth), 0);
    const height = my * 2 + (maxDepth + 1) * yGap;
    const pos = new Map();
    nodes.forEach((n) => pos.set(n.id, { X: mx + n.x * xGap, Y: my + n.depth * yGap }));
    const edgePos = edges.map(([a, b]) => ({ from: pos.get(a), to: pos.get(b), key: `${a}-${b}` }));
    return { nodes, edges: edgePos, w: Math.max(640, width), h: Math.max(320, height), pos };
  }, [root]);

  return (
    <div className="min-h-screen w-full bg-[#060807] text-white">
      <StyleTag />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-400 drop-shadow">Binary Search Tree Visualization</h1>
          <span className="text-xs text-emerald-300/80">Interactive Visualizer & Pseudocode</span>
        </header>

        {/* Controls */}
        <section className="rounded-2xl border border-emerald-500/10 bg-[#0A0F0E] p-4 shadow-[0_0_40px_-18px_#10B981]">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-5 order-1 flex items-center gap-2">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onInsert()}
                placeholder="Enter a number"
                className="w-full rounded-xl bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-emerald-500/20 placeholder:text-white/50 focus:ring-2 focus:ring-emerald-400"
              />
              <button onClick={onInsert} className="rounded-xl px-3 py-2 text-sm font-semibold text-white bg-[#064E3B] ring-1 ring-emerald-400/50 shadow hover:bg-black active:scale-[.98] cursor-pointer" aria-label="Insert number">Insert</button>
            </div>
            <div className="lg:col-span-4 order-2 flex items-center gap-2">
              <span className="group-label">Trace</span>
              <button onClick={onSearch} className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer">Search</button>
              <button onClick={onDelete} className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer">Delete</button>
            </div>
            {/* Traverse row below Trace */}
            <div className="lg:col-span-12 order-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap pt-1">
              <span className="group-label">Traverse</span>
              <button onClick={() => makeTraversal("in")} className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer">Inorder</button>
              <button onClick={() => makeTraversal("pre")} className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer">Pre</button>
              <button onClick={() => makeTraversal("post")} className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer">Post</button>
              <button onClick={() => makeTraversal("level")} className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer">Level</button>
              <button onClick={onMin} className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer">Min</button>
              <button onClick={onMax} className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer">Max</button>
            </div>
            <div className="lg:col-span-3 order-3 flex items-center justify-end gap-2">
              <button onClick={seedTree} className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer">Seed</button>
              <button onClick={clearTree} className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer">Clear</button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-sm text-emerald-200/90 flex-1">{status}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsPlaying((p) => !p)} disabled={!trace.length} className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer">
                {isPlaying ? "Pause" : "Play"}
              </button>
              <input type="range" min={200} max={1500} value={speed} onChange={(e)=>setSpeed(+e.target.value)} className="accent-emerald-400" />
              <span className="text-xs text-white/60 w-16">{speed}ms</span>
            </div>
          </div>
        </section>

        {/* Split view: 75% Tree | 25% Code */}
        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-9 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-3">
            <TreeSVG layout={layout} highlight={highlight} />
            {!layout.nodes.length && (
              <div className="py-10 text-center text-white/60">Tree is empty — try <span className="text-emerald-400">Seed</span> or insert values.</div>
            )}
          </div>
          <div className="lg:col-span-3 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-4">
            <div className="mb-2 text-sm text-emerald-300">{pseudo.kind ? TITLE[pseudo.kind] : "Pseudocode"}</div>
            <CodePanel lines={pseudo.lines} active={pcHi} />
          </div>
        </section>

        {/* Tracer */}
        {trace.length > 0 && (
          <section className="mt-5 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer">⟵ Prev</button>
              <button onClick={() => setStep((s) => Math.min(trace.length - 1, s + 1))} className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer">Next ⟶</button>
              <span className="ml-2 text-xs text-white/70">{step + 1} / {trace.length}</span>
            </div>
            <div className="mt-3 rounded-lg bg-black/30 p-3 text-sm ring-1 ring-emerald-500/10">
              {trace[step]?.msg}
            </div>
          </section>
        )}

        {/* Traversal ribbon */}
        {travOut.type && (
          <section className="mt-5 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-4">
            <div className="mb-2 text-sm text-emerald-300">{labelForTraversal(travOut.type)} order</div>
            <div className="flex flex-wrap gap-2">
              {travOut.list.map((v, i) => (
                <span key={i} className="rounded-lg bg-emerald-500/20 px-3 py-1 text-sm text-emerald-200 ring-1 ring-emerald-500/30">{v}</span>
              ))}
            </div>
          </section>
        )}

        <p className="mt-6 text-center text-xs text-white/50">Tip: Trace Delete → Play to watch the case logic; deletion applies at the end.</p>
      </div>
    </div>
  );
}

// --------------- SVG Renderer (emerald → b/w on highlight) ---------------
function TreeSVG({ layout, highlight }) {
  const hi = highlight || new Set();
  const { nodes, edges, w, h, pos } = layout;
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" className="mx-auto block h-auto w-full" style={{ maxHeight: "68vh" }}>
        {edges.map((e) => (
          <line key={e.key} x1={e.from.X} y1={e.from.Y} x2={e.to.X} y2={e.to.Y} stroke="#34D399" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
        ))}
        {nodes.map((n) => {
          const p = pos.get(n.id);
          const active = hi.has(n.id);
          return (
            <g key={n.id} transform={`translate(${p.X}, ${p.Y})`} className="transition-transform duration-300">
              <circle r="22" className={active ? "node-active" : "node"} />
              <text textAnchor="middle" dominantBaseline="central" className={active ? "fill-white font-bold" : "fill-black font-bold"}>
                {n.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --------------- Pseudocode dictionaries --------------------
const TITLE = {
  search: "Search Operation",
  delete: "Deletion Operation",
  insert: "Insertion Operation",
  pre: "Preorder Traversal",
  in: "Inorder Traversal",
  post: "Postorder Traversal",
  level: "Level-Order Traversal",
  min: "Finding Minimum Value",
  max: "Finding Maximum Value",
};

const PSEUDO = {
  insert: [
    "1. cur ← root",
    "2. while cur ≠ null:",
    "3.   if x == cur.val: return (dup)",
    "4.   cur ← (x < cur.val) ? cur.left : cur.right",
    "5. attach new node x at null position",
  ],
  search: [
    "1. cur ← root",
    "2. while cur ≠ null:",
    "3.   if x == cur.val: return cur",
    "4.   if x < cur.val: cur ← cur.left",
    "5.   else: cur ← cur.right",
    "6. return not found",
  ],
  delete: [
    "1. cur ← root",
    "2. while cur and cur.val ≠ x:",
    "3.   if x < cur.val: cur ← cur.left",
    "4.   else: cur ← cur.right",
    "5. if cur is null: return (not found)",
    "6. // found node cur",
    "7. if leaf: remove cur",
    "8. else if single child: promote child",
    "9. else: // two children",
    "10.   s ← leftmost(cur.right)",
    "11.   cur.val ← s.val",
    "12.   delete s from cur.right",
    "13. return",
  ],
  pre: ["1. visit(node)", "2. pre(node.left)", "3. pre(node.right)"],
  in: ["1. in(node.left)", "2. visit(node)", "3. in(node.right)"],
  post: ["1. post(node.left)", "2. post(node.right)", "3. visit(node)"],
  level: ["1. q ← [root]", "2. while q not empty:", "3.   node ← pop(q); visit(node)", "4.   push children if exist"],
  min: ["1. cur ← root", "2. while cur.left exists: cur ← cur.left", "3. return cur"],
  max: ["1. cur ← root", "2. while cur.right exists: cur ← cur.right", "3. return cur"],
};

function CodePanel({ lines, active }) {
  return (
    <div className="max-h-[68vh] overflow-auto rounded-xl bg-black/30 p-3 ring-1 ring-emerald-500/10">
      {!lines?.length ? (
        <div className="text-xs text-white/50">Choose an action (Trace Search/Delete or a traversal) to view code.</div>
      ) : (
        <ol className="space-y-1 text-sm leading-6">
          {lines.map((ln, i) => (
            <li key={i} className={active?.has(i+1) ? "rounded-lg bg-emerald-500/15 px-2 text-emerald-200" : "px-2 text-white/80"}>{ln}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

// --------------- Inline styles (tiny, for glow/pulse) --------------------
function StyleTag() {
  return (
    <style>{`
      .node{ filter: drop-shadow(0 8px 20px rgba(16,185,129,0.20)); fill: #10B981; stroke: #064E3B; stroke-width: 2px; }
      .node-active{ filter: drop-shadow(0 10px 22px rgba(0,0,0,0.45)); fill: #000; stroke: #10B981; stroke-width: 3px; }
      input[type="range"]{ width: 160px; }
    `}</style>
  );
}
