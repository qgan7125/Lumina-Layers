import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { client } from './api/generated/client.gen'
import { routeTree } from './routeTree.gen'
import './i18n/config'
import './styles/global.scss'
import { AppThemeProvider } from './routes/_main/layout/AppThemeProvider'
import { NotificationsProvider } from './components/Notification'

client.setConfig({ baseURL: '' })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5_000 },
  },
})

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <NotificationsProvider>
          <RouterProvider router={router} />
        </NotificationsProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
