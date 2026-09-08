# Pulse AI Store Execution — Prototype Implementation Guide

> Porting this feature into the production React and Python applications? Start with [`STORE_EXECUTION_PORTING_SPEC.md`](./STORE_EXECUTION_PORTING_SPEC.md). It separates required product behavior from prototype-only mock logic and defines the recommended API, persistence, lifecycle, and acceptance contracts.

## Purpose

Store Execution turns Pulse AI's ranked SKU recommendations into a capacity-aware recovery journey for an individual store.

Pulse AI already identifies:

- which inventory is aligned or not aligned;
- the store and category health scores;
- the highest-ranked missing SKUs to **Order**; and
- the lowest-ranked held SKUs to **Return**.

Store Execution adds the operational constraint that a distribution center can accept only a fixed **dollar value of returns per month**. It divides the store's return backlog into monthly waves, sequences Orders alongside those Returns, and projects how each wave improves assortment health.

The current implementation is an interactive front-end prototype. It demonstrates the product behavior with realistic mock data; it does not submit orders, authorize returns, persist execution history, or call a production LLM.

## Product rules represented in the prototype

### 1. The DC constraint is a dollar budget

The monthly constraint is return inventory value, not a product count and not a one-for-one swap.

For the sample store:

| Input | Prototype value |
| --- | ---: |
| Store | ATL-050 (Downtown Atlanta) |
| Current health score | 29 |
| Target health score | 91 |
| Return-value backlog | $148,600 |
| Monthly DC return budget | $10,000 |
| Projected waves | 15 |

Pulse fills a wave with the lowest-ranked Return recommendations until their combined inventory value reaches the monthly DC budget. Because SKU values differ, the number of Return SKUs can differ from wave to wave.

### 2. Orders and Returns are separate tracks

- **Returns** consume the monthly DC return-value budget.
- **Orders** are selected from the highest-ranked missing products.
- Orders do not consume the Return budget.
- The Order count therefore does not have to equal the Return count.

The interface presents both tracks together because they contribute to the same store-health improvement, but it never labels them as a swap.

### 3. The strongest actions happen first

Early waves prioritize:

- the worst-ranked inventory currently held for Return; and
- the best-ranked aligned inventory currently missing for Order.

This produces a steeper projected health improvement in the first waves. Later waves contain progressively less impactful recommendations.

### 4. Locked work stays stable

The intended execution lifecycle is:

1. **Draft** — generated from the current ranking, inventory, budget, and strategy.
2. **Review** — available for business review.
3. **Locked** — the SKU actions are frozen for operational execution.
4. **Executing** — files have been approved and the work is underway.
5. **Completed** — actual results are retained as execution history.

Completed and active waves should not be rebuilt when recommendations change. Only future waves should use refreshed rankings, inventory, budgets, or Scenario Planner rules.

> Prototype limitation: the current React state is session-only. Refreshing the browser resets the plan to its initial state. Production must persist the plan, current wave, lifecycle status, and execution history so a user logging in during week five resumes the active plan instead of returning to Wave 1.

## Where the functionality lives

Store Execution is a tab inside an individual store page, alongside **Overview** and **Category health**.

This placement keeps the Pulse AI workflow cohesive:

1. **Scenario Planner** defines store strategy.
2. **SKU List** exposes ranked recommendations.
3. **Store Execution** sequences those recommendations into operational waves.
4. **Execution Enablement** turns the digital worker on for additional stores after the DC assigns their budgets.

The active prototype implementation is in [`pulse_planner_prototype.jsx`](./pulse_planner_prototype.jsx).

## User experience architecture

### Store recovery summary

The header establishes the stable plan context:

- health journey;
- total Return value pending;
- monthly DC Return budget; and
- projected completion date.

Changing the budget recalculates the number and timing of future waves.

### Wave selection

The selected wave is shared across every execution view. Users can select it through:

- Previous and Next controls;
- a wave/month dropdown;
- the W1–W15 selector; or
- a point on the recovery roadmap.

Changing the wave updates the roadmap emphasis, Pulse AI narrative, SKU preview, category paths, budget details, and strategy context.

### Execution lenses

The same plan can be inspected through four synchronized lenses:

| Lens | Purpose |
| --- | --- |
| Recovery roadmap | Shows the health trajectory, thresholds, milestones, AI-style analysis, representative SKUs, and important category paths. |
| Category paths | Searches and reviews affected L1–L4 hierarchy paths without attempting to render the entire category tree in one matrix. |
| Budget utilization | Separates the DC Return track from the Store Order track and shows monthly and cumulative Return value. |
| SKU actions | Shows representative Order and Return recommendations and links to the complete scoped SKU list. |

