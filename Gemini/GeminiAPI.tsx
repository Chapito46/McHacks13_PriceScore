// GeminiAPI.tsx - Convert to utility function
import { GoogleGenAI } from "@google/genai";

export const callGeminiAPI = async (contents: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({
            apiKey: import.meta.env.VITE_GEMINI_API_KEY
        });

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: "You are a online shopping tool. Your task is to find the best corresponding product to the client description. To do this, you will listen to the customer prompt and suggest three different product that matches its description. You will output it in a json format, where you will list the product name and the model number of the article that is shared accross the multiple merchants and you will also list all the merchant that sell this product. Give also the current price and the url to the item. Here is the client request : " + contents,
        });

        const responseText = result.text || 'No response received';

        await sendToGumloop(responseText, contents);

        return responseText;

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
    const gumloopWebhookUrl = import.meta.env.VITE_GUMLOOP_WEBHOOK_URL;

    try {
        const response = await fetch(gumloopWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: geminiResponse,
            })
        });

        if (!response.ok) {
            throw new Error(`Gumloop API error: ${response.status}`);
        }

        console.log('Successfully sent to Gumloop');
    } catch (error) {
        console.error('Failed to send to Gumloop:', error);
    }
};
