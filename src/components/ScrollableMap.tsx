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

interface NodeStyleMeta {
  label: string;
  color: string;
  viewBox: string;
  pathD: string;
}

export const MAP_NODE_STYLES: Record<MapNodeType, NodeStyleMeta> = {
  battle: {
    label: 'Battle',
    color: '#9e2a2b',
    viewBox: '1.56 1.56 6.88 6.88',
    pathD:
      'M3.876 1.57c.846.257 2.524.912 2.524 2.073l-.249 2.07c-.02.177.125.33.274.425A.6.6 0 0 1 6.1 7.242H6a.3.3 0 0 0-.3.3v.2a.7.7 0 0 1-1.4 0v-.2a.3.3 0 0 0-.3-.3h-.1a.6.6 0 0 1-.121-1.187.14.14 0 0 0 .123-.135 19 19 0 0 0-.39-4c-.047-.219.149-.415.364-.35',
  },
  elite: {
    label: 'Elite Foe',
    color: '#6a0dad',
    viewBox: '2.08 2.08 5.85 5.85',
    pathD:
      'M5 2.077c1.78 0 2.9 1.12 2.9 2.5 0 .583-.2 1.085-.566 1.469-.202.211-.303.317-.331.402l-.01.037c-.02.087.003.194.049.406l.062.285c.093.424-.282.806-.71.74a.23.23 0 0 1-.194-.224v-.455a.4.4 0 0 0-.8 0v.159a.39.39 0 0 1-.4.381.39.39 0 0 1-.4-.381v-.209a.4.4 0 0 0-.8 0v.505a.23.23 0 0 1-.194.224c-.428.066-.803-.316-.71-.74l.062-.286c.046-.212.069-.318.049-.405l-.01-.038c-.03-.085-.13-.19-.331-.401C2.3 5.66 2.1 5.16 2.1 4.576c0-1.38 1.12-2.5 2.9-2.5m-1.25 2.2a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5m2.5 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5',
  },
  campfire: {
    label: 'Campfire',
    color: '#d95d16',
    viewBox: '2.10 2.10 5.80 5.80',
    pathD:
      'M6.195 2.11c.197-.049.35.144.31.342-.447 2.196.895 2.204.895 4.001 0 .535-.238 1.002-.587 1.366-.164.171-.439.043-.493-.188-.201-.845-.76-1.677-1.32-1.678-.558 0-1.118.837-1.32 1.679-.055.23-.33.358-.494.187-.349-.364-.586-.83-.586-1.366 0-.737.227-1.63.945-2.574.144-.19.434-.115.507.112.461 1.43.322-1.43 2.143-1.881',
  },
  merchant: {
    label: 'Merchant',
    color: '#1b7a58',
    viewBox: '2.00 1.98 6.00 6.00',
    pathD:
      'M4.038 5.1c.047 0 .123.028.275.082a2.05 2.05 0 0 0 1.372 0c.152-.054.229-.081.276-.083h.02c.047.002.123.03.274.085a1.9 1.9 0 0 0 .732.113c.262-.013.393-.019.481.052l.036.033c.076.085.077.172.079.346V6l-.003.886c-.002.436-.004.655-.113.81a.6.6 0 0 1-.146.145c-.155.108-.373.109-.81.109h-.078c-.217 0-.326 0-.41-.041a.4.4 0 0 1-.182-.182c-.04-.084-.04-.193-.04-.41V6.85a.8.8 0 0 0-1.601 0v.467c0 .217 0 .326-.041.41a.4.4 0 0 1-.182.182c-.083.04-.192.04-.41.04H3.48c-.45 0-.675.001-.833-.114a.6.6 0 0 1-.133-.132C2.4 7.545 2.4 7.319 2.4 6.87v-.86q0-.173.002-.31c.003-.162.005-.243.083-.327l.035-.032c.09-.07.215-.062.464-.046q.057.004.116.004.336-.002.644-.115c.15-.055.225-.083.272-.085zM6.61 2c.327 0 .49 0 .662.087.02.01.053.03.072.042.162.105.224.215.35.435.16.276.306.617.306.936l-.006.102c-.062.504-.576.898-1.094.898-.27 0-.538-.107-.742-.28-.101-.087-.152-.13-.185-.132h-.015c-.033.003-.084.048-.187.139-.191.17-.457.273-.77.273-.314 0-.58-.104-.773-.273-.103-.091-.154-.136-.187-.139h-.015c-.033.002-.084.045-.185.132-.204.173-.471.28-.74.28-.519 0-1.032-.394-1.095-.898L2 3.5l.006-.12c.03-.284.16-.575.298-.816.127-.22.19-.33.352-.435l.072-.042C2.9 2 3.063 2 3.39 2z',
  },
  treasure: {
    label: 'Treasure',
    color: '#b67d10',
    viewBox: '2.00 2.00 6.00 6.00',
    pathD:
      'M8 5.85c0 .75 0 1.124-.191 1.387a1 1 0 0 1-.221.222c-.263.191-.638.191-1.388.191H3.8c-.75 0-1.125 0-1.388-.191a1 1 0 0 1-.22-.222C2 6.974 2 6.6 2 5.85v-.08c0-.3 0-.45.076-.555a.4.4 0 0 1 .089-.089c.105-.076.255-.076.555-.076H3.9a.4.4 0 0 1 .4.4.7.7 0 0 0 1.4 0 .4.4 0 0 1 .4-.4h1.18c.3 0 .45 0 .555.076a.4.4 0 0 1 .089.089C8 5.32 8 5.47 8 5.77zm-2.52-3.5c1.049 0 1.574 0 1.942.267q.179.13.31.31c.115.159.18.347.218.594.041.274.062.411-.012.534a.4.4 0 0 1-.089.104c-.11.091-.269.091-.584.091h-4.53c-.316 0-.473 0-.584-.091a.4.4 0 0 1-.09-.104c-.073-.123-.052-.26-.011-.534.037-.247.102-.435.218-.594q.13-.18.31-.31c.367-.267.893-.267 1.942-.267z',
  },
  mystery: {
    label: 'Mystery',
    color: '#1b6488',
    viewBox: '1.37 1.38 7.25 7.25',
    pathD:
      'M5.05 7.025a.8.8 0 1 1-.002 1.601.8.8 0 0 1 .001-1.601m0-5.65c1.278 0 2.4.863 2.4 2.1l-.007.194c-.032.443-.173.81-.394 1.112-.242.33-.55.538-.79.681-.112.068-.244.14-.325.185-.128.073-.197.21-.263.343a.69.69 0 0 1-.622.385.7.7 0 0 1-.7-.7c0-.507.294-.83.541-1.018.119-.09.246-.165.35-.225.119-.068.2-.111.3-.17.185-.112.303-.206.38-.31.065-.09.13-.226.13-.478 0-.263-.28-.7-1-.7-.353.001-.59.103-.752.238-.168.14-.3.351-.37.632a.7.7 0 1 1-1.357-.339 2.57 2.57 0 0 1 .831-1.368c.438-.365 1-.562 1.647-.562',
  },
  boss: {
    label: 'Evil Wizard',
    color: '#5a082d',
    viewBox: '1.84 1.84 6.32 6.32',
    pathD:
      'M7.312 1.839c.12 0 .231.063.291.166l.015.026c.223.383.335.574.373.779.028.15.027.305-.003.455a1.4 1.4 0 0 1-.164.4c-.085.153-.128.23-.14.295l-.004.03c-.006.065.019.173.068.39q.057.251.057.535c0 .555-.165 1.018-.478 1.374-.196.223-.294.335-.32.416L7 6.741c-.018.084.004.187.049.392l.061.282c.092.424-.282.806-.71.74a.226.226 0 0 1-.193-.223v-.456a.4.4 0 0 0-.8 0v.158a.39.39 0 0 1-.4.382.39.39 0 0 1-.4-.382v-.21a.401.401 0 0 0-.8 0v.507a.23.23 0 0 1-.194.223c-.428.067-.803-.315-.71-.739l.06-.283c.045-.205.067-.307.05-.39l-.01-.037c-.025-.081-.123-.192-.319-.415-.313-.356-.478-.82-.478-1.375q0-.284.058-.535c.049-.217.073-.325.066-.39l-.004-.029c-.012-.065-.054-.142-.139-.296a1.4 1.4 0 0 1-.163-.4 1.2 1.2 0 0 1-.003-.455c.039-.205.15-.396.373-.779l.016-.026a.335.335 0 0 1 .589.02l.162.324c.136.271.204.406.307.466.017.01.027.016.046.024.11.046.29.013.648-.052a4.7 4.7 0 0 1 .845-.071q.456 0 .843.071c.359.065.538.098.648.052l.046-.023c.103-.06.17-.195.306-.466l.164-.326a.34.34 0 0 1 .3-.185m-3.706 2.76c-.233-.109-.35-.163-.476-.104a.4.4 0 0 0-.051.03c-.113.083-.119.183-.13.381q-.011.173.022.332c.057.276.211.487.427.588.217.101.478.083.726-.05q.144-.076.268-.196c.145-.137.217-.206.208-.346a.4.4 0 0 0-.01-.057c-.035-.136-.152-.19-.385-.299l-.299-.14zm3.276-.104c-.127-.06-.244-.005-.477.104l-.3.14-.299.139c-.233.109-.35.163-.385.299a.4.4 0 0 0-.01.057c-.009.14.064.209.208.346q.125.119.269.196c.248.133.509.151.725.05s.37-.312.428-.588q.034-.16.022-.332c-.012-.198-.018-.297-.132-.38a.4.4 0 0 0-.05-.03',
  },
};

