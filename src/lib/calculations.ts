export interface ImportCostParams {
  fobValue: number;
  freight: number;
  insurance: number;
  quantity: number;
  exchangeRate: number;
  iiRate: number;
  pisRate: number;
  cofinsRate: number;
  icmsRate: number;
  icmsFactor: number;
  siscomexFixed: number;
  customsOpCost: number;
  sellingPrice?: number;
  salesTaxRate: number;
  opExRate: number;
}

export interface NationalizationResult {
  valorAduaneiro: number;
  impostoImportacao: number;
  pis: number;
  cofins: number;
  baseIcms: number;
  icms: number;
  custoTotal: number;
  custoUnitario: number;
}

export function calcNationalization(p: ImportCostParams): NationalizationResult {
  const valorAduaneiro =
    (p.fobValue + p.freight + p.insurance) * p.quantity * p.exchangeRate;

  const impostoImportacao = valorAduaneiro * p.iiRate;
  const pis = valorAduaneiro * p.pisRate;
  const cofins = valorAduaneiro * p.cofinsRate;

  const baseIcms =
    (valorAduaneiro + impostoImportacao + pis + cofins + p.siscomexFixed) /
    p.icmsFactor;

  const icms = baseIcms * p.icmsRate;

  const custoTotal = baseIcms + p.customsOpCost;
  const custoUnitario = p.quantity > 0 ? custoTotal / p.quantity : 0;

  return {
    valorAduaneiro,
    impostoImportacao,
    pis,
    cofins,
    baseIcms,
    icms,
    custoTotal,
    custoUnitario,
  };
}

// --- Renda Fixa (FIXED) ---

export interface FixedReturnParams {
  principal: number;
  fixedRateMonthly: number;
  days: number;
}

export interface FixedReturnResult {
  grossReturn: number;
  irRate: number;
  irAmount: number;
  netReturn: number;
}

function getIrRate(days: number): number {
  if (days <= 180) return 0.225;
  if (days <= 360) return 0.2;
  if (days <= 720) return 0.175;
  return 0.15;
}

export function calcFixedReturn(p: FixedReturnParams): FixedReturnResult {
  const months = p.days / 30;
  const grossReturn =
    p.principal * (Math.pow(1 + p.fixedRateMonthly, months) - 1);
  const irRate = getIrRate(p.days);
  const irAmount = grossReturn * irRate;
  const netReturn = grossReturn - irAmount;

  return { grossReturn, irRate, irAmount, netReturn };
}

// --- Profit Share / Reinvestimento ---

export interface ReinvestmentParams {
  capital: number;
  fobValue: number;
  freight: number;
  insurance: number;
  exchangeRate: number;
  iiRate: number;
  pisRate: number;
  cofinsRate: number;
  icmsFactor: number;
  siscomexFixed: number;
  customsOpCost: number;
}

export interface ReinvestmentResult {
  custoVariavelUnit: number;
  custoFixoLote: number;
  maxQuantity: number;
  custoTotalImport: number;
  carryover: number;
}

export function calcReinvestment(p: ReinvestmentParams): ReinvestmentResult {
  const custoVariavelUnit =
    ((p.fobValue + p.freight + p.insurance) *
      p.exchangeRate *
      (1 + p.iiRate + p.pisRate + p.cofinsRate)) /
    p.icmsFactor;

  const custoFixoLote = p.siscomexFixed / p.icmsFactor + p.customsOpCost;

  const maxQuantityRaw = Math.floor(
    (p.capital - custoFixoLote) / custoVariavelUnit
  );

  const maxQuantity = Math.max(0, maxQuantityRaw);
  const custoTotalImport = maxQuantity > 0 ? maxQuantity * custoVariavelUnit + custoFixoLote : 0;
  const carryover = p.capital - custoTotalImport;

  return {
    custoVariavelUnit,
    custoFixoLote,
    maxQuantity,
    custoTotalImport,
    carryover,
  };
}

export interface ProfitSplitParams {
  grossRevenue: number;
  salesTaxRate: number;
  opExRate: number;
  carryover: number;
  custoTotalImport: number;
  investorSplitPct: number;
}

export interface ProfitSplitResult {
  salesTax: number;
  opExpenses: number;
  netProfit: number;
  investorShare: number;
  companyShare: number;
  capitalNext: number;
}

