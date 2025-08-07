'use server';

/**
 * @fileOverview Generates a description of a Pokémon team, including their goals for battling.
 *
 * - generateTeamDescription - A function that generates the team description.
 * - GenerateTeamDescriptionInput - The input type for the generateTeamDescription function.
 * - GenerateTeamDescriptionOutput - The return type for the generateTeamDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTeamDescriptionInputSchema = z.object({
  pokemonList: z
    .string()
    .describe('A comma-separated list of Pokémon in the team.'),
  teamName: z.string().optional().describe('Optional name for the team.'),
});
export type GenerateTeamDescriptionInput = z.infer<typeof GenerateTeamDescriptionInputSchema>;

const GenerateTeamDescriptionOutputSchema = z.object({
  teamDescription: z
    .string()
    .describe('A creative description of the Pokémon team and their battle goals.'),
});
export type GenerateTeamDescriptionOutput = z.infer<typeof GenerateTeamDescriptionOutputSchema>;

export async function generateTeamDescription(
  input: GenerateTeamDescriptionInput
): Promise<GenerateTeamDescriptionOutput> {
  return generateTeamDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTeamDescriptionPrompt',
  input: {schema: GenerateTeamDescriptionInputSchema},
  output: {schema: GenerateTeamDescriptionOutputSchema},
  prompt: `You are a creative writer specializing in Pokémon battles.

  Your task is to generate an engaging and descriptive narrative for a Pokémon team.
  Incorporate the Pokémon's strengths, weaknesses, and overall battle strategy.

  Team Name (if provided): {{teamName}}
  Pokémon Team: {{{pokemonList}}}

  Write a description of the team that explains the goals that team is trying to accomplish in battling.
  Focus on making it sound creative and fun.
  `,
});

const generateTeamDescriptionFlow = ai.defineFlow(
  {
    name: 'generateTeamDescriptionFlow',
    inputSchema: GenerateTeamDescriptionInputSchema,
    outputSchema: GenerateTeamDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
