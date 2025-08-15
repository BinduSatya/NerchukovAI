const GEMINI_API_KEY = "<GEMINI_API_KEY>";

async function callToGemini(prompt) {
  try {
    console.log(`into callToGemini: ${prompt}`);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],

          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                geminiResponse: {
                  type: "string",
                  description: "The completed code",
                },
              },
              required: ["geminiResponse"],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    let result;
    try {
      result = JSON.parse(raw);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
    console.log("Raw data from Gemini:", data);
    console.log("json parsed data:", result);

    return result;
  } catch (error) {
    console.error("Error generating Gemini content:", error);
    return "Failed to generate content";
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
    return true; // Keep sendResponse alive
  }
});
