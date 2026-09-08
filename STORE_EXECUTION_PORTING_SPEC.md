# Pulse AI Store Execution — Product and Engineering Porting Specification

## How to use this document

This is the source of truth for porting **Store Execution** from the interactive prototype into the production Pulse AI React and Python applications.

Use the labels below literally:

- **Required:** production behavior that must be implemented.
- **MVP:** required for the first production release.
- **Later:** intentionally deferred.
- **Prototype only:** demonstration behavior or mock data that must not become a production rule.

The prototype is a visual reference, not the business-logic source of truth. Its current implementation is in [`pulse_planner_prototype.jsx`](./pulse_planner_prototype.jsx). A description of how that demo was assembled is in [`STORE_EXECUTION_IMPLEMENTATION.md`](./STORE_EXECUTION_IMPLEMENTATION.md).

---

## 1. Product definition

Store Execution converts Pulse AI's ranked **Order** and **Return** recommendations for one store into a continuing, reviewable sequence of monthly execution waves.

The planning constraint is the store's monthly **DC Return budget in dollars**. It is not a SKU-count limit, unit-count limit, labor-hours limit, or one-for-one swap limit.

Each wave must answer five questions:

1. Which recommended Returns should the store send to the DC this month?
2. Which recommended Orders should the store bring in?
3. Which category paths are affected?
4. What is the projected store and category health after execution?
5. Which Scenario Planner strategy was used to generate the recommendations?

### Product placement

- **Store page → Store Execution tab:** review and operate the plan for one store.
- **Execution Enablement navigation page:** assign/confirm a budget and enable the digital worker for multiple stores.
- **SKU List:** inspect the complete Order and Return action lines for the selected store, plan, and wave.
- **Category Health:** inspect affected hierarchy nodes and drill from L1 through the available lower levels.
- **Scenario Planner:** define strategy. Strategy affects only eligible future waves after it becomes effective.

Store Execution is not a replacement for SKU List, Category Health, or Scenario Planner. It orchestrates their outputs over time.

---

## 2. Canonical terminology

| Term | Definition |
| --- | --- |
| Execution plan | The persisted recovery plan for one store, including its budget, waves, source versions, and lifecycle. |
| Wave | A time-bound batch of Order and Return actions, normally one calendar month in the MVP. |
| Recommendation | Pulse AI's proposed action for a store/SKU: Order, Return, or Keep. Only Order and Return are executable here. |
| Action line | One store/SKU/action record in a wave. Do not call this a unit. |
| Unit quantity | The number of physical units on an action line. |
| Return value | The finance-approved dollar value of the units being returned. |
| Monthly DC Return budget | Maximum Return value that may be assigned to the store's wave for that month. |
| Aligned SKU | A SKU that the existing Pulse health engine considers appropriate and held for the store under the applied strategy. |
| Projected health | Health calculated by the existing Pulse health engine against a simulated post-wave assortment. |
| Locked wave | A reviewed wave whose action lines and source versions can no longer change. |
| Future wave | A Draft wave after the active/locked wave; it may be rebuilt from refreshed inputs. |
| Strategy version | The immutable Scenario Planner version applied when a wave is generated or rebuilt. |

Always display Return **value**, action-line count, and unit quantity as separate fields. `$10,000`, `610 SKU actions`, and `1,240 units` are different concepts.

---

## 3. MVP scope

### Included

- Enable Store Execution for a store after a monthly DC Return budget is available.
- Generate monthly waves from ranked Order and Return recommendations.
- Limit Returns by dollar value.
- Keep Orders outside the DC Return budget.
- Show projected store health and affected category paths for every wave.
- Select any wave from an explicit wave selector or roadmap point.
- Show representative SKU actions in the roadmap and the complete scoped list in SKU List.
- Review and lock the next executable wave.
- Preserve locked and completed waves.
- Refresh/rebuild Draft future waves when recommendations, inventory, budget, or strategy change.
- Schedule an approved Scenario Planner version before a future wave.
- Resume the persisted plan when the user returns later.
- Capture enough version metadata to explain why every action was selected.

### Not included in MVP

