// shared.ts
var DEFAULT_POLITICAL_WORDS = ["politics"].map((word) => word.toLowerCase());
var DEFAULT_TWEET_SELECTOR = '[data-testid="cellInnerDiv"]';
function normalizeWordList(words) {
  if (Array.isArray(words)) {
    const sanitized = words.filter((word) => typeof word === "string").map((word) => word.toLowerCase().trim()).filter(Boolean);
    return [...new Set(sanitized)];
  }
  return DEFAULT_POLITICAL_WORDS;
}
export {
  DEFAULT_POLITICAL_WORDS,
  DEFAULT_TWEET_SELECTOR,
  normalizeWordList
};
