import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  const { message, tone } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!message || message.trim() === "") {
    return res.status(400).json({ reply: "Please enter a message." });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Give 3 short replies in simple Urdu for this message: "${message}". Each reply 1–2 sentences. Tone: ${tone || "friendly"}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("API RESPONSE:", data); // 👈 debug

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI did not respond.";

    res.status(200).json({ reply: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Something went wrong: " + err.message });
  }
}
