import { Card } from '@/components/ui/card';
import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const MonteCarloChart = ({
  simulations,
  confidenceIntervals = [0.95, 0.75, 0.5],
  baselineProjection
}) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <Card className="bg-white p-2 shadow-lg">
          <div className="space-y-1">
            <p className="font-medium">Year {label}</p>
            {payload.map((p, i) => (
              <p key={i} className="text-sm" style={{ color: p.color }}>
                {p.name}: {formatCurrency(p.value)}
              </p>
            ))}
          </div>
        </Card>
      );
    }
    return null;
  };

  const gradientColors = {
    '95': ['#8884d8', '#8884d810'],
    '75': ['#82ca9d', '#82ca9d10'],
    '50': ['#ffc658', '#ffc65810']
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <AreaChart data={simulations} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="year" 
            label={{ 
              value: 'Years', 
              position: 'insideBottom', 
              offset: -5 
            }}
          />
          <YAxis
            tickFormatter={formatCurrency}
            label={{
              value: 'Portfolio Value',
              angle: -90,
              position: 'insideLeft',
              offset: 10
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          {confidenceIntervals.map((interval) => {
            const key = (interval * 100).toString();
            return (
              <defs key={key}>
                <linearGradient id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={gradientColors[key][0]}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={gradientColors[key][1]}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
            );
          })}

          {confidenceIntervals.map((interval) => {
            const key = (interval * 100).toString();
            return (
              <Area
                key={key}
                type="monotone"
                dataKey={`value${key}`}
                stroke={gradientColors[key][0]}
                fillOpacity={1}
                fill={`url(#gradient-${key})`}
                name={`${key}% Confidence`}
              />
            );
          })}

          {baselineProjection && (
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#ff7300"
              strokeWidth={2}
              fill="none"
              name="Baseline Projection"
              strokeDasharray="5 5"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};