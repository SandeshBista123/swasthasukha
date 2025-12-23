const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  try {
    // Initialize with the API Key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Explicitly using the stable model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const data = JSON.parse(event.body);
    
    const prompt = `You are a friendly health coach for a Nepali family using the app 'SwasthaSukha'. 
    Food log: ${data.log}. 
    Total calories: ${data.total}. Goal: ${data.limit}. 
    Provide 3 short, encouraging health tips in a mix of English and Romanized Nepali. 
    Keep it under 60 words.`;

    // Request generation
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
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "The coach is currently updating. Please try again in a minute!" }),
    };
  }
};
