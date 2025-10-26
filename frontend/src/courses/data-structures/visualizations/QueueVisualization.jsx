import React, { useRef, useState } from "react";

// ==============================================================
//  Signum • Queue Learner — Visualizer + Code Panel
//  Tech: React + JavaScript + Tailwind (inline utilities)
//  Theme: Dark + Emerald (matches BST/Stack/Matrix)
//  Model: Circular queue using a fixed-size buffer (capacity)
//  Ops: enqueue, dequeue, peek/front, isEmpty, isFull, clear, seed
//  Visual: single horizontal container (tray) with FRONT/REAR markers
//  Code panel (25%) highlights steps during each operation
// ==============================================================

export default function QueueLearner() {
  // ----- queue state -----
  const [cap, setCap] = useState(7);
  const [arr, setArr] = useState(Array(7).fill(""));
  const [front, setFront] = useState(0); // index of current front
  const [size, setSize] = useState(0);  // number of items

  const [value, setValue] = useState("");
  const [status, setStatus] = useState("Ready. Enqueue a few values.");

  // pseudocode panel
  const [pseudo, setPseudo] = useState({ kind: null, lines: [] });
  const [pcHi, setPcHi] = useState(new Set());     // highlighted lines
  const [hiCells, setHiCells] = useState(new Set()); // indices to accent
  const timer = useRef(null);

  // ----- helpers -----
  const isEmpty = () => size === 0;
  const isFull  = () => size === cap;
  const rearIdx = () => (front + size) % cap;              // next write
  const lastIdx = () => (size ? (front + size - 1) % cap : null); // last filled
  const idxKey  = (i) => `i-${i}`;

  const wait = (ms) => new Promise((res)=>{ clearTimeout(timer.current); timer.current = setTimeout(res, ms); });
  async function runTrace(kind, steps, highlightIdxs = []){
    setPseudo({ kind, lines: PSEUDO[kind] || [] });
    setPcHi(new Set()); setHiCells(new Set());
    for(const [line, idxList] of steps){
      setPcHi(new Set([line]));
      const s = new Set(); (idxList||[]).forEach(i=>s.add(idxKey(i)));
      setHiCells(s);
      await wait(360);
    }
    setPcHi(new Set()); setHiCells(new Set());
  }

  function resetAll(n){
    const N = Math.max(2, Math.min(20, n|0 || 2));
    setCap(N); setArr(Array(N).fill("")); setFront(0); setSize(0);
  }

  // ----- operations -----
  async function onEnqueue(){
    const v = value;
    await runTrace("enqueue", [[1], [2,[rearIdx()]], [3,[rearIdx()]], [4]]);
    if (isFull()) { setStatus("Overflow: queue is full"); return; }
    if (v === "")  { setStatus("Enter a value before enqueue"); return; }
    const idx = rearIdx();
    setArr(prev => { const next = prev.slice(); next[idx] = v; return next; });
    setSize((s)=> s+1);
    setStatus(`Enqueued ${JSON.stringify(v)} at index ${idx}`);
    setValue("");
  }

  async function onDequeue(){
    await runTrace("dequeue", [[1], [2,[front]], [3]]);
    if (isEmpty()) { setStatus("Underflow: queue is empty"); return; }
    const idx = front; const val = arr[idx];
    setArr(prev => { const next = prev.slice(); next[idx] = ""; return next; });
    setFront((f)=> (f+1)%cap);
    setSize((s)=> s-1);
    setStatus(`Dequeued ${JSON.stringify(val)} from index ${idx}`);
  }

  async function onPeek(){
    await runTrace("peek", [[1], [2,[front]], [3]]);
    if (isEmpty()) { setStatus("Peek: empty queue"); return; }
    setStatus(`Front = ${JSON.stringify(arr[front])} at index ${front}`);
  }

  async function onIsEmpty(){
    await runTrace("isempty", [[1],[2]]);
    setStatus(isEmpty()? "isEmpty → true" : "isEmpty → false");
  }

  async function onIsFull(){
    await runTrace("isfull", [[1],[2]]);
    setStatus(isFull()? "isFull → true" : "isFull → false");
  }

  function onClear(){ resetAll(cap); setStatus("Cleared queue"); }

  function onSeed(){
    const seq = ["A","B","C"];
    const N = Math.max(cap, seq.length);
    resetAll(N);
    const base = Array(N).fill("");
    for(let k=0;k<seq.length;k++) base[k] = seq[k];
    setArr(base); setSize(seq.length); setFront(0); setStatus("Seeded [A,B,C]");
  }

  // ----- UI helpers -----
  const btn = "rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer";
  const btnStrong = "rounded-xl px-3 py-2 text-sm font-semibold text-white bg-[#064E3B] ring-1 ring-emerald-400/50 shadow hover:bg-black active:scale-[.98] cursor-pointer";

  return (
    <div className="min-h-screen w-full bg-[#060807] text-white">
      <StyleTag />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-400 drop-shadow">Queue Data Structure Visualization</h1>
          <span className="text-xs text-emerald-300/80">Interactive Visualizer & Pseudocode</span>
        </header>

        {/* Controls */}
        <section className="rounded-2xl border border-emerald-500/10 bg-[#0A0F0E] p-4 shadow-[0_0_40px_-18px_#10B981]">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            {/* input + enqueue */}
            <div className="lg:col-span-5 order-1 flex items-center gap-2">
              <input
                value={value}
                onChange={(e)=>setValue(e.target.value)}
                onKeyDown={(e)=> e.key==='Enter' && onEnqueue()}
                placeholder="Enter a value"
                className="w-full rounded-xl bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-emerald-500/20 placeholder:text-white/50 focus:ring-2 focus:ring-emerald-400"
              />
              <button onClick={onEnqueue} className={btnStrong}>Enqueue</button>
            </div>

            {/* operations */}
            <div className="lg:col-span-4 order-2 flex flex-wrap items-center gap-2">
              <button onClick={onDequeue} className={btn}>Dequeue</button>
              <button onClick={onPeek} className={btn}>Peek</button>
              <button onClick={onIsEmpty} className={btn}>isEmpty</button>
              <button onClick={onIsFull} className={btn}>isFull</button>
            </div>

            {/* capacity + seed/clear */}
            <div className="lg:col-span-3 order-3 flex items-center justify-end gap-2">
              <div className="flex items-center gap-2 pr-2 text-xs text-white/70">
                <span>Capacity</span>
                <input type="number" min={2} max={20} value={cap} onChange={(e)=>resetAll(+e.target.value)} className="w-20 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" />
              </div>
              <button onClick={onSeed} className={btn}>Seed</button>
              <button onClick={onClear} className={btn}>Clear</button>
            </div>
          </div>
          <p className="mt-3 text-sm text-emerald-200/90">{status}</p>
        </section>

        {/* Split view 75 | 25 */}
        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-9 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-5">
            <QueueTray
              arr={arr}
              cap={cap}
              front={front}
              size={size}
              hiCells={hiCells}
            />
          </div>
          <div className="lg:col-span-3 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-4">
            <div className="mb-2 text-sm text-emerald-300">{pseudo.kind ? TITLE[pseudo.kind] : "Pseudocode"}</div>
            <CodePanel lines={pseudo.lines} active={pcHi} />
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------------- Visualizer ----------------
function QueueTray({ arr, cap, front, size, hiCells }){
  const last = size ? (front + size - 1) % cap : null;
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="relative rounded-2xl border border-emerald-500/30 bg-black/20 p-3 shadow-[inset_0_0_40px_rgba(16,185,129,0.15)]">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cap}, minmax(56px, 1fr))` }}>
          {arr.map((v, i) => {
            const active = hiCells.has(`i-${i}`);
            const isFront = size>0 && i===front;
            const isRearSlot = i===((front+size)%cap) && size<cap; // next write slot
            const isLast = size>0 && i===last;
            return (
              <div key={i} className={`relative m-[6px] h-16 rounded-xl border flex items-center justify-center font-bold ${active? 'bg-black border-emerald-400 shadow-[0_0_0_2px_#10B98188_inset] text-white' : v!==''? 'bg-emerald-500/80 border-emerald-400/60 text-black' : 'bg-white/5 border-emerald-500/10 text-white/60'}`}>
                <span>{String(v)}</span>
                {/* markers */}
                {isFront && <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-emerald-500/90 px-2 text-[10px] font-semibold text-black ring-1 ring-emerald-800">FRONT</span>}
                {isLast && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded bg-emerald-500/90 px-2 text-[10px] font-semibold text-black ring-1 ring-emerald-800">REAR</span>}
                {isRearSlot && !v && <span className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/70 pointer-events-none"/>}
                <span className="pointer-events-none absolute left-2 top-1 rounded bg-black/40 px-1 text-[10px] text-white/60">{i}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-white/40">
        <span>cap={cap}</span>
        <span>front={front}</span>
        <span>size={size}</span>
      </div>
    </div>
  );
}

// ---------------- Pseudocode ----------------
const TITLE = {
  enqueue: "Enqueue Operation",
  dequeue: "Dequeue Operation",
  peek: "Peek Operation",
  isempty: "Is Empty Check",
  isfull:  "Is Full Check",
};

const PSEUDO = {
  enqueue: [
    "1. if size == cap: overflow",
    "2. i ← (front + size) mod cap",
    "3. A[i] ← x",
    "4. size ← size + 1",
  ],
  dequeue: [
    "1. if size == 0: underflow",
    "2. x ← A[front]; A[front] ← ⌀",
    "3. front ← (front + 1) mod cap; size ← size - 1",
  ],
  peek: [
    "1. if size == 0: return null",
    "2. return A[front]",
    "3. end",
  ],
  isempty: ["1. return (size == 0)", "2. end"],
  isfull:  ["1. return (size == cap)", "2. end"],
};

function CodePanel({ lines, active }) {
  return (
    <div className="max-h-[60vh] overflow-auto rounded-xl bg-black/30 p-3 ring-1 ring-emerald-500/10">
      {!lines?.length ? (
        <div className="text-xs text-white/50">Choose an operation to view pseudocode with highlights.</div>
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

// ---------------- Styles ----------------
function StyleTag(){
  return (
    <style>{`
      /* animations kept subtle via Tailwind shadows and rings */
    `}</style>
  );
}
