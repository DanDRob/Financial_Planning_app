export const TIME_PERIODS = {
    DAILY: '1D',
    WEEKLY: '1W',
    MONTHLY: '1M',
    QUARTERLY: '3M',
    YEARLY: '1Y',
    THREE_YEAR: '3Y',
    FIVE_YEAR: '5Y',
    TEN_YEAR: '10Y'
  };
  
  export const RISK_LEVELS = {
    CONSERVATIVE: {
      id: 'conservative',
      label: 'Conservative',
      stockAllocation: 30,
      bondAllocation: 70
    },
    MODERATE_CONSERVATIVE: {
      id: 'moderate_conservative',
      label: 'Moderately Conservative',
      stockAllocation: 40,
      bondAllocation: 60
    },
    MODERATE: {
      id: 'moderate',
      label: 'Moderate',
      stockAllocation: 60,
      bondAllocation: 40
    },
    MODERATE_AGGRESSIVE: {
      id: 'moderate_aggressive',
      label: 'Moderately Aggressive',
      stockAllocation: 75,
      bondAllocation: 25
    },
    AGGRESSIVE: {
      id: 'aggressive',
      label: 'Aggressive',
      stockAllocation: 90,
      bondAllocation: 10
    }
  };
  
  export const ASSET_CLASSES = {
    STOCKS: 'stocks',
    BONDS: 'bonds',
    CASH: 'cash',
    REAL_ESTATE: 'real_estate',
    COMMODITIES: 'commodities',
    ALTERNATIVES: 'alternatives'
  };
  
  export const ACCOUNT_TYPES = {
    TAXABLE: 'taxable',
    TRADITIONAL_IRA: 'traditional_ira',
    ROTH_IRA: 'roth_ira',
    TRADITIONAL_401K: 'traditional_401k',
    ROTH_401K: 'roth_401k'
  };
  
  export const REBALANCING_FREQUENCIES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    ANNUALLY: 'annually',
    THRESHOLD: 'threshold'
  };
  
  export const TAX_RATES = {
    FEDERAL_LONG_TERM: {
      RATE_0: 0,
      RATE_15: 0.15,
      RATE_20: 0.20
    },
    FEDERAL_SHORT_TERM: {
      RATE_10: 0.10,
      RATE_12: 0.12,
      RATE_22: 0.22,
      RATE_24: 0.24,
      RATE_32: 0.32,
      RATE_35: 0.35,
      RATE_37: 0.37
    }
  };
  
  export const ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
  };
  
  export const API_ENDPOINTS = {
    MARKET_DATA: '/market-data',
    PORTFOLIO: '/portfolio',
    OPTIMIZATION: '/optimization',
    TAX_STRATEGY: '/tax-strategy',
    SCENARIOS: '/scenarios'
  };