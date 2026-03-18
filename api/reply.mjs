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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Give exactly 3 short ${tone || "friendly"} replies in Roman Urdu to this message: "${message}"

Rules:
- No explanation
- No headings
- No numbering
- No quotes
- Each reply on a new line
- Keep it natural and casual`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({
        reply: "Gemini Error: " + data.error.message
      });
    }

    let text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI did not respond.";

    // 🧠 CLEAN OUTPUT (important fix)
    let cleanReplies = text
      .split("\n")
      .map(r => r.replace(/^[0-9.\-\)\s]+/, "").trim()) // remove numbers like "1. "
      .filter(r => r !== "")
      .slice(0, 3);

    return res.status(200).json({
      reply: cleanReplies.join("\n")
    });

  } catch (error) {
    return res.status(500).json({
      reply: "Server error: " + error.message
    });
  }
}
