# Architecture

This document outlines the system design decisions, data model, and technical architecture of Atlas Trade.

## System Boundary Decision

**Core principle:** The matching engine stays outside the hosted path.

TradeMaximizer runs on the organizer's laptop, not as a server-side service. This design choice provides several benefits:

- **Reliability:** Zero server infrastructure for the computationally complex part  
- **Trust:** Uses the exact same algorithm the community has relied on for 17+ years
- **Compatibility:** Generates and consumes the standard file formats other tools expect
- **Cost:** No hosting expenses for algorithm execution
- **Audit:** Organizers can inspect inputs/outputs and re-run if needed

The platform's job is generating compatible want-list files and parsing results — the "wrapper" layer around the proven core.

---

## Infrastructure Separation

**Cloudflare Workers:** Separate Worker for the trade API (`trade-api.atlasrealms.com`) rather than adding routes to the existing recommendation engine Worker. 

**Rationale:** The recommendation engine is a complex LLM pipeline; math trade is a CRUD API. Mixing them increases coupling and blast radius. Independent deployment means trade features can ship without affecting recommendation functionality.

**Frontend:** New routes (`/trade/*`) within the existing React/Vite app rather than a separate application. Shared components (navigation, filters), shared Supabase client, and unified deployment pipeline.

---

## Data Model Overview

**Core entities:** ~10 tables handling the complete trade lifecycle.

| Table | Purpose |
|-------|---------|
| `trades` | Trade events with deadlines and state transitions |
| `games` | Canonical game registry (Atlas catalog + BGG data) |  
| `items` | Offered items (games and cash) with conditions/notes |
| `want_list_entries` | Participant trade assignments (dual-purpose design) |
| `trade_results` | Parsed TradeMaximizer output |
| `user_profiles` | Participant identity and BGG connections |
| `user_bgg_lists` | Cached BGG collection data |

**Dual-purpose want entries:** `want_list_entries` serves both as interest bookmarks (`offered_item_id IS NULL`) and trade assignments (`offered_item_id IS NOT NULL`). This eliminated a planned separate `interest_list` table without adding query complexity.

**UUID internals, sequential export:** All items use UUIDs as primary keys internally. Sequential integers (1, 2, 3...) are assigned fresh on each export for TradeMaximizer compatibility. No locking, no persistence, no coordination needed.

---

## Authentication Strategy

**Supabase Auth with magic links** instead of BGG-account requirements. Email-only authentication removes the primary barrier that prevents new participants from joining.

**Application-layer enforcement:** Auth verification happens in Worker application code at a single enforcement point, not through Supabase Row-Level Security. This design choice provides:
- Single auth logic location (easier to test and reason about)  
- Explicit error handling and messaging
- No RLS policy debugging complexity
- Clear audit trail of access patterns

---

## Scale Design  

**Architecture horizon:** Validated at first-live-pilot scale (~40 participants, 732 items) but designed to scale to convention trades (~5,000+ items, 500+ participants) without architectural changes. Convention-scale operation remains unproven.

**Server-side pagination + DOM windowing:** Browse catalog loads 100 items per page with intersection-observer triggers. TanStack Virtual renders only ~39 DOM nodes regardless of catalog size. Same architecture handles both pilot scale and convention scale.

**On-demand data loading:** BGG community stats (`numtrading`, `numwantintrade`, `numwish`) fetched per-card expansion rather than pre-cached. Keeps initial page loads fast while providing detailed data when users need it.

**Export regeneration:** Want-list files generated fresh from current database state on each export call, not pre-computed or cached. Guarantees late resubmissions are included while maintaining idempotency (same data = same output).

---

## External Service Integration

**BGG API:** Persistent storage with 24-hour sync cooldown matching OLWLG's behavior. Collection data (For Trade, Wants, Owned) cached in `user_bgg_lists` to support cross-session filters and badges without re-fetching.

**On-demand enrichment:** Background `ctx.waitUntil()` calls fetch game metadata when new items are added. User gets instant response; data enriches asynchronously within seconds. No blocking calls in user-facing flows.

**Graceful degradation:** BGG API failures and external price data failures display "View on BGG →" fallback links rather than breaking user flows. External dependencies designed to enhance, not block.

---

## Database Design Principles

**Supabase PostgreSQL** chosen for relational data, foreign key constraints, and integrated auth. Math trade data is inherently relational: `trades → items → want_list_entries → trade_results`.

**Data integrity over convenience:** Type corrections and enrichment happen asynchronously to maintain clean user flows while ensuring database accuracy. Users never see inconsistent states; corrections happen transparently.

**Minimal migrations:** Schema designed to support future features (v2 improvements, shipping trades, co-organizer support) without requiring major migrations. Nullable columns and extensible JSON fields provide flexibility.

The architecture prioritizes reliability and maintainability over premature optimization, with clear upgrade paths for proven scale requirements.