const ROW_HEIGHT = 205;
const MAP_WIDTH = 1380;

/**
 * Computes organic, staggered x/y coordinates on the full-screen parchment map.
 * Encounters on the same floor are staggered vertically by up to ±46px so they never sit
 * on a robotic horizontal line, and columns are spread generously across 1380px so winding
 * text along the paths never overlaps.
 */
function getNodePosition(node: MapNode, rowLength: number): { x: number; y: number } {
  const totalFloors = 24;
  const invertedRow = totalFloors - node.floor;
  const baseY = 120 + invertedRow * ROW_HEIGHT;

  const seedX = (node.floor * 53 + node.column * 97) % 41;
  const seedY = (node.floor * 71 + node.column * 31) % 43;

  const jitterX = (seedX - 20) * 3.8;
  // Stagger vertical height strongly across columns + deterministic jitter so nodes feel hand-drawn
  const columnStaggerY =
    rowLength === 3
      ? node.column === 0
        ? -34
        : node.column === 1
        ? 28
        : -18
      : rowLength === 2
      ? node.column === 0
        ? -26
        : 30
      : 0;
  const jitterY = columnStaggerY + (seedY - 21) * 1.6;

  if (rowLength === 1) {
    return { x: MAP_WIDTH * 0.5 + jitterX, y: baseY + jitterY };
  }
  if (rowLength === 2) {
    const base = node.column === 0 ? MAP_WIDTH * 0.31 : MAP_WIDTH * 0.69;
    return { x: base + jitterX, y: baseY + jitterY };
  }
  const base =
    node.column === 0
      ? MAP_WIDTH * 0.21
      : node.column === 1
      ? MAP_WIDTH * 0.5
      : MAP_WIDTH * 0.79;
  return { x: base + jitterX, y: baseY + jitterY };
}

