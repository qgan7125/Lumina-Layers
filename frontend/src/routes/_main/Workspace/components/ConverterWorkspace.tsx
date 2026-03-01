import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import DownloadIcon from '@mui/icons-material/Download'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import styles from './ConverterWorkspace.module.scss'

const ConverterWorkspace: React.FC = () => {
  const { t } = useTranslation()
  const [activeView, setActiveView] = useState(0)

  return (
    <Box className={styles.root}>
      <Tabs value={activeView} onChange={(_, v) => setActiveView(v)} className={styles.viewTabs}>
        <Tab label="2D Preview" />
        <Tab
          label={
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ViewInArIcon fontSize="inherit" />
              <span>3D Preview</span>
            </Stack>
          }
        />
      </Tabs>

      {activeView === 0 && (
        <Box className={styles.previewLayout}>
          {/* 2D image area */}
          <Box className={styles.imageArea}>
            <Typography variant="body2" color="text.secondary" className={styles.placeholder}>
              {t('conv_preview_btn')}
            </Typography>
          </Box>

          {/* Palette + LUT */}
          <Box className={styles.paletteArea}>
            <Paper variant="outlined" className={styles.palettePanel}>
              <Typography variant="caption" className={styles.panelLabel}>
                {t('conv_palette_step1')}
              </Typography>
              <Box className={styles.colorGrid}>
                <Typography variant="caption" color="text.secondary">
                  {t('palette_empty')}
                </Typography>
              </Box>
            </Paper>

            <Paper variant="outlined" className={styles.palettePanel}>
              <Typography variant="caption" className={styles.panelLabel}>
                {t('conv_palette_step2')}
              </Typography>
              <Box className={styles.colorGrid}>
                <Typography variant="caption" color="text.secondary">
                  {t('lut_grid_load_hint')}
                </Typography>
              </Box>
            </Paper>

            <Divider />

            <Box className={styles.replacementSection}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button size="small" variant="contained" color="success" disabled>
                  {t('conv_palette_apply_btn')}
                </Button>
                <Button size="small" variant="outlined" disabled>
                  {t('conv_palette_undo_btn')}
                </Button>
                <Button size="small" variant="outlined" color="error" disabled>
                  {t('conv_palette_clear_btn')}
                </Button>
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                className={styles.replacementHint}
              >
                {t('conv_palette_replacements_placeholder')}
              </Typography>
            </Box>

            <Box className={styles.activeReplacements}>
              <Chip size="small" label={t('conv_palette_replacements_label')} variant="outlined" />
            </Box>
          </Box>
        </Box>
      )}

      {activeView === 1 && (
        <Box className={styles.viewerLayout}>
          <Box className={styles.viewer3d}>
            <ViewInArIcon className={styles.viewer3dIcon} />
            <Typography variant="body2" color="text.secondary">
              3D Preview
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            className={styles.viewerActions}
          >
            <Button variant="contained" startIcon={<DownloadIcon />}>
              {t('conv_download_file')}
            </Button>
            <Button variant="outlined">{t('settings_open_slicer_btn')}</Button>
          </Stack>
        </Box>
      )}
    </Box>
  )
}

export { ConverterWorkspace }
