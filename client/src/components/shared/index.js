import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function LoadingSpinner() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" py={4}>
      <CircularProgress />
    </Box>
  );
}

export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <Alert severity="error" sx={{ my: 2 }}>
      {message}
    </Alert>
  );
}

export function EmptyState({ message = 'No items found', icon: Icon }) {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      py={4}
      sx={{ color: 'text.secondary' }}
    >
      {Icon && <Icon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />}
      <Typography>{message}</Typography>
    </Box>
  );
}

export function PageHeader({ title, action }) {
  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      mb={3}
    >
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      {action}
    </Box>
  );
}