import { Card } from '@/components/ui/card';
import React from 'react';
import { CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';

export const OptimizationChart = ({
  efficientFrontier,
  portfolioPoint,
  currentPortfolio,
  riskFreeRate = 0.02
}) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <Card className="bg-white p-2 shadow-lg">
          <div className="space-y-1">
            <p className="font-medium">{data.name || 'Portfolio'}</p>
            <p className="text-sm">Return: {(data.return * 100).toFixed(2)}%</p>
            <p className="text-sm">Risk: {(data.risk * 100).toFixed(2)}%</p>
            <p className="text-sm">Sharpe Ratio: {data.sharpeRatio.toFixed(2)}</p>
          </div>
        </Card>
      );
    }
    return null;
  };

  // Calculate Sharpe Ratio for coloring
  const calculateSharpeRatio = (point) => {
    return (point.return - riskFreeRate) / point.risk;
  };

  // Add Sharpe Ratio to all points
  const frontierWithSharpe = efficientFrontier.map(point => ({
    ...point,
    sharpeRatio: calculateSharpeRatio(point)
  }));

  const maxSharpe = Math.max(...frontierWithSharpe.map(p => p.sharpeRatio));
  const minSharpe = Math.min(...frontierWithSharpe.map(p => p.sharpeRatio));

  // Color scale function
  const getColor = (sharpeRatio) => {
    const normalizedValue = (sharpeRatio - minSharpe) / (maxSharpe - minSharpe);
    const hue = 240 * normalizedValue; // Blue (240) to Red (0)
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            type="number"
            dataKey="risk"
            name="Risk"
            unit="%"
            domain={['auto', 'auto']}
            label={{
              value: 'Risk (Standard Deviation)',
              position: 'insideBottom',
              offset: -10
            }}
          />
          <YAxis
            type="number"
            dataKey="return"
            name="Return"
            unit="%"
            domain={['auto', 'auto']}
            label={{
              value: 'Expected Return',
              angle: -90,
              position: 'insideLeft',
              offset: 10
            }}
          />
          <ZAxis 
            type="number" 
            dataKey="sharpeRatio" 
            range={[50, 400]} 
            name="Sharpe Ratio" 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Efficient Frontier */}
          <Scatter
            name="Efficient Frontier"
            data={frontierWithSharpe}
            line={{ stroke: '#8884d8' }}
            lineType="curve"
          >
            {frontierWithSharpe.map((entry, index) => (
              <circle
                key={`dot-${index}`}
                r={4}
                fill={getColor(entry.sharpeRatio)}
              />
            ))}
          </Scatter>

          {/* Current Portfolio Point */}
          {currentPortfolio && (
            <Scatter
              name="Current Portfolio"
              data={[currentPortfolio]}
              fill="#ff7300"
              shape="star"
              size={100}
            />
          )}

          {/* Optimized Portfolio Point */}
          {portfolioPoint && (
            <Scatter
              name="Optimized Portfolio"
              data={[portfolioPoint]}
              fill="#82ca9d"
              shape="diamond"
              size={100}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};