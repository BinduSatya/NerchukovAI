import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

app.post("/gemini/getSolution", async (req, res) => {
  try {
    const { Heading, Question, Code } = req.body;
    const prompt = `You are a helpful code assistant. Read the following question carefully and provide a complete answer:\n\n The heading of the question is ${Heading} and the question is ${Question}\n\n Read the following code carefully:\n\n ${Code} and complete the code in the given language and just return the code.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
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
                geminiSolution: {
                  type: "string",
                },
              },
              required: ["geminiSolution"],
            },
          },
        }),
      }
    );

    let result;
    try {
      const data = await response.json();
      console.log("data is", data);

      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("raw is ", raw);

      result = JSON.parse(raw);
      console.log("result is", result);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/gemini/getHints", async (req, res) => {
  try {
    const { Heading, Question, Code } = req.body;
    const prompt = `You are a helpful code assistant. Read the following question carefully and provide a complete answer:\n\n The heading of the question is ${Heading} and the question is ${Question}\n\n Read the following code carefully:\n\n ${Code} and List 10 hints to complete the code, but don't directly give me the code.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
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
                geminiHints: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },
              required: ["geminiHints"],
            },
          },
        }),
      }
    );

    let result;
    try {
      const data = await response.json();
      console.log("data is", data);

      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("raw is ", raw);

      result = JSON.parse(raw);
      console.log("result is", result);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
