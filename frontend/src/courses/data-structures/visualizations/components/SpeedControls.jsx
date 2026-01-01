/**
 * Speed Controls Component
 * Provides speed multiplier buttons (0.5x, 1x, 2x, 4x) for animations
 */

import React from 'react';

const SPEED_OPTIONS = [
  { label: '0.5×', value: 0.5, tooltip: 'Half speed (slow)' },
  { label: '1×', value: 1, tooltip: 'Normal speed' },
  { label: '2×', value: 2, tooltip: 'Double speed' },
  { label: '4×', value: 4, tooltip: 'Quad speed' },
];

export function SpeedControls({ speedMultiplier, setSpeedMultiplier, disabled }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/60 mr-1">Speed:</span>
      <div className="flex gap-1 rounded-lg bg-black/30 p-1 ring-1 ring-emerald-500/20">
        {SPEED_OPTIONS.map(({ label, value, tooltip }) => (
          <button
            key={value}
            onClick={() => setSpeedMultiplier(value)}
            disabled={disabled}
            title={tooltip}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-bold transition-all
              ${speedMultiplier === value
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-black shadow-lg border border-emerald-400'
                : 'bg-gradient-to-br from-gray-800 to-gray-900 text-white/80 hover:from-emerald-600 hover:to-emerald-700 hover:text-black border border-gray-700 hover:border-emerald-500'
              }
              ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
