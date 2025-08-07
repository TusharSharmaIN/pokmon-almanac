'use server';

/**
 * @fileOverview Generates a battle narrative between two Pokémon.
 *
 * - generateBattleNarrative - A function that generates the battle narrative.
 * - GenerateBattleNarrativeInput - The input type for the generateBattleNarrative function.
 * - GenerateBattleNarrativeOutput - The return type for the generateBattleNarrative function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBattleNarrativeInputSchema = z.object({
  pokemon1Name: z.string().describe('The name of the first Pokémon.'),
  pokemon1Stats: z.string().describe('The stats of the first Pokémon.'),
  pokemon1Abilities: z.string().describe('The abilities of the first Pokémon.'),
  pokemon2Name: z.string().describe('The name of the second Pokémon.'),
  pokemon2Stats: z.string().describe('The stats of the second Pokémon.'),
  pokemon2Abilities: z.string().describe('The abilities of the second Pokémon.'),
});
export type GenerateBattleNarrativeInput = z.infer<typeof GenerateBattleNarrativeInputSchema>;

const GenerateBattleNarrativeOutputSchema = z.object({
  narrative: z.string().describe('A narrative describing the battle between the two Pokémon.'),
});
export type GenerateBattleNarrativeOutput = z.infer<typeof GenerateBattleNarrativeOutputSchema>;

export async function generateBattleNarrative(
  input: GenerateBattleNarrativeInput
): Promise<GenerateBattleNarrativeOutput> {
  return generateBattleNarrativeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBattleNarrativePrompt',
  input: {schema: GenerateBattleNarrativeInputSchema},
  output: {schema: GenerateBattleNarrativeOutputSchema},
  prompt: `You are a creative storyteller, tasked with generating a battle narrative between two Pokémon.

  Use the provided stats and abilities to make the battle exciting and plausible.

  Here are the details for Pokémon 1:
  Name: {{{pokemon1Name}}}
  Stats: {{{pokemon1Stats}}}
  Abilities: {{{pokemon1Abilities}}}

  Here are the details for Pokémon 2:
  Name: {{{pokemon2Name}}}
  Stats: {{{pokemon2Stats}}}
  Abilities: {{{pokemon2Abilities}}}

  Generate a narrative of at least 100 words describing their epic battle.
  Focus on making the battle dynamic, and using each pokemons stats and abilities.
  The narrative should be in the style of a play-by-play commentator describing a real fight.
  Describe how each pokemon uses its strengths and attempts to overcome its weaknesses.  
  Add unexpected twists, dramatic moments, and a clear resolution (who wins and how).
  `,
});

const generateBattleNarrativeFlow = ai.defineFlow(
  {
    name: 'generateBattleNarrativeFlow',
    inputSchema: GenerateBattleNarrativeInputSchema,
    outputSchema: GenerateBattleNarrativeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
