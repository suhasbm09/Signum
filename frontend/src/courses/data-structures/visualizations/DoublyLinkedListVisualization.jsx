import React, { useRef, useState } from "react";

export default function DoublyLinkedListVisualization(){
  const [nodes, setNodes] = useState([]);
  const [value, setValue] = useState("");
  const [targetIndex, setTargetIndex] = useState("");
  const [status, setStatus] = useState("Ready. Insert a few values to build the list.");

  // tracing / pseudocode
  const [pseudo, setPseudo] = useState({ kind: null, lines: [] });
  const [pcHi, setPcHi] = useState(new Set());
  const [hiNodes, setHiNodes] = useState(new Set());
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
    await runTrace('insertHead', [[1],[2],[3,[0]], [4]]);
    if(v===''){ setStatus('Enter a value before inserting'); return; }
    setNodes(prev => [v, ...prev]);
    setValue("");
    setStatus(`Inserted ${JSON.stringify(v)} at head`);
  }

  async function onInsertTail(){
    const v = value;
    await runTrace('insertTail', [[1],[2,[nodes.length]],[3]]);
    if(v===''){ setStatus('Enter a value before inserting'); return; }
    setNodes(prev => [...prev, v]);
    setValue("");
    setStatus(`Inserted ${JSON.stringify(v)} at tail`);
  }

  async function onInsertAfter(){
    const v = value;
    const idx = parseInt(targetIndex) || 0;
    
    if(v===''){ setStatus('Enter a value before inserting'); return; }
    if(nodes.length === 0){ 
      setStatus('List is empty. Inserting at head instead.');
      onInsertHead();
      return;
    }
    if(idx < 0 || idx >= nodes.length){ 
      setStatus(`Invalid index. Must be between 0 and ${nodes.length-1}`);
      return;
    }

    await runTrace('insertAfter', [[1,[idx]],[2,[idx, idx+1]],[3,[idx, idx+1]],[4,[idx, idx+1]]]);
    
    setNodes(prev => {
      const newNodes = [...prev];
      newNodes.splice(idx + 1, 0, v);
      return newNodes;
    });
    setValue("");
    setTargetIndex("");
    setStatus(`Inserted ${JSON.stringify(v)} after index ${idx}`);
  }

  async function onInsertBefore(){
    const v = value;
    const idx = parseInt(targetIndex) || 0;
    
    if(v===''){ setStatus('Enter a value before inserting'); return; }
    if(nodes.length === 0){ 
      setStatus('List is empty. Inserting at head instead.');
      onInsertHead();
      return;
    }
    if(idx < 0 || idx >= nodes.length){ 
      setStatus(`Invalid index. Must be between 0 and ${nodes.length-1}`);
      return;
    }

    await runTrace('insertBefore', [[1,[idx]],[2,[idx-1, idx]],[3,[idx-1, idx]],[4,[idx-1, idx]]]);
    
    setNodes(prev => {
      const newNodes = [...prev];
      newNodes.splice(idx, 0, v);
      return newNodes;
    });
    setValue("");
    setTargetIndex("");
    setStatus(`Inserted ${JSON.stringify(v)} before index ${idx}`);
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

  async function onDeleteAtIndex(){
    const idx = parseInt(targetIndex) || 0;
    
    if(nodes.length === 0){ 
      setStatus('List is empty');
      return;
    }
    if(idx < 0 || idx >= nodes.length){ 
      setStatus(`Invalid index. Must be between 0 and ${nodes.length-1}`);
      return;
    }

    await runTrace('deleteAtIndex', [[1,[idx]],[2,[idx-1, idx, idx+1]],[3,[idx-1, idx, idx+1]],[4]]);
    
    const val = nodes[idx];
    setNodes(prev => {
      const newNodes = [...prev];
      newNodes.splice(idx, 1);
      return newNodes;
    });
    setTargetIndex("");
    setStatus(`Deleted ${JSON.stringify(val)} at index ${idx}`);
  }

  async function onDeleteByValue(){
    const tgt = value;
    const idx = nodes.findIndex(x => String(x)===String(tgt));
    if(idx===-1){ 
      setStatus(`Value ${JSON.stringify(tgt)} not found`); 
      await runTrace('deleteByValue', [[1]]); 
      return; 
    }
    
    await runTrace('deleteByValue', [[1,[idx]],[2,[idx-1, idx, idx+1]],[3,[idx-1, idx, idx+1]],[4]]);
    
    setNodes(prev => {
      const newNodes = [...prev];
      newNodes.splice(idx, 1);
      return newNodes;
    });
    setValue("");
    setStatus(`Deleted ${JSON.stringify(tgt)} at index ${idx}`);
  }

  async function onSearch(){
    const tgt = value;
    const t = [];
    for(let i=0;i<nodes.length;i++){
      t.push([1, [i]]);
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
    let cur = [];
    setNodes([]);
    setStatus('Seeding doubly linked list...');
    for(let k=0;k<seq.length;k++){
      cur.push(seq[k]);
      setNodes(cur.slice());
      await runTrace('insertTail', [[1],[2,[k]],[3]]);
    }
    setStatus(`Seeded [${seq.join(', ')}]`);
  }

  function onClear(){ 
    setNodes([]); 
    setStatus('Cleared list'); 
    setPseudo({kind:null,lines:[]}); 
    setPcHi(new Set()); 
    setHiNodes(new Set()); 
    setTargetIndex("");
  }

  // ----- UI helpers -----
  const btn = "rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer transition-all";
  const btnStrong = "rounded-xl px-3 py-2 text-sm font-semibold text-white bg-[#064E3B] ring-1 ring-emerald-400/50 shadow hover:bg-black active:scale-[.98] cursor-pointer transition-all";

  return (
    <div className="min-h-screen w-full bg-[#060807] text-white">
      <StyleTag />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-400 drop-shadow">Doubly Linked List Visualization</h1>
          <span className="text-xs text-emerald-300/80">Interactive Visualizer & Pseudocode</span>
        </header>

        {/* Controls */}
        <section className="rounded-2xl border border-emerald-500/10 bg-[#0A0F0E] p-6 shadow-[0_0_40px_-18px_#10B981]">
          {/* Main Value Input Row */}
          <div className="mb-4">
            <label className="block text-sm text-emerald-300 mb-2">Value Operations</label>
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <input 
                  value={value} 
                  onChange={(e)=>setValue(e.target.value)} 
                  onKeyDown={(e)=> e.key==='Enter' && onInsertHead()} 
                  placeholder="Enter a value" 
                  className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-emerald-500/20 placeholder:text-white/50 focus:ring-2 focus:ring-emerald-400" 
                />
                <button onClick={onInsertHead} className={btnStrong}>Insert Head</button>
              </div>
              <div className="flex gap-2">
                <button onClick={onInsertTail} className={btn}>Insert Tail</button>
                <button onClick={onDeleteByValue} className={btn}>Delete Value</button>
                <button onClick={onSearch} className={btn}>Search</button>
              </div>
            </div>
          </div>

          {/* Index-based Operations Row */}
          <div className="mb-4">
            <label className="block text-sm text-emerald-300 mb-2">Index Operations</label>
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <input 
                  value={targetIndex} 
                  onChange={(e)=>setTargetIndex(e.target.value)} 
                  placeholder="Enter index" 
                  className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-emerald-500/20 placeholder:text-white/50 focus:ring-2 focus:ring-emerald-400" 
                />
                <button onClick={onInsertAfter} className={btn}>Insert After</button>
                <button onClick={onInsertBefore} className={btn}>Insert Before</button>
              </div>
              <div className="flex gap-2">
                <button onClick={onDeleteAtIndex} className={btn}>Delete at Index</button>
              </div>
            </div>
          </div>

          {/* Utility Operations Row */}
          <div>
            <label className="block text-sm text-emerald-300 mb-2">Utility Operations</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={onDeleteHead} className={btn}>Delete Head</button>
              <button onClick={onDeleteTail} className={btn}>Delete Tail</button>
              <button onClick={onTraverse} className={btn}>Traverse</button>
              <button onClick={onSeed} className={btn}>Seed List</button>
              <button onClick={onClear} className={btn}>Clear All</button>
            </div>
          </div>
          
          <p className="mt-4 text-sm text-emerald-200/90 bg-black/20 rounded-lg p-3">{status}</p>
        </section>

        {/* Split view */}
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-9 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-6">
            <DoublyListView nodes={nodes} hiNodes={hiNodes} />
          </div>
          <div className="lg:col-span-3 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-4">
            <div className="mb-3 text-sm font-semibold text-emerald-300">{pseudo.kind ? TITLE[pseudo.kind] : "Pseudocode"}</div>
            <CodePanel lines={pseudo.lines} active={pcHi} />
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------------- Visualizer ----------------
function DoublyListView({ nodes, hiNodes }){
  if(nodes.length===0) return (
    <div className="mx-auto w-full max-w-4xl text-center py-16 text-white/60">
      <div className="text-lg mb-2">Empty List</div>
      <div className="text-sm text-white/40">Use the controls above to add nodes</div>
    </div>
  );
  return (
    <div className="mx-auto w-full max-w-4xl overflow-auto">
      <div className="flex items-center justify-center gap-4 p-4">
        {nodes.map((v,i)=>{
          const active = hiNodes.has(`n-${i}`);
          const isHead = i===0; const isTail = i===nodes.length-1;
          return (
            <div key={i} className="flex items-center gap-1">
              {/* left arrow for prev */}
              {i>0 && (
                <svg className="h-6 w-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12 H4" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M12 4 L4 12 L12 20" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}

              <div className={`relative flex h-20 w-32 items-center justify-center rounded-xl border-2 font-bold transition-all ${
                active ? 'bg-black border-emerald-400 shadow-[0_0_0_3px_#10B98188_inset] text-white scale-105' : 
                'bg-emerald-500/80 border-emerald-400/60 text-black'
              }`}>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold">{String(v)}</span>
                  <div className="flex gap-3 mt-1 text-[10px] text-white/60">
                    <span className="px-1.5 py-0.5 bg-black/30 rounded">prev</span>
                    <span className="px-1.5 py-0.5 bg-black/30 rounded">next</span>
                  </div>
                </div>
                {isHead && <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-emerald-500/90 px-2 text-[10px] font-semibold text-black ring-1 ring-emerald-800">HEAD</span>}
                {isTail && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded bg-emerald-500/90 px-2 text-[10px] font-semibold text-black ring-1 ring-emerald-800">TAIL</span>}
                <span className="pointer-events-none absolute left-1 top-1 rounded bg-black/40 px-1 text-[10px] text-white/60">{i}</span>
              </div>

              {/* right arrow for next */}
              {i < nodes.length-1 && (
                <svg className="h-6 w-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12 H20" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M12 20 L20 12 L12 4" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center text-xs text-white/40">
        List Length: {nodes.length} • Use index operations for middle node manipulation
      </div>
    </div>
  );
}

// ---------------- Pseudocode ----------------
const TITLE = {
  insertHead: "Insert at Head",
  insertTail: "Insert at Tail",
  insertAfter: "Insert After",
  insertBefore: "Insert Before",
  deleteHead: "Delete Head",
  deleteTail: "Delete Tail",
  deleteAtIndex: "Delete at Index",
  deleteByValue: "Delete By Value",
  search: "Search",
  traverse: "Traverse",
};

const PSEUDO = {
  insertHead: [
    "1. make new node n with value x",
    "2. n.prev ← null; n.next ← head",
    "3. if head != null: head.prev ← n",
    "4. head ← n; return",
  ],
  insertTail: [
    "1. make new node n with value x",
    "2. if head == null: head ← n; return",
    "3. walk to last node",
    "4. last.next ← n; n.prev ← last",
  ],
  insertAfter: [
    "1. find node p at index i",
    "2. n.next ← p.next; n.prev ← p",
    "3. if p.next != null: p.next.prev ← n",
    "4. p.next ← n",
  ],
  insertBefore: [
    "1. find node p at index i",
    "2. n.prev ← p.prev; n.next ← p",
    "3. if p.prev != null: p.prev.next ← n",
    "4. p.prev ← n",
  ],
  deleteHead: [
    "1. if head == null: underflow",
    "2. x ← head.value; head ← head.next",
    "3. if head != null: head.prev ← null",
    "4. return x",
  ],
  deleteTail: [
    "1. if head == null: underflow",
    "2. walk to last node",
    "3. pred.next ← null; return last.value",
  ],
  deleteAtIndex: [
    "1. find node p at index i",
    "2. if p.prev != null: p.prev.next ← p.next",
    "3. if p.next != null: p.next.prev ← p.prev",
    "4. return p.value",
  ],
  deleteByValue: [
    "1. find node p with value x",
    "2. if p.prev != null: p.prev.next ← p.next",
    "3. if p.next != null: p.next.prev ← p.prev",
    "4. return",
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
    <div className="max-h-[60vh] overflow-auto rounded-xl bg-black/30 p-4 ring-1 ring-emerald-500/10">
      {!lines?.length ? (
        <div className="text-xs text-white/50 text-center py-4">Choose an operation to view pseudocode</div>
      ) : (
        <ol className="space-y-2 text-sm leading-6">
          {lines.map((ln, i) => (
            <li key={i} className={`px-3 py-1 rounded-lg transition-all ${
              active?.has(i+1) ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" : "text-white/80"
            }`}>{ln}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

function StyleTag(){
  return (
    <style>{`
      @keyframes nodeHighlight {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      .highlight-node {
        animation: nodeHighlight 0.3s ease-in-out;
      }
    `}</style>
  );
}