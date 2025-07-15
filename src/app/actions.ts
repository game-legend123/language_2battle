'use server';

import { generatePuzzle, GeneratePuzzleInput, GeneratePuzzleOutput } from '@/ai/flows/generate-puzzle';
import { translateAndHint, TranslateAndHintInput, TranslateAndHintOutput } from '@/ai/flows/translate-and-hint';

export async function handleGeneratePuzzle(input: GeneratePuzzleInput): Promise<{ success: true; data: GeneratePuzzleOutput } | { success: false; error: string }> {
  try {
    const result = await generatePuzzle(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating puzzle:', error);
    return { success: false, error: 'Không thể tạo câu đố. Vui lòng thử lại.' };
  }
}

export async function handleTranslateAndHint(input: TranslateAndHintInput): Promise<{ success: true; data: TranslateAndHintOutput } | { success: false; error: string }> {
  try {
    const result = await translateAndHint(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error translating and hinting:', error);
    return { success: false, error: 'Không thể dịch hoặc tạo gợi ý. Vui lòng thử lại.' };
  }
}
