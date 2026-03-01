import { useEffect, useMemo } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useAppStore } from '../../../stores/appStore'

interface Props {
  children: React.ReactNode
}

const AppThemeProvider = ({ children }: Props) => {
  const isDark = useAppStore((s) => s.isDark)

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, [isDark])

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? 'dark' : 'light',
          primary: { main: '#7c4dff' },
          secondary: { main: '#00bcd4' },
          background: {
            default: isDark ? '#121212' : '#f5f5f5',
            paper: isDark ? '#1e1e1e' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Noto Sans SC", sans-serif',
          fontSize: 14,
        },
        shape: { borderRadius: 8 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { textTransform: 'none' },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: { textTransform: 'none', minHeight: 48 },
            },
          },
        },
      }),
    [isDark],
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

export { AppThemeProvider }