- Optimizing DC capacity across stores automatically.
- Creating purchase orders or return authorizations in an external system.
- Confirming physical DC receipt.
- Autonomous approval without a user review.
- Letting an LLM calculate budgets, select SKU actions, or calculate health.
- Treating Orders and Returns as one-for-one swaps.

---

## 4. Functional requirements

### 4.1 Execution Enablement

| ID | Requirement |
| --- | --- |
| EE-01 | Show stores that are eligible for Store Execution and their assigned monthly DC Return budget. |
| EE-02 | A store cannot be enabled without a positive budget and an available recommendation snapshot. |
| EE-03 | Enabling a store creates, or explicitly regenerates, a persisted Draft execution plan. |
| EE-04 | Support enabling one store or all currently eligible stores. |
| EE-05 | Show each store's plan status, active wave, last refresh, budget, and projected completion. |
| EE-06 | Opening a store from this page navigates to that store's Store Execution tab. |

### 4.2 Plan summary

| ID | Requirement |
| --- | --- |
| EP-01 | Show current health, target/projected health, Return-value backlog, monthly Return budget, number of waves, and projected completion. |
| EP-02 | Show whether the plan is Draft, In review, Active, Paused, Completed, or Needs attention. |
| EP-03 | Show when recommendations were last refreshed and whether Draft future waves have changed. |
| EP-04 | Editing a budget must show a preview before future waves are replaced. |
| EP-05 | A budget change must not mutate Locked, Executing, or Completed waves. |

### 4.3 Wave navigation and inspection

| ID | Requirement |
| --- | --- |
| WV-01 | The currently selected wave must always be explicit. |
| WV-02 | Users can select a wave with Previous/Next, the wave dropdown, numbered wave controls, or a roadmap point. |
| WV-03 | All lenses use the same selected-wave state. |
| WV-04 | Selecting a wave updates its narrative, health movement, Return usage, Orders, category impacts, strategy, and status. |
| WV-05 | Past, active, and future waves must be visually distinguishable. |
| WV-06 | The Store Execution workspace must not introduce nested scrolling regions; use the page scroll. |

### 4.4 Recovery roadmap

| ID | Requirement |
| --- | --- |
| RR-01 | Plot Today plus every planned wave in chronological order. |
| RR-02 | Show projected health at each point and the Critical, At risk, and Excellent bands. |
| RR-03 | Mark important events: band transitions, scheduled strategies, locked/active wave, and projected completion. |
| RR-04 | Show a selected-wave insight that reads like a Pulse AI explanation and changes by wave. |
| RR-05 | Show a compact preview of representative Order and Return actions for the selected wave. |
| RR-06 | Show the highest-impact category paths for the selected wave, not an attempted rendering of the entire hierarchy. |

### 4.5 SKU actions

| ID | Requirement |
| --- | --- |
| SK-01 | Return actions are sequenced using the approved Return recommendation priority. |
| SK-02 | Order actions are sequenced using the approved Order recommendation priority. |
| SK-03 | Keep recommendations are not included in executable waves. |
| SK-04 | The Return value assigned to a wave cannot exceed its monthly DC Return budget. |
| SK-05 | Orders do not consume the monthly DC Return budget. |
| SK-06 | The wave preview shows a small representative set and links to the complete wave-filtered SKU List. |
| SK-07 | The complete list supports search, Order/Return filters, category filters, reasons, rank, quantity, value, and export eligibility. |
| SK-08 | Locked action lines retain the recommendation reason, rank, inventory snapshot, strategy version, and valuation basis used at lock time. |

### 4.6 Category impact

| ID | Requirement |
| --- | --- |
| CT-01 | Store complete hierarchy identifiers and display names for every affected action line. |
| CT-02 | Aggregate wave impact at every affected hierarchy level. |
| CT-03 | Show full searchable paths such as `Brakes > Disc Brake > Brake Pads > Ceramic`. |
| CT-04 | Show projected score before/after and contributing Order/Return counts for each path. |
| CT-05 | Link an affected path back to the existing Category Health drill-down. |
| CT-06 | The UI must remain usable with 1,500 or more hierarchy nodes by searching, filtering, ranking, and pagination/virtualization in the full view. |

