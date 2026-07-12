const { GoogleGenAI } = require("@google/genai");

// Check that the Gemini API key is configured in environmental variables
if (!process.env.GEMINI_API_KEY) {
    
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generate(prompt) {
    try {
        // Call the Google GenAI SDK to generate content using the Flash Lite model
        const response = await ai.models.generateContent({
            model: "gemini-flash-lite-latest",
            contents: prompt
        });

        // Formulate a success response payload with the generated text
        return {
            success: true,
            response: response.text
        };

    } catch (error) {
        
        // Return a structured failure object if the API call throws an error
        return {
            success: false,
            response: "AI Generation Failed."
        };
    }
}

module.exports = {
    generate
};