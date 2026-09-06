# Pulse AI Scenario Planner — Logic and Engineering Spec

**Audience:** dev leads, data engineers
**Purpose:** define what computation happens where, what gets precomputed nightly vs computed on the fly, and the algorithmic rules for space- and budget-mode scenarios — including how we preserve category diversification under a budget constraint.
**Status:** v1 spec, ready to scope. Open questions called out in section 10.
**Companion:** `pulse_ai_documentation.md` (current state). This doc adds the planner-specific compute layer on top of the existing pipeline.

---

## 1. Goals and constraints

**Goals**

- Modeler can run what-if scenarios on space allocation or DC-cost budget, see live implications (health-score delta, cash, SKU action changes), and export the resulting SKU list.
- Live preview latency: under 2s for a single store, under 5s for scope spanning multiple stores.
- The pipeline behind the planner is the same Stage 1 → Stage 2 → Stage 3 documented in the canonical doc. We modify Stage 2 inputs (caps, budgets) and recompute Stages 2 and 3 only.

**Hard constraints**

- `BEST_IN_RANKING` (Stage 1) is sacred and shared. Scenarios never recompute it. It updates on its own daily cadence.
- Canonical recommendations are never overwritten by scenario output. Scenario data lives in separate tables and is only released to the modeler via export.
- Scenario state is per-user, savable, not promotable. There is no path to "make this scenario the canonical recommendation."

---

## 2. Architecture overview

Three layers, three roles:

```
┌─────────────────────────────────────────────────────────────────┐
│ Google BigQuery (GBQ)                                           │
│ Source of truth · heavy nightly batch                           │
│                                                                  │
│ - Raw signal tables (VIO, SITE_PRODUCT, SEARCH_DATA, etc.)     │
│ - Stage 1 BEST_IN_RANKING build                                │
│ - Stage 2 canonical ASSORTMENT_RECOMMENDATION                   │
│ - Stage 3 canonical HEALTH_SCORES                               │
│ - NEW: nightly computed HIERARCHY_VOLUME, DC_COST_BY_SKU_STORE  │
└────────────────────────────┬────────────────────────────────────┘
                             │ daily sync of slim views
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ AlloyDB                                                          │
│ Operational store · sub-second queries                          │
│                                                                  │
│ - BEST_IN_RANKING (synced view, read-only)                      │
│ - CURRENT_INVENTORY (synced view, read-only)                    │
│ - HIERARCHY_VOLUME (synced view, read-only)                     │
│ - DC_COST_BY_SKU_STORE (synced view, read-only)                 │
│ - ASSORTMENT_RECOMMENDATION canonical (synced)                  │
│ - HEALTH_SCORES canonical (synced)                              │
│ - NEW: SCENARIOS, SCENARIO_RESULTS_CACHE (writable)             │
└────────────────────────────┬────────────────────────────────────┘
                             │ read on edit; write on save
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Web app + scenario engine                                        │
│                                                                  │
│ - UI (React)                                                     │
│ - Scenario engine: in-process or sidecar service that recomputes│
│   Stage 2 + Stage 3 against modified inputs                     │
│ - Holds working scenario state, debounces edits, calls AlloyDB  │
└─────────────────────────────────────────────────────────────────┘
```

The principle: **GBQ does heavy and infrequent work, AlloyDB serves operational reads, the app does live recompute on a per-user working set.**

---

## 3. Data layers — what lives where

### 3.1 Already in AlloyDB

These tables exist today and need no changes.

| Table | Source | Used for |
|---|---|---|
| `BEST_IN_RANKING` | GBQ daily sync | Stage 1 ranks; the planner reads this and never modifies it |
| `CURRENT_INVENTORY` | GBQ daily sync | what's actually on the shelf right now per store |
| `ASSORTMENT_RECOMMENDATION` (canonical) | GBQ daily sync | reference state for the "before" side of every delta |
| `HEALTH_SCORES` (canonical) | GBQ daily sync | reference state for the "before" health score |

### 3.2 New tables to add (precomputed in GBQ, synced nightly to AlloyDB)

| Table | Grain | Purpose |
|---|---|---|
| `HIERARCHY_VOLUME` | (MACS_ID, L1, L2, L3, L4) | per-leaf cubic-inch totals + SKU counts. Used to compute proportional allocations and HIER_CAP_L4 under modified mixes without scanning SITE_PRODUCT every time. |
| `DC_COST_BY_SKU_STORE` | (MACS_ID, PART_ID) | DC cost per SKU per store. Today this lives in GBQ but isn't in AlloyDB; budget mode requires it. |

Schema sketches:

```sql
CREATE TABLE HIERARCHY_VOLUME (
    macs_id        BIGINT,
    l1_id          INTEGER,
    l2_id          INTEGER,
    l3_id          INTEGER,
    l4_id          INTEGER,
    sku_count      INTEGER,
    total_volume   NUMERIC(14, 2),  -- cubic inches
    total_dc_cost  NUMERIC(14, 2),  -- denormalized for fast lookups
    snapshot_date  DATE,
    PRIMARY KEY (macs_id, l1_id, l2_id, l3_id, l4_id, snapshot_date)
);

CREATE TABLE DC_COST_BY_SKU_STORE (
    macs_id        BIGINT,
    part_id        BIGINT,
    dc_cost        NUMERIC(10, 2),
    snapshot_date  DATE,
    PRIMARY KEY (macs_id, part_id, snapshot_date)
);
```

Sizing rough cut: 195 stores × ~3,200 active L4-leaf rows per store ≈ 624K rows in `HIERARCHY_VOLUME`. With daily snapshots and a 30-day retention window, ~19M rows. Trivial for AlloyDB.

`DC_COST_BY_SKU_STORE` is heavier: 195 stores × ~17K SKUs ≈ 3.3M rows per snapshot. Retention should be tighter — 7 days unless audit needs more.

### 3.3 New tables to add (writable, app-managed)

| Table | Grain | Purpose |
|---|---|---|
| `SCENARIOS` | (SCENARIO_ID) | scenario state, owned by user, savable |
| `SCENARIO_RESULTS_CACHE` | (SCENARIO_ID, INPUT_HASH) | cached result of a recompute, keyed by input hash so identical edits return instantly |

```sql
CREATE TABLE SCENARIOS (
    scenario_id    UUID PRIMARY KEY,
    user_id        VARCHAR(64),
    name           VARCHAR(200),
    mode           VARCHAR(16),         -- 'space' | 'budget'
    scope          JSONB,               -- {macs_ids: [...], hierarchy_filters: {...}}
    allocations    JSONB,               -- per-level percentages and locks (space mode)
    budget         NUMERIC(12, 2),      -- DC cost (budget mode)
    distribution   VARCHAR(32),         -- 'proportional' | 'greedy_within_scope'
    created_at     TIMESTAMPTZ,
    modified_at    TIMESTAMPTZ,
    last_run_at    TIMESTAMPTZ
);

CREATE TABLE SCENARIO_RESULTS_CACHE (
    scenario_id    UUID,
    input_hash     CHAR(64),            -- SHA256 of allocations + budget + scope
    result         JSONB,               -- summary: health_delta, cash, sku_action_counts
    sku_list       JSONB,               -- ranked SKU output (paginated on read)
    computed_at    TIMESTAMPTZ,
    PRIMARY KEY (scenario_id, input_hash)
);
```

The `input_hash` keys cached results, so reverting an edit returns the prior cached result with no recompute.

---

## 4. Precomputed (nightly batch, in GBQ)

| Computation | Frequency | Cost | Why precomputed |
|---|---|---|---|
| `BEST_IN_RANKING` Stage 1 | daily | high | already happens; expensive scoring of 6 raw signals × every SKU × every store |
| `HIERARCHY_VOLUME` rollup | daily | low | enables fast proportional-allocation math without scanning SITE_PRODUCT live |
| `DC_COST_BY_SKU_STORE` snapshot | daily | low | budget mode needs this readily available |
| Canonical `ASSORTMENT_RECOMMENDATION` (Stage 2) | daily | medium | unchanged from today |
| Canonical `HEALTH_SCORES` (Stage 3) | daily | low | unchanged from today |

`HIERARCHY_VOLUME` is the key new precomputation. Without it, every scenario edit would have to scan SITE_PRODUCT to compute the parent-level volumes. Precomputing once a night makes Stage 2 recompute fast.

