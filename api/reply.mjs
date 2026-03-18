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
    // UPDATED 2026 ENDPOINT: Using 3.1 Flash-Lite for better free tier reliability
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Give exactly 3 short ${tone || "friendly"} replies in Roman Urdu to: "${message}"

Rules:
- Natural Roman Urdu ONLY (no English)
- No headings, numbers, or bullets
- No introductory text or quotes
- Each reply on a new line`
            }]
          }]
        })
      }
    );

    const data = await response.json();

    // 🛑 2026 Rate Limit Check
    if (response.status === 429) {
      return res.status(429).json({ reply: "Wait 60 seconds for quota reset." });
    }

    if (data.error) {
      return res.status(500).json({ reply: "Gemini Error: " + data.error.message });
    }

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 🧠 2026 CLEANING LOGIC (Strips all markdown symbols and numbers)
    let cleanReplies = text
      .split("\n")
      .map(r => r.replace(/^[0-9.\-\)\s*#]+/, "").trim()) 
      .filter(r => r.length > 2)
      .slice(0, 3);

    return res.status(200).json({
      reply: cleanReplies.length > 0 ? cleanReplies.join("\n") : "Try again with a different message."
    });

  } catch (error) {
    return res.status(500).json({ reply: "Server error: " + error.message });
  }
}
