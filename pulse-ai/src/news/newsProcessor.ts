import type { StockNews } from "./finnhub.js";

export type NewsType =
  | "event"
  | "context"
  | "opinion"
  | "prediction";

export interface ProcessedNews {
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: Date;
  type: NewsType;
  importance: number;
  relevance: "high" | "medium" | "low";
}

const PREDICTION_KEYWORDS = [
  "prediction",
  "forecast",
  "expected",
  "will be worth",
  "future",
  "upside",
  "downside",
  "should rise",
  "should fall",
  "could rise",
  "could fall"
];

const OPINION_KEYWORDS = [
  "buy",
  "sell",
  "worth buying",
  "should buy",
  "should be worried",
  "jim cramer",
  "analyst",
  "investors should",
  "traders see"
];

const EVENT_KEYWORDS = [
  "earnings",
  "revenue",
  "guidance",
  "acquisition",
  "merger",
  "regulatory",
  "lawsuit",
  "launch",
  "announces",
  "announced",
  "agreement",
  "partnership",
  "contract",
  "approval",
  "recall",
  "investigation",
  "ceo",
  "resigns"
];

function containsKeyword(
  text: string,
  keywords: string[]
): boolean {

  const normalized =
    text.toLowerCase();

  return keywords.some(
    keyword =>
      normalized.includes(keyword)
  );
}

function classifyNews(
  article: StockNews
): NewsType {

  const text =
    `${article.headline} ${article.summary}`;

  /*
   * Predictions and recommendations
   * have priority over other categories.
   */

  if (
    containsKeyword(
      text,
      PREDICTION_KEYWORDS
    )
  ) {
    return "prediction";
  }

  if (
    containsKeyword(
      text,
      OPINION_KEYWORDS
    )
  ) {
    return "opinion";
  }

  if (
    containsKeyword(
      text,
      EVENT_KEYWORDS
    )
  ) {
    return "event";
  }

  return "context";
}

function calculateImportance(
  type: NewsType,
  relevance: "high" | "medium" | "low"
): number {

  let baseImportance: number;

  switch (type) {

    case "event":
      baseImportance = 80;
      break;

    case "context":
      baseImportance = 40;
      break;

    case "opinion":
      baseImportance = 20;
      break;

    case "prediction":
      baseImportance = 10;
      break;
  }

  if (relevance === "high") {
    return baseImportance;
  }

  if (relevance === "medium") {
    return Math.round(
      baseImportance * 0.6
    );
  }

  return Math.round(
    baseImportance * 0.25
  );
}

function determineRelevance(
  article: StockNews,
  symbol: string,
  companyName?: string
): "high" | "medium" | "low" {

  const headline =
    article.headline.toLowerCase();

  const summary =
    article.summary.toLowerCase();

  const normalizedSymbol =
    symbol.toLowerCase();

  const normalizedCompany =
    companyName?.toLowerCase();

  const symbolInHeadline =
    headline.includes(normalizedSymbol);

  const companyInHeadline =
    normalizedCompany
      ? headline.includes(normalizedCompany)
      : false;

  /*
   * Strongest signal:
   * ticker/company explicitly appears
   * in the headline.
   */
  if (
    symbolInHeadline ||
    companyInHeadline
  ) {
    return "high";
  }

  /*
   * Weaker signal:
   * ticker/company appears only
   * in the article summary.
   */
  const symbolInSummary =
    summary.includes(normalizedSymbol);

  const companyInSummary =
    normalizedCompany
      ? summary.includes(normalizedCompany)
      : false;

  if (
    symbolInSummary ||
    companyInSummary
  ) {
    return "medium";
  }

  return "low";
}

export function processNews(
  articles: StockNews[],
  symbol: string,
  companyName?: string
): ProcessedNews[] {

  return articles
    .map(article => {

      const relevance =
        determineRelevance(
          article,
          symbol,
          companyName
        );

      const type =
        classifyNews(article);

      return {
        ...article,
        type,
        relevance,
        importance:
          calculateImportance(
            type,
            relevance
          )
      };
    })
    .filter(
      article =>
        article.relevance !== "low"
    );
}