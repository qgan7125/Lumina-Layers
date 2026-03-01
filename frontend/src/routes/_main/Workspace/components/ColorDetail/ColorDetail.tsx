import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useConverterStore } from '../../../../../stores/converterStore'
import { useColorDetail } from './hooks/useColorDetail'
import styles from './ColorDetail.module.scss'

interface ColorDetailProps {
  value: number
  onChange: (v: number) => void
}

const ColorDetail: React.FC<ColorDetailProps> = ({ value, onChange }) => {
  const { t } = useTranslation()
  const { autoDetect } = useColorDetail()
  const sessionId = useConverterStore((s) => s.sessionId)

  const handleAutoDetect = () => {
    if (!sessionId) return
    autoDetect.mutate(sessionId, {
      onSuccess: (data) => onChange((data.suggested_colors as number) ?? value),
    })
  }

  return (
    <Box className={styles.root}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" className={styles.label}>
          {t('conv_quantize_colors')}: {value}
        </Typography>
        <Button
          size="small"
          variant="text"
          onClick={handleAutoDetect}
          disabled={!sessionId || autoDetect.isPending}
        >
          {autoDetect.isPending ? <CircularProgress size={12} /> : t('conv_auto_color_btn')}
        </Button>
      </Stack>
      <Slider
        value={value}
        onChange={(_, v) => onChange(v as number)}
        min={2}
        max={16}
        step={1}
        size="small"
        marks
      />
    </Box>
  )
}

export default ColorDetail
