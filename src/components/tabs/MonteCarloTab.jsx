import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMonteCarloSimulation } from '@/hooks/useMonteCarloSimulation';
import { AlertTriangle, BarChart, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MonteCarloChart } from '../charts/MonteCarloChart';
import { MetricsCard } from '../shared/MetricsCard';

export const MonteCarloTab = ({ data, portfolioResult, marketData }) => {
  const [simulationParams, setSimulationParams] = useState({
    initialInvestment: data.savings || 0,
    monthlyContribution: data.monthlyIncome - data.monthlyExpenses || 0,
    yearsToRetirement: (data.retirementAge || 65) - (new Date().getFullYear() - data.birthYear),
    inflationRate: 0.03,
    numSimulations: 1000,
    confidenceLevel: 0.95
  });

  const {
    runSimulation,
    results,
    isSimulating,
    error
  } = useMonteCarloSimulation();

  useEffect(() => {
    if (data && portfolioResult) {
      setSimulationParams(prev => ({
        ...prev,
        initialInvestment: data.savings,
        monthlyContribution: data.monthlyIncome - data.monthlyExpenses,
        yearsToRetirement: (data.retirementAge || 65) - (new Date().getFullYear() - data.birthYear)
      }));
    }
  }, [data, portfolioResult]);

  const handleParamChange = (field, value) => {
    setSimulationParams(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleRunSimulation = async () => {
    try {
      await runSimulation({
        ...simulationParams,
        currentAllocation: portfolioResult?.portfolio?.allocation,
        marketConditions: marketData?.marketConditions
      });
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Simulation Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Initial Investment</label>
              <Input
                type="number"
                value={simulationParams.initialInvestment}
                onChange={(e) => handleParamChange('initialInvestment', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Monthly Contribution</label>
              <Input
                type="number"
                value={simulationParams.monthlyContribution}
                onChange={(e) => handleParamChange('monthlyContribution', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Years to Retirement</label>
              <Input
                type="number"
                value={simulationParams.yearsToRetirement}
                onChange={(e) => handleParamChange('yearsToRetirement', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Inflation Rate (%)</label>
              <Input
                type="number"
                value={simulationParams.inflationRate * 100}
                onChange={(e) => handleParamChange('inflationRate', e.target.value / 100)}
                className="mt-1"
                step="0.1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Confidence Level</label>
              <Select
                value={simulationParams.confidenceLevel.toString()}
                onValueChange={(value) => handleParamChange('confidenceLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.90">90%</SelectItem>
                  <SelectItem value="0.95">95%</SelectItem>
                  <SelectItem value="0.99">99%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full"
            >
              {isSimulating ? 'Running Simulation...' : 'Run Simulation'}
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Simulation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results && (
              <div className="space-y-4">
                <MonteCarloChart
                  simulations={results.simulations}
                  confidenceIntervals={results.confidenceIntervals}
                />

                <div className="grid grid-cols-2 gap-4">
                  <MetricsCard
                    title="Portfolio Metrics"
                    metrics={{
                      'Success Rate': { 
                        current: results.metrics.successRate, 
                        type: 'percentage' 
                      },
                      'Median Portfolio': { 
                        current: results.metrics.medianOutcome,
                        type: 'currency'
                      },
                      'Worst Case': {
                        current: results.metrics.worstCase,
                        type: 'currency'
                      },
                      'Best Case': {
                        current: results.metrics.bestCase,
                        type: 'currency'
                      }
                    }}
                  />

                  <MetricsCard
                    title="Risk Analysis"
                    metrics={{
                      'Volatility': {
                        current: results.metrics.volatility,
                        type: 'percentage'
                      },
                      'Max Drawdown': {
                        current: results.metrics.maxDrawdown,
                        type: 'percentage'
                      },
                      'Value at Risk': {
                        current: results.metrics.valueAtRisk,
                        type: 'currency'
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};