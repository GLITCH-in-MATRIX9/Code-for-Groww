export interface MeaningfulnessInput {
  symbol: string;

  companyName: string;

  // Market signals
  priceChange: number;
  volumeRatio: number;
  volatilityChange: number;

  // Optional relative performance
  sectorPerformance?: number;

  // News signals currently available in your backend
  newsImportance?: number;

  newsType?:
    | "event"
    | "context"
    | "opinion"
    | "prediction"
    | "none";
}


export interface MeaningfulnessSignals {
  priceMovement: number;

  volumeAnomaly: number;

  volatility: number;

  relativePerformance: number;

  eventImpact: number;

  newsImpact: number;

  userRelevance: number;
}


export interface MeaningfulnessResult {
  score: number;

  severity:
    | "low"
    | "medium"
    | "high"
    | "critical";

  reasons: string[];

  signals: MeaningfulnessSignals;
}


/* ========================================
   HELPERS
======================================== */

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    Math.max(value, min),
    max
  );
}


/* ========================================
   1. PRICE MOVEMENT SCORE

   Formula from documentation:

   PriceChange% =
   |CurrentPrice - BaselinePrice|
   / BaselinePrice × 100

   Your backend already provides
   priceChange as a percentage.

   P = min(
     PriceChange% / 10 × 100,
     100
   )
======================================== */

function calculatePriceMovementScore(
  priceChange: number
): number {

  const absoluteChange =
    Math.abs(priceChange);

  return clamp(
    (absoluteChange / 10) * 100,
    0,
    100
  );
}


/* ========================================
   2. VOLUME ANOMALY SCORE

   volumeRatio examples:

   1.0 = normal volume
   2.0 = 2x normal volume
   3.0 = 3x normal volume

   We normalize unusual volume.

   Normal volume = low score
   3x+ normal volume = 100
======================================== */

function calculateVolumeScore(
  volumeRatio: number
): number {

  if (volumeRatio <= 1) {
    return 0;
  }

  return clamp(
    ((volumeRatio - 1) / 2) * 100,
    0,
    100
  );
}


/* ========================================
   3. VOLATILITY SCORE

   volatilityChange is already a
   percentage change.

   50%+ increase = maximum signal.
======================================== */

function calculateVolatilityScore(
  volatilityChange: number
): number {

  const absoluteChange =
    Math.abs(volatilityChange);

  return clamp(
    (absoluteChange / 50) * 100,
    0,
    100
  );
}


/* ========================================
   4. RELATIVE PERFORMANCE SCORE

   Compare stock movement against
   sector performance.

   If sector data does not exist,
   the signal receives 0.

   This is honest to your current backend.
======================================== */

function calculateRelativePerformanceScore(
  priceChange: number,
  sectorPerformance?: number
): number {

  if (
    sectorPerformance === undefined ||
    sectorPerformance === null
  ) {
    return 0;
  }

  const difference =
    Math.abs(
      priceChange -
      sectorPerformance
    );

  /*
   * 5% difference from sector
   * = maximum score
   */

  return clamp(
    (difference / 5) * 100,
    0,
    100
  );
}


/* ========================================
   5. EVENT IMPACT SCORE

   Your backend currently provides:

   newsType
   newsImportance

   We use structured news classification
   rather than letting AI decide.
======================================== */

function calculateEventImpactScore(
  newsType:
    | "event"
    | "context"
    | "opinion"
    | "prediction"
    | "none"
    | undefined,

  newsImportance: number
): number {

  if (newsType !== "event") {
    return 0;
  }

  return clamp(
    newsImportance,
    0,
    100
  );
}


/* ========================================
   6. NEWS IMPACT SCORE

   Only meaningful contextual/event news
   contributes.

   Opinion and prediction content does not
   receive importance in the scoring model.
======================================== */

function calculateNewsImpactScore(
  newsType:
    | "event"
    | "context"
    | "opinion"
    | "prediction"
    | "none"
    | undefined,

  newsImportance: number
): number {

  if (
    newsType === "event" ||
    newsType === "context"
  ) {

    return clamp(
      newsImportance,
      0,
      100
    );

  }

  return 0;
}


