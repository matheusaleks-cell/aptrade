import { describe, it, expect } from "vitest";
import { 
  calcNationalization, 
  calcProfitSplit, 
  calcReinvestment, 
  calcFixedReturn
} from "./calculations";

describe("calculations.ts - Testes Unitários das Regras de Negócio", () => {

  describe("calcNationalization", () => {
    it("deve calcular corretamente a nacionalização de importação em um cenário padrão", () => {
      const result = calcNationalization({
        fobValue: 10,
        freight: 2,
        insurance: 1,
        quantity: 100,
        exchangeRate: 5.0,
        iiRate: 0.18,
        pisRate: 0.021,
        cofinsRate: 0.0965,
        icmsRate: 0.18,
        icmsFactor: 0.82,
        siscomexFixed: 150,
        customsOpCost: 500,
        salesTaxRate: 0.08,
        opExRate: 0.15
      });

      // Valor aduaneiro = (10 + 2 + 1) * 100 * 5.0 = 13 * 100 * 5.0 = 6500
      expect(result.valorAduaneiro).toBe(6500);

      // Imposto de Importação = 6500 * 0.18 = 1170
      expect(result.impostoImportacao).toBe(1170);

      // PIS = 6500 * 0.021 = 136.5
      expect(result.pis).toBeCloseTo(136.5, 2);

      // COFINS = 6500 * 0.0965 = 627.25
      expect(result.cofins).toBeCloseTo(627.25, 2);

      // Base ICMS = (6500 + 1170 + 136.5 + 627.25 + 150) / 0.82 = 8583.75 / 0.82 = 10467.9878...
      expect(result.baseIcms).toBeCloseTo(10467.99, 2);

      // ICMS = Base ICMS * 0.18 = 10467.9878 * 0.18 = 1884.2378...
      expect(result.icms).toBeCloseTo(1884.24, 2);

      // Custo Total = Base ICMS + customsOpCost = 10467.9878... + 500 = 10967.9878...
      expect(result.custoTotal).toBeCloseTo(10967.99, 2);

      // Custo Unitário = Custo Total / 100 = 109.679878...
      expect(result.custoUnitario).toBeCloseTo(109.68, 2);
    });

    it("deve tratar valores limites zerados sem gerar erros", () => {
      const result = calcNationalization({
        fobValue: 0,
        freight: 0,
        insurance: 0,
        quantity: 0,
        exchangeRate: 5.0,
        iiRate: 0,
        pisRate: 0,
        cofinsRate: 0,
        icmsRate: 0,
        icmsFactor: 1.0, // Fator 1.0 para evitar divisão por zero
        siscomexFixed: 0,
        customsOpCost: 0,
        salesTaxRate: 0,
        opExRate: 0
      });

      expect(result.valorAduaneiro).toBe(0);
      expect(result.impostoImportacao).toBe(0);
      expect(result.pis).toBe(0);
      expect(result.cofins).toBe(0);
      expect(result.baseIcms).toBe(0);
      expect(result.icms).toBe(0);
      expect(result.custoTotal).toBe(0);
      expect(result.custoUnitario).toBe(0);
    });
  });

  describe("calcProfitSplit", () => {
    it("deve calcular a partilha de lucros positiva de forma correta (padrão 50-50)", () => {
      const result = calcProfitSplit({
        grossRevenue: 10000,
        salesTaxRate: 0.08,
        opExRate: 0.15,
        carryover: 200,
        custoTotalImport: 6000,
        investorSplitPct: 0.50
      });

      // Sales Tax = 10000 * 0.08 = 800
      expect(result.salesTax).toBe(800);

      // OpEx = 10000 * 0.15 = 1500
      expect(result.opExpenses).toBe(1500);

      // Net Profit = 10000 - 800 - 1500 + 200 - 6000 = 1900
      expect(result.netProfit).toBe(1900);

      // Investor Share = 1900 * 0.50 = 950
      expect(result.investorShare).toBe(950);

      // Company Share = 1900 - 950 = 950
      expect(result.companyShare).toBe(950);

      // Capital Next = custoTotalImport + investorShare = 6000 + 950 = 6950
      expect(result.capitalNext).toBe(6950);
    });

    it("deve calcular e refletir prejuízos operacionais de forma proporcional", () => {
      const result = calcProfitSplit({
        grossRevenue: 3000,
        salesTaxRate: 0.08,
        opExRate: 0.15,
        carryover: 100,
        custoTotalImport: 6000,
        investorSplitPct: 0.50
      });

      // Sales Tax = 3000 * 0.08 = 240
      expect(result.salesTax).toBe(240);

      // OpEx = 3000 * 0.15 = 450
      expect(result.opExpenses).toBe(450);

      // Net Profit = 3000 - 240 - 450 + 100 - 6000 = -3590
      expect(result.netProfit).toBe(-3590);

      // Investor Share = -3590 * 0.50 = -1795
      expect(result.investorShare).toBe(-1795);

      // Company Share = -3590 - (-1795) = -1795
      expect(result.companyShare).toBe(-1795);

      // Capital Next = 6000 + (-1795) = 4205
      expect(result.capitalNext).toBe(4205);
    });
  });

  describe("calcReinvestment", () => {
    it("deve calcular a quantidade máxima e carryover corretos no reinvestimento padrão", () => {
      const result = calcReinvestment({
        capital: 10000,
        fobValue: 10,
        freight: 2,
        insurance: 1,
        exchangeRate: 5.0,
        iiRate: 0.18,
        pisRate: 0.021,
        cofinsRate: 0.0965,
        icmsFactor: 0.82,
        siscomexFixed: 150,
        customsOpCost: 500
      });

      // custoVariavelUnit = ((10 + 2 + 1) * 5.0 * (1 + 0.18 + 0.021 + 0.0965)) / 0.82 = 84.3375 / 0.82 = 102.8506...
      expect(result.custoVariavelUnit).toBeCloseTo(102.85, 2);

      // custoFixoLote = 150 / 0.82 + 500 = 682.9268...
      expect(result.custoFixoLote).toBeCloseTo(682.93, 2);

      // maxQuantity = Math.floor((10000 - 682.9268...) / 102.8506...) = Math.floor(9317.0731... / 102.8506...) = 90
      expect(result.maxQuantity).toBe(90);

      // custoTotalImport = 90 * 102.8506... + 682.9268... = 9939.4817...
      expect(result.custoTotalImport).toBeCloseTo(9939.48, 2);

      // carryover = 10000 - 9939.48 = 60.52
      expect(result.carryover).toBeCloseTo(60.52, 2);
    });

    it("deve lidar com capital insuficiente retornando zero produtos e carryover total", () => {
      const result = calcReinvestment({
        capital: 500, // Capital menor que custoFixoLote (682.93)
        fobValue: 10,
        freight: 2,
        insurance: 1,
        exchangeRate: 5.0,
        iiRate: 0.18,
        pisRate: 0.021,
        cofinsRate: 0.0965,
        icmsFactor: 0.82,
        siscomexFixed: 150,
        customsOpCost: 500
      });

      expect(result.maxQuantity).toBe(0);
      expect(result.carryover).toBe(500); // Todo o capital é carryover
    });
  });

  describe("calcFixedReturn (Renda Fixa)", () => {
    it("deve aplicar a tabela regressiva de IR e calcular o retorno líquido", () => {
      // 180 dias -> IR 22.5%
      const result180 = calcFixedReturn({
        principal: 10000,
        fixedRateMonthly: 0.02,
        days: 180
      });
      expect(result180.irRate).toBe(0.225);
      
      // 360 dias -> IR 20%
      const result360 = calcFixedReturn({
        principal: 10000,
        fixedRateMonthly: 0.02,
        days: 360
      });
      expect(result360.irRate).toBe(0.20);

      // 720 dias -> IR 17.5%
      const result720 = calcFixedReturn({
        principal: 10000,
        fixedRateMonthly: 0.02,
        days: 720
      });
      expect(result720.irRate).toBe(0.175);

      // 721 dias -> IR 15%
      const resultMore = calcFixedReturn({
        principal: 10000,
        fixedRateMonthly: 0.02,
        days: 721
      });
      expect(resultMore.irRate).toBe(0.15);
    });
  });

});
