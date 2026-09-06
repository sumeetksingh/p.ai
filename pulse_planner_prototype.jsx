import React, { useState, useMemo } from 'react';
import {
  Lock, ChevronRight, ArrowRight, ArrowLeft, BarChart3, LayoutGrid,
  List, HelpCircle, Beaker, Edit3, AlertTriangle, Save, Download,
  DollarSign, Grid3x3, RotateCcw, Store, Info, Check, X, Zap, Scale,
  Search, Home, Package, CheckCircle2, FileText, SlidersHorizontal,
  BookOpen, ChevronDown, ArrowDownUp, CalendarDays, PlayCircle,
  RefreshCw, Clock3, TrendingUp, ClipboardList, CircleCheckBig,
  Route, CircleArrowOutUpRight, Bot, Power, Settings2, PencilLine,
  Sparkles, Sliders, Eye, MoreHorizontal,
} from 'lucide-react';

// ============================================================================
// Mock data
// ============================================================================

const STORE = {
  id: 'ATL-466',
  name: 'FORT GAINES GA',
  fullName: 'ATL-466 (FORT GAINES GA)',
  skuCount: 5379,
};

// Cubic-inch capacity of currently-stocked SKUs at this store.
// Production: SUM(PRODUCT_VOLUME) from SITE_PRODUCT for the store.
// Estimate for ATL-466: ~5,379 SKUs × ~215 in³ avg ≈ 1,150,000 in³.
const STORE_CAPACITY_CUBIC_INCHES = 1_150_000;

const INITIAL_L1 = [
  { id: 'engine', name: 'Engine', pct: 11.0, score: 62, zone: 'atrisk' },
  { id: 'brakes', name: 'Brakes', pct: 9.0, score: 71, zone: 'excellent' },
  { id: 'body', name: 'Body & accessories', pct: 8.5, score: 42, zone: 'critical' },
  { id: 'steering', name: 'Steering & suspension', pct: 7.0, score: 38, zone: 'critical' },
  { id: 'electrical', name: 'Electrical', pct: 6.0, score: 58, zone: 'atrisk' },
  { id: 'filters', name: 'Filters', pct: 5.5, score: 73, zone: 'excellent' },
  { id: 'heating', name: 'Heating & cooling', pct: 5.0, score: 51, zone: 'atrisk' },
  { id: 'tools', name: 'Tools & equipment', pct: 4.5, score: 35, zone: 'critical' },
  { id: 'drivetrain', name: 'Drivetrain', pct: 4.0, score: 65, zone: 'atrisk' },
  { id: 'ignition', name: 'Ignition', pct: 3.5, score: 67, zone: 'atrisk' },
  { id: 'belts', name: 'Belts & hoses', pct: 3.2, score: 78, zone: 'excellent' },
  { id: 'lighting', name: 'Lighting', pct: 3.0, score: 49, zone: 'critical' },
  { id: 'exhaust', name: 'Exhaust', pct: 2.8, score: 55, zone: 'atrisk' },
  { id: 'cooling', name: 'Cooling', pct: 2.5, score: 60, zone: 'atrisk' },
  { id: 'fuel', name: 'Fuel system', pct: 2.5, score: 47, zone: 'critical' },
  { id: 'hardware', name: 'Hardware', pct: 2.2, score: 33, zone: 'critical' },
  { id: 'transmission', name: 'Transmission', pct: 2.0, score: 52, zone: 'atrisk' },
  { id: 'specialty', name: 'Specialty', pct: 2.0, score: 19, zone: 'critical' },
  { id: 'gaskets', name: 'Gaskets', pct: 1.8, score: 68, zone: 'atrisk' },
  { id: 'wheels', name: 'Wheels', pct: 1.6, score: 41, zone: 'critical' },
  { id: 'climate', name: 'Climate', pct: 1.5, score: 44, zone: 'critical' },
  { id: 'diagnostic', name: 'Diagnostic', pct: 1.4, score: 56, zone: 'atrisk' },
  { id: 'bearings', name: 'Bearings', pct: 1.3, score: 72, zone: 'excellent' },
  { id: 'hvac', name: 'HVAC', pct: 1.2, score: 50, zone: 'atrisk' },
  { id: 'wipers', name: 'Wipers', pct: 1.1, score: 63, zone: 'atrisk' },
  { id: 'handtools', name: 'Hand tools', pct: 1.0, score: 28, zone: 'critical' },
  { id: 'powertools', name: 'Power tools', pct: 0.9, score: 31, zone: 'critical' },
  { id: 'paint', name: 'Paint', pct: 0.8, score: 25, zone: 'critical' },
  { id: 'shop', name: 'Shop equipment', pct: 0.7, score: 39, zone: 'critical' },
  { id: 'performance', name: 'Performance', pct: 0.6, score: 53, zone: 'atrisk' },
  { id: 'truck', name: 'Truck accessories', pct: 0.5, score: 46, zone: 'critical' },
  { id: 'marine', name: 'Marine', pct: 0.3, score: 36, zone: 'critical' },
  { id: 'heavyduty', name: 'Heavy duty', pct: 0.2, score: 22, zone: 'critical' },
];

const REAL_L3_INTERIOR = [
  { id: 'mirrors', name: 'Mirrors Rear View', pct: 32.0, hasWarn: true, warnText: 'BK-Balkamp 78%' },
  { id: 'doorAccess', name: 'Door Accessories', pct: 18.0 },
  { id: 'hardwareComp', name: 'Hardware & Components', pct: 10.0, hasWarn: true, warnText: 'BK-Balkamp 65%' },
  { id: 'cbRadios', name: 'CB Radios & Accessories', pct: 8.0 },
  { id: 'doorHandles', name: 'Door Handles', pct: 7.0 },
  { id: 'gauges', name: 'Gauges', pct: 6.0 },
  { id: 'steeringWheels', name: 'Steering Wheels & Columns', pct: 6.0 },
  { id: 'windowCranks', name: 'Window Cranks', pct: 5.0 },
  { id: 'carpeting', name: 'Carpeting & Floor Mats', pct: 4.0 },
  { id: 'windowTint', name: 'Window Tint & Film', pct: 4.0 },
];

const SAMPLE_SKUS = [
  { rank: 1, partNum: '7303651', desc: 'LOCKERS', brand: 'BK', action: 'order', cost: 48 },
  { rank: 2, partNum: '27600213', desc: 'BLADE HONDA HO01', brand: 'XTL', action: 'order', cost: 52 },
  { rank: 3, partNum: '4521002', desc: 'BRAKE PAD KIT FRONT', brand: 'WAG', action: 'improve', cost: 34 },
  { rank: 4, partNum: '7305427', desc: 'KEY CHAIN', brand: 'BK', action: 'order', cost: 8 },
  { rank: 5, partNum: '9123456', desc: 'OIL FILTER PREMIUM', brand: 'BOSCH', action: 'improve', cost: 11 },
  { rank: 6, partNum: '9876543', desc: 'WIPER BLADE STD 22"', brand: 'ANCO', action: 'regress', cost: -12 },
  { rank: 7, partNum: '7451106', desc: 'FAN 12V', brand: 'BK', action: 'order', cost: 42 },
  { rank: 8, partNum: 'BYMCKY100BK', desc: '2IN1 MICRO/MFI KEYCHN', brand: 'BK', action: 'order', cost: 15 },
];

const RECENT_SCENARIOS = [
  { id: 's1', name: 'ATL-466 brake re-mix', mode: 'Space', age: '3 days ago' },
  { id: 's2', name: '$50K Q2 deployment', mode: 'Budget', age: 'last week' },
];

const STORES = [
  { code: 'ATL-328', name: 'WASHINGTON GA', skus: 6093, notAligned: 4362, excellent: 0, atRisk: 2, critical: 28, score: 28 },
  { code: 'ATL-191', name: 'EATONTON, GA.', skus: 13205, notAligned: 9061, excellent: 3, atRisk: 1, critical: 28, score: 31 },
  { code: 'ATL-466', name: 'FORT GAINES GA', skus: 5379, notAligned: 3691, excellent: 2, atRisk: 1, critical: 29, score: 31 },
  { code: 'ATL-130', name: 'GSE IBS', skus: 903, notAligned: 600, excellent: 0, atRisk: 2, critical: 26, score: 33 },
  { code: 'ATL-330', name: 'BEASLEY AUTO PARTS', skus: 12713, notAligned: 8380, excellent: 0, atRisk: 1, critical: 28, score: 34 },
  { code: 'ATL-440', name: 'ARLINGTON GA', skus: 9326, notAligned: 6124, excellent: 1, atRisk: 1, critical: 28, score: 34 },
];

const STORE_CATEGORIES = [
  { name: 'Specialty Programs', current: 1, notAligned: 1, score: 0 },
  { name: 'Climate Control', current: 16, notAligned: 16, score: 0 },
  { name: 'Steering & Suspension', current: 124, notAligned: 118, score: 5 },
  { name: 'Body & Accessories', current: 96, notAligned: 77, score: 19 },
  { name: 'Tools & Equipment', current: 445, notAligned: 336, score: 24 },
  { name: 'Engine Parts', current: 798, notAligned: 571, score: 28 },
];

const CATEGORY_LEVELS = {
  l2: [
    { name: 'Interior L2-10', current: 31, notAligned: 28, score: 9 },
    { name: 'Exterior L2-9', current: 65, notAligned: 49, score: 24 },
  ],
  l3: [
    { name: 'Carpeting & Floor Mats L3-1', current: 1, notAligned: 1, score: 0 },
    { name: 'Door Accessories L3-1', current: 3, notAligned: 3, score: 0 },
    { name: 'Door Handles L3-1', current: 3, notAligned: 3, score: 0 },
    { name: 'Hardware & Components L3-2', current: 3, notAligned: 3, score: 0 },
    { name: 'Steering Wheels & Columns L3-1', current: 1, notAligned: 1, score: 0 },
    { name: 'Window Cranks L3-1', current: 1, notAligned: 1, score: 0 },
    { name: 'Window Tint & Film L3-1', current: 1, notAligned: 1, score: 0 },
    { name: 'Gauges L3-1', current: 9, notAligned: 8, score: 11 },
    { name: 'CB Radios & Accessories L3-1', current: 7, notAligned: 6, score: 14 },
    { name: 'Mirrors Rear View L3-2', current: 2, notAligned: 1, score: 50 },
  ],
  l4: [
    { name: 'BK - BALKAMP L4-1', current: 2, notAligned: 2, score: 0 },
    { name: 'XTL L4-1', current: 1, notAligned: 1, score: 0 },
  ],
};

const CURRENT_SKUS = [
  ['#1330', '7303651', 'LOCKERS', 'BK', 'BK - BALKAMP'],
  ['#3393', '27600213', '10 BLADES HONDA HO01', 'XTL', 'XTL'],
  ['#3800', '7305427', 'KEY CHAIN', 'BK', 'BK - BALKAMP'],
  ['#5621', 'BYMCKY100BK', '2IN1 MICRO/MFI KEYCHN', 'BK', 'BK - BALKAMP'],
  ['#6621', '7451106', 'FAN', 'BK', 'BK - BALKAMP'],
  ['#6688', '7829283', '400W 12V/DC INVERTER', 'BK', 'BK - BALKAMP'],
  ['#7214', '7304650', 'USB-C CHARGER', 'BK', 'BK - BALKAMP'],
  ['#8042', '7306241', 'UTILITY MIRROR', 'BK', 'BK - BALKAMP'],
  ['#8910', '7308088', 'PHONE MOUNT', 'BK', 'BK - BALKAMP'],
  ['#9104', 'XTL99120', 'LED ACCESSORY KIT', 'XTL', 'XTL'],
].map(([rank, part, description, brand, l4]) => ({ rank, part, description, brand, l4, status: 'Order' }));

function downloadSkuCsv(rows = CURRENT_SKUS) {
  const header = ['Rank', 'Part number', 'Part description', 'Field abbreviation', 'Store ID', 'Category L1', 'Category L2', 'Category L3', 'Category L4', 'Status'];
  const body = rows.map(r => [r.rank, r.part, r.description, r.brand, STORE.fullName, 'Body & Accessories', 'Interior', 'Hardware & Components', r.l4, r.status]);
  const csv = [header, ...body].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'pulse-ai-recommended-skus.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// Hierarchy generation — builds out L2/L3/L4 for every L1
// ============================================================================

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function classifyScore(score) {
  if (score >= 70) return 'excellent';
  if (score >= 50) return 'atrisk';
  return 'critical';
}

const NAME_POOLS = {
  2: ['Primary line', 'Standard line', 'Specialty line', 'OEM line', 'Performance line'],
  3: ['Type A', 'Type B', 'Type C', 'Type D', 'Type E', 'Type F', 'Type G', 'Type H', 'Type J', 'Type K'],
  4: ['BK – Balkamp', 'WAG – Wagner', 'BOSCH', 'MOOG', 'ANCO', 'XTL', 'GATES', 'AC Delco', 'MAHLE', 'NAPA Premium'],
};

function generateChildrenSpec(parentNode, childLevel) {
  // Hand-curated branches
  if (parentNode.id === 'body' && childLevel === 2) {
    return [
      { idSuffix: 'interior', name: 'Interior L2-10', pctOfParent: 35.0, score: 9 },
      { idSuffix: 'exterior', name: 'Exterior L2-9', pctOfParent: 65.0, score: 24 },
    ];
  }
  if (parentNode.id === 'body.interior' && childLevel === 3) {
    return REAL_L3_INTERIOR.map(l3 => ({
      idSuffix: l3.id,
      name: l3.name,
      pctOfParent: l3.pct,
      hasWarn: l3.hasWarn,
      warnText: l3.warnText,
      score: 30 + Math.floor((l3.pct % 7) * 5),
    }));
  }

  const seed = hash(parentNode.id);
  const numChildren =
    childLevel === 2 ? 2 + (seed % 3)
    : childLevel === 3 ? 4 + (seed % 5)
    : 2 + (seed % 3);

  const children = [];
  let totalAssigned = 0;
  for (let i = 0; i < numChildren - 1; i++) {
    const variance = 0.7 + ((seed + i * 13) % 7) / 10;
    const pct = Math.max(2.0, Math.round((100 / numChildren) * variance * 10) / 10);
    const score = 20 + ((seed + i * 17) % 60);
    children.push({
      idSuffix: `g${i}`,
      name: NAME_POOLS[childLevel][i] || `Group ${i + 1}`,
      pctOfParent: pct,
      score,
    });
    totalAssigned += pct;
  }
  const lastScore = 20 + ((seed + (numChildren - 1) * 17) % 60);
  children.push({
    idSuffix: `g${numChildren - 1}`,
    name: NAME_POOLS[childLevel][numChildren - 1] || `Group ${numChildren}`,
    pctOfParent: Math.max(0.5, Math.round((100 - totalAssigned) * 10) / 10),
    score: lastScore,
  });
  return children;
}

function buildInitialTree() {
  const nodes = {};

  function addNode(node) {
    nodes[node.id] = {
      ...node,
      originalPct: node.pct,
      locked: false,
      isUserEdit: false,
      zone: classifyScore(node.score),
    };
  }

  INITIAL_L1.forEach(l1 => {
    addNode({
      id: l1.id,
      name: l1.name,
      level: 1,
      parentId: null,
      pct: l1.pct,
      score: l1.score,
    });

    const l2Specs = generateChildrenSpec(nodes[l1.id], 2);
    l2Specs.forEach(s2 => {
      const l2Id = `${l1.id}.${s2.idSuffix}`;
      addNode({
        id: l2Id,
        name: s2.name,
        level: 2,
        parentId: l1.id,
        pct: s2.pctOfParent,
        score: s2.score,
      });

      const l3Specs = generateChildrenSpec(nodes[l2Id], 3);
      l3Specs.forEach(s3 => {
        const l3Id = `${l2Id}.${s3.idSuffix}`;
        addNode({
          id: l3Id,
          name: s3.name,
          level: 3,
          parentId: l2Id,
          pct: s3.pctOfParent,
          score: s3.score,
          hasWarn: s3.hasWarn,
          warnText: s3.warnText,
        });

        const l4Specs = generateChildrenSpec(nodes[l3Id], 4);
        l4Specs.forEach(s4 => {
          const l4Id = `${l3Id}.${s4.idSuffix}`;
          addNode({
            id: l4Id,
            name: s4.name,
            level: 4,
            parentId: l3Id,
            pct: s4.pctOfParent,
            score: s4.score,
          });
        });
      });
    });
  });

  return nodes;
}

// ============================================================================
// Edit logic — independent by default, opt-in auto-rebalance
// ============================================================================

function applyEdit(nodes, changedId, newPct, autoRebalance = false) {
  const changed = nodes[changedId];
  if (!changed || changed.locked) return nodes;

  const next = { ...nodes };
  next[changedId] = { ...changed, pct: newPct, isUserEdit: true };

  if (!autoRebalance) {
    // Independent: only this node changes. Total of siblings is allowed to float.
    // Cascade DOWN happens implicitly because children are stored as share-of-parent.
    return next;
  }

  // Auto-rebalance: redistribute across unlocked siblings to keep sum at 100%.
  // Note: scale denominator uses the *actual current sum* of unlocked siblings,
  // not (100 - oldPct - lockedTotal). This matters when the modeler enables
  // auto-rebalance after independent edits have driven sum != 100% — the math
  // converges back to 100% on the first edit instead of staying off-balance.
  const siblings = Object.values(nodes).filter(
    n => n.parentId === changed.parentId && n.id !== changedId
  );
  const lockedTotal = siblings.filter(s => s.locked).reduce((sum, s) => sum + s.pct, 0);
  const unlockedSiblings = siblings.filter(s => !s.locked);
  const unlockedActual = unlockedSiblings.reduce((sum, s) => sum + s.pct, 0);
  const unlockedTarget = Math.max(0, 100 - newPct - lockedTotal);

  if (unlockedActual <= 0.01) return next;
  const scale = unlockedTarget / unlockedActual;

  unlockedSiblings.forEach(s => {
    next[s.id] = { ...s, pct: Math.max(0, s.pct * scale) };
  });

  return next;
}

// Walk up the path to compute the parent's resolved cubic-inch capacity at any level.
// At L1 (path = []) this is STORE_CAPACITY. At deeper levels it's the chain product.
function impliedParentCapacity(nodes, path) {
  let capacity = STORE_CAPACITY_CUBIC_INCHES;
  for (const id of path) {
    capacity *= (nodes[id].pct / 100);
  }
  return capacity;
}

// Baseline parent capacity uses originalPct values — i.e. the canonical mix before any edits.
// Used so the row can show "baseline → current" cubic-inch transitions even when ancestors moved.
function baselineParentCapacity(nodes, path) {
  let capacity = STORE_CAPACITY_CUBIC_INCHES;
  for (const id of path) {
    capacity *= (nodes[id].originalPct / 100);
  }
  return capacity;
}

// Compact cubic-inch formatter. Uses K above 1,000 for row display; full numerals for
// header annotations where precision is informative.
function formatInches(n, { compact = false } = {}) {
  if (compact && Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}K in³`;
  if (!compact && Math.abs(n) >= 100_000) return `${(n / 1000).toFixed(0)}K in³`;
  return `${Math.round(n).toLocaleString()} in³`;
}

// ============================================================================
// Budget mode — scope, distribution, cash-flow math (spec section 7)
// ============================================================================

// Mock multi-store catalog. In production this comes from AlloyDB.
const SCOPE_STORES = [
  { id: 'ATL-466', name: 'FORT GAINES GA',   skuCount: 5_379,  health: 31, volumeShare: 0.18 },
  { id: 'ATL-191', name: 'EATONTON GA',      skuCount: 13_205, health: 31, volumeShare: 0.42 },
  { id: 'ATL-130', name: 'GSE IBS',          skuCount: 903,    health: 33, volumeShare: 0.04 },
  { id: 'ATL-328', name: 'WASHINGTON GA',    skuCount: 6_093,  health: 28, volumeShare: 0.21 },
  { id: 'ATL-204', name: 'GREENSBORO GA',    skuCount: 4_812,  health: 47, volumeShare: 0.15 },
];

// Pull L3 leaves under a given L1 scope (or all leaves for store-wide).
// Returns shape used by the budget breakdown table.
function leavesInScope(nodes, hierarchyFilter) {
  return Object.values(nodes)
    .filter(n => n.level === 3)
    .filter(n => !hierarchyFilter?.l1Id || n.id.startsWith(`${hierarchyFilter.l1Id}.`))
    .map(n => {
      const l1Id = n.id.split('.')[0];
      return {
        id: n.id,
        name: n.name,
        l1Id,
        l1Name: nodes[l1Id]?.name ?? l1Id,
        pct: n.pct,
        score: n.score,
        zone: n.zone,
      };
    });
}

// Proportional distribution (default): every leaf in scope gets its share of the budget,
// in proportion to its cubic-inch volume share. Diversification-preserving.
function distributeProportional(leaves, totalBudget) {
  // Treat each leaf's effective share as parent share × leaf share.
  // For prototype simplicity, weight each leaf by its raw pct relative to others in scope.
  const totalWeight = leaves.reduce((s, l) => s + l.pct, 0);
  if (totalWeight <= 0) return leaves.map(l => ({ ...l, allocated: 0, skusAdmitted: 0 }));
  return leaves.map(l => {
    const allocated = totalBudget * (l.pct / totalWeight);
    // Mock SKUs admitted: ~$22 average DC cost per SKU under proportional fill.
    const skusAdmitted = Math.max(0, Math.round(allocated / 22));
    return { ...l, allocated, skusAdmitted };
  });
}

// Greedy distribution (advanced): rank leaves by health-score-delta-per-dollar
// (lower scores have more headroom = higher delta per dollar). May concentrate spend.
function distributeGreedyWithinScope(leaves, totalBudget) {
  const scored = leaves
    .map(l => {
      // Higher impact-per-dollar where score is low (more room to lift) and pct is small
      // (under-represented in current mix). Cost proxy: $22 per SKU × min admittable batch.
      const headroom = Math.max(1, 100 - l.score);
      const impactPerDollar = headroom / (22 * 5);
      return { ...l, impactPerDollar };
    })
    .sort((a, b) => b.impactPerDollar - a.impactPerDollar);

  // Greedy fill: top-ranked leaves consume the budget until exhausted.
  let remaining = totalBudget;
  return scored
    .map(l => {
      if (remaining <= 0) return { ...l, allocated: 0, skusAdmitted: 0 };
      // Top leaves get up to a "natural cap" of ~6× their proportional share before passing on.
      const proportionalShare = totalBudget * (l.pct / scored.reduce((s, x) => s + x.pct, 0));
      const naturalCap = Math.min(remaining, proportionalShare * 6);
      const allocated = naturalCap;
      remaining -= allocated;
      return { ...l, allocated, skusAdmitted: Math.max(0, Math.round(allocated / 22)) };
    })
    // Restore display order to L1 grouping for the breakdown table.
    .sort((a, b) => a.l1Id.localeCompare(b.l1Id) || b.allocated - a.allocated);
}

// Cash-flow definitions per spec section 7.5.
// Returns credit is mocked at ~22% of gross deployment under proportional, ~12% under greedy.
function computeBudgetCashFlow(allocations, distribution) {
  const grossDeployment = allocations.reduce((s, a) => s + a.allocated, 0);
  const returnsRatio = distribution === 'proportional' ? 0.22 : 0.12;
  const returnsCredit = grossDeployment * returnsRatio;
  const netDeployment = grossDeployment - returnsCredit;
  return { grossDeployment, returnsCredit, netDeployment };
}

// Aggregate counts for the budget output review.
function computeBudgetImpact(allocations, distribution, scope) {
  const totalSkusAdmitted = allocations.reduce((s, a) => s + a.skusAdmitted, 0);
  const cash = computeBudgetCashFlow(allocations, distribution);
  // Returns count scales with returns credit / ~$18 average DC cost per returned SKU.
  const toReturn = Math.round(cash.returnsCredit / 18);
  // Health lift scales with diversification + spend. Greedy lifts faster but narrower.
  const lift = distribution === 'proportional'
    ? Math.min(28, cash.grossDeployment / 1800)
    : Math.min(34, cash.grossDeployment / 1500);
  const baselineHealth = scope.macsIds.length > 0
    ? Math.round(SCOPE_STORES.filter(s => scope.macsIds.includes(s.id)).reduce((s, x) => s + x.health, 0) / scope.macsIds.length)
    : 31;
  return {
    healthBefore: baselineHealth,
    healthAfter: baselineHealth + lift,
    toOrder: totalSkusAdmitted,
    toReturn,
    keep: 4140 - toReturn,
    cashOut: cash.grossDeployment / 1000,
    cashIn: cash.returnsCredit / 1000,
    cashNet: cash.netDeployment / 1000,
    grossDeployment: cash.grossDeployment,
    returnsCredit: cash.returnsCredit,
    netDeployment: cash.netDeployment,
  };
}

// ============================================================================
// Brand mark + sidebar
// ============================================================================

function NapaLogo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <polygon points="6,2 18,2 22,12 18,22 6,22 2,12" fill="#FFCC00" />
      <text x="12" y="15.5" fontSize="6.5" fontWeight="700" textAnchor="middle" fill="#1A1A1A">NAPA</text>
    </svg>
  );
}

function Sidebar({ current, onNavigate }) {
  const plannerScreens = ['planner-door', 'step1', 'step3', 'step4', 'budget-scope', 'budget-edit', 'budget-output'];
  const isPlanner = plannerScreens.includes(current);
  const isHealth = ['health', 'store-detail', 'category-l2', 'category-l3', 'category-l4'].includes(current);

  const NavBtn = ({ id, icon: Icon, label, active, accent, badge }) => (
    <button
      onClick={() => onNavigate(id)}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
        active
          ? accent ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-100 text-gray-900 font-medium'
          : accent ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon size={14} className="flex-shrink-0" />
      <span className="text-left truncate">{label}</span>
      {badge && <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-blue-700 text-white rounded font-medium tracking-wider">{badge}</span>}
    </button>
  );

  return (
    <aside className="w-56 bg-white border-r border-gray-200 px-3 py-4 flex flex-col flex-shrink-0">
      <div className="flex items-center gap-2 px-2 pb-3 mb-3 border-b border-gray-200">
        <NapaLogo />
        <span className="text-sm font-medium text-gray-900">Pulse AI</span>
      </div>
      <nav className="flex-1 space-y-0.5">
        <NavBtn id="overview" icon={BarChart3} label="Assortment overview" active={current === 'overview'} />
        <NavBtn id="health" icon={LayoutGrid} label="Store / category health" active={isHealth} />
        <NavBtn id="sku-list" icon={List} label="SKU list" active={current === 'sku-list'} />
        <div className="my-2 border-t border-gray-200"></div>
        <div className="px-2 pt-1 pb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-400">Plan &amp; execute</div>
        <NavBtn id="planner-door" icon={Beaker} label="Scenario planner" active={isPlanner} />
        <NavBtn id="get-well" icon={Power} label="Execution enablement" active={current === 'get-well'} accent badge="5 ON" />
        <div className="my-2 border-t border-gray-200"></div>
        <NavBtn id="help" icon={HelpCircle} label="How it works" active={current === 'help'} />
      </nav>
      <div className="pt-3 border-t border-gray-200 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">SS</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-900 truncate">Sumeet Kumar S...</div>
          <div className="text-[10px] text-gray-500 truncate">523028@GENPT.NET</div>
        </div>
      </div>
    </aside>
  );
}

// ============================================================================
// Reusable components
// ============================================================================

function Breadcrumb({ items }) {
  return (
    <div className="text-[11px] text-gray-500 mb-1.5">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="mx-1">/</span>}
          <span>{item}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

function MetricCard({ label, value, sub, warn = false }) {
  return (
    <div className={`rounded-md px-3.5 py-3 ${warn ? 'bg-amber-50' : 'bg-gray-100'}`}>
      <div className={`text-[11px] mb-1 ${warn ? 'text-amber-800' : 'text-gray-500'}`}>{label}</div>
      <div className={`text-lg font-medium ${warn ? 'text-amber-900' : 'text-gray-900'} tabular-nums leading-tight`}>{value}</div>
      {sub && <div className="text-[11px] text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function PrimaryButton({ children, onClick, icon: Icon, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-sm px-3.5 py-1.5 rounded-md font-medium flex items-center gap-1.5 ${
        disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 text-white'
      }`}
    >
      {children}
      {Icon && <Icon size={14} />}
    </button>
  );
}

