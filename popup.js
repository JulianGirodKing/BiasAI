document.getElementById("analyzeBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.tabs.sendMessage(tab.id, { action: "extract_article_text" }, async (response) => {
            const articleText = response?.text || "";
            console.log("Extracted article length:", articleText.length); // Debug

            document.getElementById("result").innerText = "Analyzing...";
            const biasData = await classifyBias(articleText);

            if (biasData.verdict) {
                document.getElementById("result").innerText =
                    `Verdict: ${biasData.verdict}\nBias Score: ${biasData.bias_score}`;
            } else {
                document.getElementById("result").innerText = "Error: could not determine bias.";
            }
        });
    });
});

async function classifyBias(articleText) {
    const response = await fetch("https://biasai-backend.onrender.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: articleText })
    });

    return await response.json(); // Directly return parsed object
}