---

## 5. Computed on demand (per scenario edit)

When a modeler moves a slider or changes a budget, the scenario engine runs the following sequence against AlloyDB:

```
INPUT:  scenario state (mode, scope, allocations or budget)
OUTPUT: modified ASSORTMENT_RECOMMENDATION + HEALTH_SCORES for the scope
```

### 5.1 Recompute pipeline

```
1. Read BEST_IN_RANKING for SKUs in scope         (read-only, cached)
2. Read HIERARCHY_VOLUME for stores in scope      (read-only, cached)
3. Read CURRENT_INVENTORY for stores in scope     (read-only, cached)
4. (Budget mode only) Read DC_COST_BY_SKU_STORE   (read-only, cached)
5. Compute new HIER_CAP_L4 per leaf using
   modified allocation + HIERARCHY_VOLUME totals
6. Greedy-fill SKUs into each L4 from BEST_IN_RANKING
   bounded by HIER_CAP_L4 (space mode) OR
   bounded by per-leaf $ budget (budget mode)
7. Compare result vs CURRENT_INVENTORY → derive
   INVENTORY_ACTION per SKU (ALIGNED_KEEP /
   NOT_ALIGNED_RETURN / TO_ORDER)
8. Aggregate counts at L4 → L3 → L2 → L1 → Store
   to recompute health scores at every level
9. Compute deltas vs canonical ASSORTMENT_RECOMMENDATION
10. Write to SCENARIO_RESULTS_CACHE keyed by input_hash
11. Return summary + SKU list to UI
```

Steps 1–4 are reads against AlloyDB views. Steps 5–8 are pure compute, stateless, parallelizable per store. The whole thing should run in 500ms to 2s for a single store on warm cache.

### 5.2 What never recomputes

`BEST_IN_RANKING` is **never** touched by the scenario engine. The four pillars (Demand Fit, Velocity, Service Level, Space Efficiency) and the resulting FINAL_SCORE / CATEGORY4_RANK / SITE_RANK are all upstream of the planner. A scenario only changes which SKUs make the cut at Stage 2 — it never changes how SKUs are ranked.

This is the load-bearing invariant. If we ever let scenarios influence Stage 1, we lose auditability and the planner becomes an unbounded optimization problem.

---

## 6. Space allocation logic

### 6.1 Edit model — independent edits, floating total

The hierarchy is L1 → L2 → L3 → L4. The default editing model is **independent edits**: changing one slider changes only that node. Sibling totals are not enforced to sum to 100%.

This is a deliberate departure from earlier drafts of this spec. The earlier model auto-rebalanced siblings on every edit to preserve a 100% total. That model assumed the underlying physical capacity (cubic inches) was fixed and that every edit is a redistribution within it. In practice, modelers also need to express:

- **Capacity expansion.** "Body & accessories deserves more shelf than the system thinks; we have flex on the floor." Sibling sum > 100%.
- **Capacity reduction.** "We're shrinking Tools by 4% and the freed shelf is going to overflow / endcaps / nothing planned." Sibling sum < 100%.
- **Pure intent edits.** "Raise Engine by 1.5%; I have no opinion on which other category gives up shelf, and I don't want the system to invent one for me."

Forcing every edit to be a redistribution erases these intents. Worse, it forces the system to invent an allocation answer on the modeler's behalf — taking shelf from categories the modeler had no opinion about, in proportions the modeler did not approve. Independent edits keep the modeler's intent intact and surface implied capacity changes as first-class output rather than hiding them in invisible sibling adjustments.

**Edit semantics:**

- Editing at level N updates **only** that node. Siblings at level N do not change.
- The sum of siblings is allowed to float. The UI surfaces the float as informational text:
  - sum > 100%: `Implied capacity: +X% (~+Y in³)`
  - sum < 100%: `Unallocated: X% (~Y in³)`
  - sum = 100% (within tolerance): no annotation
