import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// More vibrant color palette
const COLORS = {
  'Work': '#3b82f6',      // Blue
  'Personal': '#10b981',  // Green
  'Health': '#f59e0b',    // Orange
  'Learning': '#8b5cf6',  // Purple
  'Fitness': '#ec4899',   // Pink
  'Study': '#06b6d4',     // Cyan
  'Project': '#f43f5e',   // Rose
  'Reading': '#14b8a6',   // Teal
  'General': '#6b7280',   // Gray
  'Other': '#84cc16'      // Lime
};

const getColorForCategory = (category) => {
  if (COLORS[category]) return COLORS[category];
  // Generate consistent color for unknown categories
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#14b8a6'];
  const hash = category.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
};

export default function CategoryBreakdown({ tasks }) {
  const [sortBy, setSortBy] = useState('hours'); // 'hours', 'alphabetical', 'custom'
  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const categoryHours = {};
    tasks.forEach(task => {
      if (task.completed) {
        const category = task.category || 'General';
        if (!categoryHours[category]) {
          categoryHours[category] = 0;
        }
        categoryHours[category] += task.durationHours || 0;
      }
    });

    let data = Object.entries(categoryHours)
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(1)),
        color: getColorForCategory(name)
      }));
    
    // Apply sorting
    if (sortBy === 'hours') {
      data.sort((a, b) => b.value - a.value);
    } else if (sortBy === 'alphabetical') {
      data.sort((a, b) => a.name.localeCompare(b.name));
    }
    // 'custom' keeps original order
    
    return data;
  }, [tasks, sortBy]);

  const totalHours = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0).toFixed(1);
  }, [chartData]);

  const topCategory = chartData.length > 0 ? chartData[0] : null;

  if (chartData.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          🎯 No categories yet
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Add categories to your tasks to see the breakdown!
        </Typography>
      </Box>
    );
  }

  const renderCustomLabel = ({ cx, cy }) => {
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
        <tspan x={cx} dy="-0.5em" fontSize="32" fontWeight="700" fill="#374151">
          {totalHours}h
        </tspan>
        <tspan x={cx} dy="1.5em" fontSize="14" fill="#6b7280">
          Total Hours
        </tspan>
      </text>
    );
  };

  return (
    <Box>
      {/* Chart Title and Controls */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            Category Breakdown
          </Typography>
          
          {/* Sort Control */}
          <Paper elevation={0} sx={{ bgcolor: 'background.default' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="hours">Hours</MenuItem>
                <MenuItem value="alphabetical">Alphabetical</MenuItem>
                <MenuItem value="custom">Custom Order</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Box>
        
        {topCategory && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Top Category: <strong style={{ color: topCategory.color }}>{topCategory.name}</strong> ({topCategory.value}h)
            </Typography>
          </Box>
        )}
      </Box>

      {/* Donut Chart */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={100}
              outerRadius={140}
              paddingAngle={2}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
              animationBegin={0}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    transition: 'all 0.3s'
                  }}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.15s'
              }}
              formatter={(value, name) => [`${value}h (${((value / totalHours) * 100).toFixed(1)}%)`, name]}
              animationDuration={150}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <Box sx={{ minWidth: 200 }}>
          {chartData.map((item, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                mb: 1.5,
                p: 1,
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'scale(1.02)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: 1,
                  bgcolor: item.color,
                  flexShrink: 0,
                  boxShadow: `0 0 8px ${item.color}40`,
                  transition: 'all 0.2s'
                }} 
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {item.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.value}h · {((item.value / totalHours) * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
