# Pulse AI — Current Feature Inventory

**Evidence basis:** user-supplied product photos dated April 26, 2026  
**Scope:** features visible in those photos; not a claim about private capabilities that cannot be inferred from the UI  
**Prototype:** `pulse_planner_prototype.jsx`

## 1. Navigation and account shell

- Persistent Pulse AI sidebar and brand area.
- Primary navigation: Assortment Overview, Store/Category Health, SKU List, and How It Works.
- Signed-in user identity and sign-out affordance.
- Collapsible navigation rail.

## 2. Assortment Overview

The overview monitors assortment health across the selected network scope.

- Filter by Distribution Center, Site Type, Stores, Category, and Health Score Range.
- Clear all filters and apply the current selection.
- Network health-score card with score band, 0–100 value, and percent not aligned.
- Threshold legend: Excellent 71–100, At Risk 51–70, Critical 0–50.
- Summary metrics: Total Stores, Total SKUs, and Inventory Value.
- Worst-performing store list with store, health band, percent not aligned, SKU count, and score.
- Worst-performing category list with store coverage, percent not aligned, and score.
- “Get SKUs list” call to action based on the active filters.
- Pagination and “See all” links for store/category lists.

## 3. Store and Category Health

- Toggle between Store Health and Category Health.
- Multi-store scope selector.
- Filter by All, Excellent, At Risk, or Critical.
- Sort by worst health first and clear filters.
- Summary metrics for total stores, total SKUs, average health score, and stores needing action.
- Store ranking list with current SKU count, not-aligned count, category-band distribution, and score.
- Drill into an individual store.

## 4. Store Detail

- Breadcrumb navigation from overview to store.
- Store-level assortment health score and not-aligned percentage.
- Total, aligned, and not-aligned SKU metrics.
- Category-health distribution across Excellent, At Risk, and Critical.
- Category list sorted by worst health.
- Category-band filters, sort control, page-size control, and row drill-down.
- Export SKUs or create a scoped SKU list.

## 5. Category Hierarchy Drill-down

The visible hierarchy is Store → L1 → L2 → L3 → L4.

- Each hierarchy screen shows health score, current assortment, aligned SKUs, and not-aligned SKUs.
- Health-by-subcategory horizontal bar chart.
- Ranked child-category list with current and not-aligned counts.
- Sort score from low to high.
- Continue drilling until the L4 brand/category leaf.
- Export or create a SKU list from any visible scope.

The supplied example path is:

`ATL-466 → Body & Accessories L1-2 → Interior L2-10 → Hardware & Components L3-2 → BK-Balkamp / XTL L4`

## 6. SKU List and Recommendations

- System-recommended SKU count and explanatory banner.
- Scope chips for Store, Category, Brand, and Action.
- Clear the current selection.
- Search the recommendation table.
- Sortable columns for rank, part number, description, field abbreviation, store, L1–L4, and status.
- Visible action/status such as Order.
- Export selected recommendations to CSV for ordering, returns, or keeping inventory.
- Sticky export summary showing SKU count and output fields.

## 7. Health and alignment terminology

- **Health score:** 0–100 measure shown at network, store, and category levels.
- **Excellent:** 71–100.
- **At Risk:** 51–70.
- **Critical:** 0–50.
- **Aligned SKU:** an item counted as aligned with the recommended assortment.
- **Not Aligned SKU:** an item presented as needing action.
- **Current assortment:** SKUs currently in stock for the selected scope.

The photos do not expose the production formula for health scoring or the recommendation model. The prototype therefore reproduces the visible presentation and interactions without asserting an undocumented calculation.

## 8. Prototype-only extension: Scenario Planner

The repository also contains a proposed planner not shown as a current feature in the supplied photos. It is intentionally labeled as a prototype extension.

- Space-allocation scenarios across L1–L4.
- Budget-constrained scenarios using DC cost.
- Preview of health, cash, and SKU-action impact.
- Session-level scenario saving.
- CSV result export.
- No mutation of canonical Pulse recommendations.

See `pulse_planner_logic_spec.md` for the proposed compute and persistence design.

## 9. Known boundaries

The following cannot be confirmed from photographs alone: production authentication and authorization, exact formulas, live data sources, export variants, backend side effects, audit history, accessibility conformance, or error and empty states. The prototype uses mock data and browser-local interaction only.
