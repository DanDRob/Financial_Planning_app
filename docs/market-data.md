# Market Data Integration Module

## Overview
The market data integration module provides real-time and historical market data, technical analysis, and market condition monitoring. It handles data streaming, caching, and analytics calculations for portfolio management decisions.

## Key Features

### Real-Time Data Streaming
Implements WebSocket connections for live market data updates:

```javascript
const { data, status } = useMarketDataStream(['AAPL', 'GOOGL', 'VTI']);

// Sample data structure:
{
  AAPL: {
    price: 150.25,
    change: 2.50,
    volume: 32500000,
    lastUpdated: '2024-01-20T15:30:00Z'
  }
}
```

### Market Analytics

#### Technical Indicators
- Moving Averages (SMA, EMA)
- Relative Strength Index (RSI)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands
- Volume Analysis

#### Market Conditions
- Volatility Indices (VIX)
- Market Breadth
- Sector Rotation
- Sentiment Indicators

## Implementation

### Basic Setup
```javascript
const marketData = useMarketData({
  symbols: ['SPY', 'AGG', 'VTI'],
  indicators: ['SMA', 'RSI', 'MACD'],
  updateInterval: 1000,
  historicalPeriod: '1Y'
});
```

### Configuration Options
```javascript
const config = {
  // Data refresh settings
  updateInterval: 1000,        // Milliseconds
  batchSize: 100,             // Symbols per request
  retryAttempts: 3,           // Failed connection retries
  
  // Cache settings
  cacheExpiry: 300,           // Seconds
  maxCacheSize: 1000,         // Entries
  
  // Analytics settings
  calculateIndicators: true,
  includeMarketBreadth: true,
  includeSentiment: true
};
```

## Data Types

### Price Data
```typescript
interface PriceData {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  timestamp: string;
  change: number;
  changePercent: number;
}
```

### Technical Indicators
```typescript
interface TechnicalIndicators {
  sma: {
    period20: number;
    period50: number;
    period200: number;
  };
  rsi: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
}
```

## Market Analysis Features

### 1. Technical Analysis
```javascript
const technicalAnalysis = {
  calculateSMA: (prices, period) => {
    // Simple Moving Average calculation
    return prices
      .slice(-period)
      .reduce((sum, price) => sum + price, 0) / period;
  },
  
  calculateRSI: (prices, period = 14) => {
    // Relative Strength Index calculation
    const gains = [];
    const losses = [];
    // ... calculation logic
    return 100 - (100 / (1 + (avgGain / avgLoss)));
  }
};
```

### 2. Market Breadth Analysis
```javascript
const marketBreadth = {
  advanceDeclineRatio: number;
  newHighsLows: {
    newHighs: number;
    newLows: number;
    ratio: number;
  };
  marketMomentum: {
    shortTerm: number;
    mediumTerm: number;
    longTerm: number;
  };
};
```

## Error Handling

### Connection Management
```javascript
const handleConnectionError = async (error) => {
  if (error.type === 'CONNECTION_LOST') {
    await reconnect({
      maxAttempts: 3,
      backoffMs: 1000
    });
  } else if (error.type === 'RATE_LIMIT') {
    await handleRateLimit(error);
  }
};
```

### Data Validation
```javascript
const validateMarketData = (data) => {
  // Check for stale data
  const maxAge = 60000; // 60 seconds
  if (Date.now() - data.timestamp > maxAge) {
    throw new Error('STALE_DATA');
  }
  
  // Validate price ranges
  if (data.price <= 0 || data.price > 1000000) {
    throw new Error('INVALID_PRICE');
  }
};
```

## Best Practices

### 1. Data Management
- Implement proper caching strategies
- Handle rate limits gracefully
- Validate data quality
- Monitor data freshness

### 2. Performance Optimization
- Batch API requests
- Use WebSocket for real-time data
- Implement efficient data structures
- Cache frequently accessed data

### 3. Error Recovery
- Implement automatic reconnection
- Handle API failures gracefully
- Log errors for monitoring
- Maintain data consistency

## Common Calculations

### Volatility Calculation
```javascript
const calculateVolatility = (prices, period = 20) => {
  const returns = prices.map((price, i) => 
    i === 0 ? 0 : Math.log(price / prices[i - 1])
  );
  
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  
  const variance = returns.reduce((sum, ret) => 
    sum + Math.pow(ret - mean, 2), 0) / (returns.length - 1);
  
  return Math.sqrt(variance * 252); // Annualized volatility
};
```

### Beta Calculation
```javascript
const calculateBeta = (assetReturns, marketReturns) => {
  const covariance = calculateCovariance(assetReturns, marketReturns);
  const marketVariance = calculateVariance(marketReturns);
  return covariance / marketVariance;
};
```

## Additional Resources

- [Technical Analysis Guide](https://www.investopedia.com/technical-analysis-4689657)
- [Market Indicators](https://www.investopedia.com/terms/m/market_indicators.asp)
- [API Documentation](https://api.example.com/docs)