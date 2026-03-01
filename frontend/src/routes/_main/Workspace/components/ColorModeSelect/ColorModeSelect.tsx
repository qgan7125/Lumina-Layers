import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Typography from '@mui/material/Typography'
import styles from './ColorModeSelect.module.scss'

type ColorMode = 'CMYW' | 'RYBW'

interface ColorModeSelectProps {
  value: ColorMode
  onChange: (v: ColorMode) => void
}

const ColorModeSelect: React.FC<ColorModeSelectProps> = ({ value, onChange }) => {
  const { t } = useTranslation()

  return (
    <Box className={styles.root}>
      <Typography variant="caption" className={styles.label}>
        {t('conv_color_mode')}
      </Typography>
      <RadioGroup row value={value} onChange={(e) => onChange(e.target.value as ColorMode)}>
        <FormControlLabel value="CMYW" control={<Radio size="small" />} label="CMYW" />
        <FormControlLabel value="RYBW" control={<Radio size="small" />} label="RYBW" />
      </RadioGroup>
    </Box>
  )
}

export default ColorModeSelect
