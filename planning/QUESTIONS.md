# Questions — DriveShop

⭐ = blocks the app from producing real estimates.

## Answered

| # | Question | Answered by | Answer |
| --- | --- | --- | --- |
| 1 | ⭐ **Real per-client rate cards (prices).** | Dave Morck, 2026-07-24 (email + `DriveShop_Rate_Card_Template_for_Dave - Updated.xlsx`) | **Delivered.** 20 client tabs, 639 hand-entered prices, all 160 Item IDs matching the catalog exactly. Loaded by Sprint 020. Pass-throughs deliberately left rate-less (billed at markup). |
| 3 | **Overtime — separate line item or attribute of the parent?** | Resolved with Ray, 2026-07-27, on the evidence of Dave's own file | **Attribute of the parent.** Dave filled the parent Overtime Rate column on 158 rows; across all 20 tabs the parent column and the standalone `.01` items agree 136 times, conflict twice and orphan twice. The parent column is the more reliable source. Standalone overtime items stay in `fee_types` for accounting only. |

## Open — for Dave

| # | Priority | Question (as to ask it) | Status | Answer |
| --- | --- | --- | --- | --- |
| 5 | ⭐ High | **Client → Intacct customer mapping.** 16 clients unmapped. | **ANSWERED IN FULL, 2026-08-10.** Tatiana sent `Customers 8.10.26.xlsx` (296 customers), then confirmed every remaining decision and every proposed match. **All 23 clients are now accounted for.** Full table below. Move to the Answered section at the next tidy-up. | See table below |

### Customer mapping — COMPLETE (from `Customers 8.10.26.xlsx`, 2026-08-10)

**The full mapping, ready to load in Sprint 022.** 22 client records after the VW merge, of which 21 carry a customer ID and 1 (No Client) intentionally does not.

