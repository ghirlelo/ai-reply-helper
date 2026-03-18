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
    // Using the 2026 stable preview endpoint
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
- ONLY Roman Urdu (e.g., "Theek hai", "Kya masla hai?")
- No English words or translations
- No numbers, bullets, or dashes
- No introductory text (Do not say "Here are your replies")
- Each reply on its own new line`
            }]
          }]
        })
      }
    );

    const data = await response.json();

    // 🛑 Handle the "Quota Exceeded" error gracefully
    if (response.status === 429) {
      return res.status(429).json({ reply: "Limit reached. Please wait 60 seconds." });
    }

    if (data.error) {
      return res.status(500).json({ reply: "Gemini Error: " + data.error.message });
    }

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 🧠 ADVANCED CLEANING: 
    // Removes numbers (1.), stars (*), dashes (-), and extra whitespace
    let cleanReplies = text
      .split("\n")
      .map(r => r.replace(/^[0-9.\-\)\s*#]+/, "").trim()) 
      .filter(r => r.length > 2)
      .slice(0, 3);

    // Fallback if the AI returns an empty or weird response
    if (cleanReplies.length === 0) {
      return res.status(200).json({ reply: "Koi jawab nahi mila.\nTry again please.\nKuch masla lag raha hai." });
    }

    return res.status(200).json({
      reply: cleanReplies.join("\n")
    });

  } catch (error) {
    return res.status(500).json({ reply: "Server error: " + error.message });
  }
}
