'use server';

/**
 * @fileOverview A Genkit flow that translates a puzzle to Vietnamese and provides hints.
 *
 * - translateAndHint - A function that translates a puzzle and provides hints.
 * - TranslateAndHintInput - The input type for the translateAndHint function.
 * - TranslateAndHintOutput - The return type for the translateAndHint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateAndHintInputSchema = z.object({
  puzzle: z.string().describe('The puzzle to be translated and hinted.'),
});
export type TranslateAndHintInput = z.infer<typeof TranslateAndHintInputSchema>;

const TranslateAndHintOutputSchema = z.object({
  translatedPuzzle: z.string().describe('The puzzle translated to Vietnamese.'),
  hint: z.string().describe('A hint about the context or vocabulary of the puzzle.'),
});
export type TranslateAndHintOutput = z.infer<typeof TranslateAndHintOutputSchema>;

export async function translateAndHint(input: TranslateAndHintInput): Promise<TranslateAndHintOutput> {
  return translateAndHintFlow(input);
}

const translateAndHintPrompt = ai.definePrompt({
  name: 'translateAndHintPrompt',
  input: {schema: TranslateAndHintInputSchema},
  output: {schema: TranslateAndHintOutputSchema},
  prompt: `You are a helpful AI assistant that translates English puzzles to Vietnamese and provides hints.

  Translate the following puzzle to Vietnamese and provide a hint about the context or vocabulary of the puzzle. Ensure the translation is accurate and the hint is helpful.

  Puzzle: {{{puzzle}}}

  Translation:
  Hint: `,
});

const translateAndHintFlow = ai.defineFlow(
  {
    name: 'translateAndHintFlow',
    inputSchema: TranslateAndHintInputSchema,
    outputSchema: TranslateAndHintOutputSchema,
  },
  async input => {
    const {output} = await translateAndHintPrompt(input);
    return output!;
  }
);
