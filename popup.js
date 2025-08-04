function getBiasColorFromVerdict(verdict) {
    switch (verdict) {
        case "Very Liberal":
            return "#00008B"; // dark blue
        case "Moderately Liberal":
            return "#87CEFA"; // light blue
        case "Centrist":
            return "#808080"; // gray
        case "Moderately Conservative":
            return "#FFA07A"; // light red
        case "Very Conservative":
            return "#8B0000"; // dark red
        default:
            return "#000000"; // black fallback
    }
}

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
if (biasData.verdict) {
    const color = getBiasColorFromVerdict(biasData.verdict);

    document.getElementById("result").innerText =
        `Verdict: ${biasData.verdict}\nBias Score: ${biasData.bias_score}`;
    document.getElementById("result").style.color = color;
}

