// Service worker for handling extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Open options page in a new tab on first install
    chrome.tabs.create({
      url: chrome.runtime.getURL("dist/options.html"),
    })
  }
})
