import express from 'express';
import cors from 'cors';
// If Node 18+, you can remove node-fetch import and use global fetch
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/analyze', async (req, res) => {
    const article = req.body.text;

    const prompt = `
Analyze the following news article for political bias.
Respond ONLY with a JSON object in this format:

{
  "verdict": "Very Liberal | Moderately Liberal | Centrist | Moderately Conservative | Very Conservative",
  "bias_score": 0-100
}

Rules:
- bias_score: 0 = Very Liberal, 100 = Very Conservative.
- Do not include anything except the JSON object.

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
                model: "llama3-8b-8192",
                messages: [
                    { role: "system", content: "You are an expert political media analyst. Always return valid JSON exactly as requested." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.4
            })
        });

        const data = await response.json();
        let resultText = data.choices?.[0]?.message?.content || "{}";

        // Try parsing JSON from AI
        let parsed;
        try {
            parsed = JSON.parse(resultText);
        } catch (jsonErr) {
            console.error("Error parsing AI JSON:", jsonErr);
            return res.status(500).json({ error: "Invalid JSON returned from AI", raw: resultText });
        }

        res.json(parsed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

// Keep-alive route
app.get("/ping", (req, res) => {
    res.json({ status: "awake" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
