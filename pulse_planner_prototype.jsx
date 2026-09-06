import React, { useState, useMemo } from 'react';
import {
  Lock, ChevronRight, ArrowRight, ArrowLeft, BarChart3, LayoutGrid,
  List, HelpCircle, Beaker, Edit3, AlertTriangle, Save, Download,
  DollarSign, Grid3x3, RotateCcw, Store, Info, Check, X, Zap, Scale,
  Search, Home, Package, CheckCircle2, FileText, SlidersHorizontal,
  BookOpen, ChevronDown, ArrowDownUp,
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
        <NavBtn id="planner-door" icon={Beaker} label="Scenario planner" active={isPlanner} accent badge="NEW" />
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

function SkuListScreen() {
  const [query, setQuery] = useState('');
  const [action, setAction] = useState('All actions');
  const rows = CURRENT_SKUS.filter(row => `${row.part} ${row.description} ${row.brand}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <Breadcrumb items={['Assortment overview','ATL-466','Hardware & Components L3-2','SKU list']} />
      <h1 className="text-[22px] font-medium">SKU list</h1><p className="text-sm text-gray-500 mt-1">Explore and review SKUs across your stores</p>
      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 flex gap-4"><div className="w-10 h-10 rounded-xl bg-white text-blue-700 flex items-center justify-center"><Package size={19} /></div><div className="flex-1"><div className="flex justify-between"><strong className="text-sm">{rows.length} recommended SKUs</strong><button onClick={() => { setQuery(''); setAction('All actions'); }} className="text-xs text-gray-600 underline">Clear selection</button></div><p className="text-xs text-gray-600 mt-1">These SKUs are ranked by their impact on inventory health. Review the system-recommended items, then export the list for ordering, returns, or keeping inventory.</p><div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-2 text-gray-600"><span><i className="text-blue-600 not-italic">●</i> Store: ATL-466 (FORT GAINES GA)</span><span><i className="text-blue-600 not-italic">●</i> Category: Body &amp; Accessories</span><span><i className="text-blue-600 not-italic">●</i> Brand: All brands</span><button onClick={() => setAction(action === 'All actions' ? 'Order' : 'All actions')}><i className="text-blue-600 not-italic">●</i> Action: {action} <ChevronDown size={12} className="inline" /></button></div></div></div>
      <section className="mt-4 bg-white border border-gray-200 rounded-2xl p-4 overflow-hidden"><label className="relative inline-block mb-4"><Search size={15} className="absolute left-3 top-2.5 text-gray-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" className="w-72 pl-9 pr-3 py-2 border border-gray-200 rounded-full text-sm outline-none focus:border-blue-500" /></label><div className="overflow-auto"><table className="w-full text-xs min-w-[1000px]"><thead className="bg-gray-100 text-gray-600"><tr>{['Rank','Part number','Part description','Field abbr.','Store ID','Category L1','Category L2','Category L3','Category L4','Status'].map(h => <th key={h} className="text-left font-medium px-3 py-3 whitespace-nowrap">{h} ↓</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{rows.map(row => <tr key={row.rank} className="hover:bg-gray-50"><td className="px-3 py-3 font-medium">{row.rank}</td><td className="px-3 py-3">{row.part}</td><td className="px-3 py-3 font-medium">{row.description}</td><td className="px-3 py-3">{row.brand}</td><td className="px-3 py-3">ATL-466<br /><span className="text-gray-500">(FORT GAINES GA)</span></td><td className="px-3 py-3">Body &amp; Accessories</td><td className="px-3 py-3">Interior</td><td className="px-3 py-3">Hardware &amp; Components</td><td className="px-3 py-3">{row.l4}</td><td className="px-3 py-3"><span className="rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1">• {row.status}</span></td></tr>)}</tbody></table></div></section>
      <div className="sticky bottom-4 mx-auto mt-4 max-w-md bg-blue-800 text-white rounded-2xl px-5 py-3 flex justify-between items-center shadow-lg"><div><strong className="text-sm">{rows.length} SKUs</strong><p className="text-[11px] text-blue-100">CSV: SKU number + Store ID</p></div><button onClick={() => downloadSkuCsv(rows)} className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm flex items-center gap-2"><Download size={15} />Export SKUs</button></div>
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
  ];
  return <div><Breadcrumb items={['Pulse AI','How it works']} /><h1 className="text-[22px] font-medium">How Pulse AI works</h1><p className="text-sm text-gray-500 mt-1 max-w-3xl">A feature guide reconstructed from the supplied current-product reference photos. The scenario planner is explicitly marked as a prototype extension.</p><div className="mt-5 grid grid-cols-2 gap-4">{features.map(([title,body],i) => <section key={title} className="bg-white border border-gray-200 rounded-2xl p-5"><div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">{i === 5 ? <Beaker size={18} /> : i === 4 ? <Download size={18} /> : i === 3 ? <List size={18} /> : i === 2 ? <BarChart3 size={18} /> : i === 1 ? <Store size={18} /> : <SlidersHorizontal size={18} />}</div><h2 className="font-medium">{title}</h2><p className="text-sm text-gray-600 mt-2 leading-relaxed">{body}</p></section>)}</div><section className="mt-4 bg-gray-900 text-white rounded-2xl p-5"><div className="flex gap-3"><BookOpen size={19} className="text-blue-300 mt-0.5" /><div><h2 className="font-medium">Prototype evidence note</h2><p className="text-sm text-gray-300 mt-1 leading-relaxed">The current-feature inventory is limited to what is visible in the photos dated April 26, 2026. Authentication, permissions, backend calculations, and production side effects are not inferable from screenshots, so this prototype uses realistic mock data and client-side interactions only.</p></div></div></section></div>;
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
        {screen === 'store-detail' && <StoreDetailScreen onNavigate={setScreen} />}
        {screen === 'category-l2' && <CategoryHealthScreen level="l2" onNavigate={setScreen} />}
        {screen === 'category-l3' && <CategoryHealthScreen level="l3" onNavigate={setScreen} />}
        {screen === 'category-l4' && <CategoryHealthScreen level="l4" onNavigate={setScreen} />}
        {screen === 'sku-list' && <SkuListScreen />}
        {screen === 'help' && <HowItWorksScreen />}
      </main>
    </div>
  );
}
