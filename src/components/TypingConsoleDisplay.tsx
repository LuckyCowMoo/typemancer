import React, { useRef, useState, useLayoutEffect, useEffect, useMemo } from 'react';
import { analyzeTypingWithWordAnchors } from '../utils/typingEngine';

export interface TypingConsoleDisplayProps {
  prefix?: React.ReactNode;
  typedInput: string;
  ghostAutocompleteSuffix?: string;
  suggestedPhrase?: string;
  className?: string;
}

/**
 * Typewriter Single-Line Console Display
 * - All text (prefix, typed text, cursor, and prompt ghost text) remains strictly on one line.
 * - The cursor starts in the middle of the area (50% of visible container width).
 * - As text is typed, it stays centered, moving the cursor smoothly rightwards towards 80%.
 * - When the cursor reaches 80% of the way across to the right, it holds stationary,
 *   and excess typed text scrolls off to the left.
 * - Text scrolling off the left edge has a sharp fade before the left edge.
 * - Prompted ghost text gets slowly fainter the further it gets from the cursor.
 * - When suggestion is active, already-written letters are tinted slightly green or red,
 *   anchored word-by-word to prevent length cascading.
 */
export const TypingConsoleDisplay: React.FC<TypingConsoleDisplayProps> = ({
  prefix,
  typedInput,
  ghostAutocompleteSuffix,
  suggestedPhrase,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  const [trackTranslateX, setTrackTranslateX] = useState<number>(0);
  const [hasScrolledLeft, setHasScrolledLeft] = useState<boolean>(false);

  // Compute character-level correctness tints when a suggestion is active
  const analyzedChars = useMemo(() => {
    if (!suggestedPhrase || !ghostAutocompleteSuffix) {
      return typedInput.split('').map((char) => ({ char, status: 'neutral' as const }));
    }
    const { analyzedChars: chars } = analyzeTypingWithWordAnchors(typedInput, suggestedPhrase);
    return chars;
  }, [typedInput, suggestedPhrase, ghostAutocompleteSuffix]);

  const updateScroll = () => {
    const container = containerRef.current;
    const caret = caretRef.current;
    if (!container || !caret) return;

    const containerWidth = container.clientWidth;
    if (containerWidth <= 0) return;

    // Untransformed offset of caret relative to track left edge
    const caretOffset = caret.offsetLeft;

    const isModalEmbedded = className.includes('modal-embedded-input');
    if (isModalEmbedded) {
      // In modal footers, start inline (0px), scroll left if exceeding 80%
      const anchorX = Math.round(containerWidth * 0.8);
      if (caretOffset > anchorX) {
        setTrackTranslateX(anchorX - caretOffset);
        setHasScrolledLeft(true);
      } else {
        setTrackTranslateX(0);
        setHasScrolledLeft(false);
      }
      return;
    }

    // Main console typing:
    // Cursor starts in the middle of the area (50% of container width).
    // As typed text grows, it stays centered, advancing the cursor rightward until reaching 80%.
    // Once the cursor reaches 80% of the way across to the right, it holds stationary
    // and excess typed text scrolls off to the left.
    const anchorX = Math.round(containerWidth * 0.8);
    const targetCaretX = Math.min(anchorX, Math.round((containerWidth + caretOffset) / 2));
    const nextTranslateX = targetCaretX - caretOffset;

    setTrackTranslateX(nextTranslateX);
    // When text reaches or scrolls past the left edge, apply sharp left edge fade
    setHasScrolledLeft(nextTranslateX <= 16);
  };

  useLayoutEffect(() => {
    updateScroll();
  }, [typedInput, ghostAutocompleteSuffix, prefix]);

  useEffect(() => {
    const onResize = () => updateScroll();
    window.addEventListener('resize', onResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => updateScroll());
      ro.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`typing-sentence-display ${hasScrolledLeft ? 'scrolled-left' : ''} ${className}`.trim()}
    >
      <div
        ref={trackRef}
        className="typing-sentence-track"
        style={{
          transform: `translateX(${trackTranslateX}px)`,
        }}
      >
        {prefix && <span className="typing-sentence-prefix">{prefix}</span>}
        <span className="sentence-typed-text">
          {analyzedChars.map((item, idx) => (
            <span
              key={idx}
              className={`typed-char ${item.status === 'correct' ? 'char-correct' : item.status === 'incorrect' ? 'char-incorrect' : ''}`}
            >
              {item.char}
            </span>
          ))}
        </span>
        <span className="typing-caret" ref={caretRef} aria-hidden="true" />
        {ghostAutocompleteSuffix && (
          <span className="typing-ghost-autocomplete" aria-hidden="true">
            {ghostAutocompleteSuffix}
          </span>
        )}
      </div>
    </div>
  );
};
