import { GoogleGenAI, Part } from "@google/genai";
import { AspectRatio } from "../types";

// Initialize client-side AI for fallback scenarios
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image';
const TEXT_MODEL_NAME = 'gemini-2.5-flash';

// Server URL - Assumes server.js is running locally on port 3000
const SERVER_API_URL = 'http://localhost:3000/api';

interface GenerateOptions {
  prompt: string;
  imageBase64?: string; // Optional base64 image data
  aspectRatio?: AspectRatio;
}

// --- Main Exported Functions ---

export const generateImageContent = async (options: GenerateOptions): Promise<string> => {
  try {
    // Attempt to call the server-side endpoint
    const response = await fetch(`${SERVER_API_URL}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.image;

  } catch (serverError) {
    console.warn("Backend server unavailable or failed. Falling back to client-side generation.", serverError);
    // Fallback to client-side execution if server fails
    return generateImageContentClient(options);
  }
};

export const optimizePrompt = async (originalPrompt: string): Promise<string> => {
  if (!originalPrompt.trim()) return "";

  try {
    // Attempt to call the server-side endpoint
    const response = await fetch(`${SERVER_API_URL}/optimize-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: originalPrompt }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.optimizedPrompt;

  } catch (serverError) {
    console.warn("Backend server unavailable or failed. Falling back to client-side optimization.", serverError);
    // Fallback to client-side execution if server fails
    return optimizePromptClient(originalPrompt);
  }
};

// --- Client-Side Implementations (Fallback) ---

const generateImageContentClient = async (options: GenerateOptions): Promise<string> => {
  const { prompt, imageBase64, aspectRatio = AspectRatio.SQUARE } = options;
  const parts: Part[] = [];

  if (imageBase64) {
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: 'image/png',
      }
    });
  }

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts },
      config: {
        imageConfig: { aspectRatio },
      },
    });

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
    console.error("Client-side Generation Error:", error);
    throw error;
  }
};

const optimizePromptClient = async (originalPrompt: string): Promise<string> => {
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
    console.error("Client-side Optimization Error:", error);
    return originalPrompt;
  }
};
