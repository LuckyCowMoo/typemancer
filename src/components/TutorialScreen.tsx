import React from 'react';
import type { Difficulty, MapNodeType, PhraseDifficulty } from '../types/game';
import { IntentBadge } from './EntitySprite';
import { MAP_NODE_STYLES } from './ScrollableMap';
import {
  buildInkyAndTextPaths,
  getFittedRoadTextProps,
  splitPhraseForRoad,
} from '../utils/mapGeometry';

export interface TutorialMapNode {
  type: MapNodeType;
  name: string;
}

export interface TutorialScreenProps {
  step: number;
  typedInput?: string;
  difficulty?: Difficulty;
  phraseDiff?: PhraseDifficulty;
  diffPreview: PhraseDifficulty;
  feedbackText: string | null;
  interactiveMapCurrent: TutorialMapNode;
  interactiveMapOptions: TutorialMapNode[];
  interactiveMapLevel: number;
  interactiveMapScroll: number;
  getPhraseHighlightState: (phrase: string, diff?: Difficulty) => {
    isHighlighted: boolean;
    isEnterReady: boolean;
  };
  isBattlePopup?: boolean;
  renderTypingInputWithCaret?: () => React.ReactNode;
}

const TOTAL_TUTORIAL_STEPS = 15;

const STEP_TITLES = [
  'Only Your Keyboard',
  'How Typing Works',
  'The Goal: Survive and Grow Stronger',
  'What Difficulty Changes',
  'Between Encounters: The Map',
  'Moving on the Map',
  'Choose the Least Challenging Path',
  'Your Cards and Deck',
  'Energy Powers Your Cards',
  'How to Use Cards in Battle',
  'See Enemy Moves Ahead',
  'Enemy Factions',
  'Health Does Not Heal!',
  'Saving Your Adventure Anywhere',
  'You Are Ready to Play!',
];

