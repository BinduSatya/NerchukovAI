chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCRAPE_DATA") {
    console.log("contents > scrapeData");
    try {
      const questionHeading =
        document.getElementsByClassName("text-title-large")[0]?.innerText ||
        "No heading found";
      const questionText =
        document.getElementsByClassName("elfjS")[0]?.innerText ||
        "No question text found";
      const writtenCode = document.getElementsByClassName("view-lines")[0];
      const children = writtenCode
        ? writtenCode.querySelectorAll(":scope > div")
        : [];
      const texts = Array.from(children)
        .map((child) => child.innerText.trim())
        .join(" ");

      console.log("Scraped data:", {
        Heading: questionHeading,
        Question: questionText,
        Code: texts,
      });

      console.log("contents > Scraped data:", {
        Heading: questionHeading,
        Question: questionText,
        Code: texts,
      });

      sendResponse({
        Heading: `${questionHeading}`,
        Question: `${questionText}`,
        Code: `${texts}`,
      });
    } catch (error) {
      sendResponse({ text: "Error extracting data: " + error.message });
    }
  }
  return true;
});
