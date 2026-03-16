export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ reply: "Method not allowed" });

  const { message, tone } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(200).json({ reply: "1. API Key is missing in Vercel.\n2. Please add it to settings.\n3. Then redeploy." });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Reply to this: "${message}" in a ${tone} tone. Give 3 short options. Number them 1. 2. 3. No extra text.`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content) {
      res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      res.status(200).json({ reply: "1. AI is busy.\n2. Please try again.\n3. Check your message content." });
    }
  } catch (err) {
    res.status(500).json({ reply: "1. Connection Error.\n2. " + err.message });
  }
}
