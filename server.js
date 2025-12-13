import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
// Enable CORS to allow requests from the frontend
app.use(cors());
// Increase JSON limit to handle base64 image uploads
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini with API key from environment
// ideally configured in a .env file or environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image';
const TEXT_MODEL_NAME = 'gemini-2.5-flash';

// Endpoint for generating images (Text-to-Image & Image-to-Image)
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, imageBase64, aspectRatio } = req.body;
    
    const parts = [];
    
    // If an image is provided (Image-to-Image / Edit), add it to parts
    if (imageBase64) {
      // Strip data URI prefix to get raw base64
      const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: 'image/png',
        }
      });
    }

    // Add the text prompt
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts },
      config: {
        imageConfig: { aspectRatio },
      },
    });

    // Extract the generated image from the response
    const content = response.candidates?.[0]?.content;
    const imagePart = content?.parts?.find(p => p.inlineData);
    
    if (imagePart?.inlineData?.data) {
      // Return as Data URL
      res.json({ image: `data:image/png;base64,${imagePart.inlineData.data}` });
    } else {
      res.status(500).json({ error: "No image data found in response" });
    }

  } catch (error) {
    console.error("Server Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Endpoint for optimizing prompts
app.post('/api/optimize-prompt', async (req, res) => {
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
    res.json({ optimizedPrompt });

  } catch (error) {
    console.error("Server Optimization Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});