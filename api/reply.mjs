import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, tone } = req.body;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Give me 3 short, ${tone} replies to this message: "${message}". Format as 1. 2. 3.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.status(200).json({ reply: response.text() });

  } catch (error) {
    // Check if the error is a Quota/Rate Limit error
    if (error.status === 429 || error.message.includes("429")) {
      return res.status(429).json({ error: "Daily limit reached. Please try again in a moment." });
    }
    
    console.error(error);
    res.status(500).json({ error: "AI is currently busy. Try again shortly." });
  }
}
