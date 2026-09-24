# Validation Methodology

This document describes the systematic validation of Atlas Trade against real production data — the strongest differentiator of this project.

## Current Status

The first live pilot has completed (~40 participants, 732 items). The product is now being updated based on feedback from that pilot before the next trade runs. An external organizer has joined as a design partner and is preparing to use the platform for future trades.

This document covers two distinct evidence types that must not be conflated:

1. **Historical replay validation** — export fidelity tested by replaying a real historical trade file through the system (source of the 78/79 and 26-users-trading metrics)
2. **First live pilot** — real participants used the platform end-to-end for want collection and submission (~40 participants, 732 items catalogued)

The 78/79 figure is a historical replay result, not the live pilot outcome. The two evidence types are reported separately; no live-pilot outcome is inferred from the replay.

## Validation Approach

**Principle:** Test export fidelity against actual trade data, not synthetic examples.

Rather than validate against hypothetical scenarios, the platform was tested by replaying a real historical math trade through the system. This approach exposed genuine edge cases and data inconsistencies that synthetic testing would miss.

**Source data for historical replay:** A quarterly in-person community trade in New York, Winter 2026 — a real trade with ~40 participants, 732 items, and 34 active users who submitted want lists.

## Methodology

### 1. Data Backfill
Historical participant data and items were imported into the Atlas Trade database, preserving:
- Real participant identifiers (kept private; never published)
- Actual game titles and BGG IDs  
- Original item conditions and sweetener notes
- Authentic want-list assignments from OLWLG export

### 2. Export Generation
Atlas Trade generated a want-list file (`.txt`) from the backfilled database using the same format that OLWLG produces for TradeMaximizer input.

### 3. Algorithm Execution  
TradeMaximizer was run on both the original OLWLG file and the Atlas-generated file using identical settings (`SEED=123456`, `METRIC=Users-Trading`).

### 4. Cross-Reference Validation
A validation script was written to cross-reference every trade in the Atlas-generated results against `want_list_entries` in the database, verifying that each trade corresponded to an actual want assignment.

## Historical Replay Results

These metrics come from replaying historical trade data through the system — not from scoring the completed live pilot.

| Metric | Value | Context |
|--------|-------|---------|
| **Total trade loops validated** | 78/79 | The rejected entry was an intentionally injected test case |
| **Unique users trading** | 26 | Both systems produced trades for the same users on the replay data |
| **Items processed** | 732 | Historical data set |
| **Want-list entries verified** | 16,721 | Historical data backfill |

**The single failed validation** was a manually injected test entry that was not present in the actual database — confirming the validation logic was working correctly.

## Gap Analysis  

The systematic comparison identified three categories of differences between Atlas and OLWLG exports:

### Gap 1: Empty Want Lines (Fixed)
**Issue:** OLWLG emits lines like `(username) itemId :` for participants who offered items but submitted no specific wants. Atlas was silently dropping these entries.

**Impact:** 75 such lines in the original file. With TradeMaximizer's `ALLOW-DUMMIES` setting, these items can still be matched to wildcard receivers.

**Resolution:** Fixed in Worker v1.27. Empty want lines now emit correctly.

**Classification:** Real bug — fixed.

### Gap 2: Named Group References (Not Fixed, By Design)
**Issue:** OLWLG supports named group references like `%Canvas` and `%ARSE` for equivalence grouping. Atlas has no equivalent concept.

**Impact:** Manual testing showed the missing group references resulted in +1 trade (79 vs 78 total loops), but both systems found the same 26 unique users trading — the optimization metric was identical.

**Resolution:** Not implemented. Group references are OLWLG-specific artifacts. Atlas's catalog-driven duplicate protection covers the same functional need without requiring manual group management.

**Classification:** Design boundary — deliberate difference.

### Gap 3: Sequential ID Assignment (Irrelevant)
**Issue:** Atlas assigns sequential IDs by item creation timestamp; OLWLG uses geeklist ordering. This produces different but equivalently optimal results with the same random seed.

**Impact:** Same optimization quality, different trade assignments.

**Resolution:** No change needed. Different orderings with identical seeds produce different but equally valid optimal solutions.

**Classification:** Irrelevant to trade quality.

## What This Validates

**Export fidelity:** The platform correctly generates TradeMaximizer-compatible want-list files from database state.

**Data integrity:** Every authentic replay result checked by the validator corresponded to an actual want assignment; the intentionally injected invalid entry was rejected.

**Algorithmic equivalence:** Results are consistent with the community-standard OLWLG tool on identical input data.

**Edge case handling:** Real-world data edge cases (empty wants, special characters, complex item types) are handled correctly.

## What This Does Not Validate

**Live pilot as replay metric:** The 78/79 trade-loop figure is a historical replay result. It does not describe the completed live pilot's outcome.

**Multi-community generalization:** Historical replay used one community's trade data; the first live pilot ran in a single-community context. Different communities may have different usage patterns or edge cases. An external organizer has joined as a design partner and is preparing to use the platform for future trades — this begins to broaden product input beyond its builder, but multi-community generalization remains unproven.

**Convention-scale operation:** The largest live event was ~40 participants. Convention trades with 500+ participants and 5,000+ items remain unproven at this scale.

**Shipping trade logistics:** Validation focused on want-list generation and matching. Physical fulfillment, participant verification, and dispute resolution processes were not tested.

**Post-pilot revisions:** The product is being updated from observed pilot feedback. Whether those changes hold under the next live event is not yet validated.

**Long-term reliability:** Single-point-in-time validation doesn't prove system stability over extended operation periods.

## Validation Infrastructure

The validation methodology itself is reproducible and extensible:

- **Automated cross-reference script** that can be run against any trade data
- **Gap classification framework** for systematically analyzing differences  
- **Real-data testing approach** that can be applied to future features
- **Success criteria methodology** for defining what constitutes valid operation

This validation approach provides a template for systematically testing complex algorithmic systems against real-world data rather than relying solely on unit tests or synthetic scenarios.