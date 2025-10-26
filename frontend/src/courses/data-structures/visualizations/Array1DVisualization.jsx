import React, { useEffect, useRef, useState } from "react";

// ==============================================================
//  Signum • Array Operations Visualizer — Interactive Learning Tool
//  Tech: React + JavaScript + Tailwind (inline utilities) only
//  Theme: Dark + Emerald (same as BST/Stack/Matrix)
//  Visual: Single horizontal container (boxes) with index chips
//  Features:
//    • Length control (resize), seed, clear
//    • Direct in‑array editing (click a cell to edit; Enter/Esc/blur)
//    • set(i,val), get(i)
//    • fill(val), randomize
//    • traverse → L→R (animated)
//    • search(target) — Linear & Binary (animated)
//    • min() / max() (animated)
//    • NEW: reverse() (animated with actual swaps)
//    • NEW: Bubble Sort (animated with compare/swap + live array view)
//  Professional: Algorithm visualization with pseudocode highlighting
//  Note: Sorting/reverse use a live "view array" that updates per-step without
//        mutating the real array until the animation completes.
// ==============================================================

export default function ArrayLearner(){
  // ---------- state ----------
  const [len, setLen] = useState(10);
  const [arr, setArr] = useState(Array(10).fill(""));
  const [status, setStatus] = useState("Array visualizer ready. Select an operation to begin demonstration.");

  // inputs
  const [idx, setIdx] = useState(1); // 1-based UX
  const [val, setVal] = useState("");
  const [target, setTarget] = useState("");
  const [note, setNote] = useState(""); // small UI hint (e.g., sort needed)

  // trace + code
  // trace item: { msg, cells:[i...], pc:[line...], op?: {type:'swap'|'set', i, j?, value?} }
  const [trace, setTrace] = useState([]);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(450);
  const playTimer = useRef(null);
  const [pseudo, setPseudo] = useState({ kind: null, lines: [] });
  const [pcHi, setPcHi] = useState(new Set());
  const [hi, setHi] = useState(new Set()); // highlighted indices (as keys)

  // live view (for reverse/sort) — recomputed from base + ops up to current step
  const [viewBase, setViewBase] = useState(null);   // array snapshot at start of op
  const [viewArr, setViewArr] = useState(null);     // array shown in UI (if not null)

  // in-grid edit
  const [editing, setEditing] = useState(null); // {i, val}

  // ---------- helpers ----------
  const cmp = (a,b) => {
    const na=Number(a), nb=Number(b);
    if(!Number.isNaN(na) && !Number.isNaN(nb)) return na-nb;
    return String(a).localeCompare(String(b));
  };
  const isSortedAsc = (A) => {
    for(let i=1;i<A.length;i++){ if(cmp(A[i-1],A[i])>0) return false; }
    return true;
  };
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const key = (i) => `i-${i}`;
  function applySize(n){
    const N = clamp(n|0, 1, 24);
    const next = Array(N).fill("");
    for(let i=0;i<Math.min(N, len);i++) next[i]=arr[i];
    setLen(N); setArr(next); setStatus(`Array resized to ${N} elements`); setEditing(null);
    resetTrace();
  }

  function resetTrace(){
    setTrace([]); setStep(0); setIsPlaying(false); setPcHi(new Set()); setHi(new Set()); setPseudo({kind:null,lines:[]});
    setViewBase(null); setViewArr(null); setNote("");
  }

  // ---------- live-view recompute for ops with mutations ----------
  useEffect(()=>{
    if(!trace.length) return;
    const s = trace[step]; if(!s) return;
    setStatus(s.msg);
    setPcHi(new Set(s.pc||[]));
    const S = new Set(); (s.cells||[]).forEach((i)=>S.add(key(i)));
    setHi(S);

    // If any step has an op in the trace, recompute view from base
    const hasOps = trace.some(t=>t.op);
    if(hasOps){
      // initialize base if needed
      if(!viewBase){ setViewBase(arr.slice(0,len)); }
      const base = (viewBase ?? arr.slice(0,len)).slice();
      for(let k=0;k<=step && k<trace.length;k++){
        const op = trace[k].op;
        if(!op) continue;
        if(op.type==='swap'){
          const {i,j} = op; const tmp = base[i]; base[i]=base[j]; base[j]=tmp;
        } else if(op.type==='set'){
          base[op.i] = op.value;
        }
      }
      setViewArr(base);
      // If animation finished and we're playing, commit real array
      if(isPlaying && step>=trace.length-1){
        // Small timeout to let the last frame render before commit
        setTimeout(()=>{ setArr(prev=>{
          const next = base.concat(prev.slice(len));
          return next;
        }); setViewBase(null); setViewArr(null); }, 10);
      }
    } else {
      // no mutations in this trace
      setViewBase(null); setViewArr(null);
    }

    if(isPlaying && step>=trace.length-1) setIsPlaying(false);
  }, [step, trace]);

  useEffect(()=>{
    if(!isPlaying){ if(playTimer.current) clearInterval(playTimer.current); return; }
    if(!trace.length){ setIsPlaying(false); return; }
    playTimer.current = setInterval(()=>{
      setStep((s)=>Math.min(trace.length-1, s+1));
    }, Math.max(120, speed));
    return ()=> clearInterval(playTimer.current);
  }, [isPlaying, speed, trace]);

  // ---------- operations ----------
  function onSeed(){
    const demo = ["A","B","C","D","E","F","G","H","I","J"];
    applySize(demo.length);
    setArr(demo.slice());
    setStatus("Array initialized with sample data (A-J)");
    resetTrace();
  }
  function onClear(){ setArr(Array(len).fill("")); setStatus("Array cleared - all elements set to empty"); resetTrace(); setEditing(null); }

  function onSet(){
    const i0 = clamp((idx|0)-1, 0, len-1);
    setArr(prev=>{ const next=prev.slice(); next[i0]=val; return next; });
    setStatus(`Set A[${i0}] = ${JSON.stringify(val)}`);
    setPseudo({kind: "set", lines: PSEUDO.set});
    setTrace([{ msg:`A[${i0}] ← ${JSON.stringify(val)}`, cells:[i0], pc:[1,2]}]); setStep(0); setIsPlaying(false);
  }
  function onGet(){
    const i0 = clamp((idx|0)-1, 0, len-1);
    setStatus(`Get A[${i0}] → ${JSON.stringify(arr[i0])}`);
    setPseudo({kind:"get", lines:PSEUDO.get});
    setTrace([{ msg:`Index A[${i0}]`, cells:[i0], pc:[1,2]}]); setStep(0); setIsPlaying(false);
  }
  function onFill(){
    const v = val; const t=[]; setPseudo({kind:"fill", lines:PSEUDO.fill});
    const next = Array(len);
    for(let i=0;i<len;i++){ t.push({msg:`Fill i=${i}`, cells:[i], pc:[1,2]}); next[i]=v; }
    setTrace(t); setStep(0); setIsPlaying(true);
    const total=t.length; setTimeout(()=> setArr(next), total*Math.max(120, speed));
    setViewBase(null); setViewArr(null);
  }
  function onRandom(){
    const t=[]; setPseudo({kind:"fill", lines:PSEUDO.fill});
    const next = Array(len);
    for(let i=0;i<len;i++){ t.push({msg:`Rand i=${i}`, cells:[i], pc:[1,2]}); next[i]=Math.floor(Math.random()*90+10); }
    setTrace(t); setStep(0); setIsPlaying(true);
    const total=t.length; setTimeout(()=> setArr(next), total*Math.max(120, speed));
    setNote(""); setViewBase(null); setViewArr(null);
  }
  function onSortAsc(){
    setArr(prev=>{
      const copy = prev.slice(0,len);
      copy.sort(cmp);
      const rest = prev.slice(len);
      return copy.concat(rest);
    });
    setStatus("Array sorted in ascending order for binary search compatibility");
    setNote(""); resetTrace();
  }
  function onTraverse(){
    const t=[]; setPseudo({kind:"trav", lines:PSEUDO.trav});
    for(let i=0;i<len;i++) t.push({msg:`Visit i=${i}`, cells:[i], pc:[2]});
    setTrace(t); setStep(0); setIsPlaying(true);
  }
  function onSearch(){
    const tgt = target; const t=[]; setPseudo({kind:"search", lines:PSEUDO.search});
    for(let i=0;i<len;i++){
      t.push({msg:`Check A[${i}] == ${JSON.stringify(tgt)}?`, cells:[i], pc:[1,2]});
      if(String(arr[i])===String(tgt)){
        t.push({msg:`Found at i=${i}`, cells:[i], pc:[3]});
        setTrace(t); setStep(0); setIsPlaying(true); return;
      }
    }
    t.push({msg:`Not found`, cells:[], pc:[4]});
    setTrace(t); setStep(0); setIsPlaying(true);
  }
  function onBinarySearch(){
    const tgt = target; const t=[]; setPseudo({kind:"bsearch", lines:PSEUDO.bsearch});
    const A = arr.slice(0,len);
    if(!isSortedAsc(A)){
      setTrace([{msg:"Array must be sorted ascending for binary search. Click ‘Sort ↑’.", cells:[], pc:[1]}]);
      setStep(0); setIsPlaying(false); setNote("Note: Binary search requires a sorted array. Use 'Sort ↑' first.");
      return;
    }
    let l=0, r=len-1;
    t.push({msg:`l=0, r=${r}`, cells:[], pc:[1]});
    while(l<=r){
      const m = Math.floor((l+r)/2);
      t.push({msg:`mid=${m}`, cells:[m], pc:[2]});
      if(String(A[m])===String(tgt)){
        t.push({msg:`Found at i=${m}`, cells:[m], pc:[3]});
        break;
      }
      if(cmp(tgt, A[m])<0){ r=m-1; t.push({msg:`tgt < A[mid] → r=${r}`, cells:[m], pc:[4]}); }
      else { l=m+1; t.push({msg:`tgt > A[mid] → l=${l}`, cells:[m], pc:[5]}); }
    }
    if(t.length && !t.some(s=>/Found/.test(s.msg))) t.push({msg:"Not found", cells:[], pc:[6]});
    setTrace(t); setStep(0); setIsPlaying(true);
    setNote("");
  }
  function onMin(){
    const t=[]; setPseudo({kind:"min", lines:PSEUDO.min});
    if(len===0){ setTrace([{msg:"Empty array", cells:[], pc:[1]}]); setStep(0); setIsPlaying(false); return; }
    let minI = 0; t.push({msg:`minIndex=0`, cells:[0], pc:[1]});
    for(let i=1;i<len;i++){
      t.push({msg:`Compare A[${i}] < A[${minI}] ?`, cells:[i, minI], pc:[2]});
      const a = Number(arr[i]); const b = Number(arr[minI]);
      if((!Number.isNaN(a) && !Number.isNaN(b) ? a<b : String(arr[i])<String(arr[minI]))){
        minI = i; t.push({msg:`minIndex ← ${i}`, cells:[minI], pc:[3]});
      }
    }
    t.push({msg:`Min at i=${minI} (value=${JSON.stringify(arr[minI])})`, cells:[minI], pc:[4]});
    setTrace(t); setStep(0); setIsPlaying(true);
  }
  function onMax(){
    const t=[]; setPseudo({kind:"max", lines:PSEUDO.max});
    if(len===0){ setTrace([{msg:"Empty array", cells:[], pc:[1]}]); setStep(0); setIsPlaying(false); return; }
    let maxI = 0; t.push({msg:`maxIndex=0`, cells:[0], pc:[1]});
    for(let i=1;i<len;i++){
      t.push({msg:`Compare A[${i}] > A[${maxI}] ?`, cells:[i, maxI], pc:[2]});
      const a = Number(arr[i]); const b = Number(arr[maxI]);
      if((!Number.isNaN(a) && !Number.isNaN(b) ? a>b : String(arr[i])>String(arr[maxI]))){
        maxI = i; t.push({msg:`maxIndex ← ${i}`, cells:[maxI], pc:[3]});
      }
    }
    t.push({msg:`Max at i=${maxI} (value=${JSON.stringify(arr[maxI])})`, cells:[maxI], pc:[4]});
    setTrace(t); setStep(0); setIsPlaying(true);
  }

  // ---- NEW: Reverse (two-pointer swap) with live swaps ----
  function onReverse(){
    const A = arr.slice(0,len);
    const t=[]; setPseudo({kind:"reverse", lines:PSEUDO.reverse});
    let l=0, r=len-1; t.push({msg:`l=0, r=${r}`, cells:[l,r], pc:[1]});
    while(l<r){
      t.push({msg:`swap A[${l}] ⇄ A[${r}]`, cells:[l,r], pc:[2,3], op:{type:'swap', i:l, j:r}});
      l++; r--; if(l<=r) t.push({msg:`move → l=${l}, r=${r}`, cells:[l,r], pc:[4]});
    }
    if(len<=1) t.push({msg:`No-op (length ${len})`, cells:[], pc:[5]});
    setViewBase(arr.slice(0,len));
    setTrace(t); setStep(0); setIsPlaying(true);
    setStatus("Reversing array (animated swaps)…");
  }

  // ---- NEW: Bubble Sort (ascending) with compare/swap ops ----
  function onBubbleSort(){
    const A = arr.slice(0,len);
    const t=[]; setPseudo({kind:"bsort", lines:PSEUDO.bsort});
    let n = len; let swapped;
    t.push({msg:`n=${n}`, cells:[], pc:[1]});
    for(let i=0;i<n-1;i++){
      swapped=false; t.push({msg:`Pass i=${i}`, cells:[], pc:[2]});
      for(let j=0;j<n-1-i;j++){
        t.push({msg:`Compare A[${j}] ? A[${j+1}]`, cells:[j,j+1], pc:[3]});
        if(cmp(A[j], A[j+1])>0){
          // record swap op; also update A so subsequent compares are on updated view
          const tmp=A[j]; A[j]=A[j+1]; A[j+1]=tmp;
          swapped=true;
          t.push({msg:`swap A[${j}] ⇄ A[${j+1}]`, cells:[j,j+1], pc:[4], op:{type:'swap', i:j, j:j+1}});
        }
      }
      t.push({msg:`End pass i=${i}${swapped?" (swapped)":" (no swaps)"}`, cells:[n-1-i], pc:[5]});
      if(!swapped){ t.push({msg:`Early exit (already sorted)`, cells:[], pc:[6]}); break; }
    }
    setViewBase(arr.slice(0,len));
    setTrace(t); setStep(0); setIsPlaying(true);
    setStatus("Bubble sorting (animated)…"); setNote("");
  }

  // ---- inline editing ----
  function startEdit(i){ setEditing({ i, val: String(arr[i] ?? "") }); setPseudo({kind:"set", lines:PSEUDO.set}); setTrace([{msg:`Prepare set A[${i}]`, cells:[i], pc:[1]}]); setStep(0); setIsPlaying(false); }
  function commitEdit(){ if(!editing) return; const {i, val} = editing; setArr(prev=>{ const next=prev.slice(); next[i]=val; return next; }); setStatus(`Set A[${i}] = ${JSON.stringify(val)}`); setTrace([{msg:`A[${i}] ← ${JSON.stringify(val)}`, cells:[i], pc:[2]}]); setEditing(null); }
  function cancelEdit(){ setEditing(null); }

  // ---------- UI helpers ----------
  const btn = "rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer";
  const btnStrong = "rounded-xl px-3 py-2 text-sm font-semibold text-white bg-[#064E3B] ring-1 ring-emerald-400/50 shadow hover:bg-black active:scale-[.98] cursor-pointer";
  const chip = "rounded-md bg-black/30 px-2 py-1 text-xs text-emerald-300 ring-1 ring-emerald-500/10";

  const displayArr = viewArr ?? arr;

  return (
    <div className="min-h-screen w-full bg-[#060807] text-white rounded-2xl">
      <StyleTag />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-400 drop-shadow">Array Operations Visualizer</h1>
          <span className="text-xs text-emerald-300/80">Interactive Algorithm Demonstration</span>
        </header>

        {/* Controls */}
        <section className="rounded-2xl border border-emerald-500/10 bg-[#0A0F0E] p-4 shadow-[0_0_40px_-18px_#10B981]">
          {/* Row 1: length + search + play */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-4 order-1 flex flex-wrap items-center gap-2">
              <label className="text-xs text-white/60">Length</label>
              <input type="number" min={1} max={24} value={len} onChange={(e)=>applySize(+e.target.value)} className="w-24 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" />
              <button onClick={onSeed} className={btn}>Seed</button>
              <button onClick={onClear} className={btn}>Clear</button>
            </div>
            <div className="lg:col-span-5 order-2 flex flex-wrap items-center gap-2">
              <input value={target} onChange={(e)=>setTarget(e.target.value)} placeholder="search target" className="w-40 rounded-lg bg-white/5 px-2 py-1 ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" />
              <button onClick={onSearch} className={btn}>Linear</button>
              <button onClick={onBinarySearch} className={btn}>Binary</button>
              <button onClick={onSortAsc} className={btn}>Sort ↑</button>
              {note && <span className={chip}>{note}</span>}
            </div>
            <div className="lg:col-span-3 order-3 flex items-center justify-end gap-2">
              <button onClick={()=>setIsPlaying(p=>!p)} disabled={!trace.length} className={btn}>{isPlaying?"Pause":"Play"}</button>
              <input type="range" min={120} max={1500} value={speed} onChange={(e)=>setSpeed(+e.target.value)} className="accent-emerald-400" />
              <span className="text-xs text-white/60 w-16">{speed}ms</span>
            </div>
          </div>

          {/* Row 2: index set/get + fill/random */}
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-7 order-1 flex flex-wrap items-center gap-2">
              <span className="group-label">Index</span>
              <input type="number" min={1} max={len} value={idx} onChange={(e)=>setIdx(+e.target.value||1)} className="w-24 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" />
              <input value={val} onChange={(e)=>setVal(e.target.value)} placeholder="value" className="w-36 rounded-lg bg-white/5 px-2 py-1 ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" />
              <button onClick={onSet} className={btnStrong}>Set</button>
              <button onClick={onGet} className={btn}>Get</button>
            </div>
            <div className="lg:col-span-5 order-2 flex items-center justify-end gap-2">
              <button onClick={onFill} className={btn}>Fill</button>
              <button onClick={onRandom} className={btn}>Random</button>
            </div>
          </div>

          {/* Row 3: traverse/min/max + NEW ops */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="group-label">Traverse</span>
            <button onClick={onTraverse} className={btn}>Left → Right</button>
            <button onClick={onMin} className={btn}>Min</button>
            <button onClick={onMax} className={btn}>Max</button>
            <span className="group-label ml-4">Advanced</span>
            <button onClick={onReverse} className={btn}>Reverse ↔</button>
            <button onClick={onBubbleSort} className={btn}>Bubble Sort</button>
          </div>

          <p className="mt-3 text-sm text-emerald-200/90">{status}</p>
        </section>

        {/* Split view 75 | 25 */}
        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Visualizer */}
          <div className="lg:col-span-9 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-5">
            <ArrayRow
              arr={displayArr}
              len={len}
              hi={hi}
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

        {/* Tracer */}
        {trace.length>0 && (
          <section className="mt-5 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-4">
            <div className="flex items-center gap-2">
              <button onClick={()=>setStep(s=>Math.max(0,s-1))} className={btn}>⟵ Prev</button>
              <button onClick={()=>setStep(s=>Math.min(trace.length-1,s+1))} className={btn}>Next ⟶</button>
              <span className="ml-2 text-xs text-white/70">{step+1} / {trace.length}</span>
              <button onClick={resetTrace} className={`${btn} ml-auto`}>Reset</button>
            </div>
            <div className="mt-3 rounded-lg bg-black/30 p-3 text-sm ring-1 ring-emerald-500/10">{trace[step]?.msg}</div>
          </section>
        )}
      </div>
    </div>
  );
}

// ---------------- Visualizer ----------------
function ArrayRow({ arr, len, hi, editing, setEditing, startEdit, commitEdit, cancelEdit }){
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mx-auto grid" style={{ gridTemplateColumns: `repeat(${len}, minmax(56px, 1fr))` }}>
        {arr.slice(0,len).map((v,i)=>{
          const active = hi.has(`i-${i}`);
          const isEditing = editing && editing.i===i;
          return (
            <div key={i} className={`relative m-[6px] h-16 rounded-xl border flex items-center justify-center font-bold ${active? 'bg-black border-emerald-400 shadow-[0_0_0_2px_#10B98188_inset] text-white' : v!==''? 'bg-emerald-500/80 border-emerald-400/60 text-black' : 'bg-white/5 border-emerald-500/10 text-white/60'}`}>
              {isEditing ? (
                <input
                  autoFocus
                  value={editing.val}
                  onChange={(e)=>setEditing({ ...editing, val: e.target.value })}
                  onKeyDown={(e)=>{ if(e.key==='Enter') commitEdit(); if(e.key==='Escape') cancelEdit(); }}
                  onBlur={commitEdit}
                  className="w-[90%] rounded-lg bg-black/60 px-2 py-1 text-center text-white ring-1 ring-emerald-400 focus:ring-2 focus:ring-emerald-300"
                  placeholder="value"
                />
              ) : (
                <button
                  onClick={()=>startEdit(i)}
                  className={`w-full h-full cursor-text`}
                  title={`Click to edit A[${i}]`}
                >{String(v)}</button>
              )}
              <span className="pointer-events-none absolute left-2 top-1 rounded bg-black/40 px-1 text-[10px] text-white/60">{i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- Pseudocode ----------------
const TITLE = {
  set: "Array Assignment: A[i] = value",
  get: "Array Access: A[i]",
  fill: "Array Fill Operation",
  trav: "Array Traversal Algorithm",
  search: "Linear Search Algorithm",
  bsearch: "Binary Search Algorithm",
  min: "Find Minimum Element",
  max: "Find Maximum Element",
  reverse: "Reverse Array (Two-Pointer)",
  bsort: "Bubble Sort (Ascending)",
};

const PSEUDO = {
  set: ["1. Validate array bounds for index i", "2. Assign value to A[i]"],
  get: ["1. Validate array bounds for index i", "2. Return element at A[i]"],
  fill: ["1. For each index i from 0 to n-1:", "2.   Set A[i] = specified value"],
  trav: ["1. For each index i from 0 to n-1:", "2.   Process element A[i]"],
  search: [
    "1. For each index i from 0 to n-1:",
    "2.   Compare A[i] with target value",
    "3.   If match found, return index i",
    "4. Return -1 (not found)",
  ],
  bsearch: [
    "1. Initialize left = 0, right = n-1",
    "2. Calculate middle index = (left + right) / 2",
    "3. If A[middle] equals target: return middle",
    "4. If target < A[middle]: search left half",
    "5. If target > A[middle]: search right half",
    "6. Return -1 if not found",
  ],
  min: [
    "1. Initialize minIndex = 0",
    "2. For each index i from 1 to n-1:",
    "3.   If A[i] < A[minIndex]: minIndex = i",
    "4. Return minIndex",
  ],
  max: [
    "1. Initialize maxIndex = 0",
    "2. For each index i from 1 to n-1:",
    "3.   If A[i] > A[maxIndex]: maxIndex = i",
    "4. Return maxIndex",
  ],
  reverse: [
    "1. Set l = 0, r = n - 1",
    "2. While l < r:",
    "3.   swap A[l] and A[r]",
    "4.   l = l + 1, r = r - 1",
    "5. End",
  ],
  bsort: [
    "1. For i = 0 … n-2:",
    "2.   (new pass) set swapped = false",
    "3.   For j = 0 … n-2-i: compare A[j] and A[j+1]",
    "4.     If A[j] > A[j+1]: swap and set swapped = true",
    "5.   End pass (last index fixed)",
    "6.   If swapped == false: early exit (already sorted)",
  ],
};

function CodePanel({ lines, active }){
  return (
    <div className="max-h-[60vh] overflow-auto rounded-xl bg-black/30 p-3 ring-1 ring-emerald-500/10">
      {!lines?.length ? (
        <div className="text-xs text-white/50">Select an algorithm to view its pseudocode implementation.</div>
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
      /* no extra styles needed beyond Tailwind utilities */
    `}</style>
  );
}
