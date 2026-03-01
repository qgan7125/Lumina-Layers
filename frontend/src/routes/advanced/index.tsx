import { createFileRoute } from '@tanstack/react-router'
import { AdvancedTab } from './_components/AdvancedTab'

export const Route = createFileRoute('/advanced/')({
  component: AdvancedTab,
})
