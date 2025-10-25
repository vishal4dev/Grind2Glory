import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const navItems = [
  { text: 'Home', path: '/', icon: HomeIcon },
  { text: 'Rewards', path: '/rewards', icon: EmojiEventsIcon },
  { text: 'Settings', path: '/settings', icon: SettingsIcon }
];

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <List>
        {navItems.map(({ text, path, icon: Icon }) => (
          <ListItem 
            key={text} 
            component={RouterLink} 
            to={path}
            selected={location.pathname === path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(124, 58, 237, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(124, 58, 237, 0.12)'
                }
              }
            }}
          >
            <ListItemIcon>
              <Icon color={location.pathname === path ? 'secondary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary={text}
              primaryTypographyProps={{
                color: location.pathname === path ? 'secondary' : 'inherit'
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        color="inherit" 
        elevation={0} 
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: 'background.paper' 
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography 
              variant="h6" 
              component={RouterLink} 
              to="/"
              sx={{ 
                color: 'text.primary',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <EmojiEventsIcon color="secondary" />
              Grind2Glory
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map(({ text, path }) => (
                <Button
                  key={text}
                  component={RouterLink}
                  to={path}
                  color={location.pathname === path ? 'secondary' : 'inherit'}
                  sx={{
                    position: 'relative',
                    '&::after': location.pathname === path ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '100%',
                      height: 2,
                      backgroundColor: 'secondary.main',
                      borderRadius: 1
                    } : undefined
                  }}
                >
                  {text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
