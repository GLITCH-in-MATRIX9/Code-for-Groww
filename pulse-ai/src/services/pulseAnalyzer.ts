import { analyzeStock } from "./stockAnalyzer.js";

import {
  generatePulseExplanation,
  type PulseAIResponse
} from "../aiService.js";


export interface PulseAnalysis {
  stock: {
    symbol: string;
    companyName: string;

    currency: string;

    price: number;
    previousClose: number;
    priceChange: number;

    volume: number;
    averageVolume: number;
    volumeRatio: number;

    volatilityChange: number;

    sectorPerformance?: number;
  };

  news: {
    importance: number;

    type:
      | "event"
      | "context"
      | "opinion"
      | "prediction"
      | "none";

    articleCount: number;

    headline: string | null;
    summary: string | null;
    source: string | null;
    url: string | null;
  };

  meaningfulness: {
    score: number;

    severity:
      | "low"
      | "medium"
      | "high"
      | "critical";

    reasons: string[];

    signals: {
      priceMovement: number;
      volumeAnomaly: number;
      volatility: number;
      relativePerformance: number;
      eventImpact: number;
      newsImpact: number;
      userRelevance: number;
    };
  };

  explanation: PulseAIResponse;
}

/* ========================================
   ANALYZE PULSE
======================================== */

export async function analyzePulse(
  symbol: string
): Promise<PulseAnalysis> {


  // --------------------------------
  // 1. ANALYZE STOCK
  // --------------------------------

  const insight =
    await analyzeStock(symbol);


  // --------------------------------
  // 2. GENERATE AI EXPLANATION
  // --------------------------------

  const explanation =
    await generatePulseExplanation(
      insight
    );


  // --------------------------------
  // 3. RETURN COMPLETE PULSE RESULT
  // --------------------------------

  return {

    stock: {
  symbol: insight.symbol,

  companyName: insight.companyName,

  currency: insight.currency,

  price: insight.price,

  previousClose: insight.previousClose,

  priceChange: insight.priceChange,

  volume: insight.volume,

  averageVolume: insight.averageVolume,

  volumeRatio: insight.volumeRatio,

  volatilityChange:
    insight.volatilityChange,

  sectorPerformance:
    insight.sectorPerformance
},


    news: {

      importance:
        insight.newsImportance,

      type:
        insight.newsType,

      articleCount:
        insight.newsArticleCount,

      headline:
        insight.newsHeadline,

      summary:
        insight.newsSummary,

      source:
        insight.newsSource,

      url:
        insight.newsUrl

    },


    meaningfulness: {
  score:
    insight.meaningfulnessScore,

  severity:
    insight.severity,

  reasons:
    insight.reasons,

  signals:
    insight.signals
},


    explanation

  };

}