import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PieChartIcon from '@mui/icons-material/PieChart';
import BalanceIcon from '@mui/icons-material/Balance';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { generateInsights } from '../../utils/insightsCalculator';

const iconMap = {
  CalendarToday: CalendarTodayIcon,
  WbSunny: WbSunnyIcon,
  LightMode: LightModeIcon,
  NightsStay: NightsStayIcon,
  TrendingUp: TrendingUpIcon,
  Timeline: TimelineIcon,
  LocalFireDepartment: LocalFireDepartmentIcon,
  PieChart: PieChartIcon,
  Balance: BalanceIcon,
  Lightbulb: LightbulbIcon,
  EmojiEvents: EmojiEventsIcon
};

function InsightCard({ insight }) {
  const IconComponent = iconMap[insight.icon] || EmojiEventsIcon;
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2.5,
        borderRadius: 2,
        borderLeft: '4px solid',
        borderLeftColor: insight.color,
        bgcolor: 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      {/* Top Section */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: `${insight.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <IconComponent sx={{ fontSize: 28, color: insight.color }} />
        </Box>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, lineHeight: 1.3 }}>
            {insight.title}
          </Typography>
          {insight.metric && (
            <Chip
              label={insight.metric}
              size="small"
              sx={{
                bgcolor: `${insight.color}15`,
                color: insight.color,
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24
              }}
            />
          )}
        </Box>
      </Box>
      
      {/* Description */}
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ mb: insight.suggestion ? 2 : 0, lineHeight: 1.6 }}
      >
        {insight.description}
      </Typography>
      
      {/* Suggestion Box */}
      {insight.suggestion && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: 'action.hover',
            display: 'flex',
            gap: 1,
            alignItems: 'flex-start'
          }}
        >
          <TipsAndUpdatesIcon 
            sx={{ 
              fontSize: 18, 
              color: 'primary.main',
              flexShrink: 0,
              mt: 0.2
            }} 
          />
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {insight.suggestion}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

function EmptyState() {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 4,
        borderRadius: 3,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2
        }}
      >
        <PsychologyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
      </Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Insights Coming Soon!
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
        Complete at least 7 days of tasks to unlock personalized insights about your productivity patterns.
      </Typography>
      <Box sx={{ maxWidth: 200, mx: 'auto', mt: 3 }}>
        <LinearProgress 
          variant="determinate" 
          value={0} 
          sx={{ 
            height: 8, 
            borderRadius: 1,
            bgcolor: 'action.hover'
          }} 
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Keep tracking to unlock insights
        </Typography>
      </Box>
    </Paper>
  );
}

export default function PersonalizedInsights({ tasks }) {
  const insights = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    return generateInsights(tasks);
  }, [tasks]);
  
  const completedTasks = useMemo(() => 
    tasks?.filter(task => task.completed) || [], 
    [tasks]
  );
  
  const hasEnoughData = completedTasks.length >= 7;
  
  return (
    <Box sx={{ mb: 4 }}>
      {/* Section Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <PsychologyIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>
            Your Insights
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {hasEnoughData 
            ? `Personalized analysis based on ${completedTasks.length} completed tasks`
            : 'Complete more tasks to unlock insights'
          }
        </Typography>
      </Box>
      
      {/* Insights Grid or Empty State */}
      {!hasEnoughData || insights.length === 0 ? (
        <EmptyState />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)'
            },
            gap: 2.5
          }}
        >
          {insights.map((insight, index) => (
            <InsightCard key={`${insight.type}-${index}`} insight={insight} />
          ))}
        </Box>
      )}
    </Box>
  );
}
