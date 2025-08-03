// utils/geminiClient.js
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBH_LNpDapUXkN20l-Pibh7QSw-1-EN6TI";
// utils/geminiClient.js

// Updated API URL with correct model name
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export const generateFromGemini = async (prompt) => {
 const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      response_mime_type: "application/json" // Request JSON response
    }
  };

  try {
    const response = await axios.post(GEMINI_API_URL, requestBody);
    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return generatedText;
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw new Error('Failed to generate content from Gemini API');
  }
};

