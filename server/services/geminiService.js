const { GoogleGenAI } = require("@google/genai");

// Validate API key on startup
if (!process.env.GEMINI_API_KEY) {
    
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generate(prompt) {
    try {
        // Use the correct method for the new @google/genai SDK
        const response = await ai.models.generateContent({
            model: "gemini-flash-lite-latest",
            contents: prompt
        });

        // Return a simple standardized object
        return {
            success: true,
            response: response.text
        };

    } catch (error) {
        
        // Return structured failure instead of throwing an error to prevent the whole app from crashing
        return {
            success: false,
            response: "AI Generation Failed."
        };
    }
}

module.exports = {
    generate
};