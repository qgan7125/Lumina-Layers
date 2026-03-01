import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
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
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import styles from './ConverterSidebar.module.scss'

type ColorMode = 'CMYW' | 'RYBW'
type Structure = 'double' | 'single'
type ModelingMode = 'hifi' | 'pixel' | 'vector'

const ConverterSidebar: React.FC = () => {
  const { t } = useTranslation()

  const [lut, setLut] = useState('')
  const [colorMode, setColorMode] = useState<ColorMode>('CMYW')
  const [structure, setStructure] = useState<Structure>('double')
  const [modelingMode, setModelingMode] = useState<ModelingMode>('hifi')
  const [quantizeColors, setQuantizeColors] = useState(6)
  const [removeBg, setRemoveBg] = useState(false)
  const [bgTolerance, setBgTolerance] = useState(30)
  const [width, setWidth] = useState(80)
  const [height, setHeight] = useState(80)
  const [thickness, setThickness] = useState(2.8)
  const [loopEnabled, setLoopEnabled] = useState(false)
  const [loopWidth, setLoopWidth] = useState(8)
  const [loopLength, setLoopLength] = useState(12)
  const [loopHole, setLoopHole] = useState(3)

  return (
    <Stack className={styles.root} spacing={0} divider={<Divider />}>
      {/* LUT */}
      <Box className={styles.section}>
        <Typography variant="caption" className={styles.label}>
          {t('conv_lut_dropdown')}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Select
            value={lut}
            onChange={(e) => setLut(e.target.value)}
            displayEmpty
            size="small"
            fullWidth
          >
            <MenuItem value="">
              <em>{t('conv_lut_info')}</em>
            </MenuItem>
          </Select>
          <Button variant="outlined" size="small" component="label">
            .npy
            <input type="file" accept=".npy" hidden />
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary" className={styles.hint}>
          {t('conv_lut_status_default')}
        </Typography>
      </Box>

      {/* Image Upload */}
      <Box className={styles.section}>
        <Typography variant="caption" className={styles.label}>
          {t('conv_image_label')}
        </Typography>
        <Box className={styles.uploadArea} component="label">
          <input type="file" accept="image/*" hidden />
          <CloudUploadIcon className={styles.uploadIcon} />
          <Typography variant="caption" color="text.secondary">
            {t('upload')}
          </Typography>
        </Box>
        <Button variant="outlined" size="small" fullWidth className={styles.cropBtn}>
          {t('conv_crop_btn')}
        </Button>
      </Box>

      {/* Color Mode */}
      <Box className={styles.section}>
        <Typography variant="caption" className={styles.label}>
          {t('conv_color_mode')}
        </Typography>
        <RadioGroup
          row
          value={colorMode}
          onChange={(e) => setColorMode(e.target.value as ColorMode)}
        >
          <FormControlLabel value="CMYW" control={<Radio size="small" />} label="CMYW" />
          <FormControlLabel value="RYBW" control={<Radio size="small" />} label="RYBW" />
        </RadioGroup>
      </Box>

      {/* Structure */}
      <Box className={styles.section}>
        <Typography variant="caption" className={styles.label}>
          {t('conv_structure')}
        </Typography>
        <RadioGroup
          row
          value={structure}
          onChange={(e) => setStructure(e.target.value as Structure)}
        >
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

      {/* Modeling Mode */}
      <Box className={styles.section}>
        <Typography variant="caption" className={styles.label}>
          {t('conv_modeling_mode')}
        </Typography>
        <RadioGroup
          value={modelingMode}
          onChange={(e) => setModelingMode(e.target.value as ModelingMode)}
        >
          <FormControlLabel
            value="hifi"
            control={<Radio size="small" />}
            label={t('conv_modeling_mode_hifi')}
          />
          <FormControlLabel
            value="pixel"
            control={<Radio size="small" />}
            label={t('conv_modeling_mode_pixel')}
          />
          <FormControlLabel
            value="vector"
            control={<Radio size="small" />}
            label={t('conv_modeling_mode_vector')}
          />
        </RadioGroup>
      </Box>

      {/* Color Detail */}
      <Box className={styles.section}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" className={styles.label}>
            {t('conv_quantize_colors')}: {quantizeColors}
          </Typography>
          <Button size="small" variant="text">
            {t('conv_auto_color_btn')}
          </Button>
        </Stack>
        <Slider
          value={quantizeColors}
          onChange={(_, v) => setQuantizeColors(v as number)}
          min={2}
          max={16}
          step={1}
          size="small"
          marks
        />
      </Box>

      {/* Remove BG */}
      <Box className={styles.section}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption">{t('conv_auto_bg')}</Typography>
          <Switch
            size="small"
            checked={removeBg}
            onChange={(e) => setRemoveBg(e.target.checked)}
          />
        </Stack>
        {removeBg && (
          <Box className={styles.subSection}>
            <Typography variant="caption">
              {t('conv_tolerance')}: {bgTolerance}
            </Typography>
            <Slider
              value={bgTolerance}
              onChange={(_, v) => setBgTolerance(v as number)}
              min={0}
              max={150}
              size="small"
            />
          </Box>
        )}
      </Box>

      {/* Dimensions */}
      <Box className={styles.section}>
        <Typography variant="caption" className={styles.label}>
          {t('conv_width')}: {width}
        </Typography>
        <Slider
          value={width}
          onChange={(_, v) => setWidth(v as number)}
          min={20}
          max={200}
          size="small"
        />
        <Typography variant="caption" className={styles.label}>
          {t('conv_height')}: {height}
        </Typography>
        <Slider
          value={height}
          onChange={(_, v) => setHeight(v as number)}
          min={20}
          max={200}
          size="small"
        />
        <Typography variant="caption" className={styles.label}>
          {t('conv_thickness')}: {thickness}
        </Typography>
        <Slider
          value={thickness}
          onChange={(_, v) => setThickness(v as number)}
          min={1}
          max={5}
          step={0.2}
          size="small"
        />
      </Box>

      {/* Preview */}
      <Box className={styles.section}>
        <Button variant="contained" fullWidth color="secondary">
          {t('conv_preview_btn')}
        </Button>
      </Box>

      {/* Advanced: Keychain Hole */}
      <Accordion disableGutters elevation={0} className={styles.accordion}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.accordionSummary}>
          <Typography variant="caption">{t('conv_loop_section')}</Typography>
        </AccordionSummary>
        <AccordionDetails className={styles.accordionDetails}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption">{t('conv_loop_enable')}</Typography>
            <Switch
              size="small"
              checked={loopEnabled}
              onChange={(e) => setLoopEnabled(e.target.checked)}
            />
          </Stack>
          {loopEnabled && (
            <Box className={styles.subSection}>
              <Typography variant="caption">
                {t('conv_loop_width')}: {loopWidth}
              </Typography>
              <Slider
                value={loopWidth}
                onChange={(_, v) => setLoopWidth(v as number)}
                min={4}
                max={20}
                step={0.5}
                size="small"
              />
              <Typography variant="caption">
                {t('conv_loop_length')}: {loopLength}
              </Typography>
              <Slider
                value={loopLength}
                onChange={(_, v) => setLoopLength(v as number)}
                min={6}
                max={30}
                step={0.5}
                size="small"
              />
              <Typography variant="caption">
                {t('conv_loop_hole')}: {loopHole}
              </Typography>
              <Slider
                value={loopHole}
                onChange={(_, v) => setLoopHole(v as number)}
                min={1}
                max={8}
                step={0.5}
                size="small"
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Generate */}
      <Box className={styles.section}>
        <Button variant="contained" fullWidth color="primary" size="large">
          {t('conv_generate_btn')}
        </Button>
      </Box>
    </Stack>
  )
}

export { ConverterSidebar }
