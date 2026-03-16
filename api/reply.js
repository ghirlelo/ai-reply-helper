export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ reply: "Method not allowed" });

  const { message, tone } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(200).json({ reply: "1. API Key Missing in Vercel." });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "You are a helpful assistant that provides 3 short, polite, and helpful reply suggestions to messages. Always format as a numbered list 1. 2. 3." }]
        },
        contents: [{
          parts: [{ text: `Provide 3 short ${tone} replies for: "${message}"` }]
        }],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content) {
      res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      // If still blocked, this will show the reason in the Vercel logs
      console.error("AI Blocked:", JSON.stringify(data));
      res.status(200).json({ reply: "1. AI is still filtering this.\n2. Try a different message.\n3. Check Google Cloud safety settings." });
    }
  } catch (err) {
    res.status(500).json({ reply: "1. Connection Error.\n2. " + err.message });
  }
}
