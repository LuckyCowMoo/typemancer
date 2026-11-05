/**
 * Shared geometry & path math for rendering inky roads and winding text
 * on both the main procedural map and the tutorial interactive mini-map.
 */

export interface InkyAndTextPaths {
  linePath: string;
  aboveGuidePath: string;
  belowGuidePath: string;
  startOffsetPct: string;
  segmentLen: number;
}

export function buildInkyAndTextPaths(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
  colDiff: number
): InkyAndTextPaths {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const segmentLen = Math.max(120, Math.hypot(dx, dy));

  const sway = colDiff !== 0 ? colDiff * 36 : ((seed % 11) - 5) * 3;
  const cx1 = x1 + dx * 0.28 + sway;
  const cy1 = y1 + dy * 0.32;
  const cx2 = x1 + dx * 0.72 + sway * 0.5;
  const cy2 = y1 + dy * 0.68;
  const linePath = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

  // Extend guide path endpoints 15% beyond (x1, y1) and (x2, y2) so <textPath> never clips
  const ex1 = x1 - dx * 0.15;
  const ey1 = y1 - dy * 0.15;
  const ex2 = x2 + dx * 0.15;
  const ey2 = y2 + dy * 0.15;

  const isLeftToRight = x1 <= x2 + 65;

  let gx1: number,
    gy1: number,
    gcx1: number,
    gcy1: number,
    gcx2: number,
    gcy2: number,
    gx2: number,
    gy2: number;
  let gdx: number, gdy: number;
  let startOffsetPct: string;

  if (isLeftToRight) {
    gx1 = ex1;
    gy1 = ey1;
    gcx1 = cx1;
    gcy1 = cy1;
    gcx2 = cx2;
    gcy2 = cy2;
    gx2 = ex2;
    gy2 = ey2;
    gdx = ex2 - ex1;
    gdy = ey2 - ey1;
    startOffsetPct = '54%';
  } else {
    gx1 = ex2;
    gy1 = ey2;
    gcx1 = cx2;
    gcy1 = cy2;
    gcx2 = cx1;
    gcy2 = cy1;
    gx2 = ex1;
    gy2 = ey1;
    gdx = ex1 - ex2;
    gdy = ey1 - ey2;
    startOffsetPct = '46%';
  }

  const glen = Math.max(1, Math.hypot(gdx, gdy));
  const ux = gdx / glen;
  const uy = gdy / glen;

  const aboveDx = uy * 13;
  const aboveDy = -ux * 13;
  const belowDx = -uy * 16;
  const belowDy = ux * 16;

  const aboveGuidePath = `M ${gx1 + aboveDx} ${gy1 + aboveDy} C ${gcx1 + aboveDx} ${
    gcy1 + aboveDy
  }, ${gcx2 + aboveDx} ${gcy2 + aboveDy}, ${gx2 + aboveDx} ${gy2 + aboveDy}`;
  const belowGuidePath = `M ${gx1 + belowDx} ${gy1 + belowDy} C ${gcx1 + belowDx} ${
    gcy1 + belowDy
  }, ${gcx2 + belowDx} ${gcy2 + belowDy}, ${gx2 + belowDx} ${gy2 + belowDy}`;

  return {
    linePath,
    aboveGuidePath,
    belowGuidePath,
    startOffsetPct,
    segmentLen,
  };
}

/**
 * Splits a longer phrase evenly across two rows so each line remains readable without clipping.
 */
export function splitPhraseForRoad(phrase: string): {
  topLine: string;
  bottomLine: string | null;
} {
  const trimmed = phrase.trim();
  // If the phrase has a comma transition (e.g. between direction and destination), split on the comma!
  if (trimmed.includes(',')) {
    const commaIdx = trimmed.indexOf(',');
    const leftPart = trimmed.slice(0, commaIdx + 1).trim();
    const rightPart = trimmed.slice(commaIdx + 1).trim();
    if (leftPart && rightPart) {
      return {
        topLine: leftPart,
        bottomLine: rightPart,
      };
    }
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return { topLine: trimmed, bottomLine: null };
  }
  if (words.length <= 2 && trimmed.length <= 16) {
    return { topLine: trimmed, bottomLine: null };
  }
  let bestIdx = 1;
  let minDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const left = words.slice(0, i).join(' ');
    const right = words.slice(i).join(' ');
    const diff = Math.abs(left.length - right.length);
    if (diff < minDiff) {
      minDiff = diff;
      bestIdx = i;
    }
  }
  return {
    topLine: words.slice(0, bestIdx).join(' '),
    bottomLine: words.slice(bestIdx).join(' '),
  };
}

export function getFittedRoadTextProps(
  lineText: string,
  segmentLen: number,
  isEnterReady: boolean
): { fontSize: string } {
  const usableLen = segmentLen * 0.72;
  const charCount = Math.max(5, lineText.length);
  const naturalSize = usableLen / (charCount * 0.56);
  const baseFontSize = Math.max(11, Math.min(14.5, naturalSize));
  const fontSize = isEnterReady ? Math.min(16, baseFontSize * 1.1) : baseFontSize;

  return {
    fontSize: `${fontSize.toFixed(1)}px`,
  };
}
