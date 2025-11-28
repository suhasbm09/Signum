import React, { useRef, useState } from "react";

// =============================================================
// Signum • Singly Linked List Learner (Visualizer + Code Panel)
// Theme: Dark + Emerald (consistent with other visualizations)
// Ops: insertHead, insertTail, deleteHead, deleteTail, search, traverse, seed, clear
// Visual: horizontal nodes with arrows and HEAD/TAIL markers
// =============================================================

export default function SinglyLinkedListLearner() {
  const [nodes, setNodes] = useState([]); // simple array representing list order
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("Ready. Insert a few values to build the list.");

  // tracing / pseudocode
  const [pseudo, setPseudo] = useState({ kind: null, lines: [] });
  const [pcHi, setPcHi] = useState(new Set());
  const [hiNodes, setHiNodes] = useState(new Set()); // keys: `n-${i}`
  const timer = useRef(null);

  const key = (i) => `n-${i}`;
  const wait = (ms) => new Promise((res)=>{ clearTimeout(timer.current); timer.current = setTimeout(res, ms); });

  async function runTrace(kind, steps){
    setPseudo({ kind, lines: PSEUDO[kind] || [] });
    setPcHi(new Set()); setHiNodes(new Set());
    for(const [line, idxList] of steps){
      setPcHi(new Set([line]));
      const s = new Set(); (idxList||[]).forEach(i=>s.add(key(i)));
      setHiNodes(s);
      await wait(360);
    }
    setPcHi(new Set()); setHiNodes(new Set());
  }

  // ----- operations -----
  async function onInsertHead(){
    const v = value;
    if(v===''){ setStatus('Enter a value before inserting'); return; }
    // Insert first so the visualization has the new node to highlight during the trace
    setNodes(prev => [v, ...prev]);
    setValue("");
    await runTrace('insertHead', [[1],[2,[0]],[3]]);
    setStatus(`Inserted ${JSON.stringify(v)} at head`);
  }

  async function onInsertTail(){
    const v = value;
    if(v===''){ setStatus('Enter a value before inserting'); return; }
    // capture index for highlighting, insert node first so it is visible
    const insertIndex = nodes.length;
    setNodes(prev => [...prev, v]);
    setValue("");
    await runTrace('insertTail', [[1],[2,[insertIndex]],[3]]);
    setStatus(`Inserted ${JSON.stringify(v)} at tail`);
  }

  async function onDeleteHead(){
    await runTrace('deleteHead', [[1],[2,[0]],[3]]);
    if(nodes.length===0){ setStatus('Underflow: list is empty'); return; }
    const val = nodes[0];
    setNodes(prev => prev.slice(1));
    setStatus(`Deleted head ${JSON.stringify(val)}`);
  }

  async function onDeleteTail(){
    await runTrace('deleteTail', [[1],[2,[Math.max(0,nodes.length-1)]],[3]]);
    if(nodes.length===0){ setStatus('Underflow: list is empty'); return; }
    const val = nodes[nodes.length-1];
    setNodes(prev => prev.slice(0, -1));
    setStatus(`Deleted tail ${JSON.stringify(val)}`);
  }

  async function onSearch(){
    const tgt = value;
    const t = [];
    for(let i=0;i<nodes.length;i++){
      t.push([1, [i]]); // highlight compare
      if(String(nodes[i]) === String(tgt)){
        t.push([2, [i]]);
        await runTrace('search', t);
        setStatus(`Found ${JSON.stringify(tgt)} at index ${i}`);
        return;
      }
    }
    await runTrace('search', t.length? t : [[1, []]] );
    setStatus(`Not found: ${JSON.stringify(tgt)}`);
  }

  function onTraverse(){
    const steps = nodes.map((_,i)=>[1,[i]]);
    if(steps.length===0) steps.push([1, []]);
    runTrace('traverse', steps);
    setStatus('Traversing list…');
  }

  async function onSeed(){
    const seq = ["A","B","C"];
    // animated seed: insert elements one-by-one using insertTail trace
    let cur = [];
    setNodes([]);
    setStatus('Seeding list...');
    for(let k=0;k<seq.length;k++){
      cur.push(seq[k]);
      setNodes(cur.slice());
      // highlight the insertion at tail (index k)
      await runTrace('insertTail', [[1],[2,[k]],[3]]);
    }
    setStatus(`Seeded [${seq.join(', ')}]`);
  }

  function onClear(){ setNodes([]); setStatus('Cleared list'); setPseudo({kind:null,lines:[]}); setPcHi(new Set()); setHiNodes(new Set()); }

  // ----- UI helpers -----
  const btn = "rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer";
  const btnStrong = "rounded-xl px-3 py-2 text-sm font-semibold text-white bg-[#064E3B] ring-1 ring-emerald-400/50 shadow hover:bg-black active:scale-[.98] cursor-pointer";

  return (
    <div className="w-full bg-[#060807] text-white visualization-page">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-400 drop-shadow">Singly Linked List Visualization</h1>
          <span className="text-xs text-emerald-300/80">Interactive Visualizer & Pseudocode</span>
        </header>

        {/* Controls */}
        <section className="rounded-2xl border border-emerald-500/10 bg-[#0A0F0E] p-4 shadow-[0_0_40px_-18px_#10B981] visualization-controls">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-6 order-1 flex items-center gap-2">
              <input value={value} onChange={(e)=>setValue(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && onInsertHead()} placeholder="Enter a value" className="w-full rounded-xl bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-emerald-500/20 placeholder:text-white/50 focus:ring-2 focus:ring-emerald-400" />
              <button onClick={onInsertHead} className={btnStrong}>Insert Head</button>
            </div>

            <div className="lg:col-span-4 order-2 flex items-center gap-2">
              <button onClick={onInsertTail} className={btn}>Insert Tail</button>
              <button onClick={onDeleteHead} className={btn}>Delete Head</button>
              <button onClick={onDeleteTail} className={btn}>Delete Tail</button>
              <button onClick={onSearch} className={btn}>Search</button>
              <button onClick={onTraverse} className={btn}>Traverse</button>
            </div>

            <div className="lg:col-span-4 order-3 flex items-center justify-end gap-2">
              {/* seed / clear grouped to the right (consistent with other visualizers) */}
              <button onClick={onSeed} className={btn}>Seed</button>
              <button onClick={onClear} className={btn}>Clear</button>
            </div>
          </div>
          <p className="mt-3 text-sm text-emerald-200/90">{status}</p>
        </section>

        {/* Split view */}
        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12 visualization-split">
          <div className="lg:col-span-9 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-5">
            <LinkedListView nodes={nodes} hiNodes={hiNodes} />
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
function LinkedListView({ nodes, hiNodes }){
  // Calculate dynamic sizing based on number of nodes to fit container
  const calculateDimensions = () => {
    const containerWidth = 800; // Approximate container width
    const containerHeight = 140; // Approximate container height
    
    const minNodeWidth = 60;
    const maxNodeWidth = 120;
    const minNodeHeight = 50;
    const maxNodeHeight = 80;
    
    const minArrowWidth = 15;
    const maxArrowWidth = 40;
    
    if (nodes.length === 0) {
      return { nodeWidth: maxNodeWidth, nodeHeight: maxNodeHeight, arrowWidth: maxArrowWidth };
    }
    
    // Calculate available space per node (including arrows)
    const totalNodes = nodes.length;
    const availableWidthPerUnit = containerWidth / (totalNodes * 1.8); // 1.8 accounts for node + arrow space
    
    const nodeWidth = Math.max(minNodeWidth, Math.min(maxNodeWidth, availableWidthPerUnit * 1.2));
    const nodeHeight = Math.max(minNodeHeight, Math.min(maxNodeHeight, containerHeight * 0.6));
    const arrowWidth = Math.max(minArrowWidth, Math.min(maxArrowWidth, availableWidthPerUnit * 0.6));
    
    return { nodeWidth, nodeHeight, arrowWidth };
  };

  const { nodeWidth, nodeHeight, arrowWidth } = calculateDimensions();

  if(nodes.length===0) return (
    <div className="mx-auto w-full text-center py-12 text-white/60">Empty list — insert nodes to begin.</div>
  );
  
  return (
    <div className="mx-auto w-full">
      <div className="flex items-center justify-center gap-1 p-3 min-h-[140px] overflow-hidden">
        {nodes.map((v,i)=>{
          const active = hiNodes.has(`n-${i}`);
          const isHead = i===0; 
          const isTail = i===nodes.length-1;
          return (
            <div key={i} className="flex items-center gap-0">
              <div 
                  className={`relative flex items-center justify-center rounded-lg border font-bold transition-all duration-200 ${
                  active? 'bg-black border-emerald-400 shadow-[0_0_0_2px_#10B98188_inset] text-white' : 
                  v!==''? 'bg-emerald-600 border-emerald-400/60 text-white' : 
                  'bg-white/5 border-emerald-500/10 text-white/60'
                }`}
                style={{ 
                  width: `${nodeWidth}px`, 
                  height: `${nodeHeight}px`,
                  fontSize: `${Math.max(10, nodeWidth * 0.12)}px`
                }}
              >
                <span className="truncate px-1 max-w-full">{String(v)}</span>
                {isHead && (
                  <span 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 rounded bg-emerald-500/90 px-1 text-[9px] font-semibold text-black ring-1 ring-emerald-800 whitespace-nowrap"
                    style={{ fontSize: '9px' }}
                  >
                    HEAD
                  </span>
                )}
                {isTail && (
                  <span 
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded bg-emerald-500/90 px-1 text-[9px] font-semibold text-black ring-1 ring-emerald-800 whitespace-nowrap"
                    style={{ fontSize: '9px' }}
                  >
                    TAIL
                  </span>
                )}
                <span className="pointer-events-none absolute left-1 top-1 rounded bg-black/40 px-1 text-[8px] text-white/60">
                  {i}
                </span>
              </div>
              {i < nodes.length-1 && (
                <svg 
                  className="shrink-0" 
                  style={{ width: `${arrowWidth}px`, height: `${nodeHeight/3}px` }} 
                  viewBox="0 0 100 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 12 H86" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M78 4 L86 12 L78 20" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-white/40 px-3">
        <span>len={nodes.length}</span>
        <span>nodes: {Math.round(nodeWidth)}×{Math.round(nodeHeight)}px</span>
      </div>
    </div>
  );
}

// ---------------- Pseudocode ----------------
const TITLE = {
  insertHead: "Insert at Head",
  insertTail: "Insert at Tail",
  deleteHead: "Delete Head",
  deleteTail: "Delete Tail",
  search: "Search",
  traverse: "Traverse",
};

const PSEUDO = {
  insertHead: [
    "1. make new node n with value x",
    "2. n.next ← head",
    "3. head ← n",
    "4. return",
  ],
  insertTail: [
    "1. make new node n with value x",
    "2. if head == null: head ← n; return",
    "3. walk to last node",
    "4. last.next ← n",
  ],
  deleteHead: [
    "1. if head == null: underflow",
    "2. x ← head.value; head ← head.next",
    "3. return x",
  ],
  deleteTail: [
    "1. if head == null: underflow",
    "2. walk to predecessor of last",
    "3. pred.next ← null; return last.value",
  ],
  search: [
    "1. p ← head",
    "2. while p != null: if p.value == x return p; p ← p.next",
    "3. return null",
  ],
  traverse: [
    "1. p ← head",
    "2. while p != null: visit p; p ← p.next",
    "3. end",
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
            <li key={i} className={active?.has(i+1) ? "rounded-lg bg-emerald-500/15 px-2 text-emerald-200" : "px-2 text-white/80"}>{ln}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
