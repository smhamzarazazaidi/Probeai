import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not found. Please ensure it is set in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

const extractJson = (text: string) => {
  try {
    // Attempt to find JSON block if it's wrapped in markdown
    const jsonMatch = text.match(/```json\s?([\s\S]*?)\s?```/) || text.match(/```\s?([\s\S]*?)\s?```/);
    const cleanText = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(cleanText.trim());
  } catch (e) {
    console.error("Failed to parse JSON from Gemini response:", text);
    throw e;
  }
};

export const generateQuestions = async (description: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 6-8 contextual questions to help a group make this decision: "${description}". The questions should be categorized (e.g., Budget, Timeframe, Preference Scale, Group Dynamic, Risk Tolerance). Return the questions as a JSON array of objects with 'text' and 'category' properties.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The question text" },
            category: { type: Type.STRING, description: "The category of the question" },
          },
          required: ["text", "category"],
        },
      },
    },
  });

  return extractJson(response.text || "[]");
};

export const analyzeResponses = async (context: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the group's responses and provide a final recommendation for the decision.
    Context: ${context}
    Return a JSON object with:
    - verdict_title: A short, catchy title for the recommendation
    - verdict_description: A 1-2 sentence description of why this is the best choice
    - budget_score: 0-100 score for budget alignment (if applicable, else 100)
    - time_score: 0-100 score for time efficiency (if applicable, else 100)
    - group_size_score: 0-100 score for group size fit (if applicable, else 100)
    - insights: An array of 3 objects, each with 'title' and 'description' explaining why this works.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict_title: { type: Type.STRING },
          verdict_description: { type: Type.STRING },
          budget_score: { type: Type.NUMBER },
          time_score: { type: Type.NUMBER },
          group_size_score: { type: Type.NUMBER },
          insights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["title", "description"],
            },
          },
        },
        required: ["verdict_title", "verdict_description", "budget_score", "time_score", "group_size_score", "insights"],
      },
    },
  });

  return extractJson(response.text || "{}");
};
