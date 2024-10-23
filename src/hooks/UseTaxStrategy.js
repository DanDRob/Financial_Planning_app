import { useCallback, useEffect, useState } from 'react';
import { HarvestingCalculator } from '../utils/calculations/harvestingUtils';
import { TaxOptimizer } from '../utils/calculations/taxUtils';

export const useTaxStrategy = (portfolio, taxRates, preferences = {}) => {
  const [strategy, setStrategy] = useState(null);
  const [harvesting, setHarvesting] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);

  const [config, setConfig] = useState({
    harvestingThreshold: 1000,
    minHoldingPeriod: 31, // days
    washSaleWindow: 30, // days
    rebalanceFrequency: 'quarterly',
    prioritizeLongTerm: true,
    ...preferences
  });

  useEffect(() => {
    if (portfolio) {
      optimizeStrategy();
    }
  }, [portfolio, taxRates]);

  const optimizeStrategy = useCallback(async (customConfig = {}) => {
    setIsOptimizing(true);
    setError(null);

    try {
      const optimizer = new TaxOptimizer(portfolio, taxRates, {
        ...config,
        ...customConfig
      });

      const harvestingCalculator = new HarvestingCalculator(
        portfolio,
        taxRates,
        config
      );

      // Run optimizations in parallel
      const [optimizationResult, harvestingResult] = await Promise.all([
        optimizer.optimizePortfolio(),
        harvestingCalculator.findOpportunities()
      ]);

      // Calculate overall tax efficiency
      const taxEfficiency = calculateTaxEfficiency(
        optimizationResult,
        harvestingResult
      );

      // Generate recommendations
      const recommendations = generateTaxRecommendations(
        optimizationResult,
        harvestingResult,
        taxEfficiency
      );

      const enhancedStrategy = {
        ...optimizationResult,
        taxEfficiency,
        recommendations,
        projectedSavings: calculateProjectedSavings(
          optimizationResult,
          harvestingResult
        )
      };

      setStrategy(enhancedStrategy);
      setHarvesting(harvestingResult);

      return {
        strategy: enhancedStrategy,
        harvesting: harvestingResult
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsOptimizing(false);
    }
  }, [portfolio, taxRates, config]);

  const calculateTaxEfficiency = (strategy, harvesting) => {
    const metrics = {
      assetLocationScore: calculateAssetLocationEfficiency(strategy.assetLocations),
      harvestingEfficiency: calculateHarvestingEfficiency(harvesting),
      withdrawalEfficiency: calculateWithdrawalEfficiency(strategy.withdrawalStrategy),
      overall: 0
    };

    // Calculate weighted overall score
    metrics.overall = (
      metrics.assetLocationScore * 0.4 +
      metrics.harvestingEfficiency * 0.3 +
      metrics.withdrawalEfficiency * 0.3
    );

    return metrics;
  };

  const calculateAssetLocationEfficiency = (assetLocations) => {
    let efficiency = 0;
    const totalAssets = Object.values(assetLocations).reduce(
      (sum, accounts) => sum + Object.values(accounts).reduce((a, b) => a + b, 0),
      0
    );

    // Score each asset's location
    for (const [accountType, assets] of Object.entries(assetLocations)) {
      for (const [asset, value] of Object.entries(assets)) {
        const weight = value / totalAssets;
        const locationScore = getAssetLocationScore(asset, accountType);
        efficiency += weight * locationScore;
      }
    }

    return efficiency;
  };

  const getAssetLocationScore = (asset, accountType) => {
    const scores = {
      bonds: {
        traditional: 1.0,
        roth: 0.6,
        taxable: 0.3
      },
      stocks: {
        traditional: 0.5,
        roth: 1.0,
        taxable: 0.7
      },
      reits: {
        traditional: 0.9,
        roth: 0.7,
        taxable: 0.3
      }
    };

    const assetType = determineAssetType(asset);
    return scores[assetType]?.[accountType] ?? 0.5;
  };

  const calculateHarvestingEfficiency = (harvesting) => {
    if (!harvesting?.opportunities?.length) return 0;

    const totalLosses = harvesting.opportunities.reduce(
      (sum, opp) => sum + Math.abs(opp.unrealizedLoss),
      0
    );

    const harvestedLosses = harvesting.opportunities.reduce(
      (sum, opp) => sum + (opp.harvestable ? Math.abs(opp.unrealizedLoss) : 0),
      0
    );

    return harvestedLosses / totalLosses;
  };

  const calculateWithdrawalEfficiency = (withdrawalStrategy) => {
    if (!withdrawalStrategy) return 0;

    const totalWithdrawal = withdrawalStrategy.totalAmount;
    const taxableAmount = withdrawalStrategy.taxableAmount;

    return 1 - (taxableAmount / totalWithdrawal);
  };

  const generateTaxRecommendations = (strategy, harvesting, efficiency) => {
    const recommendations = [];

    // Asset location recommendations
    if (efficiency.assetLocationScore < 0.8) {
      const suboptimalLocations = findSuboptimalLocations(strategy.assetLocations);
      recommendations.push(...generateLocationRecommendations(suboptimalLocations));
    }

    // Harvesting recommendations
    if (harvesting.opportunities.length > 0) {
      recommendations.push(...generateHarvestingRecommendations(harvesting));
    }

    // Withdrawal strategy recommendations
    if (strategy.withdrawalStrategy) {
      recommendations.push(
        ...generateWithdrawalRecommendations(strategy.withdrawalStrategy)
      );
    }

    return recommendations;
  };

  const calculateProjectedSavings = (strategy, harvesting) => {
    return {
      harvestingSavings: calculateHarvestingSavings(harvesting),
      locationSavings: calculateLocationSavings(strategy.assetLocations),
      withdrawalSavings: calculateWithdrawalSavings(strategy.withdrawalStrategy),
      total: 0 // Will be sum of above
    };
  };

  return {
    strategy,
    harvesting,
    isOptimizing,
    error,
    optimize: optimizeStrategy,
    updateConfig: setConfig
  };
};