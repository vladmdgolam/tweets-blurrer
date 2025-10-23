// shared.ts
var DEFAULT_POLITICAL_WORDS = ["politics"].map((word) => word.toLowerCase());
var DEFAULT_TWEET_SELECTOR = '[data-testid="cellInnerDiv"]';

// options.ts
var wordsInput = document.getElementById("wordsInput");
var selectorInput = document.getElementById("selectorInput");
var saveButton = document.getElementById("saveButton");
var resetButton = document.getElementById("resetButton");
var statusLabel = document.getElementById("status");
function showStatus(message, isError = false) {
  statusLabel.textContent = message;
  statusLabel.classList.remove("success", "error", "show");
  if (!message) return;
  const statusClass = isError ? "error" : "success";
  statusLabel.classList.add(statusClass, "show");
  setTimeout(() => {
    statusLabel.classList.remove("show", statusClass);
    statusLabel.textContent = "";
  }, 2500);
}
function normalizeWordListFromInput(raw) {
  const normalized = raw.split(/\r?\n/).map((word) => word.trim().toLowerCase()).filter(Boolean);
  return [...new Set(normalized)];
}
function populateWordsField(words) {
  const source = Array.isArray(words) ? words : DEFAULT_POLITICAL_WORDS;
  const cleaned = source.map((word) => typeof word === "string" ? word : "").filter(Boolean);
  wordsInput.value = cleaned.join("\n");
}
function populateSelectorField(selector) {
  selectorInput.value = (typeof selector === "string" ? selector : null) || DEFAULT_TWEET_SELECTOR;
}
function loadSettings() {
  if (!chrome?.storage?.sync) {
    populateWordsField(DEFAULT_POLITICAL_WORDS);
    populateSelectorField(DEFAULT_TWEET_SELECTOR);
    return;
  }
  chrome.storage.sync.get(
    { politicalWords: DEFAULT_POLITICAL_WORDS, tweetSelector: DEFAULT_TWEET_SELECTOR },
    (result) => {
      if (chrome.runtime?.lastError) {
        populateWordsField(DEFAULT_POLITICAL_WORDS);
        populateSelectorField(DEFAULT_TWEET_SELECTOR);
        showStatus("Could not load saved settings. Showing defaults.", true);
        return;
      }
      populateWordsField(result.politicalWords);
      populateSelectorField(result.tweetSelector);
    }
  );
}
function saveSettings() {
  if (!chrome?.storage?.sync) {
    showStatus("Storage permission unavailable.", true);
    return;
  }
  const words = normalizeWordListFromInput(wordsInput.value);
  const selector = selectorInput.value.trim() || DEFAULT_TWEET_SELECTOR;
  chrome.storage.sync.set({ politicalWords: words, tweetSelector: selector }, () => {
    if (chrome.runtime?.lastError) {
      showStatus("Failed to save changes.", true);
      return;
    }
    showStatus("Saved.");
  });
}
function resetSettings() {
  if (!chrome?.storage?.sync) {
    populateWordsField(DEFAULT_POLITICAL_WORDS);
    populateSelectorField(DEFAULT_TWEET_SELECTOR);
    showStatus("Reset locally. Storage unavailable.");
    return;
  }
  chrome.storage.sync.set(
    { politicalWords: DEFAULT_POLITICAL_WORDS, tweetSelector: DEFAULT_TWEET_SELECTOR },
    () => {
      if (chrome.runtime?.lastError) {
        showStatus("Failed to reset.", true);
        return;
      }
      populateWordsField(DEFAULT_POLITICAL_WORDS);
      populateSelectorField(DEFAULT_TWEET_SELECTOR);
      showStatus("Restored defaults.");
    }
  );
}
saveButton.addEventListener("click", saveSettings);
resetButton.addEventListener("click", resetSettings);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadSettings);
} else {
  loadSettings();
}
