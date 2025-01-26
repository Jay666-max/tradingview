import { useState } from 'react';
import { 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, Alert
} from '@mui/material';
import { Trade } from '../types';
import { formatNumber, formatTimestamp, calculateProfit } from '../utils/tradeUtils';
import { TraderConfig } from '../config/traders';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface TradeListProps {
  trades: Trade[];
  traders: TraderConfig[];
  onCloseTrade: (tradeId: string, closePrice: number, closeQuantity: number) => void;
  onReset: () => void;
}

const TradeList = ({ trades, traders, onCloseTrade, onReset }: TradeListProps) => {
  const [closeDialog, setCloseDialog] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [closePrice, setClosePrice] = useState('');
  const [closeQuantity, setCloseQuantity] = useState('');
  const [error, setError] = useState('');

  const handleCloseDialog = () => {
    setCloseDialog(false);
    setSelectedTrade(null);
    setClosePrice('');
    setCloseQuantity('');
    setError('');
  };

  const handleCloseTrade = () => {
    if (!selectedTrade || !closePrice || !closeQuantity) return;

    const price = Number(closePrice);
    const quantity = Number(closeQuantity);
    
    if (quantity > selectedTrade.remainingQuantity) {
      setError('平仓数量不能大于剩余数量');
      return;
    }
    
    if (price <= 0) {
      setError('平仓价格必须大于0');
      return;
    }

    const expectedProfit = calculateProfit(selectedTrade, price, quantity);
    if (!window.confirm(`确认平仓？\n预计盈亏: ${formatNumber(expectedProfit)}`)) {
      return;
    }

    onCloseTrade(selectedTrade.id, price, quantity);
    handleCloseDialog();
  };

  const openTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setCloseDialog(true);
    setCloseQuantity(trade.remainingQuantity.toString());
    setClosePrice(trade.openPrice.toString());
  };

  const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
  const openPositions = trades.filter(t => t.status === 'OPEN').length;

  const renderTradeStatus = (status: Trade['status'], remainingQuantity: number) => {
    if (remainingQuantity === 0) return '无持仓';
    switch (status) {
      case 'OPEN': return '持仓中';
      case 'PARTIALLY_CLOSED': return '部分平仓';
      case 'CLOSED': return '已平仓';
    }
  };

  const getTraderName = (traderId: string) => {
    const trader = traders.find(t => t.id === traderId);
    return trader ? trader.name : `交易员${traderId}`;
  };

  const calculateStats = (traderId: string) => {
    const traderTrades = trades.filter(t => t.trader === traderId);
    // 计算所有有盈亏的交易记录数量
    const totalTrades = traderTrades.filter(t => t.profit !== undefined).length;
    // 计算盈利的交易数量
    const successfulTrades = traderTrades.filter(t => (t.profit || 0) > 0).length;
    const totalProfit = traderTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const openPositions = traderTrades.filter(t => t.status === 'OPEN').length;
    
    return {
      totalTrades,
      successfulTrades,
      winRate: totalTrades ? (successfulTrades / totalTrades * 100).toFixed(1) : '0',
      totalProfit: totalProfit.toFixed(2),
      openPositions
    };
  };

  const handleExportExcel = () => {
    // 交易记录数据
    const tradeData = trades.map(trade => ({
      '时间': formatTimestamp(trade.timestamp),
      '交易员': getTraderName(trade.trader),
      '方向': trade.direction === 'LONG' ? '做多' : '做空',
      '开仓价': trade.openPrice,
      '平仓价': trade.closePrice || '-',
      '数量': trade.quantity,
      '剩余数量': trade.remainingQuantity,
      '盈亏': trade.profit || '-',
      '状态': renderTradeStatus(trade.status, trade.remainingQuantity),
      '类型': trade.relatedTradeId ? '平仓记录' : '开仓记录'
    }));
    
    // 交易员统计数据
    const traderStats = traders.map(trader => {
      const stats = calculateStats(trader.id);
      return {
        '交易员': trader.name,
        '总交易次数': stats.totalTrades,
        '成功交易': stats.successfulTrades,
        '胜率': `${stats.winRate}%`,
        '总盈亏': stats.totalProfit
      };
    });
    
    // 创建工作簿和工作表
    const wb = XLSX.utils.book_new();
    
    // 添加交易记录工作表
    const wsRecords = XLSX.utils.json_to_sheet(tradeData);
    XLSX.utils.book_append_sheet(wb, wsRecords, '交易记录');
    
    // 添加交易员统计工作表
    const wsStats = XLSX.utils.json_to_sheet(traderStats);
    XLSX.utils.book_append_sheet(wb, wsStats, '交易员统计');

    // 导出Excel文件
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `火箭班沙盘pk交易记录_${formatTimestamp(Date.now())}.xlsx`);
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>交易记录</Typography>
          <Typography variant="body2" color="text.secondary">
            总计: {trades.length} 笔 / 持仓: {openPositions} 笔
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" sx={{ color: totalProfit > 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
            总盈亏: {formatNumber(totalProfit)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportExcel}
            >
              导出Excel
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={onReset}
            >
              清盘
            </Button>
          </Box>
        </Box>
      </Box>
      
      <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>时间</TableCell>
              <TableCell>交易员</TableCell>
              <TableCell>方向</TableCell>
              <TableCell>开仓价</TableCell>
              <TableCell>平仓价</TableCell>
              <TableCell>数量</TableCell>
              <TableCell>剩余数量</TableCell>
              <TableCell>盈亏</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>类型</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trades.map((trade) => (
              <TableRow 
                key={trade.id}
                sx={{ 
                  bgcolor: trade.status === 'OPEN' ? 'action.hover' : 'inherit',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <TableCell>{formatTimestamp(trade.timestamp)}</TableCell>
                <TableCell>{getTraderName(trade.trader)}</TableCell>
                <TableCell sx={{ 
                  color: trade.direction === 'LONG' ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}>
                  {trade.direction === 'LONG' ? '做多' : '做空'}
                </TableCell>
                <TableCell>{formatNumber(trade.openPrice)}</TableCell>
                <TableCell>{trade.closePrice ? formatNumber(trade.closePrice) : '-'}</TableCell>
                <TableCell>{trade.quantity}</TableCell>
                <TableCell>{trade.remainingQuantity}</TableCell>
                <TableCell sx={{
                  color: trade.profit ? (trade.profit > 0 ? 'success.main' : 'error.main') : 'inherit',
                  fontWeight: 'bold'
                }}>
                  {trade.profit ? formatNumber(trade.profit) : '-'}
                </TableCell>
                <TableCell>{renderTradeStatus(trade.status, trade.remainingQuantity)}</TableCell>
                <TableCell>
                  {trade.status !== 'CLOSED' && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => openTrade(trade)}
                      disabled={trade.remainingQuantity === 0}
                      sx={{
                        opacity: trade.remainingQuantity === 0 ? 0.5 : 1,
                        '&.Mui-disabled': {
                          bgcolor: 'action.disabledBackground',
                          color: 'text.disabled'
                        }
                      }}
                    >
                      平仓
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={closeDialog} 
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>平仓操作</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          {selectedTrade && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                交易方向: {selectedTrade.direction === 'LONG' ? '做多' : '做空'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                开仓价格: {formatNumber(selectedTrade.openPrice)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                剩余数量: {selectedTrade.remainingQuantity}
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="平仓价格"
            type="number"
            fullWidth
            variant="outlined"
            value={closePrice}
            onChange={(e) => {
              setClosePrice(e.target.value);
              setError('');
            }}
            inputProps={{ step: '0.01', min: '0' }}
          />
          <TextField
            margin="dense"
            label="平仓数量"
            type="number"
            fullWidth
            variant="outlined"
            value={closeQuantity}
            onChange={(e) => {
              setCloseQuantity(e.target.value);
              setError('');
            }}
            inputProps={{ 
              step: '1',
              min: '1',
              max: selectedTrade?.remainingQuantity
            }}
          />
          {closePrice && closeQuantity && selectedTrade && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2">
                预计盈亏: {formatNumber(calculateProfit(selectedTrade, Number(closePrice), Number(closeQuantity)))}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button 
            onClick={handleCloseTrade} 
            variant="contained"
            disabled={!closePrice || !closeQuantity}
          >
            确认平仓
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TradeList;