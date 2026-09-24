# Product Decisions

This document captures the key product decisions made during Atlas Trade development, structured as Context → Options → Decision → Tradeoffs → Result.

## Build vs. Buy: Native Platform vs. OLWLG Wrapper

**Context:** OLWLG (On-Line Want List Generator) has been the community standard since ~2007, but drives new participants away with unintuitive UX. The question was whether to build a prettier wrapper around OLWLG or create a native replacement.

**Options Considered:**
1. **UX wrapper over OLWLG** — Build a modern frontend that secretly drives OLWLG through form automation
2. **Native platform** — Build independent want collection system, keep TradeMaximizer algorithm manual

**Decision:** Native platform with manual algorithm execution.

**Tradeoffs:** OLWLG has no public API, requiring brittle CGI form scraping. More critically, want list attribution in TradeMaximizer is per-username, so a wrapper would still require every participant to have a BGG account — the primary barrier the wrapper was supposed to eliminate. The UX benefit would be zero.

**Result:** Clean separation of concerns. The platform handles user experience; TradeMaximizer stays trusted and external. New participants can join without BGG accounts via magic-link auth.

---

## Scope Discipline: The Three-Screen Strategy

**Context:** Math trades involve complex workflows with many potential features. Without clear boundaries, the project could expand indefinitely.

**Decision:** *"Atlas is replacing three broken UX screens with something better. We are fixing broken UX flows, not rebuilding functionality that already works. Nothing that doesn't exist in OLWLG today gets built on day one."*

**Explicitly Deferred Items:**
- Results upload automation (organizer manually uploads TradeMaximizer output)
- Filter chips for power users (simple dropdown filters only)
- Priority ordering within want lists (first implementation uses simple ordering)
- Duplicate-protection UI (automatic catalog-driven protection only)
- Trade creation UI (organizer creates trades manually in database)
- Post-trade marketplace features

**Result:** This scope statement held across 22+ build sessions. Each time adjacent features emerged, they were documented as deferred rather than scope-creep built, maintaining focus on the core UX problems.

---

## The Three UX Problems and Their Solutions

### Problem 1: Browse View — "Wall of Text"

**Context:** OLWLG displays offered games as dense text rows with abbreviated columns, no images, and no visual hierarchy.

**Solution:** Card catalog design with game thumbnails, condition badges, BGG community stats, and sweetener indicators. DOM windowing keeps browser performance stable regardless of catalog size (~39 rendered nodes for both 40-item and hypothetical 5,000-item trades).

### Problem 2: Assignment — "Battleship Grid"

**Context:** OLWLG's 2D grid requires horizontal scrolling across dozens of rotated columns. Described by participants as "a giant Battleship grid" that genuinely drives people away.

**Solution:** AssignmentPanel — a slide-in panel (desktop) or bottom sheet (mobile) focused on one wanted game at a time. The decision space collapses from [500 items × 5 offered items] to [1 game × 5 offered items] per interaction. "Auto-pick" uses private value scoring for greedy selection.

### Problem 3: Submit — "Silent Failure"

**Context:** The #1 reported OLWLG error is participants completing want lists but never clicking Submit — their work is silently lost.

**Solution:** Unmissable Dashboard submit flow. The submit button lives exclusively on the Overview page, not buried in want list screens. Dashboard shows complete picture: items offered, wants assigned, wants unassigned. Confirmation email sent on successful submission.

---

## Private ◆ Score System

**Context:** OLWLG's "auto-check" feature (value-based want assignment) is powerful but complex. How to provide the functionality without overwhelming casual users?

**Decision:** Optional private scoring layer where users set ◆ scores on games they want (desire level) and ◆ values on games they're offering (willingness to give up). Auto-assign applies offerings to wants above a threshold; Auto-pick greedily selects up to a value target.

**Tradeoffs:** Adds complexity, but keeps it entirely opt-in. Power users get the efficiency; casual users can ignore it completely. Scores remain private — never shown to other participants.

**Result:** Mirrors OLWLG's auto-check behavior without exposing the complexity to users who don't need it.

---

## BGG "Type Bleed" Background Correction

**Context:** BGG's search API returns expansion items in board game queries due to documented search index limitations. Users would add expansions when they meant to add base games.

**Options Considered:**
1. **Filter search results** — Block expansions before showing them (rejected: users click faster than API responses)
2. **Type-check on add** — Validate item type before insert (rejected: adds latency to user flow)  
3. **Post-add background correction** — Accept immediately, correct asynchronously (chosen)

**Decision:** Background correction via `ctx.waitUntil()` calls to BGG's authoritative Thing API.

**Tradeoffs:** Data integrity over UX convenience. Users get instant 201 response; subtypes correct within seconds in the background. Zero latency cost, correct database state.

**Result:** Clean UX with reliable data. Item types self-correct without user intervention or perceived delays.

---

## Still open

Spring and Summer 2026 both ran. What those trades did not prove:

- The 732 items and 78 of 79 loops are a replay of an older trade file, not the result of either live NYC trade. Spring's live pool was 542 items submitted, 471 at match time.
- The matcher is still run locally by the organizer. That was a choice, and it is still a bottleneck.
- Shipping, disputes, and anything at convention size have not been built or tested.
- Chicago has said what they need and has not run a trade on this.
- The "what a copy comes with" row is the fix Summer pointed at. It is not in players' hands yet, so it is not a result.