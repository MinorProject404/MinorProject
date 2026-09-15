import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ContractAnalysisSchema } from "../src/lib/schema.js";
import { AnalyzeInputSchema, SYSTEM_PROMPT } from "../src/lib/analyze.server-prompt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, stack: "React + Express" });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const data = AnalyzeInputSchema.parse(req.body);
    const text = data.contractText.trim();

    if (text.length < 50) {
      return res.status(400).json({ error: "Text is too short for contract analysis." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "AI is not configured. Add GEMINI_API_KEY to your server environment.",
      });
    }

    // Direct Google Gemini API call. The key remains server-side and is never
    // exposed to the React/browser client.
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Contract Filename: ${data.filename || "Document.pdf"}\n\nDocument Text Content:\n${text.slice(0, 40000)}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: "Gemini rate limit reached. Please try again in a moment." });
      }
      const detail = await response.text().catch(() => "");
      console.error("Gemini API error:", response.status, detail);
      return res.status(502).json({ error: `Gemini analysis failed (${response.status}).` });
    }

    const payload = (await response.json()) as {
      candidates?: {
        content?: {
          parts?: { text?: string }[];
        };
      }[];
    };
    const raw = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
    const jsonText = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      const start = jsonText.indexOf("{");
      const end = jsonText.lastIndexOf("}");
      if (start === -1 || end === -1) {
        return res.status(502).json({ error: "The model returned an unreadable response." });
      }
      parsed = JSON.parse(jsonText.slice(start, end + 1));
    }

    const result = ContractAnalysisSchema.safeParse(parsed);
    if (!result.success) {
      console.error("Schema validation:", result.error.flatten());
      return res.status(502).json({ error: "The analysis came back incomplete. Please try again." });
    }

    return res.json(result.data);
  } catch (error) {
    console.error("Analysis failed:", error);
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to analyze document.",
    });
  }
});

if (process.env.NODE_ENV === "production") {
  const clientDist = path.resolve(__dirname, "../dist");
  app.use(express.static(clientDist));
  app.get("*splat", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Express API running on http://localhost:${PORT}`);
});
