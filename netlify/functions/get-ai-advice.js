const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  // This grabs the secret key you just saved in Netlify
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const data = JSON.parse(event.body);
    
    const prompt = `You are a friendly health coach for a family using the app 'SwasthaSukha'. 
    Review this food log: ${data.log}. 
    Total calories: ${data.total}. Daily Goal: ${data.limit}. 
    Provide 3 short, encouraging health tips. Use a mix of English and Romanized Nepali. 
    Keep it friendly and under 60 words total.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ advice: text }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "The coach is currently busy. Try again soon!" }),
    };
  }
};
