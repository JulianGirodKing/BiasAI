import newsBiases from './newsbiases.js';

// Keep a reference to the current site's info so analyze button can use it
let currentSiteInfo = null;

// Ensure DOM is ready before accessing elements in the popup
document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => { // gets the active tab in the current window
        if (!tab?.url) return;
        const url = new URL(tab.url);
        const domain = url.hostname.replace(/^www\./, '').toLowerCase();
        currentSiteInfo = Object.entries(newsBiases).find(([key]) =>
            domain.endsWith(key.toLowerCase())
        )?.[1];

        if (currentSiteInfo) {
            const siteBiasElement = document.getElementById("siteBias");
            if (siteBiasElement) {
                siteBiasElement.innerHTML = `
                Sitewide bias: <strong>${currentSiteInfo.verdict || "None assigned"}</strong><br>
                <em>${currentSiteInfo.notes || ""}</em>
                `;
                siteBiasElement.style.backgroundColor = getBiasColorFromVerdict(currentSiteInfo.verdict);
                siteBiasElement.style.color = "white";
            }
        } else {
            const siteBiasElement = document.getElementById("siteBias");
            if (siteBiasElement) siteBiasElement.innerText = "Sitewide bias: Unknown";
        }
    });

    // Wire up analyze button after DOM is ready
    const analyzeBtn = document.getElementById("analyzeBtn");
    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", () => {
            chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                chrome.tabs.sendMessage(tab.id, { action: "extract_article_text" }, async (response) => {

                    const articleText = response?.text || "";

                    console.log("Extracted article length:", articleText.length); // Debug

                    const resultEl = document.getElementById("result");
                    const comparisonEl = document.getElementById("comparison");
                    if (resultEl) resultEl.innerText = "Analyzing...";

                    const biasData = await classifyBias(articleText);

                    const articleVerdict = biasData?.verdict || "Unknown";
                    const siteVerdict = currentSiteInfo?.verdict || "Unknown";

                    if (comparisonEl) {
                        comparisonEl.innerText = compareBiases(siteVerdict, articleVerdict);
                    }


                    if (biasData.verdict) {
                        const color = getBiasColorFromVerdict(biasData.verdict);

                        const explanation =
                            biasData?.explanation ||
                            biasData?.description ||
                            "No explanation provided.";

                        if (resultEl) {
                            resultEl.innerHTML = `
                             <strong>
                                Verdict:
                                <span style="color: ${color}">
                                  ${biasData.verdict}
                                </span>
                             </strong>
                            <br>
                            <span style="font-weight: normal; font-style: normal;">
                             ${explanation}
                             </span>
                            `;
                        }
                    } else {
                        if (resultEl) {
                            resultEl.innerText = "Error: could not determine bias.";
                        }
                    }


                });
            });
        });
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

function compareBiases(siteBias, articleBias) {
    const biasScale = {
        "Left": -2,
        "Leans left": -1,
        "Centrist": 0,
        "Leans right": 1,
        "Right": 2
    };
    console.log("SiteBias" + siteBias)
    console.log("ArticleBias" + articleBias)


    const articleBiasRightInd = biasScale[articleBias];
    const siteBiasRightInd = biasScale[siteBias];

    console.log(articleBiasRightInd)
    console.log(siteBiasRightInd)

    if (articleBiasRightInd > siteBiasRightInd) {
        return "This article leans further to the right than is typical for the source.";
    } else if (articleBiasRightInd < siteBiasRightInd) {
        return "This article leans further to the left than is typical for the source.";
    } else if (articleBiasRightInd == siteBiasRightInd) {
        return "This article's bias is typical for the source.";
    }

}



async function classifyBias(articleText) {
    console.log("Sending article text to backend...");
    console.log("Article length:", articleText.length);

    const response = await fetch("https://biasai-backend.onrender.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: articleText })
    });

    console.log("Backend status:", response.status);

    const data = await response.json();

    console.log("Backend returned:", JSON.stringify(data, null, 2));
    console.log("Backend verdict:", data.verdict);
    console.log("Backend explanation:", data.explanation);

    return data;
}