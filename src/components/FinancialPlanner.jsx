import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useCallback, useState } from 'react';
import { useMarketDataStream } from '../hooks/useMarketDataStream';
import { usePortfolioOptimization } from '../hooks/usePortfolioOptimization';
import { useScenarioPlanning } from '../hooks/useScenarioPlanning';
import { useTaxStrategy } from '../hooks/useTaxStrategy';

import { DataInputTab } from './tabs/DataInputTab';
import { MarketDataTab } from './tabs/MarketDataTab';
import { MonteCarloTab } from './tabs/MonteCarloTab';
import { OptimizationTab } from './tabs/OptimizationTab';
import { RiskProfileTab } from './tabs/RiskProfileTab';
import { ScenariosTab } from './tabs/ScenariosTab';
import { TaxStrategyTab } from './tabs/TaxStrategyTab';

export const FinancialPlanner = () => {
  // State management for user inputs
  const [financialData, setFinancialData] = useState({
    savings: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    investments: [],
    retirementAge: 65,
    riskTolerance: 50,
    taxBracket: 25,
    state: 'CA'
  });

  // Initialize hooks
  const {
    optimize: optimizePortfolio,
    result: portfolioResult,
    isOptimizing
  } = usePortfolioOptimization(financialData);

  const {
    scenarios,
    createScenario,
    updateScenario,
    compareScenarios
  } = useScenarioPlanning(financialData);

  const {
    data: marketData,
    analytics: marketAnalytics,
    status: marketDataStatus
  } = useMarketDataStream(financialData.investments.map(inv => inv.symbol));

  const {
    strategy: taxStrategy,
    optimize: optimizeTaxStrategy
  } = useTaxStrategy(portfolioResult?.portfolio);

  // Handlers
  const handleDataUpdate = useCallback((updatedData) => {
    setFinancialData(prev => ({
      ...prev,
      ...updatedData
    }));
  }, []);

  const handleOptimize = useCallback(async () => {
    try {
      const result = await optimizePortfolio();
      await optimizeTaxStrategy();
      return result;
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  }, [optimizePortfolio, optimizeTaxStrategy]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Financial Planning Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="input" className="space-y-4">
            <TabsList className="grid grid-cols-7 gap-4">
              <TabsTrigger value="input">Data Input</TabsTrigger>
              <TabsTrigger value="risk">Risk Profile</TabsTrigger>
              <TabsTrigger value="monte-carlo">Monte Carlo</TabsTrigger>
              <TabsTrigger value="optimization">Portfolio</TabsTrigger>
              <TabsTrigger value="tax">Tax Strategy</TabsTrigger>
              <TabsTrigger value="market">Market Data</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            </TabsList>

            <TabsContent value="input">
              <DataInputTab
                data={financialData}
                onUpdate={handleDataUpdate}
              />
            </TabsContent>

            <TabsContent value="risk">
              <RiskProfileTab
                profile={{
                  riskTolerance: financialData.riskTolerance,
                  answers: financialData.riskAnswers || []
                }}
                onUpdate={handleDataUpdate}
              />
            </TabsContent>

            <TabsContent value="monte-carlo">
              <MonteCarloTab
                data={financialData}
                portfolioResult={portfolioResult}
                marketData={marketData}
              />
            </TabsContent>

            <TabsContent value="optimization">
              <OptimizationTab
                result={portfolioResult}
                onOptimize={handleOptimize}
                isOptimizing={isOptimizing}
                marketData={marketData}
                analytics={marketAnalytics}
              />
            </TabsContent>

            <TabsContent value="tax">
              <TaxStrategyTab
                strategy={taxStrategy}
                portfolio={portfolioResult?.portfolio}
                onOptimize={optimizeTaxStrategy}
              />
            </TabsContent>

            <TabsContent value="market">
              <MarketDataTab
                data={marketData}
                analytics={marketAnalytics}
                status={marketDataStatus}
              />
            </TabsContent>

            <TabsContent value="scenarios">
              <ScenariosTab
                scenarios={scenarios}
                baseData={financialData}
                onCreate={createScenario}
                onUpdate={updateScenario}
                onCompare={compareScenarios}
              />
            </TabsContent>
          </Tabs>

          {/* Global Messages or Alerts */}
          {isOptimizing && (
            <Alert className="mt-4">
              <AlertDescription>
                Optimizing your portfolio...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialPlanner;