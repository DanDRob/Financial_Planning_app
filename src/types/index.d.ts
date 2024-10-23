export interface Portfolio {
    id: string;
    name: string;
    assets: Asset[];
    allocation: Record<string, number>;
    value: number;
    lastUpdated: string;
    metadata: PortfolioMetadata;
  }
  
  export interface Asset {
    symbol: string;
    name: string;
    type: AssetType;
    quantity: number;
    value: number;
    costBasis: number;
    allocation: number;
    metadata: AssetMetadata;
  }
  
  export interface AssetMetadata {
    sector?: string;
    industry?: string;
    country?: string;
    currency?: string;
    marketCap?: number;
    style?: string;
  }
  
  export interface PortfolioMetadata {
    createdAt: string;
    updatedAt: string;
    riskTolerance: number;
    investmentHorizon: number;
    rebalancingFrequency: string;
  }
  
  export interface MarketData {
    symbol: string;
    price: number;
    change: number;
    volume: number;
    timestamp: number;
    technicals: TechnicalIndicators;
  }
  
  export interface TechnicalIndicators {
    rsi: number;
    macd: {
      value: number;
      signal: number;
      histogram: number;
    };
    bollingerBands: {
      upper: number;
      middle: number;
      lower: number;
    };
  }
  
  export interface OptimizationResult {
    allocation: Record<string, number>;
    expectedReturn: number;
    risk: number;
    sharpeRatio: number;
    metrics: PortfolioMetrics;
  }
  
  export interface PortfolioMetrics {
    return: number;
    alpha: number;
    beta: number;
    volatility: number;
    sharpeRatio: number;
    sortinoRatio: number;
    maxDrawdown: number;
  }
  
  export interface TaxStrategy {
    assetLocation: Record<string, Record<string, number>>;
    harvestingOpportunities: HarvestingOpportunity[];
    withdrawalStrategy: WithdrawalStrategy;
  }
  
  export interface HarvestingOpportunity {
    asset: string;
    unrealizedLoss: number;
    potentialSavings: number;
    alternatives: Alternative[];
  }
  
  export interface Alternative {
    symbol: string;
    correlation: number;
    trackingError: number;
  }
  
  export interface WithdrawalStrategy {
    sequence: WithdrawalStep[];
    taxImpact: number;
  }
  
  export interface WithdrawalStep {
    account: string;
    amount: number;
    taxImpact: number;
  }
  
  export interface Scenario {
    id: string;
    name: string;
    description?: string;
    modifications: Record<string, any>;
    results: ScenarioResults;
  }
  
  export interface ScenarioResults {
    metrics: PortfolioMetrics;
    probability: number;
    recommendations: Recommendation[];
  }
  
  export interface Recommendation {
    type: string;
    description: string;
    impact: {
      return: number;
      risk: number;
      probability: number;
    };
  }