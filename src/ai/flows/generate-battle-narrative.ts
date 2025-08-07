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
  winner: z.string().describe('The name of the winning Pokémon.'),
  loser: z.string().describe('The name of the losing Pokémon.'),
  outcome: z.string().describe("A short, dramatic summary of the battle's outcome."),
  events: z
    .array(
      z.object({
        turn: z.number().describe('The turn number of the event.'),
        action: z
          .string()
          .describe(
            'A fun and interesting description of the action that took place this turn.'
          ),
      })
    )
    .describe('A turn-by-turn list of the key events in the battle.'),
  summary: z.string().describe('A final, overall summary of the epic battle.'),
});
export type GenerateBattleNarrativeOutput = z.infer<
  typeof GenerateBattleNarrativeOutputSchema
>;


export async function generateBattleNarrative(
  input: GenerateBattleNarrativeInput
): Promise<GenerateBattleNarrativeOutput> {
  return generateBattleNarrativeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBattleNarrativePrompt',
  input: {schema: GenerateBattleNarrativeInputSchema},
  output: {schema: GenerateBattleNarrativeOutputSchema},
  prompt: `You are a play-by-play Pokémon battle commentator. Your task is to generate a detailed and exciting battle narrative between two Pokémon based on their stats and abilities.

Here are the details for Pokémon 1:
Name: {{{pokemon1Name}}}
Stats: {{{pokemon1Stats}}}
Abilities: {{{pokemon1Abilities}}}

Here are the details for Pokémon 2:
Name: {{{pokemon2Name}}}
Stats: {{{pokemon2Stats}}}
Abilities: {{{pokemon2Abilities}}}

Please generate the battle narrative following these rules:
1.  **Turn-by-Turn Events**: Describe the battle as a series of turns. For each turn, provide a fun and interesting description of the action. Use their stats and abilities to inform the actions.
2.  **Determine a Winner**: Based on the stats and abilities, decide which Pokémon wins the battle.
3.  **Outcome**: Write a short, dramatic summary of how the battle concluded.
4.  **Final Summary**: Provide an overall summary of the epic battle, highlighting key moments.
5.  **Format**: Ensure your output is a valid JSON object that matches the specified output schema.
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
