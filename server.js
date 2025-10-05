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
                model: "llama3-8b-8192",
                messages: [
                    { role: "system", content: "You are an API that always returns valid JSON exactly as specified, with no extra text." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.4
            })
        });

        const data = await response.json();
        console.log("Full Groq API response:", data);
        let resultText = data.choices?.[0]?.message?.content || "{}";

        console.log("AI raw output:", resultText); // DEBUG

        // Extract JSON from ```json ... ``` or just { ... }
        const jsonMatch = resultText.match(/```json\s*([\s\S]*?)\s*```/) || resultText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            resultText = jsonMatch[1] || jsonMatch[0];
        }

        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            console.error("Failed to parse JSON:", resultText);
            result = { verdict: "Unknown", explanation: "No explanation available." };
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
