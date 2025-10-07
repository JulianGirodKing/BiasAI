import newsBiases from './newsbiases.js';

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    const url = new URL(tab.url);
    const domain = url.hostname.replace('www.', '');
    const siteInfo = newsBiases[domain];

    if (siteInfo) {
        document.getElementById("siteBias").innerHTML = `
            Sitewide bias: <strong>${siteInfo.bias}</strong><br>
            <em>${siteInfo.notes}</em>
        `;
    } else {
        document.getElementById("siteBias").innerText = "Sitewide bias: Unknown";
    }
});



function getBiasColorFromVerdict(verdict) {
    switch (verdict) {
        case "Left":
            return "#00008B"; // dark blue
        case "Leans left":
            return "#87CEFA"; // light blue
        case "Centrist":
            return "#808080"; // gray
        case "Leans right":
            return "#FFA07A"; // light red
        case "Right":
            return "#8B0000"; // dark red
        default:
            return "#000000"; // black fallback
    }
}

document.getElementById("analyzeBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        // 1️⃣ Get the article text
        chrome.tabs.sendMessage(tab.id, { action: "extract_article_text" }, async (response) => {
            const articleText = response?.text || "";
            document.getElementById("result").innerText = "Analyzing...";

            // 2️⃣ Get AI bias for the article
            const biasData = await classifyBias(articleText);

            // 3️⃣ Combine with sitewide bias
            const url = new URL(tab.url);
            const domain = url.hostname.replace("www.", "");
            const siteInfo = newsBiases[domain];

            // Display sitewide bias
            if (siteInfo) {
                document.getElementById("siteBias").innerHTML = `
                    Sitewide bias: <strong>${siteInfo.bias}</strong><br>
                    <em>${siteInfo.notes}</em>
                `;
            } else {
                document.getElementById("siteBias").innerText = "Sitewide bias: Unknown";
            }

            // Display article-specific bias
            if (biasData.verdict) {
                const color = getBiasColorFromVerdict(biasData.verdict);

                document.getElementById("result").innerHTML =
                    `Article bias: <span style="color: ${color}">${biasData.verdict}</span><br>
                     <em>${biasData.explanation}</em>`;
            } else {
                document.getElementById("result").innerText =
                    siteInfo
                        ? `Article bias could not be determined, but sitewide bias is <strong>${siteInfo.bias}</strong>`
                        : "Error: could not determine bias.";
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
