import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import FlagIcon from '@mui/icons-material/Flag';
import { alpha } from '@mui/material/styles';
import { usePomodoro } from '../context/PomodoroContext';
import { getPomodoroPreview } from '../utils/pomodoroCalculator';

const priorityConfig = {
  high: { color: '#ef4444', label: 'High', glow: '0 0 12px rgba(239, 68, 68, 0.3)' },
  medium: { color: '#f97316', label: 'Medium', glow: 'none' },
  low: { color: '#22c55e', label: 'Low', glow: 'none' },
  none: { color: 'transparent', label: '', glow: 'none' }
};

export default function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const navigate = useNavigate();
  const { title, description, category, tags, durationHours, completed } = task;
  const { activeTask, startPomodoro } = usePomodoro();
  const [showWarning, setShowWarning] = useState(false);
  
  // Normalize priority value
  const priority = task.priority || 'none';
  const priorityStyle = priorityConfig[priority] || priorityConfig.none;
  
  const pomodoroPreview = getPomodoroPreview(durationHours);
  
  const handleStartFocus = () => {
    // Check if another task is already active
    if (activeTask && activeTask._id !== task._id) {
      setShowWarning(true);
      return;
    }
    
    // Start pomodoro and navigate
    startPomodoro(task);
    navigate('/current-task');
  };
  
  const handleForceStart = () => {
    setShowWarning(false);
    startPomodoro(task);
    navigate('/current-task');
  };

  const isActiveTask = activeTask && activeTask._id === task._id;

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        borderLeft: priority !== 'none' ? `4px solid ${priorityStyle.color}` : 'none',
        boxShadow: theme => priority === 'high' 
          ? `${priorityStyle.glow}, 0 4px 6px -1px rgba(0,0,0,0.1)`
          : '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme => priority === 'high'
            ? `${priorityStyle.glow}, 0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
            : `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
        },
        // Comet border animation for active task
        ...(isActiveTask && {
          border: '2px solid transparent',
          background: theme => `
            linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}) padding-box,
            linear-gradient(90deg, 
              transparent 0%, 
              transparent 40%, 
              ${theme.palette.secondary.main} 50%, 
              transparent 60%, 
              transparent 100%
            ) border-box
          `,
          backgroundSize: '200% 100%',
          animation: 'comet 3s linear infinite',
          '@keyframes comet': {
            '0%': { backgroundPosition: '200% 0' },
            '100%': { backgroundPosition: '-200% 0' }
          }
        })
      }}
    >
      <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
        {/* Main block content */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography 
            variant="h6" 
            component="h2"
            sx={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              hyphens: 'auto'
            }}
          >
            {title}
          </Typography>
        </Box>
        {description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              hyphens: 'auto'
            }}
          >
            {description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          {priority !== 'none' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FlagIcon fontSize="small" sx={{ color: priorityStyle.color }} />
              <Typography variant="body2" sx={{ color: priorityStyle.color, fontWeight: 600 }}>
                {priorityStyle.label}
              </Typography>
            </Box>
          )}
          {category && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CategoryIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {category}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {durationHours}h
            </Typography>
          </Box>
        </Box>
        {tags && tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {tags.map(tag => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small"
                sx={{ 
                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
                  '&:hover': {
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.12)
                  }
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>
      {!completed && pomodoroPreview && (
        <Box sx={{ px: 2, pb: 1 }}>
          {activeTask && activeTask._id === task._id ? (
            // Show running indicator for active task
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                py: 1.5,
                px: 2,
                bgcolor: theme => alpha(theme.palette.secondary.main, 0.1),
                borderRadius: 1,
                border: '2px solid',
                borderColor: 'secondary.main'
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'secondary.main',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.5, transform: 'scale(1.2)' }
                  }
                }}
              />
              <Typography
                variant="body2"
                color="secondary"
                fontWeight={600}
              >
                Session Running
              </Typography>
            </Box>
          ) : (
            // Show start button for inactive tasks
            <>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartFocus}
                sx={{
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                Start Focus Session
              </Button>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  mt: 0.5,
                  color: 'text.secondary'
                }}
              >
                {pomodoroPreview}
              </Typography>
            </>
          )}
        </Box>
      )}
      
      <CardActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pt: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton aria-label="Edit" color="secondary" onClick={() => onEdit(task)}>
            <EditIcon />
          </IconButton>
          <IconButton aria-label="Delete" color="error" onClick={() => onDelete(task._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
        <Box>
          <Tooltip title="Mark as complete" arrow>
            <IconButton
              aria-label={completed ? 'Completed' : 'Mark complete'}
              onClick={() => onComplete(task._id)}
              sx={{
                width: 40,
                height: 40,
                bgcolor: completed ? 'success.main' : 'transparent',
                color: completed ? 'common.white' : 'success.main',
                border: completed ? 'none' : theme => `2px solid ${theme.palette.success.main}`,
                '&:hover': {
                  bgcolor: completed ? 'success.dark' : theme => `${theme.palette.success.main}10`,
                },
                borderRadius: '50%'
              }}
            >
              <CheckIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
      
      {/* Warning Dialog */}
      <Dialog open={showWarning} onClose={() => setShowWarning(false)}>
        <DialogTitle>Active Task Running</DialogTitle>
        <DialogContent>
          <Typography>
            You already have an active focus session for "{activeTask?.title}". 
            Starting a new session will stop the current one.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarning(false)}>Cancel</Button>
          <Button onClick={handleForceStart} color="secondary" variant="contained">
            Start New Session
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}