# BUILD INSTRUCTIONS: Estimate Builder UI Concept + Rate Card Management

## CONTEXT

We have an existing React demo app with shadcn/ui, Tailwind, and a dark sidebar. It currently has these nav sections:

```
Discovery Intelligence
  📊 Historical Dashboard
  📋 Historical Rate Analysis
  🤖 AI Scoping Assistant

Phase 1 Deliverables
  🏗️ System Architecture
  🗄️ Database Schema
  🔄 Estimate Lifecycle
  📅 Phase 2 Roadmap
```

We need to add a NEW nav section called **"UI Concepts"** with TWO new pages. These are interactive mockups to show production stakeholders (Dan and Tim — corporate event supervisors who build estimates daily) what the production system will look and feel like. They are NOT functional — they are pre-populated with realistic sample data to demonstrate the vision.

**IMPORTANT:** Match the existing app's styling exactly. Same dark sidebar, same shadcn components, same slate/zinc base with blue accents. These pages should feel like they belong in the same app.

---

## NAVIGATION UPDATE

Add a third section to the sidebar:

```
Discovery Intelligence
  📊 Historical Dashboard
  📋 Historical Rate Analysis
  🤖 AI Scoping Assistant

Phase 1 Deliverables
  🏗️ System Architecture
  🗄️ Database Schema
  🔄 Estimate Lifecycle
  📅 Phase 2 Roadmap

UI Concepts                    ← NEW SECTION
  🖥️ Estimate Builder          ← NEW PAGE (this is the hero page)
  💰 Rate Card Management      ← NEW PAGE
```

---

## PAGE 1: ESTIMATE BUILDER (Hero Page — The Main Event)

**Nav label:** Estimate Builder
**Icon:** lucide FileSpreadsheet or LayoutDashboard

This is the most important page in the entire demo for tomorrow's meeting. Dan and Tim need to see what their daily workflow will look like in this system.

### LAYOUT: Split Panel (70/30)

**Left Panel (70%)** — The Estimate Working Area
**Right Panel (30%)** — AI Intelligence Panel with nudges

Use a clean split layout. The right panel should have a subtle left border or slightly different background shade to visually separate it.

---

### LEFT PANEL: Estimate Working Area

#### Event Header (top of left panel)
A Card component with the event details. Pre-populate with this sample data:

| Field | Value |
|-------|-------|
| Client | Mazda |
| Event Type | Ride & Drive |
| Event Name | Mazda CX-70 Launch Experience |
| Location | Los Angeles, CA |
| Dates | March 15-18, 2025 (4 days) |
| Expected Attendance | 5,000 |
| Status | Draft (yellow badge) |
| Office | Corporate |

These should look like clean form fields (shadcn Input/Select components) that appear editable but are pre-filled. Include a subtle "Edit" icon on the card header.

#### Section Tabs (below header)
Use shadcn Tabs component with these tabs:

**Labor Log** | Production | Travel & Logistics | Creative | Access Fees & Insurance | Summary

**Labor Log tab is active by default.** This is the tab Dan and Tim care about most.

---

#### LABOR LOG TAB (Active/Default)

##### Location Selector (top of tab)
Show tabs or a dropdown for multi-location support:
**📍 Los Angeles (Primary)** | 📍 San Diego | + Add Location

This demonstrates the multi-location labor log concept (one estimate → multiple labor logs for tour events).

##### Labor Log Table
Use a shadcn DataTable with these columns:

| Role | Qty | Days | Day Rate | Line Total | Cost Rate | Cost Total | GP | GP% |
|------|-----|------|----------|------------|-----------|------------|-----|-----|

Pre-populate with this sample data (using actual DriveShop roles and rate ranges from the extracted data):

```
Program Director       | 1 | 4 | $750  | $3,000  | $450  | $1,800  | $1,200  | 40%
Event/Vehicle Manager  | 2 | 4 | $500  | $4,000  | $300  | $2,400  | $1,600  | 40%
Product Specialist     | 6 | 4 | $425  | $10,200 | $255  | $6,120  | $4,080  | 40%
In-Vehicle Host        | 8 | 4 | $375  | $12,000 | $225  | $7,200  | $4,800  | 40%
Registration Host      | 3 | 4 | $300  | $3,600  | $180  | $2,160  | $1,440  | 40%
Professional Chauffeur | 4 | 4 | $100/hr (10hr) | $4,000 | $65/hr | $2,600 | $1,400 | 35%
Event/Vehicle Handler  | 4 | 4 | $330  | $5,280  | $200  | $3,200  | $2,080  | 39%
Per Diem (28 staff)    | 28| 4 | $50   | $5,600  | $50   | $5,600  | $0     | 0%
```

