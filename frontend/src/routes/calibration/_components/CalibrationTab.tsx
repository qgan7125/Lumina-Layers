import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import DownloadIcon from '@mui/icons-material/Download'
import GridOnIcon from '@mui/icons-material/GridOn'
import styles from './CalibrationTab.module.scss'

type ColorMode = 'CMYW' | 'RYBW' | '6color' | '8color'

const CalibrationTab: React.FC = () => {
  const { t } = useTranslation()

  const [colorMode, setColorMode] = useState<ColorMode>('CMYW')
  const [blockSize, setBlockSize] = useState(20)
  const [gap, setGap] = useState(1)
  const [backingColor, setBackingColor] = useState('white')

  return (
    <Box className={styles.root}>
      <aside className={styles.sidebar}>
        <Stack spacing={0} divider={<Divider />} className={styles.form}>
          {/* Color Mode */}
          <Box className={styles.section}>
            <Typography variant="caption" className={styles.label}>
              {t('cal_color_mode')}
            </Typography>
            <RadioGroup
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value as ColorMode)}
            >
              <FormControlLabel value="CMYW" control={<Radio size="small" />} label="CMYW (4色)" />
              <FormControlLabel value="RYBW" control={<Radio size="small" />} label="RYBW (4色)" />
              <FormControlLabel value="6color" control={<Radio size="small" />} label="6色" />
              <FormControlLabel value="8color" control={<Radio size="small" />} label="8色" />
            </RadioGroup>
          </Box>

          {/* Block Size */}
          <Box className={styles.section}>
            <Typography variant="caption" className={styles.label}>
              {t('cal_block_size')}: {blockSize}
            </Typography>
            <Slider
              value={blockSize}
              onChange={(_, v) => setBlockSize(v as number)}
              min={10}
              max={40}
              step={1}
              size="small"
            />
          </Box>

          {/* Gap */}
          <Box className={styles.section}>
            <Typography variant="caption" className={styles.label}>
              {t('cal_gap')}: {gap}
            </Typography>
            <Slider
              value={gap}
              onChange={(_, v) => setGap(v as number)}
              min={0}
              max={5}
              step={0.5}
              size="small"
            />
          </Box>

          {/* Backing Color */}
          <Box className={styles.section}>
            <Typography variant="caption" className={styles.label}>
              {t('cal_backing')}
            </Typography>
            <Select
              value={backingColor}
              onChange={(e) => setBackingColor(e.target.value)}
              size="small"
              fullWidth
            >
              <MenuItem value="white">White</MenuItem>
              <MenuItem value="black">Black</MenuItem>
            </Select>
          </Box>

          {/* Actions */}
          <Box className={styles.section}>
            <Stack spacing={1}>
              <Button variant="contained" fullWidth color="primary">
                {t('cal_generate_btn')}
              </Button>
              <Button variant="outlined" fullWidth startIcon={<DownloadIcon />} disabled>
                {t('cal_download')}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </aside>

      {/* Preview Area */}
      <section className={styles.preview}>
        <Box className={styles.previewArea}>
          <GridOnIcon className={styles.previewIcon} />
          <Typography variant="body2" color="text.secondary">
            {t('cal_preview')}
          </Typography>
        </Box>
      </section>
    </Box>
  )
}

export { CalibrationTab }
