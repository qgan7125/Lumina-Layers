import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Typography from '@mui/material/Typography'
import styles from './ModelingModeSelect.module.scss'

type ModelingMode = 'hifi' | 'pixel' | 'vector'

interface ModelingModeSelectProps {
  value: ModelingMode
  onChange: (v: ModelingMode) => void
}

const ModelingModeSelect: React.FC<ModelingModeSelectProps> = ({ value, onChange }) => {
  const { t } = useTranslation()

  return (
    <Box className={styles.root}>
      <Typography variant="caption" className={styles.label}>
        {t('conv_modeling_mode')}
      </Typography>
      <RadioGroup value={value} onChange={(e) => onChange(e.target.value as ModelingMode)}>
        <FormControlLabel
          value="hifi"
          control={<Radio size="small" />}
          label={t('conv_modeling_mode_hifi')}
        />
        <FormControlLabel
          value="pixel"
          control={<Radio size="small" />}
          label={t('conv_modeling_mode_pixel')}
        />
        <FormControlLabel
          value="vector"
          control={<Radio size="small" />}
          label={t('conv_modeling_mode_vector')}
        />
      </RadioGroup>
    </Box>
  )
}

export default ModelingModeSelect
