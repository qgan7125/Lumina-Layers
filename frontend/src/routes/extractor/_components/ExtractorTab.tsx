import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DownloadIcon from '@mui/icons-material/Download'
import RotateRightIcon from '@mui/icons-material/RotateRight'
import styles from './ExtractorTab.module.scss'

type ColorMode = 'CMYW' | 'RYBW' | '6color' | '8color'

const ExtractorTab: React.FC = () => {
  const { t } = useTranslation()

  const [colorMode, setColorMode] = useState<ColorMode>('CMYW')
  const [autoWb, setAutoWb] = useState(true)
  const [vignetteCorrection, setVignetteCorrection] = useState(false)
  const [zoom, setZoom] = useState(1.0)
  const [distortion, setDistortion] = useState(0)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)

  return (
    <Box className={styles.root}>
      {/* Left: Controls */}
      <aside className={styles.sidebar}>
        <Stack spacing={0} divider={<Divider />} className={styles.form}>
          {/* Color Mode */}
          <Box className={styles.section}>
            <Typography variant="caption" className={styles.label}>
              {t('ext_color_mode')}
            </Typography>
            <Select
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value as ColorMode)}
              size="small"
              fullWidth
            >
              <MenuItem value="CMYW">CMYW (4色)</MenuItem>
              <MenuItem value="RYBW">RYBW (4色)</MenuItem>
              <MenuItem value="6color">6色</MenuItem>
              <MenuItem value="8color">8色</MenuItem>
            </Select>
          </Box>

          {/* Photo Upload */}
          <Box className={styles.section}>
            <Typography variant="caption" className={styles.label}>
              {t('ext_photo')}
            </Typography>
            <Box className={styles.uploadArea} component="label">
              <input type="file" accept="image/*" hidden />
              <CloudUploadIcon className={styles.uploadIcon} />
              <Typography variant="caption" color="text.secondary">
                {t('upload')}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RotateRightIcon />}
              fullWidth
              className={styles.actionBtn}
            >
              {t('ext_rotate_btn')}
            </Button>
          </Box>

          {/* Corrections */}
          <Box className={styles.section}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={autoWb}
                  onChange={(e) => setAutoWb(e.target.checked)}
                />
              }
              label={<Typography variant="caption">{t('ext_wb')}</Typography>}
            />
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={vignetteCorrection}
                  onChange={(e) => setVignetteCorrection(e.target.checked)}
                />
              }
              label={<Typography variant="caption">{t('ext_vignette')}</Typography>}
            />
          </Box>

          {/* Fine Tuning */}
          <Box className={styles.section}>
            <Typography variant="caption" className={styles.label}>
              {t('ext_zoom')}: {zoom.toFixed(2)}
            </Typography>
            <Slider
              value={zoom}
              onChange={(_, v) => setZoom(v as number)}
              min={0.5}
              max={2.0}
              step={0.01}
              size="small"
            />
            <Typography variant="caption" className={styles.label}>
              {t('ext_distortion')}: {distortion}
            </Typography>
            <Slider
              value={distortion}
              onChange={(_, v) => setDistortion(v as number)}
              min={-50}
              max={50}
              size="small"
            />
            <Typography variant="caption" className={styles.label}>
              {t('ext_offset_x')}: {offsetX}
            </Typography>
            <Slider
              value={offsetX}
              onChange={(_, v) => setOffsetX(v as number)}
              min={-20}
              max={20}
              size="small"
            />
            <Typography variant="caption" className={styles.label}>
              {t('ext_offset_y')}: {offsetY}
            </Typography>
            <Slider
              value={offsetY}
              onChange={(_, v) => setOffsetY(v as number)}
              min={-20}
              max={20}
              size="small"
            />
          </Box>

          {/* Extract */}
          <Box className={styles.section}>
            <Button variant="contained" fullWidth color="primary">
              {t('ext_extract_btn')}
            </Button>
          </Box>
        </Stack>
      </aside>

      {/* Right: Image + Results */}
      <Box className={styles.content}>
        {/* Image Canvas Area */}
        <Box className={styles.canvasRow}>
          <Paper variant="outlined" className={styles.canvasArea}>
            <Typography variant="caption" className={styles.areaLabel}>
              {t('ext_photo')}
            </Typography>
            <Box className={styles.canvasPlaceholder}>
              <Typography variant="caption" color="text.secondary">
                {t('ext_hint_white')}
              </Typography>
            </Box>
          </Paper>

          <Paper variant="outlined" className={styles.canvasArea}>
            <Typography variant="caption" className={styles.areaLabel}>
              {t('ext_marked')}
            </Typography>
            <Box className={styles.canvasPlaceholder}>
              <Typography variant="caption" color="text.secondary">
                {t('ext_sampling')}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Result Grid + Manual Fix */}
        <Paper variant="outlined" className={styles.resultArea}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" className={styles.areaLabel}>
              {t('ext_result')}
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadIcon />}
              disabled
            >
              {t('ext_download_npy')}
            </Button>
          </Stack>
          <Box className={styles.resultGrid}>
            <Typography variant="caption" color="text.secondary">
              {t('ext_click_cell')}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

export { ExtractorTab }
