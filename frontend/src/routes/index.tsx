import { createFileRoute } from '@tanstack/react-router'
import WorkSpace from './_main/Workspace'

export const Route = createFileRoute('/')({
  component: () => <WorkSpace />,
})
