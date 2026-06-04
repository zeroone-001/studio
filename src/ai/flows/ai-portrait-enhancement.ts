'use server';
/**
 * @fileOverview An AI agent that enhances portrait photos.
 *
 * - aiPortraitEnhancement - A function that handles the AI portrait enhancement process.
 * - AiPortraitEnhancementInput - The input type for the aiPortraitEnhancement function.
 * - AiPortraitEnhancementOutput - The return type for the aiPortraitEnhancement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPortraitEnhancementInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A portrait photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiPortraitEnhancementInput = z.infer<typeof AiPortraitEnhancementInputSchema>;

const AiPortraitEnhancementOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe(
      "The enhanced portrait photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiPortraitEnhancementOutput = z.infer<typeof AiPortraitEnhancementOutputSchema>;

const aiPortraitEnhancementFlow = ai.defineFlow(
  {
    name: 'aiPortraitEnhancementFlow',
    inputSchema: AiPortraitEnhancementInputSchema,
    outputSchema: AiPortraitEnhancementOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: 'Evaluate the ambient lighting in this portrait photo and apply optimized filters to enhance it, ensuring skin-tone preservation for a professional and flattering look. Provide only the enhanced image as output.'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate enhanced photo.');
    }

    return {
      enhancedPhotoDataUri: media.url,
    };
  }
);

export async function aiPortraitEnhancement(
  input: AiPortraitEnhancementInput
): Promise<AiPortraitEnhancementOutput> {
  return aiPortraitEnhancementFlow(input);
}
