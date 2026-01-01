/**
 * Stack Visualization - Refactored & Optimized
 * LIFO data structure with professional animations
 */

import React, { useState } from 'react';
import { VisualizationLayout } from './components/VisualizationLayout';
import { useAnimationEngine } from './hooks/useAnimationEngine';
import { stackOperations } from './utils/dataStructureOperations';

export default function StackVisualization({ embedded = false }) {
  // Stack state
  const [stack, setStack] = useState([]);
  const [capacity, setCapacity] = useState(6);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('Ready. Push values to the stack.');
  
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

  // Helper functions
  const isEmpty = () => stack.length === 0;
  const isFull = () => stack.length >= capacity;
  const top = () => isEmpty() ? null : stack[stack.length - 1];

  const resetAnimation = () => {
    setTrace([]);
    animation.reset();
    setAlgorithmType(null);
    setHighlightedCells(new Set());
    setHighlightedLines(new Set());
  };

  // Stack operations
  const handlePush = () => {
    if (value === '') {
      setStatus('Enter a value before pushing');
      return;
    }
    
    if (isFull()) {
      setStatus('Overflow: stack is full!');
      setAlgorithmType('push');
      setTrace(stackOperations.generatePushTrace(value, stack.length, capacity));
      animation.reset();
      animation.play();
      return;
    }
    
    setAlgorithmType('push');
    setTrace(stackOperations.generatePushTrace(value, stack.length, capacity));
    animation.reset();
    animation.play();
    
    setTimeout(() => {
      setStack(prev => [...prev, value]);
      setValue('');
    }, 380);
  };

  const handlePop = () => {
    const topValue = top();
    
    if (isEmpty()) {
      setStatus('Underflow: stack is empty!');
      setAlgorithmType('pop');
      setTrace(stackOperations.generatePopTrace(0, null));
      animation.reset();
      animation.play();
      return;
    }
    
    setAlgorithmType('pop');
    setTrace(stackOperations.generatePopTrace(stack.length, topValue));
    animation.reset();
    animation.play();
    
    setTimeout(() => {
      setStack(prev => prev.slice(0, -1));
    }, 380);
  };

  const handlePeek = () => {
    setAlgorithmType('peek');
    setTrace(stackOperations.generatePeekTrace(stack.length, top()));
    animation.reset();
    animation.play();
  };

  const handleIsEmpty = () => {
    setAlgorithmType('isempty');
    setTrace(stackOperations.generateIsEmptyTrace(stack.length));
    animation.reset();
    animation.play();
  };

  const handleIsFull = () => {
    setAlgorithmType('isfull');
    setTrace(stackOperations.generateIsFullTrace(stack.length, capacity));
    animation.reset();
    animation.play();
  };

  const handleClear = () => {
    setStack([]);
    setStatus('Stack cleared');
    resetAnimation();
  };

  const handleSeed = () => {
    const seeds = ['A', 'B', 'C'];
    if (capacity < seeds.length) setCapacity(seeds.length);
    setStack(seeds);
    setStatus('Seeded with [A, B, C]');
    resetAnimation();
  };

  const handleCapacityChange = (newCap) => {
    const cap = Math.max(1, Math.min(24, newCap));
    setCapacity(cap);
    if (stack.length > cap) {
      setStack(prev => prev.slice(0, cap));
    }
  };

  // Controls component
  const controls = (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Input + Push */}
        <div className="lg:col-span-6 flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePush()}
            placeholder="Enter a value"
            className="flex-1 rounded-lg bg-white/5 px-2 py-1 ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400"
          />
          <button onClick={handlePush} className="btn-strong">Push</button>
        </div>

        {/* Operations */}
        <div className="lg:col-span-3 flex flex-wrap items-center gap-2">
          <button onClick={handlePop} className="btn">Pop</button>
          <button onClick={handlePeek} className="btn">Peek</button>
          <button onClick={handleIsEmpty} className="btn">isEmpty</button>
          <button onClick={handleIsFull} className="btn">isFull</button>
        </div>

        {/* Capacity + Actions */}
        <div className="lg:col-span-3 flex items-center justify-end gap-2">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>Capacity</span>
            <input
              type="number"
              min={1}
              max={24}
              value={capacity}
              onChange={(e) => handleCapacityChange(+e.target.value)}
              className="w-20 rounded-lg bg-white/5 px-2 py-1 text-right ring-1 ring-emerald-500/20 focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <button onClick={handleSeed} className="btn">Seed</button>
          <button onClick={handleClear} className="btn">Clear</button>
        </div>
      </div>

      {/* Stack Info */}
      <div className="mt-3 flex items-center gap-4 text-xs text-white/60">
        <span>Size: <strong className="text-emerald-400">{stack.length}</strong> / {capacity}</span>
        <span>Status: <strong className={stack.length === 0 ? 'text-yellow-400' : stack.length === capacity ? 'text-red-400' : 'text-emerald-400'}>
          {stack.length === 0 ? 'Empty' : stack.length === capacity ? 'Full' : 'Ready'}
        </strong></span>
      </div>
    </>
  );

  // Visualizer component
  const visualizer = (
    <StackVisualizer
      stack={stack}
      capacity={capacity}
      highlightedCells={highlightedCells}
    />
  );

  return (
    <>
      <style>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: white;
          background: linear-gradient(135deg, #064E3B 0%, #065F46 100%);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .btn:hover {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          border-color: rgba(16, 185, 129, 0.6);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          transform: translateY(-1px);
        }
        .btn:active {
          transform: translateY(0) scale(0.98);
        }
        .btn-strong {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: black;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        .btn-strong:hover {
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          color: #10B981;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6);
          transform: translateY(-2px);
        }
        .btn-strong:active {
          transform: translateY(0) scale(0.98);
        }
        input[type="number"],
        input[type="text"] {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(6, 78, 59, 0.3) 100%);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 0.75rem;
          outline: none;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          pointer-events: auto;
          cursor: text;
          user-select: text;
          -webkit-user-select: text;
        }
        input[type="number"]:focus,
        input[type="text"]:focus {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(6, 78, 59, 0.5) 100%);
          border-color: rgba(16, 185, 129, 0.6);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        input[type="number"]:hover,
        input[type="text"]:hover {
          border-color: rgba(16, 185, 129, 0.5);
        }
        input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        @keyframes stackItemEnter {
          from {
            transform: translateY(-20px) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .stack-item-enter {
          animation: stackItemEnter 0.3s ease-out;
        }
      `}</style>
      
      <VisualizationLayout
        title="Stack Data Structure (LIFO)"
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
    </>
  );
}

// Stack Visualizer Component
function StackVisualizer({ stack, capacity, highlightedCells }) {
  const cells = Array.from({ length: capacity }, (_, i) => i);
  
  return (
    <div className="w-full flex justify-center items-center min-h-[500px]">
      <div className="relative w-64 h-[550px] rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-b from-black/40 to-black/20 p-3 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
        {/* Top label */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
          <span className="text-xs font-semibold text-emerald-400">TOP ↓</span>
          <span className="text-[10px] text-white/40">Capacity: {capacity}</span>
        </div>
        
        {/* Stack container */}
        <div className="absolute top-10 bottom-10 left-3 right-3 flex flex-col-reverse gap-2 overflow-hidden">
          {cells.map((idx) => {
            const isFilled = idx < stack.length;
            const value = isFilled ? stack[idx] : null;
            const isHighlighted = highlightedCells.has(`i-${idx}`);
            
            return (
              <div
                key={idx}
                className={`
                  h-12 rounded-xl flex items-center justify-center font-bold text-lg
                  transition-all duration-200
                  ${isFilled 
                    ? 'bg-emerald-500/90 ring-2 ring-emerald-400/70 text-black stack-item-enter' 
                    : 'bg-white/5 ring-1 ring-emerald-500/10 text-white/30'
                  }
                  ${isHighlighted && 'shadow-[0_0_20px_rgba(16,185,129,0.5)]'}
                `}
              >
                {value !== null ? value : '—'}
              </div>
            );
          })}
        </div>
        
        {/* Bottom label */}
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <span className="text-xs font-semibold text-emerald-400">BOTTOM</span>
        </div>
      </div>
    </div>
  );
}
