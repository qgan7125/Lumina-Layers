import { ConverterSidebar } from './components/ConverterSidebar'
import { ConverterWorkspace } from './components/ConverterWorkspace'
import { Group, Panel, Separator } from 'react-resizable-panels'
import type { FC } from 'react'
import styles from './index.module.scss'

const WorkSpace: FC = () => {
  return (
    <Group>
      <Panel minSize={320} defaultSize="25%" maxSize="50%">
        <ConverterSidebar />
      </Panel>
      <Separator className={styles.sperator} />
      <Panel>
        <ConverterWorkspace />
      </Panel>
    </Group>
  )
}

export default WorkSpace
