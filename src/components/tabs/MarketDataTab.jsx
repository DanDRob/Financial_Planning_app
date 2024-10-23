import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, PieChart, RefreshCcw, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { MarketIndexChart } from '../charts/MarketIndexChart';
import { TechnicalIndicatorChart } from '../charts/TechnicalIndicatorChart';
import { MetricsCard } from '../shared/MetricsCard';

export const MarketDataTab = ({
  data,
  analytics,
  status
}) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [selectedIndices, setSelectedIndices] = useState(['SPY', 'QQQ', 'IWM']);

  const marketIndices = [
    { symbol: 'SPY', name: 'S&P 500', color: '#0088FE' },
    { symbol: 'QQQ', name: 'NASDAQ', color: '#00C49F' },
    { symbol: 'IWM', name: 'Russell 2000', color: '#FFBB28' },
    { symbol: 'DIA', name: 'Dow Jones', color: '#FF8042' }
  ];

  const timeframes = [
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '1Y', label: '1 Year' },
    { value: 'YTD', label: 'Year to Date' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map(tf => (
                <SelectItem key={tf.value} value={tf.value}>
                  {tf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Last updated: {new Date(data?.timestamp).toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {marketIndices.map(index => (
          <Card key={index.symbol}>
            <CardHeader>
              <CardTitle className="text-sm flex justify-between items-center">
                <span>{index.name}</span>
                {data?.[index.symbol] && (
                  <span className={
                    data[index.symbol].change >= 0 ? 'text-green-600' : 'text-red-600'
                  }>
                    {data[index.symbol].change >= 0 ? '+' : ''}
                    {data[index.symbol].change.toFixed(2)}%
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.[index.symbol] && (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    ${data[index.symbol].price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Volume: {(data[index.symbol].volume / 1000000).toFixed(1)}M
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <MarketIndexChart
                data={data}
                indices={selectedIndices}
                timeframe={timeframe}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Technical Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics && (
              <div className="space-y-4">
                <TechnicalIndicatorChart
                  data={analytics.technicals}
                  indicators={['RSI', 'MACD', 'BB']}
                />
                
                <MetricsCard
                  title="Technical Analysis"
                  metrics={{
                    'RSI': {
                      current: analytics.technicals.rsi,
                      type: 'number'
                    },
                    'MACD Signal': {
                      current: analytics.technicals.macd.signal,
                      type: 'number'
                    },
                    'Bollinger Band %B': {
                      current: analytics.technicals.bollinger.percentB,
                      type: 'percentage'
                    }
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Market Breadth
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.marketConditions && (
              <div className="space-y-4">
                <MetricsCard
                  title="Market Health"
                  metrics={{
                    'Advance/Decline Ratio': {
                      current: analytics.marketConditions.advanceDeclineRatio,
                      type: 'number'
                    },
                    'New Highs/Lows': {
                      current: analytics.marketConditions.newHighsLows,
                      type: 'number'
                    },
                    'VIX': {
                      current: analytics.marketConditions.vix,
                      type: 'number'
                    }
                  }}
                />

                <Alert>
                  <AlertDescription>
                    <div className="font-medium">Market Regime: {analytics.marketConditions.regime}</div>
                    <p className="mt-1">{analytics.marketConditions.regimeDescription}</p>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};