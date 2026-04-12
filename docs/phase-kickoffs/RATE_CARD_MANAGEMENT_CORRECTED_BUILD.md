# CORRECTED BUILD: Rate Card Management UI Concept

## WHAT'S WRONG WITH THE CURRENT VERSION

The current Rate Card Management page shows a single flat table of roles with editable fields. That's just a role editor — it misses the entire point of Rate Card Management at DriveShop.

**The rate card system is multi-layered:**

1. **DriveShop Standard Rate Card** — the baseline roles with standard costs and standard billing rates
2. **Client-Specific Rate Cards (per OEM/MSA)** — each client (Mazda, Volvo, Genesis, Audi, Volkswagen, Lucid, etc.) has their own MSA with different nomenclature, different billing rates, and sometimes different roles entirely
3. **Custom/Ad-Hoc Rates** — roles that aren't on any rate card but get added for a specific event (emcees, celebrity talent, promotional models, go-go dancers). These should optionally persist to the client's rate card for future use.
4. **Pass-Through Cost Markup** — some clients have a standard markup on pass-through costs (e.g., 1.5%) that's defined at the client rate card level

**The key insight from stakeholder conversations:**
- Tatiana said: "Once we introduce a new rate to a client, we should be consistent for future estimates. If we introduce a new road manager for Volkswagen at $500, that rate should persist to the rate card."
- Derek said: "The rate card is the source of truth. But people need to be able to override on a per-estimate basis."
- Tatiana showed tabs per client in her spreadsheet — each tab IS a different rate card with different rates from that client's MSA.

---

## REBUILD THIS PAGE COMPLETELY

Delete the current flat table. Replace with the following layout:

### TOP SECTION: Client Rate Card Selector

**This is the most important change.** Instead of a simple dropdown, show this as a proper card-based selector or prominent tabs:

```
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ 🏢 DriveShop │ │ 🚗 Mazda │ │ 🚙 Volvo │ │ 🚘 Genesis│ │ 🚗 Audi  │ │ 🚗 VW    │ │ + Add Client  │
│   Standard   │ │   MSA    │ │   MSA    │ │   MSA    │ │   MSA    │ │   MSA    │ │               │
│  (Default)   │ │          │ │          │ │          │ │          │ │          │ │               │
└──────────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘
```

Each card shows:
- Client name/logo placeholder
- "MSA" badge (or "Standard" for DriveShop default)
- Number of rates defined (e.g., "16 rates")
- Pass-through markup % (e.g., "1.5% markup")

**DriveShop Standard is selected by default** and highlighted.

---

### WHEN "DRIVESHOP STANDARD" IS SELECTED

Show the standard rate card — these are DriveShop's internal baseline rates:

**Summary Stats Row:**
- Total Roles: 55
- Standard Roles: 16 (from typical MSA)
- Extended Roles: 39 (added over time)

**Table Columns:**

| Role | GL Code | Day Type | Standard Billing Rate | Standard Cost | Standard Margin | Margin % | Category | Status |
|------|---------|----------|----------------------|---------------|-----------------|----------|----------|--------|

**Category column** groups roles into the estimate sections:
- Planning & Administration
- Onsite Event Labor
- Logistics
- Production

Pre-populate with the actual extracted roles, organized by category:

**Planning & Administration:**
```
Program Director       | 4000.26 | 10-hr day | $750  | $450 | $300 | 40% | P&A    | Active ✓
Event/Vehicle Manager  | 4000.17 | 10-hr day | $500  | $300 | $200 | 40% | P&A    | Active ✓
```

**Onsite Event Labor:**
```
Product Specialist     | 4000.16 | 10-hr day | $425  | $255 | $170 | 40% | Labor  | Active ✓
In-Vehicle Host        | 4000.21 | 10-hr day | $375  | $225 | $150 | 40% | Labor  | Active ✓
Event/Vehicle Handler  | 4000.31 | 10-hr day | $330  | $200 | $130 | 39% | Labor  | Active ✓
Registration Host      | 4000.19 | 10-hr day | $300  | $180 | $120 | 40% | Labor  | Active ✓
Professional Chauffeur | 4000.32 | Hourly    | $100  | $65  | $35  | 35% | Labor  | Active ✓
Lead Chauffeur         | 4000.33 | Hourly    | $115  | $75  | $40  | 35% | Labor  | Active ✓
Promotional Model      | 4000.40 | 10-hr day | $350  | $210 | $140 | 40% | Labor  | Active ✓
Vehicle Detailer       | 4000.35 | 10-hr day | $280  | $170 | $110 | 39% | Labor  | Active ✓
Per Diem               | 4075.07 | Per Day   | $50   | $50  | $0   | 0%  | Labor  | Active ✓
```

Add grouping headers or a category filter/sort so roles are visually organized by section.

---

### WHEN A CLIENT MSA IS SELECTED (e.g., "Mazda MSA")

**THIS IS THE KEY DIFFERENCE.** The table now shows a comparison view — the client's MSA rates mapped against the DriveShop standard:

