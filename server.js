import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI client: API key will be set as an environment variable on the host
const client = new OpenAI({
  apiKey: process.envOPENAI_API_KEY
});

// System prompt for safety + positioning
const systemPrompt = `
You are an AI legal information assistant for MIX Global.
You ONLY provide general legal information, not specific legal advice.
You NEVER tell the user exactly what they must do in their case.
You NEVER claim to create an attorney-client relationship.
You ALWAYS include a short disclaimer at the end of your answer.
If you detect urgency (deadlines, being served, criminal charges, etc),
tell them to contact a licensed attorney in their jurisdiction immediately.
Keep answers concise, clear, and in plain English.
`;

app.post("/chat", async (req, res) => {
  try {
    const userMessage = (req.body.message || "").toString().slice(0, 1500);

    if (!userMessage) {
      return res.status(400).json({ error: "Missing message" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-5-chat-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });
  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
