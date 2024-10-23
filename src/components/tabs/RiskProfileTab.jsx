import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ControlPanel } from '../shared/ControlPanel';
import { MetricsCard } from '../shared/MetricsCard';

export const RiskProfileTab = ({ profile, onUpdate }) => {
  const [riskScore, setRiskScore] = useState(0);

  const riskQuestions = [
    {
      id: 'time_horizon',
      question: "What is your investment time horizon?",
      options: [
        { value: 1, label: "1-3 years" },
        { value: 2, label: "3-5 years" },
        { value: 3, label: "5-10 years" },
        { value: 4, label: "10+ years" }
      ]
    },
    {
      id: 'market_decline',
      question: "How would you react to a 20% decline in your portfolio?",
      options: [
        { value: 1, label: "Sell everything immediately" },
        { value: 2, label: "Sell some investments" },
        { value: 3, label: "Hold steady" },
        { value: 4, label: "Buy more" }
      ]
    },
    {
      id: 'investment_knowledge',
      question: "How would you rate your investment knowledge?",
      options: [
        { value: 1, label: "Beginner" },
        { value: 2, label: "Intermediate" },
        { value: 3, label: "Advanced" },
        { value: 4, label: "Expert" }
      ]
    },
    {
      id: 'income_stability',
      question: "How stable is your current and future income?",
      options: [
        { value: 1, label: "Very unstable" },
        { value: 2, label: "Somewhat unstable" },
        { value: 3, label: "Stable" },
        { value: 4, label: "Very stable" }
      ]
    }
  ];

  useEffect(() => {
    calculateRiskScore();
  }, [profile]);

  const calculateRiskScore = () => {
    if (!profile.answers) return;
    
    const totalScore = profile.answers.reduce((acc, curr) => acc + curr, 0);
    const maxScore = riskQuestions.length * 4;
    const normalizedScore = (totalScore / maxScore) * 100;
    setRiskScore(normalizedScore);
  };

  const getRiskProfile = (score) => {
    if (score < 25) return "Conservative";
    if (score < 50) return "Moderately Conservative";
    if (score < 75) return "Moderate";
    if (score < 90) return "Moderately Aggressive";
    return "Aggressive";
  };

  const handleAnswerChange = (questionIndex, value) => {
    const newAnswers = [...(profile.answers || [])];
    newAnswers[questionIndex] = parseInt(value);
    onUpdate({ answers: newAnswers });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Tolerance Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {riskQuestions.map((q, index) => (
              <div key={q.id} className="space-y-2">
                <label className="text-sm font-medium">{q.question}</label>
                <RadioGroup
                  value={profile.answers?.[index]?.toString()}
                  onValueChange={(value) => handleAnswerChange(index, value)}
                >
                  {q.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value.toString()} id={`${q.id}-${option.value}`} />
                      <label htmlFor={`${q.id}-${option.value}`}>{option.label}</label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Risk Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Risk Score</label>
                  <Slider
                    value={[riskScore]}
                    max={100}
                    step={1}
                    disabled
                    className="mt-2"
                  />
                  <div className="mt-2 text-center font-medium">
                    {getRiskProfile(riskScore)}
                  </div>
                </div>

                <MetricsCard
                  title="Risk Metrics"
                  metrics={{
                    'Risk Score': { current: riskScore, type: 'percentage' },
                    'Risk Category': { current: getRiskProfile(riskScore), type: 'text' },
                    'Recommended Equity': { 
                      current: Math.min(90, Math.max(20, riskScore)), 
                      type: 'percentage' 
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <ControlPanel
                settings={{
                  useMarketTiming: profile.useMarketTiming || false,
                  allowLeverage: profile.allowLeverage || false,
                  rebalancingFrequency: profile.rebalancingFrequency || 'quarterly'
                }}
                onChange={(settings) => onUpdate(settings)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {riskScore > 80 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your risk tolerance is relatively high. Make sure you understand the potential 
            for significant portfolio volatility and losses.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};