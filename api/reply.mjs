export default async function handler(req, res) {
  const { message, tone } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ reply: "API key missing" });
  if (!message?.trim()) return res.status(400).json({ reply: "Please enter a message" });

  try {
    // UPDATED MARCH 2026: Using 3.1 Flash-Lite for 2.5x faster speed
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Give exactly 3 short ${tone || "friendly"} replies in Roman Urdu for: "${message}"
              Rules: No English, no numbers, no bullets. Each reply on a new line.`
            }]
          }]
        })
      }
    );

    const data = await response.json();

    // Handle 2026 Rate Limits (429)
    if (response.status === 429) {
      return res.status(429).json({ reply: "Limit reached. Please wait 30 seconds." });
    }

    if (data.error) {
      return res.status(500).json({ reply: "AI Error: " + data.error.message });
    }

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 2026 Clean Logic: Strips markdown stars (*), numbers, and dashes
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
