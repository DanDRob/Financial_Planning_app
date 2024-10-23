import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, DollarSign, PiggyBank } from 'lucide-react';
import React, { useState } from 'react';
import { AccountLocationChart } from '../charts/AccountLocationChart';
import { TaxHarvestingChart } from '../charts/TaxHarvestingChart';
import { MetricsCard } from '../shared/MetricsCard';

export const TaxStrategyTab = ({
  strategy,
  portfolio,
  onOptimize
}) => {
  const [taxSettings, setTaxSettings] = useState({
    taxBracket: '25',
    state: 'CA',
    harvestingThreshold: 1000,
    rebalanceFrequency: 'quarterly'
  });

  const handleOptimize = async () => {
    try {
      await onOptimize(taxSettings);
    } catch (error) {
      console.error('Tax optimization failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tax-Loss Harvesting Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strategy?.harvesting && (
              <div className="space-y-4">
                <TaxHarvestingChart
                  opportunities={strategy.harvesting.opportunities}
                  totalSavings={strategy.harvesting.potentialSavings}
                />

                <MetricsCard
                  title="Harvesting Metrics"
                  metrics={{
                    'Total Opportunities': {
                      current: strategy.harvesting.opportunities.length,
                      type: 'number'
                    },
                    'Potential Savings': {
                      current: strategy.harvesting.potentialSavings,
                      type: 'currency'
                    },
                    'Average Loss Size': {
                      current: strategy.harvesting.averageLossSize,
                      type: 'currency'
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
              <PiggyBank className="h-5 w-5" />
              Asset Location Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strategy?.assetLocation && (
              <div className="space-y-4">
                <AccountLocationChart
                  strategy={strategy.assetLocation}
                  taxEfficiency={strategy.taxEfficiency}
                />

                <MetricsCard
                  title="Location Efficiency"
                  metrics={{
                    'Tax Efficiency Score': {
                      current: strategy.taxEfficiency.score,
                      type: 'percentage'
                    },
                    'Potential Tax Savings': {
                      current: strategy.taxEfficiency.potentialSavings,
                      type: 'currency'
                    }
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tax Bracket</label>
              <Select
                value={taxSettings.taxBracket}
                onValueChange={(value) => setTaxSettings(prev => ({ ...prev, taxBracket: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tax bracket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="22">22%</SelectItem>
                  <SelectItem value="24">24%</SelectItem>
                  <SelectItem value="32">32%</SelectItem>
                  <SelectItem value="35">35%</SelectItem>
                  <SelectItem value="37">37%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">State</label>
              <Select
                value={taxSettings.state}
                onValueChange={(value) => setTaxSettings(prev => ({ ...prev, state: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleOptimize}
            className="w-full mt-4"
          >
            Update Tax Strategy
          </Button>
        </CardContent>
      </Card>

      {strategy?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Optimization Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategy.recommendations.map((rec, index) => (
                <Alert key={index}>
                  <AlertDescription>
                    <div className="font-medium">{rec.title}</div>
                    <p className="mt-1">{rec.description}</p>
                    {rec.savings && (
                      <div className="mt-2 text-sm text-green-600">
                        Potential Savings: ${rec.savings.toLocaleString()}
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