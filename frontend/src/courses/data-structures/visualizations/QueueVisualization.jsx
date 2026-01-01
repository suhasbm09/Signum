/**
 * Queue Visualization - Modern Architecture
 * Features: useAnimationEngine, VisualizationLayout, speed controls
 * Operations: enqueue, dequeue, peek, isEmpty, isFull
 */

import React, { useState } from 'react';
import { VisualizationLayout } from './components/VisualizationLayout';
import { useAnimationEngine } from './hooks/useAnimationEngine';

export default function QueueVisualization({ embedded = false }) {
  // Queue state
  const [cap, setCap] = useState(7);
  const [arr, setArr] = useState(Array(7).fill(''));
  const [front, setFront] = useState(0);
  const [size, setSize] = useState(0);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('Queue ready. Enqueue values to begin.');
  
  // Animation state
  const [trace, setTrace] = useState([]);
  const [algorithmType, setAlgorithmType] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState(new Set());
  const [highlightedLines, setHighlightedLines] = useState(new Set());
  
  // Animation engine
  const animation = useAnimationEngine({
    trace,
    onStepChange: (step) => updateVisualization(step),
    baseSpeed: 380
  });
  
  // Update visualization based on current step
  const updateVisualization = (step) => {
    if (!trace[step]) return;
    const currentTrace = trace[step];
    setStatus(currentTrace.msg);
    setHighlightedLines(new Set(currentTrace.pc || []));
    setHighlightedCells(new Set((currentTrace.cells || []).map(i => `i-${i}`)));
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
  
  // Helpers
  const isEmpty = () => size === 0;
  const isFull = () => size === cap;
  const rearIdx = () => (front + size) % cap;
  const resetAll = (n) => {
    const N = Math.max(2, Math.min(20, n || 2));
    setCap(N);
    setArr(Array(N).fill(''));
    setFront(0);
    setSize(0);
    animation.reset();
    setTrace([]);
    setAlgorithmType(null);
    setHighlightedCells(new Set());
    setHighlightedLines(new Set());
  };

  // Operations
  const onEnqueue = () => {
    const v = value.trim();
    if (!v) {
      setStatus('Enter a value to enqueue');
      return;
    }
    
    if (isFull()) {
      setStatus('Overflow: queue is full!');
      const trace = buildTrace('enqueue', [
        [1, [], 'Checking capacity...'],
        [2, [], 'Queue is full - overflow!']
      ]);
      animation.reset();
      animation.play(trace);
      return;
    }
    
    const idx = rearIdx();
    const trace = buildTrace('enqueue', [
      [1, [], 'Checking if queue is full...'],
      [2, [idx], `Inserting at rear index ${idx}`],
      [3, [idx], `Enqueued "${v}"`],
      [4, [], 'Incrementing size']
    ]);
    
    animation.reset();
    animation.play(trace);
    
    setTimeout(() => {
      setArr(prev => {
        const next = prev.slice();
        next[idx] = v;
        return next;
      });
      setSize(s => s + 1);
      setValue('');
      setStatus(`Enqueued "${v}" at index ${idx}`);
    }, 380);
  };

  const onDequeue = () => {
    if (isEmpty()) {
      setStatus('Underflow: queue is empty!');
      const trace = buildTrace('dequeue', [
        [1, [], 'Checking if queue is empty...'],
        [2, [], 'Queue is empty - underflow!']
      ]);
      animation.reset();
      animation.play(trace);
      return;
    }
    
    const idx = front;
    const val = arr[idx];
    const trace = buildTrace('dequeue', [
      [1, [], 'Checking if queue is empty...'],
      [2, [idx], `Removing from front index ${idx}`],
      [3, [], 'Updating front pointer']
    ]);
    
    animation.reset();
    animation.play(trace);
    
    setTimeout(() => {
      setArr(prev => {
        const next = prev.slice();
        next[idx] = '';
        return next;
      });
      setFront(f => (f + 1) % cap);
      setSize(s => s - 1);
      setStatus(`Dequeued "${val}" from index ${idx}`);
    }, 380);
  };

  const onPeek = () => {
    if (isEmpty()) {
      setStatus('Peek: empty queue');
      const trace = buildTrace('front', [
        [1, [], 'Checking if queue is empty...'],
        [2, [], 'Queue is empty']
      ]);
      animation.reset();
      animation.play(trace);
      return;
    }
    
    const trace = buildTrace('front', [
      [1, [], 'Checking if queue is empty...'],
      [2, [front], `Front element: "${arr[front]}" at index ${front}`]
    ]);
    animation.reset();
    animation.play(trace);
    setStatus(`Front = "${arr[front]}" at index ${front}`);
  };

  const onIsEmpty = () => {
    const result = isEmpty();
    const trace = buildTrace('isempty', [
      [1, [], `Checking size: ${size}`],
      [2, [], `isEmpty = ${result}`]
    ]);
    animation.reset();
    animation.play(trace);
    setStatus(result ? 'isEmpty → true' : 'isEmpty → false');
  };

  const onIsFull = () => {
    const result = isFull();
    const trace = buildTrace('isfull', [
      [1, [], `Checking size: ${size}, capacity: ${cap}`],
      [2, [], `isFull = ${result}`]
    ]);
    animation.reset();
    animation.play(trace);
    setStatus(result ? 'isFull → true' : 'isFull → false');
  };

  const onClear = () => {
    resetAll(cap);
    setStatus('Cleared queue');
  };

  const onSeed = () => {
    const seq = ['A', 'B', 'C'];
    const N = Math.max(cap, seq.length);
    resetAll(N);
    const base = Array(N).fill('');
    for (let k = 0; k < seq.length; k++) base[k] = seq[k];
    setArr(base);
    setSize(seq.length);
    setFront(0);
    setStatus('Seeded [A, B, C]');
  };
  
  const resetAnimation = () => {
    animation.reset();
    setHighlightedCells(new Set());
    setHighlightedLines(new Set());
    setStatus('Animation reset');
  };

  const btn = "rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black active:scale-[.98] cursor-pointer transition-all";
  const btnStrong = "rounded-xl px-4 py-2 text-sm font-semibold text-black bg-emerald-500 hover:bg-emerald-600 active:scale-[.98] cursor-pointer transition-all shadow-lg shadow-emerald-500/30";

  const controls = (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      {/* input + enqueue */}
      <div className="lg:col-span-5 order-1 flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onEnqueue()}
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
          <input 
            type="number" 
            min={2} 
            max={20} 
            value={cap} 
            onChange={(e) => resetAll(+e.target.value)} 
            className="w-20 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400" 
          />
        </div>
        <button onClick={onSeed} className={btn}>Seed</button>
        <button onClick={onClear} className={btn}>Clear</button>
      </div>
    </div>
  );

  const visualizer = (
    <QueueTray
      arr={arr}
      cap={cap}
      front={front}
      size={size}
      highlightedCells={highlightedCells}
    />
  );

  return (
    <VisualizationLayout
      title="Queue (Circular Array)"
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
      onReset={resetAnimation}
      embedded={embedded}
    />
  );
}

function QueueTray({ arr, cap, front, size, highlightedCells }) {
  const last = size ? (front + size - 1) % cap : null;
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="relative rounded-2xl border border-emerald-500/30 bg-black/20 p-3 shadow-[inset_0_0_40px_rgba(16,185,129,0.15)]">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cap}, minmax(56px, 1fr))` }}>
          {arr.map((v, i) => {
            const active = highlightedCells.has(`i-${i}`);
            const isFront = size > 0 && i === front;
            const isRearSlot = i === ((front + size) % cap) && size < cap;
            const isLast = size > 0 && i === last;
            return (
              <div 
                key={i} 
                className={`relative m-[6px] h-16 rounded-xl border flex items-center justify-center font-bold transition-all ${
                  active 
                    ? 'bg-black border-emerald-400 shadow-[0_0_0_2px_#10B98188_inset] text-white' 
                    : v !== '' 
                      ? 'bg-emerald-500/80 border-emerald-400/60 text-black' 
                      : 'bg-white/5 border-emerald-500/10 text-white/60'
                }`}
              >
                <span>{String(v)}</span>
                {isFront && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-emerald-500/90 px-2 text-[10px] font-semibold text-black ring-1 ring-emerald-800">
                    FRONT
                  </span>
                )}
                {isLast && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded bg-emerald-500/90 px-2 text-[10px] font-semibold text-black ring-1 ring-emerald-800">
                    REAR
                  </span>
                )}
                {isRearSlot && !v && (
                  <span className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/70 pointer-events-none" />
                )}
                <span className="pointer-events-none absolute left-2 top-1 rounded bg-black/40 px-1 text-[10px] text-white/60">
                  {i}
                </span>
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


