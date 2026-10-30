import React, { useEffect, useMemo, useRef } from 'react';
import type { Difficulty, MapNode, MapNodeType, PhraseDifficulty } from '../types/game';
import { evaluateCandidates } from '../utils/typingEngine';

interface ScrollableMapProps {
  mapFloors: MapNode[][];
  currentFloor: number;
  currentNodeId: string | null;
  availableNodes: MapNode[];
  typedInput: string;
  difficulty: Difficulty;
  phraseDiff: PhraseDifficulty;
  scrollOffset: number;
  setScrollOffset: React.Dispatch<React.SetStateAction<number>>;
}

const NODE_ICON_MAP: Record<MapNodeType, string> = {
  battle: './assets/map-icons/battle.svg',
  elite: './assets/map-icons/elite.svg',
  campfire: './assets/map-icons/campfire.svg',
  merchant: './assets/map-icons/merchant.svg',
  treasure: './assets/map-icons/treasure.svg',
  mystery: './assets/map-icons/mystery.svg',
  boss: './assets/map-icons/boss.svg',
};

const ROW_HEIGHT = 118;
const MAP_WIDTH = 860;

/**
 * Computes deterministic x/y coordinates for a node on the 24-floor parchment map,
 * ordered with Floor 24 (The Boss) at the top and Floor 1 at the bottom so the player climbs upward!
 */
function getNodePosition(node: MapNode, rowLength: number): { x: number; y: number } {
  const totalFloors = 24;
  // Row 24 is at top (y = 80), Row 1 is at bottom
  const invertedRow = totalFloors - node.floor;
  const y = 85 + invertedRow * ROW_HEIGHT;

  // Deterministic organic jitter based on floor and column
  const seed = (node.floor * 37 + node.column * 73) % 29;
  const jitterX = (seed - 14) * 2.2;
  const jitterY = ((seed % 11) - 5) * 1.8;

  if (rowLength === 1) {
    return { x: MAP_WIDTH / 2 + jitterX, y: y + jitterY };
  }
  if (rowLength === 2) {
    const base = node.column === 0 ? MAP_WIDTH * 0.32 : MAP_WIDTH * 0.68;
    return { x: base + jitterX, y: y + jitterY };
  }
  const base =
    node.column === 0
      ? MAP_WIDTH * 0.22
      : node.column === 1
      ? MAP_WIDTH * 0.5
      : MAP_WIDTH * 0.78;
  return { x: base + jitterX, y: y + jitterY };
}

/**
 * Generates an organic, slightly curved SVG cubic bezier path ("procedural inky line")
 * connecting two map nodes.
 */
