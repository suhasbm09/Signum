/**
 * Visualization Layout Component
 * Provides consistent 75% viz | 25% pseudocode layout across all visualizations
 * Responsive: stacks on mobile with collapsible pseudocode drawer
 */

import React, { useState, useEffect } from 'react';
import { PseudocodePanel } from './PseudocodePanel';
import { SpeedControls } from './SpeedControls';

export function VisualizationLayout({
  title,
  children: _children,
  controls,
  visualizer,
  algorithmType,
  highlightedLines,
  status,
  trace,
  currentStep,
  animationControls,
  onNext,
  onPrev,
  onReset,
  embedded = false,
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} w-full bg-[#060807] text-white`}>
      <div className={`mx-auto max-w-[1920px] ${embedded ? 'px-0 py-2' : 'px-4 py-6 lg:py-8'}`}>
        {/* Header */}
        {!embedded && (
          <header className="mb-4 flex items-center justify-between">
            <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight text-emerald-400 drop-shadow">
              {title}
            </h1>
            <span className="text-xs text-emerald-300/80">Interactive Algorithm Demonstration</span>
          </header>
        )}

        {/* Controls Panel */}
        <section className="rounded-2xl border border-emerald-500/10 bg-[#0A0F0E] p-3 lg:p-4 shadow-[0_0_40px_-18px_#10B981] mb-4">
          {controls}
          
          {/* Status Bar */}
          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-sm text-emerald-200/90 flex-1">{status}</p>
            {animationControls && (
              <SpeedControls
                speedMultiplier={animationControls.speedMultiplier}
                setSpeedMultiplier={animationControls.setSpeedMultiplier}
                disabled={!trace || trace.length === 0}
              />
            )}
          </div>
        </section>

        {/* Main Content: 75% Viz | 25% Code */}
        <section className="flex gap-4">
          {/* Visualizer (75%) */}
          <div className={`${isMobile ? 'w-full' : 'w-[75%]'} flex-shrink-0`}>
            <div className="rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-4 lg:p-5 overflow-x-auto">
              {visualizer}
            </div>

            {/* Trace Controls (below visualizer on mobile) */}
            {trace && trace.length > 0 && (
              <div className="mt-4 rounded-2xl border border-emerald-500/10 bg-[#0B0F0E] p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={onPrev}
                    disabled={currentStep === 0}
                    className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>
                  
                  <button
                    onClick={animationControls?.toggle}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    {animationControls?.isPlaying ? '⏸ Pause' : '▶ Play'}
                  </button>
                  
                  <button
                    onClick={onNext}
                    disabled={currentStep >= trace.length - 1}
                    className="rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                  
                  <span className="ml-2 text-xs text-white/70">
                    Step {currentStep + 1} / {trace.length}
                  </span>
                  
                  <button
                    onClick={onReset}
                    className="ml-auto rounded-xl px-3 py-2 text-sm text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black"
                  >
                    Reset
                  </button>
                </div>
                
                {/* Current Step Message */}
                <div className="mt-3 rounded-lg bg-black/30 p-3 text-sm ring-1 ring-emerald-500/10">
                  {trace[currentStep]?.msg || 'Ready'}
                </div>
              </div>
            )}
          </div>

          {/* Pseudocode Panel (25%) */}
          {!isMobile && (
            <div className="w-[25%] flex-shrink-0">
              <PseudocodePanel
                algorithmType={algorithmType}
                highlightedLines={highlightedLines}
                isMobile={false}
              />
            </div>
          )}
        </section>

        {/* Mobile Pseudocode Drawer */}
        {isMobile && (
          <PseudocodePanel
            algorithmType={algorithmType}
            highlightedLines={highlightedLines}
            isMobile={true}
          />
        )}
      </div>
    </div>
  );
}
