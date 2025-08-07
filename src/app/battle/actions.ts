'use server';

import { generateBattleNarrative, GenerateBattleNarrativeOutput } from '@/ai/flows/generate-battle-narrative';
import type { Pokemon } from '@/lib/pokemon';

export async function createBattleNarrativeAction(pokemon1: Pokemon, pokemon2: Pokemon): Promise<{ narrative?: GenerateBattleNarrativeOutput, error?: string}> {
  if (!pokemon1 || !pokemon2) {
    return { error: 'Please select two Pokémon.' };
  }

  try {
    const result = await generateBattleNarrative({
      pokemon1Name: pokemon1.name,
      pokemon1Stats: pokemon1.stats.map((s) => `${s.stat.name}: ${s.base_stat}`).join(', '),
      pokemon1Abilities: pokemon1.abilities.map((a) => a.ability.name).join(', '),
      pokemon2Name: pokemon2.name,
      pokemon2Stats: pokemon2.stats.map((s) => `${s.stat.name}: ${s.base_stat}`).join(', '),
      pokemon2Abilities: pokemon2.abilities.map((a) => a.ability.name).join(', '),
    });
    return { narrative: result };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate battle narrative. Please try again.' };
  }
}