/**
 * Builds two cubic Bezier curves between (x1,y1) and (x2,y2):
 * 1. `linePath`: the visible inky line connecting the two encounters.
 * 2. `textGuidePath`: always oriented Left-to-Right (so SVG `<textPath>` is never upside-down!)
 *    and offset slightly perpendicular to the curve so the phrase winds cleanly parallel to the path.
 */
function buildInkyAndTextPaths(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
  colDiff: number
): { linePath: string; textGuidePath: string } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const midY = (y1 + y2) / 2;

  const sway = ((seed % 19) - 9) * 4.5 + colDiff * 18;
  const cx1 = x1 + dx * 0.28 + sway;
  const cy1 = y1 + dy * 0.32;
  const cx2 = x1 + dx * 0.72 - sway * 0.6;
  const cy2 = midY - 14;

  const linePath = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

  // Perpendicular normal offset so text floats parallel beside the inky line
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = (-dy / len) * 18;
  const ny = (dx / len) * 18 - 6;

  // Ensure text guide runs Left -> Right (or bottom-to-top if nearly vertical) so letters read right-side up
  if (x1 <= x2 + 12) {
    const textGuidePath = `M ${x1 + nx} ${y1 + ny} C ${cx1 + nx} ${cy1 + ny}, ${cx2 + nx} ${
      cy2 + ny
    }, ${x2 + nx} ${y2 + ny}`;
    return { linePath, textGuidePath };
  } else {
    const textGuidePath = `M ${x2 + nx} ${y2 + ny} C ${cx2 + nx} ${cy2 + ny}, ${cx1 + nx} ${
      cy1 + ny
    }, ${x1 + nx} ${y1 + ny}`;
    return { linePath, textGuidePath };
  }
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
  const totalHeight = 24 * ROW_HEIGHT + 300;

  useEffect(() => {
    const invertedRow = 24 - currentFloor;
    const targetY = 120 + invertedRow * ROW_HEIGHT;
    const viewHeight = containerRef.current?.clientHeight || window.innerHeight;
    const idealScroll = Math.max(
      0,
      Math.min(totalHeight - viewHeight, targetY - viewHeight * 0.62)
    );
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

  // Evaluate both prefix matches (highlighted) and the #1 Enter-confirmable match (enter-ready!)
  const { highlightedIds, enterReadyId } = useMemo(() => {
    if (!typedInput.trim()) {
      return { highlightedIds: new Set<string>(), enterReadyId: null as string | null };
    }
    const evaluated = evaluateCandidates(
      typedInput,
      availableNodes.map((n) => ({ item: n, phrase: n.phrases[phraseDiff] })),
      difficulty
    );
    const high = new Set(evaluated.filter((e) => e.isPrefixMatch).map((e) => e.item.id));
    const top = evaluated[0];
    const ready = top && top.isValidConfirm ? top.item.id : null;
    return { highlightedIds: high, enterReadyId: ready };
  }, [availableNodes, difficulty, phraseDiff, typedInput]);

  // Precompute synthetic starting point below Floor 1 when on Floor 1
  const startOrigin = { x: MAP_WIDTH * 0.5, y: 120 + 24 * ROW_HEIGHT };

  return (
    <div className="fullscreen-map-container" ref={containerRef}>
      {/* Fixed Paper Map Key Legend in Left Margin */}
      <aside className="map-key-legend" aria-label="Map Key">
        <div className="map-key-title">MAP KEY</div>
        {(Object.keys(MAP_NODE_STYLES) as MapNodeType[]).map((type) => {
          const meta = MAP_NODE_STYLES[type];
          return (
            <div key={type} className="map-key-item">
              <svg
                width="24"
                height="24"
                viewBox={meta.viewBox}
                style={{ color: meta.color }}
                className="map-key-icon"
              >
                <path fill="currentColor" d={meta.pathD} />
              </svg>
              <span className="map-key-label" style={{ color: meta.color }}>
                {meta.label}
              </span>
            </div>
          );
        })}
        <div className="map-key-scroll-tip">↑ / ↓ or PgUp / PgDn to scroll</div>
      </aside>

      {/* Full-Screen Scrollable Ink Canvas */}
      <div
        className="fullscreen-map-canvas"
        style={{ width: `${MAP_WIDTH}px`, height: `${totalHeight}px` }}
      >
        <svg width={MAP_WIDTH} height={totalHeight} className="map-inky-svg">
          <defs>
            <filter id="ink-roughness">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.035"
                numOctaves="2"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="2.4"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>

            {/* Define `<path>` guides for every available path so text winds parallel to the line */}
            {currentFloor === 1 &&
              availableNodes.map((targetNode, idx) => {
                const toPos = nodePositions.get(targetNode.id);
                if (!toPos) return null;
                const { textGuidePath } = buildInkyAndTextPaths(
                  startOrigin.x,
                  startOrigin.y,
                  toPos.x,
                  toPos.y,
                  idx + 11,
                  idx - 1
                );
                return <path key={`guide_start_${targetNode.id}`} id={`guide_${targetNode.id}`} d={textGuidePath} fill="none" />;
              })}

            {mapFloors.map((row) =>
              row.map((node) => {
                const fromPos = nodePositions.get(node.id);
                if (!fromPos) return null;
                return node.nextNodeIds.map((nextId, idx) => {
                  const toPos = nodePositions.get(nextId);
                  if (!toPos) return null;
                  const isActiveChoiceEdge =
                    node.id === currentNodeId && availableIdSet.has(nextId);
                  if (!isActiveChoiceEdge) return null;
                  const { textGuidePath } = buildInkyAndTextPaths(
                    fromPos.x,
                    fromPos.y,
                    toPos.x,
                    toPos.y,
                    node.floor * 13 + idx * 7,
                    toPos.node.column - node.column
                  );
                  return <path key={`guide_${nextId}`} id={`guide_${nextId}`} d={textGuidePath} fill="none" />;
                });
              })
            )}
          </defs>

          {/* Starting Floor 1 Inky Entry Paths */}
          {currentFloor === 1 &&
            availableNodes.map((targetNode, idx) => {
              const toPos = nodePositions.get(targetNode.id);
              if (!toPos) return null;
              const isHighlighted = highlightedIds.has(targetNode.id);
              const isEnterReady = enterReadyId === targetNode.id;
              const { linePath } = buildInkyAndTextPaths(
                startOrigin.x,
                startOrigin.y,
                toPos.x,
                toPos.y,
                idx + 11,
                idx - 1
              );

              return (
                <g key={`start_edge_${targetNode.id}`}>
                  <path
                    d={linePath}
                    fill="none"
                    stroke={
                      isEnterReady
                        ? '#137547'
                        : isHighlighted
                        ? '#d97706'
                        : '#8c3b14'
                    }
                    strokeWidth={isEnterReady ? 5.2 : isHighlighted ? 4.4 : 3.2}
                    strokeLinecap="round"
                    filter="url(#ink-roughness)"
                  />
                  <text
                    className={`map-winding-path-text ${
                      isEnterReady
                        ? 'map-text-enter-ready'
                        : isHighlighted
                        ? 'map-text-highlighted'
                        : ''
                    }`}
                  >
                    <textPath
                      href={`#guide_${targetNode.id}`}
                      startOffset="50%"
                      textAnchor="middle"
                    >
                      {targetNode.phrases[phraseDiff]}
                    </textPath>
                  </text>
                </g>
              );
            })}

          {/* All Floor-to-Floor Inky Edges + Winding Parallel Text on Active Edges */}
          {mapFloors.map((row) =>
            row.map((node) => {
              const fromPos = nodePositions.get(node.id);
              if (!fromPos) return null;

              return node.nextNodeIds.map((nextId, idx) => {
                const toPos = nodePositions.get(nextId);
                if (!toPos) return null;

                const isTakenEdge = node.completed && toPos.node.completed;
                const isActiveChoiceEdge =
                  node.id === currentNodeId && availableIdSet.has(nextId);
                const isHighlighted = isActiveChoiceEdge && highlightedIds.has(nextId);
                const isEnterReady = isActiveChoiceEdge && enterReadyId === nextId;

                const { linePath } = buildInkyAndTextPaths(
                  fromPos.x,
                  fromPos.y,
                  toPos.x,
                  toPos.y,
                  node.floor * 13 + idx * 7,
                  toPos.node.column - node.column
                );

                return (
                  <g key={`${node.id}->${nextId}`}>
                    <path
                      d={linePath}
                      fill="none"
                      stroke={
                        isEnterReady
                          ? '#137547'
                          : isHighlighted
                          ? '#d97706'
                          : isActiveChoiceEdge
                          ? '#8c3b14'
                          : isTakenEdge
                          ? '#102a3a'
                          : 'rgba(16, 42, 58, 0.25)'
                      }
                      strokeWidth={
                        isEnterReady
                          ? 5.2
                          : isHighlighted
                          ? 4.4
                          : isActiveChoiceEdge
                          ? 3.4
                          : isTakenEdge
                          ? 3.4
                          : 2.1
                      }
                      strokeDasharray={
                        isTakenEdge || isActiveChoiceEdge ? 'none' : '7 8'
                      }
                      strokeLinecap="round"
                      filter="url(#ink-roughness)"
                    />

                    {isActiveChoiceEdge && (
                      <text
                        className={`map-winding-path-text ${
                          isEnterReady
                            ? 'map-text-enter-ready'
                            : isHighlighted
                            ? 'map-text-highlighted'
                            : ''
                        }`}
                      >
                        <textPath
                          href={`#guide_${nextId}`}
                          startOffset="50%"
                          textAnchor="middle"
                        >
                          {toPos.node.phrases[phraseDiff]}
                        </textPath>
                      </text>
                    )}
                  </g>
                );
              });
            })
          )}
        </svg>

        {/* Pure Colored Encounter Symbols (No circle border, no floor numbers!) */}
        {mapFloors.map((row) =>
          row.map((node, idx) => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            const styleMeta = MAP_NODE_STYLES[node.type];
            const isAvailable = availableIdSet.has(node.id);
            const isHighlighted = highlightedIds.has(node.id);
            const isEnterReady = enterReadyId === node.id;
            const isCompleted = node.completed;
            const isCurrent = node.id === currentNodeId;

            return (
              <div
                key={node.id}
                className={`map-symbol-only ${
                  isAvailable ? 'map-symbol-available' : ''
                } ${isHighlighted ? 'map-symbol-highlighted' : ''} ${
                  isEnterReady ? 'map-symbol-enter-ready' : ''
                } ${isCompleted ? 'map-symbol-completed' : ''} ${
                  isCurrent ? 'map-symbol-current' : ''
                }`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  color: isEnterReady
                    ? '#137547'
                    : isHighlighted
                    ? '#d97706'
                    : styleMeta.color,
                  animationDelay: `${((node.floor + idx) % 6) * 0.35}s`,
                }}
              >
                <svg
                  width={node.type === 'boss' ? 62 : 42}
                  height={node.type === 'boss' ? 62 : 42}
                  viewBox={styleMeta.viewBox}
                  className="map-pure-svg-symbol"
                >
                  <path fill="currentColor" d={styleMeta.pathD} />
                </svg>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
