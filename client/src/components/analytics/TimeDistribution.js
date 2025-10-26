import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchTimeDistributionData } from '../../services/api';

const TIME_PERIODS = [
  { name: 'Morning', icon: '☀️', start: 6, end: 12, color: '#fbbf24' },
  { name: 'Afternoon', icon: '🌤️', start: 12, end: 18, color: '#f59e0b' },
  { name: 'Evening', icon: '🌆', start: 18, end: 22, color: '#f97316' },
  { name: 'Night', icon: '🌙', start: 22, end: 6, color: '#7c3aed' }
];

export default function TimeDistribution({ dateRange }) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [peakTime, setPeakTime] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { data } = await fetchTimeDistributionData(dateRange);
        
        // Merge with TIME_PERIODS to get icons and colors
        const enrichedData = data.chartData.map(item => {
          const period = TIME_PERIODS.find(p => p.name === item.name);
          return {
            ...item,
            ...period
          };
        });
        
        setChartData(enrichedData);
        
        // Set peak time with icon and color
        if (data.peakTime && data.peakTime.hours > 0) {
          const period = TIME_PERIODS.find(p => p.name === data.peakTime.name);
          setPeakTime({ ...data.peakTime, ...period });
        }
      } catch (error) {
        console.error('Error loading time distribution data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dateRange]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (chartData.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          ⏰ No time data yet
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete tasks during different times to see patterns!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Chart Title and Key Metrics */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Time Distribution
        </Typography>
        {peakTime && peakTime.hours > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Peak Productivity: <strong>{peakTime.icon} {peakTime.name}</strong> ({peakTime.hours}h)
            </Typography>
          </Box>
        )}
      </Box>

      {/* Horizontal Bar Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart 
          data={chartData} 
          layout="vertical"
          margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number" 
            stroke="#6b7280"
            label={{ value: 'Hours', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#6b7280"
            tick={(props) => {
              const { x, y, payload } = props;
              const period = TIME_PERIODS.find(p => p.name === payload.value);
              return (
                <g transform={`translate(${x},${y})`}>
                  <text x={-10} y={0} textAnchor="end" fill="#374151" fontSize={14}>
                    <tspan fontSize={18}>{period?.icon}</tspan>
                    <tspan dx={8}>{payload.value}</tspan>
                  </text>
                </g>
              );
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 12
            }}
            formatter={(value) => [`${value} hours`, 'Completed']}
          />
          <Bar dataKey="hours" radius={[0, 8, 8, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