function buildInkyPath(x1: number, y1: number, x2: number, y2: number, seed: number): string {
  const midY = (y1 + y2) / 2;
  const curveOffset = ((seed % 17) - 8) * 3.5;
  const cx1 = x1 + (x2 - x1) * 0.25 + curveOffset;
  const cy1 = midY + 12;
  const cx2 = x1 + (x2 - x1) * 0.75 - curveOffset;
  const cy2 = midY - 12;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

export const ScrollableMap: React.FC<ScrollableMapProps> = ({
  mapFloors,
  currentFloor,
  currentNodeId,
  availableNodes,
  typedInput,
  difficulty,
  phraseDiff,
  scrollOffset,
  setScrollOffset,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const totalHeight = 24 * ROW_HEIGHT + 160;

  // Center view on currentFloor whenever floor changes
  useEffect(() => {
    const invertedRow = 24 - currentFloor;
    const targetY = 85 + invertedRow * ROW_HEIGHT;
    const viewHeight = containerRef.current?.clientHeight || 580;
    const idealScroll = Math.max(0, Math.min(totalHeight - viewHeight, targetY - viewHeight * 0.62));
    setScrollOffset(idealScroll);
  }, [currentFloor, setScrollOffset, totalHeight]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: scrollOffset,
        behavior: 'smooth',
      });
    }
  }, [scrollOffset]);

  // Precompute all node positions by id
  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number; node: MapNode }>();
    mapFloors.forEach((row) => {
      row.forEach((node) => {
        const pos = getNodePosition(node, row.length);
        map.set(node.id, { ...pos, node });
      });
    });
    return map;
  }, [mapFloors]);

  const availableIdSet = useMemo(
    () => new Set(availableNodes.map((n) => n.id)),
    [availableNodes]
  );

  // Evaluate which available node matches current typed input
  const highlightedIds = useMemo(() => {
    if (!typedInput.trim()) return new Set<string>();
    const evaluated = evaluateCandidates(
      typedInput,
      availableNodes.map((n) => ({ item: n, phrase: n.phrases[phraseDiff] })),
      difficulty
    );
    return new Set(evaluated.filter((e) => e.isPrefixMatch).map((e) => e.item.id));
  }, [availableNodes, difficulty, phraseDiff, typedInput]);

  return (
    <div className="scrollable-map-wrapper">
      <div className="map-scroll-hint">
        Use <code>Up/Down Arrows</code> or <code>PageUp/PageDown</code> to scroll the map
      </div>

      <div className="scrollable-map-viewport" ref={containerRef}>
        <div
          className="scrollable-map-canvas"
          style={{ width: `${MAP_WIDTH}px`, height: `${totalHeight}px` }}
        >
          {/* Procedural Inky SVG Connecting Paths */}
          <svg
            width={MAP_WIDTH}
            height={totalHeight}
            className="map-inky-svg"
          >
            <defs>
              <filter id="ink-roughness">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.04"
                  numOctaves="2"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="2.2"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>

            {mapFloors.map((row) =>
              row.map((node) => {
                const fromPos = nodePositions.get(node.id);
                if (!fromPos) return null;

                return node.nextNodeIds.map((nextId, idx) => {
                  const toPos = nodePositions.get(nextId);
                  if (!toPos) return null;

                  const isTakenEdge =
                    node.completed && (toPos.node.completed || availableIdSet.has(nextId));
                  const isActiveChoiceEdge =
                    node.id === currentNodeId && availableIdSet.has(nextId);

                  const pathData = buildInkyPath(
                    fromPos.x,
                    fromPos.y,
                    toPos.x,
                    toPos.y,
                    node.floor * 13 + idx * 7
                  );

                  return (
                    <path
                      key={`${node.id}->${nextId}`}
                      d={pathData}
                      fill="none"
                      stroke={
                        isActiveChoiceEdge
                          ? '#bc5215'
                          : isTakenEdge
                          ? '#102a3a'
                          : 'rgba(16, 42, 58, 0.34)'
                      }
                      strokeWidth={isActiveChoiceEdge ? 4.2 : isTakenEdge ? 3.5 : 2.4}
                      strokeDasharray={isTakenEdge || isActiveChoiceEdge ? 'none' : '8 7'}
                      strokeLinecap="round"
                      filter="url(#ink-roughness)"
                    />
                  );
                });
              })
            )}
          </svg>

          {/* Render Floor Nodes */}
          {mapFloors.map((row) =>
            row.map((node) => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;

              const isAvailable = availableIdSet.has(node.id);
              const isHighlighted = highlightedIds.has(node.id);
              const isCompleted = node.completed;
              const isCurrent = node.id === currentNodeId;

              return (
                <div
                  key={node.id}
                  className={`map-node-pin ${isAvailable ? 'map-node-available' : ''} ${
                    isHighlighted ? 'map-node-highlighted' : ''
                  } ${isCompleted ? 'map-node-completed' : ''} ${
                    isCurrent ? 'map-node-current' : ''
                  }`}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                  }}
                >
                  <div className="map-node-circle">
                    <img
                      src={NODE_ICON_MAP[node.type]}
                      alt={node.type}
                      className="map-node-svg-icon"
                    />
                    <span className="map-node-floor-num">F{node.floor}</span>
                  </div>

                  {/* Show the required typing phrase on available next-step nodes */}
                  {isAvailable && (
                    <div className="map-node-phrase-banner">
                      "{node.phrases[phraseDiff]}"
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
