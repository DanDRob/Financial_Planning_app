# Financial Planning Application

A comprehensive financial planning and portfolio optimization system that provides real-time market analysis, tax optimization, and scenario planning capabilities.

## Features

- Portfolio optimization using Black-Litterman model
- Monte Carlo simulations for retirement planning
- Real-time market data integration
- Tax-loss harvesting and optimization
- Scenario planning and analysis
- Risk profiling and assessment
- Interactive data visualization
- Comprehensive reporting

## Technology Stack

- React 18
- Vite
- TailwindCSS
- shadcn/ui components
- Recharts for visualization
- TypeScript for type safety
- Vitest for testing
- Docker for containerization

## Prerequisites

- Node.js >= 18
- Yarn
- Docker (for containerized deployment)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/financial-planning-app.git
cd financial-planning-app
```

2. Install dependencies:

```bash
yarn install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Start development server:

```bash
yarn dev
```

## Development

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn test` - Run tests
- `yarn lint` - Run linter
- `yarn format` - Format code

### Project Structure

- `/src/components` - React components
- `/src/hooks` - Custom React hooks
- `/src/utils` - Utility functions and calculations
- `/src/types` - TypeScript type definitions
- `/src/api` - API integration
- `/tests` - Test files

financial-planning-app/
├── README.md
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── tsconfig.json
├── .gitignore
├── .env.example
├── public/
│ └── assets/
├── src/
│ ├── components/
│ │ ├── FinancialPlanner.jsx
│ │ ├── tabs/
│ │ │ ├── DataInputTab.jsx
│ │ │ ├── RiskProfileTab.jsx
│ │ │ ├── MonteCarloTab.jsx
│ │ │ ├── OptimizationTab.jsx
│ │ │ ├── TaxStrategyTab.jsx
│ │ │ ├── MarketDataTab.jsx
│ │ │ └── ScenariosTab.jsx
│ │ ├── charts/
│ │ │ ├── PortfolioChart.jsx
│ │ │ ├── MonteCarloChart.jsx
│ │ │ ├── OptimizationChart.jsx
│ │ │ ├── ScenarioChart.jsx
│ │ │ ├── TaxHarvestingChart.jsx
│ │ │ └── AccountLocationChart.jsx
│ │ └── shared/
│ │ ├── MetricsCard.jsx
│ │ ├── DataTable.jsx
│ │ └── ControlPanel.jsx
│ ├── hooks/
│ │ ├── useMonteCarloSimulation.js
│ │ ├── usePortfolioOptimization.js
│ │ ├── useTaxStrategy.js
│ │ ├── useMarketData.js
│ │ └── useScenarios.js
│ ├── utils/
│ │ ├── calculations/
│ │ │ ├── monteCarloUtils.js
│ │ │ ├── optimizationUtils.js
│ │ │ ├── taxUtils.js
│ │ │ ├── scenarioUtils.js
│ │ │ └── portfolioUtils.js
│ │ ├── api/
│ │ │ ├── marketDataApi.js
│ │ │ └── portfolioApi.js
│ │ └── constants.js
│ ├── types/
│ │ └── index.d.ts
│ ├── styles/
│ │ └── globals.css
│ ├── App.jsx
│ └── main.jsx
├── tests/
│ ├── setup.js
│ ├── mocks/
│ │ ├── marketData.js
│ │ └── portfolioData.js
│ └── __tests__/
│ ├── components/
│ └── utils/
└── deployment/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── .github/
└── workflows/
└── ci.yml

## Testing

Run the test suite:

```bash
yarn test
```

Run tests with coverage:

```bash
yarn test:coverage
```

## Deployment

### Docker Deployment

1. Build the Docker image:

```bash
docker build -t financial-planning-app .
```

2. Run with Docker Compose:

```bash
docker-compose up -d
```

### Manual Deployment

1. Build the application:

```bash
yarn build
```

2. Deploy the `dist` directory to your hosting service.

## Configuration

### Environment Variables

```env
VITE_API_URL=https://api.example.com
VITE_WS_URL=wss://ws.example.com
VITE_API_KEY=your_api_key
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Documentation

Detailed documentation for each module:

- [Portfolio Optimization](docs/portfolio-optimization.md)
- [Tax Strategy](docs/tax-strategy.md)
- [Market Data Integration](docs/market-data.md)
- [Scenario Planning](docs/scenario-planning.md)

## Support

For support, please email support@example.com or create an issue in the GitHub repository.

## License

MIT License - see LICENSE.md for details
