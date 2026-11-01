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

    // 5 to 7 full fast rotations + delta
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const targetRotation = thetaStart + fullSpins * 360 + delta;

    return {
      thetaStart,
      targetRotation,
      succeeded,
    };
  }, [successDegrees]);

  const [currentRotation, setCurrentRotation] = useState<number>(spinPlan.thetaStart);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [hasLanded, setHasLanded] = useState<boolean>(false);
  const audioIntervalRef = useRef<number | null>(null);

  // Start spinning on mount
  useEffect(() => {
    // Tiny timeout to allow initial render at thetaStart before triggering transition
    const startTimer = window.setTimeout(() => {
      setIsSpinning(true);
      setCurrentRotation(spinPlan.targetRotation);

      // Audio ticks during spin
      let tickCount = 0;
      const maxTicks = 18;
      const tick = () => {
        if (tickCount < maxTicks) {
          soundEngine.playKeystroke(settings);
          tickCount++;
          // Progressive slowdown for mechanical wheel ticks
          const delay = 60 + Math.pow(tickCount, 2.1) * 6;
          audioIntervalRef.current = window.setTimeout(tick, delay);
        }
      };
      tick();
    }, 60);

    // Landing timer matching the 3.4s CSS transition
    const landTimer = window.setTimeout(() => {
      setIsSpinning(false);
      setHasLanded(true);

      if (audioIntervalRef.current) {
        clearTimeout(audioIntervalRef.current);
      }

      if (spinPlan.succeeded) {
        soundEngine.playConfirm(settings);
        triggerParticles?.('.mystery-wheel-stage', ['#10b981', '#ffd166', '#3b82f6', '#f59e0b']);
      } else {
        soundEngine.playError(settings);
        triggerParticles?.('.mystery-wheel-stage', ['#ef4444', '#b91c1c', '#7f1d1d']);
      }

      // Short delay so the player can witness where the needle landed before outcome appears
      window.setTimeout(() => {
        onSpinComplete(spinPlan.succeeded);
      }, 750);
    }, 3460);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(landTimer);
      if (audioIntervalRef.current) clearTimeout(audioIntervalRef.current);
    };
  }, [spinPlan, settings, onSpinComplete, triggerParticles]);

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
        <div className={`mystery-wheel-pointer-wrapper ${isSpinning ? 'pointer-ticking' : ''}`}>
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
            transform: `rotate(${currentRotation}deg)`,
            transition: isSpinning ? 'transform 3.4s cubic-bezier(0.15, 0.85, 0.35, 1)' : 'none',
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
            {spinPlan.succeeded
              ? `✨ ROLL SUCCEEDED! (${chance}% Chance)`
              : `💥 ROLL FAILED (${100 - chance}% Risk)`}
          </span>
        )}
      </div>
    </div>
  );
};
