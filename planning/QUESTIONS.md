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
| 5 | ⭐ High | **Client → Intacct customer mapping.** We matched 7 clients automatically. These 16 still need the right customer ID from you: Acura, Audi, Bentley, Ferrari, Hankook, Honda, JLR (= Jaguar Land Rover?), Lexus, Lucid, MB (= Mercedes-Benz?), Polestar, Porsche, VW / Volkswagen, Volvo MS, and "No Client". You left the Client Settings tab blank on the pricing file — this is the part of it we most need. | Open (Sprint 022) | TBD |
| 7 | High | **Chauffeur market split.** On Maserati and Volvo you split "Professional Chauffeur Hours" into *Standard Market* and *High Markets* at different prices — but both rows carry the same Item ID, `I0217`. Accounting needs to issue a second Item ID so the two rates can be billed apart. Which is which, and can Tatiana create the second item? | Open (Sprint 023) | TBD |
| 8 | High | **The four items you flagged "Duplicate???"** — Vehicle Labor Days, Vehicle Labor O/T Hours, Vehicle Manager Days, Vehicle Manager O/T Hours (`I0204`, `I0205`, `I0202`, `I0203`). You left them unpriced on every tab. Should they be retired from the catalog, merged into another item, or priced? | Open (Sprint 023) | TBD |
| 9 | Medium | **Your two new fee types.** "EV Charging - Flat Rate" and "Per Diem" both already exist in the catalog as **pass-through** items (`I00601`, `I0090`) — billed on receipts at markup. It sounds like you want a **fixed-price** version of each instead. If so those are two new catalog items and accounting needs to issue Item IDs and GL codes. Confirm? | Open (Sprint 023) | TBD |
| 10 | Low | **`I00601` looks like a typo.** Every other Item ID is four digits; EV Charging is five. It came through that way in your catalog file and is already loaded. Should it be `I0060`? | Open (Sprint 023) | TBD |
| 2 | High | **"In event estimate?" column.** Your Item ID sheet has this column blank. Which of the 160 items should appear in the estimate builder for the team, vs. which are accounting-only? | Open | TBD |
| 6 | Medium | **Office payout — per item or per client?** Your catalog sets office payout *per item*: 100% on all pass-throughs, 50% on Planning & Admin roles, 90% on chauffeurs, 75% on everything else. Our app applies **one payout per client** (75%, 80% for VW). Do you want it to vary by item like your catalog — which changes how office-event margins calculate — or is one number per client correct? | Open (Sprint 022) | TBD |
| 4 | Low | **`4000.99`.** This GL code showed up in the old data but isn't in your catalog. Real code to keep, or drop it? | Open | TBD |

## Open — for Ray / internal

| # | Priority | Question | Status |
| --- | --- | --- | --- |
| 11 | ⭐ High | **Two proven price transpositions.** On the **Lucid** and **MB** tabs, `I0042` Right Seat Driver OT Hours is priced at **800** while the parent's overtime column says **80**; and `I0125` Right Seat Driver – Travel O/T is priced at **80** while `I0124` Right Seat Driver – Travel has a blank overtime column. Those two rows look swapped. The importer will flag them rather than guess — someone must confirm the intended values with Dave before the SQL is applied. | Open — resolve during Sprint 020 dry-run review |
| 12 | Medium | **Corporate-event cost.** Nothing DriveShop has sent contains a corporate cost. Is corporate cost a derived rule (e.g. rate × a fixed percentage), or does finance need to supply per-item corporate costs? Determines whether Sprint 025 is small or large. | Open (Sprint 025) |
