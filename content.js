chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extract_article_text") {
        let articleText = "";

        // Step 1: Try known article selectors
        const selectors = [
            "div.article-body",
            "section.content__body",
            "div.article_content",


        ];

        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.innerText.trim().length > 50) { // ignore tiny elements
                articleText = el.innerText.trim();
                break;
            }
        }

        // Step 2: Fallback to body text if no article found
        if (!articleText) {
            articleText = document.body.innerText || "";
        }

        sendResponse({ text: articleText });
    }
    return true; // keeps channel open for async response
});
