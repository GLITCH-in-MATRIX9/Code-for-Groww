import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL,
  finnhubApiKey: process.env.FINNHUB_API_KEY,
  useLiveData: process.env.USE_LIVE_DATA === "true",
  ollamaUrl: process.env.OLLAMA_URL ?? "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "qwen2.5:7b",
  ollamaTimeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS ?? 4000)
};
