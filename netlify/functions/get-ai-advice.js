const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  try {
    // 1. Initialize the API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 2. Use the "gemini-1.5-flash" model but force the SDK to use the stable v1 endpoint
    // We do this by passing the model name string directly.
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash"
    });

    const data = JSON.parse(event.body);
    
    const prompt = `You are a friendly health coach for a Nepali family.
    Food log: ${data.log}. 
    Total calories: ${data.total}. Goal: ${data.limit}. 
    Provide 3 short health tips in English and Romanized Nepali. 
    Keep it under 50 words.`;

    // 3. Generate Content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advice: text }),
    };
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    
    // If we still get a 404, it might be an API Key region issue
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Coach is resting.", 
        details: error.message 
      }),
    };
  }
};
