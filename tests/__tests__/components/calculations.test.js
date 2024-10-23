import {
    calculateOptimalPortfolio,
    calculateTaxStrategy,
    generateMonteCarloSimulation
} from '@/utils/calculations';
import { mockPortfolioData } from '../mocks';
  
  describe('Portfolio Optimization', () => {
    test('calculates optimal portfolio allocation', () => {
      const result = calculateOptimalPortfolio({
        portfolio: mockPortfolioData,
        constraints: {
          maxAllocation: 0.6,
          minAllocation: 0.1
        }
      });
  
      expect(result.allocation).toBeDefined();
      expect(Object.values(result.allocation).reduce((a, b) => a + b)).toBeCloseTo(1);
      expect(Math.max(...Object.values(result.allocation))).toBeLessThanOrEqual(0.6);
      expect(Math.min(...Object.values(result.allocation))).toBeGreaterThanOrEqual(0.1);
    });
  
    test('respects risk tolerance constraints', () => {
      const result = calculateOptimalPortfolio({
        portfolio: mockPortfolioData,
        constraints: {
          riskTolerance: 0.5
        }
      });
  
      expect(result.metrics.volatility).toBeLessThanOrEqual(0.5);
    });
  });
  
  describe('Monte Carlo Simulation', () => {
    test('generates correct number of simulations', () => {
      const result = generateMonteCarloSimulation({
        initialInvestment: 100000,
        monthlyContribution: 1000,
        years: 10,
        numSimulations: 1000
      });
  
      expect(result.simulations).toHaveLength(1000);
      expect(result.statistics.confidenceIntervals).toBeDefined();
    });
  
    test('calculates realistic returns', () => {
      const result = generateMonteCarloSimulation({
        initialInvestment: 100000,
        monthlyContribution: 1000,
        years: 10
      });
  
      const finalValues = result.simulations.map(sim => 
        sim.values[sim.values.length - 1]
      );
  
      const averageReturn = (Math.max(...finalValues) / 100000) ** (1/10) - 1;
      expect(averageReturn).toBeGreaterThan(0.02); // Reasonable lower bound
      expect(averageReturn).toBeLessThan(0.20); // Reasonable upper bound
    });
  });
  
  describe('Tax Strategy', () => {
    test('identifies tax loss harvesting opportunities', () => {
      const result = calculateTaxStrategy({
        portfolio: mockPortfolioData,
        taxRates: {
          federal: 0.24,
          state: 0.093
        }
      });
  
      expect(result.harvestingOpportunities).toBeDefined();
      expect(result.projectedSavings).toBeGreaterThan(0);
    });
  
    test('optimizes asset location', () => {
      const result = calculateTaxStrategy({
        portfolio: mockPortfolioData,
        taxRates: {
          federal: 0.24,
          state: 0.093
        }
      });
  
      expect(result.assetLocation).toBeDefined();
      expect(Object.keys(result.assetLocation)).toContain('taxable');
      expect(Object.keys(result.assetLocation)).toContain('taxDeferred');
    });
  });