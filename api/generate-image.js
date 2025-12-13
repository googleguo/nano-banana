import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image';

// Configure Vercel to allow larger body sizes for image uploads
// Note: Vercel Free tier has a payload limit of 4.5MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
      res.status(200).json({ image: `data:image/png;base64,${imagePart.inlineData.data}` });
    } else {
      res.status(500).json({ error: "No image data found in response" });
    }

  } catch (error) {
    console.error("Serverless Generation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}