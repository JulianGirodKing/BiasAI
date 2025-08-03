document.getElementById("analyzeBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.tabs.sendMessage(tab.id, { action: "extract_article_text" }, async (response) => {
            const articleText = response?.text || "";
            document.getElementById("result").innerText = "Analyzing...";
            const bias = await classifyBias(articleText);
            document.getElementById("result").innerText = "Bias: " + bias;
        });
    });
});
async function classifyBias(articleText) {
    const response = await fetch("https://your-deployed-backend.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: articleText })
    });

    const data = await response.json();
    return data.result || "Unknown";
}