- **Cascade DOWN is preserved.** When you edit at level N, descendants at N+1, N+2, ... that the modeler hasn't touched rescale within the new envelope to preserve their existing proportions. This is what makes "drag the L1 slider once, leave the details alone" produce a coherent result — descendants' share-of-parent is unchanged, only their absolute cubic inches resolve to a new number.
- Editing at level N never touches ancestors. An L3 edit inside Interior L2 leaves Body L1 unchanged.
- **Locks** restrict editing of a single row (read-only protection). They no longer drive math, since there is no auto-rebalance to insulate from. They remain useful UX: prevent accidental changes to known-good values.

**Auto-rebalance is available as an opt-in toggle.** When the modeler enables it, behavior reverts to the redistribute-within-fixed-total model: sibling shares scale to keep the sum at 100%. This is useful for the rare "the floor is full and I want to express which category gives up shelf to the one I'm growing" case. It is off by default.

### 6.2 Pseudocode: editing in independent mode (default)

```
function edit_node(level, node_id, new_share_of_parent):
    node.share_of_parent = new_share_of_parent
    node.is_user_edit = true

    # Cascade DOWN: descendants the modeler hasn't directly edited
    # keep their existing share-of-parent. Only their resolved
    # absolute cubic inches change.
    #
    # This is implicit if shares are stored as share-of-parent
    # rather than share-of-store — no rewrite needed.

    # Siblings, ancestors, and other subtrees: untouched.
    return new_allocation_state
```

The recursion is trivial because each level's value is `share_of_parent`, not `share_of_store`. Changing the L1 envelope does not require rewriting child shares — their share-of-parent stays the same; only their absolute cubic inches change at evaluation time. **Implementations should store shares as `share_of_parent` for this reason.**

The same function works at every level — L1, L2, L3, L4 — operating on the appropriate parent's children.

### 6.3 Pseudocode: editing in auto-rebalance mode (opt-in)

```
function edit_node_with_auto_rebalance(level, node_id, new_share):
    parent = node.parent
    current_siblings = unlocked siblings of node_id under parent
    locked_share = sum(s.share for s in locked siblings)
    target_total = 100  # per the auto-rebalance contract

    unlocked_others_target = target_total - new_share - locked_share
    unlocked_others_actual = sum(s.share for s in current_siblings)

    if unlocked_others_actual <= 0:
        clamp new_share so unlocked_others_target >= 0
        unlocked_others_target = max(0, unlocked_others_target)

    scale = unlocked_others_target / unlocked_others_actual
    for each unlocked sibling:
        sibling.share *= scale

    node.share_of_parent = new_share
    node.is_user_edit = true

    # Cascade DOWN as in independent mode
    return new_allocation_state
```

**Note on the scale denominator.** The denominator is the *actual current sum* of unlocked siblings, not `100 - old_share - locked_share`. If the modeler turns on auto-rebalance after independent edits have driven sum != 100%, the formula must converge correctly. Using actual sums means the first edit after enabling auto-rebalance pulls sibling-total back toward 100%; from that point, subsequent edits maintain it.

### 6.4 Computing HIER_CAP_L4 under modified allocations

The canonical formula is:

```
HIER_CAP_L4 = (L4_volume / total_store_volume) × STORE_CAPACITY × 1.01
```

Under the planner's modified allocations, the formula generalizes as a product of share-of-parent at each level:

```
HIER_CAP_L4_scenario = l1_share × l2_share_of_l1 × l3_share_of_l2 × l4_share_of_l3
                       × STORE_CAPACITY × 1.01
```

(All shares as decimals. STORE_CAPACITY is the cubic-inch sum of currently-stocked SKUs, unchanged.)

When sibling totals at every level happen to sum to exactly 100%, this collapses to the canonical formula. The model is backward-compatible: a scenario where the modeler stays at 100% at every level produces the same HIER_CAP_L4 as canonical.

When sibling totals deviate from 100%, the resolved cubic inches deviate from STORE_CAPACITY in proportion. The store's effective volume becomes:

```
effective_store_volume = STORE_CAPACITY × (sum_of_l1_shares / 100)
```

Operationally:
- `effective_store_volume > STORE_CAPACITY` (sum of L1 > 100%): the scenario implies capacity expansion. Output flagged in the export. Greedy fill at L4 admits more SKUs than canonical would.
- `effective_store_volume < STORE_CAPACITY` (sum of L1 < 100%): scenario implies reduction. Greedy fill admits fewer SKUs.
- The 1.01 overflow buffer is preserved at the leaf level in both cases.

