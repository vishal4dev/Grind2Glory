import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BarChartIcon from '@mui/icons-material/BarChart';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Import chart components (we'll create these)
import ProductivityTrend from '../components/analytics/ProductivityTrend';
import CategoryBreakdown from '../components/analytics/CategoryBreakdown';
import TimeDistribution from '../components/analytics/TimeDistribution';
import WeeklyHeatmap from '../components/analytics/WeeklyHeatmap';
import CompletionRate from '../components/analytics/CompletionRate';
import StreakAnalysis from '../components/analytics/StreakAnalysis';

const chartOptions = [
  {
    id: 'productivity',
    icon: <TrendingUpIcon />,
    name: 'Productivity Trend',
    description: 'Track your daily work hours over time',
    component: ProductivityTrend
  },
  {
    id: 'category',
    icon: <PieChartIcon />,
    name: 'Category Breakdown',
    description: 'See how you distribute time across categories',
    component: CategoryBreakdown
  },
  {
    id: 'time',
    icon: <AccessTimeIcon />,
    name: 'Time Distribution',
    description: 'Discover your most productive hours',
    component: TimeDistribution
  },
  {
    id: 'heatmap',
    icon: <CalendarMonthIcon />,
    name: 'Weekly Heatmap',
    description: 'Visualize your weekly productivity patterns',
    component: WeeklyHeatmap
  },
  {
    id: 'completion',
    icon: <CheckCircleIcon />,
    name: 'Completion Rate',
    description: 'Monitor your task completion percentage',
    component: CompletionRate
  },
  {
    id: 'streak',
    icon: <LocalFireDepartmentIcon />,
    name: 'Streak Analysis',
    description: 'Track your consistency and streaks',
    component: StreakAnalysis
  }
];

const dateRanges = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: 'All Time', value: 0 }
];

export default function Analytics() {
  const [selectedChart, setSelectedChart] = useState(chartOptions[0]);
  const [dateRange, setDateRange] = useState(30);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleChartMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleChartMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChartSelect = (chart) => {
    setSelectedChart(chart);
    handleChartMenuClose();
  };

  const ChartComponent = selectedChart.component;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <BarChartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h3" fontWeight={700}>
            Analytics
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {dateRange === 0 ? 'All Time' : `Last ${dateRange} Days`}
        </Typography>
      </Box>

      {/* Control Bar */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: { xs: 2, sm: 2.5 }, 
          mb: 3, 
          bgcolor: 'background.paper',
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Chart Selector Dropdown */}
        <Button
          variant="outlined"
          onClick={handleChartMenuOpen}
          endIcon={<KeyboardArrowDownIcon />}
          startIcon={selectedChart.icon}
          sx={{
            width: { xs: '100%', sm: 250 },
            justifyContent: 'space-between',
            textTransform: 'none',
            py: 1.5,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body1" fontWeight={600}>
              {selectedChart.name}
            </Typography>
          </Box>
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleChartMenuClose}
          PaperProps={{
            sx: {
              width: 320,
              maxHeight: 400,
              mt: 1
            }
          }}
        >
          {chartOptions.map((chart) => (
            <MenuItem
              key={chart.id}
              onClick={() => handleChartSelect(chart)}
              selected={chart.id === selectedChart.id}
              sx={{
                py: 1.5,
                px: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                '&:hover': {
                  bgcolor: 'primary.light',
                  '& .MuiTypography-root': {
                    color: 'primary.contrastText'
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {chart.icon}
                <Typography variant="body1" fontWeight={600}>
                  {chart.name}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                {chart.description}
              </Typography>
            </MenuItem>
          ))}
        </Menu>

        {/* Date Range Buttons */}
        <ButtonGroup 
          variant="outlined" 
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            '& .MuiButton-root': {
              flex: { xs: 1, sm: 'initial' }
            }
          }}
        >
          {dateRanges.map((range) => (
            <Button
              key={range.value}
              variant={dateRange === range.value ? 'contained' : 'outlined'}
              onClick={() => setDateRange(range.value)}
              sx={{ textTransform: 'none', minWidth: { xs: 'auto', sm: 80 } }}
            >
              {range.label}
            </Button>
          ))}
        </ButtonGroup>
      </Paper>

      {/* Main Chart Display Area */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          minHeight: 400,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <ChartComponent dateRange={dateRange} />
      </Paper>
    </Box>
  );
}