export function calcProfitSplit(p: ProfitSplitParams): ProfitSplitResult {
  const salesTax = p.grossRevenue * p.salesTaxRate;
  const opExpenses = p.grossRevenue * p.opExRate;

  const netProfit =
    p.grossRevenue - salesTax - opExpenses + p.carryover - p.custoTotalImport;

  const investorShare = netProfit * p.investorSplitPct;
  const companyShare = netProfit - investorShare;
  const capitalNext = p.custoTotalImport + investorShare;

  return {
    salesTax,
    opExpenses,
    netProfit,
    investorShare,
    companyShare,
    capitalNext,
  };
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPercent(value: number): string {
  return (value * 100).toFixed(2) + "%";
}

// --- Lot Escalation Simulator ---

export interface SimulatorInputs {
  initialCapital: number;
  fobUnitUSD: number;
  freightUnitUSD: number;
  exchangeRate: number;
  salePricePerUnit: number;
  iiRate: number;
  pisRate: number;
  cofinsRate: number;
  icmsFactor: number;
  icmsRate: number;
  siscomexFixed: number;
  custoOpFixed: number;
  salesTaxRate: number;
  opExRate: number;
  investorSplitPct: number;
  numBatches: number;
}

export interface BatchProjection {
  batch: number;
  capital: number;
  unitCostBRL: number;
  maxUnits: number;
  totalImportCost: number;
  grossRevenue: number;
  salesTax: number;
  opExpenses: number;
  netProfit: number;
  investorShare: number;
  companyShare: number;
  roi: number;
  nextCapital: number;
}

export function projectFutureBatches(inputs: SimulatorInputs): BatchProjection[] {
  const projections: BatchProjection[] = [];
  let capital = inputs.initialCapital;

  for (let batch = 1; batch <= inputs.numBatches; batch++) {
    // 1. Calculate per-unit import cost in BRL
    const valorAduaneiroUnit =
      (inputs.fobUnitUSD + inputs.freightUnitUSD) * inputs.exchangeRate;

    const iiUnit = valorAduaneiroUnit * inputs.iiRate;
    const pisUnit = valorAduaneiroUnit * inputs.pisRate;
    const cofinsUnit = valorAduaneiroUnit * inputs.cofinsRate;

    // ICMS gross-up: (VA + II + PIS + COFINS + siscomex_per_unit) / icmsFactor
    // siscomex is fixed per lot, so we handle it separately
    const preTaxUnit = valorAduaneiroUnit + iiUnit + pisUnit + cofinsUnit;
    const unitCostBeforeIcms = preTaxUnit / inputs.icmsFactor;
    const icmsUnit = unitCostBeforeIcms * inputs.icmsRate;

    // Per-unit cost includes the ICMS gross-up
    const unitCostBRL = unitCostBeforeIcms;

    // 2. Determine how many units we can buy with available capital
    // Total cost = units * unitCostBRL + siscomexFixed + custoOpFixed
    const fixedCosts = inputs.siscomexFixed / inputs.icmsFactor + inputs.custoOpFixed;
    const maxUnits = Math.max(0, Math.floor((capital - fixedCosts) / unitCostBRL));

    if (maxUnits <= 0) {
      projections.push({
        batch,
        capital,
        unitCostBRL,
        maxUnits: 0,
        totalImportCost: 0,
        grossRevenue: 0,
        salesTax: 0,
        opExpenses: 0,
        netProfit: 0,
        investorShare: 0,
        companyShare: 0,
        roi: 0,
        nextCapital: capital,
      });
      break;
    }

    const totalImportCost = maxUnits * unitCostBRL + fixedCosts;

    // 3. Calculate revenue
    const grossRevenue = maxUnits * inputs.salePricePerUnit;

    // 4. Deductions
    const salesTax = grossRevenue * inputs.salesTaxRate;
    const opExpenses = grossRevenue * inputs.opExRate;

    // 5. Net profit
    const netProfit = grossRevenue - salesTax - opExpenses - totalImportCost;

    // 6. Profit split
    const investorShare = netProfit > 0 ? netProfit * inputs.investorSplitPct : 0;
    const companyShare = netProfit > 0 ? netProfit - investorShare : 0;

    // 7. ROI for investor
    const roi = capital > 0 ? parseFloat(((investorShare / capital) * 100).toFixed(2)) : 0;

    // 8. Next batch capital = totalImportCost + investorShare
    const nextCapital = totalImportCost + investorShare;

    projections.push({
      batch,
      capital,
      unitCostBRL,
      maxUnits,
      totalImportCost,
      grossRevenue,
      salesTax,
      opExpenses,
      netProfit,
      investorShare,
      companyShare,
      roi,
      nextCapital,
    });

    capital = nextCapital;
  }

  return projections;
}
