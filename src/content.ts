import { DEFAULT_POLITICAL_WORDS, DEFAULT_TWEET_SELECTOR, normalizeWordList } from "./shared"

let politicalWords: string[] = [...DEFAULT_POLITICAL_WORDS]
let tweetSelector: string = DEFAULT_TWEET_SELECTOR
let observerStarted = false

function setPoliticalWords(words: unknown): void {
  politicalWords = normalizeWordList(words)
}

function containsPoliticalWord(text: string): boolean {
  if (!politicalWords.length) return false
  const lowerText = text.toLowerCase()
  return politicalWords.some((word) => lowerText.includes(word))
}

function processTweet(tweetElement: Element): void {
  // Collect text from all <span> elements inside the tweet
  const spans = tweetElement.querySelectorAll("span")
  let tweetText = ""
  spans.forEach((span) => {
    tweetText += span.textContent + " "
  })

  if (containsPoliticalWord(tweetText.trim())) {
    if (!tweetElement.classList.contains("blurred-tweet")) {
      tweetElement.classList.add("blurred-tweet")
    }
    ;(tweetElement as HTMLElement).setAttribute("title", "Hover to reveal political content")
  } else if (tweetElement.classList.contains("blurred-tweet")) {
    tweetElement.classList.remove("blurred-tweet")
    ;(tweetElement as HTMLElement).removeAttribute("title")
  }
}

function checkAllTweets(): void {
  const tweets = document.querySelectorAll(tweetSelector)
  tweets.forEach(processTweet)
}

const observer = new MutationObserver((mutations: MutationRecord[]) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return

      const element = node as Element
      if (element.matches && element.matches(tweetSelector)) {
        processTweet(element)
      }

      const tweetElements = element.querySelectorAll ? element.querySelectorAll(tweetSelector) : []
      tweetElements.forEach(processTweet)
    })
  })
})

function startObserver(): void {
  if (observerStarted) return
  observer.observe(document.body, { childList: true, subtree: true })
  observerStarted = true

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkAllTweets, { once: true })
  } else {
    checkAllTweets()
  }
}

function initialize(): void {
  if (!chrome?.storage?.sync) {
    startObserver()
    return
  }

  chrome.storage.sync.get(
    { politicalWords: DEFAULT_POLITICAL_WORDS, tweetSelector: DEFAULT_TWEET_SELECTOR },
    (result: Record<string, unknown>) => {
      if (chrome.runtime?.lastError) {
        startObserver()
        return
      }

      setPoliticalWords(result.politicalWords)
      tweetSelector = (typeof result.tweetSelector === "string" ? result.tweetSelector : null) || DEFAULT_TWEET_SELECTOR
      startObserver()
    }
  )

  chrome.storage.onChanged.addListener((changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName !== "sync") {
      return
    }

    if (Object.prototype.hasOwnProperty.call(changes, "politicalWords")) {
      setPoliticalWords(changes.politicalWords.newValue)
      checkAllTweets()
    }

    if (Object.prototype.hasOwnProperty.call(changes, "tweetSelector")) {
      tweetSelector = (typeof changes.tweetSelector.newValue === "string" ? changes.tweetSelector.newValue : null) || DEFAULT_TWEET_SELECTOR
      checkAllTweets()
    }
  })
}

initialize()
