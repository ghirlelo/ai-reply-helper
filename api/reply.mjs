export default async function handler(req, res) {
  const { message, tone } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ reply: "API key missing" });
  if (!message?.trim()) return res.status(400).json({ reply: "Please enter a message" });

  try {
    // 🚀 MARCH 2026 UPDATE: Using 3.1 Flash-Lite (Highest Free Quota)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Give exactly 3 short ${tone || "friendly"} replies in Roman Urdu for: "${message}"
              Rules: No English, no numbers, no explanations. One reply per line.`
            }]
          }]
        })
      }
    );

    const data = await response.json();

    // 🛑 Handle 429 Rate Limit (Common on Free Tier)
    if (response.status === 429) {
      return res.status(429).json({ reply: "Limit reached! Wait 30 seconds." });
    }

    if (data.error) {
      return res.status(500).json({ reply: "AI Error: " + data.error.message });
    }

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 🧹 Clean numbers (1, 2, 3) or dashes from the start of lines
    let cleanReplies = text
      .split("\n")
      .map(r => r.replace(/^[0-9.\-\)\s*#]+/, "").trim()) 
      .filter(r => r.length > 2)
      .slice(0, 3);

    return res.status(200).json({
      reply: cleanReplies.length > 0 ? cleanReplies.join("\n") : "Try again please."
    });

  } catch (error) {
    return res.status(500).json({ reply: "Server error: " + error.message });
  }
}
