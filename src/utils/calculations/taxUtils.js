import { Matrix } from 'ml-matrix';

export class TaxOptimizer {
  constructor(portfolio, taxRates, config = {}) {
    this.portfolio = portfolio;
    this.taxRates = taxRates;
    this.config = {
      harvestingThreshold: 1000,
      minHoldingPeriod: 31,  // days
      washSaleWindow: 30,    // days
      stateTaxData: this.loadStateTaxData(),
      ...config
    };
  }

  async optimizePortfolio() {
    const assetPlacements = this.optimizeAssetPlacement();
    const harvestingOpportunities = this.findTaxLossHarvestingOpportunities();
    const withdrawalStrategy = this.optimizeWithdrawalStrategy();

    const taxEfficiency = this.calculateTaxEfficiency(
      assetPlacements,
      harvestingOpportunities,
      withdrawalStrategy
    );

    return {
      assetPlacements,
      harvestingOpportunities,
      withdrawalStrategy,
      taxEfficiency,
      projectedSavings: this.calculateProjectedSavings({
        assetPlacements,
        harvestingOpportunities,
        withdrawalStrategy
      })
    };
  }

  optimizeAssetPlacement() {
    const assetScores = this.calculateAssetTaxEfficiency();
    const accountScores = this.calculateAccountTaxEfficiency();
    
    // Use Hungarian algorithm for optimal assignment
    const costMatrix = this.constructCostMatrix(assetScores, accountScores);
    const assignment = this.hungarianAssignment(costMatrix);
    
    return this.translateAssignmentToPlacement(assignment, assetScores);
  }

  findTaxLossHarvestingOpportunities() {
    const opportunities = [];
    const positions = this.portfolio.taxablePositions || [];

    for (const position of positions) {
      const unrealizedLoss = this.calculateUnrealizedLoss(position);
      if (Math.abs(unrealizedLoss) >= this.config.harvestingThreshold) {
        const alternatives = this.findHarvestingAlternatives(position);
        if (alternatives.length > 0) {
          opportunities.push({
            position: position.symbol,
            unrealizedLoss,
            potentialSavings: this.calculateHarvestingSavings(unrealizedLoss),
            alternatives,
            timing: this.optimizeHarvestingTiming(position),
            washSaleRisk: this.assessWashSaleRisk(position)
          });
        }
      }
    }

    return opportunities;
  }

  optimizeWithdrawalStrategy() {
    const accounts = this.portfolio.accounts || {};
    const requiredAmount = this.portfolio.withdrawalNeeds || 0;
    
    return this.generateWithdrawalStrategy(accounts, requiredAmount, {
      minimizeTax: true,
      maintainAssetAllocation: true,
      considerRMDs: true,
      preserveAppreciationPotential: true
    });
  }

  private calculateAssetTaxEfficiency() {
    return this.portfolio.assets.map(asset => ({
      asset: asset.symbol,
      score: this.calculateEfficiencyScore({
        dividendYield: asset.dividendYield,
        turnover: asset.turnover,
        dividendQualified: asset.dividendQualified,
        capitalGainsRatio: asset.capitalGainsRatio
      })
    }));
  }

  private calculateEfficiencyScore(metrics) {
    const weights = {
      dividendYield: -0.3,
      turnover: -0.2,
      dividendQualified: 0.3,
      capitalGainsRatio: 0.2
    };

    return Object.entries(weights).reduce((score, [metric, weight]) => {
      return score + (metrics[metric] * weight);
    }, 0);
  }

  private hungarianAssignment(costMatrix) {
    // Implementation of Hungarian algorithm for optimal assignment
    const matrix = new Matrix(costMatrix);
    // ... Hungarian algorithm implementation
    return matrix.solve();
  }

  private calculateHarvestingSavings(unrealizedLoss) {
    const federalRate = this.taxRates.federalLongTerm;
    const stateRate = this.taxRates.state;
    const niitRate = this.calculateNIITRate();

    return Math.abs(unrealizedLoss) * (federalRate + stateRate + niitRate);
  }

  private findHarvestingAlternatives(position) {
    return this.portfolio.universe
      .filter(security => this.isValidAlternative(security, position))
      .map(security => ({
        symbol: security.symbol,
        correlation: this.calculateCorrelation(position, security),
        trackingError: this.calculateTrackingError(position, security),
        fundamentalScore: this.calculateFundamentalScore(security)
      }))
      .sort((a, b) => b.fundamentalScore - a.fundamentalScore)
      .slice(0, 3);
  }

  private generateWithdrawalStrategy(accounts, requiredAmount, preferences) {
    const strategy = {
      steps: [],
      totalTaxCost: 0,
      expectedImpact: {}
    };

    // Sort accounts by tax efficiency for withdrawals
    const sortedAccounts = this.sortAccountsByWithdrawalEfficiency(accounts);

    let remainingAmount = requiredAmount;
    for (const account of sortedAccounts) {
      if (remainingAmount <= 0) break;

      const withdrawal = this.calculateOptimalWithdrawal(
        account,
        remainingAmount,
        preferences
      );

      strategy.steps.push(withdrawal);
      strategy.totalTaxCost += withdrawal.taxCost;
      remainingAmount -= withdrawal.amount;
    }

    strategy.expectedImpact = this.calculateWithdrawalImpact(strategy);
    return strategy;
  }

  private calculateWithdrawalImpact(strategy) {
    return {
      portfolioBalance: this.calculatePortfolioImpact(strategy),
      taxEfficiency: this.calculateTaxEfficiencyImpact(strategy),
      futureFlexibility: this.calculateFlexibilityImpact(strategy),
      rmdConsiderations: this.calculateRMDImpact(strategy)
    };
  }

  private loadStateTaxData() {
    // Comprehensive state tax data
    return {
      CA: {
        brackets: [
          { threshold: 0, rate: 0.01 },
          { threshold: 9325, rate: 0.02 },
          // ... more brackets
        ],
        specialRules: {
          capitalGains: 'ordinary_income',
          retirementIncome: {
            socialSecurity: 'exempt',
            pension: 'taxable'
          }
        }
      },
      // ... other states
    };
  }
}

export class TaxProjector {
  constructor(portfolio, taxRates, assumptions) {
    this.portfolio = portfolio;
    this.taxRates = taxRates;
    this.assumptions = assumptions;
  }

  projectTaxLiability(years = 10) {
    const projections = [];
    let currentPortfolio = { ...this.portfolio };

    for (let year = 1; year <= years; year++) {
      const yearlyLiability = this.calculateYearlyTaxLiability(
        currentPortfolio,
        year
      );
      
      projections.push({
        year,
        ...yearlyLiability
      });

      currentPortfolio = this.updatePortfolio(currentPortfolio, yearlyLiability);
    }

    return {
      projections,
      summary: this.summarizeTaxProjections(projections)
    };
  }

  private calculateYearlyTaxLiability(portfolio, year) {
    return {
      ordinaryIncome: this.calculateOrdinaryIncomeTax(portfolio, year),
      capitalGains: this.calculateCapitalGainsTax(portfolio, year),
      niit: this.calculateNIIT(portfolio, year),
      stateTax: this.calculateStateTax(portfolio, year),
      deductions: this.calculateDeductions(portfolio, year),
      credits: this.calculateCredits(portfolio, year)
    };
  }
}