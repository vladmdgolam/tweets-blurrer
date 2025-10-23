// src/shared.ts
var DEFAULT_POLITICAL_WORDS = ["politics"].map((word) => word.toLowerCase());
var DEFAULT_TWEET_SELECTOR = '[data-testid="cellInnerDiv"]';
function normalizeWordList(words) {
  if (Array.isArray(words)) {
    const sanitized = words.filter((word) => typeof word === "string").map((word) => word.toLowerCase().trim()).filter(Boolean);
    return [...new Set(sanitized)];
  }
  return DEFAULT_POLITICAL_WORDS;
}

// src/content.ts
var politicalWords = [...DEFAULT_POLITICAL_WORDS];
var tweetSelector = DEFAULT_TWEET_SELECTOR;
var observerStarted = false;
function setPoliticalWords(words) {
  politicalWords = normalizeWordList(words);
}
function containsPoliticalWord(text) {
  if (!politicalWords.length) return false;
  const lowerText = text.toLowerCase();
  return politicalWords.some((word) => lowerText.includes(word));
}
function processTweet(tweetElement) {
  const spans = tweetElement.querySelectorAll("span");
  let tweetText = "";
  spans.forEach((span) => {
    tweetText += span.textContent + " ";
  });
  if (containsPoliticalWord(tweetText.trim())) {
    if (!tweetElement.classList.contains("blurred-tweet")) {
      tweetElement.classList.add("blurred-tweet");
    }
    ;
    tweetElement.setAttribute("title", "Hover to reveal political content");
  } else if (tweetElement.classList.contains("blurred-tweet")) {
    tweetElement.classList.remove("blurred-tweet");
    tweetElement.removeAttribute("title");
  }
}
function checkAllTweets() {
  const tweets = document.querySelectorAll(tweetSelector);
  tweets.forEach(processTweet);
}
var observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node;
      if (element.matches && element.matches(tweetSelector)) {
        processTweet(element);
      }
      const tweetElements = element.querySelectorAll ? element.querySelectorAll(tweetSelector) : [];
      tweetElements.forEach(processTweet);
    });
  });
});
function startObserver() {
  if (observerStarted) return;
  observer.observe(document.body, { childList: true, subtree: true });
  observerStarted = true;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkAllTweets, { once: true });
  } else {
    checkAllTweets();
  }
}
function initialize() {
  if (!chrome?.storage?.sync) {
    startObserver();
    return;
  }
  chrome.storage.sync.get(
    { politicalWords: DEFAULT_POLITICAL_WORDS, tweetSelector: DEFAULT_TWEET_SELECTOR },
    (result) => {
      if (chrome.runtime?.lastError) {
        startObserver();
        return;
      }
      setPoliticalWords(result.politicalWords);
      tweetSelector = (typeof result.tweetSelector === "string" ? result.tweetSelector : null) || DEFAULT_TWEET_SELECTOR;
      startObserver();
    }
  );
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") {
      return;
    }
    if (Object.prototype.hasOwnProperty.call(changes, "politicalWords")) {
      setPoliticalWords(changes.politicalWords.newValue);
      checkAllTweets();
    }
    if (Object.prototype.hasOwnProperty.call(changes, "tweetSelector")) {
      tweetSelector = (typeof changes.tweetSelector.newValue === "string" ? changes.tweetSelector.newValue : null) || DEFAULT_TWEET_SELECTOR;
      checkAllTweets();
    }
  });
}
initialize();
