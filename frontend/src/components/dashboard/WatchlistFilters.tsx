import { useState } from "react";

type AttentionLevel = "All" | "Critical" | "High Priority" | "Notable";
type Direction = "All" | "Gainers" | "Losers";
type SortOrder = "Highest Score" | "Lowest Score";

export interface WatchlistFilterState {
  attention: AttentionLevel;
  direction: Direction;
  sort: SortOrder;
}

interface WatchlistFiltersProps {
  onChange?: (filters: WatchlistFilterState) => void;
}

const ATTENTION_LEVELS: AttentionLevel[] = [
  "All",
  "Critical",
  "High Priority",
  "Notable",
];

const DIRECTIONS: Direction[] = ["All", "Gainers", "Losers"];

const SORT_ORDERS: SortOrder[] = ["Highest Score", "Lowest Score"];

function WatchlistFilters({ onChange }: WatchlistFiltersProps) {
  const [attention, setAttention] = useState<AttentionLevel>("All");
  const [direction, setDirection] = useState<Direction>("All");
  const [sort, setSort] = useState<SortOrder>("Highest Score");

  function updateFilters(next: Partial<WatchlistFilterState>) {
    const merged: WatchlistFilterState = {
      attention,
      direction,
      sort,
      ...next,
    };

    if (next.attention !== undefined) setAttention(next.attention);
    if (next.direction !== undefined) setDirection(next.direction);
    if (next.sort !== undefined) setSort(next.sort);

    onChange?.(merged);
  }

  return (
    <div
      className="
        flex
        flex-col
        gap-4
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.02]
        p-5
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      {/* ATTENTION LEVEL */}

      <div className="flex flex-wrap gap-2">
        {ATTENTION_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => updateFilters({ attention: level })}
            className={`
              rounded-full
              border
              px-3.5
              py-1.5
              text-[11px]
              font-light
              transition
              ${
                attention === level
                  ? "border-blue-400/30 bg-blue-500/[0.12] text-blue-200"
                  : "border-white/[0.06] text-white/40 hover:border-white/[0.12] hover:text-white/60"
              }
            `}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* DIRECTION */}

        <select
          value={direction}
          onChange={(event) =>
            updateFilters({ direction: event.target.value as Direction })
          }
          className="
            rounded-lg
            border
            border-white/[0.08]
            bg-[#040D20]
            px-3
            py-1.5
            text-[11px]
            font-light
            text-white/60
            outline-none
          "
        >
          {DIRECTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? "Direction: All" : option}
            </option>
          ))}
        </select>

        {/* SORT */}

        <select
          value={sort}
          onChange={(event) =>
            updateFilters({ sort: event.target.value as SortOrder })
          }
          className="
            rounded-lg
            border
            border-white/[0.08]
            bg-[#040D20]
            px-3
            py-1.5
            text-[11px]
            font-light
            text-white/60
            outline-none
          "
        >
          {SORT_ORDERS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default WatchlistFilters;