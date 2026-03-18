export default async function handler(req, res) {
  // 1. Get data from frontend
  const { message, tone } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  // 2. Security & Input Checks
  if (!apiKey) {
    return res.status(500).json({ reply: "Error: GROQ_API_KEY is missing in Vercel settings." });
  }

  if (!message || message.trim() === "") {
    return res.status(400).json({ reply: "Please enter a message to get started." });
  }

  try {
    // 3. Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // Powerful model with high free limits
        messages: [
          {
            role: "system",
            content: "You are a helpful chat assistant. Give exactly 3 short, natural replies in Roman Urdu. No English, no numbers, no explanations. Each reply on a new line."
          },
          {
            role: "user",
            content: `Give 3 ${tone || "friendly"} replies for: "${message}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();

    // 🛑 Handle Groq Rate Limits (429)
    if (response.status === 429) {
      return res.status(429).json({ reply: "Groq is busy. Please wait a few seconds." });
    }

    if (data.error) {
      return res.status(500).json({ reply: "Groq Error: " + data.error.message });
    }

    // 4. Get the AI text
    let text = data.choices?.[0]?.message?.content || "AI did not respond.";

    // 🧹 Clean output (removes numbers, bullets, or extra symbols)
    let cleanReplies = text
      .split("\n")
      .map(r => r.replace(/^[0-9.\-\)\s*#]+/, "").trim()) 
      .filter(r => r.length > 2)
      .slice(0, 3);

    // 5. Send back to app
    return res.status(200).json({
      reply: cleanReplies.join("\n")
    });

  } catch (error) {
    return res.status(500).json({
      reply: "Server error: " + error.message
    });
  }
}
