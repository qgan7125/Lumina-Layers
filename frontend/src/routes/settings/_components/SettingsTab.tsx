import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PrintIcon from '@mui/icons-material/Print'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import styles from './SettingsTab.module.scss'

const SettingsTab: React.FC = () => {
  const { t } = useTranslation()
  const [snackbar, setSnackbar] = useState<string | null>(null)

  const handleClearCache = () => setSnackbar(t('settings_cache_cleared'))
  const handleResetCounters = () => setSnackbar(t('settings_counters_reset'))

  return (
    <Box className={styles.root}>
      <Box className={styles.content}>
        {/* Usage Stats */}
        <Paper variant="outlined" className={styles.card}>
          <Typography variant="subtitle2" className={styles.cardTitle}>
            {t('settings_stats_title')}
          </Typography>
          <Divider className={styles.divider} />
          <Stack direction="row" flexWrap="wrap" gap={1} className={styles.statsRow}>
            <Chip
              size="small"
              variant="outlined"
              label={`${t('stats_calibrations')}: 0`}
            />
            <Chip
              size="small"
              variant="outlined"
              label={`${t('stats_extractions')}: 0`}
            />
            <Chip
              size="small"
              variant="outlined"
              label={`${t('stats_conversions')}: 0`}
            />
          </Stack>
          <Stack direction="row" spacing={1} className={styles.actions}>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleClearCache}
            >
              {t('settings_clear_cache')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={handleResetCounters}
            >
              {t('settings_reset_counters')}
            </Button>
          </Stack>
        </Paper>

        {/* Slicer */}
        <Paper variant="outlined" className={styles.card}>
          <Typography variant="subtitle2" className={styles.cardTitle}>
            {t('settings_slicer_title')}
          </Typography>
          <Divider className={styles.divider} />
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="body2" color="text.secondary" className={styles.noSlicer}>
              {t('settings_no_slicers')}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PrintIcon />}
              disabled
            >
              {t('settings_open_slicer_btn')}
            </Button>
          </Stack>
        </Paper>

        {/* About */}
        <Paper variant="outlined" className={styles.card}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <InfoOutlinedIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" className={styles.cardTitle}>
              {t('settings_about_title')}
            </Typography>
          </Stack>
          <Divider className={styles.divider} />
          <Stack spacing={0.5}>
            <Typography variant="body2">
              <strong>Lumina Studio</strong> v1.6.0
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('app_subtitle')}
            </Typography>
            <Divider className={styles.divider} />
            <Typography variant="caption" color="text.secondary">
              Physics-based multi-material FDM color printing tool.
              Converts images to printable 3MF models using calibrated LUT color profiles.
            </Typography>
          </Stack>
        </Paper>
      </Box>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={2500}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

export { SettingsTab }
