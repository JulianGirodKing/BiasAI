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

    if (!article) {
        return res.status(400).json({
            error: "No article text provided."
        });
    }

    const prompt = `Analyze the following news article for political, ideological, or narrative bias.
Identify the bias direction and strength, then give a short reason why.

Respond ONLY with valid JSON:
{
  "verdict": "Left | Leans left | Centrist | Leans right | Right",
  "explanation": "1-2 sentences, each mentioning specific words, phrases, or framing from the article that show the bias. Avoid generalities."
}

Do not include any text before or after the JSON.

Article:
${article}
`;

    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-120b",
                    messages: [
                        {
                            role: "system",
                            content: "You are a news-bias analysis API. Return only the requested JSON object."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.4,
                    response_format: {
                        type: "json_object"
                    },
                    include_reasoning: false
                })
            }
        );

        console.log("Groq status:", response.status);

        const data = await response.json();

        console.log("Full Groq response:", JSON.stringify(data, null, 2));

        // If Groq itself returned an error, show it instead of silently returning {}
        if (!response.ok) {
            console.error("Groq API error:", data);

            return res.status(response.status).json({
                error: "Groq API error",
                details: data
            });
        }

        const resultText = data.choices?.[0]?.message?.content;

        console.log("Raw AI text:", resultText);

        if (!resultText) {
            console.error("Groq response did not contain message content.");

            return res.status(500).json({
                error: "AI returned no usable response.",
                groqResponse: data
            });
        }

        // Extract JSON from the AI response
        let result;

        try {
            const jsonMatch = resultText.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                throw new Error("No JSON object found in AI response.");
            }

            result = JSON.parse(jsonMatch[0]);

        } catch (parseError) {
            console.error("Failed to parse AI JSON:", parseError);
            console.error("AI response was:", resultText);

            return res.status(500).json({
                error: "AI returned invalid JSON.",
                raw: resultText
            });
        }

        // Make sure the AI actually returned the fields we expect
        if (!result.verdict || !result.explanation) {
            console.error("AI JSON missing required fields:", result);

            return res.status(500).json({
                error: "AI response missing verdict or explanation.",
                result: result
            });
        }

        console.log("Final result:", result);

        res.json(result);

    } catch (err) {
        console.error("Server error:", err);

        res.status(500).json({
            error: "Something went wrong.",
            details: err.message
        });
    }
});

// Keep-alive route for Render
app.get("/ping", (req, res) => {
    res.json({ status: "awake" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});