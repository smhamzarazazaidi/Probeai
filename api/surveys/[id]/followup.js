import { callAI, safeParseJSON } from '../_lib/ai.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { question_text, answer, survey_goal } = req.body;

        // Improved prompt to prevent endless loops and "thank you" questions
        const systemPrompt = `You are a strategic research assistant. 
    Analyze the user's answer to the question: "${question_text}".
    The overall research goal is: "${survey_goal}".
    
    If the answer is shallow (e.g., "it was good", "nice", "don't know"), generate ONE context-aware probing follow-up question.
    If the answer is detailed or clearly complete, do NOT follow up.
    
    CRITICAL: 
    1. Do NOT follow up if this is already a follow-up (category PROBE).
    2. Do NOT just say "thank you". If you don't have a specific probe, set should_follow_up to false.
    3. Keep probes short and curious.
    
    RETURN JSON ONLY:
    { 
      "should_follow_up": boolean, 
      "follow_up_question": "string|null",
      "reason": "brief explanation"
    }`;

        const userMessage = `SURVEY_GOAL: ${survey_goal}\nLAST_QUESTION: ${question_text}\nUSER_ANSWER: ${answer}`;

        const aiResponse = await callAI(systemPrompt, userMessage, true);
        const result = safeParseJSON(aiResponse, { should_follow_up: false });

        return res.status(200).json({ data: result, error: null });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
