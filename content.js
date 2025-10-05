chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extract_article_text") {
        const articleText = document.body.innerText || "";
        sendResponse({ text: articleText });
    }
    return true;
});