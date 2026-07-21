import express from "express";
import path from "path";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Simple in-memory cache for AI responses
const aiCache = new Map<string, { timestamp: number, data: any }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function getCacheKey(endpoint: string, body: any) {
  return `${endpoint}:${JSON.stringify(body)}`;
}

function cleanAndParseJson(text: string, fallback: any = {}) {
  if (!text) return fallback;
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
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // ignore fallback below
      }
    }
    console.error("JSON Parsing Error on AI output:", text.substring(0, 100) + "...");
    return fallback;
  }
}

// Lazy initialize GoogleGenAI client
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

interface AICallOptions {
  systemInstruction: string;
  userPrompt: string;
  jsonMode?: boolean;
  responseSchema?: any;
  timeoutMs?: number;
}

async function executeAIRequest(options: AICallOptions): Promise<string> {
  const timeoutMs = options.timeoutMs || 25000;
  
  const aiPromise = (async () => {
    const gemini = getGeminiClient();

    // Try Google GenAI SDK first
    if (gemini) {
      try {
        const config: any = {
          systemInstruction: options.systemInstruction,
        };
        if (options.jsonMode) {
          config.responseMimeType = "application/json";
          if (options.responseSchema) {
            config.responseSchema = options.responseSchema;
          }
        }

        const response = await gemini.models.generateContent({
          model: "gemini-3.6-flash",
          contents: options.userPrompt,
          config
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        console.warn("[AI Provider] Gemini API request failed, trying OpenRouter fallback:", err?.message || err);
      }
    }

    // OpenRouter Fallback
    if (process.env.OPENROUTER_API_KEY) {
      const messages = [
        { role: "system", content: options.systemInstruction },
        { role: "user", content: options.userPrompt }
      ];

      const body: any = {
        model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
        messages
      };

      if (options.jsonMode) {
        body.response_format = { type: "json_object" };
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs - 1000);

      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.APP_URL || "https://madrasah.remix",
            "X-Title": "Remix Madrasah"
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timer);

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter API error: ${response.status} ${errText}`);
        }

        const data = await response.json() as any;
        return data.choices?.[0]?.message?.content || "";
      } catch (err: any) {
        clearTimeout(timer);
        throw err;
      }
    }

    throw new Error("Layanan AI belum dikonfigurasi. Silakan pastikan GEMINI_API_KEY atau OPENROUTER_API_KEY tersedia di Settings > Secrets.");
  })();

  const timeoutPromise = new Promise<string>((_, reject) => {
    setTimeout(() => reject(new Error("Permintaan AI melebihi batas waktu (timeout 25 detik). Silakan coba lagi.")), timeoutMs);
  });

  return Promise.race([aiPromise, timeoutPromise]);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests from this IP, please try again after 15 minutes." }
  });

  const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 AI requests per minute
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
      const { prompt, notes = [] } = req.body;
      const sanitizedNotes = Array.isArray(notes) 
        ? notes.slice(0, 10).map((n: any) => ({ id: n.id, title: n.title, excerpt: (n.content || '').slice(0, 500) }))
        : [];

      const cacheKey = getCacheKey("zettelkasten", { prompt, notesCount: sanitizedNotes.length });
      
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
      ${JSON.stringify(sanitizedNotes, null, 2)}
      
      Respond directly and helpfully in Indonesian. Format your response cleanly using Markdown. Keep responses concise and structured.
      `;

      const text = await executeAIRequest({
        systemInstruction,
        userPrompt: String(prompt || '').slice(0, 2000)
      });

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
      const { content, notes = [] } = req.body;
      const sanitizedContent = String(content || '').slice(0, 4000);
      const sanitizedNotes = Array.isArray(notes)
        ? notes.slice(0, 10).map((n: any) => ({ id: n.id, title: n.title }))
        : [];

      const cacheKey = getCacheKey("suggest-tags", { content: sanitizedContent });
      
      const cached = aiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Cache Hit] /api/ai/suggest-tags`);
        return res.json(cached.data);
      }
      
      const systemInstruction = `
      You are a Smart Zettelkasten Assistant. Your job is to analyze a new knowledge snippet from the user and:
      1. Suggest 3-5 relevant tags (short keywords in Indonesian or English).
      2. Suggest 1 most relevant Lucide-react icon name (e.g., 'Brain', 'Book', 'Code', 'Globe', 'Database').
      3. Suggest 1-3 connections to existing notes (return the exact titles of the relevant existing notes).
      
      User's existing notes titles for context:
      ${JSON.stringify(sanitizedNotes, null, 2)}
      
      Respond ONLY with a raw JSON object matching the schema.
      `;

      const schema = {
        type: Type.OBJECT,
        properties: {
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          icon: { type: Type.STRING },
          connections: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["tags", "icon", "connections"]
      };

      const text = await executeAIRequest({
        systemInstruction,
        userPrompt: `New snippet:\n${sanitizedContent}`,
        jsonMode: true,
        responseSchema: schema
      });

      const resultData = cleanAndParseJson(text, { tags: [], icon: "FileText", connections: [] });
      
      aiCache.set(cacheKey, { timestamp: Date.now(), data: resultData });
      res.json(resultData);
    } catch (error: any) {
      console.error("AI Suggestion Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate suggestions" });
    }
  });

  app.post("/api/ai/generate-flashcards", async (req, res) => {
    try {
      const { content } = req.body;
      const sanitizedContent = String(content || '').slice(0, 6000);

      const cacheKey = getCacheKey("generate-flashcards", { content: sanitizedContent });
      
      const cached = aiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Cache Hit] /api/ai/generate-flashcards`);
        return res.json(cached.data);
      }
      
      const systemInstruction = `
      You are an expert at creating Spaced Repetition Flashcards. Your job is to analyze the provided note content and extract 5-10 crucial Question & Answer pairs.
      Focus on core concepts, important facts, and principles.
      
      Respond ONLY with a raw JSON object matching the schema.
      `;

      const schema = {
        type: Type.OBJECT,
        properties: {
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING }
              },
              required: ["front", "back"]
            }
          }
        },
        required: ["flashcards"]
      };

      const text = await executeAIRequest({
        systemInstruction,
        userPrompt: `Create flashcards from this note:\n\n${sanitizedContent}`,
        jsonMode: true,
        responseSchema: schema
      });

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
 
      Respond ONLY with a raw JSON object matching the schema.
      `;

      const schema = {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          quality: { type: Type.NUMBER },
          feedback: { type: Type.STRING }
        },
        required: ["isCorrect", "quality", "feedback"]
      };

      const text = await executeAIRequest({
        systemInstruction,
        userPrompt: `Question: ${question}\nCorrect Answer: ${correctAnswer}\nUser's Answer: ${userAnswer}`,
        jsonMode: true,
        responseSchema: schema
      });

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
 
      Respond ONLY with a raw JSON object matching the schema.
      `;

      const schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          phases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                order: { type: Type.INTEGER },
                competencies: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["title", "description"]
                  }
                }
              },
              required: ["title", "description", "order", "competencies"]
            }
          }
        },
        required: ["title", "description", "phases"]
      };

      const text = await executeAIRequest({
        systemInstruction,
        userPrompt: `Topic: ${topic}`,
        jsonMode: true,
        responseSchema: schema
      });

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
      const { content } = req.body;
      const cacheKey = getCacheKey("summarize-literature", { content });
      
      const cached = aiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Cache Hit] /api/ai/summarize-literature`);
        return res.json(cached.data);
      }
      
      const systemInstruction = `
      You are an expert academic assistant.
      The user will provide the abstract, introduction, or full text of an academic paper or book chapter.
      Your task is to summarize the paper into exactly 3 key points:
      1. Masalah Utama (The Main Problem)
      2. Metodologi (The Methodology)
      3. Kesimpulan (The Conclusion)
 
      Provide all responses in Indonesian.
 
      Respond ONLY with a raw JSON object matching the schema.
      `;

      const schema = {
        type: Type.OBJECT,
        properties: {
          problem: { type: Type.STRING },
          methodology: { type: Type.STRING },
          conclusion: { type: Type.STRING }
        },
        required: ["problem", "methodology", "conclusion"]
      };

      const text = await executeAIRequest({
        systemInstruction,
        userPrompt: `Literature Content:\n${content}`,
        jsonMode: true,
        responseSchema: schema
      });

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

