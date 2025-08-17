import { useEffect, useState } from "react";

function App() {
  const [output, setOutput] = useState("");
  const [loadingGetQuestion, setLoadingGetQuestion] = useState(false);
  const [loadingGetAnswer, setLoadingGetAnswer] = useState(false);
  const [loadingGetHint, setLoadingGetHint] = useState(false);
  const [question, setQuestion] = useState("");
  const [heading, setHeading] = useState("");
  const [hints, setHints] = useState([]);
  const [solution, setSolution] = useState("");
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [error, setError] = useState("");
  const [view, setView] = useState("idle");

  useEffect(() => {
    setLoadingGetQuestion(true);
    chrome.runtime.sendMessage({ type: "GET_QUESTION" }, (response) => {
      if (chrome.runtime.lastError) {
        setError("Error in get Question: " + chrome.runtime.lastError.message);
      } else if (response?.success === true) {
        setQuestion(response?.data.Question);
        setHeading(response?.data.Heading);
      } else {
        setError("Error in get Question: " + response.error);
      }
      setLoadingGetQuestion(false);
    });

    setLoadingGetAnswer(true);
    chrome.runtime.sendMessage({ type: "GET_ANSWER" }, (response) => {
      if (chrome.runtime.lastError) {
        setError("Error in get Answer: " + chrome.runtime.lastError.message);
      } else if (response.success === true) {
        setSolution(response.data);
      } else {
        setError("Error in get Answer: " + response.error);
      }
      setLoadingGetAnswer(false);
    });

    setLoadingGetHint(true);
    chrome.runtime.sendMessage({ type: "GET_HINT" }, (response) => {
      if (chrome.runtime.lastError) {
        setError("Error in get Hint: " + chrome.runtime.lastError.message);
        setHints([]);
      } else if (response.success === true) {
        const data = response.data;
        const normalized = Array.isArray(data) ? data : [data];
        setHints(normalized);
        if (normalized.length > 0) {
          setCurrentHintIndex(0);
        }
      } else {
        setError("Error in get Hint: " + response.error);
        setHints([]);
      }
      setLoadingGetHint(false);
    });
  }, []);

  const maxHintNumber = Math.min(hints.length, 10);
  const maxVisibleIndex = Math.min(9, hints.length - 1);

  const showSolution = () => {
    setOutput(solution || "No solution available");
    setView("solution");
  };

  const showFirstHint = () => {
    if (!hints || hints.length === 0) {
      setOutput("No hints available");
      setView("hint");
      return;
    }
    setCurrentHintIndex(0);
    setOutput(hints[0]);
    setView("hint");
  };

  const prevHint = () => {
    if (currentHintIndex > 0) {
      const newIndex = currentHintIndex - 1;
      setCurrentHintIndex(newIndex);
      setOutput(hints[newIndex]);
      setView("hint");
    }
  };

  const nextHint = () => {
    if (currentHintIndex < maxVisibleIndex) {
      const newIndex = currentHintIndex + 1;
      setCurrentHintIndex(newIndex);
      setOutput(hints[newIndex]);
      setView("hint");
    }
  };

  const hidePanel = () => {
    setView("idle");
    setOutput("");
  };

  const containerStyle = {
    padding: "1rem",
    width: "360px",
    height: view === "idle" ? "400px" : "auto",
    boxSizing: "border-box",
    fontFamily:
      "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const panelStyle = {
    background: "#0f1724",
    color: "#e6eef8",
    fontFamily:
      "SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace",
    fontSize: "13px",
    lineHeight: 1.45,
    padding: "12px",
    borderRadius: "8px",
    whiteSpace: "pre-wrap",
    overflow: "auto",
    border: "1px solid rgba(255,255,255,0.04)",
    flex: 1,
    minHeight: 0,
  };

  const buttonStyle = {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#2563eb",
    color: "white",
  };

  const secondaryButton = {
    ...buttonStyle,
    background: "#334155",
  };

  const neutralButton = {
    ...secondaryButton,
    background: "#2b3440",
  };

  return (
    <>
      <div style={containerStyle}>
        <h1 style={{ margin: 0 }}>NerchukovAI</h1>
        <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "6px" }}>
          AI hints and solutions for your coding problems
        </p>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loadingGetQuestion && heading && question && (
          <>
            <h2 style={{ margin: "12px 0 6px 0" }}>{heading}</h2>
          </>
        )}

        <div
          style={{
            marginTop: "8px",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          {view === "idle" && (
            <>
              <button
                onClick={showSolution}
                disabled={loadingGetAnswer || !solution}
                style={buttonStyle}
              >
                {loadingGetAnswer ? "Loading..." : "Solution"}
              </button>

              <button
                onClick={showFirstHint}
                disabled={loadingGetHint || hints.length === 0}
                style={secondaryButton}
              >
                {loadingGetHint ? "Loading..." : "Hint"}
              </button>
            </>
          )}

          {view === "solution" && (
            <>
              <button onClick={showSolution} disabled style={buttonStyle}>
                Solution
              </button>

              <button
                onClick={showFirstHint}
                disabled={loadingGetHint || hints.length === 0}
                style={secondaryButton}
              >
                Hint
              </button>
            </>
          )}

          {view === "hint" && (
            <>
              <button
                onClick={showSolution}
                disabled={loadingGetAnswer}
                style={buttonStyle}
              >
                Solution
              </button>

              {currentHintIndex > 0 && (
                <button onClick={prevHint} style={neutralButton}>
                  Previous
                </button>
              )}

              {currentHintIndex < maxVisibleIndex && (
                <button onClick={nextHint} style={secondaryButton}>
                  Next
                </button>
              )}
            </>
          )}
        </div>

        {view === "hint" && hints.length > 0 && (
          <div style={{ marginTop: "8px", color: "#d3d3d3" }}>
            Hint {Math.min(currentHintIndex + 1, maxHintNumber)} of{" "}
            {maxHintNumber}
          </div>
        )}

        {/* Panel area: stable height inside fixed container */}
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            flexDirection: "column",
            flex: 1, // occupy remaining vertical space
            minHeight: 0, // important for flex children overflow
          }}
        >
          {view === "idle" ? (
            // placeholder with no dark background but same spacing inside fixed container
            <div
              style={{
                borderRadius: "8px",
                background: "transparent",
                padding: "12px",
                boxSizing: "border-box",
                height: "100%",
                color: "transparent",
                userSelect: "none",
              }}
              aria-hidden="true"
            >
              &nbsp;
            </div>
          ) : (
            // actual panel with dark background when showing content
            <div style={panelStyle}>
              {output ||
                (view === "solution"
                  ? "No solution available"
                  : "No hint available")}
            </div>
          )}

          <div style={{ marginTop: "8px", textAlign: "right" }}>
            {view !== "idle" ? (
              <button
                onClick={hidePanel}
                style={{ ...secondaryButton, padding: "6px 8px" }}
              >
                Hide
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
