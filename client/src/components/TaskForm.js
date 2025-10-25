import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

export default function TaskForm({ open, onClose, onSubmit, initialData = null }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    tags: [],
    durationHours: 1,
    completed: false,
    completedAt: null,
    ...initialData
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ title: '', description: '', category: '', tags: [], durationHours: 1 });
  };

  const handleTagDelete = (tagToDelete) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) {
        setForm(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? 'Edit Task' : 'New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              fullWidth
            />
            
            <TextField
              label="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />

            <TextField
              label="Category"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              fullWidth
            />

            <Box>
              <TextField
                label="Add Tags"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={handleTagAdd}
                helperText="Press Enter to add tags"
                fullWidth
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {form.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleTagDelete(tag)}
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            <TextField
              label="Duration (hours)"
              type="number"
              value={form.durationHours}
              onChange={e => setForm({ ...form, durationHours: parseFloat(e.target.value) })}
              inputProps={{ min: 0, step: 0.25 }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}