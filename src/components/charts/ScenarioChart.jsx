import { Card } from '@/components/ui/card';
import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const ScenarioChart = ({
  scenarios,
  baselineData,
  showConfidenceIntervals = true,
  goalLine
}) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
        <Card className="bg-white p-3 shadow-lg">
          <div className="space-y-2">
            <p className="font-medium">Year {label}</p>
            {payload.map((entry, index) => (
              <div key={index} className="flex justify-between gap-4">
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span className="font-medium">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      );
    }
    return null;
  };

  const renderConfidenceIntervals = (scenario, index) => {
    if (!showConfidenceIntervals || !scenario.confidenceIntervals) return null;

    return (
      <>
        <Area
          key={`confidence-95-${index}`}
          dataKey={`confidence95`}
          data={scenario.confidenceIntervals}
          fill={COLORS[index]}
          fillOpacity={0.1}
          stroke="none"
        />
        <Area
          key={`confidence-75-${index}`}
          dataKey={`confidence75`}
          data={scenario.confidenceIntervals}
          fill={COLORS[index]}
          fillOpacity={0.2}
          stroke="none"
        />
      </>
    );
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="year"
            label={{
              value: 'Years',
              position: 'insideBottom',
              offset: -10
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
          <Legend />

          {/* Baseline */}
          {baselineData && (
            <Line
              type="monotone"
              data={baselineData}
              dataKey="value"
              name="Baseline"
              stroke="#808080"
              strokeDasharray="5 5"
              dot={false}
            />
          )}

          {/* Scenarios */}
          {scenarios.map((scenario, index) => (
            <React.Fragment key={scenario.name}>
              {renderConfidenceIntervals(scenario, index)}
              <Line
                type="monotone"
                data={scenario.projections}
                dataKey="value"
                name={scenario.name}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </React.Fragment>
          ))}

          {/* Goal Line */}
          {goalLine && (
            <ReferenceLine
              y={goalLine.value}
              label={goalLine.label}
              stroke="#ff4d4f"
              strokeDasharray="3 3"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};