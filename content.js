chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extract_article_text") {
        // Try common selectors for articles
        const selectors = [
            "article",
            ".post-content",
            ".entry-content",
            "#main-content",
            ".article-body"
        ];

        let articleText = "";

        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.innerText.trim().length > 50) { // ignore tiny elements
                articleText = el.innerText.trim();
                break;
            }
        }

        // Fallback to body if no article found
        if (!articleText) articleText = document.body.innerText || "";

        sendResponse({ text: articleText });
    }
    return true; // keeps channel open for async response
});