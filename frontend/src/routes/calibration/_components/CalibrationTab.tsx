import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import DownloadIcon from '@mui/icons-material/Download'
import GridOnIcon from '@mui/icons-material/GridOn'
import { useNotify } from '../../../components/Notification'
import { useCalibration } from '../../../hooks/useCalibration'
import { useCalibrationJobStatus } from '../../../hooks/useCalibrationJobStatus'
import styles from './CalibrationTab.module.scss'

type ColorMode = 'CMYW' | 'RYBW' | '6color' | '8color'

const MODE_MAP: Record<ColorMode, string> = {
  CMYW: 'CMYW',
  RYBW: 'RYBW',
  '6color': '6-Color',
  '8color': '8-Color',
}

const CalibrationTab: React.FC = () => {
  const { t } = useTranslation()
  const notify = useNotify()

  const [colorMode, setColorMode] = useState<ColorMode>('CMYW')
  const [blockSize, setBlockSize] = useState(20)
  const [gap, setGap] = useState(1)
  const [backingColor, setBackingColor] = useState('white')
  const [jobId, setJobId] = useState<string | null>(null)

  const calibrate = useCalibration()
  const jobStatus = useCalibrationJobStatus(jobId)

  const isRunning =
    !!jobId &&
    (jobStatus.data?.status === 'pending' || jobStatus.data?.status === 'running')
  const isDone = jobStatus.data?.status === 'done'
  const downloadUrl = isDone
    ? (jobStatus.data?.result?.['file_url'] as string | undefined)
    : undefined

  const handleGenerate = async () => {
    try {
      const res = await calibrate.mutateAsync({
        mode: MODE_MAP[colorMode],
        block_size_mm: blockSize,
        gap_mm: gap,
        backing_color: backingColor,
      })
      setJobId(res.job_id)
    } catch {
      notify(t('cal_generate_error'), { severity: 'error' })
    }
  }

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
              <Button
                variant="contained"
                fullWidth
                color="primary"
                onClick={handleGenerate}
                disabled={calibrate.isPending || isRunning}
              >
                {calibrate.isPending || isRunning ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  t('cal_generate_btn')
                )}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<DownloadIcon />}
                disabled={!downloadUrl}
                component={downloadUrl ? 'a' : 'button'}
                href={downloadUrl}
                download
              >
                {t('cal_download')}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </aside>

      {/* Preview Area */}
      <section className={styles.preview}>
        <Box className={styles.previewArea}>
          {isRunning ? (
            <Stack spacing={2} alignItems="center" width="100%">
              <CircularProgress />
              <LinearProgress sx={{ width: '60%' }} />
              <Typography variant="caption" color="text.secondary">
                {t('cal_generating')}
              </Typography>
            </Stack>
          ) : isDone && downloadUrl ? (
            <Stack spacing={1} alignItems="center">
              <GridOnIcon className={styles.previewIcon} color="success" />
              <Typography variant="body2" color="text.secondary">
                {t('cal_done')}
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                component="a"
                href={downloadUrl}
                download
              >
                {t('cal_download')}
              </Button>
            </Stack>
          ) : (
            <>
              <GridOnIcon className={styles.previewIcon} />
              <Typography variant="body2" color="text.secondary">
                {t('cal_preview')}
              </Typography>
            </>
          )}
          {jobStatus.data?.error && (
            <Typography variant="caption" color="error" mt={1}>
              {jobStatus.data.error}
            </Typography>
          )}
        </Box>
      </section>
    </Box>
  )
}

export { CalibrationTab }
