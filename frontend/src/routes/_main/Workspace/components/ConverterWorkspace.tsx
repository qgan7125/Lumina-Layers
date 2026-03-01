import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import DownloadIcon from '@mui/icons-material/Download'
import ImageIcon from '@mui/icons-material/Image'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import { useConverterStore } from '../../../../stores/converterStore'
import { useApplyReplacement } from '../../../../hooks/useApplyReplacement'
import { useConverterJobStatus } from '../../../../hooks/useConverterJobStatus'
import { useHighlightColor } from '../../../../hooks/useHighlightColor'
import styles from './ConverterWorkspace.module.scss'

const ConverterWorkspace: React.FC = () => {
  const { t } = useTranslation()
  const store = useConverterStore()
  const [activeView, setActiveView] = useState<'2d' | '3d'>('2d')
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)

  const previewJob = useConverterJobStatus(store.previewJobId)
  const generate3mfJob = useConverterJobStatus(store.generate3mfJobId)
  const applyReplacement = useApplyReplacement()
  const highlightColor = useHighlightColor()

  const previewResult = previewJob.data?.status === 'done' ? previewJob.data.result : null
  const previewUrl = (displayUrl ?? (previewResult?.['preview_url'] as string | undefined)) || null
  const colorPalette = (previewResult?.['color_palette'] as Array<{ hex: string }> | undefined) ?? []

  const generate3mfResult =
    generate3mfJob.data?.status === 'done' ? generate3mfJob.data.result : null
  const downloadUrl = generate3mfResult?.['file_url'] as string | undefined

  const isPreviewLoading =
    !!store.previewJobId &&
    (previewJob.data?.status === 'pending' || previewJob.data?.status === 'running')

  const is3mfLoading =
    !!store.generate3mfJobId &&
    (generate3mfJob.data?.status === 'pending' || generate3mfJob.data?.status === 'running')

  const handleSwatchClick = (hex: string) => {
    if (!store.sessionId || !previewJob.data?.result) return
    highlightColor.mutate(
      { session_id: store.sessionId, highlight_color: hex },
      { onSuccess: (data) => setDisplayUrl(data.preview_url) },
    )
  }

  const handleSwatchReplace = (fromHex: string, toHex: string) => {
    if (!store.sessionId) return
    const next = { ...store.replacementMap, [fromHex]: toHex }
    store.addReplacement(fromHex, toHex)
    applyReplacement.mutate(
      { session_id: store.sessionId, color_replacements: next },
      {
        onSuccess: (data) => {
          setDisplayUrl(data.preview_url)
        },
      },
    )
  }

  return (
    <Box className={styles.root}>
      <Tabs
        value={activeView}
        onChange={(_, v) => setActiveView(v)}
        className={styles.tabs}
        textColor="inherit"
      >
        <Tab value="2d" label={t('conv_tab_2d')} icon={<ImageIcon fontSize="small" />} iconPosition="start" />
        <Tab value="3d" label={t('conv_tab_3d')} icon={<ViewInArIcon fontSize="small" />} iconPosition="start" />
      </Tabs>

      {activeView === '2d' && (
        <Box className={styles.view2d}>
          {/* Preview image */}
          <Box className={styles.previewFrame}>
            {isPreviewLoading ? (
              <Box className={styles.placeholder}>
                <CircularProgress />
                <Typography variant="caption" color="text.secondary">
                  {t('conv_generating_preview')}
                </Typography>
              </Box>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="preview"
                className={styles.previewImg}
                onClick={() => setDisplayUrl(null)}
              />
            ) : (
              <Box className={styles.placeholder}>
                <ImageIcon className={styles.placeholderIcon} />
                <Typography variant="caption" color="text.secondary">
                  {t('conv_preview_hint')}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Color palette */}
          {colorPalette.length > 0 && (
            <Box className={styles.palette}>
              {colorPalette.map((entry) => (
                <Tooltip key={entry.hex} title={entry.hex}>
                  <Box
                    className={styles.swatch}
                    sx={{ backgroundColor: entry.hex }}
                    onClick={() => handleSwatchClick(entry.hex)}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      const replacement = prompt(`Replace ${entry.hex} with:`, entry.hex)
                      if (replacement && replacement !== entry.hex) {
                        handleSwatchReplace(entry.hex, replacement)
                      }
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          )}

          {/* Replacement indicator */}
          {Object.keys(store.replacementMap).length > 0 && (
            <Typography variant="caption" color="text.secondary" className={styles.replacementHint}>
              {Object.keys(store.replacementMap).length} {t('conv_replacements_active')}
            </Typography>
          )}
        </Box>
      )}

      {activeView === '3d' && (
        <Box className={styles.view3d}>
          <Box className={styles.placeholder}>
            <ViewInArIcon className={styles.placeholderIcon} />
            <Typography variant="caption" color="text.secondary">
              {t('conv_3d_hint')}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Generate 3MF status + download */}
      <Stack direction="row" spacing={1} className={styles.actions} alignItems="center">
        {is3mfLoading && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              {t('conv_generating_3mf')}
            </Typography>
          </Stack>
        )}
        {downloadUrl && (
          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon />}
            component="a"
            href={downloadUrl}
            download
          >
            {t('conv_download_3mf')}
          </Button>
        )}
        {generate3mfJob.data?.error && (
          <Typography variant="caption" color="error">
            {generate3mfJob.data.error}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}

export { ConverterWorkspace }