The same logic applies at sub-trees: if L3 children of Interior L2 sum to 110%, Interior L2's effective cubic-inch envelope is 110% of what its L1-share-times-L2-share would otherwise give. Body L1 is unchanged.

**Output flagging.** Scenarios where any sibling group sums to != 100% must record the implied capacity in scenario metadata and surface it on the output review screen. Modelers acting on the export are responsible for confirming physical feasibility before placing orders.

### 6.5 Greedy fill — same as canonical

Once new caps are computed, the greedy fill from Stage 2 runs identically:

```sql
CUM_VOL_L4 = SUM(PRODUCT_VOLUME) OVER (
    PARTITION BY MACS_ID, L1, L2, L3, L4
    ORDER BY SITE_RANK
    ROWS UNBOUNDED PRECEDING
)
WHERE CUM_VOL_L4 <= HIER_CAP_L4_scenario
```

`SITE_RANK` and `BEST_IN_RANKING` are read from canonical tables. Nothing about ranking changes.

### 6.6 Directional effects on action counts

The cap math in 6.4 has a clean implication worth stating explicitly, because the impact-summary UI depends on it: **edits at a node move action counts in one direction per subtree, never both.** Growth produces orders, never returns. Shrink produces returns, never orders.

**Growth at node N (Δshare > 0):**

- `HIER_CAP_L4` grows for every leaf in N's subtree (chain product is multiplied by the growth factor).
- Greedy fill admits more SKUs in those subtrees → `TO_ORDER` count goes up.
- Existing SKUs in N's subtree that were previously just over the cap may now fit → those flip `NOT_ALIGNED_RETURN → ALIGNED_KEEP`, *reducing* the return count slightly.
- **Net effect within the subtree: TO_ORDER goes up; NOT_ALIGNED_RETURN goes down or stays flat. Growth never produces new returns.**
- Untouched sibling subtrees: caps unchanged → action counts unchanged.

**Shrink at node N (Δshare < 0):**

- `HIER_CAP_L4` shrinks for every leaf in N's subtree.
- Existing SKUs that no longer fit under the smaller cap flip `ALIGNED_KEEP → NOT_ALIGNED_RETURN` → return count goes up.
- New `TO_ORDER` admittance for the subtree drops to roughly zero — there is no room to admit candidates.
- **Net effect within the subtree: NOT_ALIGNED_RETURN goes up; TO_ORDER stays flat or goes down. Shrink never produces new orders.**
- Untouched sibling subtrees: caps unchanged → action counts unchanged.

**Mixed edits across a tree:** effects sum linearly per subtree. A modeler who grows Body L1 by +2pp and shrinks Tools L1 by −1pp gets new orders under Body, new returns under Tools, and zero change anywhere else.

**Why this matters for Independent mode.** Auto-rebalance creates implicit opposing-sign edits in sibling nodes — growing one node forces siblings to shrink, which generates returns there. That bidirectional bleed is the load-bearing reason Independent is the default. Independent mode maps modeler intent cleanly to action set:

- *"I want more Body"* → orders under Body, nothing else.
- *"I want less Tools"* → returns under Tools, nothing else.
- *"Move from Tools to Body"* → grow Body and shrink Tools explicitly, get both effects with clear attribution to the edits the modeler made.

**Implementation requirement for the impact-summary panel.** The recompute pipeline in section 5.1 produces directional output naturally — Stage 2's greedy fill admits or rejects SKUs against the new caps, and Stage 3 derives action counts from the resulting set. The failure mode is in the *summary aggregation* the UI uses for live preview, where it's easy to compute action-count changes from `|Δ|` (absolute delta magnitude) rather than from signed deltas. Aggregating without sign awareness produces the misleading behavior of showing new returns from growth edits and new orders from shrink edits — neither of which the recompute pipeline actually generates.

Implementations must aggregate signed deltas, attributing positive deltas to TO_ORDER contributions and negative deltas to NOT_ALIGNED_RETURN contributions, with strict subtree scoping (sibling subtrees of an unedited ancestor contribute zero).

