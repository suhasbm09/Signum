import React, { useEffect, useRef, useState } from "react";

// ================================================
//  Signum • Stack Learner (Visualizer + Code)
//  Tech: React + JavaScript + Tailwind (inline utilities) only
//  Theme: Dark + Emerald (matches BST Learner)
//  Ops: push, pop, peek, isEmpty, isFull + clear, seed
//  Visual: vertical container (not horizontal array)
//  Code panel on the right highlights pseudocode steps during ops
// ================================================

export default function StackLearner() {
  const [stack, setStack] = useState([]);        // values
  const [capacity, setCapacity] = useState(6);   // max size
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("Ready. Push a few values.");

  // pseudocode
  const [pseudo, setPseudo] = useState({ kind: null, lines: [] });
  const [pcHi, setPcHi] = useState(new Set());   // highlighted lines
  const traceTimer = useRef(null);

  // ---------- helpers ----------
  const isEmpty = () => stack.length === 0;
  const isFull  = () => stack.length >= capacity;
  const top     = () => (isEmpty() ? null : stack[stack.length - 1]);

  // stepper for code highlighting + operation application at the end
  async function runTrace(kind, steps, apply) {
    // show pseudocode and animate through given step indices
    setPseudo({ kind, lines: PSEUDO[kind] || [] });
    setPcHi(new Set());
    for (let i = 0; i < steps.length; i++) {
      const idx = steps[i];
      setPcHi(new Set([idx]));
      await wait(380);
    }
    setPcHi(new Set());
    if (apply) apply();
  }
  const wait = (ms) => new Promise((res) => { clearTimeout(traceTimer.current); traceTimer.current = setTimeout(res, ms); });

  // ---------- operations ----------
  async function onPush() {
    const v = value === "" ? null : value;
    await runTrace("push", [1,2,3,4,5], () => {
      if (isFull()) { setStatus("Overflow: stack is full"); return; }
      if (v === null) { setStatus("Enter a value before push"); return; }
      setStack((s) => [...s, v]); setStatus(`Pushed ${v}`); setValue("");
    });
  }

  async function onPop() {
    await runTrace("pop", [1,2,3], () => {
      if (isEmpty()) { setStatus("Underflow: stack is empty"); return; }
      setStack((s) => { const out = s.slice(0, -1); setStatus(`Popped ${s[s.length-1]}`); return out; });
    });
  }

  async function onPeek() {
    await runTrace("peek", [1,2,3], () => {
      if (isEmpty()) { setStatus("Nothing to peek — empty"); return; }
      setStatus(`Top = ${top()}`);
    });
  }

  function onIsEmpty() {
    runTrace("isempty", [1,2], () => setStatus(isEmpty() ? "isEmpty → true" : "isEmpty → false"));
  }

  function onIsFull() {
    runTrace("isfull", [1,2], () => setStatus(isFull() ? "isFull → true" : "isFull → false"));
  }

  function onClear() {
    setStack([]); setStatus("Cleared"); setPcHi(new Set()); setPseudo({ kind: null, lines: [] });
  }

  function onSeed() {
    const seeds = ["A", "B", "C"];
    if (capacity < seeds.length) setCapacity(seeds.length);
    setStack(seeds); setStatus("Seeded [A, B, C]");
  }

  // ---------- layout helpers ----------
  const btn = "rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer";
  const btnStrong = "rounded-xl px-3 py-2 text-sm font-semibold text-white bg-[#064E3B] ring-1 ring-emerald-400/50 shadow hover:bg-black active:scale-[.98] cursor-pointer";

  return (
    <div className="min-h-screen w-full bg-[#060807] text-white">
      <StyleTag />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-400 drop-shadow">Stack Data Structure Visualization</h1>
          <span className="text-xs text-emerald-300/80">Interactive Visualizer & Pseudocode</span>
        </header>

        {/* Controls */}
        <section className="rounded-2xl border border-emerald-500/10 bg-[#0A0F0E] p-4 shadow-[0_0_40px_-18px_#10B981]">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            {/* input + capacity */}
            <div className="lg:col-span-6 order-1 flex items-center gap-2">
              <input
                value={value}
                onChange={(e)=>setValue(e.target.value)}
                onKeyDown={(e)=> e.key === 'Enter' && onPush()}
                placeholder="Enter a value"
                className="w-full rounded-xl bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-emerald-500/20 placeholder:text-white/50 focus:ring-2 focus:ring-emerald-400"
              />
              <button onClick={onPush} className={btnStrong}> Push</button>
            </div>

            {/* operation buttons */}
            <div className="lg:col-span-3 order-2 flex flex-wrap items-center gap-2">
              <button onClick={onPop} className={btn}>Pop</button>
              <button onClick={onPeek} className={btn}>Peek</button>
              <button onClick={onIsEmpty} className={btn}>isEmpty</button>
              <button onClick={onIsFull} className={btn}>isFull</button>
            </div>

            <div className="lg:col-span-3 order-3 flex items-center justify-end gap-2">
              <div className="flex items-center gap-2 pr-2 text-xs text-white/70">
                <span>Capacity</span>
                <input type="number" min={1} max={24} value={capacity} onChange={(e)=>setCapacity(Math.max(1, Math.min(24, +e.target.value||1)))} className="w-20 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" />
              </div>
              <button onClick={onSeed} className={btn}>Seed</button>
              <button onClick={onClear} className={btn}>Clear</button>
            </div>
          </div>
          <p className="mt-3 text-sm text-emerald-200/90">{status}</p>
        </section>

        {/* Split view 75 | 25 */}
        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Visualizer */}
          <div className="lg:col-span-9 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-5">
            <StackContainer stack={stack} capacity={capacity} />
          </div>

          {/* Code panel */}
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
function StackContainer({ stack, capacity }) {
  const cells = Array.from({ length: capacity }, (_, i) => ({ idx: i })); // 0..cap-1
  // show bottom at bottom using flex-col-reverse, items align to bottom
  return (
    <div className="mx-auto grid w-full max-w-xl grid-cols-[1fr]">
      <div className="relative mx-auto h-[52vh] w-56 rounded-2xl border border-emerald-500/30 bg-black/20 p-2 shadow-[inset_0_0_40px_rgba(16,185,129,0.15)]">
        <div className="absolute inset-2 flex h-[calc(100%-1rem)] flex-col-reverse gap-2 overflow-hidden">
          {cells.map((c, i) => {
            const filled = i < stack.length; // because we're in col-reverse
            const val = filled ? stack[i] : null;
            return (
              <div key={i} className={`h-10 rounded-xl ring-1 ${filled ? 'bg-emerald-500/80 ring-emerald-400/70 item-enter' : 'bg-white/5 ring-emerald-500/10'}`}>
                <div className="flex h-full items-center justify-center text-sm font-bold text-black/90">{val ?? ''}</div>
              </div>
            );
          })}
        </div>
        {/* scale markers */}
        <div className="absolute inset-x-2 top-2 flex justify-between text-[10px] text-white/40">
          <span>TOP</span><span>CAP: {capacity}</span>
        </div>
        <div className="absolute inset-x-2 bottom-2 text-[10px] text-white/40">BOTTOM</div>
      </div>
    </div>
  );
}

// ---------------- Pseudocode ----------------
const TITLE = {
  push: "Push Operation",
  pop: "Pop Operation",
  peek: "Peek Operation",
  isempty: "Is Empty Check",
  isfull: "Is Full Check",
};

const PSEUDO = {
  push: [
    "1. if size == CAP: overflow",
    "2. else: top ← top + 1",
    "3. stack[top] ← x",
    "4. size ← size + 1",
    "5. return",
  ],
  pop: [
    "1. if size == 0: underflow",
    "2. else: x ← stack[top]; top ← top - 1",
    "3. size ← size - 1; return x",
  ],
  peek: [
    "1. if size == 0: return null",
    "2. else: return stack[top]",
    "3. end",
  ],
  isempty: ["1. return (size == 0)", "2. end"],
  isfull:  ["1. return (size == CAP)", "2. end"],
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
      .item-enter{ animation: itemIn 380ms ease-out; }
      @keyframes itemIn{ from { transform: translateY(-12px); opacity: .0; } to { transform: translateY(0); opacity: 1; } }
    `}</style>
  );
}