##### Table Features to Show:
- Each row has a subtle hover effect
- Role column shows a Select/dropdown icon (implying you pick from rate card)
- Qty, Days, Rate fields look like editable inputs
- Line Total, Cost Total, GP, GP% are calculated/read-only (slightly different background)
- "➕ Add Role" button at the bottom of the table
- Show row-level delete icon (trash can, muted)

##### Labor Log Summary (below table)
A summary bar or card:

```
Total Labor Revenue: $47,680  |  Total Labor Cost: $31,080  |  Gross Profit: $16,600  |  GP%: 34.8%
Staff Count: 28  |  Per Diem Total: $5,600  |  Total with Per Diem: $53,280
```

---

#### OTHER TABS (Minimal — just show structure)

For the **Production**, **Travel & Logistics**, **Creative**, and **Access Fees & Insurance** tabs, show a simpler line-item table:

| Line Item | Description | Quantity | Unit Cost | Total | Markup % | Client Total |
|-----------|-------------|----------|-----------|-------|----------|-------------|

Pre-populate each with 2-3 realistic sample line items. For example:

**Production tab:**
```
Vehicle Transport (LA)    | Carrier delivery of 12 vehicles | 1 | $8,500  | $8,500  | 15% | $9,775
Tent & Structure Rental   | 40x60 event tent, 4 days       | 1 | $12,000 | $12,000 | 10% | $13,200
Signage & Branding        | Event branded materials         | 1 | $3,200  | $3,200  | 15% | $3,680
```

**Travel & Logistics tab:**
```
Staff Airfare (out of market) | Round trip for 8 OOM staff | 8 | $450 | $3,600 | 0% | $3,600
Hotel (staff)                 | 4 nights, 8 rooms          | 32| $189 | $6,048 | 0% | $6,048
Ground Transport              | Van rental + fuel, 5 days   | 1 | $1,800| $1,800 | 10%| $1,980
```

**Summary tab:**
Show a consolidated P&L view:

```
Section          | Revenue    | Cost       | GP        | GP%
─────────────────|────────────|────────────|───────────|─────
Labor            | $47,680    | $31,080    | $16,600   | 34.8%
Per Diem         | $5,600     | $5,600     | $0        | 0.0%
Production       | $26,655    | $23,700    | $2,955    | 11.1%
Travel/Logistics | $11,628    | $11,448    | $180      | 1.5%
Creative         | $6,900     | $6,000     | $900      | 13.0%
Access/Insurance | $4,250     | $3,800     | $450      | 10.6%
─────────────────|────────────|────────────|───────────|─────
TOTAL            | $102,713   | $81,628    | $21,085   | 20.5%
```

---

### RIGHT PANEL: AI Intelligence Panel

This is the "nudge" panel — the Turbo Tax concept. It sits alongside the estimate and provides contextual intelligence based on what the user is working on.

#### Panel Header
"🤖 AI Assistant" with a subtle blue accent line or icon.

#### Nudge Cards (stacked vertically)
Show 4-5 pre-populated nudge cards. Each one is a small shadcn Card with:
- An icon indicating the nudge type (💡 suggestion, ⚠️ warning, ✅ validation, 📊 insight)
- A short, specific message
- A muted "Based on X similar events" footer

**Pre-populate these nudges:**

```
💡 STAFFING SUGGESTION
"For Mazda ride & drives with 5,000 attendees, you typically staff 2 In-Vehicle Hosts per 500 attendees. Your current plan has 8 — consider scaling to 10."
Based on 14 similar Mazda events

⚠️ COST ALERT
"LA logistics costs have come in 20% over budget on the last 6 LA-based ride & drive events. Consider adding a 15-20% buffer to your logistics line items."
Based on 6 LA ride & drive events

✅ VALIDATION
"Insurance line item detected. ✓ 94% of ride & drive events in this revenue range include General Liability + Auto coverage."
Validated against 342 ride & drive events

📊 MARGIN INSIGHT
"Your current blended GP is 20.5%. The average for Mazda events in this revenue range is 28.3%. Labor margins look healthy — check production and travel markups."
Based on 23 Mazda events ($75K-$150K range)

💡 MISSING ITEM CHECK
"You haven't included a Vehicle Detailing line item. 87% of ride & drive events include detailing services ($150-$300/vehicle/day)."
Based on 342 ride & drive events
```

