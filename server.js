import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/analyze', async (req, res) => {
    const article = req.body.text;

    const prompt = `Analyze the following news article for political, ideological, or narrative bias.
Identify the bias direction and strength, then give a short reason why.

Respond ONLY with valid JSON inside triple backticks like this:
\\\`\\\`\\\`json
{
  "verdict": "Very Liberal | Moderately Liberal | Centrist | Moderately Conservative | Very Conservative",
  "explanation": "1-2 sentences, each mentioning specific words, phrases, or framing from the article that show the bias. Avoid generalities."

}
\\\`\\\`\\\`

Do not include any text before or after the JSON.

Article:
${article}
`;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are an API that always returns valid JSON exactly as specified, with no extra text." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.4
            })
        });

        const data = await response.json();
        let resultText = data.choices?.[0]?.message?.content || "{}";
        console.log("Raw AI text:", resultText);

        console.log("AI raw output:", resultText); // DEBUG

        // Extract JSON object from the AI output
        let result = { verdict: "Unknown", explanation: "No explanation available." };
        try {
            // Match anything that looks like { ... } even if there are spaces/newlines
            const jsonMatch = resultText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.error("Failed to parse JSON:", resultText, e);
        }

        // Send the parsed result back to the client
        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

// Keep-alive route for Render
app.get("/ping", (req, res) => {
    res.json({ status: "awake" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
