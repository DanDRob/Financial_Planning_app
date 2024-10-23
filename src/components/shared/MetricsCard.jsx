import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

export const MetricsCard = ({
  title,
  metrics,
  type = 'default',
  className = '',
  showTrends = true
}) => {
  const formatValue = (value, metricType) => {
    switch (metricType) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'decimal':
        return value.toFixed(2);
      case 'integer':
        return Math.round(value).toLocaleString();
      default:
        return value.toString();
    }
  };

  const getTrendIcon = (current, previous) => {
    if (!showTrends || !previous) return null;
    
    const change = current - previous;
    if (Math.abs(change) < 0.0001) return <Minus className="h-4 w-4 text-gray-400" />;
    
    return change > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getChangeColor = (current, previous) => {
    if (!previous) return 'text-gray-600';
    const change = current - previous;
    if (Math.abs(change) < 0.0001) return 'text-gray-600';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const calculateChange = (current, previous) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{key}</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${getChangeColor(value.current, value.previous)}`}>
                {formatValue(value.current, value.type)}
              </span>
              {showTrends && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(value.current, value.previous)}
                  {value.previous && (
                    <span className={`text-xs ${getChangeColor(value.current, value.previous)}`}>
                      {calculateChange(value.current, value.previous)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};