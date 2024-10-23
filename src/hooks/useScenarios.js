import { useCallback, useState } from 'react';
import { generateMonteCarloSimulation } from '../utils/calculations/monteCarloUtils';
import { ScenarioAnalyzer } from '../utils/calculations/scenarioUtils';

export const useScenarios = (baseScenario) => {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const analyzer = new ScenarioAnalyzer(baseScenario);

  const createScenario = useCallback(async (name, modifications) => {
    setIsProcessing(true);
    setError(null);

    try {
      const newScenario = {
        id: `scenario_${Date.now()}`,
        name,
        modifications,
        baseScenario,
        results: null
      };

      const simulationResults = await generateMonteCarloSimulation({
        ...baseScenario,
        ...modifications
      });

      const analysis = await analyzer.analyzeScenario({
        ...baseScenario,
        ...modifications
      });

      newScenario.results = {
        simulation: simulationResults,
        analysis,
        metrics: calculateScenarioMetrics(simulationResults, analysis),
        insights: generateScenarioInsights(simulationResults, analysis)
      };

      setScenarios(prev => [...prev, newScenario]);
      return newScenario;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [baseScenario]);

  const updateScenario = useCallback(async (scenarioId, modifications) => {
    setIsProcessing(true);
    setError(null);

    try {
      const updatedScenarios = await Promise.all(
        scenarios.map(async (scenario) => {
          if (scenario.id === scenarioId) {
            const updatedScenario = {
              ...scenario,
              modifications: {
                ...scenario.modifications,
                ...modifications
              }
            };

            const simulationResults = await generateMonteCarloSimulation({
              ...baseScenario,
              ...updatedScenario.modifications
            });

            const analysis = await analyzer.analyzeScenario({
              ...baseScenario,
              ...updatedScenario.modifications
            });

            updatedScenario.results = {
              simulation: simulationResults,
              analysis,
              metrics: calculateScenarioMetrics(simulationResults, analysis),
              insights: generateScenarioInsights(simulationResults, analysis)
            };

            return updatedScenario;
          }
          return scenario;
        })
      );

      setScenarios(updatedScenarios);
      return updatedScenarios.find(s => s.id === scenarioId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [scenarios, baseScenario]);

  const compareScenarios = useCallback(async (scenarioIds) => {
    setIsProcessing(true);
    setError(null);

    try {
      const selectedScenarios = scenarios.filter(s => scenarioIds.includes(s.id));
      
      const comparison = {
        id: `comparison_${Date.now()}`,
        scenarios: selectedScenarios,
        results: await analyzer.compareScenarios(selectedScenarios),
        timestamp: new Date()
      };

      comparison.insights = generateComparisonInsights(comparison.results);
      comparison.recommendations = generateComparisonRecommendations(
        comparison.results
      );

      setComparisons(prev => [...prev, comparison]);
      return comparison;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [scenarios]);

  const calculateScenarioMetrics = (simulation, analysis) => {
    return {
      successRate: calculateSuccessRate(simulation),
      riskMetrics: calculateRiskMetrics(simulation),
      goalAlignment: calculateGoalAlignment(analysis),
      efficiency: calculateEfficiencyMetrics(analysis),
      feasilbility: calculateFeasibilityScore(analysis)
    };
  };

  const calculateSuccessRate = (simulation) => {
    const totalScenarios = simulation.simulations.length;
    const successfulScenarios = simulation.simulations.filter(sim => 
      Math.max(...sim.values) >= simulation.targetValue
    ).length;

    return {
      overall: (successfulScenarios / totalScenarios) * 100,
      byTimeframe: calculateSuccessByTimeframe(simulation),
      byGoal: calculateSuccessByGoal(simulation)
    };
  };

  const calculateRiskMetrics = (simulation) => {
    const values = simulation.simulations.map(sim => sim.values);
    
    return {
      volatility: calculateVolatility(values),
      maxDrawdown: calculateMaxDrawdown(values),
      valueatRisk: calculateValueAtRisk(values),
      stressTestResults: performStressTests(values)
    };
  };

  const calculateGoalAlignment = (analysis) => {
    const goals = analysis.goals || [];
    return goals.map(goal => ({
      name: goal.name,
      probability: calculateGoalProbability(goal, analysis),
      timeframe: analyzeTimeframe(goal, analysis),
      tradeoffs: identifyTradeoffs(goal, analysis)
    }));
  };

  const calculateEfficiencyMetrics = (analysis) => {
    return {
      costEfficiency: calculateCostEfficiency(analysis),
      taxEfficiency: calculateTaxEfficiency(analysis),
      riskAdjustedReturn: calculateRiskAdjustedReturn(analysis),
      diversificationScore: calculateDiversificationScore(analysis)
    };
  };

  const generateScenarioInsights = (simulation, analysis) => {
    const insights = [];

    // Risk-based insights
    const riskMetrics = calculateRiskMetrics(simulation);
    if (riskMetrics.volatility > analysis.riskTolerance) {
      insights.push({
        type: 'risk',
        severity: 'high',
        message: 'Portfolio volatility exceeds risk tolerance',
        recommendation: generateRiskRecommendation(riskMetrics, analysis)
      });
    }

    // Goal-based insights
    const goalAlignment = calculateGoalAlignment(analysis);
    goalAlignment.forEach(goal => {
      if (goal.probability < 0.75) {
        insights.push({
          type: 'goal',
          severity: 'medium',
          message: `Low probability of achieving ${goal.name}`,
          recommendation: generateGoalRecommendation(goal, analysis)
        });
      }
    });

    // Efficiency insights
    const efficiency = calculateEfficiencyMetrics(analysis);
    if (efficiency.costEfficiency < 0.7) {
      insights.push({
        type: 'efficiency',
        severity: 'medium',
        message: 'Room for cost optimization',
        recommendation: generateEfficiencyRecommendation(efficiency, analysis)
      });
    }

    return insights;
  };

  const generateComparisonInsights = (comparisonResults) => {
    const insights = [];

    // Analyze success rates
    const successRates = comparisonResults.scenarios.map(s => s.results.metrics.successRate);
    const bestSuccessRate = Math.max(...successRates);
    const worstSuccessRate = Math.min(...successRates);

    if (bestSuccessRate - worstSuccessRate > 20) {
      insights.push({
        type: 'success_rate',
        message: 'Significant variation in success rates between scenarios',
        detail: analyzeSuccessRateVariation(comparisonResults)
      });
    }

    // Analyze risk profiles
    const riskProfiles = comparisonResults.scenarios.map(s => 
      calculateRiskProfile(s.results.simulation)
    );
    insights.push({
      type: 'risk_comparison',
      message: 'Risk profile comparison',
      detail: compareRiskProfiles(riskProfiles)
    });

    // Analyze trade-offs
    const tradeoffs = identifyScenarioTradeoffs(comparisonResults);
    insights.push({
      type: 'tradeoffs',
      message: 'Key trade-offs between scenarios',
      detail: tradeoffs
    });

    return insights;
  };

  const generateComparisonRecommendations = (results) => {
    const recommendations = [];

    // Identify best performing scenario
    const bestScenario = findBestScenario(results);
    recommendations.push({
      type: 'optimal_scenario',
      scenario: bestScenario.name,
      reason: explainScenarioSelection(bestScenario),
      modifications: suggestModifications(bestScenario)
    });

    // Risk-based recommendations
    const riskAnalysis = analyzeRiskAcrossScenarios(results);
    if (riskAnalysis.hasSignificantVariation) {
      recommendations.push({
        type: 'risk_optimization',
        suggestion: riskAnalysis.recommendation,
        impact: calculateRiskOptimizationImpact(riskAnalysis)
      });
    }

    // Goal achievement recommendations
    const goalAnalysis = analyzeGoalAchievementAcrossScenarios(results);
    recommendations.push({
      type: 'goal_optimization',
      suggestions: goalAnalysis.recommendations,
      tradeoffs: goalAnalysis.tradeoffs
    });

    return recommendations;
  };

  const deleteScenario = useCallback((scenarioId) => {
    setScenarios(prev => prev.filter(s => s.id !== scenarioId));
    if (activeScenario?.id === scenarioId) {
      setActiveScenario(null);
    }
  }, [activeScenario]);

  const duplicateScenario = useCallback(async (scenarioId) => {
    const originalScenario = scenarios.find(s => s.id === scenarioId);
    if (!originalScenario) return;

    try {
      const newScenario = await createScenario(
        `${originalScenario.name} (Copy)`,
        originalScenario.modifications
      );
      return newScenario;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [scenarios, createScenario]);

  const exportScenario = useCallback((scenarioId) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    const exportData = {
      ...scenario,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-${scenario.name}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [scenarios]);

  const importScenario = useCallback(async (file) => {
    try {
      const content = await file.text();
      const importedData = JSON.parse(content);
      
      // Validate imported data
      if (!validateImportedScenario(importedData)) {
        throw new Error('Invalid scenario data format');
      }

      const newScenario = await createScenario(
        `${importedData.name} (Imported)`,
        importedData.modifications
      );
      return newScenario;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [createScenario]);

  return {
    scenarios,
    activeScenario,
    comparisons,
    isProcessing,
    error,
    createScenario,
    updateScenario,
    compareScenarios,
    setActiveScenario,
    deleteScenario,
    duplicateScenario,
    exportScenario,
    importScenario
  };
};

export default useScenarios;