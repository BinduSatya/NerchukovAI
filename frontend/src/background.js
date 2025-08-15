async function callToGemini(prompt) {
  try {
    const response = await fetch("http://localhost:3000/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling backend:", error);
    return { error: "Failed to get Gemini response" };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_ANSWER" || message.type === "GET_HINT") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ text: "No active tab found." });
        return;
      }

      if (tabs.length > 0) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "SCRAPE_DATA" },
          async (response) => {
            if (chrome.runtime.lastError) {
              sendResponse({
                text: "Error: " + chrome.runtime.lastError.message,
              });
              return;
            }

            try {
              const { Heading, Question, Code } = response;
              console.log("From content script:", Heading, Question, Code);

              let prompt;
              if (message.type === "GET_ANSWER") {
                prompt = `You are a helpful code assistant. Read the following question carefully and provide a complete answer:\n\n The heading of the question is ${Heading} and the question is ${Question}\n\n Read the following code carefully:\n\n ${Code} and complete the code in the given language and just return the code.`;
              }
              if (message.type === "GET_HINT") {
                prompt = `You are a helpful code assistant. Read the following question carefully and provide a complete answer:\n\n The heading of the question is ${Heading} and the question is ${Question}\n\n Read the following code carefully:\n\n ${Code} and give 3 hints to complete the code, but don't directly give me the code.`;
              }

              const geminiResponse = await callToGemini(prompt);
              console.log("Gemini Response:", geminiResponse);

              sendResponse({
                success: true,
                data: geminiResponse?.geminiResponse || "No response",
              });
            } catch (error) {
              console.error("Error in background:", error);
              sendResponse({ success: false, error: error.message });
            }
          }
        );
      }
    });
    return true;
  }
});
