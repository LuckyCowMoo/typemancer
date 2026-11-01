import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';

export interface TypingConsoleDisplayProps {
  prefix?: React.ReactNode;
  typedInput: string;
  ghostAutocompleteSuffix?: string;
  className?: string;
}

/**
 * Typewriter Single-Line Console Display
 * - All text (prefix, typed text, cursor, and prompt ghost text) remains strictly on one line.
 * - Prompted ghost text gets slowly fainter the further it gets from the cursor.
 * - When the typed text exceeds the stationary anchor point (~42% of the container width),
 *   the text scrolls to the left so the cursor remains completely stationary in place.
 * - Text scrolling off the left edge has a sharp fade before the left edge.
 */
export const TypingConsoleDisplay: React.FC<TypingConsoleDisplayProps> = ({
  prefix,
  typedInput,
  ghostAutocompleteSuffix,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [hasScrolledLeft, setHasScrolledLeft] = useState<boolean>(false);

  const updateScroll = () => {
    const container = containerRef.current;
    const caret = caretRef.current;
    if (!container || !caret) return;

    const containerWidth = container.clientWidth;
    if (containerWidth <= 0) return;

    // Stationary anchor point: 42% of visible container width
    const anchorX = Math.round(containerWidth * 0.42);

    // Untransformed offset of caret relative to track left edge
    const caretOffset = caret.offsetLeft;

    if (caretOffset > anchorX) {
      setScrollOffset(caretOffset - anchorX);
      setHasScrolledLeft(true);
    } else {
      setScrollOffset(0);
      setHasScrolledLeft(false);
    }
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
          transform: `translateX(-${scrollOffset}px)`,
        }}
      >
        {prefix && <span className="typing-sentence-prefix">{prefix}</span>}
        <span className="sentence-typed-text">{typedInput}</span>
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