export const TutorialScreen: React.FC<TutorialScreenProps> = ({
  step,
  feedbackText,
  interactiveMapCurrent,
  interactiveMapOptions,
  interactiveMapLevel,
  interactiveMapScroll,
  getPhraseHighlightState,
  isBattlePopup,
  renderTypingInputWithCaret,
}) => {
  // Helper to render an interactive typewriter choice pill without sub-labels
  const renderChoicePill = (phrase: string) => {
    const st = getPhraseHighlightState(phrase, 'easy');
    return (
      <div
        key={phrase}
        className={`student-choice-pill ${st.isHighlighted ? 'option-highlighted' : ''} ${
          st.isEnterReady ? 'option-enter-ready' : ''
        }`}
      >
        <span className="pill-phrase">{phrase}</span>
      </div>
    );
  };

  const currentTitle = STEP_TITLES[step] || `Step ${step + 1}`;

  return (
    <div className={`student-tutorial-container ${isBattlePopup ? 'student-tutorial-popup-container' : ''}`}>
      <div className="cabinet-story-frame paper-sheet-float student-frame">
        <div className="story-card student-card">
          {/* STEP HEADER (NO PROGRESS BAR) */}
          <div className="student-step-indicator">
            <span className="step-count">
              {isBattlePopup
                ? `COMBAT GUIDE: ${step - 6} OF 4`
                : `STEP ${step + 1} OF ${TOTAL_TUTORIAL_STEPS}`}
            </span>
            <span className="step-name">{currentTitle}</span>
          </div>

          {/* =========================================================================
              STEP 0: ONLY YOUR KEYBOARD
             ========================================================================= */}
          {step === 0 && (
            <div className="student-slide">
              <h1 className="student-title">Hands on the Keyboard!</h1>
              <p className="student-paragraph">
                In Typemancer, <strong>you do not use the mouse at all</strong>.
              </p>
              <p className="student-paragraph">
                Everything you do is done by <strong>typing on your keyboard</strong>.
              </p>
              <p className="student-paragraph">
                After typing a command or card name, <strong>always press Enter to confirm</strong>!
              </p>
            </div>
          )}

          {/* =========================================================================
              STEP 1: HOW TYPING WORKS
             ========================================================================= */}
          {step === 1 && (
            <div className="student-slide">
              <h1 className="student-title">How Typing Works</h1>
              <p className="student-paragraph">
                Look at the words shown on screen and type them on your keyboard:
              </p>
              <div className="student-demo-steps">
                <div className="demo-step-box">
                  <span className="demo-step-num">1</span>
                  <span>
                    As you type, matching words glow <strong style={{ color: '#b45309' }}>Amber</strong>.
                  </span>
                </div>
                <div className="demo-step-box">
                  <span className="demo-step-num">2</span>
                  <span>
                    When you finish typing the word, it glows <strong style={{ color: '#047857' }}>Green</strong>!
                  </span>
                </div>
                <div className="demo-step-box">
                  <span className="demo-step-num">3</span>
                  <span>Press <kbd className="kb-key">Enter</kbd> to confirm!</span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 2: THE GOAL (SURVIVE & CLIMB)
             ========================================================================= */}
          {step === 2 && (
            <div className="student-slide">
              <h1 className="student-title">Your Goal: Survive and Grow Stronger</h1>
              <p className="student-paragraph">
                Your goal is to survive as long as you can as you climb through encounters, if you live long enough you can face the evil wizard and save the lands.
              </p>
              <p className="student-paragraph">
                After winning battles, you choose <strong>new cards to add to your deck</strong> and discover magical
                <strong> relics</strong> that grant you powers!
              </p>
            </div>
          )}

          {/* =========================================================================
              STEP 3: DIFFICULTY MEANS WORD LENGTH
             ========================================================================= */}
          {step === 3 && (
            <div className="student-slide">
              <h1 className="student-title">What Does Difficulty Change?</h1>
              <p className="student-paragraph">
                Everyone faces the <strong>exact same challenges and monsters</strong>!
              </p>
              <p className="student-paragraph">
                Difficulty only selects <strong>how many words and letters you type</strong>:
              </p>
              <div className="student-diff-preview-grid">
                <div className="diff-pill-card">
                  <span className="diff-tag easy">EASY</span>
                  <span className="diff-word">"strike"</span>
                </div>
                <div className="diff-pill-card">
                  <span className="diff-tag normal">NORMAL</span>
                  <span className="diff-word">"ink strike"</span>
                </div>
                <div className="diff-pill-card">
                  <span className="diff-tag hard">HARD</span>
                  <span className="diff-word">"slash with a fountain nib"</span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 4: BETWEEN ENCOUNTERS: THE MAP
             ========================================================================= */}
          {step === 4 && (
            <div className="student-slide">
              <h1 className="student-title">The Map & Encounters</h1>
              <p className="student-paragraph">
                Between encounters, you use a map to travel.
              </p>
              <div className="student-rooms-grid">
                <div className="room-item">
                  <svg width="24" height="24" viewBox={MAP_NODE_STYLES.battle.viewBox} style={{ color: MAP_NODE_STYLES.battle.color, flexShrink: 0 }}>
                    <path fill="currentColor" d={MAP_NODE_STYLES.battle.pathD} />
                  </svg>
                  <div><strong>Battle:</strong> Fight monsters to win cards and gold.</div>
                </div>
                <div className="room-item">
                  <svg width="24" height="24" viewBox={MAP_NODE_STYLES.elite.viewBox} style={{ color: MAP_NODE_STYLES.elite.color, flexShrink: 0 }}>
                    <path fill="currentColor" d={MAP_NODE_STYLES.elite.pathD} />
                  </svg>
                  <div><strong>Elite:</strong> Bigger monsters, bigger loot!</div>
                </div>
                <div className="room-item">
                  <svg width="24" height="24" viewBox={MAP_NODE_STYLES.campfire.viewBox} style={{ color: MAP_NODE_STYLES.campfire.color, flexShrink: 0 }}>
                    <path fill="currentColor" d={MAP_NODE_STYLES.campfire.pathD} />
                  </svg>
                  <div><strong>Campfire:</strong> Restore some health or upgrade a card.</div>
                </div>
                <div className="room-item">
                  <svg width="24" height="24" viewBox={MAP_NODE_STYLES.merchant.viewBox} style={{ color: MAP_NODE_STYLES.merchant.color, flexShrink: 0 }}>
                    <path fill="currentColor" d={MAP_NODE_STYLES.merchant.pathD} />
                  </svg>
                  <div><strong>Shop:</strong> Spend your gold to get stronger.</div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 5: MOVING ON THE MAP (INTERACTIVE MAP EXAMPLE & SCROLLING)
             ========================================================================= */}
          {step === 5 && (
            <div className="student-slide">
              <h1 className="student-title">Moving on the Map</h1>
              <p className="student-paragraph">
                To move along the map, type the name of any connected road ahead and press <kbd className="kb-key">Enter</kbd>.
              </p>

              {/* Repurposed Authentic Inky Map Canvas */}
              <div className="tutorial-interactive-map-wrapper">
                <div
                  className="tutorial-interactive-map-canvas"
                  style={{ transform: `translateY(${interactiveMapScroll}px)` }}
                >
                  {(() => {
                    const fromPos = { x: 320, y: 265 };
                    const targetPositions = [
                      { x: 115, y: 72 },
                      { x: 320, y: 62 },
                      { x: 525, y: 72 },
                    ];
                    const curMeta =
                      MAP_NODE_STYLES[interactiveMapCurrent.type] ||
                      MAP_NODE_STYLES.campfire;

                    const roadCalculations = interactiveMapOptions.map((opt, idx) => {
                      const toPos = targetPositions[idx] || { x: 320, y: 72 };
                      const colDiff = idx === 0 ? -1 : idx === 1 ? 0 : 1;
                      const seed = 11 + idx * 4;
                      const paths = buildInkyAndTextPaths(
                        fromPos.x,
                        fromPos.y,
                        toPos.x,
                        toPos.y,
                        seed,
                        colDiff
                      );
                      const st = getPhraseHighlightState(opt.name, 'medium');
                      const { topLine, bottomLine } = splitPhraseForRoad(opt.name);
                      const fitted = getFittedRoadTextProps(
                        topLine.length >= (bottomLine?.length || 0)
                          ? topLine
                          : bottomLine || topLine,
                        paths.segmentLen,
                        st.isEnterReady
                      );
                      const meta = MAP_NODE_STYLES[opt.type] || MAP_NODE_STYLES.battle;

                      return {
                        opt,
                        idx,
                        toPos,
                        paths,
                        st,
                        topLine,
                        bottomLine,
                        fitted,
                        meta,
                      };
                    });

                    return (
                      <>
                        <svg
                          width="640"
                          height="350"
                          viewBox="0 0 640 350"
                          className="tutorial-map-inky-svg"
                        >
                          <defs>
                            <filter id="tutorial-ink-roughness">
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

                            {roadCalculations.map(({ paths, idx }) => (
                              <React.Fragment key={`tutorial_guide_group_${idx}`}>
                                <path
                                  id={`tutorial_guide_above_${idx}`}
                                  d={paths.aboveGuidePath}
                                  fill="none"
                                />
                                <path
                                  id={`tutorial_guide_below_${idx}`}
                                  d={paths.belowGuidePath}
                                  fill="none"
                                />
                              </React.Fragment>
                            ))}
                          </defs>

                          {/* Inky Connecting Roads & Prompts along Roads */}
                          {roadCalculations.map(
                            ({
                              idx,
                              paths,
                              st,
                              topLine,
                              bottomLine,
                              fitted,
                            }) => (
                              <g key={`road_${idx}`}>
                                <path
                                  d={paths.linePath}
                                  fill="none"
                                  stroke={
                                    st.isEnterReady
                                      ? '#137547'
                                      : st.isHighlighted
                                      ? '#d97706'
                                      : '#8c3b14'
                                  }
                                  strokeWidth={
                                    st.isEnterReady
                                      ? 5.2
                                      : st.isHighlighted
                                      ? 4.4
                                      : 3.4
                                  }
                                  strokeLinecap="round"
                                  filter="url(#tutorial-ink-roughness)"
                                />

                                <text
                                  style={{ fontSize: fitted.fontSize }}
                                  className={`map-winding-path-text ${
                                    st.isEnterReady
                                      ? 'map-text-enter-ready'
                                      : st.isHighlighted
                                      ? 'map-text-highlighted'
                                      : ''
                                  }`}
                                >
                                  <textPath
                                    href={`#tutorial_guide_above_${idx}`}
                                    startOffset={paths.startOffsetPct}
                                    textAnchor="middle"
                                  >
                                    {topLine}
                                  </textPath>
                                </text>
                                {bottomLine && (
                                  <text
                                    style={{ fontSize: fitted.fontSize }}
                                    className={`map-winding-path-text ${
                                      st.isEnterReady
                                        ? 'map-text-enter-ready'
                                        : st.isHighlighted
                                        ? 'map-text-highlighted'
                                        : ''
                                    }`}
                                  >
                                    <textPath
                                      href={`#tutorial_guide_below_${idx}`}
                                      startOffset={paths.startOffsetPct}
                                      textAnchor="middle"
                                    >
                                      {bottomLine}
                                    </textPath>
                                  </text>
                                )}
                              </g>
                            )
                          )}
                        </svg>

                        {/* Destination Encounter Symbols */}
                        {roadCalculations.map(({ opt, toPos, st, meta }) => (
                          <div
                            key={`dest_node_${opt.name}`}
                            className={`map-symbol-only map-symbol-available ${
                              st.isEnterReady
                                ? 'map-symbol-enter-ready'
                                : st.isHighlighted
                                ? 'map-symbol-highlighted'
                                : ''
                            }`}
                            style={{
                              left: `${toPos.x}px`,
                              top: `${toPos.y}px`,
                              color: st.isEnterReady
                                ? '#137547'
                                : st.isHighlighted
                                ? '#d97706'
                                : meta.color,
                            }}
                          >
                            <svg
                              width={opt.type === 'boss' ? 52 : 38}
                              height={opt.type === 'boss' ? 52 : 38}
                              viewBox={meta.viewBox}
                              className="map-pure-svg-symbol"
                            >
                              <path fill="currentColor" d={meta.pathD} />
                            </svg>
                            <span
                              className="tutorial-map-node-label"
                              style={{ color: meta.color }}
                            >
                              {meta.label.toUpperCase()}
                            </span>
                          </div>
                        ))}

                        {/* Current Encounter Symbol */}
                        <div
                          className="map-symbol-only map-symbol-current"
                          style={{
                            left: `${fromPos.x}px`,
                            top: `${fromPos.y}px`,
                            color: curMeta.color,
                          }}
                        >
                          <svg
                            width={38}
                            height={38}
                            viewBox={curMeta.viewBox}
                            className="map-pure-svg-symbol"
                          >
                            <path fill="currentColor" d={curMeta.pathD} />
                          </svg>
                          <span className="tutorial-map-current-badge">
                            CURRENT (LEVEL {interactiveMapLevel})
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 6: CHOOSE THE LEAST CHALLENGING PATH (STRATEGY)
             ========================================================================= */}
          {step === 6 && (
            <div className="student-slide">
              <h1 className="student-title">Choose the Least Challenging Path</h1>
              <p className="student-paragraph">
                Always look ahead several floors and <strong>choose a path that is the least challenging</strong>.
              </p>
              <p className="student-paragraph">
                You can scroll the map up and down using the <strong><kbd className="kb-key">↑</kbd> and <kbd className="kb-key">↓</kbd> Arrow keys</strong> on your keyboard to scout ahead!
              </p>
              <p className="student-paragraph">
                If your health is low, avoid dangerous Elite monsters. Steer toward Campfires and Shops to stay alive!
              </p>
            </div>
          )}

          {/* =========================================================================
              STEP 7: YOUR CARDS AND DECK (BEFORE ENERGY)
             ========================================================================= */}
          {step === 7 && (
            <div className="student-slide">
              <h1 className="student-title">Your Cards and Deck</h1>
              <p className="student-paragraph">
                At the start of every turn, you draw <strong>5 cards</strong> from your Draw Pile.
              </p>
              <p className="student-paragraph">
                When your Draw Pile runs empty during a fight, your used cards are
                <strong> automatically reshuffled</strong> into a fresh deck. You never run out of cards!
              </p>
            </div>
          )}

          {/* =========================================================================
              STEP 8: ENERGY POWERS YOUR CARDS
             ========================================================================= */}
          {step === 8 && (
            <div className="student-slide">
              <h1 className="student-title">Energy Powers Your Cards</h1>
              <p className="student-paragraph">
                In battle, you get <strong>3 Energy crystals</strong> every turn.
              </p>
              <p className="student-paragraph">
                Cards cost energy to play (usually 1 or 2). Type card names to play them.
                When you are out of energy, type <strong>end turn</strong> to let enemies take their turn!
              </p>
            </div>
          )}

          {/* =========================================================================
              STEP 9: HOW TO USE CARDS IN BATTLE
             ========================================================================= */}
          {step === 9 && (
            <div className="student-slide">
              <h1 className="student-title">How to Use Cards in Battle</h1>
              <p className="student-paragraph">
                Playing a card in battle is a 2-step typing process:
              </p>
              <div className="student-demo-steps">
                <div className="demo-step-box">
                  <span className="demo-step-num">1</span>
                  <span>
                    <strong>Select the Card:</strong> Type the card's name from your hand and press <kbd className="kb-key">Enter</kbd>.
                  </span>
                </div>
                <div className="demo-step-box">
                  <span className="demo-step-num">2</span>
                  <span>
                    <strong>Choose Target:</strong> For attacks, type the <strong>enemy's name</strong> to strike them. For shields and powers, press <kbd className="kb-key">Enter</kbd> again!
                  </span>
                </div>
              </div>
              <p className="student-paragraph" style={{ marginTop: '4px' }}>
                If you change your mind, type <strong>back</strong> or press <kbd className="kb-key">Esc</kbd> to return the card to your hand.
              </p>
            </div>
          )}

          {/* =========================================================================
              STEP 10: ENEMY INTENTS
             ========================================================================= */}
          {step === 10 && (
            <div className="student-slide">
              <h1 className="student-title">See Enemy Moves Ahead</h1>
              <p className="student-paragraph">
                Monsters show their intended moves <strong>above their head during your turn</strong>:
              </p>
              <div className="student-intents-row">
                <div className="intent-box">
                  <IntentBadge intent="attack" damage={12} hits={1} />
                  <span><strong>Attack:</strong> Will hit you for 12 damage!</span>
                </div>
                <div className="intent-box">
                  <IntentBadge intent="defend" ward={8} />
                  <span><strong>Defend:</strong> Will raise shield to block hits.</span>
                </div>
                <div className="intent-box">
                  <IntentBadge intent="buff" />
                  <span><strong>Buff:</strong> Will power up their allies.</span>
                </div>
              </div>
              <p className="student-paragraph" style={{ marginTop: '8px' }}>
                Because you can see their moves during your turn, you can <strong>attempt to block their attacks</strong>!
              </p>
            </div>
          )}

          {/* =========================================================================
              STEP 11: ENEMY FACTIONS
             ========================================================================= */}
          {step === 11 && (
            <div className="student-slide">
              <h1 className="student-title">Enemy Factions</h1>
              <p className="student-paragraph">
                Enemies fight in factions that work together:
              </p>
              <div className="student-factions-grid">
                <div className="faction-mini-card">
                  <img src="/assets/entities/goblin_skirmisher.png" alt="Goblins" className="mini-sprite" />
                  <strong>Goblins</strong>
                  <span>Swarm fast and boost each other with war drums.</span>
                </div>
                <div className="faction-mini-card">
                  <img src="/assets/entities/rock_golem.png" alt="Rock Monsters" className="mini-sprite" />
                  <strong>Rock Monsters</strong>
                  <span>Have heavy stone shields and smash hard.</span>
                </div>
                <div className="faction-mini-card">
                  <img src="/assets/entities/evil_flower.png" alt="Corrupted Plants" className="mini-sprite" />
                  <strong>Corrupted Plants</strong>
                  <span>Spread poison spores and thorny vines.</span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 12: HEALTH DOES NOT HEAL (PRIORITISE SURVIVAL)
             ========================================================================= */}
          {step === 12 && (
            <div className="student-slide">
              <h1 className="student-title">Health Does Not Heal After Battles</h1>
              <p className="student-paragraph">
                In most games, your health resets to full after you win. In Typemancer, <strong>any health you lose stays lost into the next encounter</strong>!
              </p>
              <p className="student-paragraph">
                The challenge is to get to the end of the game without dying once, otherwise you have to try again.
              </p>
              <p className="student-paragraph">
                <strong>Prioritise survival:</strong> raise your shields to protect your health before attacking!
              </p>
            </div>
          )}

          {/* =========================================================================
              STEP 13: HOW SAVING WORKS
             ========================================================================= */}
          {step === 13 && (
            <div className="student-slide">
              <h1 className="student-title">Saving Your Adventure Anywhere</h1>
              <p className="student-paragraph">
                You can save your run at any time by typing <strong>save</strong>.
              </p>
              <p className="student-paragraph">
                Typemancer creates a special <strong>Save Code</strong>. This allows you to take your game to any computer you want—at school during break, at home, or at the library!
              </p>
              <div className="student-rules-summary" style={{ textAlign: 'left', maxWidth: '620px' }}>
                <div>• <strong>School folder:</strong> Paste your code into a text document in your school computer account.</div>
                <div>• <strong>Email to yourself:</strong> Send the code to your own email address to open it at home.</div>
                <div>• <strong>USB stick:</strong> Save your text file on a flash drive to play anywhere without internet.</div>
              </div>
              <p className="student-paragraph" style={{ marginTop: '8px' }}>
                <strong>Important:</strong> This is the only way the game saves! If you lose your code, your current run will be lost.
              </p>
              <p className="student-paragraph" style={{ marginTop: '6px' }}>
                To resume your run, simply paste your code onto the main menu and press <kbd className="kb-key">Enter</kbd>!
              </p>
            </div>
          )}

          {/* =========================================================================
              STEP 14: READY TO PLAY!
             ========================================================================= */}
          {step === 14 && (
            <div className="student-slide">
              <h1 className="student-title">You Are Ready to Play!</h1>
              <p className="student-paragraph">
                You know the rules:
              </p>
              <div className="student-rules-summary">
                <div>• <strong>Only type:</strong> Typing is your only input.</div>
                <div>• <strong>Pick safe paths:</strong> Choose the least challenging route when hurt.</div>
                <div>• <strong>Watch intents:</strong> See incoming enemy moves during your turn.</div>
                <div>• <strong>Prioritise survival:</strong> You do not heal after battles, so protect your health!</div>
              </div>
              <p className="student-paragraph" style={{ marginTop: '12px' }}>
                Type <strong>start run</strong> below to begin your adventure!
              </p>
            </div>
          )}

          {/* =========================================================================
              TYPING PANEL (PROMPTS)
             ========================================================================= */}
          <div className="student-typing-panel">
            <div className="student-choice-row">
              {isBattlePopup ? (
                <>
                  {renderChoicePill('next')}
                  {step > 7 && renderChoicePill('back')}
                  {renderChoicePill('skip')}
                </>
              ) : (
                <>
                  {step === 0 && (
                    <>
                      {renderChoicePill('next')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 1 && (
                    <>
                      {renderChoicePill('practice practice practice')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 2 && (
                    <>
                      {renderChoicePill('next')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 3 && (
                    <>
                      {renderChoicePill('next')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 4 && (
                    <>
                      {renderChoicePill('next')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 5 && (
                    <>
                      {renderChoicePill('next')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 6 && (
                    <>
                      {renderChoicePill('next')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 7 && (
                    <>
                      {renderChoicePill('next')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 8 && (
                    <>
                      {renderChoicePill('next')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 9 && (
                    <>
                      {renderChoicePill('next')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 10 && (
                    <>
                      {renderChoicePill('next')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 11 && (
                    <>
                      {renderChoicePill('next')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 12 && (
                    <>
                      {renderChoicePill('next')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 13 && (
                    <>
                      {renderChoicePill('next')}
                      {renderChoicePill('back')}
                    </>
                  )}
                  {step === 14 && (
                    <>
                      {renderChoicePill('start run')}
                      {renderChoicePill('review')}
                      {renderChoicePill('back')}
                    </>
                  )}
                </>
              )}
            </div>

            {renderTypingInputWithCaret && (
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
                {renderTypingInputWithCaret()}
              </div>
            )}

            {feedbackText && (
              <div className="student-feedback-box" role="status">
                {feedbackText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
