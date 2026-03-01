import Stack from '@mui/material/Stack'
import { ConverterSidebar } from './components/ConverterSidebar'
import { ConverterWorkspace } from './components/ConverterWorkspace'
import { Group, Panel, Separator } from 'react-resizable-panels'
import type { FC } from 'react'

const WorkSpace: FC = () => {
  return (
    <Stack direction="row" spacing={2} width="100%" height="100%">
      <Group>
        <Panel minSize={320} defaultSize="25%" maxSize="50%">
          <ConverterSidebar />
        </Panel>
        <Separator />
        <Panel>
          <ConverterWorkspace />
        </Panel>
      </Group>
    </Stack>
  )
}

export default WorkSpace