### 6.7 Edge cases

| Case | Behavior |
|---|---|
| Sibling sum > 100% (independent mode) | Allowed by default. Output flagged `Implied capacity: +X% (~+Y in³)`. Recorded in scenario metadata. Modeler confirms physical feasibility before acting on export. |
| Sibling sum < 100% (independent mode) | Allowed. Output flagged `X% unallocated (~Y in³)`. Useful for testing reductions or expressing planned slack. |
| Sibling sum != 100% with auto-rebalance ON | Cannot occur — auto-rebalance enforces sum = 100%. Modeler must turn auto-rebalance off to express capacity changes. |
| Modeler turns auto-rebalance ON while sibling sum != 100% | Allowed. The first slider edit after toggling on will drive sibling sum back to 100% (see scale-denominator note in 6.3). UI shows a one-time toast: "Auto-rebalance on — next edit will normalize total to 100%." |
| Modeler raises a category beyond what unlocked siblings can absorb (auto-rebalance ON) | Slider clamps at the maximum feasible value. Tooltip: "limited by lockable space — turn off auto-rebalance, or unlock more siblings." |
| Modeler locks every category | Sliders disabled regardless of mode. UI message: "All categories locked. Unlock at least one to edit." |
| Allocation goes to 0% for a category | Allowed. HIER_CAP_L4 cascades to 0 → no SKUs make the cut from descendants of that node. Existing SKUs become NOT_ALIGNED_RETURN. |
| L3 sibling sum inside Interior L2 != 100% | Allowed. Sub-tree is implicitly expanded or contracted within Interior L2's envelope. Change does not propagate up — Body L1 stays at its modeler-set value. |
| Reset | Per-level reset clears user edits at that level. Descendants rescale based on the parent's current (possibly user-edited) value. Full reset to canonical is a separate menu action. |

---

## 7. Budget allocation logic

Budget mode replaces the cubic-inch cap with a DC-cost cap, and replaces the proportional-mix-preservation model with a scope-and-distribution model.

### 7.1 Inputs

- **Scope:** the set of (store, hierarchy slice) tuples the budget applies to. Examples:
  - `{stores: [ATL-466], hierarchy: store-wide}` — single-store budget across all categories
  - `{stores: [ATL-466], hierarchy: L1=Body & accessories}` — single-store, single-L1 budget
  - `{stores: [ATL-466, ATL-191, ATL-130], hierarchy: store-wide}` — multi-store rollup
- **Budget:** total dollar amount in DC cost
- **Distribution:** how the budget gets split across the scope. Two modes:
  - `proportional` (default) — split by current cubic-inch share within scope
  - `greedy_within_scope` (advanced) — global greedy by health-score-delta-per-dollar

### 7.2 Distribution: `proportional` (default)

This is the diversification-preserving mode. The principle: **the budget mirrors the existing category mix unless the user narrows scope.**

```
INPUT:
  scope = {stores, hierarchy_filter}
  total_budget = $X

ALGORITHM:
  1. Pull HIERARCHY_VOLUME rows that match the scope
  2. Compute total in-scope volume = sum of L4 volumes
  3. For each L4 in scope:
        L4_budget = total_budget × (L4_volume / total_in_scope_volume)
  4. For each L4, run greedy fill ordered by SITE_RANK:
        select SKUs from BEST_IN_RANKING where SITE_RANK ASC
        cumulative DC cost <= L4_budget
        SKU is not already ALIGNED_KEEP (no double-spending on what's already on the shelf)
```

**Diversification guarantee:** every L4 in scope gets at least its proportional share. No L4 is starved because another category had a higher impact-per-dollar.

**What this trades off:** the resulting health-score lift is not maximal. Some L4s with low marginal impact still get budget. The user is choosing diversification over maximization.

### 7.3 Distribution: `greedy_within_scope` (advanced)

This is the maximization mode. The user opts into concentrating spend.

