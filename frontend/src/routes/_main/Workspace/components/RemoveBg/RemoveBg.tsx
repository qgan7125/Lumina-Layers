import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import styles from './RemoveBg.module.scss'

interface RemoveBgProps {
  enabled: boolean
  onEnabledChange: (v: boolean) => void
  tolerance: number
  onToleranceChange: (v: number) => void
}

const RemoveBg: React.FC<RemoveBgProps> = ({
  enabled,
  onEnabledChange,
  tolerance,
  onToleranceChange,
}) => {
  const { t } = useTranslation()

  return (
    <Box className={styles.root}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption">{t('conv_auto_bg')}</Typography>
        <Switch size="small" checked={enabled} onChange={(e) => onEnabledChange(e.target.checked)} />
      </Stack>
      {enabled && (
        <Box className={styles.sub}>
          <Typography variant="caption">
            {t('conv_tolerance')}: {tolerance}
          </Typography>
          <Slider
            value={tolerance}
            onChange={(_, v) => onToleranceChange(v as number)}
            min={0}
            max={150}
            size="small"
          />
        </Box>
      )}
    </Box>
  )
}

export default RemoveBg
