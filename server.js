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

    const prompt = `Analyze the following news article for political, ideological, or narrative bias.
Identify the bias direction and strength, then give a short reason why.

Return ONLY a valid JSON object with this structure:
{
  "verdict": "Very Liberal | Moderately Liberal | Centrist | Moderately Conservative | Very Conservative",
  "explanation": "1-2 sentence explanation of why you gave this verdict."
}

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

        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            console.error("Failed to parse JSON:", resultText);
            result = { verdict: "Unknown", explanation: "No explanation available." };
        }

        res.json(result); // ✅ send once
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
