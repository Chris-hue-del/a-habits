import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY 未設定" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "缺少 prompt 參數" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction:
        "你是一位《原子習慣》專家教練，精通 James Clear 的習慣科學理論。" +
        "請用繁體中文回答，語氣溫暖鼓勵，回答簡潔有力（300字以內），適合手機閱讀。" +
        "使用適當的換行讓文字易讀。回答請分點條列，每點不超過兩行。",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Gemini API error:", error);
    return res.status(500).json({
      error: "AI 回應失敗，請稍後再試",
      detail: error.message,
    });
  }
}
