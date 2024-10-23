import { useCallback, useEffect, useState } from 'react';
import { calculateOptimalPortfolio } from '../utils/calculations/optimizationUtils';
import { calculateRiskMetrics } from '../utils/calculations/riskUtils';

export const usePortfolioOptimization = (
  initialPortfolio,
  constraints = {},
  marketData = null
) => {
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);

  const [optimizationConfig, setOptimizationConfig] = useState({
    useBlackLitterman: true,
    useCVaR: true,
    useResampling: true,
    riskAversion: 3,
    minWeight: 0.02,
    maxWeight: 0.40,
    targetReturn: null,
    maxVolatility: null
  });

  useEffect(() => {
    if (marketData) {
      updateMarketViews(marketData);
    }
  }, [marketData]);

  const updateMarketViews = useCallback((marketData) => {
    // Update market views based on new data
    const views = generateMarketViews(marketData);
    setOptimizationConfig(prev => ({
      ...prev,
      marketViews: views
    }));
  }, []);

  const optimize = useCallback(async (customConstraints = {}) => {
    setIsOptimizing(true);
    setError(null);

    try {
      const mergedConstraints = {
        ...constraints,
        ...customConstraints
      };

      const result = await calculateOptimalPortfolio({
        currentPortfolio: portfolio,
        constraints: mergedConstraints,
        config: optimizationConfig,
        marketData
      });

      // Calculate additional metrics
      const enhancedResult = {
        ...result,
        metrics: calculateRiskMetrics(result.allocation, marketData),
        recommendations: generateRecommendations(result, portfolio),
        rebalancing: calculateRebalancingNeeds(result.allocation, portfolio)
      };

      setOptimizationResult(enhancedResult);
      return enhancedResult;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsOptimizing(false);
    }
  }, [portfolio, constraints, optimizationConfig, marketData]);

  const generateMarketViews = (marketData) => {
    return {
      // Generate market views based on technical analysis, fundamentals, etc.
      returns: calculateExpectedReturns(marketData),
      confidence: calculateViewConfidence(marketData),
      correlation: calculateCorrelations(marketData)
    };
  };

  const calculateExpectedReturns = (marketData) => {
    // Implement expected returns calculation
    const returns = {};
    for (const asset in marketData) {
      returns[asset] = {
        mean: calculateMeanReturn(marketData[asset]),
        variance: calculateVariance(marketData[asset]),
        momentum: calculateMomentum(marketData[asset])
      };
    }
    return returns;
  };

  const calculateViewConfidence = (marketData) => {
    // Implement view confidence calculation
    const confidence = {};
    for (const asset in marketData) {
      confidence[asset] = {
        technicalScore: calculateTechnicalScore(marketData[asset]),
        fundamentalScore: calculateFundamentalScore(marketData[asset]),
        marketRegimeScore: calculateMarketRegimeScore(marketData[asset])
      };
    }
    return confidence;
  };

  const generateRecommendations = (optimizationResult, currentPortfolio) => {
    const recommendations = [];

    // Analyze major changes
    const significantChanges = findSignificantChanges(
      optimizationResult.allocation,
      currentPortfolio
    );

    // Generate recommendations based on changes
    significantChanges.forEach(change => {
      recommendations.push({
        type: change.type,
        asset: change.asset,
        action: change.action,
        amount: change.amount,
        reason: change.reason,
        impact: calculateImpact(change, optimizationResult.metrics)
      });
    });

    return recommendations;
  };

  const findSignificantChanges = (newAllocation, currentPortfolio) => {
    const changes = [];
    const threshold = 0.05; // 5% change threshold

    for (const asset in newAllocation) {
      const currentWeight = currentPortfolio[asset] || 0;
      const newWeight = newAllocation[asset];
      const difference = newWeight - currentWeight;

      if (Math.abs(difference) >= threshold) {
        changes.push({
          type: 'allocation',
          asset,
          action: difference > 0 ? 'increase' : 'decrease',
          amount: Math.abs(difference),
          reason: determineChangeReason(asset, difference, optimizationResult.metrics)
        });
      }
    }

    return changes;
  };

  const calculateRebalancingNeeds = (targetAllocation, currentPortfolio) => {
    const rebalancing = {
      trades: [],
      totalTurnover: 0,
      estimatedCosts: 0
    };

    for (const asset in targetAllocation) {
      const currentWeight = currentPortfolio[asset] || 0;
      const targetWeight = targetAllocation[asset];
      const difference = targetWeight - currentWeight;

      if (Math.abs(difference) > 0.001) { // 0.1% minimum trade size
        rebalancing.trades.push({
          asset,
          direction: difference > 0 ? 'buy' : 'sell',
          amount: Math.abs(difference),
          estimatedCost: estimateTransactionCost(difference, currentPortfolio.totalValue)
        });
      }
    }

    rebalancing.totalTurnover = rebalancing.trades.reduce(
      (sum, trade) => sum + Math.abs(trade.amount),
      0
    );

    rebalancing.estimatedCosts = rebalancing.trades.reduce(
      (sum, trade) => sum + trade.estimatedCost,
      0
    );

    return rebalancing;
  };

  return {
    portfolio,
    optimizationResult,
    isOptimizing,
    error,
    optimize,
    updateConfig: setOptimizationConfig,
    updateMarketViews
  };
};