**Client Header Card:**
```
Client: Mazda
MSA Effective Date: Jan 1, 2024
Pass-Through Markup: 1.5%
Agency Fee: 15%
Rates Defined: 16
Custom Rates Added: 3
Last Updated: Jan 15, 2025
```

**Table Columns (Client View):**

| Role (Client Nomenclature) | DriveShop Standard Role | GL Code | Day Type | Client Billing Rate | DriveShop Cost | Margin | Margin % | Source |
|-----------------------------|------------------------|---------|----------|--------------------|--------------------|--------|----------|--------|

The **Role (Client Nomenclature)** column shows what the CLIENT calls this role (which may differ from DriveShop's internal name). The **DriveShop Standard Role** column shows the mapping.

Pre-populate Mazda example:

```
Event Director         → Program Director       | 4000.26 | 10-hr day | $750  | $450 | $300 | 40% | MSA ✓
Event Manager          → Event/Vehicle Manager   | 4000.17 | 10-hr day | $500  | $300 | $200 | 40% | MSA ✓
Brand Ambassador       → Product Specialist      | 4000.16 | 10-hr day | $450  | $255 | $195 | 43% | MSA ✓
Drive Host             → In-Vehicle Host         | 4000.21 | 10-hr day | $375  | $225 | $150 | 40% | MSA ✓
Registration Staff     → Registration Host       | 4000.19 | 10-hr day | $300  | $180 | $120 | 40% | MSA ✓
Professional Driver    → Professional Chauffeur  | 4000.32 | Hourly    | $100  | $65  | $35  | 35% | MSA ✓
Vehicle Handler        → Event/Vehicle Handler   | 4000.31 | 10-hr day | $330  | $200 | $130 | 39% | MSA ✓
Road Manager           → (Custom)                | 4000.45 | 10-hr day | $500  | $300 | $200 | 40% | Custom ⚡
Promotional Model      → Promotional Model       | 4000.40 | 10-hr day | $375  | $210 | $165 | 44% | Custom ⚡
```

**Source column** badges:
- **MSA ✓** (green) — rate comes from the client's Master Service Agreement
- **Custom ⚡** (blue) — rate was added for this client and persisted to their rate card
- **Override ⚠️** (yellow) — rate was overridden from the standard for this client

**"+ Add Rate to Client Card"** button — demonstrates the ability to add a new role that persists for future estimates with this client.

---

### BOTTOM SECTION: Rate Card Settings (per client)

When viewing a client MSA, show a settings card below the table:

```
┌─────────────────────────────────────────────────────────┐
│ Rate Card Settings — Mazda MSA                          │
│                                                         │
│ Pass-Through Cost Markup:  [ 1.5% ]                     │
│ Agency Fee:                [ 15%  ]                     │
│ Default Day Type:          [ 10-hr day ▼ ]              │
│ Cost Structure:            [ Corporate ▼ ]              │
│                            (Corporate / Office)         │
│                                                         │
│ Rate Card Owner:           [ Account Manager ▼ ]        │
│ Last MSA Review:           Jan 15, 2025                 │
│                                                         │
│ ⓘ Rate card changes require AM-level approval.          │
│   All changes are version-tracked with full audit trail. │
└─────────────────────────────────────────────────────────┘
```

The **Cost Structure toggle** (Corporate / Office) is important — it demonstrates the concept that the same client can have different cost calculations depending on whether it's a corporate event or an office event. When toggled, the DriveShop Cost column in the table above would recalculate. This was a key point from the kickoff meeting.

---

### FEATURES TO SHOW (visually, not functionally)

1. **Search/filter** by role name across the table
2. **Sort** by any column
3. **Category grouping** — filter or group by P&A, Labor, Logistics, Production
4. **Inline editing indicators** — cells that look editable (input borders) but with a lock icon on MSA-sourced rates (implying those can't be casually changed)
5. **"+ Add Rate"** button — for adding custom roles
6. **Audit badge** — small "Last modified by Tatiana Z. on Jan 15, 2025" at the bottom

---

## CRITICAL DESIGN NOTES

1. **The client tab selector at the top is THE feature.** This is what makes it a Rate Card Management *Engine*, not just a rate editor. Each client has their own rate card. That's the whole point.

2. **Show the nomenclature mapping.** "Brand Ambassador" (what Mazda calls it) maps to "Product Specialist" (what DriveShop calls it internally). This is what Tatiana described — different clients use different names for the same roles.

3. **The "Custom ⚡" badge tells a story.** When Dan or Tim sees that, they'll immediately think "oh, so when I add a new role for a specific event, it actually gets saved for next time." That's the persistence feature Tatiana asked for.

4. **Corporate vs. Office cost structure** — this was a major point from Derek in the kickoff. The toggle in the settings card demonstrates this without overcomplicating the table.

5. **Keep the info banner at the top:**
   "📐 UI Concept — This is an interactive mockup of the production rate card system. Rate data shown is illustrative. Production rates will be imported from actual client MSAs."

6. **This page should feel like managing rate cards in a SaaS product** — think Stripe's pricing configuration or HubSpot's product catalog. Professional, clean, with clear hierarchy between clients.

---

## WHAT TO DELETE

Remove the current single-table rate card page entirely. It's misleading. Replace it with this multi-layered version.
