import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Copy, Play, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { ScenarioChart } from '../charts/ScenarioChart';
import { MetricsCard } from '../shared/MetricsCard';

export const ScenariosTab = ({
  scenarios,
  baseData,
  onCreate,
  onUpdate,
  onCompare
}) => {
  const [newScenario, setNewScenario] = useState({
    name: '',
    modifications: {}
  });

  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [comparisonResults, setComparisonResults] = useState(null);

  const handleCreateScenario = async () => {
    try {
      await onCreate(newScenario.name, newScenario.modifications);
      setNewScenario({ name: '', modifications: {} });
    } catch (error) {
      console.error('Failed to create scenario:', error);
    }
  };

  const handleCompareScenarios = async () => {
    if (selectedScenarios.length < 2) return;
    
    try {
      const results = await onCompare(selectedScenarios);
      setComparisonResults(results);
    } catch (error) {
      console.error('Failed to compare scenarios:', error);
    }
  };

  const handleScenarioSelection = (scenarioId) => {
    setSelectedScenarios(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId);
      }
      return [...prev, scenarioId];
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Create New Scenario</span>
            <Button onClick={handleCreateScenario}>
              <Plus className="h-4 w-4 mr-2" />
              Create Scenario
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Scenario Name</label>
              <Input
                value={newScenario.name}
                onChange={(e) => setNewScenario(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                placeholder="Enter scenario name"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Monthly Savings</label>
                <Input
                  type="number"
                  value={newScenario.modifications.monthlySavings || ''}
                  onChange={(e) => setNewScenario(prev => ({
                    ...prev,
                    modifications: {
                      ...prev.modifications,
                      monthlySavings: parseFloat(e.target.value)
                    }
                  }))}
                  placeholder="Enter amount"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Retirement Age</label>
                <Input
                  type="number"
                  value={newScenario.modifications.retirementAge || ''}
                  onChange={(e) => setNewScenario(prev => ({
                    ...prev,
                    modifications: {
                      ...prev.modifications,
                      retirementAge: parseInt(e.target.value)
                    }
                  }))}
                  placeholder="Enter age"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {scenarios.map(scenario => (
          <Card key={scenario.id} className={
            selectedScenarios.includes(scenario.id) ? 'ring-2 ring-primary' : ''
          }>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{scenario.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScenarioSelection(scenario.id)}
                  >
                    {selectedScenarios.includes(scenario.id) ? 'Selected' : 'Select'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCreate(`${scenario.name} (Copy)`, scenario.modifications)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <MetricsCard
                  title="Scenario Metrics"
                  metrics={{
                    'Success Rate': {
                      current: scenario.results.successRate,
                      type: 'percentage'
                    },
                    'Median Outcome': {
                      current: scenario.results.medianOutcome,
                      type: 'currency'
                    },
                    'Risk Level': {
                      current: scenario.results.riskLevel,
                      type: 'text'
                    }
                  }}
                />

                <div className="h-48">
                  <ScenarioChart
                    data={scenario.results.projections}
                    baseline={baseData}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedScenarios.length >= 2 && (
        <div className="flex justify-center">
          <Button onClick={handleCompareScenarios}>
            <Play className="h-4 w-4 mr-2" />
            Compare Selected Scenarios
          </Button>
        </div>
      )}

      {comparisonResults && (
        <Card>
          <CardHeader>
            <CardTitle>Scenario Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-96">
                <ScenarioChart
                  data={comparisonResults.projections}
                  baseline={baseData}
                  showConfidenceIntervals
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {comparisonResults.scenarios.map(scenario => (
                  <MetricsCard
                    key={scenario.id}
                    title={scenario.name}
                    metrics={{
                      'Success Rate': {
                        current: scenario.metrics.successRate,
                        type: 'percentage'
                      },
                      'Risk-Adjusted Return': {
                        current: scenario.metrics.riskAdjustedReturn,
                        type: 'number'
                      },
                      'Probability of Meeting Goals': {
                        current: scenario.metrics.goalProbability,
                        type: 'percentage'
                      }
                    }}
                  />
                ))}
              </div>

              {comparisonResults.insights.map((insight, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">{insight.title}</div>
                    <p className="mt-1">{insight.description}</p>
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