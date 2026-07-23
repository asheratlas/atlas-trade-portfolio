# Atlas Trade Portfolio

Product research, architecture decisions, and validation methodology for a multi-party board-game trading platform — a deterministic product built around an open-source matching engine.

## Why This Repository Exists

This is a **documentation-only showcase repository** that presents the product thinking behind Atlas Trade, a math-trade platform for the board game community. This is not the production codebase — it documents the research process, architectural decisions, and validation methodology without exposing proprietary data or implementation details.

## What Is a Math Trade

A math trade is a multi-party simultaneous trade where circular exchange cycles are computed algorithmically. Instead of direct one-to-one trades, participants can create trading chains: A gives to B, B gives to C, C gives to A — all coordinated in a single event. This format is popular in board game communities organized through BoardGameGeek, allowing efficient exchange of games among dozens of participants.

## The Problem

The incumbent tool (OLWLG — On-Line Want List Generator) has served the community reliably since approximately 2007 and is maintained by a single volunteer. However, it has three critical UX failure points that prevent new participants from successfully completing trades:

1. **Dense text browse** — games appear as abbreviated text rows with no visual hierarchy or images
2. **"Battleship grid" assignment** — a 2D spreadsheet interface where users assign trades by checking cells across dozens of sideways-scrolled columns  
3. **Silent submit failure** — completing a want list and actually submitting it are separate, non-obvious steps, leading to the #1 reported user error where participants' work is silently lost

## The Build Decision  

Initial research considered building a UX wrapper over OLWLG, but this was rejected after discovering that OLWLG has no API (requiring brittle scraping) and that it wouldn't remove the mandatory BGG-account barrier that blocks new participants. 

**Chosen approach:** Native platform that keeps TradeMaximizer as the matching engine. The organizer runs TradeMaximizer locally on their laptop, while the platform generates and parses the compatible file formats. This preserves the community's trust in the proven algorithm while replacing the three broken UX screens.

**TradeMaximizer Attribution:** TradeMaximizer is open-source software (MIT license) created by Chris Okasaki. It solves the multi-party matching algorithm. Asher Atlas built the entire product wrapper around it — the research, user experience design, data model, workflows, participant roles, export/import system, and validation methodology.

## Architecture at a Glance

```
React/TypeScript Frontend (Cloudflare Pages)
              ↓
    Dedicated Cloudflare Worker API  
              ↓
    Supabase Postgres + Magic-Link Auth

TradeMaximizer Algorithm:
   Export → Run Locally → Upload Results
```

The matching algorithm remains outside the hosted infrastructure by design — organizers download a want-list file, run TradeMaximizer on their laptop (one command, sub-second execution), then upload the results back to the platform.

## Current Status

The first live pilot has completed. The product is now being updated based on feedback from that pilot before the next trade runs. An external organizer has joined as a design partner and is preparing to use the platform for future trades — this begins to broaden product input beyond its builder, but multi-community generalization remains unproven.

Only one live pilot has completed to date. Convention-scale and multi-community operation are not yet validated.

## First Live Pilot and Validation Evidence

### First live pilot (completed)

| Metric | Value | Context |
|--------|-------|---------|
| Participants | ~40 | First live pilot |
| Items catalogued | 732 | First live pilot |
| Frontend pages | 7 | Implementation scope |
| Database tables | 10 | Implementation scope |
| Acceptance criteria tested | 60 | Pre-launch QA |

The live pilot exercised the full participant flow — catalog browsing, per-game want assignment, and submission — with real participants and real items.

### Historical replay validation (distinct from live pilot)

Export fidelity was validated separately by replaying a real historical trade file through the system — not synthetic data. This is distinct from the completed live pilot.

| Metric | Value | Context |
|--------|-------|---------|
| Items in replay data set | 732 | Historical data set |
| Want-list entries backfilled | 16,721 | Historical data import for replay |
| Trade loops validated against database | 78/79 | The rejected entry was an intentionally injected test case |
| Unique users trading | 26 | Both systems produced trades for the same users on the replay data |

The 78/79 figure comes from replaying historical trade data and cross-referencing algorithm output against database want assignments. It is not the outcome metric of the completed live pilot.

See [VALIDATION.md](./VALIDATION.md) for full methodology and gap analysis.

## Repository Guide

- **[PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md)** — Key product decisions with context, alternatives considered, and outcomes
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — System design, data model, and scaling considerations  
- **[VALIDATION.md](./VALIDATION.md)** — Methodology and results of validation against real trade data
- **[artifacts/](./artifacts/)** — Simplified, runnable code examples illustrating export and validation approaches

## About the Builder

Asher Atlas is a product manager focused on end-to-end product development — from problem identification to working product. His approach emphasizes research-driven decisions, architectural rigor, and validation against real-world usage. Atlas Trade demonstrates build-vs-buy analysis, competitive research, scope discipline, and systematic validation methodology.

**Portfolio:** [asheratlas.com](https://asheratlas.com)  
**GitHub:** [github.com/asheratlas](https://github.com/asheratlas)

## Contact

**Email:** asher@asheratlas.com  
**LinkedIn:** [linkedin.com/in/asheratlas](https://linkedin.com/in/asheratlas)  
**Portfolio:** [asheratlas.com](https://asheratlas.com)
