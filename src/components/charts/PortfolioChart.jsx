import { Card } from '@/components/ui/card';
import React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export const PortfolioChart = ({
  currentAllocation,
  targetAllocation,
  benchmarkAllocation
}) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const formatAllocationData = (allocation) => {
    return Object.entries(allocation).map(([asset, value]) => ({
      name: asset,
      value: value,
      target: targetAllocation?.[asset] || 0,
      benchmark: benchmarkAllocation?.[asset] || 0
    }));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <Card className="bg-white p-2 shadow-lg">
          <div className="space-y-1">
            <p className="font-medium">{data.name}</p>
            <p className="text-sm">Current: {data.value.toFixed(2)}%</p>
            {targetAllocation && (
              <p className="text-sm">Target: {data.target.toFixed(2)}%</p>
            )}
            {benchmarkAllocation && (
              <p className="text-sm">Benchmark: {data.benchmark.toFixed(2)}%</p>
            )}
          </div>
        </Card>
      );
    }
    return null;
  };

  const data = formatAllocationData(currentAllocation);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              value,
              name
            }) => {
              const RADIAN = Math.PI / 180;
              const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);

              return (
                <text
                  x={x}
                  y={y}
                  fill="#666"
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                >
                  {`${name} (${value.toFixed(1)}%)`}
                </text>
              );
            }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                strokeWidth={
                  Math.abs(entry.value - entry.target) > 5 ? 2 : 0
                }
                stroke={
                  Math.abs(entry.value - entry.target) > 5 ? '#ff4d4f' : 'none'
                }
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};