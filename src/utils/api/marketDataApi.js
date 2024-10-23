import { WebSocket } from 'ws';

export class MarketDataService {
  constructor(config = {}) {
    this.config = {
      apiUrl: process.env.VITE_API_URL,
      wsUrl: process.env.VITE_WS_URL,
      apiKey: process.env.VITE_API_KEY,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
    
    this.subscribers = new Map();
    this.cache = new Map();
    this.websocket = null;
    this.reconnectAttempts = 0;
  }

  async initialize() {
    await this.connectWebSocket();
    await this.initializeCache();
    this.startHeartbeat();
  }

  async subscribeToRealTimeData(symbols, callback) {
    const subscription = {
      symbols: new Set(symbols),
      callback,
      timestamp: Date.now()
    };

    const subscriptionId = this.generateSubscriptionId();
    this.subscribers.set(subscriptionId, subscription);

    await this.sendSubscription(symbols);
    return subscriptionId;
  }

  async unsubscribe(subscriptionId) {
    const subscription = this.subscribers.get(subscriptionId);
    if (subscription) {
      await this.sendUnsubscription(Array.from(subscription.symbols));
      this.subscribers.delete(subscriptionId);
    }
  }

  async getHistoricalData(symbol, timeframe, interval) {
    const cacheKey = `${symbol}-${timeframe}-${interval}`;
    if (this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey);
      if (!this.isCacheStale(cachedData.timestamp)) {
        return cachedData.data;
      }
    }

    try {
      const response = await fetch(
        `${this.config.apiUrl}/historical/${symbol}?timeframe=${timeframe}&interval=${interval}`,
        {
          headers: this.getHeaders()
        }
      );

      if (!response.ok) throw new Error('Failed to fetch historical data');

      const data = await response.json();
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Historical data fetch failed:', error);
      throw error;
    }
  }

  async getMarketIndicators() {
    try {
      const [breadth, volatility, sectors, economic] = await Promise.all([
        this.fetchMarketBreadth(),
        this.fetchVolatilityIndices(),
        this.fetchSectorPerformance(),
        this.fetchEconomicIndicators()
      ]);

      return {
        breadth,
        volatility,
        sectors,
        economic,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Market indicators fetch failed:', error);
      throw error;
    }
  }

  private async connectWebSocket() {
    return new Promise((resolve, reject) => {
      this.websocket = new WebSocket(this.config.wsUrl);

      this.websocket.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(JSON.parse(event.data));
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.handleWebSocketError(error);
        reject(error);
      };

      this.websocket.onclose = () => {
        this.handleWebSocketClose();
      };
    });
  }

  private handleWebSocketMessage(message) {
    switch (message.type) {
      case 'PRICE_UPDATE':
        this.handlePriceUpdate(message.data);
        break;
      case 'MARKET_STATUS':
        this.handleMarketStatus(message.data);
        break;
      case 'ERROR':
        this.handleError(message.data);
        break;
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  private async fetchMarketBreadth() {
    const response = await fetch(
      `${this.config.apiUrl}/market/breadth`,
      { headers: this.getHeaders() }
    );
    return response.json();
  }

  private async fetchVolatilityIndices() {
    const response = await fetch(
      `${this.config.apiUrl}/market/volatility`,
      { headers: this.getHeaders() }
    );
    return response.json();
  }

  private startHeartbeat() {
    setInterval(() => {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({ type: 'HEARTBEAT' }));
      }
    }, 30000);
  }

  private generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}