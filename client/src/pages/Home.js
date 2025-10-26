import React, { useState, useMemo, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { usePomodoro } from '../context/PomodoroContext';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/shared';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import CompletionProgress from '../components/CompletionProgress';
import MotivationalQuote from '../components/MotivationalQuote';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'durationAsc', label: 'Duration: Low to High' },
  { value: 'durationDesc', label: 'Duration: High to Low' },
  { value: 'priorityHighToLow', label: 'Priority: High to Low' }
];

const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 };


export default function Home() {
  const { tasks, loading, error, fetchTasks, createTask, deleteTask, updateTask } = useTasks();
  const { activeTask, clearPomodoro } = usePomodoro();
  
  // Handlers for task actions
  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    // Clear pomodoro if deleting active task
    if (activeTask && activeTask._id === taskId) {
      clearPomodoro();
    }
    
    await deleteTask(taskId);
  };

  const handleComplete = async (taskId) => {
    const taskToUpdate = tasks.find(t => t._id === taskId);
    const wasCompleted = taskToUpdate.completed;
    
    // Clear pomodoro if completing active task
    if (!wasCompleted && activeTask && activeTask._id === taskId) {
      clearPomodoro();
    }
    
    await updateTask(taskId, {
      ...taskToUpdate,
      completed: !wasCompleted,
      completedAt: !wasCompleted ? new Date().toISOString() : null
    });
  };

  const handleUpdate = async (formData) => {
    await updateTask(editTask._id, formData);
    setEditTask(null);
  };

  const handleCreate = async (formData) => {
    await createTask(formData);
    setFormOpen(false);
  };
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, []);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.category.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => (task.priority || 'none') === priorityFilter);
    }
    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'durationAsc':
        result.sort((a, b) => a.durationHours - b.durationHours);
        break;
      case 'durationDesc':
        result.sort((a, b) => b.durationHours - a.durationHours);
        break;
      case 'priorityHighToLow':
        result.sort((a, b) => {
          const priorityA = priorityOrder[a.priority || 'none'];
          const priorityB = priorityOrder[b.priority || 'none'];
          return priorityB - priorityA;
        });
        break;
      default: // newest
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  }, [tasks, search, sortBy, priorityFilter]);

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          My Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
        >
          Add Task
        </Button>
      </Box>
      
      {/* Completion Progress Bar */}
      <CompletionProgress />
      
      {/* Motivational Quote Widget */}
      <MotivationalQuote />
      
      {/* Tasks Block */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1 }}>
        {/* Priority Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            onClick={() => setPriorityFilter('all')}
            color={priorityFilter === 'all' ? 'primary' : 'default'}
            variant={priorityFilter === 'all' ? 'filled' : 'outlined'}
          />
          <Chip
            label="High Priority"
            onClick={() => setPriorityFilter('high')}
            sx={{
              bgcolor: priorityFilter === 'high' ? '#9c27b0' : 'transparent',
              color: priorityFilter === 'high' ? 'white' : '#9c27b0',
              borderColor: '#9c27b0',
              '&:hover': { bgcolor: priorityFilter === 'high' ? '#7b1fa2' : 'rgba(156, 39, 176, 0.08)' }
            }}
            variant="outlined"
          />
          <Chip
            label="Medium Priority"
            onClick={() => setPriorityFilter('medium')}
            sx={{
              bgcolor: priorityFilter === 'medium' ? '#9c27b0' : 'transparent',
              color: priorityFilter === 'medium' ? 'white' : '#9c27b0',
              borderColor: '#9c27b0',
              '&:hover': { bgcolor: priorityFilter === 'medium' ? '#7b1fa2' : 'rgba(156, 39, 176, 0.08)' }
            }}
            variant="outlined"
          />
          <Chip
            label="Low Priority"
            onClick={() => setPriorityFilter('low')}
            sx={{
              bgcolor: priorityFilter === 'low' ? '#9c27b0' : 'transparent',
              color: priorityFilter === 'low' ? 'white' : '#9c27b0',
              borderColor: '#9c27b0',
              '&:hover': { bgcolor: priorityFilter === 'low' ? '#7b1fa2' : 'rgba(156, 39, 176, 0.08)' }
            }}
            variant="outlined"
          />
        </Box>
        
        {/* Search and Sort */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 220 }}
          />
          <TextField
            select
            variant="outlined"
            size="small"
            label="Sort By"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            {sortOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                <SortIcon fontSize="small" sx={{ mr: 1 }} />
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        
        {/* Task List */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : filteredTasks.length === 0 ? (
          <EmptyState message="No tasks found. Add your first task!" />
        ) : (
          <Grid container spacing={2}>
            {filteredTasks.map(task => (
              <Grid item xs={12} sm={6} md={4} key={task._id}>
                <TaskCard
                  task={task}
                  onEdit={() => setEditTask(task)}
                  onDelete={() => handleDelete(task._id)}
                  onComplete={handleComplete}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Task Form Dialog */}
      <TaskForm
        open={formOpen || !!editTask}
        onClose={() => {
          setFormOpen(false);
          setEditTask(null);
        }}
        onSubmit={task => {
          if (editTask) {
            handleUpdate(task);
          } else {
            handleCreate(task);
          }
        }}
        initialData={editTask}
      />
    </Box>
  );
}
