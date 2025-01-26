import { Trade } from '../types';

export const calculateProfit = (trade: Trade, closePrice: number, closeQuantity: number): number => {
  return trade.direction === 'LONG'
    ? (closePrice - trade.openPrice) * closeQuantity
    : (trade.openPrice - closePrice) * closeQuantity;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};