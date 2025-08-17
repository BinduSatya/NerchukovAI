async function getSolution({ Heading, Question, Code }) {
  try {
    const res = await fetch("http://localhost:3000/gemini/getSolution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Heading, Question, Code }),
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    console.log("Solution: ", data);
    return data;
  } catch (error) {
    console.error("Error calling backend (solution):", error);
    return { error: "Failed to get Gemini response" };
  }
}

async function getHints({ Heading, Question, Code }) {
  try {
    const res = await fetch("http://localhost:3000/gemini/getHints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Heading, Question, Code }),
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    console.log("Hints: ", data);
    return data;
  } catch (error) {
    console.error("Error calling backend (hints):", error);
    return { error: "Failed to get Gemini response" };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const allowedPatterns = ["https://leetcode.com/problems/"];
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    const isAllowed = allowedPatterns.some((pattern) =>
      url.startsWith(pattern)
    );
    if (!isAllowed) {
      sendResponse("*");
      return true;
    } else {
      if (tabs.length === 0) {
        sendResponse({ success: false, error: "No active tab found." });
        return;
      }

      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "SCRAPE_DATA" },
        async (response) => {
          if (chrome.runtime.lastError) {
            console.log("Error in scrapeing data", chrome.runtime.lastError);
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
            return;
          }

          try {
            const { Heading, Question, Code } = response || {};
            console.log(
              "Scraped from content script:",
              Heading,
              Question,
              Code
            );

            if (message.type === "GET_QUESTION") {
              console.log("getting question", { Heading, Question });
              sendResponse({
                success: true,
                data: { Heading, Question },
              });
            } else if (message.type === "GET_ANSWER") {
              console.log("getting answer");
              const solution = await getSolution({ Heading, Question, Code });
              console.log("Solution received:", solution);
              sendResponse({
                success: true,
                data: solution.geminiSolution || solution,
              });
            } else if (message.type === "GET_HINT") {
              console.log("getting hints");
              const hints = await getHints({ Heading, Question, Code });
              console.log("Hints received:", hints);
              sendResponse({
                success: true,
                data: hints.geminiHints || hints,
              });
            }
          } catch (error) {
            console.error("Error in background handler:", error);
            sendResponse({ success: false, error: error.message });
          }
        }
      );
    }
  });

  return true;
});
