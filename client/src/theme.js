import { createTheme } from '@mui/material/styles';

const base = {
  typography: {
    fontFamily: 'Inter, Roboto, -apple-system, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 500 }
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': {
          height: '100%'
        },
        '*, *::before, *::after': {
          transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, padding: '8px 16px' },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 }
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 6 } } }
    }
  }
};

const palettes = {
  light: {
    mode: 'light',
    primary: { main: '#4b5563', light: '#6b7280', dark: '#374151', contrastText: '#ffffff' },
    secondary: { main: '#7c3aed', light: '#8b5cf6', dark: '#6d28d9', contrastText: '#ffffff' },
    background: { default: '#f9fafb', paper: '#ffffff' },
    text: { primary: '#111827', secondary: '#4b5563' }
  },
  dark: {
    mode: 'dark',
    primary: { main: '#9ca3af', light: '#d1d5db', dark: '#6b7280', contrastText: '#111827' },
    secondary: { main: '#7c3aed', light: '#8b5cf6', dark: '#6d28d9', contrastText: '#ffffff' },
    background: { default: '#121212', paper: '#1e1e1e' },
    text: { primary: '#ffffff', secondary: '#b0b0b0' }
  }
};

export function getTheme(mode = 'light') {
  const palette = palettes[mode] || palettes.light;
  return createTheme({
    palette,
    ...base,
    components: {
      ...base.components,
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              mode === 'dark'
                ? '0 4px 16px rgba(0,0,0,0.5)'
                : '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
            backgroundColor: palette.background.paper
          }
        }
      }
    }
  });
}

export const theme = getTheme('light');