import { createFileRoute } from '@tanstack/react-router'
import { LutMergeTab } from './_components/LutMergeTab'

export const Route = createFileRoute('/merge/')({
  component: LutMergeTab,
})
