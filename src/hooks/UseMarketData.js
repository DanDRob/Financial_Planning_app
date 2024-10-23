import { useCallback, useEffect, useRef, useState } from 'react';
import { MarketDataService } from '../utils/api/marketDataApi';
import { MarketAnalytics } from '../utils/calculations/marketAnalytics';

export const useMarketData = (symbols, options = {}) => {
  const [data, setData] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const [error, setError] = useState(null);

  const serviceRef = useRef(null);
  const analyticsRef = useRef(null);
  const subscriptionRef = useRef(null);

  const config = {
    updateInterval: 1000,
    retryAttempts: 3,
    retryDelay: 1000,
    includeAnalytics: true,
    ...options
  };

  useEffect(() => {
    initializeService();
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (serviceRef.current && symbols) {
      updateSubscription(symbols);
    }
  }, [symbols]);

  const initializeService = async () => {
    try {
      serviceRef.current = new MarketDataService(config);
      analyticsRef.current = new MarketAnalytics();

      await serviceRef.current.initialize();
      setStatus('connected');

      if (symbols) {
        await updateSubscription(symbols);
      }
    } catch (err) {
      setError(err.message);
      setStatus('error');
      handleReconnect();
    }
  };

  const updateSubscription = async (symbols) => {
    try {
      if (subscriptionRef.current) {
        await serviceRef.current.unsubscribe(subscriptionRef.current);
      }

      subscriptionRef.current = await serviceRef.current.subscribeToRealTimeData(
        symbols,
        handleDataUpdate
      );
    } catch (err) {
      setError(err.message);
      handleReconnect();
    }
  };

  const handleDataUpdate = useCallback(async (update) => {
    setData(prev => ({
      ...prev,
      [update.symbol]: {
        ...prev[update.symbol],
        ...update.data,
        lastUpdated: Date.now()
      }
    }));

    if (config.includeAnalytics) {
      updateAnalytics(update);
    }
  }, [config.includeAnalytics]);

  const updateAnalytics = async (update) => {
    try {
      const technicals = await analyticsRef.current.analyzeTechnicals(update.symbol);
      const marketConditions = await analyticsRef.current.analyzeMarketConditions();

      setAnalytics(prev => ({
        ...prev,
        [update.symbol]: {
          technicals,
          marketConditions,
          timestamp: Date.now()
        }
      }));
    } catch (err) {
      console.error('Analytics update failed:', err);
    }
  };

  const handleReconnect = useCallback(() => {
    let attempts = 0;
    const retry = async () => {
      if (attempts < config.retryAttempts) {
        attempts++;
        try {
          await initializeService();
        } catch (err) {
          setTimeout(retry, config.retryDelay * attempts);
        }
      } else {
        setStatus('failed');
      }
    };
    retry();
  }, [config.retryAttempts, config.retryDelay]);

  const cleanup = () => {
    if (subscriptionRef.current) {
      serviceRef.current?.unsubscribe(subscriptionRef.current);
    }
    serviceRef.current?.disconnect();
  };

  const refresh = async () => {
    try {
      const historicalData = await serviceRef.current.getHistoricalData(
        symbols,
        '1D'
      );
      setData(prev => ({
        ...prev,
        historical: historicalData
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    data,
    analytics,
    status,
    error,
    refresh,
    isConnected: status === 'connected'
  };
};