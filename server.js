app.post('/analyze', async (req, res) => {
    const article = req.body.text;

    const prompt = `Analyze the following news article for political, ideological, or narrative bias.
Identify the bias direction and strength, then give a short reason why.

Respond ONLY with valid JSON inside triple backticks like this:
\\\`\\\`\\\`json
{
  "verdict": "Very Liberal | Moderately Liberal | Centrist | Moderately Conservative | Very Conservative",
  "explanation": "1-2 sentence explanation of why you gave this verdict."
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
        let resultText = data.choices?.[0]?.message?.content || "{}";

        console.log("AI raw output:", resultText); // DEBUG

        // Extract JSON if inside ```json ... ```
        const jsonMatch = resultText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            resultText = jsonMatch[1];
        }

        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            console.error("Failed to parse JSON:", resultText);
            result = { verdict: "Unknown", explanation: "No explanation available." };
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});
