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
Be specific about word choice, framing, and missing perspectives. Identify if it leans liberal, conservative, centrist, or other.

${article}

Return:
- Bias Level: (None, Slight, Moderate, Strong)
- Bias Direction: (Liberal, Conservative, Centrist, Other)
- Explanation: [3–5 sentences]
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
                    { role: "system", content: "You are an expert media analyst." },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        const result = data.choices?.[0]?.message?.content || "No response.";

        res.json({ result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
