import { Matrix } from 'ml-matrix';
import { calculateRiskMetrics } from './riskUtils';

export const calculateOptimalPortfolio = ({
  assets,
  constraints,
  marketViews,
  riskTolerance,
  options = {
    useBlackLitterman: true,
    useCVaR: true,
    useResampling: true,
    useRobustOptimization: true
  }
}) => {
  // Initialize optimization parameters
  const returns = calculateExpectedReturns(assets, marketViews);
  const covariance = calculateRobustCovariance(assets);
  const viewsMatrix = constructViewsMatrix(marketViews);
  
  // Apply Black-Litterman model if enabled
  let expectedReturns = returns;
  let riskMatrix = covariance;
  
  if (options.useBlackLitterman) {
    const blResult = applyBlackLitterman({
      returns,
      covariance,
      marketViews,
      viewsMatrix,
      marketCap: assets.map(a => a.marketCap)
    });
    
    expectedReturns = blResult.returns;
    riskMatrix = blResult.covariance;
  }

  // Apply robust optimization techniques
  if (options.useRobustOptimization) {
    riskMatrix = applyRobustification(riskMatrix, options);
  }

  // Set up optimization constraints
  const optimizationConstraints = constructConstraints({
    ...constraints,
    riskTolerance,
    useCVaR: options.useCVaR
  });

  // Perform portfolio optimization
  const result = optimizePortfolio({
    expectedReturns,
    riskMatrix,
    constraints: optimizationConstraints,
    options
  });

  // Calculate additional metrics
  const metrics = calculatePortfolioMetrics(result.weights, assets, riskMatrix);

  return {
    allocation: result.weights,
    metrics,
    diagnostics: {
      expectedReturn: result.expectedReturn,
      risk: result.risk,
      sharpeRatio: result.sharpeRatio,
      diversificationScore: calculateDiversificationScore(result.weights)
    }
  };
};

const applyBlackLitterman = ({
  returns,
  covariance,
  marketViews,
  viewsMatrix,
  marketCap
}) => {
  // Calculate market equilibrium returns
  const equilibriumReturns = calculateEquilibriumReturns(marketCap, covariance);
  
  // Construct view matrices
  const P = new Matrix(viewsMatrix);
  const Q = new Matrix(marketViews.map(v => v.estimate));
  const omega = calculateViewUncertainty(viewsMatrix, covariance);
  
  // Calculate posterior distribution
  const tau = 0.025; // Prior uncertainty parameter
  const priorCovariance = covariance.mul(tau);
  
  const posterior = calculateBLPosterior({
    equilibriumReturns,
    priorCovariance,
    viewMatrix: P,
    viewEstimates: Q,
    viewUncertainty: omega
  });
  
  return posterior;
};

const optimizePortfolio = ({
  expectedReturns,
  riskMatrix,
  constraints,
  options
}) => {
  if (options.useResampling) {
    return resampledOptimization(
      expectedReturns,
      riskMatrix,
      constraints,
      options
    );
  }

  return standardOptimization(
    expectedReturns,
    riskMatrix,
    constraints
  );
};

const resampledOptimization = (
  expectedReturns,
  riskMatrix,
  constraints,
  options
) => {
  const numResamples = options.numResamples || 1000;
  const resampledWeights = [];

  for (let i = 0; i < numResamples; i++) {
    // Generate resampled returns and covariance
    const resampledReturns = resampleReturns(expectedReturns);
    const resampledRisk = resampleCovariance(riskMatrix);

    // Optimize for this sample
    const result = standardOptimization(
      resampledReturns,
      resampledRisk,
      constraints
    );

    resampledWeights.push(result.weights);
  }

  // Aggregate resampled weights
  return aggregateResampledWeights(resampledWeights);
};

const standardOptimization = (expectedReturns, riskMatrix, constraints) => {
  // Implement quadratic programming optimization
  const result = solveQP({
    Q: riskMatrix.toJSON(),
    c: expectedReturns.map(r => -r), // Negative because we minimize
    A: constructConstraintMatrix(constraints),
    b: constructConstraintBounds(constraints)
  });

  return {
    weights: result.solution,
    expectedReturn: calculatePortfolioReturn(result.solution, expectedReturns),
    risk: calculatePortfolioRisk(result.solution, riskMatrix)
  };
};

const constructConstraints = ({
  minWeights,
  maxWeights,
  sectorConstraints,
  riskTolerance,
  useCVaR
}) => {
  const constraints = {
    weights: {
      min: minWeights,
      max: maxWeights
    },
    sectors: sectorConstraints
  };

  if (useCVaR) {
    constraints.cvar = {
      alpha: 0.05,
      maxCVaR: calculateCVaRLimit(riskTolerance)
    };
  }

  return constraints;
};

export const calculatePortfolioMetrics = (weights, assets, riskMatrix) => {
  return {
    expectedReturn: calculatePortfolioReturn(weights, assets),
    volatility: calculatePortfolioVolatility(weights, riskMatrix),
    sharpeRatio: calculateSharpeRatio(weights, assets, riskMatrix),
    drawdown: calculateExpectedDrawdown(weights, assets),
    beta: calculatePortfolioBeta(weights, assets),
    turnover: calculateTurnover(weights, assets),
    sectorExposure: calculateSectorExposure(weights, assets),
    factorExposures: calculateFactorExposures(weights, assets)
  };
};

export const calculateEfficientFrontier = (
  assets,
  constraints,
  numPoints = 50
) => {
  const minReturn = Math.min(...assets.map(a => a.expectedReturn));
  const maxReturn = Math.max(...assets.map(a => a.expectedReturn));
  const step = (maxReturn - minReturn) / (numPoints - 1);

  const frontierPoints = [];
  for (let i = 0; i < numPoints; i++) {
    const targetReturn = minReturn + step * i;
    const result = calculateOptimalPortfolio({
      assets,
      constraints: {
        ...constraints,
        targetReturn
      }
    });

    frontierPoints.push({
      return: targetReturn,
      risk: result.metrics.volatility,
      weights: result.allocation,
      sharpeRatio: result.metrics.sharpeRatio
    });
  }

  return frontierPoints;
};