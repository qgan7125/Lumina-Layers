import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Typography from '@mui/material/Typography'
import styles from './StructureSelect.module.scss'

type Structure = 'double' | 'single'

interface StructureSelectProps {
  value: Structure
  onChange: (v: Structure) => void
}

const StructureSelect: React.FC<StructureSelectProps> = ({ value, onChange }) => {
  const { t } = useTranslation()

  return (
    <Box className={styles.root}>
      <Typography variant="caption" className={styles.label}>
        {t('conv_structure')}
      </Typography>
      <RadioGroup row value={value} onChange={(e) => onChange(e.target.value as Structure)}>
        <FormControlLabel
          value="double"
          control={<Radio size="small" />}
          label={t('conv_structure_double')}
        />
        <FormControlLabel
          value="single"
          control={<Radio size="small" />}
          label={t('conv_structure_single')}
        />
      </RadioGroup>
    </Box>
  )
}

export default StructureSelect
