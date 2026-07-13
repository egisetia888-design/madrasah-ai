import express from "express";
import path from "path";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

// Simple in-memory cache for AI responses
const aiCache = new Map<string, { timestamp: number, data: any }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function getCacheKey(endpoint: string, body: any) {
  return `${endpoint}:${JSON.stringify(body)}`;
}

function cleanAndParseJson(text: string, fallback: any = {}) {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```[a-zA-Z]*\n/, "");
      if (cleanText.endsWith("```")) {
        cleanText = cleanText.slice(0, -3);
      }
    }
    return JSON.parse(cleanText.trim());
  } catch (error) {
    console.error("JSON Parsing Error on AI output:", text.substring(0, 100) + "...");
    return fallback;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: "Too many requests from this IP, please try again after 15 minutes." }
  });

  const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15, // Limit each IP to 15 AI requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Terlalu banyak permintaan ke AI. Silakan tunggu beberapa saat." }
  });

  app.use(express.json());
  app.use("/api/", apiLimiter);
  app.use("/api/ai/", aiLimiter);

  // Logging middleware for audit trail
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      console.log(`[API Audit] ${new Date().toISOString()} | ${req.method} ${req.path} | IP: ${req.ip}`);
    }
    next();
  });

  // AI Routes
  app.post("/api/ai/zettelkasten", async (req, res) => {
    try {
      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "OPENROUTER_API_KEY is not configured on the server." });
      }

      const { prompt, notes } = req.body;
      const cacheKey = getCacheKey("zettelkasten", { prompt, notesCount: notes?.length });
      
      const cached = aiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Cache Hit] /api/ai/zettelkasten`);
        return res.json(cached.data);
      }
      
      const systemInstruction = `
      You are a Smart Zettelkasten Assistant. Your job is to analyze the user's notes and help them:
      1. Find connections and relationships between different concepts.
      2. Suggest new ideas or insights based on their notes.
      3. Identify gaps in their knowledge.
      
      User's current notes for context:
      ${JSON.stringify(notes, null, 2)}
      
      Respond directly and helpfully in Indonesian. Format your response cleanly using Markdown.
      `;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "https://madrasah.remix",
          "X-Title": "Remix Madrasah"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errText}`);
      }

      const data = await response.json() as any;
      const text = data.choices?.[0]?.message?.content || "";
      const resultData = { result: text };
      
      aiCache.set(cacheKey, { timestamp: Date.now(), data: resultData });
      res.json(resultData);
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      res.status(500).json({ error: error.message || "Failed to process AI request" });
    }
  });

  app.post("/api/ai/suggest-tags", async (req, res) => {
    try {
      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "OPENROUTER_API_KEY is not configured on the server." });
      }

      const { content, notes } = req.body;
      const cacheKey = getCacheKey("suggest-tags", { content });
      
      const cached = aiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Cache Hit] /api/ai/suggest-tags`);
        return res.json(cached.data);
      }
      
      const systemInstruction = `
      You are a Smart Zettelkasten Assistant. Your job is to analyze a new knowledge snippet from the user and:
      1. Suggest 3-5 relevant tags (short keywords in Indonesian or English).
      2. Suggest 1-3 connections to existing notes (return the exact titles of the relevant existing notes).
      
      User's existing notes for context:
      ${JSON.stringify(notes.map((n: any) => ({ id: n.id, title: n.title, content: n.content })), null, 2)}
      
      Respond ONLY with a raw JSON object in the following format, without any markdown formatting or code blocks:
      {
        "tags": ["tag1", "tag2"],
        "connections": ["Existing Note Title 1", "Existing Note Title 2"]
      }
      `;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "https://madrasah.remix",
          "X-Title": "Remix Madrasah"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: `New snippet:\n${content}` }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errText}`);
      }

      const data = await response.json() as any;
      const text = data.choices?.[0]?.message?.content || "{}";
      const resultData = cleanAndParseJson(text, { tags: [], connections: [] });
      
      aiCache.set(cacheKey, { timestamp: Date.now(), data: resultData });
      res.json(resultData);
    } catch (error: any) {
      console.error("AI Suggestion Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate suggestions" });
    }
  });

  app.post("/api/ai/generate-flashcards", async (req, res) => {
    try {
      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "OPENROUTER_API_KEY is not configured on the server." });
      }

      const { content } = req.body;
      const cacheKey = getCacheKey("generate-flashcards", { content });
      
      const cached = aiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Cache Hit] /api/ai/generate-flashcards`);
        return res.json(cached.data);
      }
      
      const systemInstruction = `
      You are an expert at creating Spaced Repetition Flashcards. Your job is to analyze the provided note content and extract 5-10 crucial Question & Answer pairs.
      Focus on core concepts, important facts, and principles.
      
      Respond ONLY with a raw JSON object in the following format, without any markdown formatting or code blocks:
      {
        "flashcards": [
          { "front": "Question here?", "back": "Answer here" }
        ]
      }
      `;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "https://madrasah.remix",
          "X-Title": "Remix Madrasah"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: `Create flashcards from this note:\n\n${content}` }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errText}`);
      }

      const data = await response.json() as any;
      const text = data.choices?.[0]?.message?.content || "{}";
      const resultData = cleanAndParseJson(text, { flashcards: [] });
      
      aiCache.set(cacheKey, { timestamp: Date.now(), data: resultData });
      res.json(resultData);
    } catch (error: any) {
      console.error("AI Flashcard Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate flashcards" });
    }
  });

  app.post("/api/ai/grade-flashcard", async (req, res) => {
    try {
      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "OPENROUTER_API_KEY is not configured on the server." });
      }

      const { question, correctAnswer, userAnswer } = req.body;
      const cacheKey = getCacheKey("grade-flashcard", { question, correctAnswer, userAnswer });
      
      const cached = aiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Cache Hit] /api/ai/grade-flashcard`);
        return res.json(cached.data);
      }
      
      const systemInstruction = `
      You are an intelligent Grading Assistant for spaced repetition.
      Evaluate the user's answer based on conceptual understanding, NOT exact word matching.
      If the user's answer demonstrates they understand the core concept of the correct answer, grade it as correct.
      If it's partially correct, give them a lower quality score (e.g., 2 or 3) and explain what they missed.
      If it's completely wrong, grade it as incorrect (quality 0 or 1).
      
      Quality Scale (0-5):
      0: Complete blackout / completely wrong.
      1: Incorrect, but remembered something related.
      2: Incorrect, but it seemed easy to recall the right answer after seeing it.
      3: Correct, but with significant difficulty or partial completeness.
      4: Correct, after some hesitation.
      5: Perfect, fluent recall.
 
      Respond ONLY with a raw JSON object in the following format, without any markdown formatting or code blocks:
      {
        "isCorrect": boolean,
        "quality": number,
        "feedback": "Short feedback explaining what was good or what was missed (in Indonesian)"
      }
      `;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "https://madrasah.remix",
          "X-Title": "Remix Madrasah"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: `Question: ${question}\nCorrect Answer: ${correctAnswer}\nUser's Answer: ${userAnswer}` }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errText}`);
      }

      const data = await response.json() as any;
      const text = data.choices?.[0]?.message?.content || "{}";
      const resultData = cleanAndParseJson(text, { isCorrect: false, quality: 1, feedback: "Gagal memproses penilaian dari AI." });
      
      aiCache.set(cacheKey, { timestamp: Date.now(), data: resultData });
      res.json(resultData);
    } catch (error: any) {
      console.error("AI Grading Error:", error);
      res.status(500).json({ error: error.message || "Failed to grade answer" });
    }
  });

  app.post("/api/ai/generate-syllabus", async (req, res) => {
    try {
      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "OPENROUTER_API_KEY is not configured on the server." });
      }

      const { topic } = req.body;
      const cacheKey = getCacheKey("generate-syllabus", { topic });
      
      const cached = aiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Cache Hit] /api/ai/generate-syllabus`);
        return res.json(cached.data);
      }
      
      const systemInstruction = `
      You are an expert AI Syllabus Planner and Curriculum Designer.
      The user will provide a topic or skill they want to master (e.g., "Dasar-dasar Machine Learning", "Sejarah Filsafat Barat").
      Your job is to generate a structured learning path for this topic, starting from beginner to advanced.
 
      You must break the topic down into 3 to 5 logical 'Phases' (Fase Belajar).
      For each Phase, provide 3 to 6 'Competencies' (Kompetensi/Tugas) that the user needs to achieve.
 
      Provide all responses in Indonesian.
 
      Respond ONLY with a raw JSON object in the following format, without any markdown formatting or code blocks:
      {
        "title": "A clear, inspiring title for the learning path",
        "description": "A brief overview of what the user will achieve",
        "phases": [
          {
            "title": "Phase 1: Title",
            "description": "Description of this phase",
            "order": 1,
            "competencies": [
              {
                "title": "Competency 1",
                "description": "What to learn or do"
              },
              {
                "title": "Competency 2",
                "description": "What to learn or do"
              }
            ]
          }
        ]
      }
      `;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "https://madrasah.remix",
          "X-Title": "Remix Madrasah"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: `Topic: ${topic}` }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errText}`);
      }

      const data = await response.json() as any;
      const text = data.choices?.[0]?.message?.content || "{}";
      const resultData = cleanAndParseJson(text, { title: topic, description: "Gagal membuat silabus.", phases: [] });
      
      aiCache.set(cacheKey, { timestamp: Date.now(), data: resultData });
      res.json(resultData);
    } catch (error: any) {
      console.error("AI Syllabus Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate syllabus" });
    }
  });

  app.post("/api/ai/summarize-literature", async (req, res) => {
    try {
      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "OPENROUTER_API_KEY is not configured on the server." });
      }

      const { content } = req.body;
      const cacheKey = getCacheKey("summarize-literature", { content });
      
      const cached = aiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Cache Hit] /api/ai/summarize-literature`);
        return res.json(cached.data);
      }
      
      const systemInstruction = `
      You are an expert academic assistant.
      The user will provide the abstract, introduction, or full text of an academic paper.
      Your task is to summarize the paper into exactly 3 key points:
      1. Masalah Utama (The Main Problem)
      2. Metodologi (The Methodology)
      3. Kesimpulan (The Conclusion)
 
      Provide all responses in Indonesian.
 
      Respond ONLY with a raw JSON object in the following format, without any markdown formatting or code blocks:
      {
        "problem": "Masalah utama yang dibahas...",
        "methodology": "Metode yang digunakan...",
        "conclusion": "Kesimpulan atau hasil utama..."
      }
      `;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "https://madrasah.remix",
          "X-Title": "Remix Madrasah"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: `Literature Content:\n${content}` }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errText}`);
      }

      const data = await response.json() as any;
      const text = data.choices?.[0]?.message?.content || "{}";
      const resultData = cleanAndParseJson(text, { problem: "Tidak dapat menyimpulkan masalah utama.", methodology: "Tidak dapat menyimpulkan metodologi.", conclusion: "Tidak dapat menyimpulkan kesimpulan." });
      
      aiCache.set(cacheKey, { timestamp: Date.now(), data: resultData });
      res.json(resultData);
    } catch (error: any) {
      console.error("AI Literature Summarizer Error:", error);
      res.status(500).json({ error: error.message || "Failed to summarize literature" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const viteModuleName = "vite";
    const { createServer: createViteServer } = await import(viteModuleName);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
