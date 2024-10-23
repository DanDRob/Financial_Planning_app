# Tax Strategy Module

## Overview
The tax strategy module optimizes after-tax returns through tax-loss harvesting, asset location optimization, and intelligent withdrawal strategies. It considers multiple account types (taxable, tax-deferred, tax-exempt) and various tax rates.

## Key Features

### Tax-Loss Harvesting
Automatically identifies opportunities to harvest tax losses while maintaining desired market exposure.


Example implementation:

const { harvestingOpportunities } = useTaxStrategy(portfolio, taxRates);

// Each opportunity includes:
{
  asset: "VTI",
  unrealizedLoss: -5000,
  potentialTaxSavings: 1500,
  alternatives: [
    { symbol: "ITOT", correlation: 0.99 },
    { symbol: "SCHB", correlation: 0.98 }
  ]
}



Asset Location Optimization
Places assets in the most tax-efficient account types based on:
Tax characteristics (qualified dividends, ordinary income, capital gains)
Expected returns
Investment horizon
Account types available


Tax Brackets and Rates

const TAX_RATES = {
  FEDERAL_LONG_TERM: {
    RATE_0: 0,     // Up to $40,400 (single)
    RATE_15: 0.15, // $40,401 - $445,850
    RATE_20: 0.20  // Above $445,850
  },
  FEDERAL_SHORT_TERM: {
    RATE_10: 0.10,
    RATE_12: 0.12,
    // ... additional brackets
    RATE_37: 0.37
  }
};


Account Types
1. Taxable Accounts
   - Immediate tax implications
   - Long-term vs. short-term gains
   - Tax-loss harvesting opportunities
Step-up basis at death
2. Tax-Deferred (Traditional IRA, 401(k))
   - Tax-deferred growth
   - Taxed as ordinary income upon withdrawal
   - Required Minimum Distributions (RMDs)
   - No step-up basis
3. Tax-Exempt (Roth IRA, Roth 401(k))
   - Tax-free growth
   - Tax-free qualified withdrawals
   - No RMDs (Roth IRA)
   - No step-up basis needed

Asset Location Strategy

Optimal Location Guidelines

1. Tax-Exempt Accounts (Roth)
   - Highest expected return assets
   - Growth stocks
   - REITs
   - Aggressive stock funds

2. Tax-Deferred Accounts
   - High-yield bonds
   - REITs (if Roth space unavailable)
   - Corporate bonds
   - Active stock funds
3. Taxable Accounts
   - Municipal bonds
   - Tax-managed stock funds
   - Index funds
   - Buy-and-hold stocks
    

Implementation
Basic Tax Strategy Setup

const taxStrategy = useTaxStrategy(portfolio, {
  federalBracket: 32,
  stateBracket: 9.3,
  filingStatus: 'single',
  harvestingThreshold: 5000
});

Optimization Configuration
const optimizationConfig = {
  harvestingEnabled: true,
  minHarvestAmount: 5000,
  washSaleWindow: 30,
  rebalanceFrequency: 'quarterly',
  locationPriorities: {
    highYieldBonds: ['taxDeferred', 'taxExempt', 'taxable'],
    growthStocks: ['taxExempt', 'taxable', 'taxDeferred'],
    indexFunds: ['taxable', 'taxDeferred', 'taxExempt']
  }
};

Tax-Loss Harvesting Process

1. Identification
    Monitor positions for unrealized losses
    Calculate potential tax savings
    Check wash sale restrictions

2. Analysis
    Find suitable replacement securities
    Calculate transaction costs
    Evaluate net benefit
3. Execution
    Sell losing position
    Purchase replacement security
    Track wash sale period
    Document for tax reporting

Withdrawal Strategy
Optimization Goals
1. Minimize lifetime taxes
2. Maintain desired asset allocation
3. Meet RMD requirements
4. Preserve tax-advantaged growth

Sample Withdrawal Priority
const withdrawalStrategy = {
  priority: [
    { source: 'RMD', condition: 'required' },
    { source: 'taxable', type: 'longTermGains' },
    { source: 'taxDeferred', upTo: 'bracketTop' },
    { source: 'taxExempt', condition: 'last' }
  ]
};

Tax Efficiency Metrics

The module calculates several tax efficiency metrics:
1. Tax Cost Ratio
taxCostRatio = (beforeTaxReturn - afterTaxReturn) / beforeTaxReturn
2. Asset Location Score
locationScore = actualTaxSavings / theoreticalMaxTaxSavings
3. Harvesting Efficiency
harvestingEfficiency = realizedTaxSavings / potentialTaxSavings


Best Practices

1. Regular Monitoring
    Review harvesting opportunities weekly
    Assess asset location quarterly
    Update tax brackets annually
2. Documentation
    Track cost basis meticulously
    Document wash sale compliance
    Maintain transaction records
3. Coordination
    Align with overall investment strategy
    Consider estate planning implications
    Coordinate with tax professional

Common Pitfalls to Avoid
1. Wash Sale Violations
    30-day window before/after sale
    Applies across accounts
    Includes spouse's accounts
2. Over-trading
    Transaction costs can exceed tax benefits
    Short-term gains exposure
    Tracking error risk
3. Bracket Management
    Pushing income into higher brackets
    Missing bracket-filling opportunities
    RMD impact planning