const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  try {
    // 1. Initialize with the key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 2. Use Gemini 2.5 Flash (The current stable model for Dec 2025)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash" 
    });

    const data = JSON.parse(event.body);
    
    const prompt = `You are a health coach for a Nepali family.
    Review this food log: ${data.log}. 
    Total: ${data.total} kcal. Goal: ${data.limit}. 
    Provide 3 short, encouraging health tips in English and Romanized Nepali. 
    Keep it under 50 words.`;

    // 3. Generate response
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advice: text }),
    };
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Coach is updating to Gemini 2.5.", 
        details: error.message 
      }),
    };
  }
};
