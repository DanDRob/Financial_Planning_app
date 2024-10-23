import { Matrix } from 'ml-matrix';

export const generateMonteCarloSimulation = ({
  initialInvestment,
  monthlyContribution,
  years,
  assetAllocation,
  expectedReturns,
  volatility,
  correlationMatrix,
  config = {}
}) => {
  const {
    numSimulations = 1000,
    confidenceIntervals = [0.95, 0.75, 0.5],
    inflationRate = 0.03,
    rebalanceFrequency = 12, // months
    includeFees = true,
    feeStructure = defaultFeeStructure
  } = config;

  const months = years * 12;
  const monthlyData = [];
  const annualData = [];

  // Generate correlated random returns using Cholesky decomposition
  const correlatedReturns = generateCorrelatedReturns({
    expectedReturns,
    volatility,
    correlationMatrix,
    months,
    numSimulations
  });

  for (let sim = 0; sim < numSimulations; sim++) {
    let pathMonthly = [];
    let pathAnnual = [];
    let currentValue = initialInvestment;
    let yearlyValue = initialInvestment;

    for (let month = 0; month <= months; month++) {
      // Apply monthly return and contribution
      const monthlyReturn = calculatePortfolioReturn(
        correlatedReturns[sim][month],
        assetAllocation
      );

      const inflationAdjustedContribution = monthlyContribution * 
        Math.pow(1 + inflationRate, month / 12);

      // Apply fees if enabled
      const fees = includeFees ? 
        calculateFees(currentValue, feeStructure) : 0;

      currentValue = currentValue * (1 + monthlyReturn) + 
        inflationAdjustedContribution - fees;

      // Rebalance if necessary
      if (month % rebalanceFrequency === 0) {
        currentValue = rebalancePortfolio(
          currentValue,
          assetAllocation,
          correlatedReturns[sim][month]
        );
      }

      pathMonthly.push({
        month,
        value: currentValue,
        simulation: sim
      });

      // Track annual values
      if (month % 12 === 0) {
        pathAnnual.push({
          year: month / 12,
          value: currentValue,
          simulation: sim
        });
        yearlyValue = currentValue;
      }
    }

    monthlyData.push(...pathMonthly);
    annualData.push(...pathAnnual);
  }

  // Calculate statistics for different time periods
  const statistics = calculateSimulationStatistics(
    monthlyData,
    annualData,
    confidenceIntervals
  );

  return {
    monthlyData,
    annualData,
    statistics,
    metadata: {
      numSimulations,
      years,
      assetAllocation,
      inflationRate
    }
  };
};

const generateCorrelatedReturns = ({
  expectedReturns,
  volatility,
  correlationMatrix,
  months,
  numSimulations
}) => {
  // Convert annual parameters to monthly
  const monthlyReturns = Object.values(expectedReturns).map(
    r => Math.pow(1 + r, 1/12) - 1
  );
  const monthlyVol = Object.values(volatility).map(
    v => v / Math.sqrt(12)
  );

  // Perform Cholesky decomposition
  const corrMatrix = new Matrix(correlationMatrix);
  const L = corrMatrix.cholesky();

  // Generate random numbers
  const result = [];
  for (let sim = 0; sim < numSimulations; sim++) {
    const simReturns = [];
    for (let month = 0; month < months; month++) {
      // Generate uncorrelated random numbers
      const randomNumbers = monthlyReturns.map((mean, i) => {
        const rand = generateRandomNormal();
        return mean + monthlyVol[i] * rand;
      });

      // Apply correlation
      const correlated = L.mmul(Matrix.columnVector(randomNumbers));
      simReturns.push(correlated.to1DArray());
    }
    result.push(simReturns);
  }

  return result;
};

const generateRandomNormal = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

const calculatePortfolioReturn = (returns, allocation) => {
  return Object.entries(allocation).reduce((sum, [asset, weight], index) => {
    return sum + weight * returns[index];
  }, 0);
};

const rebalancePortfolio = (currentValue, targetAllocation, returns) => {
  const currentAllocation = calculateCurrentAllocation(currentValue, returns);
  const rebalancingTrades = calculateRebalancingTrades(
    currentAllocation,
    targetAllocation,
    currentValue
  );
  
  // Apply trading costs
  const tradingCosts = calculateTradingCosts(rebalancingTrades);
  return currentValue - tradingCosts;
};

const calculateSimulationStatistics = (
  monthlyData,
  annualData,
  confidenceIntervals
) => {
  const statistics = {
    monthly: {},
    annual: {},
    overall: {}
  };

  // Calculate statistics for each time period
  for (let year = 1; year <= Math.max(...annualData.map(d => d.year)); year++) {
    const yearData = annualData.filter(d => d.year === year);
    const values = yearData.map(d => d.value);

    statistics.annual[year] = {
      mean: calculateMean(values),
      median: calculatePercentile(values, 0.5),
      stdDev: calculateStdDev(values),
      confidenceIntervals: calculateConfidenceIntervals(values, confidenceIntervals),
      var: calculateVaR(values, 0.05),
      cvar: calculateCVaR(values, 0.05)
    };
  }

  // Calculate overall statistics
  const finalValues = annualData.filter(
    d => d.year === Math.max(...annualData.map(d => d.year))
  );
  statistics.overall = {
    successRate: calculateSuccessRate(finalValues),
    riskMetrics: calculateRiskMetrics(finalValues),
    distributionMetrics: calculateDistributionMetrics(finalValues)
  };

  return statistics;
};

const defaultFeeStructure = {
  managementFee: 0.0025, // 0.25% annual
  tradingCosts: 0.0010,  // 0.10% per trade
  adminFee: 0.0005      // 0.05% annual
};

export const calculateSuccessRate = (values, targetValue) => {
  return (values.filter(v => v.value >= targetValue).length / values.length) * 100;
};

export const calculateRiskMetrics = (values) => {
  const data = values.map(v => v.value);
  return {
    maxDrawdown: calculateMaxDrawdown(data),
    sharpeRatio: calculateSharpeRatio(data),
    sortinoRatio: calculateSortinoRatio(data),
    calmarRatio: calculateCalmarRatio(data)
  };
};

export const calculateDistributionMetrics = (values) => {
  const data = values.map(v => v.value);
  return {
    skewness: calculateSkewness(data),
    kurtosis: calculateKurtosis(data),
    jarqueBera: calculateJarqueBera(data)
  };
};