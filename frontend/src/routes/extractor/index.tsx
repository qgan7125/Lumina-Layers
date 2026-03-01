import { createFileRoute } from '@tanstack/react-router'
import { ExtractorTab } from './_components/ExtractorTab'

export const Route = createFileRoute('/extractor/')({
  component: ExtractorTab,
})
