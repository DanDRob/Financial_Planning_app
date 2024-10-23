import { useCallback, useState } from 'react';
import { generateMonteCarloSimulation } from '../utils/calculations/monteCarloUtils';

export const useMonteCarloSimulation = (initialConfig = {}) => {
  const [results, setResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    numSimulations: 1000,
    yearsToProject: 30,
    confidenceIntervals: [0.95, 0.75, 0.5],
    inflationRate: 0.03,
    ...initialConfig
  });

  const runSimulation = useCallback(async ({
    initialInvestment,
    monthlyContribution,
    assetAllocation,
    expectedReturns,
    volatility,
    correlationMatrix,
    customConfig = {}
  }) => {
    setIsSimulating(true);
    setError(null);

    try {
      const simulationConfig = {
        ...config,
        ...customConfig,
        marketAssumptions: {
          expectedReturns,
          volatility,
          correlationMatrix
        }
      };

      const simulationResults = await generateMonteCarloSimulation({
        initialInvestment,
        monthlyContribution,
        assetAllocation,
        config: simulationConfig
      });

      // Calculate additional metrics
      const enhancedResults = {
        ...simulationResults,
        metrics: {
          successRate: calculateSuccessRate(simulationResults.simulations),
          medianOutcome: calculateMedianOutcome(simulationResults.simulations),
          worstCase: calculateWorstCase(simulationResults.simulations),
          bestCase: calculateBestCase(simulationResults.simulations),
          riskMetrics: calculateRiskMetrics(simulationResults.simulations)
        }
      };

      setResults(enhancedResults);
      return enhancedResults;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSimulating(false);
    }
  }, [config]);

  const calculateSuccessRate = (simulations) => {
    const targetValue = config.targetValue || Infinity;
    const successfulRuns = simulations.filter(sim => 
      Math.max(...sim.values) >= targetValue
    );
    return (successfulRuns.length / simulations.length) * 100;
  };

  const calculateMedianOutcome = (simulations) => {
    const finalValues = simulations.map(sim => sim.values[sim.values.length - 1]);
    const sorted = [...finalValues].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted[middle];
  };

  const calculateWorstCase = (simulations) => {
    const finalValues = simulations.map(sim => sim.values[sim.values.length - 1]);
    return Math.min(...finalValues);
  };

  const calculateBestCase = (simulations) => {
    const finalValues = simulations.map(sim => sim.values[sim.values.length - 1]);
    return Math.max(...finalValues);
  };

  const calculateRiskMetrics = (simulations) => {
    const finalValues = simulations.map(sim => sim.values[sim.values.length - 1]);
    
    // Calculate Value at Risk (VaR)
    const sorted = [...finalValues].sort((a, b) => a - b);
    const varIndex = Math.floor(sorted.length * 0.05);
    const valueAtRisk = sorted[varIndex];

    // Calculate maximum drawdown
    const maxDrawdown = simulations.reduce((maxDD, sim) => {
      let peak = sim.values[0];
      let maxDrawdownForSim = 0;

      sim.values.forEach(value => {
        if (value > peak) {
          peak = value;
        }
        const drawdown = (peak - value) / peak;
        maxDrawdownForSim = Math.max(maxDrawdownForSim, drawdown);
      });

      return Math.max(maxDD, maxDrawdownForSim);
    }, 0);

    return {
      valueAtRisk,
      maxDrawdown,
      volatility: calculateVolatility(finalValues),
      sharpeRatio: calculateSharpeRatio(finalValues),
      sortinoRatio: calculateSortinoRatio(finalValues)
    };
  };

  const calculateVolatility = (values) => {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.sqrt(variance);
  };

  const calculateSharpeRatio = (values) => {
    const riskFreeRate = config.riskFreeRate || 0.02;
    const returns = values.map((value, index) => 
      index === 0 ? 0 : (value - values[index - 1]) / values[index - 1]
    );
    const meanReturn = returns.reduce((sum, value) => sum + value, 0) / returns.length;
    const volatility = calculateVolatility(returns);
    return (meanReturn - riskFreeRate) / volatility;
  };

  const calculateSortinoRatio = (values) => {
    const riskFreeRate = config.riskFreeRate || 0.02;
    const returns = values.map((value, index) => 
      index === 0 ? 0 : (value - values[index - 1]) / values[index - 1]
    );
    const meanReturn = returns.reduce((sum, value) => sum + value, 0) / returns.length;
    
    const negativeReturns = returns.filter(return_ => return_ < 0);
    const downwardDeviation = Math.sqrt(
      negativeReturns.reduce((sum, value) => sum + Math.pow(value, 2), 0) / 
      negativeReturns.length
    );

    return (meanReturn - riskFreeRate) / downwardDeviation;
  };

  const updateConfig = useCallback((newConfig) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  }, []);

  return {
    results,
    isSimulating,
    error,
    config,
    runSimulation,
    updateConfig
  };
};