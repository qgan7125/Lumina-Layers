import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { useConvertActions } from './hooks/useConvertActions'
import styles from './ConvertActions.module.scss'

interface GenerateButtonProps {
  lut: string
  colorMode: string
  structure: string
  modelingMode: string
  quantizeColors: number
  removeBg: boolean
  bgTolerance: number
  width: number
  thickness: number
  loopEnabled: boolean
  loopWidth: number
  loopLength: number
  loopHole: number
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  lut,
  colorMode,
  structure,
  modelingMode,
  quantizeColors,
  removeBg,
  bgTolerance,
  width,
  thickness,
  loopEnabled,
  loopWidth,
  loopLength,
  loopHole,
}) => {
  const { t } = useTranslation()
  const { generate3mf, sessionId, replacementMap } = useConvertActions()

  const handleGenerate = () => {
    if (!sessionId || !lut) return
    generate3mf.mutate({
      session_id: sessionId,
      lut_name: lut,
      target_width_mm: width,
      spacer_thick: thickness,
      structure_mode: structure,
      color_mode: colorMode,
      modeling_mode: modelingMode,
      quantize_colors: quantizeColors,
      auto_bg: removeBg,
      bg_tol: bgTolerance,
      add_loop: loopEnabled,
      loop_width: loopWidth,
      loop_length: loopLength,
      loop_hole: loopHole,
      color_replacements: replacementMap,
    })
  }

  return (
    <Box className={styles.root}>
      <Button
        variant="contained"
        fullWidth
        color="primary"
        size="large"
        onClick={handleGenerate}
        disabled={!sessionId || !lut || generate3mf.isPending}
      >
        {generate3mf.isPending ? (
          <CircularProgress size={18} color="inherit" />
        ) : (
          t('conv_generate_btn')
        )}
      </Button>
    </Box>
  )
}

export default GenerateButton
