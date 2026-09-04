import { config } from "../config";
import type { Insight } from "../types";

function fallbackExplanation(insight: Insight): string {
  const direction = insight.metrics.sinceLastCheckedPercent >= 0 ? "up" : "down";
  const movement = Math.abs(insight.metrics.sinceLastCheckedPercent).toFixed(2);
  const event = insight.event?.summary ? ` following ${insight.event.summary.toLowerCase()}` : "";
  return `${insight.symbol} moved ${direction} ${movement}% since your last check on ${insight.metrics.volumeRatio.toFixed(2)}x average volume${event}.`;
}

export async function generateExplanation(insight: Insight): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.ollamaTimeoutMs);

    const prompt = `You are writing a short market watchlist insight. Use ONLY these values. Do not invent numbers.\nSymbol: ${insight.symbol}\nScore: ${insight.score}\nPrice change since last checked: ${insight.metrics.sinceLastCheckedPercent}%\nVolume ratio: ${insight.metrics.volumeRatio}x\nRelative performance: ${insight.metrics.relativePerformancePercent}%\nEvent: ${insight.event?.summary ?? "No major event"}\nWrite one concise sentence.`;

    const response = await fetch(`${config.ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: config.ollamaModel, prompt, stream: false, options: { temperature: 0.2 } }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) throw new Error("Ollama call failed");
    const json = await response.json();
    const text = String(json.response ?? "").trim();
    if (!text) throw new Error("Empty Ollama response");
    return text;
  } catch {
    return fallbackExplanation(insight);
  }
}
