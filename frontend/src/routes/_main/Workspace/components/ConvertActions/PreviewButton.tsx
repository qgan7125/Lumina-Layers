import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { useConvertActions } from './hooks/useConvertActions'
import styles from './ConvertActions.module.scss'

interface PreviewButtonProps {
  lut: string
  colorMode: string
  modelingMode: string
  quantizeColors: number
  removeBg: boolean
  bgTolerance: number
  width: number
}

const PreviewButton: React.FC<PreviewButtonProps> = ({
  lut,
  colorMode,
  modelingMode,
  quantizeColors,
  removeBg,
  bgTolerance,
  width,
}) => {
  const { t } = useTranslation()
  const { generatePreview, sessionId, clearReplacements } = useConvertActions()

  const handlePreview = () => {
    if (!sessionId || !lut) return
    clearReplacements()
    generatePreview.mutate({
      session_id: sessionId,
      lut_name: lut,
      target_width_mm: width,
      color_mode: colorMode,
      modeling_mode: modelingMode,
      quantize_colors: quantizeColors,
      auto_bg: removeBg,
      bg_tol: bgTolerance,
    })
  }

  return (
    <Box className={styles.root}>
      <Button
        variant="contained"
        fullWidth
        color="secondary"
        onClick={handlePreview}
        disabled={!sessionId || !lut || generatePreview.isPending}
      >
        {generatePreview.isPending ? (
          <CircularProgress size={18} color="inherit" />
        ) : (
          t('conv_preview_btn')
        )}
      </Button>
    </Box>
  )
}

export default PreviewButton
