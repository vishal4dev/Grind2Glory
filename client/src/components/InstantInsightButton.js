import React, { useState, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PsychologyIcon from '@mui/icons-material/Psychology';
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
import { getInstantInsight } from '../utils/insightsCalculator';
import { fetchInsightsData } from '../services/api';

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

export default function InstantInsightButton() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const { data } = await fetchInsightsData();
        setTasks(data.tasks || []);
      } catch (error) {
        console.error('Error loading tasks for instant insight:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadTasks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const instantInsight = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;
    return getInstantInsight(tasks);
  }, [tasks]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (loading || !instantInsight) return null;

  const IconComponent = iconMap[instantInsight.icon] || EmojiEventsIcon;

  return (
    <>
      {/* Floating Button */}
      <Tooltip title="Instant Insight" placement="right">
        <Fab
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            bgcolor: theme.palette.mode === 'light' ? 'primary.main' : instantInsight.color,
            color: '#fff',
            zIndex: 1000,
            width: 56,
            height: 56,
            boxShadow: 3,
            transition: 'all 0.3s ease',
            animation: 'pulse 2s infinite',
            '&:hover': {
              bgcolor: theme.palette.mode === 'light' ? 'primary.dark' : instantInsight.color,
              transform: 'scale(1.1)',
              boxShadow: 6
            },
            '@keyframes pulse': {
              '0%': {
                boxShadow: theme.palette.mode === 'light' 
                  ? `0 0 0 0 ${theme.palette.primary.main}80`
                  : `0 0 0 0 ${instantInsight.color}80`
              },
              '70%': {
                boxShadow: theme.palette.mode === 'light'
                  ? `0 0 0 10px ${theme.palette.primary.main}00`
                  : `0 0 0 10px ${instantInsight.color}00`
              },
              '100%': {
                boxShadow: theme.palette.mode === 'light'
                  ? `0 0 0 0 ${theme.palette.primary.main}00`
                  : `0 0 0 0 ${instantInsight.color}00`
              }
            }
          }}
        >
          <PsychologyIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Tooltip>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme.palette.mode === 'light'
              ? `linear-gradient(135deg, ${instantInsight.color}08 0%, ${theme.palette.background.paper} 100%)`
              : `linear-gradient(135deg, ${instantInsight.color}10 0%, transparent 100%)`,
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
              zIndex: 1
            }}
          >
            <CloseIcon />
          </IconButton>

          <DialogContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="primary.main"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: 1.5
                }}
              >
                ⚡ Right Now
              </Typography>
            </Box>

            {/* Main Content */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: theme.palette.mode === 'light'
                    ? `${instantInsight.color}15`
                    : `${instantInsight.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <IconComponent 
                  sx={{ 
                    fontSize: 32, 
                    color: theme.palette.mode === 'light'
                      ? instantInsight.color
                      : instantInsight.color,
                    filter: theme.palette.mode === 'light' ? 'brightness(0.8)' : 'none'
                  }} 
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h5" 
                  fontWeight={700} 
                  sx={{ 
                    mb: 1, 
                    lineHeight: 1.3,
                    color: 'text.primary'
                  }}
                >
                  {instantInsight.title}
                </Typography>
                {instantInsight.metric && (
                  <Chip
                    label={instantInsight.metric}
                    size="small"
                    sx={{
                      bgcolor: theme.palette.mode === 'light'
                        ? `${instantInsight.color}15`
                        : `${instantInsight.color}20`,
                      color: theme.palette.mode === 'light'
                        ? instantInsight.color
                        : instantInsight.color,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      height: 26,
                      mb: 1.5,
                      filter: theme.palette.mode === 'light' ? 'brightness(0.8)' : 'none'
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Description */}
            <Typography
              variant="body1"
              color="text.primary"
              sx={{ mb: instantInsight.suggestion ? 3 : 0, lineHeight: 1.7 }}
            >
              {instantInsight.description}
            </Typography>

            {/* Suggestion */}
            {instantInsight.suggestion && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'light'
                    ? `${instantInsight.color}08`
                    : 'action.hover',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'light'
                    ? `${instantInsight.color}20`
                    : 'divider',
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start'
                }}
              >
                <TipsAndUpdatesIcon
                  sx={{
                    fontSize: 22,
                    color: theme.palette.mode === 'light'
                      ? instantInsight.color
                      : instantInsight.color,
                    flexShrink: 0,
                    mt: 0.2,
                    filter: theme.palette.mode === 'light' ? 'brightness(0.8)' : 'none'
                  }}
                />
                <Typography 
                  variant="body2" 
                  color="text.primary" 
                  sx={{ lineHeight: 1.6 }}
                >
                  {instantInsight.suggestion}
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Box>
      </Dialog>
    </>
  );
}
