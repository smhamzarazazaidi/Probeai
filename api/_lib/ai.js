import { GoogleGenerativeAI } from '@google/generative-ai';

let aiInstance = null;

function getAI() {
    if (!aiInstance) {
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            console.error('GEMINI_API_KEY is missing');
            return null;
        }
        aiInstance = new GoogleGenerativeAI(key);
    }
    return aiInstance;
}

export async function callAI(systemPrompt, userMessage, expectJSON = false) {
    const genAI = getAI();
    if (!genAI) throw new Error('AI not initialized');

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: expectJSON ? 0.2 : 0.7,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        });

        const fullPrompt = `${systemPrompt}\n\n${userMessage}`;
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let text = response.text();

        if (expectJSON) {
            text = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
        }
        return text;
    } catch (error) {
        console.error('Standalone AI Error:', error);
        throw error;
    }
}

export function safeParseJSON(text, fallback) {
    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (match) {
            try { return JSON.parse(match[0]); } catch { }
        }
        return fallback;
    }
}