```
INPUT:
  scope = {stores, hierarchy_filter}
  total_budget = $X

ALGORITHM:
  1. Pull all eligible SKUs in scope (CURRENT_INVENTORY ∪ BEST_IN_RANKING)
  2. For each candidate SKU, compute marginal_health_delta_per_dollar:
        if SKU is TO_ORDER candidate:
            marginal_delta = (1 / current_inventory_count) × 100
            cost = DC_cost
            score = marginal_delta / cost
        if SKU is NOT_ALIGNED_RETURN candidate:
            marginal_delta = (current_misaligned_factor) × 100
            cost = -DC_cost  (returning frees cash)
            score = marginal_delta / abs(cost)  (returns rank by impact only)
  3. Sort candidates by score DESC
  4. Greedy select until cumulative net cost == total_budget
        net cost = sum of TO_ORDER costs - sum of RETURN credits
```

**No diversification guarantee.** A single L4 could absorb the entire budget if it has the highest impact-per-dollar SKUs.

**When to use:** the modeler explicitly wants to chase the maximum health-score lift and is willing to accept category concentration. This is more useful for narrow-scope scenarios ("$5K for Brakes only") than wide ones ("$100K store-wide").

### 7.4 Recommendation: default to proportional

For the awareness-driven modeler workflow, `proportional` matches mental model and avoids surprises. `greedy_within_scope` should be a one-click toggle the modeler opts into, with a clear UI signal that "this may concentrate spend in 1–2 categories."

### 7.5 Cash flow definitions

| Term | Meaning |
|---|---|
| **Gross deployment** | sum of DC cost of TO_ORDER SKUs selected |
| **Returns credit** | sum of DC cost of NOT_ALIGNED_RETURN SKUs (treated as cash-in to store via DC credit) |
| **Net deployment** | gross deployment − returns credit |
| **Budget interpretation** | budget = max net deployment. The modeler enters the cash they want to commit. If returns credit covers part of the gross, the budget can stretch further. |

The UI should make this clear: "Your $50K budget covers $62K gross orders if you also process $12K of returns."

### 7.6 Edge cases

| Case | Behavior |
|---|---|
| Budget < smallest L4 share's lowest-cost SKU | Some L4s get 0 SKUs in proportional mode. UI flags "X L4s under-funded." |
| Budget exceeds gross addressable in scope | All TO_ORDER candidates selected; remaining budget shown as "unallocated." |
| User picks empty scope | UI prevents — the Continue button is disabled until scope has at least one valid (store, hierarchy) pair. |
| Multiple stores in scope, allocation conflict | Each store gets its own proportional allocation independently. No cross-store rebalancing. |

---

## 8. Scenario state model

### 8.1 Lifecycle

```
[New]  →  [Editing]  →  [Saved]  →  [Exported]
                ↑           │
                └───────────┘
```

- **New:** modeler clicks "Start scenario" from the front door. Default state populated. Session-only; lost if browser closes.
- **Editing:** modeler is making changes. Each material edit recomputes Stage 2/3 and updates the preview. Auto-save to a draft slot every N seconds.
- **Saved:** modeler clicks "Save scenario." Persisted to `SCENARIOS` table with a name. Returns to this state on reload.
- **Exported:** modeler clicks "Export SKUs." A CSV is generated from the cached result and delivered. The scenario itself is not modified.

### 8.2 Scenario object schema (recap)

```typescript
type Scenario = {
  id: UUID;
  userId: string;
  name: string;
  mode: 'space' | 'budget';
  scope: {
    macsIds: number[];
    hierarchyFilter?: {
      l1Id?: number; l2Id?: number; l3Id?: number; l4Id?: number;
    };
  };
  allocations?: {
    // space mode only
    [level: 'l1' | 'l2' | 'l3' | 'l4']: {
      [nodeId: string]: { pct: number; locked: boolean };
    };
  };
  budget?: number;              // budget mode only, in DC cost dollars
  distribution?: 'proportional' | 'greedy_within_scope';  // budget mode only
  createdAt: Date;
  modifiedAt: Date;
  lastRunAt: Date | null;
};
```

### 8.3 What's not in scope for v1

- **Sharing:** scenarios are private to the user who created them. No team-wide sharing.
- **Promotion:** no path from saved scenario → canonical recommendation. Hard "no" until governance is in place.
- **Versioning:** edits overwrite. No "v1, v2, v3" history within a single named scenario. If the modeler wants history, they save under different names.
- **Collaboration:** no concurrent editing. If the same user opens the same scenario in two tabs, last-write-wins on save.

