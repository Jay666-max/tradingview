export type TraderID = string;
export type TradeDirection = 'LONG' | 'SHORT';
export type TradeStatus = 'OPEN' | 'CLOSED' | 'PARTIALLY_CLOSED';

export interface Trade {
  id: string;
  trader: TraderID;
  direction: TradeDirection;
  openPrice: number;
  closePrice?: number;
  quantity: number;
  remainingQuantity: number;
  profit?: number;
  status: TradeStatus;
  timestamp: number;
  relatedTradeId?: string; // 添加关联ID字段
}