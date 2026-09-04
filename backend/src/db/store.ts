import fs from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { config } from "../config";
import type { Insight, Snapshot } from "../types";

type FileState = {
  watchlist: Array<{ symbol: string; companyName: string }>;
  snapshots: Snapshot[];
  dismissedInsightIds: string[];
  userViews: Record<string, number>;
  lastInsights: Insight[];
};

const fallbackFilePath = path.resolve(process.cwd(), "data", "pulse-store.json");

const defaultState: FileState = {
  watchlist: [
    { symbol: "NVDA", companyName: "NVIDIA Corporation" },
    { symbol: "AAPL", companyName: "Apple Inc." },
    { symbol: "MSFT", companyName: "Microsoft Corporation" }
  ],
  snapshots: [],
  dismissedInsightIds: [],
  userViews: {},
  lastInsights: []
};

export class Store {
  private pool?: Pool;

  async init() {
    if (config.databaseUrl) {
      this.pool = new Pool({ connectionString: config.databaseUrl });
      await this.pool.query(`
        create table if not exists pulse_watchlist (
          symbol text primary key,
          company_name text not null
        );
        create table if not exists pulse_snapshots (
          id serial primary key,
          created_at timestamptz not null,
          payload jsonb not null
        );
        create table if not exists pulse_dismissed_insights (
          insight_id text primary key,
          dismissed_at timestamptz not null
        );
        create table if not exists pulse_last_insights (
          id serial primary key,
          payload jsonb not null,
          created_at timestamptz not null
        );
        create table if not exists pulse_user_views (
          symbol text primary key,
          view_count int not null default 0
        );
      `);

      const existing = await this.pool.query("select count(*)::int as count from pulse_watchlist");
      if ((existing.rows[0]?.count ?? 0) === 0) {
        for (const stock of defaultState.watchlist) {
          await this.pool.query("insert into pulse_watchlist(symbol, company_name) values($1, $2) on conflict do nothing", [stock.symbol, stock.companyName]);
        }
      }
      return;
    }

    await fs.mkdir(path.dirname(fallbackFilePath), { recursive: true });
    try {
      await fs.access(fallbackFilePath);
    } catch {
      await fs.writeFile(fallbackFilePath, JSON.stringify(defaultState, null, 2), "utf-8");
    }
  }

  private async readState(): Promise<FileState> {
    const raw = await fs.readFile(fallbackFilePath, "utf-8");
    return JSON.parse(raw) as FileState;
  }

  private async writeState(state: FileState) {
    const tempPath = `${fallbackFilePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(state, null, 2), "utf-8");
    await fs.rename(tempPath, fallbackFilePath);
  }

  async getWatchlist() {
    if (this.pool) {
      const result = await this.pool.query("select symbol, company_name from pulse_watchlist order by symbol");
      return result.rows.map((row) => ({ symbol: row.symbol, companyName: row.company_name }));
    }
    return (await this.readState()).watchlist;
  }

  async addWatchlistStock(stock: { symbol: string; companyName: string }) {
    if (this.pool) {
      await this.pool.query("insert into pulse_watchlist(symbol, company_name) values($1, $2) on conflict(symbol) do update set company_name = excluded.company_name", [stock.symbol, stock.companyName]);
      return;
    }
    const state = await this.readState();
    if (!state.watchlist.find((s) => s.symbol === stock.symbol)) {
      state.watchlist.push(stock);
      await this.writeState(state);
    }
  }

  async removeWatchlistStock(symbol: string) {
    if (this.pool) {
      await this.pool.query("delete from pulse_watchlist where symbol = $1", [symbol]);
      return;
    }
    const state = await this.readState();
    state.watchlist = state.watchlist.filter((s) => s.symbol !== symbol);
    await this.writeState(state);
  }

  async getLatestSnapshot(): Promise<Snapshot | null> {
    if (this.pool) {
      const result = await this.pool.query("select payload from pulse_snapshots order by created_at desc limit 1");
      return result.rows[0]?.payload ?? null;
    }
    const snapshots = (await this.readState()).snapshots;
    return snapshots.length ? snapshots[snapshots.length - 1] : null;
  }

  async saveSnapshot(snapshot: Snapshot) {
    if (this.pool) {
      await this.pool.query("insert into pulse_snapshots(created_at, payload) values($1, $2)", [snapshot.createdAt, snapshot]);
      return;
    }
    const state = await this.readState();
    state.snapshots.push(snapshot);
    state.snapshots = state.snapshots.slice(-25);
    await this.writeState(state);
  }

  async getDismissedInsightIds(): Promise<string[]> {
    if (this.pool) {
      const result = await this.pool.query("select insight_id from pulse_dismissed_insights");
      return result.rows.map((row) => row.insight_id);
    }
    return (await this.readState()).dismissedInsightIds;
  }

  async dismissInsight(insightId: string) {
    if (this.pool) {
      await this.pool.query("insert into pulse_dismissed_insights(insight_id, dismissed_at) values($1, now()) on conflict do nothing", [insightId]);
      return;
    }
    const state = await this.readState();
    if (!state.dismissedInsightIds.includes(insightId)) {
      state.dismissedInsightIds.push(insightId);
      await this.writeState(state);
    }
  }

  async getUserRelevance(symbol: string): Promise<number> {
    if (this.pool) {
      const result = await this.pool.query("select view_count from pulse_user_views where symbol = $1", [symbol]);
      return Number(result.rows[0]?.view_count ?? 0);
    }
    return (await this.readState()).userViews[symbol] ?? 0;
  }

  async trackView(symbol: string) {
    if (this.pool) {
      await this.pool.query(
        "insert into pulse_user_views(symbol, view_count) values($1, 1) on conflict(symbol) do update set view_count = pulse_user_views.view_count + 1",
        [symbol]
      );
      return;
    }
    const state = await this.readState();
    state.userViews[symbol] = (state.userViews[symbol] ?? 0) + 1;
    await this.writeState(state);
  }

  async saveLatestInsights(insights: Insight[]) {
    if (this.pool) {
      await this.pool.query("insert into pulse_last_insights(payload, created_at) values($1, now())", [insights]);
      return;
    }
    const state = await this.readState();
    state.lastInsights = insights;
    await this.writeState(state);
  }

  async getLatestInsights(): Promise<Insight[]> {
    if (this.pool) {
      const result = await this.pool.query("select payload from pulse_last_insights order by created_at desc limit 1");
      return result.rows[0]?.payload ?? [];
    }
    return (await this.readState()).lastInsights;
  }
}
