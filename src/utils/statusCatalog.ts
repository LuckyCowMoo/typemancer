import type { ActiveEnemy } from '../types/game';

export interface StatusInfo {
  id: 'ward' | 'bold' | 'faded' | 'exposed' | 'ink_burn' | 'burn_draft' | 'plated_armor' | 'thorns';
  name: string;
  aliases: string[];
  color: string;
  summary: string;
}

export const STATUS_DEFINITIONS: StatusInfo[] = [
  {
    id: 'ward',
    name: 'Ward',
    aliases: ['ward', 'shield', 'block', 'barrier', 'armor'],
    color: '#1d6fa5',
    summary: 'Prevents incoming attack damage until the start of your next turn.',
  },
  {
    id: 'bold',
    name: 'Bold',
    aliases: ['bold', 'strength', 'power'],
    color: '#d97706',
    summary: 'Increases attack damage dealt by +1 per stack for the rest of combat.',
  },
  {
    id: 'faded',
    name: 'Faded',
    aliases: ['faded', 'weak', 'weakened'],
    color: '#64748b',
    summary: 'Reduces attack damage dealt by 1 per stack. Decreases by 1 each turn.',
  },
  {
    id: 'exposed',
    name: 'Exposed',
    aliases: ['exposed', 'vulnerable', 'underlined'],
    color: '#be123c',
    summary: 'Increases attack damage taken by 50%. Decreases by 1 each turn.',
  },
  {
    id: 'ink_burn',
    name: 'Ink Burn',
    aliases: ['ink burn', 'burn', 'poison', 'bleed', 'ink'],
    color: '#6d28d9',
    summary: 'Deals damage equal to its stacks at the start of the turn, then decreases by 1.',
  },
  {
    id: 'burn_draft',
    name: 'Burn Draft',
    aliases: ['burn draft', 'exhaust', 'burned'],
    color: '#b91c1c',
    summary: 'Removed from your deck for the remainder of the current battle when played.',
  },
  {
    id: 'plated_armor',
    name: 'Plated Armor',
    aliases: ['plated armor', 'plated', 'plate', 'plates'],
    color: '#2563eb',
    summary: 'At the start of your turn, gain Ward equal to stacks, then decreases by 1.',
  },
  {
    id: 'thorns',
    name: 'Thorns',
    aliases: ['thorns', 'spikes', 'counter', 'retaliate'],
    color: '#059669',
    summary: 'When attacked, deals damage back to the attacker equal to its stacks.',
  },
];

export function describeEnemyIntentInEnglish(enemy: ActiveEnemy, playerExposed: number = 0): string {
  const move = enemy.currentMove;
  const rawBase = (move.damage || 0) + enemy.statuses.bold;
  const hasFaded = enemy.statuses.faded > 0;

  const calcDamage = (base: number) => {
    let dmg = base + enemy.statuses.bold;
    if (enemy.statuses.faded > 0) dmg = Math.max(0, dmg - enemy.statuses.faded);
    if (playerExposed > 0) dmg = Math.floor(dmg * 1.5);
    return Math.max(0, dmg);
  };

  const d = calcDamage(move.damage || 0);
  const dmgLabel = hasFaded ? `${rawBase}-${enemy.statuses.faded} (${d})` : `${d}`;

  if (move.intent === 'attack') {
    return `${enemy.displayName} intends to damage you for ${dmgLabel} damage.`;
  }
  if (move.intent === 'multi_attack') {
    const hits = move.hits || 2;
    return `${enemy.displayName} intends to strike you ${hits} times for ${dmgLabel} damage each (${d * hits} total damage).`;
  }
  if (move.intent === 'attack_defend') {
    return `${enemy.displayName} intends to damage you for ${dmgLabel} damage and gain ${move.ward || 0} Ward.`;
  }
  if (move.intent === 'attack_debuff') {
    const debuffText = (move.statusEffects || [])
      .map((s) => `${s.amount} ${s.status.replace('_', ' ')}`)
      .join(' and ');
    return `${enemy.displayName} intends to damage you for ${dmgLabel} damage and inflict ${debuffText || 'a status effect'}.`;
  }
  if (move.intent === 'defend') {
    return `${enemy.displayName} intends to fortify itself with ${move.ward || 0} Ward.`;
  }
  if (move.intent === 'heal') {
    return `${enemy.displayName} intends to heal allies for ${move.heal || 0} HP.`;
  }
  if (move.intent === 'buff') {
    const buffText = (move.statusEffects || [])
      .map((s) => `+${s.amount} ${s.status.replace('_', ' ')}`)
      .join(', ');
    return `${enemy.displayName} intends to empower its side (${buffText || 'Bold'}).`;
  }
  const curseText = (move.statusEffects || [])
    .map((s) => `${s.amount} ${s.status.replace('_', ' ')}`)
    .join(', ');
  return `${enemy.displayName} intends to inflict ${curseText || 'a status curse'} upon you.`;
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string }[];
  }[];
}

export async function lookupWordDefinition(rawWord: string): Promise<DictionaryResult | null> {
  const cleanWord = rawWord.replace(/[^a-zA-Z-]/g, '').toLowerCase();
  if (!cleanWord) return null;
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const entry = data[0];
    return {
      word: entry.word || cleanWord,
      phonetic: entry.phonetic || '',
      meanings: (entry.meanings || []).slice(0, 3).map((m: { partOfSpeech?: string; definitions?: { definition: string; example?: string }[] }) => ({
        partOfSpeech: m.partOfSpeech || '',
        definitions: (m.definitions || []).slice(0, 2),
      })),
    };
  } catch {
    return null;
  }
}
