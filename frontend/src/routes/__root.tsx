import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AppHeader } from './_main/layout/AppHeader'
import Stack from '@mui/material/Stack'

export const Route = createRootRoute({
  component: () => (
    <Stack direction="column" height="100vh">
      <AppHeader />
      <Stack component="main" flex={1}>
        <Outlet />
      </Stack>
    </Stack>
  ),
})
