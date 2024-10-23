export const mockMarketData = {
    indices: {
      'SPY': {
        price: 450.75,
        change: 1.25,
        changePercent: 0.28,
        volume: 75000000,
        previousClose: 449.50
      },
      'QQQ': {
        price: 380.20,
        change: 2.30,
        changePercent: 0.61,
        volume: 45000000,
        previousClose: 377.90
      }
    },
    technicals: {
      'SPY': {
        rsi: 58.5,
        macd: {
          value: 0.75,
          signal: 0.50,
          histogram: 0.25
        },
        bollingerBands: {
          upper: 455.00,
          middle: 450.75,
          lower: 446.50
        }
      }
    },
    marketConditions: {
      regime: 'bullish',
      vix: 15.5,
      advanceDecline: 1.5,
      newHighsLows: 2.1,
      breadth: {
        advancingIssues: 2500,
        decliningIssues: 1000,
        unchangedIssues: 500
      }
    },
    sectors: {
      'XLF': { change: 0.8, volume: 15000000 },
      'XLK': { change: 1.2, volume: 18000000 },
      'XLE': { change: -0.5, volume: 12000000 }
    },
    historicalData: [
      {
        date: '2024-01-01',
        open: 448.50,
        high: 451.75,
        low: 447.25,
        close: 450.75,
        volume: 75000000
      },
      // ... more historical data
    ],
    realtime: {
      lastUpdate: new Date().toISOString(),
      status: 'connected',
      delay: 0
    }
  };
  
  export const mockMarketDataHandlers = [
    {
      path: '/api/market-data',
      method: 'GET',
      response: () => mockMarketData
    },
    {
      path: '/api/market-data/historical',
      method: 'GET',
      response: ({ query }) => ({
        data: mockMarketData.historicalData,
        symbol: query.symbol,
        timeframe: query.timeframe
      })
    },
    {
      path: '/api/market-data/technicals',
      method: 'GET',
      response: ({ query }) => ({
        data: mockMarketData.technicals[query.symbol],
        symbol: query.symbol
      })
    }
  ];
  
  export const generateMockMarketData = (overrides = {}) => {
    return {
      ...mockMarketData,
      ...overrides,
      timestamp: Date.now()
    };
  };