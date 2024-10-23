import { Card } from '@/components/ui/card';
import React from 'react';
import { ResponsiveContainer, Tooltip, Treemap } from 'recharts';

export const AccountLocationChart = ({
  assetLocations,
  taxEfficiency,
  showEfficiencyScore = true
}) => {
  const ACCOUNT_COLORS = {
    'taxable': '#0088FE',
    'traditional': '#00C49F',
    'roth': '#FFBB28'
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatData = () => {
    return {
      name: 'Portfolio',
      children: Object.entries(assetLocations).map(([accountType, assets]) => ({
        name: accountType,
        children: Object.entries(assets).map(([asset, value]) => ({
          name: asset,
          value,
          accountType,
          taxEfficiencyScore: taxEfficiency?.[asset] || 0
        }))
      }))
    };
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <Card className="bg-white p-3 shadow-lg">
          <div className="space-y-2">
            <p className="font-medium">{data.name}</p>
            <p className="text-sm">Account: {data.accountType}</p>
            <p className="text-sm">Value: {formatCurrency(data.value)}</p>
            {showEfficiencyScore && (
              <p className="text-sm">
                Tax Efficiency: {(data.taxEfficiencyScore * 100).toFixed(1)}%
              </p>
            )}
          </div>
        </Card>
      );
    }
    return null;
  };

  const CustomizedContent = ({ root, depth, x, y, width, height, name, value, accountType }) => {
    const opacity = depth === 1 ? 0.8 : 0.3;
    const color = ACCOUNT_COLORS[accountType] || '#666';

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={color}
          fillOpacity={opacity}
          stroke="#fff"
        />
        {width > 50 && height > 30 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={12}
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={10}
            >
              {formatCurrency(value)}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer>
        <Treemap
          data={formatData()}
          dataKey="value"
          aspectRatio={4/3}
          stroke="#fff"
          content={<CustomizedContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>

      {showEfficiencyScore && taxEfficiency?.portfolioScore && (
        <div className="mt-4 text-center">
          <p className="text-sm font-medium">
            Overall Tax Efficiency Score:
            <span className="ml-2 text-lg text-green-600">
              {(taxEfficiency.portfolioScore * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      )}
    </div>
  );
};