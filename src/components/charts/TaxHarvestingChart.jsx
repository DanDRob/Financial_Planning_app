import { Card } from '@/components/ui/card';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const TaxHarvestingChart = ({
  opportunities,
  harvestingThreshold,
  showAlternatives = true
}) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(value));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <Card className="bg-white p-3 shadow-lg">
          <div className="space-y-2">
            <p className="font-medium">{data.asset}</p>
            <div className="space-y-1">
              <p className="text-sm">
                Unrealized Loss: {formatCurrency(data.unrealizedLoss)}
              </p>
              <p className="text-sm">
                Tax Savings: {formatCurrency(data.potentialSavings)}
              </p>
              {showAlternatives && data.alternatives && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Alternatives:</p>
                  {data.alternatives.map((alt, index) => (
                    <p key={index} className="text-sm">
                      {alt.name} (Correlation: {(alt.correlation * 100).toFixed(1)}%)
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <BarChart
          data={opportunities}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="asset"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis
            tickFormatter={formatCurrency}
            label={{
              value: 'Unrealized Loss / Potential Savings',
              angle: -90,
              position: 'insideLeft',
              offset: 10
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Bar
            dataKey="unrealizedLoss"
            fill="#ff4d4f"
            name="Unrealized Loss"
          />
          <Bar
            dataKey="potentialSavings"
            fill="#52c41a"
            name="Potential Tax Savings"
          />

          {harvestingThreshold && (
            <ReferenceLine
              y={-harvestingThreshold}
              stroke="#1890ff"
              strokeDasharray="3 3"
              label={{
                value: 'Harvesting Threshold',
                position: 'right'
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};