The prototype uses a compact dashboard layout and avoids nested scroll containers. The browser page remains the single scrolling surface.

### Category hierarchy handling

Pulse AI can contain approximately 1,500 hierarchy nodes. A single all-category recovery matrix would become unreadable, so the prototype uses:

- a small set of highest-impact paths in the roadmap;
- a searchable Category Paths lens;
- complete L1 → L2 → L3 → L4 breadcrumb paths; and
- links back to the existing Category Health drill-down.

The current path dataset is mocked in `EXECUTION_CATEGORY_PATHS`. Production should retrieve the impacted paths for the selected store, plan version, and wave.

### Wave-aware Pulse AI analysis

The roadmap contains an AI-styled explanation that changes when the selected wave changes. It summarizes:

- Return budget used;
- Return and Order SKU quantities;
- the leading category path;
- newly aligned SKUs;
- projected health-score movement;
- health-band transitions; and
- scheduled Scenario Planner changes.

The prototype narrative is deterministic JSX assembled from calculated wave data. It is intentionally presented as an LLM experience while keeping the demo fast and predictable.

In production, the recommended pattern is:

1. calculate and validate all numeric metrics in application code;
2. send only the approved structured wave summary to the LLM;
3. ask the LLM to explain the results without changing the numbers;
4. validate that referenced metrics match the structured payload; and
5. retain the structured data as the source of truth.

The LLM should explain the plan, not calculate the budget or decide which SKU actions are valid.

## Wave calculation model

The core prototype calculation is `buildReturnBudgetJourney(monthlyBudget)`.

### Wave count

```text
waveCount = ceil(returnValueBacklog / monthlyReturnBudget)
```

With a $148,600 backlog and a $10,000 monthly budget, the prototype generates 15 waves. The last wave uses only the remaining Return value.

### Return value per wave

```text
spentBefore = min(backlog, waveIndex × monthlyBudget)
returnBudget = min(monthlyBudget, backlog - spentBefore)
remainingReturnValue = max(0, backlog - spentAfter)
```

### Projected health

The demo uses a nonlinear curve so early, higher-ranked actions create more health improvement:

```text
progress = spentReturnValue / returnValueBacklog
health = round(29 + 62 × progress^0.74)
```

This moves the sample store from 29 to 91. It is a visualization model, not the production Pulse health-score formula.

### SKU quantities

The prototype estimates Return and Order counts to illustrate that SKU quantity varies independently from budget:

```text
returnSkuCount ≈ returnBudget / estimatedAverageItemValue
orderSkuCount ≈ returnSkuCount × decreasingOrderRatio
```

Production must replace these estimates with actual ranked SKU rows, item values, quantities on hand, return eligibility, pack sizes, and other business rules.

### Category impact

The prototype projects category scores from category-specific starting and target values using the same recovery progress. The UI then identifies when a category crosses:

- **Critical:** 0–50
- **At risk:** 51–70
- **Excellent:** 71–100

Production should aggregate the real SKU actions in each wave to every affected hierarchy node and calculate the resulting category-health projection.

## Scenario Planner integration

Future waves can receive an effective-dated Scenario Planner change.

The prototype includes a Spark Plugs strategy scheduled before Wave 9. When a strategy is scheduled:

1. the rule is associated with the future wave;
2. the roadmap displays a strategy marker;
3. the AI analysis mentions the strategy;
4. future recommendations are described as being rebuilt; and
5. locked or executing waves remain unchanged.

A production implementation should store the exact strategy version applied to each wave so the recommendation set is explainable and auditable later.

## Front-end component map

| Component or constant | Responsibility |
| --- | --- |
| `RETURN_VALUE_BACKLOG` | Sample store's total recommended Return value. |
| `buildReturnBudgetJourney` | Builds wave dates, budget consumption, health projection, SKU counts, and category projections. |
| `scoreBand` / `pulseScoreTone` | Maps scores into Critical, At risk, and Excellent presentation states. |
| `EXECUTION_LENSES` | Declares the four synchronized plan views. |
| `EXECUTION_CATEGORY_PATHS` | Supplies representative L1–L4 hierarchy paths for the prototype. |
| `CompactWaveSelector` | Keeps the selected wave explicit across the experience. |
| `CompactRoadmapLens` | Renders the trajectory, dynamic Pulse AI analysis, SKU snapshot, and category-path snapshot. |
| `WaveSkuPreview` | Shows searchable, action-filtered representative SKU rows. |
| `WaveCategoryExplorer` | Shows searchable hierarchy paths and projected impacts. |
| `BudgetUtilizationLens` | Explains Return-budget use and the separate Order track. |
| `PulseStoreWorkspaceScreen` | Owns Store Execution state and composes the complete store-level experience. |

