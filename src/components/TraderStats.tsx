import { Paper, Typography, Box, Divider, LinearProgress, TextField, IconButton } from '@mui/material';
import { useState } from 'react';
import { Trade } from '../types';
import { TraderConfig } from '../config/traders';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';

interface TraderStatsProps {
  trades: Trade[];
  traders: TraderConfig[];
  onUpdateTraderName: (traderId: string, newName: string) => void;
}

const TraderStats = ({ trades, traders, onUpdateTraderName }: TraderStatsProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

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

  const handleStartEdit = (trader: TraderConfig) => {
    setEditingId(trader.id);
    setEditName(trader.name);
  };

  const handleSave = (traderId: string) => {
    if (editName.trim()) {
      onUpdateTraderName(traderId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>交易员统计</Typography>
      {traders.map(trader => {
        const stats = calculateStats(trader.id);
        const winRateNumber = Number(stats.winRate);
        
        return (
          <Box key={trader.id} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {editingId === trader.id ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    size="small"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => handleSave(trader.id)}
                    color="primary"
                  >
                    <CheckIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {trader.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleStartEdit(trader)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Typography variant="body2">
                总交易: {stats.totalTrades} 笔
              </Typography>
              <Typography variant="body2">
                成功: {stats.successfulTrades} 笔
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>胜率: {stats.winRate}%</Typography>
            <LinearProgress 
              variant="determinate" 
              value={winRateNumber}
              sx={{
                mb: 1,
                height: 6,
                borderRadius: 1,
                bgcolor: 'grey.800',
                '& .MuiLinearProgress-bar': {
                  bgcolor: winRateNumber >= 50 ? 'success.main' : 'error.main'
                }
              }}
            />
            <Typography 
              variant="body1" 
              sx={{
                fontWeight: 'bold',
                color: Number(stats.totalProfit) > 0 ? 'success.main' : 'error.main'
              }}
            >
              总盈亏: {stats.totalProfit}
            </Typography>
            <Divider sx={{ mt: 2 }} />
          </Box>
        );
      })}
    </Paper>
  );
};

export default TraderStats;