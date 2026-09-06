import type {
  ProcessedNews
} from "./newsProcessor.js";

export interface NewsEvent {
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: Date;

  type: ProcessedNews["type"];
  relevance: "high";

  importance: number;
  articleCount: number;
}

function normalizeText(
  text: string
): string {

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMeaningfulWords(
  article: ProcessedNews
): Set<string> {

  const text =
    normalizeText(
      `${article.headline} ${article.summary}`
    );

  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "of",
    "to",
    "in",
    "for",
    "on",
    "with",
    "is",
    "are",
    "this",
    "that",
    "as",
    "by",
    "from",
    "at",
    "be",
    "its",
    "it",
    "will",
    "about",
    "stock",
    "stocks",
    "company",
    "market",
    "shares"
  ]);

  return new Set(
    text
      .split(" ")
      .filter(
        word =>
          word.length >= 4 &&
          !stopWords.has(word)
      )
  );
}

function similarity(
  first: ProcessedNews,
  second: ProcessedNews
): number {

  const firstWords =
    getMeaningfulWords(first);

  const secondWords =
    getMeaningfulWords(second);

  if (
    firstWords.size === 0 ||
    secondWords.size === 0
  ) {
    return 0;
  }

  let commonWords = 0;

  for (
    const word of firstWords
  ) {

    if (secondWords.has(word)) {
      commonWords++;
    }
  }

  const unionSize =
    new Set([
      ...firstWords,
      ...secondWords
    ]).size;

  if (unionSize === 0) {
    return 0;
  }

  return (
    commonWords /
    unionSize
  );
}

export function aggregateNews(
  articles: ProcessedNews[]
): NewsEvent[] {

  /*
   * Only high-relevance articles
   * are allowed to become news events.
   *
   * Medium relevance is useful context,
   * but should not affect the stock's
   * meaningfulness score.
   */

  const relevantArticles =
    articles.filter(
      article =>
        article.relevance === "high"
    );

  if (
    relevantArticles.length === 0
  ) {
    return [];
  }

  const groups: ProcessedNews[][] = [];

  for (
    const article of relevantArticles
  ) {

    let bestGroup:
      ProcessedNews[] | null = null;

    let bestSimilarity = 0;

    for (
      const group of groups
    ) {

      /*
       * Compare against the newest /
       * representative article.
       */

      const representative =
        group[0];

      const score =
        similarity(
          article,
          representative
        );

      if (
        score > bestSimilarity
      ) {
        bestSimilarity = score;
        bestGroup = group;
      }
    }

    /*
     * A 30% keyword overlap is enough
     * for our MVP grouping.
     *
     * We intentionally keep this
     * conservative rather than pretending
     * that every article is a unique event.
     */

    if (
      bestGroup &&
      bestSimilarity >= 0.30
    ) {

      bestGroup.push(article);

    } else {

      groups.push([article]);
    }
  }

  return groups.map(group => {

    /*
     * Prefer event articles over opinions
     * and predictions.
     */

    const sorted =
      [...group].sort((a, b) => {

        if (
          a.type === "event" &&
          b.type !== "event"
        ) {
          return -1;
        }

        if (
          a.type !== "event" &&
          b.type === "event"
        ) {
          return 1;
        }

        if (
          a.importance !==
          b.importance
        ) {
          return (
            b.importance -
            a.importance
          );
        }

        return (
          b.publishedAt.getTime() -
          a.publishedAt.getTime()
        );
      });

    const representative =
      sorted[0];

    /*
     * Multiple independent articles
     * provide stronger evidence that a
     * story is being widely reported.
     *
     * Cap the bonus so article count
     * cannot dominate the score.
     */

    const articleBonus =
      Math.min(
        (group.length - 1) * 5,
        15
      );

    return {
      headline:
        representative.headline,

      summary:
        representative.summary,

      source:
        representative.source,

      url:
        representative.url,

      publishedAt:
        representative.publishedAt,

      type:
        representative.type,

      relevance: "high",

      importance:
        Math.min(
          representative.importance +
          articleBonus,
          100
        ),

      articleCount:
        group.length
    };
  });
}