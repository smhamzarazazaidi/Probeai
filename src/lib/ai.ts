import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAI() {
    if (!aiInstance) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }
        aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiInstance;
}

export async function callAI(
    systemPrompt: string,
    userMessage: string,
    expectJSON: boolean = false
): Promise<string> {
    const ai = getAI();
    try {
        const fullPrompt = `${systemPrompt}\n\n${userMessage}`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: fullPrompt,
            config: {
                temperature: expectJSON ? 0.3 : 0.7,
                maxOutputTokens: 4096,
            }
        });

        let text = response.text ?? '';

        // Strip markdown code fences if expecting JSON
        if (expectJSON) {
            text = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
        }

        return text;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'AI call failed';
        throw new Error(`AI Error: ${message}`);
    }
}

export function safeParseJSON<T>(text: string, fallback: T): T {
    try {
        return JSON.parse(text) as T;
    } catch {
        // Try to extract JSON from within the text
        const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (match) {
            try { return JSON.parse(match[0]) as T; } catch { /* fall through */ }
        }
        return fallback;
    }
}
