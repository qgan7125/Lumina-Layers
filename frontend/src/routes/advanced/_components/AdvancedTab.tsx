import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import styles from './AdvancedTab.module.scss'

const AdvancedTab: React.FC = () => {
  const { t } = useTranslation()

  const [outlineEnabled, setOutlineEnabled] = useState(false)
  const [outlineWidth, setOutlineWidth] = useState(0.4)

  const [cloisonneEnabled, setCloisonneEnabled] = useState(false)
  const [wireWidth, setWireWidth] = useState(0.4)
  const [wireHeight, setWireHeight] = useState(0.6)
  const [wireColorSlot, setWireColorSlot] = useState(1)

  const [coatingEnabled, setCoatingEnabled] = useState(false)
  const [coatingHeight, setCoatingHeight] = useState(0.2)

  return (
    <Box className={styles.root}>
      <Box className={styles.content}>
        {/* Outline */}
        <Paper variant="outlined" className={styles.card}>
          <Typography variant="subtitle2" className={styles.cardTitle}>
            {t('conv_outline_section')}
          </Typography>
          <Divider className={styles.divider} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">{t('conv_outline_enable')}</Typography>
            <Switch
              checked={outlineEnabled}
              onChange={(e) => setOutlineEnabled(e.target.checked)}
            />
          </Stack>
          {outlineEnabled && (
            <Box className={styles.sliderRow}>
              <Typography variant="caption" className={styles.sliderLabel}>
                {t('conv_outline_width')}: {outlineWidth}
              </Typography>
              <Slider
                value={outlineWidth}
                onChange={(_, v) => setOutlineWidth(v as number)}
                min={0.2}
                max={2.0}
                step={0.1}
                size="small"
              />
            </Box>
          )}
        </Paper>

        {/* Cloisonné */}
        <Paper variant="outlined" className={styles.card}>
          <Typography variant="subtitle2" className={styles.cardTitle}>
            {t('conv_cloisonne_section')}
          </Typography>
          <Divider className={styles.divider} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">{t('conv_cloisonne_enable')}</Typography>
            <Switch
              checked={cloisonneEnabled}
              onChange={(e) => setCloisonneEnabled(e.target.checked)}
            />
          </Stack>
          {cloisonneEnabled && (
            <Stack spacing={1} className={styles.sliderGroup}>
              <Box className={styles.sliderRow}>
                <Typography variant="caption" className={styles.sliderLabel}>
                  {t('conv_cloisonne_wire_width')}: {wireWidth}
                </Typography>
                <Slider
                  value={wireWidth}
                  onChange={(_, v) => setWireWidth(v as number)}
                  min={0.2}
                  max={2.0}
                  step={0.1}
                  size="small"
                />
              </Box>
              <Box className={styles.sliderRow}>
                <Typography variant="caption" className={styles.sliderLabel}>
                  {t('conv_cloisonne_wire_height')}: {wireHeight}
                </Typography>
                <Slider
                  value={wireHeight}
                  onChange={(_, v) => setWireHeight(v as number)}
                  min={0.2}
                  max={2.0}
                  step={0.1}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="caption" className={styles.sliderLabel}>
                  {t('conv_cloisonne_wire_color')}
                </Typography>
                <Select
                  value={wireColorSlot}
                  onChange={(e) => setWireColorSlot(Number(e.target.value))}
                  size="small"
                  fullWidth
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <MenuItem key={n} value={n}>
                      Slot {n}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Stack>
          )}
        </Paper>

        {/* Coating */}
        <Paper variant="outlined" className={styles.card}>
          <Typography variant="subtitle2" className={styles.cardTitle}>
            {t('conv_coating_section')}
          </Typography>
          <Divider className={styles.divider} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">{t('conv_coating_enable')}</Typography>
            <Switch
              checked={coatingEnabled}
              onChange={(e) => setCoatingEnabled(e.target.checked)}
            />
          </Stack>
          {coatingEnabled && (
            <Box className={styles.sliderRow}>
              <Typography variant="caption" className={styles.sliderLabel}>
                {t('conv_coating_height')}: {coatingHeight}
              </Typography>
              <Slider
                value={coatingHeight}
                onChange={(_, v) => setCoatingHeight(v as number)}
                min={0.1}
                max={1.0}
                step={0.05}
                size="small"
              />
            </Box>
          )}
        </Paper>

        {/* Free Colors */}
        <Paper variant="outlined" className={styles.card}>
          <Typography variant="subtitle2" className={styles.cardTitle}>
            {t('conv_free_color_btn')}
          </Typography>
          <Divider className={styles.divider} />
          <Typography variant="body2" color="text.secondary" className={styles.freeColorHint}>
            {t('lut_grid_picker_hint')}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small">
              {t('conv_free_color_btn')}
            </Button>
            <Button variant="outlined" size="small" color="error">
              {t('conv_free_color_clear_btn')}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}

export { AdvancedTab }
