/**
 * Doubly Linked List Visualization - Modern Architecture
 * Features: useAnimationEngine, VisualizationLayout, speed controls
 * Operations: insertHead, insertTail, insertAfter, insertBefore, deleteHead, deleteTail, deleteAtIndex, deleteByValue, search, traverse
 */

import React, { useState } from 'react';
import { VisualizationLayout } from './components/VisualizationLayout';
import { useAnimationEngine } from './hooks/useAnimationEngine';
import { PseudocodePanel } from './components/PseudocodePanel';

export default function DoublyLinkedListVisualization({ embedded = false }){
  // List state
  const [nodes, setNodes] = useState([]);
  const [value, setValue] = useState('');
  const [targetIndex, setTargetIndex] = useState('');
  const [status, setStatus] = useState('Doubly linked list ready. Insert values to begin.');
  
  // Animation state
  const [trace, setTrace] = useState([]);
  const [algorithmType, setAlgorithmType] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [highlightedLines, setHighlightedLines] = useState(new Set());
  
  // Animation engine
  const animation = useAnimationEngine({
    trace,
    onStepChange: (step) => updateVisualization(step),
    baseSpeed: 400
  });
  
  // Update visualization based on current step
  const updateVisualization = (step) => {
    if (!trace[step]) return;
    const currentTrace = trace[step];
    setStatus(currentTrace.msg);
    setHighlightedLines(new Set(currentTrace.pc || []));
    setHighlightedNodes(new Set((currentTrace.cells || []).map(i => `n-${i}`)));
  };
  
  // Build trace for animations
  const buildTrace = (operation, steps) => {
    const newTrace = steps.map(([pc, cells, msg]) => ({
      pc: pc ? [pc] : [],
      cells: cells || [],
      msg: msg || status
    }));
    setTrace(newTrace);
    setAlgorithmType(operation);
    return newTrace;
  };

  // ----- Operations -----
  const onInsertHead = () => {
    const v = value.trim();
    if (!v) { setStatus('Enter a value to insert'); return; }
    
    const newNodes = [v, ...nodes];
    setNodes(newNodes);
    setValue('');
    
    const trace = buildTrace('insertHead', [
      [1, [], 'Creating new node...'],
      [2, [0], 'Setting prev/next pointers'],
      [3, [0], `Updating head pointer`],
      [4, [0], `Inserted "${v}" at head`]
    ]);
    
    animation.reset();
    animation.play(trace);
    setStatus(`Inserted "${v}" at head`);
  };

  const onInsertTail = () => {
    const v = value.trim();
    if (!v) { setStatus('Enter a value to insert'); return; }
    
    const insertIndex = nodes.length;
    const newNodes = [...nodes, v];
    setNodes(newNodes);
    setValue('');
    
    const steps = [
      [1, [], 'Creating new node...'],
    ];
    
    if (insertIndex === 0) {
      steps.push([2, [0], 'List empty, set as head']);
    } else {
      steps.push([3, [insertIndex - 1], 'Traversing to last node...']);
      steps.push([4, [insertIndex], `Linking to new node`]);
    }
    
    const trace = buildTrace('insertTail', steps);
    animation.reset();
    animation.play(trace);
    setStatus(`Inserted "${v}" at tail`);
  };

  const onInsertAfter = () => {
    const v = value.trim();
    const idx = parseInt(targetIndex);
    
    if (!v) { setStatus('Enter a value to insert'); return; }
    if (nodes.length === 0) { 
      setStatus('List is empty. Inserting at head instead.');
      onInsertHead();
      return;
    }
    if (isNaN(idx) || idx < 0 || idx >= nodes.length) { 
      setStatus(`Invalid index. Must be between 0 and ${nodes.length-1}`);
      return;
    }

    const trace = buildTrace('insertAfter', [
      [1, [idx], `Finding node at index ${idx}`],
      [2, [idx, idx+1], 'Setting new node pointers'],
      [3, [idx, idx+1], 'Updating prev/next links'],
      [4, [idx, idx+1], `Inserted "${v}" after index ${idx}`]
    ]);
    
    animation.reset();
    animation.play(trace);
    
    setTimeout(() => {
      setNodes(prev => {
        const newNodes = [...prev];
        newNodes.splice(idx + 1, 0, v);
        return newNodes;
      });
      setValue('');
      setTargetIndex('');
      setStatus(`Inserted "${v}" after index ${idx}`);
    }, 400);
  };

  const onInsertBefore = () => {
    const v = value.trim();
    const idx = parseInt(targetIndex);
    
    if (!v) { setStatus('Enter a value to insert'); return; }
    if (nodes.length === 0) { 
      setStatus('List is empty. Inserting at head instead.');
      onInsertHead();
      return;
    }
    if (isNaN(idx) || idx < 0 || idx >= nodes.length) { 
      setStatus(`Invalid index. Must be between 0 and ${nodes.length-1}`);
      return;
    }

    const trace = buildTrace('insertBefore', [
      [1, [idx], `Finding node at index ${idx}`],
      [2, [idx-1, idx], 'Setting new node pointers'],
      [3, [idx-1, idx], 'Updating prev/next links'],
      [4, [idx-1, idx], `Inserted "${v}" before index ${idx}`]
    ]);
    
    animation.reset();
    animation.play(trace);
    
    setTimeout(() => {
      setNodes(prev => {
        const newNodes = [...prev];
        newNodes.splice(idx, 0, v);
        return newNodes;
      });
      setValue('');
      setTargetIndex('');
      setStatus(`Inserted "${v}" before index ${idx}`);
    }, 400);
  };

  const onDeleteHead = () => {
    if (nodes.length === 0) { 
      setStatus('List is empty!'); 
      return; 
    }
    
    const val = nodes[0];
    const trace = buildTrace('deleteHead', [
      [1, [0], 'Checking if list is empty...'],
      [2, [0], `Removing head node "${val}"`],
      [3, [1], 'Updating head pointer']
    ]);
    
    animation.reset();
    animation.play(trace);
    
    setTimeout(() => {
      setNodes(prev => prev.slice(1));
      setStatus(`Deleted "${val}" from head`);
    }, 400);
  };

  const onDeleteTail = () => {
    if (nodes.length === 0) { 
      setStatus('List is empty!'); 
      return; 
    }
    
    const val = nodes[nodes.length - 1];
    const tailIndex = nodes.length - 1;
    
    const trace = buildTrace('deleteTail', [
      [1, [tailIndex], 'Checking if list is empty...'],
      [2, [tailIndex], `Removing tail node "${val}"`],
      [3, [tailIndex - 1], 'Updating tail pointer']
    ]);
    
    animation.reset();
    animation.play(trace);
    
    setTimeout(() => {
      setNodes(prev => prev.slice(0, -1));
      setStatus(`Deleted "${val}" from tail`);
    }, 400);
  };

  const onDeleteAtIndex = () => {
    const idx = parseInt(targetIndex);
    
    if (nodes.length === 0) { 
      setStatus('List is empty');
      return;
    }
    if (isNaN(idx) || idx < 0 || idx >= nodes.length) { 
      setStatus(`Invalid index. Must be between 0 and ${nodes.length-1}`);
      return;
    }

    const val = nodes[idx];
    const trace = buildTrace('deleteAtIndex', [
      [1, [idx], `Finding node at index ${idx}`],
      [2, [idx-1, idx, idx+1], 'Updating prev/next pointers'],
      [3, [idx-1, idx, idx+1], `Removing node "${val}"`],
      [4, [], 'Deletion complete']
    ]);
    
    animation.reset();
    animation.play(trace);
    
    setTimeout(() => {
      setNodes(prev => {
        const newNodes = [...prev];
        newNodes.splice(idx, 1);
        return newNodes;
      });
      setTargetIndex('');
      setStatus(`Deleted "${val}" at index ${idx}`);
    }, 400);
  };

  const onDeleteByValue = () => {
    const tgt = value.trim();
    if (!tgt) { setStatus('Enter a value to delete'); return; }
    
    const idx = nodes.findIndex(x => String(x) === String(tgt));
    if (idx === -1) { 
      setStatus(`Value "${tgt}" not found`); 
      const trace = buildTrace('deleteByValue', [
        [1, [], `Searching for "${tgt}"...`],
        [3, [], `"${tgt}" not found`]
      ]);
      animation.reset();
      animation.play(trace);
      return; 
    }
    
    const trace = buildTrace('deleteByValue', [
      [1, [idx], `Found "${tgt}" at index ${idx}`],
      [2, [idx-1, idx, idx+1], 'Updating prev/next pointers'],
      [3, [idx-1, idx, idx+1], `Removing node "${tgt}"`],
      [4, [], 'Deletion complete']
    ]);
    
    animation.reset();
    animation.play(trace);
    
    setTimeout(() => {
      setNodes(prev => {
        const newNodes = [...prev];
        newNodes.splice(idx, 1);
        return newNodes;
      });
      setValue('');
      setStatus(`Deleted "${tgt}" at index ${idx}`);
    }, 400);
  };

  const onSearch = () => {
    const tgt = value.trim();
    if (!tgt) { setStatus('Enter a value to search'); return; }
    
    const steps = [];
    let found = false;
    
    for (let i = 0; i < nodes.length; i++) {
      steps.push([1, [i], `Checking node ${i}: "${nodes[i]}"`]);
      
      if (String(nodes[i]) === String(tgt)) {
        steps.push([2, [i], `Found "${tgt}" at position ${i}!`]);
        found = true;
        break;
      }
    }
    
    if (!found) {
      steps.push([3, [], `"${tgt}" not found in list`]);
    }
    
    const trace = buildTrace('listSearch', steps);
    animation.reset();
    animation.play(trace);
    setStatus(found ? `Found "${tgt}"` : `"${tgt}" not found`);
  };

  const onTraverse = () => {
    if (nodes.length === 0) {
      setStatus('List is empty!');
      return;
    }
    
    const steps = nodes.map((val, i) => [
      1, 
      [i], 
      `Visiting node ${i}: "${val}"`
    ]);
    steps.push([2, [], 'Traversal complete']);
    
    const trace = buildTrace('traverse', steps);
    animation.reset();
    animation.play(trace);
    setStatus('Traversing list...');
  };

  const onSeed = () => {
    const seed = ['A', 'B', 'C', 'D'];
    setNodes(seed);
    setStatus(`Seeded list with ${seed.length} nodes`);
    
    const steps = seed.map((val, i) => [
      1,
      [i],
      `Node ${i}: "${val}"`
    ]);
    
    const trace = buildTrace('traverse', steps);
    animation.reset();
    animation.play(trace);
  };
  
  const onClear = () => {
    animation.reset();
    setNodes([]);
    setTrace([]);
    setAlgorithmType(null);
    setHighlightedNodes(new Set());
    setHighlightedLines(new Set());
    setTargetIndex('');
    setValue('');
    setStatus('List cleared');
  };
  
  const resetAnimation = () => {
    animation.reset();
    setHighlightedNodes(new Set());
    setHighlightedLines(new Set());
    setStatus('Animation reset');
  };

  // Render
  const controls = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Value Operations */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-emerald-300">Value Operations</label>
        <div className="flex items-center gap-2">
          <input 
            type="text"
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && onInsertHead()} 
            placeholder="Enter value" 
            className="flex-1 min-w-0 rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-emerald-500/20 placeholder:text-white/50 focus:ring-2 focus:ring-emerald-400" 
          />
          <button onClick={onInsertHead} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 active:scale-95 transition-all whitespace-nowrap">
            Insert Head
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onInsertTail} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">Insert Tail</button>
          <button onClick={onDeleteByValue} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">Delete Value</button>
          <button onClick={onSearch} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">Search</button>
        </div>
      </div>

      {/* Index Operations */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-emerald-300">Index Operations</label>
        <div className="flex items-center gap-2">
          <input 
            type="text"
            value={targetIndex} 
            onChange={(e) => setTargetIndex(e.target.value)} 
            placeholder="Enter index" 
            className="flex-1 min-w-0 rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-emerald-500/20 placeholder:text-white/50 focus:ring-2 focus:ring-emerald-400" 
          />
          <button onClick={onInsertAfter} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all whitespace-nowrap">Insert After</button>
          <button onClick={onInsertBefore} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all whitespace-nowrap">Insert Before</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onDeleteAtIndex} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">Delete at Index</button>
        </div>
      </div>

      {/* Utility Operations */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-emerald-300">Utility</label>
        <div className="flex flex-wrap gap-2">
          <button onClick={onDeleteHead} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">Delete Head</button>
          <button onClick={onDeleteTail} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">Delete Tail</button>
          <button onClick={onTraverse} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">Traverse</button>
          <button onClick={onSeed} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">Seed</button>
          <button onClick={onClear} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">Clear</button>
        </div>
      </div>
    </div>
  );

  return (
    <VisualizationLayout
      title="Doubly Linked List Visualization"
      status={status}
      controls={controls}
      visualizer={<DoublyListView nodes={nodes} highlightedNodes={highlightedNodes} />}
      algorithmType={algorithmType}
      highlightedLines={highlightedLines}
      trace={trace}
      currentStep={animation.step}
      animationControls={animation}
      onNext={animation.nextStep}
      onPrev={animation.prevStep}
      onReset={resetAnimation}
      embedded={embedded}
    />
  );
}

// ---------------- Visualizer ----------------
function DoublyListView({ nodes, highlightedNodes }){
  if(nodes.length===0) return (
    <div className="mx-auto w-full max-w-4xl text-center py-16 text-white/60">
      <div className="text-lg mb-2">Empty List</div>
      <div className="text-sm text-white/40">Use the controls above to add nodes</div>
    </div>
  );
  return (
    <div className="mx-auto w-full max-w-4xl overflow-auto px-2 sm:px-4">
      <div className="flex items-center justify-center gap-4 p-4">
        {nodes.map((v,i)=>{
          const active = highlightedNodes.has(`n-${i}`);
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
                active ? 'bg-black border-emerald-400 shadow-[0_0_0_3px_#10B98188_inset] text-white' : 
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

