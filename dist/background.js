"use strict";
(() => {
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      chrome.tabs.create({
        url: chrome.runtime.getURL("dist/options.html")
      });
    }
  });
})();
