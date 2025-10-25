import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import SaveIcon from '@mui/icons-material/Save';
import { motion } from 'framer-motion';
import { useSettings } from '../hooks/useSettings';

export default function Settings() {
  const { settings, updateSettings, fetchSettings } = useSettings();
  const [form, setForm] = useState({
    dailyGoal: 8,
    weeklyGoal: 40,
    monthlyGoal: 160,
    dailyReward: 'Small break',
    weeklyReward: 'Movie night',
    monthlyReward: 'Weekend trip'
  });

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  React.useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings(form);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings. Please try again.');
    }
  };

  if (!settings) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading settings...</Typography>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{ p: 3 }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          background: theme =>
            `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              background: theme => 
                'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 251, 1) 100%)'
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>Goals</Typography>
              <Box component="form" noValidate sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Daily Goal (hours)"
                      type="number"
                      value={form.dailyGoal || ''}
                      onChange={e => setForm({...form, dailyGoal: parseFloat(e.target.value)})}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Weekly Goal (hours)"
                      type="number"
                      value={form.weeklyGoal || ''}
                      onChange={e => setForm({...form, weeklyGoal: parseFloat(e.target.value)})}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Monthly Goal (hours)"
                      type="number"
                      value={form.monthlyGoal || ''}
                      onChange={e => setForm({...form, monthlyGoal: parseFloat(e.target.value)})}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              background: theme => 
                'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 251, 1) 100%)'
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>Rewards</Typography>
              <Box component="form" noValidate sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Daily Reward"
                      value={form.dailyReward || ''}
                      onChange={e => setForm({...form, dailyReward: e.target.value})}
                      placeholder="e.g., Coffee break, Walk"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Weekly Reward"
                      value={form.weeklyReward || ''}
                      onChange={e => setForm({...form, weeklyReward: e.target.value})}
                      placeholder="e.g., Movie night, Game time"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Monthly Reward"
                      value={form.monthlyReward || ''}
                      onChange={e => setForm({...form, monthlyReward: e.target.value})}
                      placeholder="e.g., New game, Book"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<SaveIcon />}
          sx={{
            background: theme =>
              `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            px: 4
          }}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}
