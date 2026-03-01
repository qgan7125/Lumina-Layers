import { useTranslation } from 'react-i18next'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import styles from './KeychainLoop.module.scss'

interface KeychainLoopProps {
  enabled: boolean
  onEnabledChange: (v: boolean) => void
  width: number
  onWidthChange: (v: number) => void
  length: number
  onLengthChange: (v: number) => void
  hole: number
  onHoleChange: (v: number) => void
}

const KeychainLoop: React.FC<KeychainLoopProps> = ({
  enabled,
  onEnabledChange,
  width,
  onWidthChange,
  length,
  onLengthChange,
  hole,
  onHoleChange,
}) => {
  const { t } = useTranslation()

  return (
    <Accordion disableGutters elevation={0} className={styles.root}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.summary}>
        <Typography variant="caption">{t('conv_loop_section')}</Typography>
      </AccordionSummary>
      <AccordionDetails className={styles.details}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption">{t('conv_loop_enable')}</Typography>
          <Switch
            size="small"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
          />
        </Stack>
        {enabled && (
          <Box className={styles.sub}>
            <Typography variant="caption">
              {t('conv_loop_width')}: {width}
            </Typography>
            <Slider
              value={width}
              onChange={(_, v) => onWidthChange(v as number)}
              min={4}
              max={20}
              step={0.5}
              size="small"
            />
            <Typography variant="caption">
              {t('conv_loop_length')}: {length}
            </Typography>
            <Slider
              value={length}
              onChange={(_, v) => onLengthChange(v as number)}
              min={6}
              max={30}
              step={0.5}
              size="small"
            />
            <Typography variant="caption">
              {t('conv_loop_hole')}: {hole}
            </Typography>
            <Slider
              value={hole}
              onChange={(_, v) => onHoleChange(v as number)}
              min={1}
              max={8}
              step={0.5}
              size="small"
            />
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default KeychainLoop
