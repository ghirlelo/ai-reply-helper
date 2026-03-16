export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ reply: "Method not allowed" });

  const { message, tone } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Reply to: "${message}" in a ${tone} tone. Give 3 short options. Number them 1. 2. 3. No extra talk.`
          }]
        }]
      })
    });

    const data = await response.json();
    
    // Better error checking
    if (data.candidates && data.candidates[0].content) {
      res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      // If AI blocks it or fails, we'll see why in the logs
      console.log("AI Data:", JSON.stringify(data));
      res.status(200).json({ reply: "1. Noted, I'll join.\n2. Thanks for the update.\n3. I'll be there for the DLD lab." });
    }
  } catch (err) {
    res.status(500).json({ reply: "Connection Error: " + err.message });
  }
}
