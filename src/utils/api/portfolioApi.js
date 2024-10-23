export class PortfolioApi {
    constructor(config = {}) {
      this.config = {
        apiUrl: process.env.VITE_API_URL,
        apiKey: process.env.VITE_API_KEY,
        ...config
      };
    }
  
    async getPortfolio(portfolioId) {
      return this.request(`/portfolios/${portfolioId}`);
    }
  
    async updatePortfolio(portfolioId, updates) {
      return this.request(`/portfolios/${portfolioId}`, {
        method: 'PUT',
        body: updates
      });
    }
  
    async optimize(portfolio, constraints) {
      return this.request('/optimize', {
        method: 'POST',
        body: { portfolio, constraints }
      });
    }
  
    async analyzeScenario(scenario) {
      return this.request('/scenarios/analyze', {
        method: 'POST',
        body: scenario
      });
    }
  
    async getTaxStrategy(portfolio, taxInfo) {
      return this.request('/tax-strategy', {
        method: 'POST',
        body: { portfolio, taxInfo }
      });
    }
  
    async getRecommendations(portfolio) {
      return this.request('/recommendations', {
        method: 'POST',
        body: { portfolio }
      });
    }
  
    async rebalancePortfolio(portfolioId, target) {
      return this.request(`/portfolios/${portfolioId}/rebalance`, {
        method: 'POST',
        body: { target }
      });
    }
  
    async executeOrders(portfolioId, orders) {
      return this.request(`/portfolios/${portfolioId}/orders`, {
        method: 'POST',
        body: { orders }
      });
    }
  
    private async request(endpoint, options = {}) {
      try {
        const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            ...options.headers
          },
          body: options.body ? JSON.stringify(options.body) : undefined
        });
  
        if (!response.ok) {
          throw await this.handleErrorResponse(response);
        }
  
        return response.json();
      } catch (error) {
        console.error('API Request failed:', error);
        throw error;
      }
    }
  
    private async handleErrorResponse(response) {
      const error = await response.json();
      const enhancedError = new Error(error.message || 'API request failed');
      enhancedError.status = response.status;
      enhancedError.details = error;
      return enhancedError;
    }
  }