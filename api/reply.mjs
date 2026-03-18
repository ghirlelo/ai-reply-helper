export default async function handler(req, res) {
  const { message, tone } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ reply: "API key missing" });
  if (!message || message.trim() === "")
    return res.status(400).json({ reply: "Please enter a message" });

  // Detect if message is mostly English
  const englishLetters = message.replace(/[^A-Za-z]/g, "").length;
  const totalLetters = message.replace(/[^A-Za-z\u0600-\u06FF]/g, "").length;
  const isEnglish = englishLetters / (totalLetters || 1) > 0.6;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Give exactly 3 short ${tone || "friendly"} replies in the SAME STYLE as the message. 

- If the message is in English, reply in English.
- If the message is in Roman Urdu (Urdu written in Latin letters), reply in Roman Urdu.
- Keep it natural, casual, and short.
- No explanation, headings, numbering, or quotes.
- Each reply on a new line.
Message: "${message}"`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ reply: "Gemini Error: " + data.error.message });
    }

    let text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI did not respond.";

    // Clean output
    let cleanReplies = text
      .split("\n")
      .map(r => r.replace(/^[0-9.\-\)\s]+/, "").trim())
      .filter(r => r !== "")
      .slice(0, 3);

    return res.status(200).json({ reply: cleanReplies.join("\n") });

  } catch (error) {
    return res.status(500).json({ reply: "Server error: " + error.message });
  }
}
