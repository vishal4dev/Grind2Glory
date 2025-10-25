import React, { useEffect, useRef, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import { alpha } from '@mui/material/styles';

export default function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const { title, description, category, tags, durationHours, completed, _id } = task;
  // Timer state (in seconds)
  const initialSeconds = Math.round((durationHours || 0) * 3600);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef();

  // Start timer on mount if not completed
  useEffect(() => {
    if (!completed && timerActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, completed]);

  // Auto-complete when timer hits 0
  useEffect(() => {
    if (!completed && secondsLeft === 0 && timerActive) {
      setTimerActive(false);
      onComplete(_id);
    }
  }, [secondsLeft, completed, timerActive, onComplete, _id]);

  // Reset timer if durationHours changes (e.g., on edit)
  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  // Format timer display
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
        {/* Timer at top right */}
        {!completed && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'transparent',
              borderRadius: 1,
              px: 1.5,
              py: 1,
              minWidth: 110,
              zIndex: 2,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Timer
            </Typography>
            <Typography variant="body2" color="text.primary" fontWeight={600}>
              {formatTime(secondsLeft)}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color={timerActive ? 'warning' : 'primary'}
              onClick={() => setTimerActive((prev) => !prev)}
              sx={{ minWidth: 0, px: 1, py: 0, fontSize: 12 }}
            >
              {timerActive ? 'Pause' : 'Start'}
            </Button>
          </Box>
        )}
        {/* Main block content */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="h6" gutterBottom component="h2">
            {title}
          </Typography>
        </Box>
        {description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
    </Card>
  );
}