### 4.7 Scenario Planner integration

| ID | Requirement |
| --- | --- |
| SP-01 | A user can choose an approved Scenario Planner version for a future Draft wave. |
| SP-02 | The strategy has an effective wave/date and is applied before that wave is rebuilt. |
| SP-03 | The UI previews the resulting changes before the user confirms them. |
| SP-04 | A strategy change cannot modify Locked, Executing, or Completed waves. |
| SP-05 | Every generated wave stores the exact strategy version used. |
| SP-06 | If a strategy changes recommendations, the plan must show added, removed, and materially reprioritized future actions. |

### 4.8 Refresh and continuity

| ID | Requirement |
| --- | --- |
| RF-01 | Logging in during week five resumes the persisted plan; it never silently creates a new Wave 1. |
| RF-02 | Completed, Executing, and Locked action lines remain frozen during refresh. |
| RF-03 | Only Draft future waves are eligible for replacement. |
| RF-04 | Refresh accounts for actual completed actions and the latest inventory before creating new future actions. |
| RF-05 | Refresh records a new plan revision and a summary of what changed. |
| RF-06 | If source data is stale or unavailable, keep the last valid plan and show `Needs attention`; do not erase it. |

---

## 5. Business rules and calculation ownership

### Required production rules

1. Retrieve eligible Order and Return recommendations from the existing recommendation service.
2. Retrieve each Return's finance-approved extended value.
3. Fill a wave with the highest-priority eligible Return actions without exceeding that wave's dollar budget.
4. If partial quantities are allowed, split the action line and defer the remainder. If partial quantities are not allowed, defer the whole line. Make this a backend policy, not a UI decision.
5. Select Orders independently using the approved Order sequencing policy.
6. Simulate the post-wave assortment.
7. Ask the existing Pulse health engine to calculate projected store and category health from that simulated assortment.
8. Persist all source versions and calculated outputs.
9. Repeat until no eligible Return backlog remains, the target is met, or the configured planning horizon is reached.

### Budget invariant

For every wave:

```text
sum(return_action.extended_return_value) <= wave.assigned_return_budget
```

Orders never appear in that sum.

### Health invariant

Use the existing Pulse health implementation. Based on the current product definition, store health represents the share of the current assortment that is aligned:

```text
health_score = 100 * aligned_assortment_count / current_assortment_count
```

The backend must use the same counting grain and eligibility rules as today's Store Health page. Do not recreate the formula independently in React.

### Ranking invariant

The recommendation service must expose an unambiguous `execution_priority` where the lowest numeric value means “execute first,” regardless of whether the action is Order or Return. Store Execution must not infer priority from a display rank whose direction differs by action.

### Prototype-only calculations to discard

The prototype's `buildReturnBudgetJourney()` function uses illustrative values, including:

- a hard-coded `$148,600` Return backlog;
- a maximum of 24 waves;
- a nonlinear `progress^0.74` health curve;
- estimated average item values;
- estimated Return and Order action counts; and
- mocked category score trajectories.

These exist only to make the UI interactive. They are not production requirements.

---

## 6. Plan and wave lifecycle

### Plan states

```text
DRAFT -> ACTIVE -> COMPLETED
   |        |
   v        v
PAUSED   NEEDS_ATTENTION
```

- **Draft:** generated but no wave has been locked.
- **Active:** at least one wave is locked/executing or completed and work remains.
- **Paused:** deliberately stopped by an authorized user.
- **Needs attention:** data, budget, or execution conflict requires intervention.
- **Completed:** no executable backlog remains or the approved target has been reached.

### Wave states

```text
DRAFT -> IN_REVIEW -> LOCKED -> EXECUTING -> COMPLETED
  |          |
  +------> CANCELLED
```

Rules:

- Only Draft waves can be rebuilt automatically.
- Only Draft or In review waves can be cancelled.
- Locking creates an immutable action snapshot.
- Executing and Completed waves cannot return to Draft.
- Operational corrections are appended as auditable events; history is not rewritten.

---

## 7. Recommended Python architecture

The names are illustrative; align them with the production repository's conventions.

