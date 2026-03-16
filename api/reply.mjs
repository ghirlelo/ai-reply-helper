import fetch from "node-fetch";

export default async function handler(req, res) {
  const { message, tone } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Make sure a message is provided
  if (!message || message.trim() === "") {
    return res.status(400).json({ reply: "Please enter a message first." });
  }

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
                  text: `Give 3 short reply suggestions in simple Urdu for this message: "${message}". Each reply should be 1–2 sentences. Tone: ${tone || "friendly"}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // Get the AI's response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI did not respond.";

    res.status(200).json({ reply: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Something went wrong: " + err.message });
  }
}
