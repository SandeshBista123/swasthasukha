const { createGoogleGenerativeAI } = require("@google/genai");

exports.handler = async (event) => {
  try {
    // New initialization method for the latest SDK
    const client = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    // Use the brand new Gemini 3 Flash model
    const model = client.getGenerativeModel({ model: "gemini-3-flash" });

    const data = JSON.parse(event.body);
    
    const prompt = `You are a health coach for a Nepali family. 
    Food log: ${data.log}. Goal: ${data.limit} kcal. 
    Give 3 short tips in English/Romanized Nepali. Keep it under 50 words.`;

    // New generation method
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advice: text }),
    };
  } catch (error) {
    console.error("Gemini 3 Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "The coach is refreshing for Gemini 3. Try again in a second!" }),
    };
  }
};
