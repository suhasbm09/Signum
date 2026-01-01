/**
 * Animation Engine Hook
 * Uses requestAnimationFrame for smooth 60fps animations
 * Replaces setTimeout/setInterval for better performance
 */

import { useState, useRef, useEffect } from 'react';

export function useAnimationEngine({ trace, onStepChange, baseSpeed = 450 }) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 0.5x, 1x, 2x, 4x
  
  const animationRef = useRef(null);
  const lastFrameTime = useRef(0);
  
  const actualSpeed = baseSpeed / speedMultiplier;

  useEffect(() => {
    if (!isPlaying || !trace.length) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - lastTime;

      if (elapsed >= actualSpeed) {
        setStep((prevStep) => {
          const nextStep = prevStep + 1;
          if (nextStep >= trace.length) {
            setIsPlaying(false);
            return prevStep;
          }
          if (onStepChange) onStepChange(nextStep);
          return nextStep;
        });
        lastTime = currentTime;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, trace.length, actualSpeed, onStepChange]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const toggle = () => setIsPlaying(p => !p);
  const reset = () => {
    setStep(0);
    setIsPlaying(false);
  };
  const goToStep = (newStep) => {
    setStep(Math.max(0, Math.min(trace.length - 1, newStep)));
  };

  return {
    step,
    isPlaying,
    speedMultiplier,
    setSpeedMultiplier,
    play,
    pause,
    toggle,
    reset,
    goToStep,
    nextStep: () => goToStep(step + 1),
    prevStep: () => goToStep(step - 1),
  };
}
