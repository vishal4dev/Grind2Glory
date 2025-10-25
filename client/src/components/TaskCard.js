import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import FlagIcon from '@mui/icons-material/Flag';
import { alpha } from '@mui/material/styles';

const priorityConfig = {
  high: { color: '#ef4444', label: 'High', glow: '0 0 12px rgba(239, 68, 68, 0.3)' },
  medium: { color: '#f97316', label: 'Medium', glow: 'none' },
  low: { color: '#22c55e', label: 'Low', glow: 'none' },
  none: { color: 'transparent', label: '', glow: 'none' }
};

export default function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const { title, description, category, tags, durationHours, completed } = task;
  // Normalize priority value
  const priority = task.priority || 'none';
  const priorityStyle = priorityConfig[priority] || priorityConfig.none;

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
        }
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