/* ========================================
   7. USER RELEVANCE SCORE

   IMPORTANT:

   Your current backend does not yet have
   personalized user relevance data.

   Since this analysis is run for stocks
   being investigated/tracked in Pulse,
   we currently give a neutral score of 0.

   Do NOT fake personalization.

   Later this can use:
   - watchlist priority
   - user interactions
   - investigation history
   - explicit preferences
======================================== */

function calculateUserRelevanceScore(): number {

  return 0;

}


/* ========================================
   MAIN ENGINE
======================================== */

export function calculateMeaningfulness(
  input: MeaningfulnessInput
): MeaningfulnessResult {

  const reasons: string[] = [];


  /* --------------------------------
     CALCULATE INDIVIDUAL SIGNALS
  -------------------------------- */

  const priceMovement =
    calculatePriceMovementScore(
      input.priceChange
    );


  const volumeAnomaly =
    calculateVolumeScore(
      input.volumeRatio
    );


  const volatility =
    calculateVolatilityScore(
      input.volatilityChange
    );


  const relativePerformance =
    calculateRelativePerformanceScore(
      input.priceChange,
      input.sectorPerformance
    );


  const newsImportance =
    input.newsImportance ?? 0;


  const eventImpact =
    calculateEventImpactScore(
      input.newsType,
      newsImportance
    );


  const newsImpact =
    calculateNewsImpactScore(
      input.newsType,
      newsImportance
    );


  const userRelevance =
    calculateUserRelevanceScore();


  /* --------------------------------
     GENERATE REASONS
  -------------------------------- */

  if (priceMovement >= 50) {

    reasons.push(
      "Price moved significantly"
    );

  } else if (priceMovement >= 20) {

    reasons.push(
      "Price moved noticeably"
    );

  }


  if (volumeAnomaly >= 50) {

    reasons.push(
      "Trading volume was unusually high"
    );

  } else if (volumeAnomaly >= 25) {

    reasons.push(
      "Trading volume was above normal"
    );

  }


  if (volatility >= 50) {

    reasons.push(
      "Volatility increased significantly"
    );

  } else if (volatility >= 20) {

    reasons.push(
      "Volatility increased"
    );

  }


  if (relativePerformance >= 50) {

    reasons.push(
      "Stock moved differently from its sector"
    );

  }


  if (eventImpact > 0) {

    reasons.push(
      "A significant company-related event was detected"
    );

  }


  if (
    newsImpact > 0 &&
    input.newsType === "context"
  ) {

    reasons.push(
      "Relevant news provides context for the movement"
    );

  }


  /* --------------------------------
     CORE FORMULA

     P × 0.25
     V × 0.20
     Vol × 0.15
     R × 0.15
     E × 0.10
     N × 0.10
     U × 0.05
  -------------------------------- */

  const rawScore =

    (priceMovement * 0.25) +

    (volumeAnomaly * 0.20) +

    (volatility * 0.15) +

    (relativePerformance * 0.15) +

    (eventImpact * 0.10) +

    (newsImpact * 0.10) +

    (userRelevance * 0.05);


  const score =
    Math.round(
      clamp(
        rawScore,
        0,
        100
      )
    );


  /* --------------------------------
     SEVERITY
  -------------------------------- */

  let severity:
    | "low"
    | "medium"
    | "high"
    | "critical";


  if (score >= 80) {

    severity = "critical";

  } else if (score >= 60) {

    severity = "high";

  } else if (score >= 30) {

    severity = "medium";

  } else {

    severity = "low";

  }


  /* --------------------------------
     FALLBACK
  -------------------------------- */

  if (reasons.length === 0) {

    reasons.push(
      "No major signals detected"
    );

  }


  /* --------------------------------
     RETURN COMPLETE RESULT
  -------------------------------- */

  return {

    score,

    severity,

    reasons,

    signals: {

      priceMovement,

      volumeAnomaly,

      volatility,

      relativePerformance,

      eventImpact,

      newsImpact,

      userRelevance

    }

  };

}