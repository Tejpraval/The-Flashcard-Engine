import { GoogleGenAI } from '@google/genai';
const pdfParse = require('pdf-parse');

// Initialize Gemini SDK
// Note: Requires GEMINI_API_KEY environment variable to be set.
const ai = new GoogleGenAI({});

export const parsePdfBuffer = async (dataBuffer: Buffer): Promise<string> => {
  try {
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF.');
  }
};

export const generateFlashcardsFromText = async (text: string, topicName: string) => {
  // Simple chunking - we want to avoid feeding more than max token limits
  // but Gemini typically has high token limits. We will limit text to first 30000 chars for safety/cost.
  const contentToProcess = text.substring(0, 30000);

  const prompt = `
You are an expert teacher. You are tasked with creating high-quality flashcards based on the provided text.
The flashcards MUST use active recall principles and should avoid vague questions.
Focus on: Definitions, Conceptual questions, Why/How questions, Edge cases, and Example-based questions.

Text Context:
${contentToProcess}

Output the flashcards in strict JSON format as an array of objects.
Each object must have the following keys:
- "question" (string)
- "answer" (string)
- "difficulty" (number between 1 and 3)
- "topic" (string, use "${topicName}")
- "tags" (array of strings)

Wait! Do not output any markdown code blocks or additional text. Just output the raw JSON array.
`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.2
        }
    });
    
    let responseText = response.text || "[]";
    // Clean up potential markdown formatting
    if (responseText.startsWith('\`\`\`json')) {
        responseText = responseText.substring(7);
    }
    if (responseText.endsWith('\`\`\`')) {
        responseText = responseText.substring(0, responseText.length - 3);
    }

    const flashcards = JSON.parse(responseText.trim());
    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards with Gemini:', error);
    throw new Error('Failed to generate flashcards.');
  }
};
