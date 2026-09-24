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

## Where it is

Two NYC trades have run on it, Spring and Summer 2026. Organizers in Chicago, running a trade of about 1,600 items, have seen it and named what would make them switch. They have not switched. Convention scale is untested. The matcher still runs on the organizer's laptop, on purpose.

## What the live trades changed

I started by replacing three screens: a wall of text, a grid people called Battleship, and a Submit button half of them never found.

Using it split the work apart. Browse is for finding a game. My Wants is for deciding what you'd give up. Veterans still wanted to see the whole list at once, so Coverage is a second view of the same wants, easy to ignore. A newcomer gets the path. Someone who has used the old tool gets a few more controls, and only after they say so. The organizer is not an advanced participant. They publish results, mail the group, and open a leftovers round. Participants never see that, and want lists stay hidden until a result is final.

In the Spring trade, 86% of people who listed an item ended up in a trade (30 of 35). The prior NYC trade on the old tool was 63% (26 of 41). Different rooms, different games. I would not call that the interface.

After Summer, fourteen people answered a short survey, and I demoed it for the Chicago organizers the next day. I walked in wanting structured data for what a copy includes. What they reported was that they couldn't see it, and that buttons and labels looked the same. The change in progress keeps the lister's own words, shows two items on the row, and puts the rest one tap down. The next trade is what tells me if that was right.

## Historical replay validation (distinct from the live trades)

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
