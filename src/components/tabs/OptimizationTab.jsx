import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Settings, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { EffectiveFrontierChart } from '../charts/EffectiveFrontierChart';
import { PortfolioChart } from '../charts/PortfolioChart';
import { ControlPanel } from '../shared/ControlPanel';
import { MetricsCard } from '../shared/MetricsCard';

export const OptimizationTab = ({
  result,
  onOptimize,
  isOptimizing,
  marketData,
  analytics
}) => {
  const [optimizationSettings, setOptimizationSettings] = useState({
    riskTolerance: 50,
    useESG: false,
    useLeverage: false,
    maxLeverage: 1.5,
    rebalanceFrequency: 'quarterly',
    constraints: {
      maxPositionSize: 0.25,
      minPositionSize: 0.02,
      maxSectorExposure: 0.30
    }
  });

  const handleSettingChange = (key, value) => {
    setOptimizationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleOptimize = async () => {
    try {
      await onOptimize(optimizationSettings);
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Portfolio Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result && (
              <div className="space-y-4">
                <PortfolioChart
                  currentAllocation={result.portfolio.allocation}
                  targetAllocation={result.portfolio.targetAllocation}
                  benchmarkAllocation={result.portfolio.benchmarkAllocation}
                />

                <MetricsCard
                  title="Portfolio Metrics"
                  metrics={{
                    'Expected Return': {
                      current: result.portfolio.metrics.expectedReturn,
                      benchmark: result.portfolio.metrics.benchmarkReturn,
                      type: 'percentage'
                    },
                    'Volatility': {
                      current: result.portfolio.metrics.volatility,
                      benchmark: result.portfolio.metrics.benchmarkVolatility,
                      type: 'percentage'
                    },
                    'Sharpe Ratio': {
                      current: result.portfolio.metrics.sharpeRatio,
                      benchmark: result.portfolio.metrics.benchmarkSharpe,
                      type: 'number'
                    }
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Optimization Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium">Risk Tolerance</label>
                <Slider
                  value={[optimizationSettings.riskTolerance]}
                  onValueChange={([value]) => handleSettingChange('riskTolerance', value)}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Use ESG Constraints</label>
                  <Switch
                    checked={optimizationSettings.useESG}
                    onCheckedChange={(checked) => handleSettingChange('useESG', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Allow Leverage</label>
                  <Switch
                    checked={optimizationSettings.useLeverage}
                    onCheckedChange={(checked) => handleSettingChange('useLeverage', checked)}
                  />
                </div>
              </div>

              <ControlPanel
                settings={{
                  maxPositionSize: optimizationSettings.constraints.maxPositionSize,
                  minPositionSize: optimizationSettings.constraints.minPositionSize,
                  maxSectorExposure: optimizationSettings.constraints.maxSectorExposure,
                  rebalanceFrequency: optimizationSettings.rebalanceFrequency
                }}
                onChange={(settings) => handleSettingChange('constraints', settings)}
              />

              <Button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="w-full"
              >
                {isOptimizing ? 'Optimizing Portfolio...' : 'Optimize Portfolio'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Efficient Frontier</CardTitle>
          </CardHeader>
          <CardContent>
            {result && (
              <EffectiveFrontierChart
                portfolioPoint={{
                  return: result.portfolio.metrics.expectedReturn,
                  risk: result.portfolio.metrics.volatility
                }}
                frontierPoints={result.portfolio.efficientFrontier}
                currentPortfolio={result.portfolio.currentPoint}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics && (
              <div className="space-y-4">
                <MetricsCard
                  title="Market Conditions"
                  metrics={{
                    'Market Regime': {
                      current: analytics.marketConditions.regime,
                      type: 'text'
                    },
                    'Volatility Index': {
                      current: analytics.marketConditions.volatilityIndex,
                      type: 'number'
                    },
                    'Market Trend': {
                      current: analytics.marketConditions.trend,
                      type: 'text'
                    }
                  }}
                />

                {analytics.marketConditions.warnings.map((warning, index) => (
                  <Alert key={index} variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{warning}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.recommendations.map((rec, index) => (
                <Alert key={index}>
                  <AlertDescription>
                    <div className="font-medium">{rec.title}</div>
                    <p className="mt-1">{rec.description}</p>
                    {rec.impact && (
                      <div className="mt-2 text-sm">
                        Expected Impact: {rec.impact}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};