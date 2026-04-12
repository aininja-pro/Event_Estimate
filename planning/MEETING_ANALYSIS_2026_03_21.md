# DriveShop Friday Meeting Analysis — March 21, 2026

**Attendees:** Ray, Dave, Tad, Joelle, Justin, Chris (new — creative/exec), Gayle, Betsy (dropped)
**Key Signal:** Chris Hercik is new to the team (~6 weeks in), came from a company that had a similar system with "terrible UI." He and Joelle are the most vocal feature advocates on this call. They're thinking at a strategic/financial controls level, not just workflow.

---

## PART 1: EVERY ITEM FROM THE TRANSCRIPT

### A. ACTION ITEMS (Specific things they want built or fixed)

| # | Item | Who Asked | Priority Signal | Status vs CLAUDE.md |
|---|------|-----------|-----------------|---------------------|
| A1 | **DriveShop internal rate card** — Locked rates for DS employees. Internal day rates can't be changed by estimators. Only hours adjustable, not rate. | Chris, Joelle | HIGH — repeated 3x by different people | **Net new.** No DS internal rate card exists. Current rate_card_items are client-facing MSA rates only. Need a "DriveShop" client entry with locked-rate flag. |
| A2 | **Employee/IC/Vendor column on Schedule grid** — Dropdown per staff row: Internal, External (IC), Vendor. Drives margin analysis. | Joelle, Chris, Dave | HIGH — Joelle framed it as the key to margin visibility | **Net new.** Schedule grid has name, role, day entries. No resource_type column exists on labor_entries or schedule_entries. |
| A3 | **Fees section/bucket on estimate** — Separate section for Agency Fee, Management Fee, future Media Buying Fee. Not a line item — its own section like Production or Travel. | Chris, Joelle, Gayle | HIGH — Chris said "own little section" | **Partially built.** Agency fee % lives on rate_card_items (client-level). But there's no dedicated "Fees" section on the estimate builder UI, and the fee isn't auto-calculated as a line on the summary. |
| A4 | **Agency fee auto-populate** — Default ON for all estimates. Estimators must actively remove it, not remember to add it. | Joelle, Justin | HIGH — Joelle: "rather it auto populate and have people take it off" | **Net new.** Current system has agency_fee_pct on clients table but doesn't auto-generate a fee line item on estimate creation. |
| A5 | **Recap UI — side-by-side estimate vs actuals** — When segment enters Recap, show original estimate alongside actual cost entry fields. Variance auto-calculates. | Ray (proposed), Tad, Dave | HIGH — core to Outputs phase | **Not built.** Segment status lifecycle exists (draft→recap→invoiced) and field locking rules are defined, but no actuals entry UI exists. This is the Recap/Change Order sprint (Weeks 10-11 per CLAUDE.md). |
| A6 | **Recap variance threshold flag** — If recap exceeds estimate by X%, auto-flag for AM review before it goes to accounting. Configurable threshold. | Gayle | MEDIUM-HIGH — Gayle: "I don't want to create a roadblock... but if it's really different" | **Net new.** Three-gate approval exists for estimates but no recap-specific variance gate. system_settings could hold the threshold. |
| A7 | **Financial analysis/overview page** — Collapsed view showing: % of budget that's out-of-house, % ICs, % internal, GP margin, NR, agency fees. Executive snapshot before estimate goes active. | Joelle, Chris | HIGH — Joelle described it twice, Chris reinforced | **Partially built.** Summary tab exists with GR/NR/GP. But no breakdown by resource type (internal/external/vendor), no % of budget analysis, no executive snapshot view. |
| A8 | **Budget tracking when Active** — When segment is Active, show estimate vs actual spend as invoices come in. Running budget burn rate. | Chris, Joelle | MEDIUM — depends on how actuals get entered | **Net new.** Active mode currently just locks fields. No running actuals tracking exists. Tied to Recap UI (A5). |
| A9 | **Cost rate attached to named people** — When you assign "Tim" to a role, his actual internal cost rate auto-populates. If Tim costs $250/day but the MSA rate is $125, show the margin gap. | Chris, Joelle | HIGH — Chris: "we lost $7,000 worth of their time" | **Net new.** Schedule grid has names as free text. No people/resource master table exists. No cost rate lookup by person. This requires a new `resources` or `staff` table. |
| A10 | **IC rate card / known contractor rates** — ICs used regularly should have their rates stored. When you pull in "Danny Carey" as an IC, his rate auto-populates. | Joelle | MEDIUM — enhancement to A9 | **Net new.** Same infrastructure as A9 — a staff/resources table with rate associations. |
| A11 | **Rate card swap on existing estimate** — If office builds estimate on generic DS rate card, then needs to align to Mazda rate card, allow switching. Handle missing roles gracefully ("you don't have a code for this role — what do you want to do?"). | Justin | MEDIUM | **Not built.** Client is set at estimate creation and rate card items reference that client. Changing client mid-estimate would need a migration/reconciliation flow. |
| A12 | **Copy/duplicate estimate** — Copy an existing estimate to create a new one. Different client = different rate card but same structure. | Joelle | MEDIUM — "does that make sense to copy it with the right rates?" | **Not built.** No clone function exists on estimate-service.ts. |
| A13 | **Estimate templates** — Pre-built templates by event type (3-day Ride & Drive, Site Visit, etc.). Auto-populate standard roles and line items. | Chris, Joelle | MEDIUM-HIGH — Chris: "if there was like a template, a three day ride and drive" | **Not built.** The AI scoping assistant (next sprint) could handle this, or it could be a simpler template system. |
| A14 | **AI-generated templates from historical data** — "Look at 20 ride and drives, average them into a template." | Chris | MEDIUM — natural extension of AI sprint | **Not built but planned.** Historical estimates database exists (1,700+ files). AI Intelligence sprint is next. This is a great use case for it. |
| A15 | **Void/skip line items in recap** — Ability to zero out or mark "not needed" on estimated items that weren't used. Note field for why. | Gayle | MEDIUM | **Not built.** Part of Recap UI (A5). |
| A16 | **GP threshold flag on estimates** — If estimate GP falls below configurable minimum (e.g., 20%), flag for review before submission. | Chris | MEDIUM — "if this comes in but it's below the percentage threshold, there's a flag" | **Net new.** Similar to existing $50K approval threshold. Could be another rule in system_settings + approval chain. |
| A17 | **Rollback bug fix** — Rolling back from Active lost the ability to move forward to Active again. | Ray (self-caught) | HIGH — bug | **Unknown.** Need to check workflow-service.ts rollback logic. Ray caught this live in the demo. |
| A18 | **Hotel night calculation logic** — Currently inaccurate. Needs to account for fly-in/fly-out dates, not just work days. | Ray, Joelle | LOW-MEDIUM — cosmetic/accuracy | **Known issue.** Schedule grid calculates hotel nights but logic is naive (counts work days). Needs fly-in/fly-out date awareness. |
| A19 | **Non-event estimate types** — System should support Creator, Content, Fleet, not just Events. May need different rate card structures or templates. | Joelle | MEDIUM — "four main things: events, fleet, creator, content" | **Partially addressed.** System is flexible enough (custom items, custom sections), but no explicit event_type-driven template system. |
| A20 | **Agency fee selective application** — Some line items are subject to agency fee, others aren't (Gayle's LSM example). Need per-line-item agency fee applicability flag. | Gayle | MEDIUM — "only some of it is appropriated to the 10%" | **Net new.** Current agency fee is a flat % on the client. No per-line-item override. |

### B. FEEDBACK (Opinions, UX, workflow observations)

| # | Feedback | Who | Implication |
|---|----------|-----|-------------|
| B1 | Auto-save is working and appreciated | Tad | ✅ Confirmed working. Good. |
| B2 | Collaborative editing — "will there be a shared link?" | Tad | Real-time collab not built, but multiple users can access same estimate. May need to address conflicts later. |
| B3 | "Brings a tear to my eye" / "light years ahead" / "impressive" | Chris, Justin, Joelle | Strong positive signal. Team is bought in. |
| B4 | "The fact that you can't screw up a calculation in Excel" | Chris | Core value prop resonating. |
| B5 | "We used to have a really robust system but terrible UI" | Joelle | They know what they need. Joelle and Chris are the feature experts from their past system. |
| B6 | People are putting themselves in junior roles to avoid billing at their real rate | Chris, Joelle | This is the #1 financial control problem. A9 (cost rate by person) directly solves this. |
| B7 | "We're not getting any agency fees" — Chris looked at historical analysis chart | Chris, Justin | The historical data analysis we built in Phase 1 is already driving business decisions. Agency fee auto-populate (A4) is the direct fix. |
| B8 | Rate card flexibility for non-MSA work (Lucid marketing vs Lucid press) | Justin | Need clarity on when to use client rate card vs DS rate card. The "who decides" question. |
| B9 | Gayle had to leave early but was engaged on financial controls | Gayle | She's an important voice for office-side workflows. Follow up separately. |

