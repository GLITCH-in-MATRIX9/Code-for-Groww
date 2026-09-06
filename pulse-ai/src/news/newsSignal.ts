import type { ProcessedNews } from "./newsProcessor.js";
import type { NewsEvent } from "./newsAggregator.js";

export interface NewsSignal {
  hasNews: boolean;
  importance: number;
  strongestType: "event" | "context" | "opinion" | "prediction" | "none";
  articleCount: number;
  headline: string | null;
  summary: string | null;
  source: string | null;
  url: string | null;
  reasons: string[];
}

export function calculateNewsSignal(
  articles: ProcessedNews[],
  events: NewsEvent[]
): NewsSignal {
  if (articles.length === 0 || events.length === 0) {
    return {
      hasNews: false,
      importance: 0,
      strongestType: "none",
      articleCount: 0,
      headline: null,
      summary: null,
      source: null,
      url: null,
      reasons: []
    };
  }

  const eventStories = events.filter(
    event => event.type === "event"
  );

  const contextStories = events.filter(
    event => event.type === "context"
  );

  /*
   * Only treat an event as strong when:
   * 1. The article is high relevance.
   * 2. More than one article supports the story OR
   *    the story contains stronger event evidence.
   *
   * A single article should not automatically create
   * a major meaningfulness signal.
   */

  const strongEvents = eventStories.filter(
    event => event.relevance === "high"
  );

  const strongestEvent = [...strongEvents]
    .sort((a, b) => {
      if (b.articleCount !== a.articleCount) {
        return b.articleCount - a.articleCount;
      }

      return b.importance - a.importance;
    })[0];

  if (strongestEvent) {
    let importance = 10;

    if (strongestEvent.articleCount >= 2) {
      importance = 25;
    }

    if (strongestEvent.articleCount >= 3) {
      importance = 30;
    }

    const reasons = [
      "Recent company-related news was detected"
    ];

    if (strongestEvent.articleCount >= 2) {
      reasons.push(
        "Multiple articles covered the same development"
      );
    }

    return {
      hasNews: true,
      importance,
      strongestType: "event",
      articleCount: strongestEvent.articleCount,
      headline: strongestEvent.headline,
      summary: strongestEvent.summary,
      source: strongestEvent.source,
      url: strongestEvent.url,
      reasons
    };
  }

  /*
   * Contextual news is intentionally weak.
   * It should provide supporting evidence rather than
   * dominate the Meaningfulness Engine.
   */

  if (contextStories.length > 0) {
    const strongestContext = [...contextStories]
      .sort((a, b) => b.importance - a.importance)[0];

    return {
      hasNews: true,
      importance: 5,
      strongestType: "context",
      articleCount: strongestContext.articleCount,
      headline: strongestContext.headline,
      summary: strongestContext.summary,
      source: strongestContext.source,
      url: strongestContext.url,
      reasons: [
        "Recent company-related news provides context"
      ]
    };
  }

  /*
   * Opinions and predictions should not affect the
   * deterministic meaningfulness score.
   */

  return {
    hasNews: true,
    importance: 0,
    strongestType: "opinion",
    articleCount: articles.length,
    headline: null,
    summary: null,
    source: null,
    url: null,
    reasons: []
  };
}