### Domain services

| Service | Responsibility |
| --- | --- |
| `ExecutionPlanService` | Create, load, activate, pause, and complete store plans. |
| `WavePlanningService` | Allocate ranked actions into budget-constrained waves. |
| `RecommendationGateway` | Read versioned Order and Return recommendations. |
| `InventoryGateway` | Read current store inventory and actual completed movement. |
| `ReturnValuationService` | Supply the approved extended Return value and valuation version. |
| `HealthProjectionService` | Call the existing Pulse health engine for simulated assortments. |
| `ScenarioGateway` | Resolve approved Scenario Planner versions by effective date/wave. |
| `PlanRefreshService` | Freeze historical work and rebuild only eligible future waves. |
| `ExecutionNarrativeService` | Build a grounded insight payload and optionally ask an LLM to explain it. |
| `ExecutionAuditService` | Record lifecycle and plan-revision events. |

### Background work

Wave generation and full-plan refresh may be asynchronous. If they exceed normal request latency:

1. create a job;
2. return `202 Accepted` with a job ID;
3. expose job status;
4. atomically publish the new plan revision only after validation; and
5. retain the previous valid revision if generation fails.

### Concurrency

Use optimistic concurrency on plan-changing operations:

```http
If-Match: <plan-version>
```

Return `409 Conflict` if another user or refresh job changed the plan. Never let two reviewers silently lock different versions of the same wave.

---

## 8. Recommended API contract

