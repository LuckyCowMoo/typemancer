import React, { useEffect, useState, useMemo, useRef } from 'react';
import { soundEngine } from '../utils/soundEngine';
import type { GameSettings } from '../types/game';

export interface MysteryChanceWheelProps {
  chance: number; // e.g. 65 for 65% success
  choiceText: string;
  settings: GameSettings;
  onSpinComplete: (succeeded: boolean) => void;
  triggerParticles?: (selector: string | undefined, colors: string[]) => void;
}

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + r * Math.sin(angleInRadians),
    y: cy - r * Math.cos(angleInRadians),
  };
}

function describeSectorPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const p1 = polarToCartesian(cx, cy, r, startAngle);
  const p2 = polarToCartesian(cx, cy, r, endAngle);
  const sweep = (endAngle - startAngle + 360) % 360;
  const largeArcFlag = sweep > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`;
}

export const MysteryChanceWheel: React.FC<MysteryChanceWheelProps> = ({
  chance,
  choiceText,
  settings,
  onSpinComplete,
  triggerParticles,
}) => {
  const cx = 140;
  const cy = 140;
  const r = 106;

  // 1. Calculate sector angles
  const successDegrees = useMemo(() => Math.max(5, Math.min(355, (chance / 100) * 360)), [chance]);
  const failDegrees = 360 - successDegrees;

  // 2. Pre-calculate true random spin physics on mount
  const spinPlan = useMemo(() => {
    // Random starting orientation
    const thetaStart = Math.random() * 360;

    // Pick uniform random angle on wheel that lands under pointer
    const rand = Math.random();
    const phiTarget = rand * 360;

    // Succeeded if target angle falls within the success slice [0, successDegrees)
    const succeeded = phiTarget < successDegrees;

    // The wheel rotates clockwise. At rest, pointer at top (0 deg) points to:
    // (360 - (totalRotation % 360)) % 360 = phiTarget
    // => totalRotation % 360 = (360 - phiTarget) % 360
    const thetaFinalNorm = (360 - phiTarget) % 360;
    let delta = (thetaFinalNorm - (thetaStart % 360)) % 360;
    if (delta < 0) delta += 360;

    // 8 to 10 full smooth rotations + delta for longer, less resistant spin
    const fullSpins = 8 + Math.floor(Math.random() * 3);
    const targetRotation = thetaStart + fullSpins * 360 + delta;

    return {
      thetaStart,
      targetRotation,
      succeeded,
    };
  }, [successDegrees]);

  const [currentRotation, setCurrentRotation] = useState<number>(spinPlan.thetaStart);
  const [pointerAngle, setPointerAngle] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [hasLanded, setHasLanded] = useState<boolean>(false);

  const rafRef = useRef<number | null>(null);
  const completeTimerRef = useRef<number | null>(null);
  const hasStartedRef = useRef<boolean>(false);

  const onSpinCompleteRef = useRef(onSpinComplete);
  onSpinCompleteRef.current = onSpinComplete;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Start smooth physics spin on mount
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const SPIN_DURATION = 6200; // 6.2s smooth decelerating spin with lower resistance
    let startTime: number | null = null;
    let lastKnobIndex = Math.floor(spinPlan.thetaStart / 22.5);

    setIsSpinning(true);

    const step = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(1, Math.max(0, elapsed / SPIN_DURATION));

      // Ease-out polynomial: 1 - (1 - p)^3.4 (gradual, suspenseful deceleration)
      const ease = 1 - Math.pow(1 - progress, 3.4);
      const totalDelta = spinPlan.targetRotation - spinPlan.thetaStart;
      const rot = spinPlan.thetaStart + totalDelta * ease;

      // Knob crossing detection (knobs spaced every 22.5 deg along the rim)
      const currentKnobIndex = Math.floor(rot / 22.5);
      if (currentKnobIndex > lastKnobIndex) {
        soundEngine.playWheelTick(settingsRef.current);
        lastKnobIndex = currentKnobIndex;
      }

      // Pointer deflection physics:
      // Inside each 22.5 deg sector, as knob approaches (offset 14.5 to 22.5 deg),
      // the pointer deflects clockwise up to 14 deg, then snaps back as knob slips past.
      const subAngle = rot % 22.5;
      let needleDeflection = 0;
      if (subAngle >= 14.5) {
        needleDeflection = ((subAngle - 14.5) / 8.0) * 14;
      } else if (subAngle < 4.0) {
        needleDeflection = (1 - subAngle / 4.0) * -3;
      }

      setCurrentRotation(rot);
      setPointerAngle(needleDeflection);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        // Spin finished: lock precisely onto target rotation and zero out needle
        setCurrentRotation(spinPlan.targetRotation);
        setPointerAngle(0);
        setIsSpinning(false);
        setHasLanded(true);

        if (spinPlan.succeeded) {
          soundEngine.playConfirm(settingsRef.current);
          triggerParticles?.('.mystery-wheel-stage', ['#10b981', '#ffd166', '#3b82f6', '#f59e0b']);
        } else {
          soundEngine.playError(settingsRef.current);
          triggerParticles?.('.mystery-wheel-stage', ['#ef4444', '#b91c1c', '#7f1d1d']);
        }

        // Wait 3.2s on the stopped wheel before transitioning to the outcome screen
        completeTimerRef.current = window.setTimeout(() => {
          onSpinCompleteRef.current(spinPlan.succeeded);
        }, 3200);
      }
    };

    const startTimeout = window.setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, 80);

    return () => {
      clearTimeout(startTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, [spinPlan, triggerParticles]);

  // Sector mid-angles for text labels
  const midSuccess = successDegrees / 2;
  const midFail = successDegrees + failDegrees / 2;
  const pSuccess = polarToCartesian(cx, cy, r * 0.62, midSuccess);
  const pFail = polarToCartesian(cx, cy, r * 0.62, midFail);

  // Rivets along the wheel rim
  const rivets = useMemo(() => {
    const list: Array<{ x: number; y: number }> = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 360;
      list.push(polarToCartesian(cx, cy, r - 3, angle));
    }
    return list;
  }, [cx, cy, r]);

  return (
    <div className="mystery-wheel-container">
      <div className="mystery-wheel-header">
        <span className="mystery-wheel-title">Wheel of Fate — Gamble</span>
        <span className="mystery-wheel-subtitle">"{choiceText}"</span>
      </div>

      <div className="mystery-wheel-stage">
        {/* Stationary Pointer Needle at the Top */}
        <div
          className="mystery-wheel-pointer-wrapper"
          style={{
            transform: `translateX(-50%) rotate(${pointerAngle.toFixed(2)}deg)`,
            transformOrigin: '50% 10px',
          }}
        >
          <svg width="34" height="42" viewBox="0 0 34 42" className="mystery-wheel-pointer-svg">
            <polygon
              points="17,38 4,8 30,8"
              fill="#ffd166"
              stroke="#2b1e16"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="17" cy="10" r="7" fill="#bc5215" stroke="#2b1e16" strokeWidth="2" />
            <circle cx="17" cy="10" r="3" fill="#ffd166" />
          </svg>
        </div>

        {/* The Rotating Wheel */}
        <svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          className="mystery-wheel-svg"
          style={{
            transform: `rotate(${currentRotation.toFixed(2)}deg)`,
          }}
        >
          <defs>
            {/* Emerald Success Gradient */}
            <radialGradient id="wheelSuccessGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="85%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>

            {/* Crimson Fail Gradient */}
            <radialGradient id="wheelFailGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="85%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#b91c1c" />
            </radialGradient>

            {/* Brass Rim Gradient */}
            <linearGradient id="brassRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd166" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>
          </defs>

          {/* Outer Wheel Drop Shadow Ring */}
          <circle cx={cx} cy={cy} r={r + 6} fill="#2b1e16" />
          <circle cx={cx} cy={cy} r={r + 3} fill="url(#brassRimGrad)" />

          {/* Success Sector */}
          <path
            d={describeSectorPath(cx, cy, r, 0, successDegrees)}
            fill="url(#wheelSuccessGrad)"
            stroke="#1b120c"
            strokeWidth="2"
          />

          {/* Fail Sector */}
          <path
            d={describeSectorPath(cx, cy, r, successDegrees, 360)}
            fill="url(#wheelFailGrad)"
            stroke="#1b120c"
            strokeWidth="2"
          />

          {/* Success Sector Text */}
          <text
            x={pSuccess.x}
            y={pSuccess.y - 6}
            fill="#ffffff"
            fontWeight="900"
            fontSize="13px"
            textAnchor="middle"
            filter="drop-shadow(0 1.5px 2px rgba(0,0,0,0.8))"
          >
            SUCCESS
          </text>
          <text
            x={pSuccess.x}
            y={pSuccess.y + 11}
            fill="#d1fae5"
            fontWeight="800"
            fontSize="11.5px"
            textAnchor="middle"
            filter="drop-shadow(0 1.5px 2px rgba(0,0,0,0.8))"
          >
            {chance}%
          </text>

          {/* Fail Sector Text */}
          <text
            x={pFail.x}
            y={pFail.y - 6}
            fill="#ffffff"
            fontWeight="900"
            fontSize="13px"
            textAnchor="middle"
            filter="drop-shadow(0 1.5px 2px rgba(0,0,0,0.8))"
          >
            FAIL
          </text>
          <text
            x={pFail.x}
            y={pFail.y + 11}
            fill="#fee2e2"
            fontWeight="800"
            fontSize="11.5px"
            textAnchor="middle"
            filter="drop-shadow(0 1.5px 2px rgba(0,0,0,0.8))"
          >
            {100 - chance}%
          </text>

          {/* Sector Dividing Spokes */}
          <line
            x1={cx}
            y1={cy}
            x2={polarToCartesian(cx, cy, r, 0).x}
            y2={polarToCartesian(cx, cy, r, 0).y}
            stroke="#ffd166"
            strokeWidth="2.5"
          />
          <line
            x1={cx}
            y1={cy}
            x2={polarToCartesian(cx, cy, r, successDegrees).x}
            y2={polarToCartesian(cx, cy, r, successDegrees).y}
            stroke="#ffd166"
            strokeWidth="2.5"
          />

          {/* Outer Rim Rivets */}
          {rivets.map((rv, idx) => (
            <circle
              key={idx}
              cx={rv.x}
              cy={rv.y}
              r="2.5"
              fill="#ffd166"
              stroke="#2b1e16"
              strokeWidth="1"
            />
          ))}

          {/* Center Ornate Hub */}
          <circle cx={cx} cy={cy} r="26" fill="#2b1e16" />
          <circle cx={cx} cy={cy} r="22" fill="url(#brassRimGrad)" />
          <circle cx={cx} cy={cy} r="15" fill="#3a2518" stroke="#ffd166" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="5" fill="#ffd166" />
        </svg>
      </div>

      {/* Outcome Banner after landing */}
      <div className="mystery-wheel-status-row">
        {isSpinning && (
          <span className="mystery-wheel-badge badge-spinning">
            🎲 Spinning the Wheel of Fate...
          </span>
        )}
        {hasLanded && (
          <span
            className={`mystery-wheel-badge ${
              spinPlan.succeeded ? 'badge-success' : 'badge-failed'
            }`}
          >
            {spinPlan.succeeded ? '✨ SUCCESS!' : '💥 FAILED!'}
          </span>
        )}
      </div>
    </div>
  );
};