## Prototype state

The active Store Execution screen currently owns these React state values:

| State | Meaning |
| --- | --- |
| `lens` | Active execution view. |
| `selectedWave` | Wave inspected across the dashboard. |
| `launched` | Whether Wave 1 has been locked/launched in the current session. |
| `budget` | Monthly DC Return-value budget. |
| `budgetEditing` | Whether the budget control is open. |
| `strategyEditorOpen` | Whether the strategy scheduling UI is open. |
| `scenarioChoice` | Scenario selected for a future wave. |
| `scheduledStrategies` | Effective-dated strategy changes keyed by wave index. |

`useMemo` rebuilds the wave journey when the budget changes. Selecting a wave does not recalculate the plan; it changes the shared inspection context.

## Production data model

A production implementation should persist at least the following records.

### Store execution plan

- plan ID;
- store ID and DC ID;
- current status;
- source ranking version;
- source inventory snapshot;
- current strategy version;
- created, updated, and last-refreshed timestamps; and
- current active wave.

### Wave

- wave ID and sequence number;
- planned start and end dates;
- lifecycle status;
- assigned Return-value budget;
- planned and actual Return value;
- projected and actual health scores;
- strategy version applied;
- locked timestamp and locked-by user; and
- completion timestamp.

### Wave SKU action

- wave ID;
- SKU and store identifiers;
- action: Order or Return;
- rank and reason codes;
- quantity;
- unit and extended value;
- category hierarchy IDs;
- recommendation snapshot version;
- review/approval state; and
- execution result.

### Wave category impact

- wave ID;
- hierarchy node ID and level;
- projected score before and after;
- aligned and not-aligned SKU counts; and
- contributing Order and Return counts.

### Execution event

- plan/wave/action ID;
- event type;
- actor;
- timestamp; and
- before/after payload for auditability.

## Refresh and continuation behavior

When a user logs in after execution has started, the system should load the persisted plan rather than generate a new Wave 1.

For example, five weeks after starting a monthly plan:

- Wave 1 may be completed;
- Wave 2 may be active or awaiting review;
- the roadmap should show actual versus projected progress;
- Wave 1's SKU actions should remain historically frozen; and
- Waves 3 onward may be refreshed using the newest eligible recommendations.

Recommended refresh sequence:

1. load the latest inventory and ranking snapshot;
2. exclude completed and locked actions;
3. account for Orders and Returns already executed;
4. apply the strategy version effective for each future wave;
5. rebuild only future waves within the remaining DC budget; and
6. record a new plan version and explain material changes to the user.

## Validation completed for the prototype

- The Vite production build succeeds.
- Wave selection updates shared wave context.
- Return budget and SKU quantity are displayed as separate concepts.
- Orders remain outside the DC Return-value budget.
- Future strategy scheduling is represented without changing active work.
- Pulse AI analysis changes with the selected wave.
- The category experience uses searchable paths rather than an all-category matrix.
- Nested Store Execution scroll containers were removed.

## Running the prototype

```bash
npm install
npm run dev
```

Build the production bundle with:

```bash
npm run build
```

From the application:

1. open **Assortment overview**;
2. open a store from Store Health;
3. select the **Store execution** tab;
4. select Wave 1, Wave 4, and Wave 9 to compare insights; and
5. switch between the four execution lenses.

## Known prototype limitations

- All Store Execution data is mocked in the client.
- State is not persisted across page reloads or sign-ins.
- Only the first wave can be simulated as launched.
- There is no completed-wave or actual-versus-plan dataset yet.
- SKU values and quantities are illustrative.
- Export, approvals, DC receipt, purchase-order creation, and return authorization are not integrated.
- Category search operates on representative paths, not the complete production taxonomy.
- The Pulse AI narrative is deterministic and does not call an LLM.
- Access control and role-based permissions are outside the current prototype.

## Recommended next implementation step

The next vertical slice should persist one store plan and its waves. It should support:

1. generating a plan from a versioned ranking and inventory snapshot;
2. reviewing and locking Wave 1;
3. returning later and resuming the persisted active wave;
4. recording actual execution results; and
5. refreshing only future waves.

That slice validates the most important product promise: Store Execution is a continuing operational plan, not a dashboard that starts over every time the user logs in.
