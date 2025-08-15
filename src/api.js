// import { GoogleGenAI, Type } from "@google/genai";

// // In browser builds, you can store API key in `import.meta.env`
// const ai = new GoogleGenAI({
//   // apiKey: import.meta.env.VITE_GEMINI_API_KEY,
//   apiKey: "AIzaSyD0hMUOF40KifMAcDN3IMkotzaimubOiok",
// });

// export const callToGemini = async ({
//   codeOnEditor,
//   questionHeading,
//   questionText,
// }) => {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: {
//       type: "text",
//       text: `Question Heading: ${questionHeading}\nQuestion Text: ${questionText}\nCode on Editor: ${codeOnEditor}`,
//     },
//   });

//   return response.text;
// };

// api.js
// Direct import from npm package; will require bundling if you use @google/generative-ai

const GEMINI_API_KEY = "AIzaSyD0hMUOF40KifMAcDN3IMkotzaimubOiok";

async function callToGemini(prompt) {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta2/models/gemini-2.5-flash:generateText",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: { text: prompt },
        temperature: 0.7,
        maxOutputTokens: 512,
      }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.output ?? "No response";
}
