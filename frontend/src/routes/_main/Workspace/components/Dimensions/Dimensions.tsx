import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import styles from './Dimensions.module.scss'

interface DimensionsProps {
  width: number
  onWidthChange: (v: number) => void
  height: number
  onHeightChange: (v: number) => void
  thickness: number
  onThicknessChange: (v: number) => void
}

const Dimensions: React.FC<DimensionsProps> = ({
  width,
  onWidthChange,
  height,
  onHeightChange,
  thickness,
  onThicknessChange,
}) => {
  const { t } = useTranslation()

  return (
    <Box className={styles.root}>
      <Typography variant="caption" className={styles.label}>
        {t('conv_width')}: {width}
      </Typography>
      <Slider
        value={width}
        onChange={(_, v) => onWidthChange(v as number)}
        min={20}
        max={200}
        size="small"
      />
      <Typography variant="caption" className={styles.label}>
        {t('conv_height')}: {height}
      </Typography>
      <Slider
        value={height}
        onChange={(_, v) => onHeightChange(v as number)}
        min={20}
        max={200}
        size="small"
      />
      <Typography variant="caption" className={styles.label}>
        {t('conv_thickness')}: {thickness}
      </Typography>
      <Slider
        value={thickness}
        onChange={(_, v) => onThicknessChange(v as number)}
        min={1}
        max={5}
        step={0.2}
        size="small"
      />
    </Box>
  )
}

export default Dimensions
