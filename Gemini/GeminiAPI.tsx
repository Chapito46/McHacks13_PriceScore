// GeminiAPI.tsx - Convert to utility function
import { GoogleGenAI } from "@google/genai";
import { GumloopStartResponse, GumloopRunData } from "../Gumloop/Gumloop_types.ts";

function cleanJsonResponse(text : string) {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Trim whitespace
    cleaned = cleaned.trim();

    return cleaned;
}

export const callGeminiAPI = async (contents: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({
            apiKey: import.meta.env.VITE_GEMINI_API_KEY
        });

        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "You are a online shopping tool. Your task is to find the best corresponding product to the client description. To do this, you will listen to the customer prompt and suggest three different product that matches its description.Return ONLY valid JSON array like this:\n" +
                "        [{\"name\": \"Product Name\", \"product_number\": \"Product Number\", \"description\": \"desc\", \"price\": 29.99}]` The short description should include cons and pros. Give also the current price and the url to the item. Here is the client request : " + contents,
        });
        const responseText = result.text || 'No response received';
        const data = await sendToGumloop(responseText, contents) || "No Id";
        return data;

    } catch (err: unknown) {
        console.error('Error calling Gemini API:', err);

        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
};
const sendToGumloop = async (geminiResponse: string, originalQuery: string) => {
    console.log(geminiResponse)
    const cleaned = cleanJsonResponse(geminiResponse);
    const article = JSON.parse(cleaned);
        const userId = import.meta.env.VITE_GUMLOOP_USER_ID || '';
        const savedItemId = import.meta.env.VITE_GUMLOOP_SAVED_ITEM_ID || '';
        const apiKey = import.meta.env.VITE_GUMLOOP_API_KEY || '';

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                query: originalQuery,
                search_query: article[0].product_number + " " + article[0].name,
                timestamp: new Date().toISOString()
            })
        };

        const response = await fetch(
            `https://api.gumloop.com/api/v1/start_pipeline?user_id=${userId}&saved_item_id=${savedItemId}`,
            options
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gumloop API error: ${response.status} - ${errorText}`);
        }

        const data: GumloopStartResponse = await response.json();
        return data.run_id || '';

};
export const getGumloopResults = async (runId: string): Promise<GumloopRunData> => {
    const userId = import.meta.env.VITE_GUMLOOP_USER_ID;
    const apiKey = import.meta.env.VITE_GUMLOOP_API_KEY;
    const url = `https://api.gumloop.com/api/v1/get_pl_run?run_id=${runId}&user_id=${userId}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to get results: ${response.status}`);
    }
    const runData: GumloopRunData = await response.json();
    return runData;
}
export const pollForResults = async (
    runId: string,
    maxAttempts: number = 30,
    interval: number = 2000
): Promise<any> => {
    for (let i = 0; i < maxAttempts; i++) {
        const runData = await getGumloopResults(runId);

        console.log(`Poll attempt ${i + 1}/${maxAttempts} - Status:`, runData.state);

        if (runData.state === 'DONE') {
            console.log('Pipeline completed. Outputs:', runData.outputs);
            return runData.outputs;
        }

        if (runData.state === 'FAILED' || runData.state === 'TERMINATED') {
            throw new Error(`Pipeline ${runData.state.toLowerCase()}: ${runData.error || 'Unknown error'}`);
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Pipeline timed out after maximum attempts');
};