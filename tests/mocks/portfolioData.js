export const mockPortfolioData = {
    id: 'portfolio-123',
    name: 'Test Portfolio',
    assets: [
      {
        symbol: 'SPY',
        name: 'SPDR S&P 500 ETF',
        type: 'ETF',
        quantity: 100,
        value: 45075.00,
        costBasis: 42000.00,
        allocation: 0.60,
        metadata: {
          sector: 'Broad Market',
          style: 'Large Blend',
          region: 'US'
        }
      },
      {
        symbol: 'AGG',
        name: 'iShares Core U.S. Aggregate Bond ETF',
        type: 'ETF',
        quantity: 200,
        value: 20000.00,
        costBasis: 19500.00,
        allocation: 0.30,
        metadata: {
          sector: 'Fixed Income',
          style: 'Intermediate Core Bond',
          region: 'US'
        }
      },
      {
        symbol: 'CASH',
        name: 'Cash',
        type: 'Cash',
        quantity: 1,
        value: 5000.00,
        costBasis: 5000.00,
        allocation: 0.10,
        metadata: {
          type: 'Cash Equivalent'
        }
      }
    ],
    value: 70075.00,
    returns: {
      daily: 0.75,
      weekly: 1.25,
      monthly: 2.50,
      ytd: 5.75,
      inception: 12.50
    },
    metrics: {
      alpha: 0.2,
      beta: 0.95,
      sharpeRatio: 1.2,
      sortinoRatio: 1.5,
      maxDrawdown: -0.15,
      volatility: 0.12
    },
    taxLots: [
      {
        symbol: 'SPY',
        quantity: 50,
        purchaseDate: '2023-01-15',
        costBasis: 200.00,
        totalCost: 10000.00
      },
      {
        symbol: 'SPY',
        quantity: 50,
        purchaseDate: '2023-06-15',
        costBasis: 220.00,
        totalCost: 11000.00
      }
    ],
    lastUpdated: new Date().toISOString()
  };
  
  export const mockOptimizationResult = {
    allocation: {
      'SPY': 0.65,
      'AGG': 0.25,
      'CASH': 0.10
    },
    expectedReturn: 0.085,
    risk: 0.12,
    sharpeRatio: 1.3,
    metrics: {
      volatility: 0.12,
      drawdown: 0.15,
      sortino: 1.4,
      informationRatio: 0.8
    },
    recommendations: [
      {
        type: 'reallocation',
        asset: 'SPY',
        currentAllocation: 0.60,
        targetAllocation: 0.65,
        reason: 'Increase equity exposure to optimize risk-adjusted returns'
      },
      {
        type: 'reallocation',
        asset: 'AGG',
        currentAllocation: 0.30,
        targetAllocation: 0.25,
        reason: 'Reduce fixed income exposure given current market conditions'
      }
    ]
  };
  
  export const mockTaxStrategy = {
    harvestingOpportunities: [
      {
        symbol: 'SPY',
        unrealizedLoss: -1500.00,
        potentialSavings: 450.00,
        alternatives: [
          {
            symbol: 'VOO',
            correlation: 0.99,
            trackingError: 0.01
          },
          {
            symbol: 'IVV',
            correlation: 0.99,
            trackingError: 0.01
          }
        ]
      }
    ],
    assetLocation: {
      taxable: {
        'SPY': 0.40,
        'CASH': 0.10
      },
      taxDeferred: {
        'AGG': 0.30
      },
      taxExempt: {
        'SPY': 0.20
      }
    },
    projectedSavings: 750.00
  };
  
  export const generateMockPortfolio = (overrides = {}) => {
    return {
      ...mockPortfolioData,
      ...overrides,
      lastUpdated: new Date().toISOString()
    };
  };
  
  export const mockPortfolioHandlers = [
    {
      path: '/api/portfolio/:id',
      method: 'GET',
      response: ({ params }) => ({
        ...mockPortfolioData,
        id: params.id
      })
    },
    {
      path: '/api/portfolio/optimize',
      method: 'POST',
      response: () => mockOptimizationResult
    },
    {
      path: '/api/portfolio/tax-strategy',
      method: 'POST',
      response: () => mockTaxStrategy
    }
  ];