---

## 9. Performance budgets

| Operation | Target latency | Cache strategy |
|---|---|---|
| Initial scenario load (existing) | <500ms | Read from SCENARIOS + last cached result |
| Slider drag (visual feedback only) | 0ms | No recompute — UI moves the slider freely |
| Slider release → recompute trigger | 500ms debounce | Trigger on release, not on drag |
| Recompute single store, space mode | <2s | Hash inputs, check SCENARIO_RESULTS_CACHE first |
| Recompute single store, budget mode | <2s | Same |
| Recompute multi-store (3–5 stores) | <5s | Parallelize per store, aggregate at the end |
| Recompute multi-store (10+ stores) | <15s | UI shows progress; user warned in scope picker |
| Save scenario | <300ms | Append to SCENARIOS, last result already cached |
| Export SKU list (CSV) | <1s | Stream from SCENARIO_RESULTS_CACHE.sku_list |

**Recompute hot path:** the engine should hold a per-process LRU cache of `BEST_IN_RANKING` and `HIERARCHY_VOLUME` rows for the active store, keyed by store_id + snapshot_date. This avoids re-querying AlloyDB on every edit. Eviction on store change.

**Why the cache layer matters:** a typical editing session looks like 10–30 slider movements. Without caching, each one is an AlloyDB roundtrip + Stage 2/3 recompute. With caching, only the recompute runs.

---

## 10. Open engineering questions

These are not blockers but need answers before implementation:

1. **Scenario engine deployment model.** Is the recompute logic in the web app process, or a sidecar service? In-process is faster; sidecar is more scalable. Probably in-process for v1, sidecar when concurrent users exceed ~50.

2. **DC cost freshness.** Daily snapshot is reasonable but may lag actual supplier price changes. Is there a need for intraday cost updates? Likely no for v1.

3. **Concurrency on saved scenarios.** Two browser tabs editing the same saved scenario: optimistic locking, last-write-wins, or hard lock? Recommend last-write-wins for v1 with a "modified by another session" warning on save.

4. **Audit logging.** Are exports tracked? If yes, what fields (user, scenario id, scope, budget, SKU count, timestamp)? Likely yes for compliance, append-only audit table.

5. **Sizing for power users.** What's the upper bound on scenarios per user? 50 saved? 200? Affects pagination UX and storage planning. Best guess: cap at 50, archive older ones.

6. **Cache invalidation on canonical updates.** When BEST_IN_RANKING or HIERARCHY_VOLUME refreshes nightly, every cached scenario result becomes stale. Should we invalidate all cached results, or recompute on next access? Recommend: invalidate, recompute lazily on next view.

7. **Multi-store distribution edge case.** In budget mode with `proportional` distribution across multiple stores, is the budget distributed across stores by their volume share? Or does the modeler enter per-store budgets? V1 default: equal split with per-store override.

8. **Hierarchy edits at L4 (brand level).** Is the slider model the right control for brand mix, or is a "swap brand A for brand B" action more natural? Out of scope for v1 — flagging for v2 design.

---

## 11. Quick reference: what changes vs canonical

| Concept | Canonical Pulse | Scenario Planner |
|---|---|---|
| Stage 1 ranking | computed daily | unchanged, read-only |
| Stage 2 input: HIER_CAP_L4 | derived from current mix | derived from modeler's allocations or budget |
| Stage 2 output: ASSORTMENT_RECOMMENDATION | one canonical version per store | one per scenario, cached, never canonical |
| Stage 3 health scores | one per store, written to HEALTH_SCORES | computed live for the scenario, never written |
| Action set | ALIGNED_KEEP / NOT_ALIGNED_RETURN / TO_ORDER | same three actions, different counts |
| Output | SKU list via Get SKUs list | SKU list via Export SKUs (scenario-tagged CSV) |
| Constraints | proportional category mix preservation, cubic-inch caps | space mode: modeler-defined caps; budget mode: dollar caps with proportional distribution by default |
| Triggers | nightly batch | per-edit (debounced 500ms) |

If anything in the planner's behavior diverges from this table, the table is wrong and needs updating — not the planner.
