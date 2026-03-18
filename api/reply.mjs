export default async function handler(req, res) {
  const { message, tone } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "API key missing" });
  }

  if (!message || message.trim() === "") {
    return res.status(400).json({ reply: "Please enter a message" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Give exactly 3 short ${tone || "friendly"} replies in Roman Urdu to this: "${message}"

Rules:
- Roman Urdu only (e.g., "Kya hal hai?")
- No English translations
- No numbers (1, 2, 3) or bullet points
- No quotes or hashtags
- One reply per line`
            }]
          }]
        })
      }
    );

    // 🛑 Check for 429 Resource Exhausted (Free Tier Limit)
    if (response.status === 429) {
      return res.status(429).json({ reply: "Limit reached. Please wait 60 seconds." });
    }

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ reply: "Gemini Error: " + data.error.message });
    }

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI did not respond.";

    // 🧹 PRO CLEANING: Removes numbers, stars, and dashes from the start of lines
    let cleanReplies = text
      .split("\n")
      .map(r => r.replace(/^[0-9.\-\)\s*#]+/, "").trim()) 
      .filter(r => r.length > 2)
      .slice(0, 3);

    return res.status(200).json({
      reply: cleanReplies.join("\n")
    });

  } catch (error) {
    return res.status(500).json({ reply: "Server error: " + error.message });
  }
}