| Client | Customer ID | Source |
|---|---|---|
| Genesis | `C0121` | loaded Sprint 019, re-verified |
| Hyundai | `C0019` | loaded Sprint 019, re-verified |
| Lamborghini | `C0156` | loaded Sprint 019, re-verified |
| Maserati | `C0028` | loaded Sprint 019, re-verified |
| Mazda | `C0029` | loaded Sprint 019, re-verified |
| Toyota | `C0048` | loaded Sprint 019, re-verified |
| Volvo | `C0099` | loaded Sprint 019, re-verified |
| Bentley | `C0091` | unambiguous match |
| Lucid | `C0294` | unambiguous match |
| Polestar | `C0207` | unambiguous match |
| Porsche | `C0041` | unambiguous match |
| Audi | `C0009` | Tatiana confirmed |
| Ferrari | `C0202` | Tatiana confirmed |
| JLR | `C0026` | Tatiana confirmed |
| MB | `C0032` | Tatiana confirmed |
| VW (merged from Volkswagen) | `C0208` | Tatiana confirmed |
| Acura | `C0004` | Tatiana confirmed (shared with Honda, intended) |
| Honda | `C0004` | Tatiana confirmed (shared with Acura, intended) |
| Lexus | `C0134` | Tatiana confirmed (bills through Team One agency) |
| Hankook | `C0255` | Tatiana confirmed |
| Volvo MS | `C0099` | Tatiana confirmed (shares Volvo's customer; own rate table) |
| No Client | *(none)* | internal fallback, deliberately unmapped |

**Two client records share a customer ID by design in two places:** Acura and Honda both on `C0004`, and Volvo and Volvo MS both on `C0099`. That is intended and confirmed. Any future "duplicate customer ID" validation must allow it.

### Working notes behind the table

The full 296-row list is deliberately comprehensive; Tatiana offered to prune inactive accounts and was told not to bother (we match only our 23 clients and ignore the rest). **All 7 pre-existing mappings re-verified against this list and still correct** (Genesis `C0121`, Hyundai `C0019`, Lamborghini `C0156`, Maserati `C0028`, Mazda `C0029`, Toyota `C0048`, Volvo `C0099`).

**Unambiguous — one national account, no competing entry. Safe to load.**

| Client | Customer ID | Customer name |
|---|---|---|
| Bentley | `C0091` | Bentley Motors, Inc. (NA49) |
| Lucid | `C0294` | Lucid Group, Inc. |
| Polestar | `C0207` | Polestar Automotive USA Inc. |
| Porsche | `C0041` | Porsche Cars North America |

**Confirmed by Tatiana, 2026-08-10.** Each had a US national account with a Canadian entity or a dealer alongside it; she confirmed the US account in every case. The rejected alternatives are listed so nobody re-opens the question later.

| Client | Customer ID | Customer name | Rejected alternatives |
|---|---|---|---|
| Audi | `C0009` | Audi of America, LLC (NA47) | `C0324` Audi Canada; `C0104` VW/Audi |
| Ferrari | `C0202` | Ferrari North America | `C0137` Ferrari of Seattle (dealer) |
| JLR | `C0026` | Jaguar Land Rover | `C0149` JLR Canada; `C0305` Land Rover Cape Fear |
| MB | `C0032` | Mercedes | `C0109` Mercedes Benz Canada |
| VW (was Volkswagen) | `C0208` | Volkswagen Group America (NA40) | `C0104` VW/Audi; three dealer accounts |

**ANSWERED by Tatiana, 2026-08-10.** All five resolved. Two of them imply data work beyond assigning an ID; see below.

| # | Client(s) | Tatiana's answer |
|---|---|---|
| 5a | Acura **and** Honda | **One ID for both: `C0004` "Acura/Honda".** Intended. Both clients invoice to the same Intacct customer. `C0292` Honda Racing is unrelated; do not use it. |
| 5b | Lexus | **`C0134` "Team One Lexus"** is correct. Lexus work bills through the agency; there is no direct Lexus account. |
| 5c | Hankook | **`C0255` Hankook Tires.** Not `C0276` Hankook Global. |
| 5d | VW **and** Volkswagen | **Should be one client, named "VW", mapped to `C0208` Volkswagen Group America.** Requires a merge, see below. |
| 5e | Volvo MS | **`C0099` Volvo**, same as Volvo. It is a program under the Volvo client with its **own separate rate table**, so it stays a distinct client record sharing Volvo's customer ID. |

**No Client** has no customer and stays unmapped: it is our internal fallback, not a DriveShop account.

### Derived work — two items that are not just ID assignment

**A. The VW / Volkswagen merge is a data move, not a rename.** Verified against `scripts/import_rate_card_prices.sql`: Dave's pricing tab was named **Volkswagen**, so all **71** priced rate-card rows loaded onto the **Volkswagen** client record. The **VW** record has **zero** rate-card rows. So the record Tatiana wants to keep by name is the empty one.

Recommended approach (safer than moving 71 rows): **keep the `Volkswagen` record, rename it to `VW`, set `intacct_customer_id = 'C0208'`, and retire the empty `VW` record.** The data stays put and the surviving name matches what Tatiana asked for.

Before doing it, check what is attached to the empty `VW` record: estimates, contacts, a `primary_approver_id`, and especially `office_payout_pct` (DECISIONS records VW at **80%** where the standard is 75%, and that value must survive the merge). If the empty record carries settings the populated one lacks, copy them across before retiring it. Client deletion is FK-restricted, so anything referencing `VW` must be repointed first.

> **Superseded 2026-08-10 by the Sprint 022 Stage A audit.** Two facts above are wrong and are kept only as a record of what was believed at planning time. (1) It was **70** rate-card rows, not 71; the planning figure counted a `DELETE` scoping line in the generated SQL as a row. (2) Client deletion is **not** FK-restricted: `rate_card_items.client_id` and `client_contacts.client_id` are `ON DELETE CASCADE` (confirmed live via `information_schema`), so deleting a client silently destroys its rate card. Only `estimates.client_id` is restrictive. See DECISIONS §"Client Accounting Identity (Sprint 022)". The merge shipped with an explicit guard rather than trusting the database.

**B. Volvo MS has a customer ID but no prices.** Tatiana states it runs on its **own separate rate table**, but Dave sent no "Volvo MS" tab in the pricing workbook, so it has **zero** rate-card rows. It is now mapped for invoicing but cannot produce a priced estimate. **New question for Dave — see #13.**
| 7 | High (Sprint 024) | **Chauffeur market split.** On Maserati and Volvo you split "Professional Chauffeur Hours" into *Standard Market* and *High Markets* at different prices — but both rows carry the same Item ID, `I0217`. Accounting needs to issue a second Item ID so the two rates can be billed apart. Which is which, and can Tatiana create the second item? | Open (Sprint 024) | **Recommendation: retire them.** Dave left all four unpriced on all 20 tabs, which answers his own question. "Vehicle Manager" already exists in Planning & Admin (`I0185`) and "Event Labor" (`I0027`) covers vehicle labor. Keep in `fee_types` for accounting history; hide from the estimate builder. |
| 8 | High (Sprint 024) | **The four items you flagged "Duplicate???"** — Vehicle Labor Days, Vehicle Labor O/T Hours, Vehicle Manager Days, Vehicle Manager O/T Hours (`I0204`, `I0205`, `I0202`, `I0203`). You left them unpriced on every tab. Should they be retired from the catalog, merged into another item, or priced? | Open (Sprint 023) | TBD |
| 9 | Medium | **Your two new fee types.** "EV Charging - Flat Rate" and "Per Diem" both already exist in the catalog as **pass-through** items (`I00601`, `I0090`) — billed on receipts at markup. It sounds like you want a **fixed-price** version of each instead. If so those are two new catalog items and accounting needs to issue Item IDs and GL codes. Confirm? | Open (Sprint 023) | TBD |
| 10 | Low | **`I00601` looks like a typo.** Every other Item ID is four digits; EV Charging is five. It came through that way in your catalog file and is already loaded. Should it be `I0060`? | Open (Sprint 023) | TBD |
| 2 | High | **"In event estimate?" column.** Your Item ID sheet has this column blank. Which of the 160 items should appear in the estimate builder for the team, vs. which are accounting-only? | Open — **proposed answer ready**, awaiting Dave | **Propose the 83.** Only 83 of the 160 catalog items appear on any client rate card; 77 have never been priced by anyone. Ask Dave to confirm those 83 rather than fill in a blank column of 160 rows. |
| 6 | **DECIDED 2026-08-10** | **Office payout — per item or per client?** Your catalog sets office payout *per item*: 100% on all pass-throughs, 50% on Planning & Admin roles, 90% on chauffeurs, 75% on everything else. Our app applies **one payout per client** (75%, 80% for VW). Do you want it to vary by item like your catalog — which changes how office-event margins calculate — or is one number per client correct? | **Decided: keep PER CLIENT. Not building per-item.** (Ray, 2026-08-10.) Switching rewrites office-event margin calculation across the app, and that formula was found inverted and corrected only in Sprint 018 Phase 1. Not worth reopening without evidence the variance is material. Revisit only if Dave reports a meaningful share of office labor falling outside the standard 75%. | Per client |
| 4 | Low | **`4000.99`.** This GL code showed up in the old data but isn't in your catalog. Real code to keep, or drop it? | Open | TBD |
| 13 | High | **Volvo MS prices.** Tatiana tells us Volvo MS is a program under Volvo that runs on its own separate rate table. You didn't send a Volvo MS tab in the pricing file, so it has no prices at all and can't produce an estimate. Can you send its rate table, or should Volvo MS use the standard Volvo rates? | Open (raised 2026-08-10) | TBD |

## Open — for Tatiana (round 2)

| # | Priority | Question | Status | Answer |
| --- | --- | --- | --- | --- |
| 14 | **ANSWERED 2026-08-10** | **AR payment terms per client.** The "Pay Terms" column on the Client Settings tab came back blank. The exporter treats AR payment terms as a **hard requirement** (`accounting-export-line-service.ts:644`) and, unlike the AP side, it has **no office-profile fallback** — it reads `clients.default_payment_terms` and nothing else. So no invoice can export until this is filled. Is there one standard term across clients (the office profiles use 30 and 45), or does it vary per client? | **Answered** — Tatiana sent `Customers with Pmt Terms.xlsx`; all 21 mapped customers have a term, none blank. Net 30 (10), Net 45 (6), Net 60 (5). Loaded in Sprint 023. | Net 30/45/60 per client |
| 15 | **ANSWERED 2026-08-10** | **Default department per client.** The "Default Dept ID" column also came back blank. The exporter requires a department dimension on both AR and AP lines (`:645`, `:655`). Office profiles carry a location but **no** department, so there is no fallback at all. Note the 10 revenue segments we loaded carry codes (150, 200, 300, 310, 320, 450 …) that look like they may be the department dimension. Is the department derived from the revenue segment on the estimate, or is it a per-client default we still need? | **Answered — the department IS the revenue segment, and it belongs to the EVENT not the client.** Her department list matches the 10 `revenue_segments` we loaded in Sprint 019 exactly, so no data was needed; the exporter just wasn't reading `revenue_segments.code`. Fixed in Sprint 023. | Revenue segment code |

**Why these were missed until now:** the 2026-08-10 review focused on customer IDs, which were the loudest gap. Tracing the exporter's full required-field list afterward surfaced two more fields from the same blank tab. Location and AP payment terms turned out to be covered by the office profiles Sprint 019 loaded; these two are not.

## Open — for Ray / internal

| # | Priority | Question | Status |
| --- | --- | --- | --- |
| 11 | High | **Two price transpositions on the Lucid and MB tabs.** | **RESOLVED in Sprint 020** (operator decision 2026-08-02: "apply as recommended, no numeric overrides"). `I0042` Right Seat Driver OT Hours priced at 800 was **not** loaded: standalone overtime items are skipped by design, and the parent `I0041` took its overtime from the parent column (80), which is correct. `I0125` Travel O/T at 80 was likewise skipped, and parent `I0124` was loaded with **no** overtime rate rather than inventing one. **Residual:** Lucid and MB have no Right Seat Driver Travel overtime rate. Confirming that with Dave is question **#4 in his open list**, not a separate item. |
| 12 | Medium | **Corporate-event cost.** Nothing DriveShop has sent contains a corporate cost. Is corporate cost a derived rule (e.g. rate × a fixed percentage), or does finance need to supply per-item corporate costs? Determines whether Sprint 025 is small or large. | Open (Sprint 025) |