### C. STRATEGIC SIGNALS

| # | Signal | Who | What It Means |
|---|--------|-----|---------------|
| C1 | **Chris is a power user and executive champion** | Chris | He's thinking about financial controls, margin optimization, revenue leakage. He'll push for sophistication. He's also the one who spotted the agency fee gap in the historical analysis. Treat him as a key stakeholder going forward. |
| C2 | **Joelle knows exactly what they need from their old system** | Joelle | She described the "in rate / out rate" pattern, the financial analysis view, the resource typing. She's the functional spec. Get a follow-up call with her and Chris. |
| C3 | **Revenue leakage is the #1 business problem** | Chris, Joelle, Justin | People under-billing internal time, not adding agency fees, not tracking real cost vs sell rate. The system needs financial guardrails, not just workflow automation. |
| C4 | **Non-event work is growing** — Creator, Content, Video Production | Chris, Joelle | The platform needs to be flexible beyond auto events. This is scope expansion but also expansion of the platform's value. |
| C5 | **"We just sold a video production for an actual commercial"** | Chris | DriveShop is diversifying. The estimate engine will serve more than just experiential events. |
| C6 | **Tad focused on lifecycle and notifications** | Tad | His concerns are about the workflow: submit → review → approve → notify. He wants the system to manage the process, not just store data. Approval chain + notifications already cover this. |
| C7 | **No pushback on direction or timeline** | All | Zero negative signals. Everyone validated the approach. "Going the right direction" confirmed multiple times. |
| C8 | **"Get us halfway there" with templates** | Joelle | Templates don't need to be perfect. 80% populated with the right roles = massive time savings. AI sprint can deliver this. |

---

## PART 2: BUILD STATUS CROSS-REFERENCE

### Already Built (confirmed working in demo)
- ✅ Rate card engine with 8 clients
- ✅ Estimate builder with multi-segment support
- ✅ Schedule grid (calendar staffing, day types, OT)
- ✅ Labor log rollup from schedule
- ✅ Summary tab with GR/NR/GP
- ✅ Segment-level status lifecycle (draft→active→recap→invoiced)
- ✅ Version history with rollback
- ✅ Three-gate approval chain (AM→Executive→Client)
- ✅ $50K configurable threshold
- ✅ Auto-save (Tad confirmed)
- ✅ Custom rate/line item support
- ✅ Pipeline as default status
- ✅ Internal/client notes separation
- ✅ PO number + Project ID fields
- ✅ Travel/hotel/per diem toggles on schedule
- ✅ Auth with role-based access

### Partially Built
- 🟡 Agency fee — stored on client record but not rendered as auto-calculated line on estimate
- 🟡 Financial summary — GR/NR/GP exists but no resource-type breakdown or executive snapshot
- 🟡 Active/Recap mode — status transitions exist, field locking rules defined, but no actuals entry UI

### Not Built (Net New from this meeting)
- 🔴 DriveShop internal rate card with locked rates (A1)
- 🔴 Resource type column: Internal/External/Vendor (A2)
- 🔴 Fees section on estimate builder (A3)
- 🔴 Agency fee auto-populate on estimate creation (A4)
- 🔴 Recap UI with side-by-side actuals (A5)
- 🔴 Recap variance threshold (A6)
- 🔴 Financial analysis executive view (A7)
- 🔴 Cost rate by named person / staff table (A9, A10)
- 🔴 Rate card swap (A11)
- 🔴 Estimate clone/copy (A12)
- 🔴 Estimate templates (A13)
- 🔴 GP threshold approval flag (A16)
- 🔴 Per-line-item agency fee applicability (A20)

