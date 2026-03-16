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
        contents: [{
          parts: [{
            text: `Short ${tone} reply to: "${message}". List 3 options.`
          }]
        }]
      })
    });

    const data = await response.json();
    
    // This checks if the AI actually sent back text
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
      res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      // If the AI is being stubborn, this will tell us
      res.status(200).json({ reply: "1. AI blocked the response.\n2. Try a different message.\n3. Check Google AI Studio for safety settings." });
    }
  } catch (err) {
    res.status(500).json({ reply: "1. Connection Error.\n2. " + err.message });
  }
}
