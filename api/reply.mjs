// api/reply.js
export default async function handler(req, res) {
  const { message, tone } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "API key missing" });
  }

  if (!message || message.trim() === "") {
    return res.status(400).json({ reply: "Please enter a message." });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
                  text: `Give 3 short replies in simple Urdu for: "${message}". Tone: ${tone || "friendly"}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("GEMINI:", data);

    if (data.error) {
      return res.status(500).json({
        reply: "Gemini error: " + data.error.message
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map(p => p.text).join(" ") ||
      "AI did not respond.";

    res.status(200).json({ reply: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Server error: " + err.message });
  }
}