---

## PART 3: SPRINT RECOMMENDATIONS

### Immediate Priority: "Financial Controls" Sprint (Pre-AI)

The meeting revealed that **revenue leakage and margin visibility** are the #1 business problem — not AI scoping. Chris and Joelle made this viscerally clear with the "$7,000 lost on one person" and "we're not getting any agency fees" examples.

**Recommendation: Insert a focused Financial Controls sprint before the AI Intelligence sprint.** The AI sprint is still next on the SOW timeline, but these financial controls are what will make Derek, Chris, and Joelle feel like the system is production-ready. The AI is a "wow" feature; financial controls are the "this replaces our spreadsheets" feature.

#### Sprint A: Financial Controls (1-2 days with Claude Code)

**Build order:**

1. **Fees Section + Agency Fee Auto-Populate** (A3, A4) — Add a "Fees & Markups" section to the estimate builder. On estimate creation, if client has agency_fee_pct > 0, auto-create an agency fee line item. Render in summary.

2. **Resource Type on Schedule** (A2) — Add resource_type dropdown (Internal/External/Vendor) to schedule grid rows. Store on labor_entries. Surface in summary breakdown.

3. **DriveShop Rate Card + Locked Rates** (A1) — Create a "DriveShop" client with internal rate card. Add `is_locked` boolean to rate_card_items. When locked, estimators can change quantity/hours but not unit_rate.

4. **GP Threshold Flag** (A16) — Add gp_threshold_pct to system_settings. In Summary tab, if GP% < threshold, show warning banner. Optionally gate submission.

5. **Rollback Bug Fix** (A17) — Investigate and fix the lost-forward-transition after rollback.

#### Sprint B: AI Intelligence (per SOW — Weeks 9-10)

Proceed with historical data training and AI scoping assistant as planned. Now enriched with:
- Template generation from historical averages (A14)
- "Copy this estimate for a different client" via natural language (A12)
- Estimate clone as a non-AI feature built alongside

#### Sprint C: Recap & Change Orders (per SOW — Weeks 10-11)

- Recap UI with side-by-side actuals (A5)
- Variance threshold flag (A6)
- Void/skip line items (A15)
- Financial analysis executive view (A7)
- Budget tracking when Active (A8)

#### Deferred / Phase 3

- Staff/resources master table with cost rates (A9, A10) — Requires HR data from DriveShop. Big dependency.
- Rate card swap on existing estimate (A11) — Edge case, complex reconciliation logic.
- Per-line-item agency fee applicability (A20) — Gayle's LSM scenario. Needs more discovery.
- Non-event estimate types (A19) — Works with current flexible system. Templates solve 80% of this.

---

## PART 4: UPDATED OPEN QUESTIONS

### New Questions from This Meeting

**For Chris + Joelle (schedule a follow-up call):**
- [ ] What were the "in rate / out rate" fields in your old system? How were they displayed?
- [ ] What was the financial analysis view in the old system? Can you screenshot or describe the layout?
- [ ] For the GP threshold — what percentage should trigger a flag? Is it per-client or global?
- [ ] Which line items are typically subject vs not subject to agency fees? Can you list the rules?

**For Derek:**
- [ ] Confirm: should agency fee auto-populate on ALL non-MSA estimates? Or all estimates?
- [ ] DriveShop internal rate card — who provides the employee day rates? HR? Finance?
- [ ] Chris mentioned locking internal rates. Do you agree with that policy?

**For Dave:**
- [ ] How do actuals get entered today? Invoice-by-invoice as they come in, or bulk at end of event?
- [ ] What's the recap variance threshold that would be useful? 5%? 10%? Dollar amount?

**For Gayle (follow up separately — she left early):**
- [ ] The LSM agency fee scenario — can you send an example estimate showing which lines get the 10% and which don't?
- [ ] For recap variance flags — do you want the flag to block invoicing, or just be a visual warning?

---

## PART 5: BLUEPRINT — FINANCIAL CONTROLS SPRINT

*Save as: `planning/FINANCIAL_CONTROLS_BLUEPRINT.md`*
*Hand to Claude Code for execution.*

See separate file: `FINANCIAL_CONTROLS_BLUEPRINT.md`
