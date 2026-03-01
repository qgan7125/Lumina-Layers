import { createFileRoute } from '@tanstack/react-router'
import { SettingsTab } from './_components/SettingsTab'

export const Route = createFileRoute('/settings/')({
  component: SettingsTab,
})
