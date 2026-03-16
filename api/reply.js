export default async function handler(req, res) {
  const { message, tone } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(200).json({ reply: "1. API Key is missing in Vercel settings." });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Write 3 short ${tone} replies for: "${message}". List them as 1. 2. 3.` }] }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content) {
      res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      // This will tell us if Google blocked the message
      res.status(200).json({ reply: "1. AI safety block.\n2. Try a simpler message.\n3. Check API quota." });
    }
  } catch (err) {
    res.status(500).json({ reply: "1. Connection Error.\n2. " + err.message });
  }
}
