import React, { useState, useMemo, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/shared';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import CompletionProgress from '../components/CompletionProgress';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'durationAsc', label: 'Duration: Low to High' },
  { value: 'durationDesc', label: 'Duration: High to Low' }
];


export default function Home() {
  const { tasks, loading, error, fetchTasks, createTask, deleteTask, updateTask } = useTasks();
  // Handlers for task actions
  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    await deleteTask(taskId);
  };

  const handleComplete = async (taskId) => {
    const taskToUpdate = tasks.find(t => t._id === taskId);
    const wasCompleted = taskToUpdate.completed;
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
      default: // newest
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  }, [tasks, search, sortBy]);

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
      {/* Tasks Block */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1 }}>
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
