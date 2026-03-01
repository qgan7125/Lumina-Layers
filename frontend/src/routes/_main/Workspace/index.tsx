import Stack from '@mui/material/Stack'
import { ConverterSidebar } from './components/ConverterSidebar'
import { ConverterWorkspace } from './components/ConverterWorkspace'
import type { FC } from 'react'
import styles from './index.module.scss'

const WorkSpace: FC = () => {
  return (
    <Stack direction="row" spacing={2} width="100%" height="100%">
      <aside className={styles.aside}>
        <ConverterSidebar />
      </aside>
      <section className={styles.section}>
        <ConverterWorkspace />
      </section>
    </Stack>
  )
}

export default WorkSpace
