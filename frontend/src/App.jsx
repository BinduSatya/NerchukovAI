import { useState } from "react";

function App() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetAnswer = () => {
    setLoading(true);
    chrome.runtime.sendMessage({ type: "GET_ANSWER" }, (response) => {
      if (chrome.runtime.lastError) {
        setOutput("Error: " + chrome.runtime.lastError.message);
        setLoading(false);
        return;
      }
      if (response.success === true) {
        console.log("response from background script:", response);
        setOutput(response.data);
      } else {
        setOutput("Error: " + response.error);
      }

      setLoading(false);
    });
  };

  const handleGetHint = () => {
    setLoading(true);
    chrome.runtime.sendMessage({ type: "GET_HINT" }, (response) => {
      if (chrome.runtime.lastError) {
        setOutput("Error: " + chrome.runtime.lastError.message);
        setLoading(false);
        return;
      }
      if (response.success === true) {
        console.log("response from background script:", response);
        setOutput(response.data);
      } else {
        setOutput("Error: " + response.error);
      }
      setLoading(false);
    });
  };

  return (
    <div style={{ padding: "1rem", width: "300px" }}>
      <h2>Gemini Extension</h2>
      <button onClick={handleGetAnswer} disabled={loading}>
        {loading ? "Loading..." : "Run Gemini"}
      </button>
      <button onClick={handleGetHint} disabled={loading}>
        {loading ? "Loading..." : "Get Hint"}
      </button>
      <div style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}>{output}</div>
    </div>
  );
}

export default App;
