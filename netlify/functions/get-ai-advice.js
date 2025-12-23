const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // We are switching to "gemini-1.5-flash-latest" to avoid the 404 error
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const data = JSON.parse(event.body);
    
    const prompt = `You are a friendly health coach for a Nepali family.
    Food log: ${data.log}. 
    Total calories: ${data.total}. Goal: ${data.limit}. 
    Provide 3 short health tips in English and Romanized Nepali. 
    Keep it under 50 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advice: text }),
    };
  } catch (error) {
    // This logs the specific error to your Netlify dashboard
    console.error("Gemini API Error:", error.message);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "The coach is updating. Please try again in a moment!" }),
    };
  }
};
