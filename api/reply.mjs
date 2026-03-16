import fetch from "node-fetch";

export default async function handler(req, res) {
  const { message, tone } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!message || message.trim() === "") {
    return res.status(400).json({ reply:"Please enter a message." });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          contents:[{
            parts:[{
              text: `Just give 3 short, casual replies for this message exactly as responses, without any intro or explanation. Write them ${tone || "friendly"} and in simple Urdu (Roman script): "${message}"` 
            }]
          }]
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI did not respond.";

    res.status(200).json({ reply:text });
  } catch(err) {
    console.error(err);
    res.status(500).json({ reply:"Something went wrong: "+err.message });
  }
}
