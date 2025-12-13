import { GoogleGenAI, Part } from "@google/genai";
import { AspectRatio } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using 'gemini-2.5-flash-image' for image generation
const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image';
// Using 'gemini-2.5-flash' for text optimization tasks
const TEXT_MODEL_NAME = 'gemini-2.5-flash';

interface GenerateOptions {
  prompt: string;
  imageBase64?: string; // Optional base64 image data
  aspectRatio?: AspectRatio;
}

export const generateImageContent = async (options: GenerateOptions): Promise<string> => {
  const { prompt, imageBase64, aspectRatio = AspectRatio.SQUARE } = options;

  const parts: Part[] = [];

  // If there is an input image, add it first (standard practice for image+text prompt)
  if (imageBase64) {
    // Strip data URI prefix if present to get raw base64
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: 'image/png', // Sending as PNG usually works best, Gemini handles conversion
      }
    });
  }

  // Add the text prompt
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
        // responseMimeType is NOT supported for nano banana
        // responseSchema is NOT supported for nano banana
      },
    });

    // Parse response to find the image part
    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const optimizePrompt = async (originalPrompt: string): Promise<string> => {
  if (!originalPrompt.trim()) return "";

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: `You are an expert prompt engineer for AI image generation. 
      Rewrite the following prompt to be more descriptive, detailed, and artistic, suitable for a high-quality image generation model. 
      Enhance lighting, texture, and style descriptors.
      Keep the original intent. 
      Return ONLY the improved prompt text, no explanations.
      
      Original Prompt: "${originalPrompt}"`,
    });

    return response.text?.trim() || originalPrompt;
  } catch (error) {
    console.error("Prompt Optimization Error:", error);
    // Fallback to original prompt if optimization fails
    return originalPrompt;
  }
};