#### Conversational Input (bottom of right panel)
A text input area at the bottom of the panel with placeholder text:
*"Ask about this estimate or describe what you need..."*

With a Send button. This is where the user could type something like "What should I budget for a 4-day ride and drive in LA?" — connecting to the AI Scoping Assistant concept.

**This input does NOT need to be functional.** It's a concept mockup. If you want to make it functional and connect it to the Claude API (like the existing AI Scoping page does), that's a bonus but not required.

---

## PAGE 2: RATE CARD MANAGEMENT

**Nav label:** Rate Card Management
**Icon:** lucide DollarSign or CreditCard

This shows how rate cards will be managed in the production system. Tatiana specifically flagged this as "very important."

### Layout

#### Header Section
- Title: "Rate Card Management"
- Subtitle: "Manage DriveShop standard rates and client-specific pricing"

#### Client Selector (top)
A Select/dropdown: **DriveShop Standard** | Mazda MSA | Genesis MSA | Volvo MSA | Audi MSA

Default to "DriveShop Standard" — this shows the base rate card.

When switching to a client MSA, the table should show client-specific rates alongside DriveShop costs (demonstrating the revenue vs cost mapping Tatiana described).

#### Rate Card Table
Use a shadcn DataTable. Make it look editable (inputs in cells, not just text).

Columns:

| Role | GL Code | Day Type | Client Rate | DriveShop Cost | Margin | Margin % | Status |
|------|---------|----------|-------------|----------------|--------|----------|--------|

Pre-populate with the actual extracted roles:

```
Program Director       | 4000.26 | 10-hr day | $750  | $450  | $300 | 40% | Active ✓
Event/Vehicle Manager  | 4000.17 | 10-hr day | $500  | $300  | $200 | 40% | Active ✓
Product Specialist     | 4000.16 | 10-hr day | $425  | $255  | $170 | 40% | Active ✓
In-Vehicle Host        | 4000.21 | 10-hr day | $375  | $225  | $150 | 40% | Active ✓
Event/Vehicle Handler  | 4000.31 | 10-hr day | $330  | $200  | $130 | 39% | Active ✓
Registration Host      | 4000.19 | 10-hr day | $300  | $180  | $120 | 40% | Active ✓
Professional Chauffeur | 4000.32 | Hourly    | $100  | $65   | $35  | 35% | Active ✓
Per Diem               | 4075.07 | Per Day   | $50   | $50   | $0   | 0%  | Active ✓
Lead Chauffeur         | 4000.33 | Hourly    | $115  | $75   | $40  | 35% | Active ✓
Vehicle Detailer       | 4000.35 | 10-hr day | $280  | $170  | $110 | 39% | Active ✓
```

#### Table Features:
- Sort by any column
- Search/filter by role name
- Each cell in Client Rate and DriveShop Cost should look like an editable input
- GL Code field should look editable
- "➕ Add New Rate" button above the table
- Row-level actions: Edit, Deactivate (not delete — rates should be deactivated, not removed)
- Day Type column shows a Select dropdown (8-hr day / 10-hr day / Hourly / Per Day)

#### Summary Stats (above or beside the table)
Small stat cards:
- Total Active Roles: 55
- Average Margin: 38.2%
- Last Updated: Feb 10, 2025

#### Permissions Note (bottom)
A subtle info banner:
"Rate card changes require AM-level approval. All changes are version-tracked with full audit history."

This plants the seed for the approval workflow concept.

---

## CRITICAL DESIGN NOTES

1. **These are CONCEPT MOCKUPS, not functional systems.** Nothing needs to save to a database. All data is hardcoded/pre-populated. The goal is to show the vision.

2. **Add a subtle banner at the top of each UI Concept page:**
   "📐 UI Concept — This is an interactive mockup of the production system. Layout and features will be refined based on team feedback."
   Use a shadcn Alert component with a blue/info style. Make it dismissible.

3. **Use real DriveShop data.** The role names, GL codes, rate ranges, client names — all come from the actual extracted historical data. This makes it feel real and credible.

4. **The Estimate Builder page is the HERO.** If time is tight, build this one first and build it well. The Rate Card page is secondary but still important.

5. **The AI nudge panel on the right is what differentiates this from a spreadsheet.** Make the nudge cards visually distinct and easy to read. This is the "Turbo Tax" concept that Derek got excited about.

---

## BUILD PRIORITY

1. **Estimate Builder** (this is the meeting centerpiece)
2. **Rate Card Management** (important but simpler)

If time runs short, the Estimate Builder alone will carry the meeting.
