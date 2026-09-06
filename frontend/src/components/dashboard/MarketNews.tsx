interface NewsArticle {
  id: string;

  symbol: string;

  headline: string;

  source: string;

  publishedAgo: string;

  relatedTag: string;

  relatedTagLevel: "critical" | "high" | "notable";

  url?: string | null;
}

interface MarketNewsProps {
  articles?: NewsArticle[];
}

const TAG_STYLES: Record<
  NewsArticle["relatedTagLevel"],
  string
> = {
  critical:
    "border-red-400/20 bg-red-400/[0.06] text-red-300",

  high:
    "border-amber-400/20 bg-amber-400/[0.06] text-amber-300",

  notable:
    "border-blue-400/20 bg-blue-400/[0.06] text-blue-300",
};

function MarketNews({
  articles = [],
}: MarketNewsProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.02]
        p-6
      "
    >
      <p
        className="
          text-[10px]
          font-light
          uppercase
          tracking-[0.2em]
          text-white/35
        "
      >
        📰 Context Behind Your Watchlist
      </p>

      <p
        className="
          mt-2
          text-xs
          font-light
          text-white/35
        "
      >
        Relevant news affecting stocks in your watchlist.
      </p>

      <div className="mt-5 space-y-3">
        {articles.length === 0 && (
          <p className="text-xs font-light text-white/25">
            No relevant news detected right now.
          </p>
        )}

        {articles.map((article) => {
          const content = (
            <>
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <p className="text-xs font-medium text-white/70">
                  {article.symbol}

                  <span className="ml-2 font-light text-white/25">
                    {article.publishedAgo}
                  </span>
                </p>

                <span
                  className={`
                    shrink-0
                    rounded-full
                    border
                    px-2.5
                    py-1
                    text-[10px]
                    font-light
                    ${TAG_STYLES[article.relatedTagLevel]}
                  `}
                >
                  {article.relatedTag}
                </span>
              </div>

              <p
                className="
                  mt-2
                  text-sm
                  font-light
                  leading-relaxed
                  text-white/60
                "
              >
                {article.headline}
              </p>

              <p className="mt-1 text-[11px] font-light text-white/25">
                {article.source}
              </p>
            </>
          );

          const className = `
            block
            rounded-xl
            border
            border-white/[0.05]
            bg-white/[0.015]
            p-4
            transition
            duration-200
            hover:border-blue-400/20
            hover:bg-blue-500/[0.04]
          `;

          /*
           * Only make it a link when the backend
           * actually provides a news URL.
           */

          if (article.url) {
            return (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            );
          }

          return (
            <div
              key={article.id}
              className={className}
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MarketNews;