Route naming may change, but the capabilities and response boundaries should remain.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/stores/{store_id}/execution-plan` | Load the active plan summary and wave summaries. |
| `POST` | `/api/v1/stores/{store_id}/execution-plan` | Generate the store's first Draft plan. |
| `POST` | `/api/v1/execution-plans/{plan_id}/budget-preview` | Preview future-wave changes from a new monthly budget. |
| `PATCH` | `/api/v1/execution-plans/{plan_id}/budget` | Confirm the budget and replace eligible Draft waves. |
| `GET` | `/api/v1/execution-plans/{plan_id}/waves/{wave_id}` | Load one wave's complete metrics and status. |
| `GET` | `/api/v1/execution-plans/{plan_id}/waves/{wave_id}/sku-actions` | Paginated/filterable complete SKU actions. |
| `GET` | `/api/v1/execution-plans/{plan_id}/waves/{wave_id}/category-impacts` | Search/paginate affected hierarchy paths. |
| `POST` | `/api/v1/execution-plans/{plan_id}/waves/{wave_id}/review` | Move Draft to In review. |
| `POST` | `/api/v1/execution-plans/{plan_id}/waves/{wave_id}/lock` | Freeze actions and versions. |
| `POST` | `/api/v1/execution-plans/{plan_id}/waves/{wave_id}/start` | Mark operational execution started. |
| `POST` | `/api/v1/execution-plans/{plan_id}/waves/{wave_id}/complete` | Record actual outcomes and complete the wave. |
| `POST` | `/api/v1/execution-plans/{plan_id}/strategy-preview` | Preview an effective-dated Scenario Planner change. |
| `POST` | `/api/v1/execution-plans/{plan_id}/strategies` | Schedule a confirmed strategy version. |
| `POST` | `/api/v1/execution-plans/{plan_id}/refresh` | Rebuild eligible future waves. |
| `GET` | `/api/v1/execution-plans/{plan_id}/revisions` | View refresh history and change summaries. |

### Plan response shape

```json
{
  "plan_id": "ep_01J...",
  "store": {
    "id": "ATL-050",
    "name": "Downtown Atlanta",
    "dc_id": "ATL"
  },
  "status": "ACTIVE",
  "version": 7,
  "current_health_score": 29,
  "projected_health_score": 91,
  "target_health_score": 91,
  "return_value_backlog": {
    "amount": "148600.00",
    "currency": "USD",
    "valuation_version": "rv_2026-09-07"
  },
  "monthly_return_budget": {
    "amount": "10000.00",
    "currency": "USD"
  },
  "active_wave_id": "wave_02",
  "recommendation_snapshot_id": "rec_2026-09-07T10:00:00Z",
  "last_refreshed_at": "2026-09-07T10:05:00Z",
  "projected_completion_date": "2027-11-30",
  "waves": [
    {
      "wave_id": "wave_01",
      "number": 1,
      "period_start": "2026-09-01",
      "period_end": "2026-09-30",
      "status": "COMPLETED",
      "health_before": 29,
      "health_after": 37,
      "assigned_return_budget": "10000.00",
      "planned_return_value": "9984.35",
      "return_action_count": 610,
      "return_unit_quantity": 1240,
      "order_action_count": 805,
      "order_unit_quantity": 1097,
      "newly_aligned_count": 1881,
      "strategy_version_id": "strategy_12"
    }
  ]
}
```

Use decimal strings or a money type for currency. Do not use binary floating point.

### Wave action response shape

```json
{
  "items": [
    {
      "action_id": "act_01J...",
      "wave_id": "wave_02",
      "store_id": "ATL-050",
      "sku_id": "SP-731990",
      "action": "RETURN",
      "execution_priority": 1,
      "reason_code": "LOW_RANK_EXCESS_STOCK",
      "reason_text": "Lowest-ranked product held",
      "planned_quantity": 4,
      "unit_return_value": "16.25",
      "extended_return_value": "65.00",
      "category_path": [
        {"level": 1, "id": "brakes", "name": "Brakes"},
        {"level": 2, "id": "disc-brake", "name": "Disc Brake"},
        {"level": 3, "id": "brake-pads", "name": "Brake Pads"},
        {"level": 4, "id": "ceramic", "name": "Ceramic"}
      ],
      "recommendation_snapshot_id": "rec_2026-09-07T10:00:00Z",
      "inventory_snapshot_id": "inv_2026-09-07T09:45:00Z"
    }
  ],
  "next_cursor": null
}
```

---

## 9. Recommended persistence model

### `execution_plan`

- `id`, `store_id`, `dc_id`
- `status`, `version`, `active_wave_id`
- `monthly_return_budget_amount`, `currency`
- `target_health_score`
- `source_recommendation_snapshot_id`
- `source_inventory_snapshot_id`
- `source_valuation_version_id`
- `created_by`, `created_at`, `updated_at`, `last_refreshed_at`

### `execution_wave`

- `id`, `plan_id`, `number`, `period_start`, `period_end`
- `status`
- `assigned_return_budget_amount`
- `planned_return_value_amount`, `actual_return_value_amount`
- `health_before`, `projected_health_after`, `actual_health_after`
- `strategy_version_id`
- `locked_at`, `locked_by`, `started_at`, `completed_at`
- `source_plan_version`

### `execution_wave_action`

- `id`, `wave_id`, `store_id`, `sku_id`, `action`
- `execution_priority`, `reason_code`, `reason_payload`
- `planned_quantity`, `actual_quantity`
- `unit_return_value`, `extended_return_value`, `currency`
- `recommendation_snapshot_id`, `inventory_snapshot_id`
- hierarchy IDs needed for category aggregation
- `review_status`, `execution_status`

### `execution_wave_category_impact`

- `wave_id`, `category_node_id`, `category_level`, `path_ids`
- `health_before`, `projected_health_after`, `actual_health_after`
- aligned/not-aligned counts before and after
- contributing Order/Return action and unit counts

### `execution_strategy_schedule`

- `plan_id`, `strategy_version_id`
- `effective_wave_id`, `effective_date`
- `status`, `created_by`, `created_at`
- preview revision and confirmed revision

### `execution_event`

- `plan_id`, optional `wave_id`, optional `action_id`
- `event_type`, `actor_id`, `occurred_at`
- `plan_version`, `before_payload`, `after_payload`

---

## 10. Recommended React architecture

### Routes

```text
/stores/:storeId/overview
/stores/:storeId/category-health
/stores/:storeId/execution
/stores/:storeId/execution/waves/:waveId/skus
/execution-enablement
```

The selected wave should be represented by the route or query string so refresh, back/forward navigation, and copied links preserve context.

### Container responsibilities

| React area | Responsibility |
| --- | --- |
| `StoreExecutionPage` | Load plan; coordinate selected wave and lens; render loading, empty, stale, and error states. |
| `ExecutionPlanSummary` | Stable plan-level metrics and budget entry point. |
| `WaveSelector` | Explicit chronological wave navigation. |
| `RecoveryRoadmap` | Health trajectory and milestones; emits only wave selection. |
| `WaveInsight` | Render server-grounded structured metrics and optional narrative. |
| `WaveSummary` | Status, health movement, Return budget/value, Orders, and strategy. |
| `WaveSkuPreview` | Representative actions; links to the full server-paginated list. |
| `WaveCategoryPaths` | Representative/searchable impacts; links to Category Health. |
| `BudgetUtilization` | Monthly and cumulative Return budget; clearly separate Orders. |
| `StrategyScheduleDialog` | Preview then confirm a Scenario Planner version for a future wave. |
| `ReviewAndLockDialog` | Validate and lock the next executable wave. |

### Client-state rules

- Server state: plan, waves, actions, category impacts, revisions, and lifecycle status.
- URL state: selected wave and selected lens.
- Local UI state: open dialogs, search input, and unsaved form values.
- Do not hold plan lifecycle or wave actions only in React component state.
- Invalidate/refetch the plan after any successful mutation.
- Preserve the last valid response while a future-wave refresh job runs.

### Required states

Every data surface needs:

- loading;
- no plan enabled;
- plan generating;
- ready;
- stale/refreshed with changes;
- no actions for this wave;
- authorization failure;
- generation/refresh failure; and
- version conflict.

---

## 11. LLM boundary

### The LLM may

- explain the selected wave in concise business language;
- identify the largest calculated category opportunity;
- summarize changes from the previous plan revision; and
- explain a scheduled strategy's already-calculated impact.

### The LLM must not

- select or rank SKUs;
- calculate Return value or budget utilization;
- calculate health scores;
- invent category impacts;
- approve or lock a wave; or
- override eligibility, valuation, inventory, or strategy rules.

Recommended input:

```json
{
  "wave_number": 2,
  "period": "October 2026",
  "health_before": 37,
  "health_after": 43,
  "planned_return_value": "9984.35",
  "assigned_return_budget": "10000.00",
  "return_action_count": 592,
  "order_action_count": 770,
  "newly_aligned_count": 1510,
  "top_category_impacts": [],
  "strategy_change": null
}
```

Prefer returning structured narrative fields such as `headline`, `explanation`, and `watchouts`. Validate that every number in the output occurs in the grounded input. If generation fails, render a deterministic template from the same fields.

---

## 12. End-to-end flows

### Flow A — Enable a store

1. User opens Execution Enablement.
2. System shows ATL-050 as eligible with its DC-assigned monthly Return budget.
3. User selects Enable.
4. Backend validates budget and source snapshots.
5. Backend generates a Draft plan and wave summaries.
6. UI opens ATL-050 → Store Execution with Plan ready for review.

### Flow B — Review and lock Wave 1

1. User selects Wave 1.
2. UI loads its full summary, representative actions, category impacts, and source versions.
3. User opens the complete scoped SKU List if more detail is needed.
4. User selects Review & lock.
5. Backend revalidates eligibility and budget against the reviewed version.
6. Backend atomically freezes the wave and records an audit event.
7. UI shows Wave 1 as Locked/Executing; future waves remain Draft.

### Flow C — Schedule a strategy before Wave 9

1. User selects Wave 9.
2. User selects an approved Spark Plugs Scenario Planner version.
3. Backend previews the effect on Wave 9 and later Draft waves.
4. UI shows changed actions, categories, health, and completion if applicable.
5. User confirms.
6. Backend stores the effective strategy and publishes a new plan revision.
7. Earlier Locked/Executing/Completed waves remain unchanged.

### Flow D — Return in week five

1. User signs in and opens ATL-050.
2. Backend returns the existing persisted plan and active wave.
3. UI shows actual progress for completed work and the active wave—not Wave 1 as a new plan.
4. If recommendations refreshed, UI shows a change notice for future Draft waves.
5. User can inspect past immutable actions and current/future work.

---

## 13. Acceptance criteria

### Budget correctness

- A wave assigned `$10,000` never contains more than `$10,000` of planned Return value.
- Changing item values changes the number of actions/units that fit, not the budget.
- Adding Orders does not reduce available Return budget.
- Currency values remain exact through persistence, calculation, API serialization, and display.

### Ranking correctness

- The first wave receives the first eligible actions by `execution_priority`.
- Deferred or ineligible actions include a machine-readable reason.
- The same recommendation cannot be active in two waves for the same plan revision unless it represents an explicitly split quantity.

### Continuity correctness

- Refreshing the browser retains the active plan and selected wave URL.
- Returning after five weeks loads the same plan revision or its recorded successor.
- Refresh never changes a locked or completed action line.
- Every future-wave rebuild creates an auditable revision.

### Strategy correctness

- A Wave 9 strategy does not change Waves 1–8.
- The strategy version is visible for Wave 9 and later waves where it applies.
- The user sees a preview before future waves are replaced.
- Locked waves reject strategy mutations.

### UI correctness

- Wave selection is visible without relying on chart discovery.
- Selecting Wave 2 updates every visible wave-specific section.
- Users can reach the complete wave-filtered SKU List in one action.
- Category paths remain searchable with 1,500+ nodes.
- Return dollars, Return actions, Return units, Order actions, and Order units have distinct labels.
- Store Execution does not contain nested scroll regions.

### LLM correctness

- Narrative failure does not block the plan.
- All numbers and category names in an LLM narrative are grounded in the structured wave payload.
- Business calculations produce identical results with the LLM disabled.

---

## 14. Traceability from prototype to production

| Prototype element | Production interpretation | Action when porting |
| --- | --- | --- |
| `buildReturnBudgetJourney()` | Visual demo generator | Replace with Python `WavePlanningService`. |
| `RETURN_VALUE_BACKLOG` | Mock summary value | Load from versioned eligible Return actions. |
| React `budget` state | Editable demo input | Persist via preview/confirm API with concurrency control. |
| React `launched` boolean | Demo of locking Wave 1 | Replace with persisted plan/wave lifecycle. |
| React `scheduledStrategies` map | Demo effective-wave strategy | Replace with persisted strategy schedule and plan revisions. |
| `CompactWaveSelector` | Required explicit navigation | Rebuild using server wave IDs and URL state. |
| `CompactRoadmapLens` | Required roadmap behavior | Bind to backend-calculated wave summaries. |
| `WaveSkuPreview` | Representative SKU glimpse | Bind to preview endpoint; full data remains in SKU List. |
| `WaveCategoryExplorer` | Scalable category-path concept | Bind to searched/paginated category-impact endpoint. |
| `BudgetUtilizationLens` | Required Return-vs-Order separation | Use exact money and actual action/unit counts. |
| `CompactWaveInspector` | Selected-wave action area | Use persisted status and authorized transitions. |
| JSX Pulse AI analysis | Deterministic demo copy | Use grounded backend payload plus optional LLM explanation. |

---

## 15. Recommended delivery sequence

1. **Domain contract:** agree on money basis, action/quantity terminology, ranking direction, split-quantity policy, health-engine contract, and lifecycle permissions.
2. **Read model:** implement persisted plan/wave summaries and render the Store Execution page from APIs.
3. **Wave generation:** build the Python allocation service and tests for budget/ranking invariants.
4. **Review and lock:** implement immutable snapshots, optimistic concurrency, and audit events.
5. **Continuity:** load/resume plans and refresh only future Draft waves.
6. **SKU and category detail:** integrate server pagination/search with existing SKU List and Category Health.
7. **Scenario scheduling:** add preview/confirm behavior for future strategy versions.
8. **Narrative:** add deterministic insights first, then an optional grounded LLM explanation.
9. **Enablement:** support the multi-store activation console once one-store execution is proven end to end.

The first engineering milestone is complete only when a user can generate Wave 1, review and lock it, reload or return later, and see the same immutable Wave 1 with the next wave ready. A visually matching dashboard without that continuity is not a completed Store Execution implementation.
