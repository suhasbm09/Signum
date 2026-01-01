/**
 * Singly Linked List Visualization - Modern Architecture
 * Features: useAnimationEngine, VisualizationLayout, speed controls
 * Operations: insertHead, insertTail, deleteHead, deleteTail, search, traverse
 */

import React, { useState } from 'react';
import { VisualizationLayout } from './components/VisualizationLayout';
import { useAnimationEngine } from './hooks/useAnimationEngine';
import { PseudocodePanel } from './components/PseudocodePanel';

export default function SinglyLinkedListVisualization({ embedded = false }) {
  // List state
  const [nodes, setNodes] = useState([]);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('Linked list ready. Insert values to begin.');
  
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
      [2, [0], `Setting new node as head`],
      [3, [0], `Inserted "${v}" at head`]
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

  const onDeleteHead = () => {
    if (nodes.length === 0) { 
      setStatus('List is empty!'); 
      return; 
    }
    
    const val = nodes[0];
    const trace = buildTrace('deleteHead', [
      [1, [0], 'Checking if list is empty...'],
      [2, [0], `Removing head node "${val}"`],
      [3, [1], 'Moving head to next node']
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
    
    const steps = [
      [1, [tailIndex], 'Checking if list is empty...'],
    ];
    
    if (nodes.length > 1) {
      steps.push([2, [tailIndex - 1], 'Traversing to second-last node...']);
      steps.push([3, [tailIndex], `Removing tail node "${val}"`]);
    } else {
      steps.push([3, [0], `Removing single node "${val}"`]);
    }
    
    const trace = buildTrace('deleteTail', steps);
    animation.reset();
    animation.play(trace);
    
    setTimeout(() => {
      setNodes(prev => prev.slice(0, -1));
      setStatus(`Deleted "${val}" from tail`);
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
      
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={onInsertTail} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">
          Insert Tail
        </button>
        <button onClick={onDeleteHead} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">
          Delete Head
        </button>
        <button onClick={onDeleteTail} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">
          Delete Tail
        </button>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={onSearch} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">
          Search
        </button>
        <button onClick={onTraverse} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">
          Traverse
        </button>
        <button onClick={onSeed} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">
          Seed
        </button>
        <button onClick={onClear} className="px-3 py-2 text-sm text-white bg-black/40 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all">
          Clear
        </button>
      </div>
    </div>
  );

  return (
    <VisualizationLayout
      title="Singly Linked List Visualization"
      status={status}
      controls={controls}
      visualizer={<LinkedListView nodes={nodes} highlightedNodes={highlightedNodes} />}
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
function LinkedListView({ nodes, highlightedNodes }){
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
          const active = highlightedNodes.has(`n-${i}`);
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

