// Shared constants and utilities
export const DEFAULT_POLITICAL_WORDS = ["politics"].map((word) => word.toLowerCase())
export const DEFAULT_TWEET_SELECTOR = '[data-testid="cellInnerDiv"]'

export function normalizeWordList(words: unknown): string[] {
  if (Array.isArray(words)) {
    const sanitized = words
      .filter((word) => typeof word === "string")
      .map((word) => word.toLowerCase().trim())
      .filter(Boolean)
    return [...new Set(sanitized)]
  }
  return DEFAULT_POLITICAL_WORDS
}
