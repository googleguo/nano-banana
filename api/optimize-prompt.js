import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL_NAME = 'gemini-2.5-flash';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: `You are an expert prompt engineer for AI image generation. 
      Rewrite the following prompt to be more descriptive, detailed, and artistic, suitable for a high-quality image generation model. 
      Enhance lighting, texture, and style descriptors.
      Keep the original intent. 
      Return ONLY the improved prompt text, no explanations.
      
      Original Prompt: "${prompt}"`,
    });

    const optimizedPrompt = response.text?.trim() || prompt;
    res.status(200).json({ optimizedPrompt });

  } catch (error) {
    console.error("Serverless Optimization Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}