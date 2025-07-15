// src/ai/flows/generate-puzzle.ts
'use server';
/**
 * @fileOverview A flow that generates a puzzle in a random language based on a given keyword.
 *
 * - generatePuzzle - A function that generates the puzzle.
 * - GeneratePuzzleInput - The input type for the generatePuzzle function.
 * - GeneratePuzzleOutput - The return type for the generatePuzzle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePuzzleInputSchema = z.object({
  keyword: z.string().describe('The keyword to generate the puzzle from.'),
});
export type GeneratePuzzleInput = z.infer<typeof GeneratePuzzleInputSchema>;

const GeneratePuzzleOutputSchema = z.object({
  puzzle: z.string().describe('The generated puzzle in a random language.'),
  language: z.string().describe('The language of the generated puzzle.'),
});
export type GeneratePuzzleOutput = z.infer<typeof GeneratePuzzleOutputSchema>;

export async function generatePuzzle(input: GeneratePuzzleInput): Promise<GeneratePuzzleOutput> {
  return generatePuzzleFlow(input);
}

const puzzlePrompt = ai.definePrompt({
  name: 'puzzlePrompt',
  input: {schema: GeneratePuzzleInputSchema},
  output: {schema: GeneratePuzzleOutputSchema},
  prompt: `Bạn là một chuyên gia tạo câu đố ngôn ngữ.
  Bạn sẽ tạo ra một câu đố bằng một ngôn ngữ ngẫu nhiên dựa trên từ khóa được cung cấp.
  Ngôn ngữ câu đố nên khác với tiếng Việt.

  Từ khóa: {{{keyword}}}

  Hãy trả về câu đố và ngôn ngữ của câu đố.
  Đảm bảo câu đố có ngữ nghĩa và độ khó phù hợp.

  Ví dụ output mẫu:
  {
    "puzzle": "Was ist die Hauptstadt von Deutschland?",
    "language": "German"
  }

  Output:
  `,
});

const generatePuzzleFlow = ai.defineFlow(
  {
    name: 'generatePuzzleFlow',
    inputSchema: GeneratePuzzleInputSchema,
    outputSchema: GeneratePuzzleOutputSchema,
  },
  async input => {
    const {output} = await puzzlePrompt(input);
    return output!;
  }
);