function SecondaryButton({ children, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className="text-sm px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-md flex items-center gap-1.5"
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function PreviewPanel({ scenarioImpact }) {
  const { healthBefore, healthAfter, cashOut, cashIn, cashNet, toOrder, toReturn, keep } = scenarioImpact;
  const healthDelta = healthAfter - healthBefore;
  return (
    <div className="bg-white border border-gray-200 rounded-md">
      <div className="px-3.5 py-3 border-b border-gray-100">
        <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Store health</div>
        <div className="text-lg font-medium tabular-nums flex items-baseline gap-1.5">
          <span>{healthBefore}</span>
          <span className="text-gray-400 font-normal">→</span>
          <span>{Math.round(healthAfter)}</span>
          {healthDelta > 0.5 && <span className="text-xs text-green-700 font-medium">+{Math.round(healthDelta)}</span>}
        </div>
        <div className="flex h-1 mt-2 bg-gray-100 rounded overflow-hidden">
          <div className="bg-red-500" style={{ width: `${healthBefore}%` }}></div>
          {healthDelta > 0 && <div className="bg-green-500" style={{ width: `${Math.min(healthDelta, 100 - healthBefore)}%` }}></div>}
        </div>
      </div>
      <div className="px-3.5 py-3 border-b border-gray-100">
        <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Cash deployment</div>
        <div className="text-[13px] space-y-1">
          <div className="flex justify-between"><span className="text-gray-600">To order</span><span className="tabular-nums font-medium">${cashOut.toFixed(1)}K</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Returned</span><span className="tabular-nums">−${cashIn.toFixed(1)}K</span></div>
          <div className="flex justify-between pt-1.5 mt-1 border-t border-gray-100"><span className="font-medium text-gray-900">Net</span><span className="tabular-nums font-medium">${cashNet.toFixed(1)}K</span></div>
        </div>
      </div>
      <div className="px-3.5 py-3 border-b border-gray-100">
        <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">SKU actions</div>
        <div className="text-[13px] space-y-1">
          <div className="flex justify-between"><span className="text-gray-600">+ to order</span><span className="tabular-nums font-medium">{toOrder.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">− to return</span><span className="tabular-nums font-medium">{toReturn.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">keep</span><span className="tabular-nums">{keep.toLocaleString()}</span></div>
        </div>
      </div>
      <div className="px-3.5 py-3 bg-gray-50 text-[11px] text-gray-500 leading-relaxed">
        Scenario only — nothing here updates Pulse's canonical recommendations until you export.
      </div>
    </div>
  );
}

// ============================================================================
// Screen 1: Assortment Overview
// ============================================================================

function AssortmentOverview({ onNavigate }) {
  return (
    <div>
      <Breadcrumb items={['Pulse AI', 'Assortment overview']} />
      <h1 className="text-[22px] font-medium text-gray-900 leading-tight">Assortment overview</h1>
      <p className="text-sm text-gray-500 mt-1">Monitor assortment health across your stores</p>

      <div className="flex gap-3 mt-5 mb-4 text-xs">
        {['Distribution Center', 'Site type', 'Stores', 'Category', 'Health score range'].map(f => (
          <div key={f} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md">
            <div className="text-[10px] text-gray-500">{f}</div>
            <div className="text-gray-700">All</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg mb-5">
        <Beaker size={18} className="text-blue-700 flex-shrink-0" />
        <div className="flex-1 text-sm text-blue-900">
          <span className="font-medium">New — Scenario planner.</span> Test mix or budget changes before you act. Output is exportable; nothing affects your live recommendations.
        </div>
        <button onClick={() => onNavigate('planner-door')} className="text-sm font-medium text-blue-800 hover:text-blue-900 flex items-center gap-1">
          Open planner <ArrowRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">Assortment health score</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-medium text-gray-900 tabular-nums">54</span>
            <span className="text-xs text-amber-700 font-medium">At risk</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">46% is not aligned</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">Total stores</div>
          <div className="text-3xl font-medium text-gray-900 tabular-nums">195</div>
          <div className="text-[11px] text-gray-500 mt-1">Across 1 DC</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">Total SKUs</div>
          <div className="text-3xl font-medium text-gray-900 tabular-nums">3,223,820</div>
          <div className="text-[11px] text-gray-500 mt-1">Active assortment items</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">Inventory value</div>
          <div className="text-3xl font-medium text-gray-900 tabular-nums">$146M</div>
          <div className="text-[11px] text-gray-500 mt-1">Total stock valuation</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-1">Stores</h3>
          <div className="text-[11px] text-gray-500 mb-3">Top 5 · Across 195 stores · Sorted by worst-performing</div>
          {[
            { code: 'ATL-328', loc: 'WASHINGTON GA', score: 28, pct: 72, skus: '6,093' },
            { code: 'ATL-191', loc: 'EATONTON, GA', score: 31, pct: 69, skus: '13,205' },
            { code: 'ATL-466', loc: 'FORT GAINES GA', score: 31, pct: 69, skus: '5,379' },
            { code: 'ATL-130', loc: 'GSE IBS', score: 33, pct: 66, skus: '903' },
          ].map(s => (
            <button key={s.code} onClick={() => onNavigate(s.code === 'ATL-466' ? 'store-detail' : 'health')} className="w-full text-left flex items-center justify-between py-2 border-t border-gray-100 hover:bg-gray-50 px-1 rounded transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-900">{s.code} ({s.loc})</div>
                <div className="text-[11px] text-red-700">Critical · {s.pct}% is not aligned · {s.skus} SKUs</div>
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-red-300 flex items-center justify-center text-sm font-medium text-red-700">{s.score}</div>
            </button>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-1">Categories</h3>
          <div className="text-[11px] text-gray-500 mb-3">Across 33 categories · Sorted by worst-performing</div>
          {[
            { name: 'Body & Accessories', stores: 193, pct: 57.28, score: 42 },
            { name: 'Engine Parts', stores: 193, pct: 56.08, score: 43 },
            { name: 'Specialty Programs', stores: 126, pct: 56.35, score: 43 },
            { name: 'Tools & Equipment', stores: 195, pct: 56.74, score: 43 },
          ].map(c => (
            <button key={c.name} onClick={() => onNavigate(c.name === 'Body & Accessories' ? 'category-l2' : 'health')} className="w-full text-left flex items-center justify-between py-2 border-t border-gray-100 hover:bg-gray-50 px-1 rounded transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-900">{c.name}</div>
                <div className="text-[11px] text-gray-500">{c.stores} stores · {c.pct}% is not aligned</div>
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-red-300 flex items-center justify-center text-sm font-medium text-red-700">{c.score}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Screen 2: Planner Front Door
// ============================================================================

function PlannerFrontDoor({ onNavigate, savedScenarios, onLoadScenario }) {
  // Combine session-saved scenarios with the default mock list. Real ones first.
  const recent = [...savedScenarios, ...RECENT_SCENARIOS].slice(0, 3);

  return (
    <div>
      <Breadcrumb items={['Pulse AI', 'Scenario planner']} />
      <h1 className="text-[22px] font-medium text-gray-900">Scenario planner</h1>
      <p className="text-sm text-gray-500 mt-1 max-w-3xl">
        Test mix or budget changes without affecting the live assortment. Output is exportable; nothing here updates Pulse's canonical recommendations.
      </p>

      <div className="text-[11px] text-gray-500 uppercase tracking-wider mt-7 mb-3 font-medium">Recent scenarios</div>
      <div className="grid grid-cols-3 gap-2.5 mb-7">
        {recent.map(s => (
          <button
            key={s.id}
            onClick={() => onLoadScenario && onLoadScenario(s)}
            className="text-left bg-white border border-gray-200 rounded-md px-3.5 py-3 hover:border-gray-400"
          >
            <div className="text-sm font-medium text-gray-900 mb-1 truncate">{s.name}</div>
            <div className="text-[11px] text-gray-500">{s.mode} · {s.age}</div>
          </button>
        ))}
        <div className="bg-white border border-dashed border-gray-300 rounded-md px-3.5 py-3 flex items-center justify-center text-xs text-gray-500">
          View all ({recent.length + 2}) →
        </div>
      </div>

      <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-3 font-medium">Start a new scenario</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col">
          <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center mb-3">
            <Grid3x3 size={18} className="text-blue-700" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1.5">Reshape category mix</h3>
          <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-3.5">
            Adjust how much shelf volume each category gets at any level — L1 down to L4 brand. Useful when you're holding too much of a low-performing brand or want to shrink a category's footprint.
          </p>
          <div className="text-[11px] text-gray-500 mb-3.5">Constraint: cubic inches · Output: SKU list per L4</div>
          <button onClick={() => onNavigate('step1')} className="self-start text-sm px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-md font-medium">
            Start space scenario
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col">
          <div className="w-9 h-9 rounded-md bg-green-50 flex items-center justify-center mb-3">
            <DollarSign size={18} className="text-green-700" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1.5">Plan within a budget</h3>
          <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-3.5">
            Set a dollar budget (DC cost) and let Pulse pick the highest-ranked SKUs that fit. Useful for quarterly deployments or DC-level reallocations.
          </p>
          <div className="text-[11px] text-gray-500 mb-3.5">Constraint: DC cost · Output: SKU list ranked by impact</div>
          <button onClick={() => onNavigate('budget-scope')} className="self-start text-sm px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-md font-medium">
            Start budget scenario
          </button>
        </div>
      </div>

      <div className="mt-5 px-3.5 py-3 bg-gray-100 rounded-md text-xs text-gray-600 leading-relaxed">
        <span className="font-medium text-gray-900">Why one or the other?</span> Combining both produces conflicts — your space % may not be honored exactly, or your budget may not be fully spent. We force the choice up front. Each mode shows the implied other constraint as read-only context.
      </div>

      <div className="mt-3 px-4 py-4 bg-blue-950 text-white rounded-lg flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"><Route size={17} /></div>
        <div className="flex-1"><div className="text-sm font-medium">Strategy ready to execute?</div><div className="text-[11px] text-blue-200 mt-0.5">Turn the resulting Order and Return recommendations into capacity-sized monthly waves.</div></div>
        <button onClick={() => onNavigate('get-well')} className="rounded-md bg-white text-blue-950 px-3 py-2 text-xs font-medium flex items-center gap-1.5">Open execution enablement <ArrowRight size={13} /></button>
      </div>
    </div>
  );
}

// ============================================================================
// Screen 3: Step 1 — Awareness (Treemap)
// ============================================================================

const ZONE_BG = { excellent: 'bg-green-50', atrisk: 'bg-amber-50', critical: 'bg-red-50' };
const ZONE_TEXT = { excellent: 'text-green-900', atrisk: 'text-amber-900', critical: 'text-red-900' };

function Treemap({ items, onTileClick }) {
  const totalWidth = 700;
  const totalHeight = 360;
  const rows = [
    { share: 28.5, ids: ['engine', 'brakes', 'body'] },
    { share: 23.5, ids: ['steering', 'electrical', 'filters', 'heating'] },
    { share: 18.2, ids: ['tools', 'drivetrain', 'ignition', 'belts', 'lighting'] },
    { share: 15.8, ids: ['exhaust', 'cooling', 'fuel', 'hardware', 'transmission', 'specialty', 'gaskets'] },
    { share: 14.0, ids: ['wheels', 'climate', 'diagnostic', 'bearings', 'hvac', 'wipers', 'handtools', 'powertools', 'paint', 'shop', 'performance', 'truck', 'marine', 'heavyduty'] },
  ];
  const itemMap = Object.fromEntries(items.map(i => [i.id, i]));
  const tiles = [];
  let cumY = 0;
  rows.forEach(row => {
    const h = (row.share / 100) * totalHeight;
    const rowItems = row.ids.map(id => itemMap[id]);
    const rowSum = rowItems.reduce((s, i) => s + i.pct, 0);
    let cumX = 0;
    rowItems.forEach(item => {
      const w = (item.pct / rowSum) * totalWidth;
      tiles.push({ ...item, x: cumX, y: cumY, w, h });
      cumX += w;
    });
    cumY += h;
  });

  return (
    <div className="relative w-full bg-gray-50 rounded-md overflow-hidden" style={{ height: totalHeight }}>
      {tiles.map(t => {
        const showFull = t.w > 130 && t.h > 60;
        const showName = t.w > 60;
        return (
          <button
            key={t.id}
            onClick={() => onTileClick && onTileClick(t.id)}
            className={`absolute border border-black/10 px-2 py-1.5 overflow-hidden flex flex-col justify-between text-left hover:brightness-95 ${ZONE_BG[t.zone]} ${ZONE_TEXT[t.zone]}`}
            style={{ left: t.x, top: t.y, width: t.w, height: t.h, fontSize: t.h < 50 ? 10 : 11 }}
          >
            {showName && <div className="font-medium leading-tight truncate">{t.name}</div>}
            {showFull && <div className="text-[10px] opacity-80">{t.pct.toFixed(1)}% · score {t.score}</div>}
            {!showFull && t.h > 40 && t.w > 60 && <div className="text-[10px] opacity-80">{t.pct.toFixed(1)}%</div>}
          </button>
        );
      })}
    </div>
  );
}

function StepAwareness({ onContinue, onTileClick }) {
  return (
    <div>
      <Breadcrumb items={['Pulse AI', 'Scenario planner', 'Space allocation']} />
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex-1">
          <h1 className="text-[22px] font-medium text-gray-900">Step 1 — review current mix</h1>
          <p className="text-sm text-gray-500 mt-1">{STORE.fullName} · {STORE.skuCount.toLocaleString()} stocked SKUs · current category proportions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Step 1 of 4</span>
          <SecondaryButton>Save & exit</SecondaryButton>
          <PrimaryButton onClick={onContinue} icon={ArrowRight}>Continue</PrimaryButton>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2.5 my-5">
        <MetricCard label="L1 categories" value="33" />
        <MetricCard label="L3 stocked" value="156" />
        <MetricCard label="L4 brand-leafs" value="489" />
        <MetricCard label="Brand concentration" value="8 leafs" warn />
      </div>
      <Treemap items={INITIAL_L1} onTileClick={onTileClick} />
      <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-500"></span>Excellent (70-100)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500"></span>At risk (50-69)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500"></span>Critical (0-49)</span>
        <span className="ml-auto text-[11px]">Tile size = % of cubic inches · click any tile to drill into that L1's branch</span>
      </div>
      <div className="mt-4 px-3.5 py-3 bg-amber-50 rounded-md flex items-start gap-2.5 text-sm text-amber-900 leading-relaxed">
        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-medium">Brand concentration alert:</span> 8 leaf categories at this store have a single brand holding more than 50% of stocked volume. Most concentrated: Hardware → Mirrors Rear View → BK – Balkamp at 78%.{' '}
          <a className="underline font-medium cursor-pointer">Review the 8 →</a>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Screen 4: Hierarchy Editor — works at any level
// ============================================================================

function EditorRow({ item, hasChildren, onPctChange, onLockToggle, onDrill, sliderMax, showWarn, parentCapacity }) {
  const delta = item.pct - item.originalPct;
  const isUserEdit = item.isUserEdit;
  const isLocked = item.locked;
  const hasChange = Math.abs(delta) > 0.05;

  const sliderPct = Math.min(item.pct / sliderMax * 100, 100);
  const tickPct = Math.min(item.originalPct / sliderMax * 100, 100);

  // Cubic-inch resolution — show alongside % so the absolute footprint is always visible,
  // never letting baseline-anchored % drift become the only signal.
  const currentInches = parentCapacity * (item.pct / 100);
  const inchesLabel = formatInches(currentInches, { compact: true });

  // Multiplier vs. original. Surfaced only when growth/shrink is significant — small Δs
  // are clearer as "+1.5%" than as "×1.05".
  const multiplier = item.originalPct > 0.01 ? item.pct / item.originalPct : null;
  const showMultiplier = multiplier !== null && (multiplier >= 1.3 || multiplier <= 0.7);
  const multiplierLabel = multiplier !== null
    ? (multiplier >= 10 ? `×${multiplier.toFixed(0)}` : `×${multiplier.toFixed(1)}`)
    : null;

  const dotColor = isLocked ? 'bg-gray-300 border-gray-300' :
                   isUserEdit ? 'bg-blue-600 border-blue-600' :
                   hasChange ? 'bg-gray-400 border-gray-400' :
                   'bg-white border-gray-300';

  return (
    <div
      className={`grid items-center gap-2 px-3 py-2.5 border-b border-gray-100 last:border-b-0 text-[13px] ${isUserEdit ? 'bg-blue-50' : ''} ${isLocked ? 'opacity-60' : ''}`}
      style={{ gridTemplateColumns: '18px 1fr 16px 110px 78px 88px 14px' }}
    >
      <button onClick={() => onLockToggle(item.id)} className="flex items-center justify-center hover:bg-gray-100 rounded">
        {isLocked ? <Lock size={13} className="text-gray-500" /> : <span className={`w-2 h-2 rounded-full border ${dotColor}`}></span>}
      </button>
      {hasChildren ? (
        <button
          onClick={() => onDrill(item.id)}
          className={`text-left truncate hover:underline hover:text-blue-700 ${isUserEdit ? 'font-medium' : ''} text-gray-900`}
          title="Click to drill into this node's children"
        >
          {item.name}
          {isLocked && <span className="text-[11px] text-gray-500 ml-1.5">locked</span>}
        </button>
      ) : (
        <div className={`truncate ${isUserEdit ? 'font-medium' : ''} text-gray-900`}>
          {item.name}
          {isLocked && <span className="text-[11px] text-gray-500 ml-1.5">locked</span>}
        </div>
      )}
      {showWarn && item.hasWarn ? (
        <span title={item.warnText}><AlertTriangle size={13} className="text-amber-600" /></span>
      ) : <span></span>}
      <div className="relative h-4 flex items-center">
        <input
          type="range"
          min="0"
          max={sliderMax * 10}
          value={Math.round(item.pct * 10)}
          disabled={isLocked}
          onChange={e => onPctChange(item.id, Number(e.target.value) / 10)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />
        <div className="relative w-full h-1 bg-gray-200 rounded-full pointer-events-none">
          <div className={`absolute inset-y-0 left-0 rounded-full ${isUserEdit ? 'bg-blue-600' : 'bg-gray-400'}`} style={{ width: `${sliderPct}%` }} />
          <div className="absolute w-px h-2 bg-gray-500 opacity-50" style={{ left: `${tickPct}%`, top: '-2px' }} />
          <div className={`absolute w-3 h-3 rounded-full bg-white border-2 ${isUserEdit ? 'border-blue-600' : 'border-gray-500'}`} style={{ left: `${sliderPct}%`, top: '-4px', transform: 'translateX(-6px)' }} />
        </div>
      </div>
      <div className="text-right leading-tight">
        <div className="tabular-nums font-medium text-gray-900">{item.pct.toFixed(1)}%</div>
        <div className="text-[10px] tabular-nums text-gray-500">{inchesLabel}</div>
      </div>
      <div className="text-right leading-tight">
        {hasChange ? (
          <>
            <div className={`text-[11px] tabular-nums ${
              isUserEdit ? (delta > 0 ? 'text-blue-700 font-medium' : 'text-amber-700 font-medium') : 'text-gray-500'
            }`}>
              {isUserEdit ? `${delta > 0 ? '↑' : '↓'} ${delta > 0 ? '+' : ''}${delta.toFixed(1)}%` : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} auto`}
            </div>
            {showMultiplier && (
              <div className={`text-[10px] tabular-nums font-medium ${delta > 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                {multiplierLabel}
              </div>
            )}
          </>
        ) : <span className="text-gray-400 text-[11px]">—</span>}
      </div>
      {hasChildren ? (
        <button onClick={() => onDrill(item.id)} className="flex items-center justify-center text-gray-400 hover:text-blue-700">
          <ChevronRight size={14} />
        </button>
      ) : <span></span>}
    </div>
  );
}

function HierarchyEditor({ nodes, setNodes, path, setPath, onContinue, scenarioImpact, autoRebalance, setAutoRebalance, onSaveScenario }) {
  const level = path.length + 1;
  const parentId = path.length > 0 ? path[path.length - 1] : null;
  const parentNode = parentId ? nodes[parentId] : null;

  const children = useMemo(
    () => Object.values(nodes).filter(n => n.parentId === parentId).sort((a, b) => b.originalPct - a.originalPct),
    [nodes, parentId]
  );
  const total = children.reduce((s, c) => s + c.pct, 0);
  const cascadeNodes = path.map(id => nodes[id]);

  // Resolved cubic-inch capacity at this level — used by every row to anchor % to a
  // real footprint, and by the header annotation to translate sum-drift into in³ terms.
  const parentCapacity = useMemo(() => impliedParentCapacity(nodes, path), [nodes, path]);
  const baselineCapacity = useMemo(() => baselineParentCapacity(nodes, path), [nodes, path]);
  const impliedCapacity = parentCapacity * (total / 100);

  const childrenSetIds = useMemo(() => {
    const set = new Set();
    Object.values(nodes).forEach(n => {
      if (n.parentId) set.add(n.parentId);
    });
    return set;
  }, [nodes]);

  const levelLabel = level === 1 ? 'L1 categories' :
                     level === 2 ? 'L2 children' :
                     level === 3 ? 'L3 children' :
                     'L4 brands';
  const sliderMax = level === 1 ? 25 : 80;

  // Edge case: all unlocked siblings would go negative if user pushes one too high
  // under auto-rebalance — clamp slider max in that case (spec section 6.7).
  const allLocked = children.length > 0 && children.every(c => c.locked);
  const lockedTotalAtLevel = children.filter(c => c.locked).reduce((s, c) => s + c.pct, 0);

  // Toast: if user toggles auto-rebalance ON while total != 100%, show a one-time banner
  // explaining that the next edit will normalize total back to 100%.
  const [showToggleToast, setShowToggleToast] = useState(false);
  const willNormalize = autoRebalance && Math.abs(total - 100) > 0.1;

  function handleAutoRebalanceToggle(value) {
    if (value && Math.abs(total - 100) > 0.1) {
      setShowToggleToast(true);
    } else {
      setShowToggleToast(false);
    }
    setAutoRebalance(value);
  }

  function handlePctChange(id, newPct) {
    // In auto-rebalance mode, clamp newPct so unlocked others can absorb the change without
    // going negative — see spec section 6.7 max-clamp behavior.
    if (autoRebalance) {
      const node = nodes[id];
      const maxFeasible = 100 - lockedTotalAtLevel;
      newPct = Math.min(newPct, maxFeasible);
    }
    setNodes(applyEdit(nodes, id, newPct, autoRebalance));
    // First edit after toggling on dismisses the toast (the math has now normalized).
    if (showToggleToast) setShowToggleToast(false);
  }
  function handleLockToggle(id) {
    setNodes({ ...nodes, [id]: { ...nodes[id], locked: !nodes[id].locked } });
  }
  function handleDrill(id) {
    setPath([...path, id]);
  }
  function navigateToRoot() { setPath([]); }
  function navigateTo(idx) { setPath(path.slice(0, idx + 1)); }
  function navigateUp() { setPath(path.slice(0, -1)); }

  // Click-to-jump: takes any node's id and lands the editor at the level *containing*
  // that node, so the user can see/adjust it again without crawling back through chevrons.
  function jumpToEdit(nodeId) {
    const target = nodes[nodeId];
    if (!target) return;
    const segments = nodeId.split('.');
    // To edit a node, we need to be at its parent's level — i.e. path = its ancestors.
    // segments.length-1 ancestors. For an L1 node ("engine"), path = []. For L4
    // ("body.interior.mirrors.g0"), path = ["body","body.interior","body.interior.mirrors"].
    const parentPath = [];
    for (let i = 0; i < segments.length - 1; i++) {
      parentPath.push(segments.slice(0, i + 1).join('.'));
    }
    setPath(parentPath);
  }

  // List of every touched node, surfaced as quick-jump pills above the editor.
  const editedNodes = useMemo(
    () => Object.values(nodes).filter(n => n.isUserEdit).sort((a, b) => a.level - b.level || a.id.localeCompare(b.id)),
    [nodes]
  );

  function handleResetCurrentLevel() {
    const next = { ...nodes };
    children.forEach(c => {
      next[c.id] = { ...c, pct: c.originalPct, isUserEdit: false };
    });
    setNodes(next);
  }

  const showWarnColumn = level === 3;
  const editsAtThisLevel = children.filter(c => c.isUserEdit).length;
  const editsTotal = Object.values(nodes).filter(n => n.isUserEdit).length;
  const editsAbove = editsTotal - editsAtThisLevel;

  let subtitle;
  if (level === 1) {
    subtitle = `${STORE.fullName} · editing L1 categories · drill any row to reshape its L2/L3/L4 children`;
  } else {
    subtitle = `Editing ${levelLabel} of ${parentNode.name}`;
    if (editsAbove > 0) subtitle += ` · ${editsAbove} edit${editsAbove !== 1 ? 's' : ''} at higher levels`;
    if (editsAtThisLevel > 0) subtitle += ` + ${editsAtThisLevel} edit${editsAtThisLevel !== 1 ? 's' : ''} here`;
    subtitle += ' · changes preserved across drill';
  }

  return (
    <div>
      <Breadcrumb items={['Pulse AI', 'Scenario planner', 'Space allocation', 'ATL-466 mix exploration']} />
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex-1">
          <h1 className="text-[22px] font-medium text-gray-900">Step 3 — adjust mix</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Step 3 of 4</span>
          {level > 1 && (
            <SecondaryButton icon={ArrowLeft} onClick={navigateUp}>
              Up to {parentNode?.name?.split(' ')[0] || 'parent'}
            </SecondaryButton>
          )}
          <SecondaryButton icon={Save} onClick={onSaveScenario}>Save scenario</SecondaryButton>
          <PrimaryButton onClick={onContinue} icon={ArrowRight}>Continue</PrimaryButton>
        </div>
      </div>

      {editedNodes.length > 0 && (
        <div className="mt-3 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 text-blue-900 font-medium pr-2 border-r border-blue-200">
            <Edit3 size={12} />
            {editedNodes.length} edit{editedNodes.length !== 1 ? 's' : ''}
            <span className="text-blue-700 font-normal">· click to jump back</span>
          </div>
          {editedNodes.map(n => {
            const delta = n.pct - n.originalPct;
            return (
              <button
                key={n.id}
                onClick={() => jumpToEdit(n.id)}
                className="px-2 py-0.5 bg-white border border-blue-200 rounded-md text-[11px] hover:bg-blue-100 flex items-center gap-1"
                title={`L${n.level} · ${delta > 0 ? '+' : ''}${delta.toFixed(1)}% from canonical`}
              >
                <span className="text-gray-500">L{n.level}</span>
                <span className="text-gray-900 font-medium truncate max-w-[120px]">{n.name}</span>
                <span className={delta > 0 ? 'text-blue-700' : 'text-amber-700'}>
                  {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                </span>
              </button>
            );
          })}
        </div>
      )}

      {(showToggleToast && willNormalize) && (
        <div className="mt-3 px-3.5 py-2.5 bg-blue-50 border border-blue-200 rounded-md text-[13px] text-blue-900 flex items-start gap-2.5">
          <Info size={15} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            Auto-rebalance on — your next slider edit will normalize the sibling total back to 100%.
          </div>
          <button onClick={() => setShowToggleToast(false)} className="text-blue-800 hover:text-blue-900 flex items-center">
            <X size={14} />
          </button>
        </div>
      )}
      {allLocked && (
        <div className="mt-3 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-md text-[13px] text-amber-900 flex items-start gap-2.5">
          <Lock size={15} className="flex-shrink-0 mt-0.5" />
          <span>All categories at this level are locked. Unlock at least one to make edits.</span>
        </div>
      )}

      {level > 1 && (
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 rounded-md my-3 text-xs flex-wrap">
          <span className="text-gray-500">Cascade:</span>
          <button onClick={navigateToRoot} className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[11px] hover:bg-gray-50">
            ATL-466 store
          </button>
          {cascadeNodes.map((node, idx) => {
            const isEdited = node.isUserEdit;
            return (
              <React.Fragment key={node.id}>
                <span className="text-gray-400">→</span>
                <button
                  onClick={() => navigateTo(idx)}
                  className={`px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 ${
                    isEdited
                      ? 'bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {isEdited && <Edit3 size={10} />}
                  {node.name}: {node.pct.toFixed(1)}%
                </button>
              </React.Fragment>
            );
          })}
          <span className="text-gray-400">→</span>
          <span className="px-2 py-0.5 bg-gray-900 text-white rounded-md text-[11px]">
            editing {children.length} {levelLabel}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-100 rounded-md my-3 text-xs flex-wrap">
        <button onClick={handleResetCurrentLevel} className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5">
          <RotateCcw size={11} />Reset L{level}
        </button>
        <span className="text-gray-500">Mode:</span>
        <div className="inline-flex bg-white border border-gray-300 rounded-md overflow-hidden">
          <button
            onClick={() => handleAutoRebalanceToggle(false)}
            className={`px-2.5 py-1 text-xs ${!autoRebalance ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            title="Edits change only the touched row. Total can float."
          >
            Independent
          </button>
          <button
            onClick={() => handleAutoRebalanceToggle(true)}
            className={`px-2.5 py-1 text-xs border-l border-gray-300 ${autoRebalance ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            title="Edits redistribute across unlocked siblings to keep total at 100%."
          >
            Auto-rebalance
          </button>
        </div>
        <span className="ml-auto text-xs flex items-center gap-1.5">
          {(() => {
            const totalDelta = total - 100;
            const inchesDelta = impliedCapacity - baselineCapacity;
            const pctDelta = baselineCapacity > 0 ? (inchesDelta / baselineCapacity) * 100 : 0;
            const baselineStr = formatInches(baselineCapacity);
            const impliedStr = formatInches(impliedCapacity);
            const driftStr = `${pctDelta >= 0 ? '+' : ''}${pctDelta.toFixed(1)}%, ${inchesDelta >= 0 ? '+' : ''}${formatInches(inchesDelta)}`;

            if (Math.abs(totalDelta) < 0.1) {
              return (
                <span>
                  <span className="text-gray-500">Capacity:</span>{' '}
                  <span className="font-medium tabular-nums text-gray-900">{baselineStr}</span>{' '}
                  <span className="text-gray-500">(sum 100.0% · no implied change)</span>
                </span>
              );
            }
            const tone = totalDelta > 0 ? 'text-blue-700' : 'text-gray-600';
            const tag = totalDelta > 0 ? 'implied expansion' : 'unallocated';
            return (
              <span>
                <span className="text-gray-500">Baseline</span>{' '}
                <span className="font-medium tabular-nums text-gray-900">{baselineStr}</span>{' '}
                <span className="text-gray-400">→</span>{' '}
                <span className="text-gray-500">Implied</span>{' '}
                <span className="font-medium tabular-nums text-gray-900">{impliedStr}</span>{' '}
                <span className={tone}>({driftStr} {tag})</span>{' '}
                <span className="text-gray-400">· sum {total.toFixed(1)}%</span>
              </span>
            );
          })()}
          <span title="Slider % is share of the original baseline capacity. As sums drift above or below 100%, the implied total capacity changes. Cubic inches show the absolute resolved footprint and never drift." className="text-gray-400 hover:text-gray-600 cursor-help">
            <Info size={12} />
          </span>
        </span>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 240px' }}>
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <div
            className="grid gap-2 px-3 py-2 bg-gray-50 text-[11px] text-gray-500 uppercase tracking-wider"
            style={{ gridTemplateColumns: '18px 1fr 16px 110px 78px 88px 14px' }}
          >
            <span></span>
            <span>{level === 1 ? 'Category (% of store)' : `Name (% of ${parentNode?.name ?? 'parent'})`}</span>
            <span></span>
            <span></span>
            <span className="text-right" title="% is share of the original baseline. in³ is the absolute resolved footprint.">% / in³</span>
            <span className="text-right">Δ / ×</span>
            <span></span>
          </div>
          {children.map(item => (
            <EditorRow
              key={item.id}
              item={item}
              hasChildren={childrenSetIds.has(item.id)}
              onPctChange={handlePctChange}
              onLockToggle={handleLockToggle}
              onDrill={handleDrill}
              sliderMax={sliderMax}
              showWarn={showWarnColumn}
              parentCapacity={parentCapacity}
            />
          ))}
        </div>
        <PreviewPanel scenarioImpact={scenarioImpact} />
      </div>

      <div className="mt-3 text-[11px] text-gray-500 leading-relaxed">
        Drag a slider to change just that category — others stay put. Total can float above 100% (implies capacity expansion) or below (freed shelf). Switch to <span className="font-medium text-gray-700">Auto-rebalance</span> if you want siblings to redistribute proportionally instead. Click chevrons to drill into a row's children — edits persist across navigation.
      </div>
    </div>
  );
}

// ============================================================================
// Screen 5: Step 4 — Output Review
// ============================================================================

function StepOutputReview({ onNavigate, scenarioImpact, nodes, onSaveScenario }) {
  const [showChangedOnly, setShowChangedOnly] = useState(true);

  // Spec section 6.4: scenarios where any sibling group sums to != 100% must record the
  // implied capacity in scenario metadata and surface it on the output review screen.
  // We compute the L1 sibling total here as the headline indicator; deeper subtree drift
  // is captured in the per-export metadata.
  const l1Total = useMemo(
    () => Object.values(nodes).filter(n => n.level === 1).reduce((s, n) => s + n.pct, 0),
    [nodes]
  );
  const l1Drift = l1Total - 100;
  const driftInches = Math.abs(l1Drift) / 100 * STORE_CAPACITY_CUBIC_INCHES;
  const showCapacityFlag = Math.abs(l1Drift) > 0.1;
  const actionPill = (action) => {
    if (action === 'order') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-800 whitespace-nowrap">● new TO_ORDER</span>;
    if (action === 'improve') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-800 whitespace-nowrap">RETURN → KEEP</span>;
    if (action === 'regress') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 whitespace-nowrap">KEEP → RETURN</span>;
    return null;
  };

  return (
    <div>
      <Breadcrumb items={['Pulse AI', 'Scenario planner', 'Space allocation', 'ATL-466 mix exploration']} />
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex-1">
          <h1 className="text-[22px] font-medium text-gray-900">Step 4 — review & export</h1>
          <p className="text-sm text-gray-500 mt-1">Final SKU list from your scenario, ranked by impact. Compare to canonical, refine, or export when ready.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Step 4 of 4</span>
          <SecondaryButton icon={ArrowLeft} onClick={() => onNavigate('step3')}>Back to adjust</SecondaryButton>
          <SecondaryButton icon={Save} onClick={onSaveScenario}>Save scenario</SecondaryButton>
        </div>
      </div>

      {showCapacityFlag && (
        <div className={`mt-3 px-3.5 py-2.5 rounded-md flex items-start gap-2.5 text-sm leading-relaxed ${
          l1Drift > 0 ? 'bg-blue-50 border border-blue-200 text-blue-900' : 'bg-gray-50 border border-gray-200 text-gray-700'
        }`}>
          <AlertTriangle size={16} className={`flex-shrink-0 mt-0.5 ${l1Drift > 0 ? 'text-blue-700' : 'text-gray-500'}`} />
          <div>
            <span className="font-medium">
              {l1Drift > 0 ? 'Implied capacity expansion' : 'Unallocated capacity'}:
            </span>{' '}
            L1 categories sum to {l1Total.toFixed(1)}% ({l1Drift > 0 ? '+' : ''}{l1Drift.toFixed(1)}%, ~{Math.round(driftInches).toLocaleString()} in³).
            This will be recorded in the export metadata. {l1Drift > 0
              ? 'Confirm physical feasibility before placing orders.'
              : 'Freed shelf is not assigned to a category.'}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2.5 my-4">
        <MetricCard
          label="Health score"
          value={<span><span className="tabular-nums">{scenarioImpact.healthBefore}</span><span className="text-gray-400 font-normal mx-1">→</span><span className="tabular-nums">{Math.round(scenarioImpact.healthAfter)}</span> <span className="text-xs text-green-700 font-medium">+{Math.round(scenarioImpact.healthAfter - scenarioImpact.healthBefore)}</span></span>}
          sub="store-level"
        />
        <MetricCard label="Net cash deployment" value={`$${scenarioImpact.cashNet.toFixed(1)}K`} sub={`$${scenarioImpact.cashOut.toFixed(1)}K out · $${scenarioImpact.cashIn.toFixed(1)}K credit`} />
        <MetricCard label="New orders" value={<span><span className="tabular-nums">{scenarioImpact.toOrder.toLocaleString()}</span> <span className="text-xs text-gray-500 font-normal">SKUs</span></span>} sub="to deploy from DC" />
        <MetricCard label="Returns & transitions" value={<span><span className="tabular-nums">{scenarioImpact.toReturn.toLocaleString()}</span> <span className="text-xs text-gray-500 font-normal">SKUs</span></span>} sub="returns + status flips" />
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 rounded-md mb-3 text-xs flex-wrap">
        <span className="text-gray-500">Show:</span>
        <button onClick={() => setShowChangedOnly(true)} className={`px-2.5 py-1 rounded-full text-[11px] ${showChangedOnly ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300'}`}>Changed only</button>
        <button onClick={() => setShowChangedOnly(false)} className={`px-2.5 py-1 rounded-full text-[11px] ${!showChangedOnly ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300'}`}>All SKUs</button>
        <span className="w-px h-4 bg-gray-300 mx-1"></span>
        <span className="px-2.5 py-1 rounded-full text-[11px] bg-white border border-gray-300">● New order ({scenarioImpact.toOrder.toLocaleString()})</span>
        <span className="px-2.5 py-1 rounded-full text-[11px] bg-white border border-gray-300">→ Now keep (165)</span>
        <span className="px-2.5 py-1 rounded-full text-[11px] bg-white border border-gray-300">→ Now return (120)</span>
        <span className="ml-auto flex items-center gap-2"><span className="text-gray-500">Sort:</span><span className="font-medium text-gray-900">Highest impact ▼</span></span>
      </div>

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="grid gap-2.5 px-3 py-2 bg-gray-50 text-[11px] text-gray-500 uppercase tracking-wider"
          style={{ gridTemplateColumns: '36px 90px 1fr 56px 152px 60px' }}
        >
          <span>Rank</span><span>Part #</span><span>Description</span><span>Brand</span><span>Action</span><span className="text-right">DC cost</span>
        </div>
        {SAMPLE_SKUS.map(sku => (
          <div key={sku.partNum} className="grid items-center gap-2.5 px-3 py-2.5 border-b border-gray-100 last:border-b-0 text-xs"
            style={{ gridTemplateColumns: '36px 90px 1fr 56px 152px 60px' }}
          >
            <span className="text-gray-500 tabular-nums">#{sku.rank}</span>
            <span className="font-mono text-[11px] text-gray-600">{sku.partNum}</span>
            <span className="text-gray-900 font-medium truncate">{sku.desc}</span>
            <span className="text-gray-600 text-[11px]">{sku.brand}</span>
            <span>{actionPill(sku.action)}</span>
            <span className="text-right tabular-nums text-gray-900">{sku.cost < 0 ? `−$${Math.abs(sku.cost)}` : `$${sku.cost}`}</span>
          </div>
        ))}
        <div className="px-3 py-2.5 text-xs text-gray-500 flex items-center justify-between">
          <span>+ {(scenarioImpact.toOrder + scenarioImpact.toReturn - 8).toLocaleString()} more changed SKUs (5,159 unchanged hidden)</span>
          <a className="text-blue-700 cursor-pointer">Show all →</a>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3.5 bg-gray-900 rounded-lg mt-3.5">
        <div className="text-white text-xs">
          <div className="font-medium mb-0.5">{(scenarioImpact.toOrder + scenarioImpact.toReturn).toLocaleString()} SKUs · scenario-tagged CSV</div>
          <div className="opacity-70">Columns: SKU number · Store ID · action · was-action · DC cost · scenario name</div>
        </div>
        <button className="text-sm font-medium px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-md flex items-center gap-1.5">
          Export SKUs <Download size={14} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Budget mode — Step A: scope picker
// ============================================================================

function BudgetScopePicker({ nodes, scope, setScope, onContinue, onBack }) {
  const toggleStore = (id) => {
    const macsIds = scope.macsIds.includes(id)
      ? scope.macsIds.filter(s => s !== id)
      : [...scope.macsIds, id];
    setScope({ ...scope, macsIds });
  };

  const setHierarchyL1 = (l1Id) => {
    const next = l1Id ? { l1Id } : undefined;
    setScope({ ...scope, hierarchyFilter: next });
  };

  const isValid = scope.macsIds.length > 0;

  // Scope summary used downstream.
  const scopedSkuCount = SCOPE_STORES
    .filter(s => scope.macsIds.includes(s.id))
    .reduce((sum, s) => sum + s.skuCount, 0);

  const l1Options = INITIAL_L1.slice(0, 6); // top 6 by share — UI compactness

  return (
    <div>
      <Breadcrumb items={['Pulse AI', 'Scenario planner', 'Budget allocation', 'Scope']} />
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex-1">
          <h1 className="text-[22px] font-medium text-gray-900">Step 1 — pick scope</h1>
          <p className="text-sm text-gray-500 mt-1">Which stores and which slice of the hierarchy is this budget for?</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Step 1 of 3</span>
          <SecondaryButton onClick={onBack} icon={ArrowLeft}>Back</SecondaryButton>
          <PrimaryButton onClick={onContinue} icon={ArrowRight} disabled={!isValid}>Continue</PrimaryButton>
        </div>
      </div>

      <div className="grid gap-3 mt-5" style={{ gridTemplateColumns: '1fr 320px' }}>
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-md">
            <div className="px-3.5 py-2.5 border-b border-gray-200 flex items-center gap-2">
              <Store size={14} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Stores</span>
              <span className="text-[11px] text-gray-500">· {scope.macsIds.length} selected of {SCOPE_STORES.length}</span>
              <button
                onClick={() => setScope({ ...scope, macsIds: SCOPE_STORES.map(s => s.id) })}
                className="ml-auto text-[11px] text-blue-700 hover:text-blue-900"
              >
                Select all
              </button>
              <button
                onClick={() => setScope({ ...scope, macsIds: [] })}
                className="text-[11px] text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            {SCOPE_STORES.map(s => {
              const checked = scope.macsIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleStore(s.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 border-b border-gray-100 last:border-b-0 text-left text-sm hover:bg-gray-50 ${checked ? 'bg-blue-50' : ''}`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? 'bg-blue-700 border-blue-700' : 'bg-white border-gray-300'}`}>
                    {checked && <Check size={11} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{s.id} <span className="text-gray-500 font-normal">({s.name})</span></div>
                    <div className="text-[11px] text-gray-500">{s.skuCount.toLocaleString()} SKUs · health {s.health}</div>
                  </div>
                  <div className="text-[11px] text-gray-500 tabular-nums">{(s.volumeShare * 100).toFixed(0)}% vol</div>
                </button>
              );
            })}
          </div>

          <div className="bg-white border border-gray-200 rounded-md">
            <div className="px-3.5 py-2.5 border-b border-gray-200 flex items-center gap-2">
              <Grid3x3 size={14} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Hierarchy filter</span>
              <span className="text-[11px] text-gray-500">· optional — narrow to one L1 category</span>
            </div>
            <div className="p-3.5 grid grid-cols-3 gap-2">
              <button
                onClick={() => setHierarchyL1(null)}
                className={`px-3 py-2 rounded-md border text-sm text-left ${
                  !scope.hierarchyFilter
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">Store-wide</div>
                <div className={`text-[11px] ${!scope.hierarchyFilter ? 'opacity-80' : 'text-gray-500'}`}>All categories</div>
              </button>
              {l1Options.map(l1 => {
                const active = scope.hierarchyFilter?.l1Id === l1.id;
                return (
                  <button
                    key={l1.id}
                    onClick={() => setHierarchyL1(l1.id)}
                    className={`px-3 py-2 rounded-md border text-sm text-left ${
                      active
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium truncate">{l1.name}</div>
                    <div className={`text-[11px] ${active ? 'opacity-80' : 'text-gray-500'}`}>{l1.pct.toFixed(1)}% of store · score {l1.score}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-md">
          <div className="px-3.5 py-3 border-b border-gray-100">
            <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Scope summary</div>
            <div className="text-[13px] space-y-2">
              <div className="flex justify-between"><span className="text-gray-600">Stores</span><span className="tabular-nums font-medium">{scope.macsIds.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">SKUs in scope</span><span className="tabular-nums">{scopedSkuCount.toLocaleString()}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-600">Filter</span>
                <span className="font-medium text-gray-900 truncate max-w-[140px] text-right">
                  {scope.hierarchyFilter?.l1Id ? nodes[scope.hierarchyFilter.l1Id]?.name : 'Store-wide'}
                </span>
              </div>
            </div>
          </div>
          <div className="px-3.5 py-3 bg-gray-50 text-[11px] text-gray-500 leading-relaxed">
            {!isValid && 'Pick at least one store to continue.'}
            {isValid && scope.macsIds.length > 1 && 'Multi-store: each store gets its own proportional allocation. No cross-store rebalancing.'}
            {isValid && scope.macsIds.length === 1 && 'Single-store scope. Recompute target latency: under 2 seconds on warm cache.'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Budget mode — Step B: budget editor + distribution toggle + per-L4 breakdown
// ============================================================================

function BudgetEditor({ nodes, scope, budget, setBudget, distribution, setDistribution, allocations, onContinue, onBack }) {
  const cashFlow = useMemo(() => computeBudgetCashFlow(allocations, distribution), [allocations, distribution]);

  // Show the top 8 leaves by allocation. The full table is rendered after if expand toggle is on.
  const sortedAllocs = [...allocations].sort((a, b) => b.allocated - a.allocated);
  const visibleAllocs = sortedAllocs.slice(0, 12);

  // Underfunded count: leaves below the smallest viable SKU cost (~$11).
  const underfunded = allocations.filter(a => a.allocated > 0 && a.allocated < 11).length;
  const zeroFunded = allocations.filter(a => a.allocated === 0).length;

  const scopeLabel = scope.hierarchyFilter?.l1Id
    ? nodes[scope.hierarchyFilter.l1Id]?.name
    : 'Store-wide';

  // Quick budget presets (DC cost dollars).
  const presets = [10_000, 25_000, 50_000, 100_000];

  return (
    <div>
      <Breadcrumb items={['Pulse AI', 'Scenario planner', 'Budget allocation', 'Edit']} />
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex-1">
          <h1 className="text-[22px] font-medium text-gray-900">Step 2 — set budget</h1>
          <p className="text-sm text-gray-500 mt-1">
            {scope.macsIds.length} store{scope.macsIds.length !== 1 ? 's' : ''} · {scopeLabel} · pick a budget and a distribution rule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Step 2 of 3</span>
          <SecondaryButton onClick={onBack} icon={ArrowLeft}>Back</SecondaryButton>
          <SecondaryButton icon={Save}>Save scenario</SecondaryButton>
          <PrimaryButton onClick={onContinue} icon={ArrowRight} disabled={budget <= 0}>Continue</PrimaryButton>
        </div>
      </div>

      <div className="grid gap-3 mt-5" style={{ gridTemplateColumns: '1fr 280px' }}>
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={14} className="text-green-700" />
              <span className="text-sm font-medium text-gray-900">Net deployment budget</span>
              <span className="text-[11px] text-gray-500 ml-auto">DC cost · entered as net cash committed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-md px-3 py-2 flex-1 max-w-[260px]">
                <span className="text-gray-500 text-lg mr-1">$</span>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(Math.max(0, Number(e.target.value)))}
                  className="bg-transparent text-2xl font-medium text-gray-900 tabular-nums outline-none flex-1 min-w-0"
                  step={1000}
                  min={0}
                />
              </div>
              <div className="flex gap-1.5">
                {presets.map(p => (
                  <button
                    key={p}
                    onClick={() => setBudget(p)}
                    className={`px-2.5 py-1.5 text-xs rounded-md border ${
                      budget === p
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    ${p >= 1000 ? `${p / 1000}K` : p}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 text-[11px] text-gray-500">
              Your ${(cashFlow.netDeployment / 1000).toFixed(1)}K budget covers ${(cashFlow.grossDeployment / 1000).toFixed(1)}K gross orders
              {' '}if you also process ${(cashFlow.returnsCredit / 1000).toFixed(1)}K of returns.
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Distribution rule</span>
              <span className="text-[11px] text-gray-500 ml-auto">how the budget gets split across leaves in scope</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDistribution('proportional')}
                className={`text-left px-3.5 py-3 rounded-md border ${
                  distribution === 'proportional'
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Scale size={14} className="text-blue-700" />
                  <span className="text-sm font-medium text-gray-900">Proportional</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-gray-500">Default</span>
                </div>
                <div className="text-[11px] text-gray-600 leading-relaxed">
                  Every L4 in scope gets at least its proportional share of the budget. Diversification preserved. Health lift is real but not maximal.
                </div>
              </button>
              <button
                onClick={() => setDistribution('greedy_within_scope')}
                className={`text-left px-3.5 py-3 rounded-md border ${
                  distribution === 'greedy_within_scope'
                    ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-amber-700" />
                  <span className="text-sm font-medium text-gray-900">Greedy (advanced)</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-amber-700">Concentrates spend</span>
                </div>
                <div className="text-[11px] text-gray-600 leading-relaxed">
                  Sort by health-score-delta-per-dollar and fill from the top. May concentrate spend in 1-2 categories.
                </div>
              </button>
            </div>
            {distribution === 'greedy_within_scope' && (
              <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                <span>Greedy mode prioritizes maximum health-score lift over category diversification. Best for narrow-scope spend.</span>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-gray-200 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Per-L3 breakdown</span>
              <span className="text-[11px] text-gray-500">· top {visibleAllocs.length} of {allocations.length} leaves in scope</span>
              {(underfunded > 0 || zeroFunded > 0) && (
                <span className="ml-auto text-[11px] text-amber-800 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {zeroFunded > 0 && `${zeroFunded} unfunded`}
                  {zeroFunded > 0 && underfunded > 0 && ' · '}
                  {underfunded > 0 && `${underfunded} under-funded`}
                </span>
              )}
            </div>
            <div className="grid gap-2 px-3.5 py-2 bg-gray-50 text-[11px] text-gray-500 uppercase tracking-wider"
              style={{ gridTemplateColumns: '1fr 90px 80px 80px 60px' }}
            >
              <span>L3 leaf</span>
              <span>L1</span>
              <span className="text-right">Vol share</span>
              <span className="text-right">Allocated $</span>
              <span className="text-right">SKUs</span>
            </div>
            {visibleAllocs.map(a => {
              const isStarved = a.allocated < 11;
              return (
                <div key={a.id} className="grid gap-2 px-3.5 py-2 border-b border-gray-100 last:border-b-0 text-[13px]"
                  style={{ gridTemplateColumns: '1fr 90px 80px 80px 60px' }}
                >
                  <div className="truncate flex items-center gap-1.5">
                    <span className={`text-gray-900 ${isStarved ? 'text-amber-900' : ''}`}>{a.name}</span>
                    {isStarved && <span title="Below smallest viable SKU cost"><AlertTriangle size={11} className="text-amber-600" /></span>}
                  </div>
                  <span className="text-gray-500 text-[11px] truncate">{a.l1Name}</span>
                  <span className="text-right tabular-nums text-gray-600">{a.pct.toFixed(1)}%</span>
                  <span className="text-right tabular-nums font-medium text-gray-900">${a.allocated >= 1000 ? `${(a.allocated / 1000).toFixed(1)}K` : Math.round(a.allocated)}</span>
                  <span className="text-right tabular-nums text-gray-700">{a.skusAdmitted}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-md">
            <div className="px-3.5 py-3 border-b border-gray-100">
              <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Cash flow</div>
              <div className="text-[13px] space-y-1">
                <div className="flex justify-between"><span className="text-gray-600">Gross deployment</span><span className="tabular-nums font-medium">${(cashFlow.grossDeployment / 1000).toFixed(1)}K</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Returns credit</span><span className="tabular-nums">−${(cashFlow.returnsCredit / 1000).toFixed(1)}K</span></div>
                <div className="flex justify-between pt-1.5 mt-1 border-t border-gray-100"><span className="font-medium text-gray-900">Net deployment</span><span className="tabular-nums font-medium">${(cashFlow.netDeployment / 1000).toFixed(1)}K</span></div>
              </div>
            </div>
            <div className="px-3.5 py-3 border-b border-gray-100">
              <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">Coverage</div>
              <div className="text-[13px] space-y-1">
                <div className="flex justify-between"><span className="text-gray-600">Leaves in scope</span><span className="tabular-nums">{allocations.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Funded</span><span className="tabular-nums">{allocations.length - zeroFunded}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">SKUs admitted</span><span className="tabular-nums font-medium">{allocations.reduce((s, a) => s + a.skusAdmitted, 0).toLocaleString()}</span></div>
              </div>
            </div>
            <div className="px-3.5 py-3 bg-gray-50 text-[11px] text-gray-500 leading-relaxed">
              {distribution === 'proportional'
                ? 'Diversification guarantee: every L4 gets its proportional share. Some low-impact leaves still receive budget.'
                : 'No diversification guarantee. A single L4 could absorb the full budget if its impact-per-dollar is highest.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Budget mode — Step C: output review (cash-flow framing)
// ============================================================================

function BudgetOutputReview({ scope, distribution, budgetImpact, allocations, onNavigate }) {
  const scopeLabel = scope.macsIds.length === 1
    ? scope.macsIds[0]
    : `${scope.macsIds.length} stores`;
  const dist = distribution === 'proportional' ? 'Proportional' : 'Greedy within scope';

  return (
    <div>
      <Breadcrumb items={['Pulse AI', 'Scenario planner', 'Budget allocation', 'Review & export']} />
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex-1">
          <h1 className="text-[22px] font-medium text-gray-900">Step 3 — review & export</h1>
          <p className="text-sm text-gray-500 mt-1">{scopeLabel} · {dist} · ranked SKU list ready for export</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Step 3 of 3</span>
          <SecondaryButton icon={ArrowLeft} onClick={() => onNavigate('budget-edit')}>Back to edit</SecondaryButton>
          <SecondaryButton icon={Save}>Save scenario</SecondaryButton>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 my-4">
        <MetricCard
          label="Health score"
          value={
            <span>
              <span className="tabular-nums">{budgetImpact.healthBefore}</span>
              <span className="text-gray-400 font-normal mx-1">→</span>
              <span className="tabular-nums">{Math.round(budgetImpact.healthAfter)}</span>{' '}
              <span className="text-xs text-green-700 font-medium">
                +{Math.round(budgetImpact.healthAfter - budgetImpact.healthBefore)}
              </span>
            </span>
          }
          sub={scope.macsIds.length > 1 ? 'avg across stores' : 'store-level'}
        />
        <MetricCard
          label="Net deployment"
          value={`$${(budgetImpact.netDeployment / 1000).toFixed(1)}K`}
          sub={`$${(budgetImpact.grossDeployment / 1000).toFixed(1)}K gross · $${(budgetImpact.returnsCredit / 1000).toFixed(1)}K credit`}
        />
        <MetricCard
          label="SKUs admitted"
          value={<span><span className="tabular-nums">{budgetImpact.toOrder.toLocaleString()}</span> <span className="text-xs text-gray-500 font-normal">SKUs</span></span>}
          sub="new TO_ORDER from DC"
        />
        <MetricCard
          label="Returns processed"
          value={<span><span className="tabular-nums">{budgetImpact.toReturn.toLocaleString()}</span> <span className="text-xs text-gray-500 font-normal">SKUs</span></span>}
          sub="freed shelf + DC credit"
        />
      </div>

      <div className="px-3.5 py-3 bg-blue-50 border border-blue-200 rounded-md mb-3 flex items-start gap-2.5 text-sm text-blue-900">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-medium">Budget mode:</span> nothing here updates Pulse's canonical recommendations. Output is a scenario-tagged CSV — modeler is responsible for reviewing physical feasibility before placing orders.
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-3">
        <div className="px-3.5 py-2.5 border-b border-gray-200 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">Per-L3 allocation summary</span>
          <span className="text-[11px] text-gray-500">· {allocations.length} leaves · sorted by allocation</span>
        </div>
        <div className="grid gap-2 px-3.5 py-2 bg-gray-50 text-[11px] text-gray-500 uppercase tracking-wider"
          style={{ gridTemplateColumns: '1fr 110px 110px 60px' }}
        >
          <span>L3 leaf</span>
          <span>L1</span>
          <span className="text-right">Allocated</span>
          <span className="text-right">SKUs</span>
        </div>
        {[...allocations].sort((a, b) => b.allocated - a.allocated).slice(0, 8).map(a => (
          <div key={a.id} className="grid gap-2 px-3.5 py-2 border-b border-gray-100 last:border-b-0 text-[13px]"
            style={{ gridTemplateColumns: '1fr 110px 110px 60px' }}
          >
            <span className="text-gray-900 truncate">{a.name}</span>
            <span className="text-gray-500 text-[11px] truncate">{a.l1Name}</span>
            <span className="text-right tabular-nums font-medium text-gray-900">${a.allocated >= 1000 ? `${(a.allocated / 1000).toFixed(1)}K` : Math.round(a.allocated)}</span>
            <span className="text-right tabular-nums text-gray-700">{a.skusAdmitted}</span>
          </div>
        ))}
        {allocations.length > 8 && (
          <div className="px-3.5 py-2 text-[11px] text-gray-500">+ {allocations.length - 8} more leaves</div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3.5 bg-gray-900 rounded-lg mt-3.5">
        <div className="text-white text-xs">
          <div className="font-medium mb-0.5">{budgetImpact.toOrder.toLocaleString()} SKUs · scenario-tagged CSV</div>
          <div className="opacity-70">Columns: SKU number · Store ID · action · DC cost · L3 allocation · scenario name · distribution rule</div>
        </div>
        <button className="text-sm font-medium px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-md flex items-center gap-1.5">
          Export SKUs <Download size={14} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Current Pulse surfaces reconstructed from the supplied reference photos
// ============================================================================

function ScoreBadge({ score }) {
  const tone = score <= 50 ? 'border-red-200 bg-red-50 text-red-800' : score <= 70 ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-green-200 bg-green-50 text-green-800';
  return <span className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-semibold tabular-nums ${tone}`}>{score}</span>;
}

function HealthLegend() {
  return (
    <div className="flex items-center gap-4 text-[11px] text-gray-500">
      <span><i className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1" />Excellent</span>
      <span><i className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />At risk</span>
      <span><i className="inline-block w-2 h-2 rounded-full bg-red-600 mr-1" />Critical</span>
    </div>
  );
}

function StoreHealthScreen({ onNavigate }) {
  const [status, setStatus] = useState('All');
  const [query, setQuery] = useState('');
  const visible = STORES.filter(store => {
    const matchesQuery = `${store.code} ${store.name}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === 'All' || (status === 'Critical' && store.score <= 50) || (status === 'At Risk' && store.score > 50 && store.score <= 70) || (status === 'Excellent' && store.score > 70);
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      <Breadcrumb items={['Assortment overview', 'Store health']} />
      <h1 className="text-[22px] font-medium text-gray-900">Store health</h1>
      <p className="text-sm text-gray-500 mt-1">Cross-store store health &amp; SKU export</p>

      <div className="mt-5 inline-flex rounded-xl border border-gray-200 bg-white p-1">
        <button className="rounded-lg bg-gray-950 text-white px-4 py-2 text-sm flex items-center gap-2"><Home size={14} />Store health</button>
        <button onClick={() => onNavigate('category-l2')} className="rounded-lg px-4 py-2 text-sm text-gray-600 flex items-center gap-2 hover:bg-gray-50"><Package size={14} />Category health</button>
      </div>

      <section className="mt-4 bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between border-b border-gray-100 pb-4">
          <button className="bg-gray-950 text-white rounded-full px-4 py-2 text-xs flex items-center gap-2"><Home size={13} />203 stores selected <ChevronDown size={13} /></button>
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Excellent', 'At Risk', 'Critical'].map(item => (
              <button key={item} onClick={() => setStatus(item)} className={`rounded-full px-4 py-2 text-xs border ${status === item ? 'border-blue-700 text-blue-800 bg-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{item}</button>
            ))}
            <button className="rounded-full px-4 py-2 text-xs border border-gray-200 text-gray-600 flex items-center gap-2">Worst health first <ChevronDown size={13} /></button>
            <button onClick={() => { setStatus('All'); setQuery(''); }} className="text-xs underline text-gray-600 px-2">Clear filters</button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 py-5 border-b border-gray-100">
          {[
            [Home, '195', 'Total stores', 'of 195 in network', 'text-blue-700 bg-blue-50'],
            [Package, '3,223,820', 'Total SKUs', 'Active assortment items', 'text-violet-700 bg-violet-50'],
            [BarChart3, '54', 'Avg health score', 'At risk', 'text-green-700 bg-green-50'],
            [AlertTriangle, '195', 'Stores needing action', '75 critical, 120 at risk', 'text-red-700 bg-red-50'],
          ].map(([Icon, value, label, sub, tone]) => (
            <div key={label} className="flex gap-3 items-center px-3 py-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tone}`}><Icon size={18} /></div>
              <div><div className="text-xl font-semibold tabular-nums">{value}</div><div className="text-xs font-medium">{label}</div><div className="text-[11px] text-gray-500">{sub}</div></div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
            <div><h2 className="text-base font-medium">Stores</h2><p className="text-xs text-gray-500">{visible.length} of 195 stores · <span className="text-blue-700">filtered</span></p></div>
            <div className="flex items-center gap-4"><label className="relative"><Search size={14} className="absolute left-3 top-2.5 text-gray-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search stores" className="pl-8 pr-3 py-2 border border-gray-200 rounded-full text-xs outline-none focus:border-blue-500" /></label><HealthLegend /></div>
          </div>
          <div className="divide-y divide-gray-100">
            {visible.map((store, index) => (
              <button key={store.code} onClick={() => onNavigate('store-detail')} className="w-full grid items-center text-left py-3 px-3 hover:bg-gray-50 rounded-lg" style={{ gridTemplateColumns: '42px minmax(260px, 1fr) 220px 56px 20px' }}>
                <span className="text-sm text-gray-500">{index + 1}</span>
                <span><strong className="block text-sm">{store.code} ({store.name})</strong><span className="text-[11px] text-red-700">Critical &nbsp; {store.skus.toLocaleString()} SKUs &nbsp; {store.notAligned.toLocaleString()} not aligned</span></span>
                <span className="text-[11px] text-gray-500"><i className="text-green-700 not-italic">● {store.excellent}</i> &nbsp; <i className="text-amber-600 not-italic">● {store.atRisk}</i> &nbsp; <i className="text-red-700 not-italic">● {store.critical}</i></span>
                <ScoreBadge score={store.score} />
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function DonutScore({ score = 31, label = 'Critical', misaligned = 69 }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 rounded-full" style={{ background: `conic-gradient(#d72b21 0 ${score}%, #e5e7eb ${score}% 100%)` }}>
        <div className="absolute inset-[17px] bg-white rounded-full flex flex-col items-center justify-center">
          <span className="text-[11px] border border-red-200 bg-red-50 text-red-700 rounded-full px-2 py-0.5">{label}</span>
          <strong className="text-3xl mt-1">{score}</strong><span className="text-xs text-gray-500">out of 100</span>
        </div>
      </div>
      <div className="text-sm font-medium mt-3">{misaligned}% is not aligned</div>
    </div>
  );
}

function StoreDetailScreen({ onNavigate }) {
  const [filter, setFilter] = useState('All');
  const rows = STORE_CATEGORIES.filter(row => filter === 'All' || (filter === 'Critical' && row.score <= 50) || (filter === 'At Risk' && row.score > 50 && row.score <= 70) || (filter === 'Excellent' && row.score > 70));
  return (
    <div>
      <div className="flex justify-between gap-4 items-start">
        <div><Breadcrumb items={['Assortment overview', 'Store health', 'ATL-466']} /><h1 className="text-[22px] font-medium">ATL-466 (FORT GAINES GA)</h1><p className="text-sm text-gray-500 mt-1">Assortment overview</p></div>
        <div className="flex gap-2"><button onClick={() => downloadSkuCsv()} className="bg-blue-700 hover:bg-blue-800 text-white rounded-full px-4 py-2 text-sm flex items-center gap-2"><Download size={15} />Export SKUs <ChevronDown size={14} /></button><button onClick={() => onNavigate('sku-list')} className="border border-blue-700 text-blue-800 rounded-full px-4 py-2 text-sm flex items-center gap-2"><FileText size={15} />Get SKUs list</button></div>
      </div>
      <div className="grid gap-4 mt-5" style={{ gridTemplateColumns: 'minmax(280px,1.1fr) minmax(0,2.4fr)' }}>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 row-span-2"><h2 className="font-medium">Assortment health score <Info size={14} className="inline text-gray-400" /></h2><p className="text-xs text-gray-500">Store ATL-466 (FORT GAINES GA)</p><div className="mt-4"><DonutScore /></div><div className="mt-5 flex justify-between text-xs"><span><i className="inline-block w-2 h-2 rounded-full bg-green-600 mr-2" />Excellent</span><strong>71–100</strong></div><div className="mt-2 flex justify-between text-xs"><span><i className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />At risk</span><strong>51–70</strong></div><div className="mt-2 flex justify-between text-xs"><span><i className="inline-block w-2 h-2 rounded-full bg-red-600 mr-2" />Critical</span><strong>0–50</strong></div></div>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard label="Total SKUs" value="5,379" sub="Active assortment items" />
          <div className="rounded-2xl p-5 bg-green-50 border border-green-100"><div className="text-xs text-gray-600">Aligned SKUs</div><div className="text-2xl font-medium mt-1">1,688</div><div className="text-xs text-gray-500 mt-1">of assortment</div></div>
          <div className="rounded-2xl p-5 bg-red-50 border border-red-100"><div className="text-xs text-gray-600">Not aligned SKUs</div><div className="text-2xl font-medium mt-1">3,691</div><div className="text-xs text-red-700 mt-1">needs action</div></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex justify-between"><h2 className="font-medium">Category health distribution</h2><span className="text-xs text-gray-500">32 categories total</span></div>
          <div className="h-3 rounded-full overflow-hidden flex mt-5"><div className="bg-green-600" style={{ width: '6.25%' }} /><div className="bg-amber-500" style={{ width: '3.125%' }} /><div className="bg-red-600 flex-1" /></div>
          <div className="grid grid-cols-3 gap-3 mt-4"><div className="rounded-xl bg-green-50 border border-green-100 p-4"><strong className="text-xl">2</strong><div className="text-xs">Excellent</div></div><div className="rounded-xl bg-amber-50 border border-amber-100 p-4"><strong className="text-xl">1</strong><div className="text-xs">At risk</div></div><div className="rounded-xl bg-red-50 border border-red-100 p-4"><strong className="text-xl">29</strong><div className="text-xs">Critical</div></div></div>
        </div>
      </div>
      <section className="mt-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-950 to-blue-800 text-white px-5 py-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center"><Route size={20} /></div>
        <div className="flex-1"><div className="flex items-center gap-2"><h2 className="text-sm font-medium">Store execution</h2><span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-blue-100">Draft</span></div><p className="text-xs text-blue-100 mt-1">Sequence this store’s Order and Return recommendations into monthly execution waves, then track the projected health lift.</p></div>
        <div className="hidden xl:flex gap-7 text-xs"><div><span className="block text-blue-200">Actionable</span><strong className="text-lg">3,691</strong></div><div><span className="block text-blue-200">Current score</span><strong className="text-lg">31</strong></div></div>
        <button onClick={() => onNavigate('get-well')} className="rounded-lg bg-white text-blue-950 px-4 py-2.5 text-xs font-semibold flex items-center gap-2">Build execution plan <ArrowRight size={14} /></button>
      </section>
      <section className="mt-5">
        <div className="flex flex-wrap justify-between gap-3 items-end"><div><h2 className="text-lg font-medium">Categories</h2><p className="text-xs text-gray-500">Showing {rows.length} of 32 categories by worst health</p></div><div className="flex gap-2">{['All','Excellent','At Risk','Critical'].map(x => <button key={x} onClick={() => setFilter(x)} className={`rounded-full border px-4 py-2 text-xs ${filter === x ? 'border-blue-700 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-600'}`}>{x}</button>)}</div></div>
        <div className="bg-white border border-gray-200 rounded-2xl mt-3 divide-y divide-gray-100 overflow-hidden">{rows.map((row, i) => <button key={row.name} onClick={() => onNavigate(row.name === 'Body & Accessories' ? 'category-l2' : 'store-detail')} className="w-full grid items-center text-left px-5 py-3 hover:bg-gray-50" style={{ gridTemplateColumns: '42px 1fr 56px 20px' }}><span className="text-sm text-gray-500">{i + 1}</span><span><strong className="text-sm block">{row.name}</strong><span className="text-[11px] text-gray-500">{row.current} current · <i className="not-italic text-red-700">{row.notAligned} not aligned</i></span></span><ScoreBadge score={row.score} /><ChevronRight size={16} className="text-gray-400" /></button>)}</div>
      </section>
    </div>
  );
}

function HealthBars({ rows }) {
  return <div className="h-72 flex flex-col justify-end gap-3 px-2 pb-6 border-b border-l border-gray-300 mt-5">{rows.map(row => <div key={row.name} className="flex items-center gap-3"><span className="w-32 text-[10px] text-gray-500 text-right truncate">{row.name.replace(/ L\d-.*/, '')}</span><div className="h-4 bg-red-600 rounded-r" style={{ width: `${Math.max(2, row.score * 2.6)}px` }} /></div>)}</div>;
}

function CategoryHealthScreen({ level, onNavigate }) {
  const isL2 = level === 'l2';
  const isL3 = level === 'l3';
  const rows = CATEGORY_LEVELS[level];
  const title = isL2 ? 'Body & Accessories L1-2' : isL3 ? 'Interior L2-10' : 'Hardware & Components L3-2';
  const parent = isL2 ? 'ATL-466 (FORT GAINES GA)' : isL3 ? 'Body & Accessories' : 'Interior';
  const metrics = isL2 ? [19,96,19,77,'19.8','80.2'] : isL3 ? [9,31,3,28,'9.7','90.3'] : [0,3,0,3,'0.0','100.0'];
  const next = isL2 ? 'category-l3' : isL3 ? 'category-l4' : 'sku-list';
  return (
    <div>
      <div className="flex justify-between gap-4 items-start"><div><Breadcrumb items={['Assortment overview','Store health','ATL-466',...(isL2 ? [] : ['Body & Accessories L1-2']),...(level === 'l4' ? ['Interior L2-10'] : [])]} /><h1 className="text-[22px] font-medium">{title}</h1><p className="text-sm text-gray-500 mt-1">{parent}</p></div><div className="flex gap-2"><button onClick={() => downloadSkuCsv()} className="bg-blue-700 text-white rounded-full px-4 py-2 text-sm flex items-center gap-2"><Download size={15} />Export SKUs <ChevronDown size={14} /></button><button onClick={() => onNavigate('sku-list')} className="border border-blue-700 text-blue-800 rounded-full px-4 py-2 text-sm flex items-center gap-2"><FileText size={15} />Get SKUs list</button></div></div>
      <div className="grid grid-cols-4 gap-4 mt-5">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5"><div className="text-[11px] font-medium uppercase text-gray-600">Health score</div><strong className="text-3xl block mt-1">{metrics[0]}</strong><span className="text-xs text-red-700">Critical</span></div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5"><div className="text-[11px] font-medium uppercase text-gray-600">Current assortment</div><strong className="text-3xl block mt-1">{metrics[1]}</strong><span className="text-xs text-gray-600">SKUs in stock</span></div>
        <div className="rounded-2xl border border-green-100 bg-green-50 p-5"><div className="text-[11px] font-medium uppercase text-gray-600">Aligned SKUs</div><strong className="text-3xl block mt-1">{metrics[2]}</strong><span className="text-xs text-gray-600">{metrics[4]}% of assortment</span></div>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5"><div className="text-[11px] font-medium uppercase text-gray-600">Not aligned SKUs</div><strong className="text-3xl block mt-1">{metrics[3]}</strong><span className="text-xs text-red-700">{metrics[5]}% needs action</span></div>
      </div>
      <section className="mt-5 bg-white border border-gray-200 rounded-2xl grid gap-8 p-5" style={{ gridTemplateColumns: 'minmax(300px, .9fr) minmax(420px, 1.4fr)' }}>
        <div><div className="flex justify-between"><div><h2 className="font-medium">Health by subcategory</h2><p className="text-[11px] text-gray-500">Top {rows.length} shown</p></div><span className="h-fit rounded-full bg-red-50 border border-red-200 text-red-700 px-3 py-1 text-xs">Critical</span></div><HealthBars rows={rows} /><div className="mt-4"><HealthLegend /></div></div>
        <div><div className="flex justify-between items-start"><div><h2 className="font-medium">{level === 'l4' ? 'Level 4 categories' : 'Subcategories'} ({rows.length})</h2><p className="text-[11px] text-gray-500">{level === 'l4' ? 'Lowest hierarchy level' : 'Click a row to view the next level'}</p></div><button className="rounded-full border border-gray-200 px-4 py-2 text-xs flex gap-2 items-center">Score: low to high <ArrowDownUp size={13} /></button></div><div className="divide-y divide-gray-100 mt-4 max-h-[360px] overflow-auto">{rows.map((row,i) => <button key={row.name} onClick={() => onNavigate(next)} className="w-full grid items-center text-left py-3 px-2 hover:bg-gray-50 rounded" style={{ gridTemplateColumns: '34px 1fr 20px 50px' }}><span className="text-xs text-gray-500">{i+1}</span><span><strong className="text-sm block">{row.name}</strong><span className="text-[11px] text-gray-500">{row.current} current · <i className="not-italic text-red-700">{row.notAligned} not aligned</i></span></span><ChevronRight size={15} className="text-gray-400" /><ScoreBadge score={row.score} /></button>)}</div></div>
      </section>
    </div>
  );
}

function SkuListScreen({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [action, setAction] = useState('All actions');
  const rows = CURRENT_SKUS.filter(row => `${row.part} ${row.description} ${row.brand}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <Breadcrumb items={['Assortment overview','ATL-466','Hardware & Components L3-2','SKU list']} />
      <h1 className="text-[22px] font-medium">SKU list</h1><p className="text-sm text-gray-500 mt-1">Explore and review SKUs across your stores</p>
      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 flex gap-4"><div className="w-10 h-10 rounded-xl bg-white text-blue-700 flex items-center justify-center"><Package size={19} /></div><div className="flex-1"><div className="flex justify-between"><strong className="text-sm">{rows.length} recommended SKUs</strong><button onClick={() => { setQuery(''); setAction('All actions'); }} className="text-xs text-gray-600 underline">Clear selection</button></div><p className="text-xs text-gray-600 mt-1">These SKUs are ranked by their impact on inventory health. Review the system-recommended items, then export the list for ordering, returns, or keeping inventory.</p><div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-2 text-gray-600"><span><i className="text-blue-600 not-italic">●</i> Store: ATL-466 (FORT GAINES GA)</span><span><i className="text-blue-600 not-italic">●</i> Category: Body &amp; Accessories</span><span><i className="text-blue-600 not-italic">●</i> Brand: All brands</span><button onClick={() => setAction(action === 'All actions' ? 'Order' : 'All actions')}><i className="text-blue-600 not-italic">●</i> Action: {action} <ChevronDown size={12} className="inline" /></button></div></div></div>
      <div className="mt-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 flex items-center gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center"><ClipboardList size={19} /></div>
        <div className="flex-1"><div className="text-sm font-medium">Move from recommendations to execution</div><p className="text-xs text-gray-500 mt-1">Pair the highest-ranked missing products with the lowest-ranked products you hold, then schedule the actions around DC capacity.</p></div>
        <button onClick={() => onNavigate('store-detail')} className="rounded-lg bg-gray-950 hover:bg-black text-white px-4 py-2.5 text-xs font-medium flex items-center gap-2">Open store execution plan <ArrowRight size={14} /></button>
      </div>
      <section className="mt-4 bg-white border border-gray-200 rounded-2xl p-4 overflow-hidden"><label className="relative inline-block mb-4"><Search size={15} className="absolute left-3 top-2.5 text-gray-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" className="w-72 pl-9 pr-3 py-2 border border-gray-200 rounded-full text-sm outline-none focus:border-blue-500" /></label><div className="overflow-auto"><table className="w-full text-xs min-w-[1000px]"><thead className="bg-gray-100 text-gray-600"><tr>{['Rank','Part number','Part description','Field abbr.','Store ID','Category L1','Category L2','Category L3','Category L4','Status'].map(h => <th key={h} className="text-left font-medium px-3 py-3 whitespace-nowrap">{h} ↓</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{rows.map(row => <tr key={row.rank} className="hover:bg-gray-50"><td className="px-3 py-3 font-medium">{row.rank}</td><td className="px-3 py-3">{row.part}</td><td className="px-3 py-3 font-medium">{row.description}</td><td className="px-3 py-3">{row.brand}</td><td className="px-3 py-3">ATL-466<br /><span className="text-gray-500">(FORT GAINES GA)</span></td><td className="px-3 py-3">Body &amp; Accessories</td><td className="px-3 py-3">Interior</td><td className="px-3 py-3">Hardware &amp; Components</td><td className="px-3 py-3">{row.l4}</td><td className="px-3 py-3"><span className="rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1">• {row.status}</span></td></tr>)}</tbody></table></div></section>
      <div className="sticky bottom-4 mx-auto mt-4 max-w-md bg-blue-800 text-white rounded-2xl px-5 py-3 flex justify-between items-center shadow-lg"><div><strong className="text-sm">{rows.length} SKUs</strong><p className="text-[11px] text-blue-100">CSV: SKU number + Store ID</p></div><button onClick={() => downloadSkuCsv(rows)} className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm flex items-center gap-2"><Download size={15} />Export SKUs</button></div>
    </div>
  );
}

const WAVE_ORDERS = [
  { rank: '#1', part: 'SP-100428', name: 'Iridium spark plug', brand: 'NGK', reason: 'Highest-ranked missing product' },
  { rank: '#2', part: 'FL-88210', name: 'Premium oil filter', brand: 'NAPA Gold', reason: 'Strong local demand fit' },
  { rank: '#3', part: 'BP-44012', name: 'Ceramic brake pad set', brand: 'Adaptive One', reason: 'High velocity, currently missing' },
  { rank: '#4', part: 'WB-22018', name: 'All-season wiper blade', brand: 'Trico', reason: 'Service-level opportunity' },
];

const WAVE_RETURNS = [
  { rank: '#48,210', part: 'SP-731990', name: 'Copper spark plug', brand: 'Brembo', reason: 'Lowest-ranked product held' },
  { rank: '#48,209', part: 'EL-10492', name: 'Legacy relay kit', brand: 'Echlin', reason: 'Low demand and excess stock' },
  { rank: '#48,208', part: 'AC-00918', name: 'Universal phone holder', brand: 'Balkamp', reason: 'Low velocity in this market' },
  { rank: '#48,207', part: 'LT-67220', name: 'Halogen lamp twin pack', brand: 'NightVision', reason: 'Better-ranked substitute available' },
];

function exportWaveCsv(type, wave) {
  const source = type === 'Order' ? WAVE_ORDERS : WAVE_RETURNS;
  const header = ['Wave', 'Action', 'Rank', 'Part number', 'Description', 'Brand', 'Store', 'Reason'];
  const rows = source.map(item => [wave.number, type, item.rank, item.part, item.name, item.brand, 'ATL-050', item.reason]);
  const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `ATL-050-wave-${wave.number}-${type.toLowerCase()}s.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function GetWellPlanScreen({ onNavigate }) {
  const [capacity, setCapacity] = useState(10000);
  const [selectedWave, setSelectedWave] = useState(0);
  const [launched, setLaunched] = useState(false);
  const [completedWaves, setCompletedWaves] = useState(0);
  const [refreshLabel, setRefreshLabel] = useState('Today, 6:00 AM');
  const backlog = 30000;
  const assortment = 42000;
  const alignedToday = 12000;
  const safeCapacity = Math.max(1000, Math.min(30000, Number(capacity) || 10000));
  const monthLabels = ['Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027', 'Apr 2027'];
  const waveCount = Math.ceil(backlog / safeCapacity);
  const waves = Array.from({ length: waveCount }, (_, index) => {
    const alreadyAddressed = index * safeCapacity;
    const size = Math.min(safeCapacity, backlog - alreadyAddressed);
    const alignedBefore = alignedToday + alreadyAddressed;
    const alignedAfter = alignedBefore + size;
    return {
      number: index + 1,
      month: monthLabels[index] || `Month ${index + 1}`,
      size,
      before: Math.round((alignedBefore / assortment) * 100),
      after: Math.round((alignedAfter / assortment) * 100),
      alignedAfter,
      remaining: Math.max(0, backlog - alreadyAddressed - size),
    };
  });
  const activeWave = waves[Math.min(selectedWave, waves.length - 1)];
  const planProgress = Math.round((Math.min(completedWaves, waveCount) / waveCount) * 100);

  function handleCapacityChange(value) {
    setCapacity(value);
    setSelectedWave(0);
    setLaunched(false);
    setCompletedWaves(0);
  }

  function completeCurrentWave() {
    const nextCompleted = Math.min(waveCount, completedWaves + 1);
    setCompletedWaves(nextCompleted);
    setLaunched(false);
    setSelectedWave(Math.min(nextCompleted, waveCount - 1));
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div><Breadcrumb items={['Pulse AI', 'Store execution', 'ATL-050']} /><div className="flex items-center gap-2"><h1 className="text-[22px] font-medium">ATL-050 store execution</h1><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${launched || completedWaves > 0 ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>{launched || completedWaves > 0 ? 'In progress' : 'Draft'}</span></div><p className="text-sm text-gray-500 mt-1">Turn the best Orders and worst Returns into a capacity-aware path to assortment health.</p></div>
        <div className="flex items-center gap-2"><button onClick={() => setRefreshLabel('Just now')} className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-600 flex items-center gap-2"><RefreshCw size={13} />Recommendations updated {refreshLabel}</button>{launched ? <button onClick={completeCurrentWave} className="rounded-full bg-green-700 hover:bg-green-800 text-white px-4 py-2 text-sm font-medium flex items-center gap-2"><CircleCheckBig size={15} />Mark wave {completedWaves + 1} complete</button> : completedWaves < waveCount && <button onClick={() => { setLaunched(true); setSelectedWave(completedWaves); }} className="rounded-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-sm font-medium flex items-center gap-2"><PlayCircle size={15} />Launch wave {completedWaves + 1}</button>}</div>
      </div>

      <div className="mt-5 bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div className="grid items-center" style={{ gridTemplateColumns: '1fr 54px 1fr 54px 1fr' }}>
          <button onClick={() => onNavigate('planner-door')} className="text-left flex items-center gap-3"><span className="w-9 h-9 rounded-full bg-green-50 text-green-700 flex items-center justify-center"><Check size={16} /></span><span><strong className="text-xs block">1 · Strategy</strong><small className="text-[11px] text-gray-500">ATL-050 assortment strategy</small></span></button>
          <div className="h-px bg-green-200" />
          <button onClick={() => onNavigate('sku-list')} className="text-left flex items-center gap-3"><span className="w-9 h-9 rounded-full bg-green-50 text-green-700 flex items-center justify-center"><Check size={16} /></span><span><strong className="text-xs block">2 · Recommendations</strong><small className="text-[11px] text-gray-500">30,000 matched swaps</small></span></button>
          <div className="h-px bg-blue-300" />
          <div className="flex items-center gap-3"><span className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center"><Route size={16} /></span><span><strong className="text-xs block">3 · Execution</strong><small className="text-[11px] text-gray-500">Monthly capacity waves</small></span></div>
        </div>
      </div>

      <section className="mt-4 rounded-2xl bg-blue-950 text-white px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Beaker size={18} /></div><div className="flex-1"><div className="text-xs text-blue-200">Strategy source</div><div className="text-sm font-medium mt-0.5">ATL-050 Q4 assortment strategy · 4 active rules</div><p className="text-[11px] text-blue-200 mt-1">Includes: deprioritize Brembo in Spark Plugs. Strategy changes flow into future recommendations, never an active wave.</p></div><button onClick={() => onNavigate('planner-door')} className="rounded-lg border border-white/20 px-3.5 py-2 text-xs flex items-center gap-2">View strategy <CircleArrowOutUpRight size={13} /></button>
      </section>

      <div className="grid grid-cols-4 gap-3 mt-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4"><div className="flex justify-between"><span className="text-xs text-gray-500">Health journey</span><TrendingUp size={16} className="text-green-700" /></div><div className="mt-2 flex items-end gap-2"><strong className="text-2xl">29</strong><ArrowRight size={16} className="text-gray-400 mb-1.5" /><strong className="text-2xl text-green-700">100</strong></div><div className="text-[11px] text-gray-500 mt-1">Projected after {waveCount} waves</div></div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4"><div className="flex justify-between"><span className="text-xs text-gray-500">Products aligned today</span><CheckCircle2 size={16} className="text-blue-700" /></div><strong className="text-2xl block mt-2">12,000</strong><div className="text-[11px] text-gray-500 mt-1">of 42,000 in assortment</div></div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4"><div className="flex justify-between"><span className="text-xs text-gray-500">Actionable swaps</span><ArrowDownUp size={16} className="text-violet-700" /></div><strong className="text-2xl block mt-2">30,000</strong><div className="text-[11px] text-gray-500 mt-1">30,000 Orders + 30,000 Returns</div></div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4"><div className="flex justify-between"><span className="text-xs text-gray-500">Estimated completion</span><CalendarDays size={16} className="text-amber-700" /></div><strong className="text-2xl block mt-2">{waves[waveCount - 1]?.month}</strong><div className="text-[11px] text-gray-500 mt-1">At {safeCapacity.toLocaleString()} swaps per month</div></div>
      </div>

      <section className="mt-4 bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4"><div><h2 className="font-medium">Recovery plan</h2><p className="text-xs text-gray-500 mt-1">Current wave stays stable. Pulse re-ranks every future wave as recommendations change.</p></div><label className="text-xs text-gray-500">Monthly replacement capacity<div className="mt-1 flex items-center rounded-lg border border-gray-200 bg-gray-50 overflow-hidden"><input aria-label="Monthly replacement capacity" value={capacity} onChange={event => handleCapacityChange(event.target.value)} type="number" min="1000" max="30000" step="1000" className="w-28 bg-transparent px-3 py-2 text-sm font-medium text-gray-900 outline-none" /><span className="pr-3 text-[11px]">swaps</span></div></label></div>
        <div className="mt-5 grid items-end gap-2" style={{ gridTemplateColumns: `repeat(${waveCount + 1}, minmax(90px, 1fr))` }}>
          <div className="text-center"><div className="h-16 rounded-t-lg bg-gray-100 border border-gray-200 flex items-end justify-center pb-2 text-sm font-semibold">29</div><div className="mt-2 text-[11px] font-medium">Today</div><div className="text-[10px] text-gray-500">12K aligned</div></div>
          {waves.map((wave, index) => {
            const complete = index < completedWaves;
            const inProgress = index === completedWaves && launched;
            const selected = selectedWave === index;
            return <button key={wave.number} onClick={() => setSelectedWave(index)} className={`text-center rounded-xl px-1.5 pt-2 pb-2 border transition-colors ${selected ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:border-gray-200'}`}><div className={`rounded-t-lg flex items-end justify-center pb-2 text-sm font-semibold ${complete ? 'bg-green-600 text-white' : inProgress ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-900'}`} style={{ height: `${52 + wave.after * 0.75}px` }}>{wave.after}</div><div className="mt-2 text-[11px] font-medium">Wave {wave.number}</div><div className="text-[10px] text-gray-500">{complete ? 'Completed' : inProgress ? 'In progress' : wave.month}</div></button>;
          })}
        </div>
        <div className="mt-4 flex justify-between items-center"><div className="text-[11px] text-gray-500">Plan progress · {completedWaves} of {waveCount} waves complete</div><div className="w-48 h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-green-600 rounded-full transition-all" style={{ width: `${planProgress}%` }} /></div></div>
      </section>

      <section className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><div><div className="flex items-center gap-2"><h2 className="font-medium">Wave {activeWave.number} · {activeWave.month}</h2>{selectedWave === completedWaves && launched && <span className="rounded-full bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 text-[10px]">Locked · in progress</span>}</div><p className="text-xs text-gray-500 mt-1">The highest-value paired actions available when this wave was generated.</p></div><div className="flex items-center gap-5 text-xs"><span><strong className="text-base block">{activeWave.before} → <i className="not-italic text-green-700">{activeWave.after}</i></strong><small className="text-gray-500">Health score</small></span><span><strong className="text-base block">+{activeWave.size.toLocaleString()}</strong><small className="text-gray-500">Newly aligned</small></span><span><strong className="text-base block">{activeWave.remaining.toLocaleString()}</strong><small className="text-gray-500">Remaining</small></span></div></div>
        <div className="grid grid-cols-2 divide-x divide-gray-100">
          <div><div className="px-5 py-3 bg-green-50 flex items-center justify-between"><div><strong className="text-sm text-green-900">Bring in · {activeWave.size.toLocaleString()} Orders</strong><p className="text-[11px] text-green-800 mt-0.5">Best missing products, ranked highest first</p></div><button onClick={() => exportWaveCsv('Order', activeWave)} className="rounded-lg border border-green-200 bg-white px-3 py-2 text-xs text-green-800 flex gap-1.5 items-center"><Download size={13} />Order file</button></div><div className="divide-y divide-gray-100">{WAVE_ORDERS.map(item => <div key={item.part} className="px-5 py-3 grid gap-3" style={{ gridTemplateColumns: '58px 1fr' }}><span className="text-xs font-semibold text-green-700">{item.rank}</span><div><div className="text-xs font-medium">{item.name} <span className="font-normal text-gray-400">· {item.part}</span></div><div className="text-[11px] text-gray-500 mt-0.5">{item.brand} · {item.reason}</div></div></div>)}</div><div className="px-5 py-3 text-[11px] text-gray-500 bg-gray-50">+ {(activeWave.size - WAVE_ORDERS.length).toLocaleString()} more Orders in this wave</div></div>
          <div><div className="px-5 py-3 bg-red-50 flex items-center justify-between"><div><strong className="text-sm text-red-900">Move out · {activeWave.size.toLocaleString()} Returns</strong><p className="text-[11px] text-red-800 mt-0.5">Worst products held, ranked lowest first</p></div><button onClick={() => exportWaveCsv('Return', activeWave)} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-red-800 flex gap-1.5 items-center"><Download size={13} />Return file</button></div><div className="divide-y divide-gray-100">{WAVE_RETURNS.map(item => <div key={item.part} className="px-5 py-3 grid gap-3" style={{ gridTemplateColumns: '58px 1fr' }}><span className="text-xs font-semibold text-red-700">{item.rank}</span><div><div className="text-xs font-medium">{item.name} <span className="font-normal text-gray-400">· {item.part}</span></div><div className="text-[11px] text-gray-500 mt-0.5">{item.brand} · {item.reason}</div></div></div>)}</div><div className="px-5 py-3 text-[11px] text-gray-500 bg-gray-50">+ {(activeWave.size - WAVE_RETURNS.length).toLocaleString()} more Returns in this wave</div></div>
        </div>
      </section>

      <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3"><Clock3 size={16} className="text-amber-700 mt-0.5" /><div><div className="text-xs font-medium text-amber-950">How daily recommendations behave</div><p className="text-[11px] text-amber-900 mt-1 leading-relaxed">Launching a wave freezes its SKU actions for execution. Completed work is preserved. Only unlaunched waves are rebuilt from the newest Pulse rankings and active Scenario Planner strategy, so the plan stays current without moving the operational goalposts.</p></div></div>
    </div>
  );
}

const ENABLEMENT_STORES = [
  { id: 'ATL-050', name: 'DOWNTOWN ATLANTA', score: 29, target: 100, actions: 30000, capacity: 10000, waves: 3, status: 'Ready for review' },
  { id: 'ATL-466', name: 'FORT GAINES GA', score: 31, target: 88, actions: 3691, capacity: 1200, waves: 4, status: 'Wave 1 active' },
  { id: 'ATL-328', name: 'WASHINGTON GA', score: 28, target: 91, actions: 4362, capacity: 1500, waves: 3, status: 'Plan refreshed' },
  { id: 'ATL-191', name: 'EATONTON, GA', score: 31, target: 90, actions: 9061, capacity: 3000, waves: 4, status: 'Needs review' },
  { id: 'ATL-130', name: 'GSE IBS', score: 33, target: 94, actions: 600, capacity: 300, waves: 2, status: 'Ready to launch' },
  { id: 'ATL-330', name: 'BEASLEY AUTO PARTS', score: 34, target: 89, actions: 8380, capacity: 2500, waves: 4, status: 'Not enabled' },
  { id: 'ATL-440', name: 'ARLINGTON GA', score: 34, target: 92, actions: 6124, capacity: 2000, waves: 4, status: 'Not enabled' },
  { id: 'ATL-229', name: 'MARIETTA EAST', score: 38, target: 93, actions: 5440, capacity: 1800, waves: 4, status: 'Not enabled' },
];

function StoreWorkspaceScreen({ onNavigate }) {
  const [view, setView] = useState('plan');
  const [selectedWave, setSelectedWave] = useState(0);
  const [capacity, setCapacity] = useState(10000);
  const [workerOn, setWorkerOn] = useState(true);
  const [waveStatus, setWaveStatus] = useState('Ready for review');
  const [editing, setEditing] = useState(false);
  const waves = [
    { month: 'September', score: 52, orders: 10000, returns: 10000, aligned: 22000, remaining: 20000, color: 'bg-[#e7e3c4]', accent: 'bg-[#b4a35a]' },
    { month: 'October', score: 76, orders: 10000, returns: 10000, aligned: 32000, remaining: 10000, color: 'bg-[#dfe8d4]', accent: 'bg-[#8aaa72]' },
    { month: 'November', score: 100, orders: 10000, returns: 10000, aligned: 42000, remaining: 0, color: 'bg-[#d9e7ed]', accent: 'bg-[#76a9bd]' },
  ];
  const wave = waves[selectedWave];

  return (
    <div className="diskbuddy-surface -m-6 min-h-screen bg-[#f7f3e8] text-[#201f1c]">
      <div className="h-14 border-b border-[#ded8ca] px-6 flex items-center justify-between bg-[#faf7ef]">
        <div className="flex items-center gap-2"><button onClick={() => onNavigate('health')} className="rounded-lg border border-[#d8d1c2] bg-white/60 px-3 py-1.5 text-xs">Store health</button><ChevronRight size={13} className="text-[#9a9488]" /><strong className="text-sm">ATL-050</strong></div>
        <div className="flex items-center gap-2"><label className="relative"><Search size={14} className="absolute left-3 top-2.5 text-[#8b857a]" /><input className="w-56 rounded-full border border-[#d8d1c2] bg-white/60 py-2 pl-9 pr-3 text-xs outline-none" placeholder="Search this store..." /></label><button className="w-8 h-8 rounded-lg border border-[#d8d1c2] bg-white/60 flex items-center justify-center"><MoreHorizontal size={15} /></button></div>
      </div>

      <div className="px-6 pt-5 pb-4 border-b border-[#ded8ca]">
        <div className="flex items-end justify-between gap-4"><div><div className="flex items-center gap-3"><h1 className="text-3xl font-semibold tracking-[-0.035em]">ATL-050</h1><span className="text-sm text-[#736e64]">Downtown Atlanta</span></div><p className="text-xs text-[#827c71] mt-1">42,000 products · 30,000 actionable · DC ATL</p></div><div className="inline-flex rounded-full border border-[#d7d0c0] bg-white/50 p-1">{[['overview','Overview'],['categories','Category health'],['plan','Store execution']].map(([id,label]) => <button key={id} onClick={() => setView(id)} className={`rounded-full px-4 py-2 text-xs font-medium ${view === id ? 'bg-[#1f1d19] text-white shadow-sm' : 'text-[#625d54] hover:bg-white/60'}`}>{label}</button>)}</div></div>
      </div>

      {view !== 'plan' ? (
        <div className="p-6 grid grid-cols-3 gap-4"><div className="rounded-2xl border border-[#d9d2c3] bg-white/55 p-5"><div className="text-xs uppercase tracking-wider text-[#898275]">Health score</div><strong className="text-5xl block mt-5">29</strong><span className="text-xs text-red-700">Critical · 71% not aligned</span></div><div className="col-span-2 rounded-2xl border border-[#d9d2c3] bg-white/55 p-5"><h2 className="font-semibold">{view === 'overview' ? 'Assortment snapshot' : 'Category health'}</h2><div className="mt-5 space-y-3">{STORE_CATEGORIES.slice(0,5).map(row => <div key={row.name} className="grid grid-cols-[180px_1fr_45px] items-center gap-3 text-xs"><span>{row.name}</span><div className="h-2 rounded-full bg-[#e9e3d7] overflow-hidden"><div className="h-full bg-[#d9917b]" style={{ width: `${Math.max(5,row.score)}%` }} /></div><strong>{row.score}</strong></div>)}</div></div></div>
      ) : (
        <div className="grid min-h-[700px]" style={{ gridTemplateColumns: '235px minmax(560px,1fr) 310px' }}>
          <aside className="border-r border-[#ded8ca] p-5 bg-[#faf7ef]/60">
            <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#8d8678]">Store health</div>
            <div className="mt-4 flex items-center gap-3"><div className="w-20 h-20 rounded-full p-2" style={{ background: 'conic-gradient(#bd3f35 0 29%, #e5dfd3 29% 100%)' }}><div className="w-full h-full rounded-full bg-[#faf7ef] flex items-center justify-center text-xl font-semibold">29</div></div><div><div className="text-xs text-red-700 font-medium">Critical</div><div className="text-[11px] text-[#777165] mt-1">12,000 aligned</div><div className="text-[11px] text-[#777165]">30,000 not aligned</div></div></div>
            <div className="mt-6 pt-5 border-t border-[#ded8ca]"><div className="flex justify-between items-center"><div><div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#8d8678]">Digital worker</div><div className="text-sm font-semibold mt-1">Execution worker</div></div><button onClick={() => setWorkerOn(!workerOn)} className={`w-11 h-6 rounded-full p-0.5 transition-colors ${workerOn ? 'bg-[#1f1d19]' : 'bg-[#d4cec1]'}`}><span className={`block w-5 h-5 rounded-full bg-white transition-transform ${workerOn ? 'translate-x-5' : ''}`} /></button></div><div className={`mt-3 rounded-xl border px-3 py-2.5 text-[11px] ${workerOn ? 'border-[#cbd9c2] bg-[#edf3e8] text-[#3f6335]' : 'border-[#ddd6c9] bg-white/40 text-[#817a6f]'}`}>{workerOn ? 'On · Watching daily rankings' : 'Paused · Plan will not refresh'}</div></div>
            <div className="mt-6"><div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#8d8678]">Plan settings</div><dl className="mt-3 space-y-3 text-xs"><div className="flex justify-between"><dt className="text-[#777165]">Monthly capacity</dt><dd className="font-semibold">{Number(capacity).toLocaleString()}</dd></div><div className="flex justify-between"><dt className="text-[#777165]">Cadence</dt><dd className="font-semibold">Monthly</dd></div><div className="flex justify-between"><dt className="text-[#777165]">Strategy</dt><dd className="font-semibold">Q4 mix</dd></div><div className="flex justify-between"><dt className="text-[#777165]">Estimated finish</dt><dd className="font-semibold">Nov 2026</dd></div></dl><button onClick={() => setEditing(!editing)} className="mt-4 w-full rounded-lg border border-[#d7d0c0] bg-white/55 px-3 py-2 text-xs flex items-center justify-center gap-2"><PencilLine size={13} />Edit plan</button>{editing && <div className="mt-2 rounded-xl border border-[#d7d0c0] bg-white/70 p-3"><label className="text-[10px] text-[#777165]">Replacement capacity<input type="number" value={capacity} onChange={event => setCapacity(event.target.value)} className="mt-1 w-full rounded-lg border border-[#d7d0c0] bg-white px-3 py-2 text-xs" /></label></div>}</div>
          </aside>

          <main className="p-6">
            <div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold tracking-[-0.025em]">Store execution journey</h2><p className="text-xs text-[#7d776c] mt-1">Review the monthly waves and their projected health impact.</p></div><div className="inline-flex items-center gap-2 rounded-full border border-[#d7d0c0] bg-white/55 px-3 py-1.5 text-[11px]"><Sparkles size={13} className="text-[#a37722]" />Refreshed today at 6:00 AM</div></div>
            <div className="mt-6 rounded-2xl border border-[#d8d1c2] bg-white/45 p-5"><div className="flex items-center justify-between"><div><span className="text-[10px] uppercase tracking-[0.14em] text-[#8b8478]">Projected recovery</span><div className="mt-2 flex items-end gap-2"><strong className="text-4xl">29</strong><ArrowRight size={18} className="mb-2 text-[#aaa294]" /><strong className="text-4xl text-[#527b48]">100</strong></div></div><div className="text-right"><div className="text-xs font-semibold">3 waves · 30,000 swaps</div><div className="text-[11px] text-[#7c756a] mt-1">10,000 Orders + 10,000 Returns per month</div></div></div><div className="mt-5 h-2 rounded-full bg-[#e6e0d4] overflow-hidden flex"><div className="bg-[#c47f69] w-[29%]" /><div className="bg-[#cfbd71] w-[23%]" /><div className="bg-[#88a97b] w-[24%]" /><div className="bg-[#6c9bad] flex-1" /></div><div className="mt-2 flex justify-between text-[10px] text-[#8a8377]"><span>Today</span><span>Wave 1 · 52</span><span>Wave 2 · 76</span><span>Wave 3 · 100</span></div></div>
            <div className="mt-6 flex items-center justify-between"><h3 className="font-semibold">Monthly waves <span className="ml-1 text-xs font-normal text-[#888174]">3</span></h3><div className="inline-flex rounded-lg border border-[#d8d1c2] bg-white/45 p-1"><button className="rounded-md bg-[#1f1d19] text-white px-3 py-1.5 text-[11px]">Folders</button><button className="rounded-md px-3 py-1.5 text-[11px] text-[#726c61]">Timeline</button></div></div>
            <div className="mt-4 grid grid-cols-3 gap-4">{waves.map((item,index) => <button key={item.month} onClick={() => setSelectedWave(index)} className={`relative mt-4 min-h-44 rounded-2xl rounded-tl-md border p-4 text-left transition-all ${item.color} ${selectedWave === index ? 'border-[#302d28] shadow-[0_14px_30px_-22px_rgba(31,29,25,.65)] -translate-y-0.5' : 'border-[#d4ccbd] hover:-translate-y-0.5'}`}><span className={`absolute -top-4 left-0 h-5 w-24 rounded-t-xl border border-b-0 border-[#d4ccbd] ${item.color}`} /><div className="flex justify-between"><span className="text-[10px] uppercase tracking-[0.12em] text-[#6f695f]">Wave {index+1}</span><span className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-[#c09a36]' : 'bg-[#aaa396]'}`} /></div><div className="mt-5 text-base font-semibold">{item.month}</div><div className="mt-6 pt-3 border-t border-black/10 flex justify-between items-end"><div><div className="flex gap-1.5 text-[10px] text-[#6f695f]"><span className="w-2 h-2 rounded-full bg-[#79a06c] mt-0.5" />10K in</div><div className="flex gap-1.5 text-[10px] text-[#6f695f] mt-1"><span className="w-2 h-2 rounded-full bg-[#c87366] mt-0.5" />10K out</div></div><div className="text-right"><strong className="text-2xl">{item.score}</strong><div className="text-[10px] text-[#6f695f]">health</div></div></div></button>)}</div>
            <div className="mt-6 rounded-2xl border border-[#d8d1c2] bg-white/45 p-4 flex items-center gap-3"><Bot size={18} /><div className="flex-1"><div className="text-xs font-semibold">How this worker thinks</div><p className="text-[11px] text-[#777165] mt-1">It pairs the highest-ranked missing products with the lowest-ranked products held. Active work stays fixed; future folders rebuild when rankings or strategy change.</p></div><button className="text-xs underline">View logic</button></div>
          </main>

          <aside className="border-l border-[#ded8ca] p-5 bg-[#faf7ef]/70">
            <div className="flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#8d8678]">Selected</div><h3 className="text-lg font-semibold mt-1">Wave {selectedWave+1}</h3></div><span className="rounded-full border border-[#dacb9c] bg-[#f4ecd1] px-2.5 py-1 text-[10px] text-[#755c18]">{waveStatus}</span></div><div className="mt-1 text-xs text-[#7b7469]">{wave.month} 2026</div>
            <div className="mt-5 rounded-2xl border border-[#d8d1c2] bg-white/60 p-4"><div className="text-[10px] uppercase tracking-[0.14em] text-[#8b8478]">Expected impact</div><div className="mt-3 flex items-end gap-2"><strong className="text-3xl">{selectedWave === 0 ? 29 : waves[selectedWave-1].score}</strong><ArrowRight size={15} className="mb-1.5 text-[#aaa294]" /><strong className="text-3xl text-[#527b48]">{wave.score}</strong></div><div className="mt-4 space-y-2 text-xs"><div className="flex justify-between"><span className="text-[#777165]">Newly aligned</span><strong>+10,000</strong></div><div className="flex justify-between"><span className="text-[#777165]">Remaining backlog</span><strong>{wave.remaining.toLocaleString()}</strong></div><div className="flex justify-between"><span className="text-[#777165]">Projected aligned</span><strong>{wave.aligned.toLocaleString()}</strong></div></div></div>
            <div className="mt-4"><div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#8d8678]">Work files</div><div className="mt-2 space-y-2"><button className="w-full rounded-xl border border-[#cad8c4] bg-[#edf3e8] px-3 py-3 text-left flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center text-[#527b48]"><ArrowRight size={14} /></span><span className="flex-1"><strong className="text-xs block">10,000 Orders</strong><small className="text-[10px] text-[#65755f]">Best missing products</small></span><ChevronRight size={14} /></button><button className="w-full rounded-xl border border-[#dfc8c1] bg-[#f4e7e2] px-3 py-3 text-left flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center text-[#a45248]"><ArrowLeft size={14} /></span><span className="flex-1"><strong className="text-xs block">10,000 Returns</strong><small className="text-[10px] text-[#87645d]">Worst products held</small></span><ChevronRight size={14} /></button></div></div>
            <div className="mt-4"><div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#8d8678]">Strategy applied</div><div className="mt-2 rounded-xl border border-[#d8d1c2] bg-white/55 p-3"><div className="text-xs font-semibold">ATL-050 Q4 mix</div><p className="text-[10px] text-[#777165] mt-1">4 rules · Brembo deprioritized in Spark Plugs</p><button onClick={() => onNavigate('planner-door')} className="mt-2 text-[11px] font-medium underline">Open strategy</button></div></div>
            <div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => setWaveStatus('Editing')} className="rounded-lg border border-[#d7d0c0] bg-white/60 px-3 py-2 text-xs flex items-center justify-center gap-1.5"><PencilLine size={13} />Edit</button><button className="rounded-lg border border-[#d7d0c0] bg-white/60 px-3 py-2 text-xs flex items-center justify-center gap-1.5"><Eye size={13} />Review</button></div><button onClick={() => setWaveStatus('Wave 1 active')} className="mt-2 w-full rounded-lg bg-[#1f1d19] text-white px-3 py-3 text-xs font-semibold flex items-center justify-center gap-2"><PlayCircle size={14} />Launch this wave</button>
          </aside>
        </div>
      )}
    </div>
  );
}

function GetWellEnablementScreen({ onNavigate }) {
  const [enabled, setEnabled] = useState(() => new Set(ENABLEMENT_STORES.slice(0,5).map(store => store.id)));
  const [selectedId, setSelectedId] = useState('ATL-050');
  const [filter, setFilter] = useState('All stores');
  const selected = ENABLEMENT_STORES.find(store => store.id === selectedId) || ENABLEMENT_STORES[0];
  const visibleStores = ENABLEMENT_STORES.filter(store => filter === 'All stores' || (filter === 'Enabled' ? enabled.has(store.id) : !enabled.has(store.id)));

  function toggleStore(id) {
    setEnabled(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  return (
    <div className="diskbuddy-surface -m-6 min-h-screen bg-[#f7f3e8] text-[#201f1c]">
      <div className="h-14 border-b border-[#ded8ca] px-6 flex items-center justify-between bg-[#faf7ef]"><div className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-[#1f1d19] text-white flex items-center justify-center"><Power size={15} /></span><strong className="text-sm">Execution enablement</strong></div><label className="relative"><Search size={14} className="absolute left-3 top-2.5 text-[#8b857a]" /><input className="w-64 rounded-full border border-[#d8d1c2] bg-white/60 py-2 pl-9 pr-3 text-xs outline-none" placeholder="Find a store..." /></label></div>
      <div className="px-6 py-5 border-b border-[#ded8ca]"><div className="flex justify-between items-end"><div><h1 className="text-3xl font-semibold tracking-[-0.035em]">Digital workers</h1><p className="text-xs text-[#7e786d] mt-1">Enable a store and Pulse will build, refresh, and monitor its capacity-aware execution plan.</p></div><button onClick={() => setEnabled(new Set(ENABLEMENT_STORES.map(store => store.id)))} className="rounded-full bg-[#1f1d19] text-white px-4 py-2.5 text-xs font-medium flex items-center gap-2"><Sparkles size={14} />Enable all ready stores</button></div></div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(680px,1fr) 325px' }}>
        <main className="p-6 border-r border-[#ded8ca]">
          <div className="grid grid-cols-4 gap-3"><div className="rounded-2xl border border-[#d8d1c2] bg-white/55 p-4"><div className="text-[10px] uppercase tracking-wider text-[#8b8478]">Workers on</div><strong className="text-2xl block mt-2">{enabled.size}</strong><span className="text-[10px] text-[#777165]">of 195 stores</span></div><div className="rounded-2xl border border-[#d8d1c2] bg-white/55 p-4"><div className="text-[10px] uppercase tracking-wider text-[#8b8478]">DC capacity assigned</div><strong className="text-2xl block mt-2">50,000</strong><span className="text-[10px] text-[#777165]">swaps / month</span></div><div className="rounded-2xl border border-[#d8d1c2] bg-white/55 p-4"><div className="text-[10px] uppercase tracking-wider text-[#8b8478]">Plans to review</div><strong className="text-2xl block mt-2">2</strong><span className="text-[10px] text-[#777165]">before launch</span></div><div className="rounded-2xl border border-[#d8d1c2] bg-white/55 p-4"><div className="text-[10px] uppercase tracking-wider text-[#8b8478]">Actions orchestrated</div><strong className="text-2xl block mt-2">94,420</strong><span className="text-[10px] text-[#777165]">Orders + Returns</span></div></div>
          <div className="mt-5 flex items-center justify-between"><div className="inline-flex rounded-full border border-[#d7d0c0] bg-white/50 p-1">{['All stores','Enabled','Not enabled'].map(item => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-xs ${filter === item ? 'bg-[#1f1d19] text-white' : 'text-[#6e685e]'}`}>{item}</button>)}</div><div className="text-[11px] text-[#827b70]">{visibleStores.length} stores shown · ranked by lowest health</div></div>
          <div className="mt-4 rounded-2xl border border-[#d8d1c2] bg-white/45 overflow-hidden"><div className="grid px-4 py-3 border-b border-[#ded8ca] text-[10px] uppercase tracking-wider text-[#8b8478]" style={{ gridTemplateColumns: '42px 1.2fr 1fr 115px 100px' }}><span /><span>Store</span><span>Recovery</span><span>Monthly capacity</span><span>Worker</span></div>{visibleStores.map(store => { const isEnabled = enabled.has(store.id); const isSelected = store.id === selectedId; return <button key={store.id} onClick={() => setSelectedId(store.id)} className={`w-full grid items-center px-4 py-3 text-left border-b border-[#e2dccf] last:border-0 ${isSelected ? 'bg-[#eee8db]' : 'hover:bg-white/55'}`} style={{ gridTemplateColumns: '42px 1.2fr 1fr 115px 100px' }}><span className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-[#1f1d19] text-white' : 'bg-[#e5dfd3] text-[#8a8377]'}`}><Bot size={14} /></span><span><strong className="text-xs block">{store.id} · {store.name}</strong><small className={`text-[10px] ${store.status === 'Needs review' ? 'text-amber-700' : 'text-[#777165]'}`}>{isEnabled ? store.status : 'Not enabled'}</small></span><span className="pr-6"><span className="flex justify-between text-[10px]"><b>{store.score}</b><b className="text-[#527b48]">{store.target}</b></span><span className="block mt-1 h-2 rounded-full bg-[#e4ded2] overflow-hidden"><i className="block h-full bg-[#7fa273] rounded-full" style={{ width: `${store.score}%` }} /></span><small className="text-[9px] text-[#817a6f]">{store.waves} waves · {store.actions.toLocaleString()} swaps</small></span><strong className="text-xs">{store.capacity.toLocaleString()}<small className="font-normal text-[#817a6f]"> / mo</small></strong><span onClick={event => event.stopPropagation()}><button aria-pressed={isEnabled} onClick={() => toggleStore(store.id)} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${isEnabled ? 'border border-[#c9d9c0] bg-[#e9f1e4] text-[#486340]' : 'border border-[#d7d0c0] bg-white/70 text-[#625d54]'}`}>{isEnabled ? 'On' : 'Enable'}</button></span></button>;})}</div>
        </main>
        <aside className="p-5 bg-[#faf7ef]/65"><div className="flex items-start justify-between"><div><div className="text-[10px] uppercase tracking-[0.14em] text-[#8b8478]">Selected store</div><h2 className="text-xl font-semibold mt-1">{selected.id}</h2><p className="text-[11px] text-[#777165]">{selected.name}</p></div><button className="w-8 h-8 rounded-lg border border-[#d7d0c0] bg-white/60 flex items-center justify-center"><Settings2 size={14} /></button></div><div className="mt-5 rounded-2xl border border-[#d8d1c2] bg-white/55 p-4"><div className="flex items-center justify-between"><div className="text-xs font-semibold">Execution worker</div><button onClick={() => toggleStore(selected.id)} className={`w-11 h-6 rounded-full p-0.5 ${enabled.has(selected.id) ? 'bg-[#1f1d19]' : 'bg-[#d4cec1]'}`}><span className={`block w-5 h-5 rounded-full bg-white transition-transform ${enabled.has(selected.id) ? 'translate-x-5' : ''}`} /></button></div><p className="text-[11px] text-[#777165] mt-2">{enabled.has(selected.id) ? 'This worker monitors rankings and maintains the store’s future waves.' : 'Enable to generate a store-level plan from current recommendations.'}</p></div><div className="mt-4 space-y-3"><div className="rounded-2xl border border-[#d8d1c2] bg-white/55 p-4"><div className="text-[10px] uppercase tracking-wider text-[#8b8478]">Plan snapshot</div><div className="mt-3 flex items-end gap-2"><strong className="text-3xl">{selected.score}</strong><ArrowRight size={15} className="mb-1.5 text-[#aaa294]" /><strong className="text-3xl text-[#527b48]">{selected.target}</strong></div><dl className="mt-4 space-y-2 text-xs"><div className="flex justify-between"><dt className="text-[#777165]">Actionable swaps</dt><dd className="font-semibold">{selected.actions.toLocaleString()}</dd></div><div className="flex justify-between"><dt className="text-[#777165]">Capacity</dt><dd className="font-semibold">{selected.capacity.toLocaleString()} / mo</dd></div><div className="flex justify-between"><dt className="text-[#777165]">Estimated waves</dt><dd className="font-semibold">{selected.waves}</dd></div></dl></div><div className="rounded-2xl border border-[#d8d1c2] bg-white/55 p-4"><div className="text-[10px] uppercase tracking-wider text-[#8b8478]">Inputs</div><div className="mt-3 space-y-2 text-[11px]"><div className="flex gap-2"><CircleCheckBig size={13} className="text-[#628756] mt-0.5" /><span>Latest ranked SKU recommendations</span></div><div className="flex gap-2"><CircleCheckBig size={13} className="text-[#628756] mt-0.5" /><span>Q4 store strategy applied</span></div><div className="flex gap-2"><CircleCheckBig size={13} className="text-[#628756] mt-0.5" /><span>DC capacity allocation received</span></div></div></div></div><button disabled={!enabled.has(selected.id)} onClick={() => onNavigate('store-detail')} className="mt-4 w-full rounded-xl bg-[#1f1d19] disabled:bg-[#cfc8bb] text-white px-4 py-3 text-xs font-semibold flex items-center justify-center gap-2">Open execution in store <ArrowRight size={14} /></button><p className="mt-3 text-center text-[10px] text-[#817a6f]">Reviewing and editing always happens inside the store page.</p></aside>
      </div>
    </div>
  );
}

const PULSE_WAVE_JOURNEY = [
  {
    number: 1, month: 'September 2026', before: 29, after: 52, aligned: 22000, remaining: 20000,
    status: 'Ready for review', strategySkus: 842,
    categories: [
      { name: 'Spark Plugs', before: 32, after: 74, from: 'Critical', to: 'Excellent', aligned: 2840 },
      { name: 'Body & Accessories', before: 19, after: 58, from: 'Critical', to: 'At risk', aligned: 2310 },
      { name: 'Filters', before: 46, after: 72, from: 'Critical', to: 'Excellent', aligned: 1980 },
      { name: 'Tools & Equipment', before: 24, after: 48, from: 'Critical', to: 'Critical', aligned: 1410 },
    ],
  },
  {
    number: 2, month: 'October 2026', before: 52, after: 76, aligned: 32000, remaining: 10000,
    status: 'Refreshes before launch', strategySkus: 516,
    categories: [
      { name: 'Tools & Equipment', before: 48, after: 73, from: 'Critical', to: 'Excellent', aligned: 2720 },
      { name: 'Engine Parts', before: 49, after: 68, from: 'Critical', to: 'At risk', aligned: 2440 },
      { name: 'Climate Control', before: 44, after: 59, from: 'Critical', to: 'At risk', aligned: 2160 },
      { name: 'Steering & Suspension', before: 43, after: 61, from: 'Critical', to: 'At risk', aligned: 1840 },
    ],
  },
  {
    number: 3, month: 'November 2026', before: 76, after: 100, aligned: 42000, remaining: 0,
    status: 'Refreshes before launch', strategySkus: 304,
    categories: [
      { name: 'Engine Parts', before: 68, after: 91, from: 'At risk', to: 'Excellent', aligned: 2630 },
      { name: 'Climate Control', before: 59, after: 86, from: 'At risk', to: 'Excellent', aligned: 2380 },
      { name: 'Steering & Suspension', before: 61, after: 82, from: 'At risk', to: 'Excellent', aligned: 2090 },
      { name: 'Electrical', before: 66, after: 79, from: 'At risk', to: 'Excellent', aligned: 1710 },
    ],
  },
];

function pulseScoreTone(score) {
  if (score <= 50) return { text: 'text-red-700', bg: 'bg-red-600', soft: 'bg-red-50 border-red-200', label: 'Critical' };
  if (score <= 70) return { text: 'text-amber-700', bg: 'bg-amber-500', soft: 'bg-amber-50 border-amber-200', label: 'At risk' };
  return { text: 'text-green-700', bg: 'bg-green-600', soft: 'bg-green-50 border-green-200', label: 'Excellent' };
}

const STORE_HEALTH_DRILL = [
  {
    title: 'Categories (L1)', parent: 'ATL-050 assortment', health: 29, current: 42000, notAligned: 30000,
    rows: [
      { name: 'Brakes', current: 4210, notAligned: 3060, score: 27 },
      { name: 'Body & Accessories', current: 3890, notAligned: 2730, score: 30 },
      { name: 'Steering & Suspension', current: 3240, notAligned: 2190, score: 32 },
      { name: 'Tools & Equipment', current: 4450, notAligned: 2890, score: 35 },
      { name: 'Engine Parts', current: 7980, notAligned: 4950, score: 38 },
      { name: 'Climate Control', current: 3160, notAligned: 1860, score: 41 },
    ],
  },
  {
    title: 'Brakes L1-5', parent: 'All categories', health: 27, current: 4210, notAligned: 3060,
    rows: [
      { name: 'Brake Friction L2-3', current: 1680, notAligned: 1280, score: 24 },
      { name: 'Brake Hydraulics L2-7', current: 930, notAligned: 660, score: 29 },
      { name: 'Brake Hardware L2-9', current: 840, notAligned: 560, score: 33 },
      { name: 'Brake Service Tools L2-12', current: 760, notAligned: 460, score: 39 },
    ],
  },
  {
    title: 'Brake Friction L2-3', parent: 'Brakes', health: 24, current: 1680, notAligned: 1280,
    rows: [
      { name: 'Brake Pads L3-1', current: 620, notAligned: 510, score: 18 },
      { name: 'Brake Rotors L3-2', current: 540, notAligned: 390, score: 28 },
      { name: 'Brake Kits L3-4', current: 290, notAligned: 190, score: 34 },
      { name: 'Brake Shoes L3-7', current: 230, notAligned: 140, score: 39 },
    ],
  },
  {
    title: 'Brake Pads L3-1', parent: 'Brake Friction', health: 18, current: 620, notAligned: 510,
    rows: [
      { name: 'Brembo L4-18', current: 160, notAligned: 142, score: 11 },
      { name: 'Raybestos L4-12', current: 140, notAligned: 108, score: 23 },
      { name: 'NAPA Proformer L4-6', current: 150, notAligned: 112, score: 25 },
      { name: 'Adaptive One L4-2', current: 170, notAligned: 148, score: 27 },
    ],
  },
];

function StorePageTabs({ view, setView }) {
  return <div className="inline-flex rounded-full border border-gray-200 bg-white p-1">{[['overview','Overview'],['categories','Category health'],['plan','Store execution']].map(([id,label]) => <button key={id} onClick={() => setView(id)} className={`rounded-full px-4 py-2 text-xs ${view === id ? 'bg-gray-950 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{label}</button>)}</div>;
}

function StorePageHeading({ view, setView, onNavigate, subtitle, path = [] }) {
  return <><div className="flex justify-between gap-4 items-start"><div><Breadcrumb items={['Assortment overview','Store health','ATL-050',...path]} /><h1 className="text-[22px] font-medium">ATL-050 (DOWNTOWN ATLANTA)</h1><p className="text-sm text-gray-500 mt-1">{subtitle}</p></div><div className="flex gap-2"><button onClick={() => downloadSkuCsv()} className="bg-blue-700 hover:bg-blue-800 text-white rounded-full px-4 py-2 text-sm flex items-center gap-2"><Download size={15} />Export SKUs <ChevronDown size={14} /></button><button onClick={() => onNavigate('sku-list')} className="border border-blue-700 text-blue-800 rounded-full px-4 py-2 text-sm flex items-center gap-2"><FileText size={15} />Get SKU list</button></div></div><div className="mt-4"><StorePageTabs view={view} setView={setView} /></div></>;
}

function StoreOverviewExperience({ view, setView, onNavigate }) {
  const [filter, setFilter] = useState('All');
  const rows = STORE_HEALTH_DRILL[0].rows.filter(row => filter === 'All' || pulseScoreTone(row.score).label === filter);
  return <div>
    <StorePageHeading view={view} setView={setView} onNavigate={onNavigate} subtitle="Assortment overview" />
    <div className="grid gap-4 mt-5" style={{gridTemplateColumns:'minmax(270px,1.05fr) minmax(0,2.5fr)'}}>
      <section className="bg-white border border-gray-200 rounded-2xl p-5 row-span-2"><h2 className="font-medium">Assortment health score <Info size={14} className="inline text-gray-400" /></h2><p className="text-xs text-gray-500">Store ATL-050 (DOWNTOWN ATLANTA)</p><div className="mt-5 flex justify-center"><div className="relative w-40 h-40 rounded-full" style={{background:'conic-gradient(#d72b21 0 29%, #e5e7eb 29% 100%)'}}><div className="absolute inset-[17px] bg-white rounded-full flex flex-col items-center justify-center"><span className="text-[11px] border border-red-200 bg-red-50 text-red-700 rounded-full px-2 py-0.5">Critical</span><strong className="text-3xl mt-1">29</strong><span className="text-xs text-gray-500">out of 100</span></div></div></div><div className="text-center text-sm font-medium mt-3">71% is not aligned</div><div className="mt-5 space-y-2"><div className="flex justify-between text-xs"><span><i className="inline-block w-2 h-2 rounded-full bg-green-600 mr-2" />Excellent</span><strong>71–100</strong></div><div className="flex justify-between text-xs"><span><i className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />At risk</span><strong>51–70</strong></div><div className="flex justify-between text-xs"><span><i className="inline-block w-2 h-2 rounded-full bg-red-600 mr-2" />Critical</span><strong>0–50</strong></div></div></section>
      <div className="grid grid-cols-3 gap-4"><MetricCard label="Total SKUs" value="42,000" sub="Active assortment items" /><div className="rounded-2xl p-5 bg-green-50 border border-green-100"><div className="text-xs text-gray-600">Aligned SKUs</div><div className="text-2xl font-medium mt-1">12,000</div><div className="text-xs text-gray-500 mt-1">28.6% of assortment</div></div><div className="rounded-2xl p-5 bg-red-50 border border-red-100"><div className="text-xs text-gray-600">Not aligned SKUs</div><div className="text-2xl font-medium mt-1">30,000</div><div className="text-xs text-red-700 mt-1">71.4% needs action</div></div></div>
      <section className="bg-white border border-gray-200 rounded-2xl p-5"><div className="flex justify-between"><h2 className="font-medium">Category health distribution</h2><span className="text-xs text-gray-500">32 categories total</span></div><div className="h-3 rounded-full overflow-hidden flex mt-5"><div className="bg-green-600 w-[19%]" /><div className="bg-amber-500 w-[25%]" /><div className="bg-red-600 flex-1" /></div><div className="grid grid-cols-3 gap-3 mt-4"><div className="rounded-xl bg-green-50 border border-green-100 p-4"><strong className="text-xl">6</strong><div className="text-xs">Excellent</div></div><div className="rounded-xl bg-amber-50 border border-amber-100 p-4"><strong className="text-xl">8</strong><div className="text-xs">At risk</div></div><div className="rounded-xl bg-red-50 border border-red-100 p-4"><strong className="text-xl">18</strong><div className="text-xs">Critical</div></div></div></section>
    </div>
    <section className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 flex gap-4"><div className="w-10 h-10 rounded-xl bg-white text-blue-700 flex items-center justify-center"><Sparkles size={18} /></div><div className="flex-1"><div className="flex items-center gap-2"><h2 className="text-sm font-medium text-blue-950">Pulse explanation</h2><span className="rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[9px] text-blue-700">AI generated</span></div><p className="text-xs text-blue-900 mt-1 leading-relaxed"><strong>Brakes, Body &amp; Accessories, and Steering &amp; Suspension create 27% of this store’s alignment gap.</strong> Brake Pads is the strongest first intervention: returning low-ranked Brembo inventory and ordering the highest-ranked missing pads moves that branch from 18 to 63 in Wave 1.</p></div><button onClick={() => setView('plan')} className="self-center rounded-lg bg-blue-700 text-white px-4 py-2.5 text-xs font-medium flex items-center gap-2">See execution impact <ArrowRight size={13} /></button></section>
    <section className="mt-5"><div className="flex justify-between items-end"><div><h2 className="text-lg font-medium">Categories</h2><p className="text-xs text-gray-500">Showing {rows.length} of 32 categories by worst health</p></div><div className="flex gap-2">{['All','Excellent','At risk','Critical'].map(item => <button key={item} onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-xs ${filter === item ? 'border-blue-700 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-600'}`}>{item}</button>)}</div></div><div className="mt-3 bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">{rows.map((row,index) => <button key={row.name} onClick={() => setView('categories')} className="w-full grid items-center text-left px-5 py-3 hover:bg-gray-50" style={{gridTemplateColumns:'42px 1fr 56px 20px'}}><span className="text-sm text-gray-500">{index+1}</span><span><strong className="text-sm block">{row.name}</strong><small className="text-[11px] text-gray-500">{row.current.toLocaleString()} current · <i className="not-italic text-red-700">{row.notAligned.toLocaleString()} not aligned</i></small></span><ScoreBadge score={row.score} /><ChevronRight size={16} className="text-gray-400" /></button>)}</div></section>
  </div>;
}

function StoreCategoryHealthExperience({ view, setView, onNavigate }) {
  const [level, setLevel] = useState(0);
  const scope = STORE_HEALTH_DRILL[level];
  const aligned = scope.current - scope.notAligned;
  const path = STORE_HEALTH_DRILL.slice(1,level+1).map(item => item.title);
  return <div>
    <StorePageHeading view={view} setView={setView} onNavigate={onNavigate} subtitle={level === 0 ? 'Category health' : `${scope.title} · ${scope.parent}`} path={path} />
    <div className="mt-4 flex items-center gap-2 text-xs">{STORE_HEALTH_DRILL.slice(0,level+1).map((item,index) => <React.Fragment key={item.title}><button onClick={() => setLevel(index)} className={`${index === level ? 'font-medium text-gray-900' : 'text-blue-700'}`}>{index === 0 ? 'All categories' : item.title}</button>{index < level && <ChevronRight size={12} className="text-gray-400" />}</React.Fragment>)}</div>
    <div className="grid grid-cols-4 gap-4 mt-4"><div className="rounded-2xl border border-red-100 bg-red-50 p-5"><div className="text-[11px] font-medium uppercase text-gray-600">Health score</div><strong className="text-3xl block mt-1">{scope.health}</strong><span className="text-xs text-red-700">Critical</span></div><div className="rounded-2xl border border-gray-200 bg-white p-5"><div className="text-[11px] font-medium uppercase text-gray-600">Current assortment</div><strong className="text-3xl block mt-1">{scope.current.toLocaleString()}</strong><span className="text-xs text-gray-600">SKUs in stock</span></div><div className="rounded-2xl border border-green-100 bg-green-50 p-5"><div className="text-[11px] font-medium uppercase text-gray-600">Aligned SKUs</div><strong className="text-3xl block mt-1">{aligned.toLocaleString()}</strong><span className="text-xs text-gray-600">{Math.round(aligned/scope.current*100)}% of assortment</span></div><div className="rounded-2xl border border-red-100 bg-red-50 p-5"><div className="text-[11px] font-medium uppercase text-gray-600">Not aligned SKUs</div><strong className="text-3xl block mt-1">{scope.notAligned.toLocaleString()}</strong><span className="text-xs text-red-700">{Math.round(scope.notAligned/scope.current*100)}% needs action</span></div></div>
    <section className="mt-5 bg-white border border-gray-200 rounded-2xl grid gap-8 p-5" style={{gridTemplateColumns:'minmax(300px,.9fr) minmax(430px,1.4fr)'}}><div><div className="flex justify-between"><div><h2 className="font-medium">Health by subcategory</h2><p className="text-[11px] text-gray-500">Worst health first</p></div><span className="h-fit rounded-full bg-red-50 border border-red-200 text-red-700 px-3 py-1 text-xs">Critical</span></div><HealthBars rows={scope.rows} /><div className="mt-4"><HealthLegend /></div></div><div><div className="flex justify-between items-start"><div><h2 className="font-medium">{scope.title}</h2><p className="text-[11px] text-gray-500">{level < 3 ? `Click a row to view level ${level+2}` : 'Lowest hierarchy level · open its scoped SKU list'}</p></div><button className="rounded-full border border-gray-200 px-4 py-2 text-xs flex gap-2 items-center">Score: low to high <ArrowDownUp size={13} /></button></div><div className="divide-y divide-gray-100 mt-4">{scope.rows.map((row,index) => <button key={row.name} onClick={() => level < 3 ? setLevel(level+1) : onNavigate('sku-list')} className="w-full grid items-center text-left py-3 px-2 hover:bg-gray-50 rounded" style={{gridTemplateColumns:'34px 1fr 20px 50px'}}><span className="text-xs text-gray-500">{index+1}</span><span><strong className="text-sm block">{row.name}</strong><small className="text-[11px] text-gray-500">{row.current.toLocaleString()} current · <i className="not-italic text-red-700">{row.notAligned.toLocaleString()} not aligned</i></small></span><ChevronRight size={15} className="text-gray-400" /><ScoreBadge score={row.score} /></button>)}</div></div></section>
    <section className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-center gap-3"><Sparkles size={16} className="text-blue-700" /><div className="flex-1"><div className="text-xs font-medium text-blue-950">Why this branch is unhealthy</div><p className="text-[11px] text-blue-900 mt-1">{level === 3 ? 'Brembo represents the largest misalignment inside Brake Pads. The active Scenario Planner rule deprioritizes the brand, so these SKUs move into the first Return wave.' : `${scope.rows[0].name} has the lowest score in this branch and contributes ${scope.rows[0].notAligned.toLocaleString()} not-aligned SKUs. Drill in to isolate the product and brand decisions behind the gap.`}</p></div><button onClick={() => onNavigate('sku-list')} className="rounded-lg bg-blue-700 text-white px-4 py-2.5 text-xs font-medium">Get this SKU list</button></section>
  </div>;
}

function PulseStoreWorkspaceScreen({ onNavigate }) {
  const [view, setView] = useState('overview');
  const [selectedWave, setSelectedWave] = useState(0);
  const [launched, setLaunched] = useState(false);
  const [capacity, setCapacity] = useState(10000);
  const wave = PULSE_WAVE_JOURNEY[selectedWave];
  const transitionCount = wave.categories.filter(category => category.from !== category.to).length;

  if (view === 'overview') return <StoreOverviewExperience view={view} setView={setView} onNavigate={onNavigate} />;
  if (view === 'categories') return <StoreCategoryHealthExperience view={view} setView={setView} onNavigate={onNavigate} />;

  return (
    <div>
      <Breadcrumb items={['Assortment overview', 'Store health', 'ATL-050', 'Store execution']} />
      <div className="flex items-start justify-between gap-4">
        <div><div className="flex items-center gap-2"><h1 className="text-[22px] font-medium">ATL-050 (DOWNTOWN ATLANTA)</h1><span className={`rounded-full border px-2.5 py-1 text-[10px] ${launched ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>{launched ? 'Wave 1 active' : 'Plan ready'}</span></div><p className="text-sm text-gray-500 mt-1">See how every monthly wave changes category health and store assortment.</p></div>
        <div className="flex items-center gap-2"><button onClick={() => onNavigate('sku-list')} className="rounded-full border border-blue-700 text-blue-700 bg-white px-4 py-2 text-xs flex items-center gap-2"><List size={14} />SKU list</button><button onClick={() => setLaunched(true)} className="rounded-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-xs font-medium flex items-center gap-2"><PlayCircle size={14} />{launched ? 'Wave 1 in progress' : 'Launch wave 1'}</button></div>
      </div>

      <div className="mt-4 flex items-center justify-between"><StorePageTabs view={view} setView={setView} /><div className="flex items-center gap-2 text-xs text-gray-500"><RefreshCw size={13} />Recommendations refreshed today</div></div>

      <section className="mt-4 rounded-2xl bg-blue-950 text-white px-5 py-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Beaker size={18} /></div><div className="flex-1"><div className="text-xs text-blue-200">Scenario Planner strategy applied</div><div className="text-sm font-medium mt-0.5">ATL-050 Q4 assortment strategy · 4 active rules</div><p className="text-[11px] text-blue-200 mt-1">For Spark Plugs, Brembo is deprioritized. Pulse uses the strategy to re-rank future Orders and Returns.</p></div><button onClick={() => onNavigate('planner-door')} className="rounded-lg border border-white/20 px-3.5 py-2 text-xs flex items-center gap-2">Review strategy <ArrowRight size={13} /></button></section>

      <div className="grid grid-cols-4 gap-3 mt-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4"><span className="text-xs text-gray-500">Health journey</span><div className="mt-2 flex items-center gap-2"><strong className="text-2xl">29</strong><ArrowRight size={15} className="text-gray-400" /><strong className="text-2xl text-green-700">100</strong></div><small className="text-[11px] text-gray-500">Critical → Excellent</small></div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4"><span className="text-xs text-gray-500">Aligned products</span><strong className="text-2xl block mt-2">12,000</strong><small className="text-[11px] text-gray-500">42,000 after plan</small></div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4"><span className="text-xs text-gray-500">Monthly capacity</span><div className="mt-1 flex items-baseline gap-1"><input aria-label="Monthly capacity" type="number" min="1000" step="1000" value={capacity} onChange={event => setCapacity(event.target.value)} className="w-24 text-2xl font-semibold outline-none border-b border-dashed border-gray-300" /><small className="text-gray-500">swaps</small></div><small className="text-[11px] text-gray-500">Orders + paired Returns</small></div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4"><span className="text-xs text-gray-500">Estimated recovery</span><strong className="text-2xl block mt-2">3 waves</strong><small className="text-[11px] text-gray-500">Complete Nov 2026</small></div>
      </div>

      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between"><div><h2 className="font-medium">Store execution journey</h2><p className="text-xs text-gray-500 mt-1">Select a wave to see which category and SKU decisions create its health-score lift.</p></div><HealthLegend /></div>
        <div className="mt-5 grid grid-cols-[120px_1fr_1fr_1fr] items-center gap-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3"><div className="text-[10px] text-gray-500">Today</div><strong className="text-xl">29</strong><div className="mt-2 h-1.5 rounded-full bg-gray-200"><div className="h-full w-[29%] rounded-full bg-red-600" /></div></div>
          {PULSE_WAVE_JOURNEY.map((item,index) => { const tone = pulseScoreTone(item.after); const active = selectedWave === index; return <button key={item.number} onClick={() => setSelectedWave(index)} className={`rounded-xl border p-3 text-left transition ${active ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/40' : 'border-gray-200 hover:border-blue-300'}`}><div className="flex justify-between items-start"><span className="text-[10px] text-gray-500">Wave {item.number} · {item.month.split(' ')[0]}</span>{index === 0 && launched && <span className="text-[9px] text-blue-700">LOCKED</span>}</div><div className="mt-1 flex items-center gap-1.5"><strong className="text-lg">{item.before}</strong><ArrowRight size={12} className="text-gray-400" /><strong className={`text-lg ${tone.text}`}>{item.after}</strong></div><div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className={`h-full rounded-full ${tone.bg}`} style={{ width: `${item.after}%` }} /></div><div className="mt-2 text-[10px] text-gray-500">+10,000 aligned · {item.categories.filter(c => c.from !== c.to).length} category shifts</div></button>; })}
        </div>
      </section>

      <div className="mt-4 grid grid-cols-[1.35fr_.65fr] gap-4">
        <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><div><h2 className="font-medium">Wave {wave.number} category impact</h2><p className="text-xs text-gray-500 mt-1">{transitionCount} categories cross a health threshold this month.</p></div><span className="rounded-full bg-green-50 border border-green-200 text-green-800 px-3 py-1 text-[11px]">+10,000 aligned</span></div><div className="divide-y divide-gray-100">{wave.categories.map(category => { const afterTone = pulseScoreTone(category.after); return <div key={category.name} className="px-5 py-3 grid grid-cols-[180px_1fr_150px] items-center gap-4"><div><strong className="text-xs block">{category.name}</strong><small className="text-[10px] text-gray-500">+{category.aligned.toLocaleString()} aligned</small></div><div><div className="flex justify-between text-[10px] text-gray-500"><span>{category.before}</span><span className={afterTone.text}>{category.after}</span></div><div className="relative mt-1.5 h-2 rounded-full bg-gray-100 overflow-hidden"><div className="absolute inset-y-0 left-0 bg-gray-300 rounded-full" style={{ width: `${category.before}%` }} /><div className={`${afterTone.bg} absolute inset-y-0 left-0 rounded-full opacity-90`} style={{ width: `${category.after}%` }} /></div></div><div className="flex items-center justify-end gap-1.5 text-[10px]"><span className="rounded-full border border-gray-200 px-2 py-1 text-gray-600">{category.from}</span><ArrowRight size={11} className="text-gray-400" /><span className={`rounded-full border px-2 py-1 ${afterTone.soft} ${afterTone.text}`}>{category.to}</span></div></div>; })}</div></section>
        <aside className="rounded-2xl border border-gray-200 bg-white p-5"><div className="flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-wider text-gray-500">Selected wave</div><h2 className="font-medium mt-1">Wave {wave.number} · {wave.month}</h2></div><span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 text-[10px]">{selectedWave === 0 && launched ? 'Locked' : wave.status}</span></div><div className="mt-5 rounded-xl bg-gray-50 p-4"><div className="text-xs text-gray-500">Health score impact</div><div className="mt-2 flex items-center gap-2"><strong className="text-3xl">{wave.before}</strong><ArrowRight size={16} className="text-gray-400" /><strong className="text-3xl text-green-700">{wave.after}</strong></div></div><dl className="mt-4 space-y-3 text-xs"><div className="flex justify-between"><dt className="text-gray-500">Orders</dt><dd className="font-semibold">10,000</dd></div><div className="flex justify-between"><dt className="text-gray-500">Returns</dt><dd className="font-semibold">10,000</dd></div><div className="flex justify-between"><dt className="text-gray-500">Remaining backlog</dt><dd className="font-semibold">{wave.remaining.toLocaleString()}</dd></div><div className="flex justify-between"><dt className="text-gray-500">SKUs affected by strategy</dt><dd className="font-semibold">{wave.strategySkus.toLocaleString()}</dd></div></dl><button onClick={() => onNavigate('planner-door')} className="mt-5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs font-medium flex justify-center items-center gap-2"><Beaker size={13} />View applied rules</button></aside>
      </div>

      <section className="mt-4 rounded-2xl border border-gray-200 bg-white overflow-hidden"><div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><div><h2 className="font-medium">Wave {wave.number} SKU recommendation impact</h2><p className="text-xs text-gray-500 mt-1">A glimpse of the ranked SKU list that powers this wave.</p></div><button onClick={() => onNavigate('sku-list')} className="text-xs text-blue-700 font-medium flex items-center gap-1">Review complete SKU list <ArrowRight size={13} /></button></div><div className="grid grid-cols-2 divide-x divide-gray-100"><div><div className="px-5 py-3 bg-green-50 text-xs font-medium text-green-900">10,000 best missing products to Order</div>{WAVE_ORDERS.slice(0,3).map(item => <div key={item.part} className="px-5 py-3 border-b border-gray-100 last:border-0 flex gap-3"><span className="text-[11px] font-semibold text-green-700 w-9">{item.rank}</span><div><div className="text-xs font-medium">{item.name}</div><div className="text-[10px] text-gray-500 mt-0.5">{item.part} · {item.reason}</div></div></div>)}</div><div><div className="px-5 py-3 bg-red-50 text-xs font-medium text-red-900">10,000 worst products held to Return</div>{WAVE_RETURNS.slice(0,3).map(item => <div key={item.part} className="px-5 py-3 border-b border-gray-100 last:border-0 flex gap-3"><span className="text-[11px] font-semibold text-red-700 w-14">{item.rank}</span><div><div className="text-xs font-medium">{item.name}</div><div className="text-[10px] text-gray-500 mt-0.5">{item.part} · {item.reason}</div></div></div>)}</div></div></section>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3"><Clock3 size={16} className="text-amber-700 mt-0.5" /><p className="text-[11px] leading-relaxed text-amber-900"><strong>Active waves stay stable.</strong> Once launched, the SKU actions are frozen for execution. Future waves continue to refresh from current rankings and Scenario Planner strategy.</p></div>
    </div>
  );
}

function PulseGetWellEnablementScreen({ onNavigate }) {
  const [enabled, setEnabled] = useState(() => new Set(ENABLEMENT_STORES.slice(0,5).map(store => store.id)));
  const [selectedId, setSelectedId] = useState('ATL-050');
  const [filter, setFilter] = useState('All stores');
  const selected = ENABLEMENT_STORES.find(store => store.id === selectedId) || ENABLEMENT_STORES[0];
  const visible = ENABLEMENT_STORES.filter(store => filter === 'All stores' || (filter === 'Enabled' ? enabled.has(store.id) : !enabled.has(store.id)));
  const toggle = id => setEnabled(previous => { const next = new Set(previous); next.has(id) ? next.delete(id) : next.add(id); return next; });

  return (
    <div>
      <Breadcrumb items={['Pulse AI', 'Execution enablement']} />
      <div className="flex items-start justify-between"><div><h1 className="text-[22px] font-medium">Execution enablement</h1><p className="text-sm text-gray-500 mt-1">Turn on a digital worker after the DC assigns monthly capacity. Review and edit each store execution journey inside its store page.</p></div><button onClick={() => setEnabled(new Set(ENABLEMENT_STORES.map(store => store.id)))} className="rounded-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 text-xs font-medium flex items-center gap-2"><Sparkles size={14} />Enable all ready stores</button></div>
      <div className="grid grid-cols-4 gap-3 mt-5"><div className="rounded-2xl border border-gray-200 bg-white p-4"><span className="text-xs text-gray-500">Digital workers on</span><strong className="text-2xl block mt-2">{enabled.size}</strong><small className="text-[11px] text-gray-500">of 195 stores</small></div><div className="rounded-2xl border border-gray-200 bg-white p-4"><span className="text-xs text-gray-500">DC capacity assigned</span><strong className="text-2xl block mt-2">50,000</strong><small className="text-[11px] text-gray-500">swaps per month</small></div><div className="rounded-2xl border border-gray-200 bg-white p-4"><span className="text-xs text-gray-500">Plans needing review</span><strong className="text-2xl block mt-2">2</strong><small className="text-[11px] text-gray-500">before launch</small></div><div className="rounded-2xl border border-gray-200 bg-white p-4"><span className="text-xs text-gray-500">Actions orchestrated</span><strong className="text-2xl block mt-2">94,420</strong><small className="text-[11px] text-gray-500">Orders + Returns</small></div></div>
      <div className="mt-4 grid grid-cols-[1fr_300px] gap-4"><section className="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">{['All stores','Enabled','Not enabled'].map(item => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-xs ${filter === item ? 'bg-gray-950 text-white' : 'text-gray-600'}`}>{item}</button>)}</div><div className="text-xs text-gray-500">{visible.length} stores · lowest health first</div></div><div className="grid px-5 py-3 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500" style={{gridTemplateColumns:'1.35fr 1fr 110px 100px'}}><span>Store</span><span>Projected recovery</span><span>Capacity</span><span>Worker</span></div><div className="divide-y divide-gray-100">{visible.map(store => { const isOn = enabled.has(store.id); return <button key={store.id} onClick={() => setSelectedId(store.id)} className={`w-full grid items-center px-5 py-3 text-left hover:bg-gray-50 ${selectedId === store.id ? 'bg-blue-50/50' : ''}`} style={{gridTemplateColumns:'1.35fr 1fr 110px 100px'}}><span className="flex items-center gap-3"><i className={`not-italic w-9 h-9 rounded-xl flex items-center justify-center ${isOn ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'}`}><Bot size={16} /></i><span><strong className="text-xs block">{store.id} · {store.name}</strong><small className="text-[10px] text-gray-500">{isOn ? store.status : 'Not enabled'}</small></span></span><span className="pr-5"><span className="flex justify-between text-[10px]"><b>{store.score}</b><b className="text-green-700">{store.target}</b></span><span className="block mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><i className="block h-full bg-green-600 rounded-full" style={{width:`${store.target}%`}} /></span><small className="text-[9px] text-gray-500">{store.waves} monthly waves</small></span><span className="text-xs font-semibold">{store.capacity.toLocaleString()}<small className="font-normal text-gray-500"> / mo</small></span><span onClick={event => event.stopPropagation()}><button onClick={() => toggle(store.id)} className={`w-11 h-6 rounded-full p-0.5 transition-colors ${isOn ? 'bg-blue-700' : 'bg-gray-300'}`}><i className={`not-italic block w-5 h-5 rounded-full bg-white transition-transform ${isOn ? 'translate-x-5' : ''}`} /></button></span></button>; })}</div></section>
        <aside className="rounded-2xl border border-gray-200 bg-white p-5"><div className="text-[10px] uppercase tracking-wider text-gray-500">Selected store</div><h2 className="font-medium mt-1">{selected.id}</h2><p className="text-xs text-gray-500">{selected.name}</p><div className="mt-4 rounded-xl bg-gray-50 p-4"><div className="text-xs text-gray-500">Projected health</div><div className="mt-2 flex items-center gap-2"><strong className="text-3xl">{selected.score}</strong><ArrowRight size={15} className="text-gray-400" /><strong className="text-3xl text-green-700">{selected.target}</strong></div></div><dl className="mt-4 space-y-3 text-xs"><div className="flex justify-between"><dt className="text-gray-500">Actionable swaps</dt><dd className="font-semibold">{selected.actions.toLocaleString()}</dd></div><div className="flex justify-between"><dt className="text-gray-500">Monthly capacity</dt><dd className="font-semibold">{selected.capacity.toLocaleString()}</dd></div><div className="flex justify-between"><dt className="text-gray-500">Estimated waves</dt><dd className="font-semibold">{selected.waves}</dd></div></dl><div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-3"><div className="text-xs font-medium text-blue-900">Digital worker inputs</div><div className="mt-2 space-y-2 text-[10px] text-blue-800"><div className="flex gap-2"><CheckCircle2 size={12} />Latest SKU ranking</div><div className="flex gap-2"><CheckCircle2 size={12} />Scenario Planner strategy</div><div className="flex gap-2"><CheckCircle2 size={12} />DC capacity allocation</div></div></div><button disabled={!enabled.has(selected.id)} onClick={() => onNavigate('store-detail')} className="mt-4 w-full rounded-lg bg-blue-700 disabled:bg-gray-300 text-white px-4 py-3 text-xs font-medium flex items-center justify-center gap-2">Open store journey <ArrowRight size={13} /></button><p className="text-[10px] text-center text-gray-500 mt-2">Review, edit, and launch from the store page.</p></aside>
      </div>
    </div>
  );
}

function HowItWorksScreen() {
  const features = [
    ['Assortment overview','Filter the network by distribution center, site type, stores, category, and score range; review network health, stores, SKUs, inventory value, and worst-performing stores/categories.'],
    ['Store & category health','Switch between store and category health, filter by score band, sort from worst health, inspect aligned versus not-aligned counts, and drill from store → L1 → L2 → L3 → L4.'],
    ['Health score','Pulse presents a 0–100 alignment score: Critical 0–50, At risk 51–70, Excellent 71–100, alongside the percentage of the assortment that is not aligned.'],
    ['SKU recommendations','Build a recommended SKU list from the current scope. Recommendations carry rank, part identifiers, hierarchy, store, and an action such as Order.'],
    ['Search, sort & export','Search SKU rows, sort columns, refine Store/Category/Brand/Action scope, clear a selection, and export CSV files for downstream ordering, returns, or inventory keeping.'],
    ['Scenario planner · prototype extension','Model space-allocation or budget scenarios, preview health/cash/SKU impacts, save a working scenario, and export results without changing canonical Pulse recommendations.'],
    ['Store execution · MVP','Pair the best missing products with the worst products held, split the actions into monthly capacity waves, project health improvement, lock active work, and refresh only future waves.'],
  ];
  return <div><Breadcrumb items={['Pulse AI','How it works']} /><h1 className="text-[22px] font-medium">How Pulse AI works</h1><p className="text-sm text-gray-500 mt-1 max-w-3xl">A feature guide reconstructed from the supplied current-product reference photos. New planning and execution capabilities are explicitly marked as prototype extensions.</p><div className="mt-5 grid grid-cols-2 gap-4">{features.map(([title,body],i) => <section key={title} className="bg-white border border-gray-200 rounded-2xl p-5"><div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">{i === 6 ? <Route size={18} /> : i === 5 ? <Beaker size={18} /> : i === 4 ? <Download size={18} /> : i === 3 ? <List size={18} /> : i === 2 ? <BarChart3 size={18} /> : i === 1 ? <Store size={18} /> : <SlidersHorizontal size={18} />}</div><h2 className="font-medium">{title}</h2><p className="text-sm text-gray-600 mt-2 leading-relaxed">{body}</p></section>)}</div><section className="mt-4 bg-gray-900 text-white rounded-2xl p-5"><div className="flex gap-3"><BookOpen size={19} className="text-blue-300 mt-0.5" /><div><h2 className="font-medium">Prototype evidence note</h2><p className="text-sm text-gray-300 mt-1 leading-relaxed">The current-feature inventory is limited to what is visible in the photos dated April 26, 2026. Authentication, permissions, backend calculations, and production side effects are not inferable from screenshots, so this prototype uses realistic mock data and client-side interactions only.</p></div></div></section></div>;
}

// ============================================================================
// Main app
// ============================================================================

export default function PulsePlannerPrototype() {
  const [screen, setScreen] = useState('overview');
  const [nodes, setNodes] = useState(() => buildInitialTree());
  const [path, setPath] = useState([]);
  const [autoRebalance, setAutoRebalance] = useState(false);

  // Budget-mode state — section 7 of the spec.
  const [budgetScope, setBudgetScope] = useState({ macsIds: ['ATL-466'], hierarchyFilter: undefined });
  const [budget, setBudget] = useState(50_000);
  const [distribution, setDistribution] = useState('proportional');

  // Light persistence — saved scenarios live in component state for the session.
  // Production: persist to SCENARIOS table per spec section 3.3.
  const [savedScenarios, setSavedScenarios] = useState([]);

  // Per-leaf allocations recompute whenever scope, budget, or distribution changes.
  // In production this would be debounced and cached by input hash (spec section 5.1).
  const allocations = useMemo(() => {
    const leaves = leavesInScope(nodes, budgetScope.hierarchyFilter);
    return distribution === 'proportional'
      ? distributeProportional(leaves, budget)
      : distributeGreedyWithinScope(leaves, budget);
  }, [nodes, budgetScope.hierarchyFilter, budget, distribution]);

  const budgetImpact = useMemo(
    () => computeBudgetImpact(allocations, distribution, budgetScope),
    [allocations, distribution, budgetScope]
  );

  const scenarioImpact = useMemo(() => {
    // Aggregate signed deltas: growth contributions drive TO_ORDER and cashOut;
    // shrink contributions drive NOT_ALIGNED_RETURN and cashIn. Untouched
    // siblings have delta=0 in independent mode and contribute nothing.
    // Cascade-DOWN descendants keep share-of-parent (delta=0); the edited
    // ancestor's level-weighted delta approximates the subtree effect.
    // See spec section 6.6 — directional effects on action counts.
    let growthMagnitude = 0;
    let shrinkMagnitude = 0;
    Object.values(nodes).forEach(n => {
      const delta = n.pct - n.originalPct;
      if (Math.abs(delta) < 0.05) return;
      const levelWeight = n.level === 1 ? 1.0 : n.level === 2 ? 0.6 : n.level === 3 ? 0.4 : 0.25;
      if (delta > 0) growthMagnitude += delta * levelWeight;
      else shrinkMagnitude += -delta * levelWeight;
    });

    const healthBefore = 31;
    // Both growth (filling rank-deserving gaps) and shrink (clearing
    // misaligned SKUs) lift health; growth more directly.
    const healthLift = Math.min(growthMagnitude * 0.5 + shrinkMagnitude * 0.3, 28);
    const healthAfter = healthBefore + healthLift;

    // Cash directional: growth → cash OUT, shrink → cash IN (DC return credit).
    const cashOut = 12 + growthMagnitude * 3.2;
    const cashIn = 5 + shrinkMagnitude * 2.0;
    const cashNet = cashOut - cashIn;

    // SKU actions directional: growth → TO_ORDER only; shrink → NOT_ALIGNED_RETURN only.
    // Untouched sibling subtrees contribute zero — pure-growth never inflates returns.
    const toOrder = Math.round(300 + growthMagnitude * 110);
    const toReturn = Math.round(220 + shrinkMagnitude * 95);
    const keep = Math.max(2000, 4140 - Math.round((growthMagnitude + shrinkMagnitude) * 40));

    return { healthBefore, healthAfter, cashOut, cashIn, cashNet, toOrder, toReturn, keep };
  }, [nodes]);

  function handleTreemapTileClick(l1Id) {
    setPath([l1Id]);
    setScreen('step3');
  }

  function handleStep1Continue() {
    setPath([]);
    setScreen('step3');
  }

  function saveSpaceScenario() {
    const editsCount = Object.values(nodes).filter(n => n.isUserEdit).length;
    const name = `${STORE.id} space scenario · ${editsCount} edit${editsCount !== 1 ? 's' : ''}`;
    const entry = { id: `sv-${Date.now()}`, name, mode: 'Space', age: 'just now' };
    setSavedScenarios(prev => [entry, ...prev]);
  }

  function saveBudgetScenario() {
    const scopeLabel = budgetScope.macsIds.length === 1
      ? budgetScope.macsIds[0]
      : `${budgetScope.macsIds.length} stores`;
    const name = `$${(budget / 1000).toFixed(0)}K ${scopeLabel} · ${distribution === 'proportional' ? 'proportional' : 'greedy'}`;
    const entry = { id: `sv-${Date.now()}`, name, mode: 'Budget', age: 'just now' };
    setSavedScenarios(prev => [entry, ...prev]);
  }

  function handleLoadScenario(s) {
    // Light load: jump to the right starting screen based on mode. State is not persisted
    // beyond name in this prototype; production reads from SCENARIOS table.
    if (s.mode === 'Budget') setScreen('budget-scope');
    else setScreen('step1');
  }

  return (
    <div className="pulse-shell flex min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
      <Sidebar current={screen} onNavigate={setScreen} />
      <main className="pulse-main flex-1 overflow-auto px-7 py-6">
        {screen === 'overview' && <AssortmentOverview onNavigate={setScreen} />}
        {screen === 'planner-door' && (
          <PlannerFrontDoor
            onNavigate={setScreen}
            savedScenarios={savedScenarios}
            onLoadScenario={handleLoadScenario}
          />
        )}
        {screen === 'step1' && <StepAwareness onContinue={handleStep1Continue} onTileClick={handleTreemapTileClick} />}
        {screen === 'step3' && (
          <HierarchyEditor
            nodes={nodes}
            setNodes={setNodes}
            path={path}
            setPath={setPath}
            onContinue={() => setScreen('step4')}
            scenarioImpact={scenarioImpact}
            autoRebalance={autoRebalance}
            setAutoRebalance={setAutoRebalance}
            onSaveScenario={saveSpaceScenario}
          />
        )}
        {screen === 'step4' && (
          <StepOutputReview
            onNavigate={setScreen}
            scenarioImpact={scenarioImpact}
            nodes={nodes}
            onSaveScenario={saveSpaceScenario}
          />
        )}
        {screen === 'budget-scope' && (
          <BudgetScopePicker
            nodes={nodes}
            scope={budgetScope}
            setScope={setBudgetScope}
            onContinue={() => setScreen('budget-edit')}
            onBack={() => setScreen('planner-door')}
          />
        )}
        {screen === 'budget-edit' && (
          <BudgetEditor
            nodes={nodes}
            scope={budgetScope}
            budget={budget}
            setBudget={setBudget}
            distribution={distribution}
            setDistribution={setDistribution}
            allocations={allocations}
            onContinue={() => setScreen('budget-output')}
            onBack={() => setScreen('budget-scope')}
          />
        )}
        {screen === 'budget-output' && (
          <BudgetOutputReview
            scope={budgetScope}
            distribution={distribution}
            budgetImpact={budgetImpact}
            allocations={allocations}
            onNavigate={setScreen}
          />
        )}
        {screen === 'health' && <StoreHealthScreen onNavigate={setScreen} />}
        {screen === 'store-detail' && <PulseStoreWorkspaceScreen onNavigate={setScreen} />}
        {screen === 'category-l2' && <CategoryHealthScreen level="l2" onNavigate={setScreen} />}
        {screen === 'category-l3' && <CategoryHealthScreen level="l3" onNavigate={setScreen} />}
        {screen === 'category-l4' && <CategoryHealthScreen level="l4" onNavigate={setScreen} />}
        {screen === 'sku-list' && <SkuListScreen onNavigate={setScreen} />}
        {screen === 'get-well' && <PulseGetWellEnablementScreen onNavigate={setScreen} />}
        {screen === 'help' && <HowItWorksScreen />}
      </main>
    </div>
  );
}
