import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';

export default function PageLayout({ children }) {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        pt: { xs: 2, sm: 3 },
        pb: { xs: 4, sm: 6 }
      }}
    >
      <Container maxWidth="lg">
        {children}
      </Container>
    </Box>
  );
}