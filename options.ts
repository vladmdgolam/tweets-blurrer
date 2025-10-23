import { DEFAULT_POLITICAL_WORDS, DEFAULT_TWEET_SELECTOR } from "./shared"

const wordsInput = document.getElementById("wordsInput") as HTMLTextAreaElement
const selectorInput = document.getElementById("selectorInput") as HTMLInputElement
const saveButton = document.getElementById("saveButton") as HTMLButtonElement
const resetButton = document.getElementById("resetButton") as HTMLButtonElement
const statusLabel = document.getElementById("status") as HTMLDivElement

function showStatus(message: string, isError = false): void {
  statusLabel.textContent = message
  statusLabel.classList.remove("success", "error", "show")
  if (!message) return

  const statusClass = isError ? "error" : "success"
  statusLabel.classList.add(statusClass, "show")

  setTimeout(() => {
    statusLabel.classList.remove("show", statusClass)
    statusLabel.textContent = ""
  }, 2500)
}

function normalizeWordListFromInput(raw: string): string[] {
  const normalized = raw
    .split(/\r?\n/)
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean)
  return [...new Set(normalized)]
}

function populateWordsField(words: unknown): void {
  const source = Array.isArray(words) ? words : DEFAULT_POLITICAL_WORDS
  const cleaned = source.map((word) => (typeof word === "string" ? word : "")).filter(Boolean)
  wordsInput.value = cleaned.join("\n")
}

function populateSelectorField(selector: unknown): void {
  selectorInput.value = (typeof selector === "string" ? selector : null) || DEFAULT_TWEET_SELECTOR
}

function loadSettings(): void {
  if (!chrome?.storage?.sync) {
    populateWordsField(DEFAULT_POLITICAL_WORDS)
    populateSelectorField(DEFAULT_TWEET_SELECTOR)
    return
  }

  chrome.storage.sync.get(
    { politicalWords: DEFAULT_POLITICAL_WORDS, tweetSelector: DEFAULT_TWEET_SELECTOR },
    (result: Record<string, unknown>) => {
      if (chrome.runtime?.lastError) {
        populateWordsField(DEFAULT_POLITICAL_WORDS)
        populateSelectorField(DEFAULT_TWEET_SELECTOR)
        showStatus("Could not load saved settings. Showing defaults.", true)
        return
      }

      populateWordsField(result.politicalWords)
      populateSelectorField(result.tweetSelector)
    }
  )
}

function saveSettings(): void {
  if (!chrome?.storage?.sync) {
    showStatus("Storage permission unavailable.", true)
    return
  }

  const words = normalizeWordListFromInput(wordsInput.value)
  const selector = selectorInput.value.trim() || DEFAULT_TWEET_SELECTOR

  chrome.storage.sync.set({ politicalWords: words, tweetSelector: selector }, () => {
    if (chrome.runtime?.lastError) {
      showStatus("Failed to save changes.", true)
      return
    }

    showStatus("Saved.")
  })
}

function resetSettings(): void {
  if (!chrome?.storage?.sync) {
    populateWordsField(DEFAULT_POLITICAL_WORDS)
    populateSelectorField(DEFAULT_TWEET_SELECTOR)
    showStatus("Reset locally. Storage unavailable.")
    return
  }

  chrome.storage.sync.set(
    { politicalWords: DEFAULT_POLITICAL_WORDS, tweetSelector: DEFAULT_TWEET_SELECTOR },
    () => {
      if (chrome.runtime?.lastError) {
        showStatus("Failed to reset.", true)
        return
      }

      populateWordsField(DEFAULT_POLITICAL_WORDS)
      populateSelectorField(DEFAULT_TWEET_SELECTOR)
      showStatus("Restored defaults.")
    }
  )
}

saveButton.addEventListener("click", saveSettings)
resetButton.addEventListener("click", resetSettings)

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadSettings)
} else {
  loadSettings()
}
