import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MergeTypeIcon from '@mui/icons-material/MergeType'
import styles from './LutMergeTab.module.scss'

const MOCK_LUTS = ['BAMBU_CMYW_6C', 'BAMBU_CMYW_8C', 'BAMBU_RYBW_6C', 'CUSTOM_4C']

const LutMergeTab: React.FC = () => {
  const { t } = useTranslation()

  const [primaryLut, setPrimaryLut] = useState('')
  const [secondaryLuts, setSecondaryLuts] = useState<string[]>([])
  const [deltaE, setDeltaE] = useState(5)

  const toggleSecondary = (name: string) => {
    setSecondaryLuts((prev) =>
      prev.includes(name) ? prev.filter((l) => l !== name) : [...prev, name],
    )
  }

  const availableSecondary = MOCK_LUTS.filter((l) => l !== primaryLut)
  const canMerge = primaryLut && secondaryLuts.length > 0

  return (
    <Box className={styles.root}>
      <Box className={styles.content}>
        <Paper variant="outlined" className={styles.card}>
          {/* Primary LUT */}
          <Box className={styles.field}>
            <Typography variant="caption" className={styles.label}>
              {t('merge_lut_primary_label')}
            </Typography>
            <Select
              value={primaryLut}
              onChange={(e) => setPrimaryLut(e.target.value)}
              displayEmpty
              size="small"
              fullWidth
            >
              <MenuItem value="">
                <em>{t('merge_primary_hint')}</em>
              </MenuItem>
              {MOCK_LUTS.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
            {primaryLut && (
              <Chip
                size="small"
                label={`${t('merge_mode_label')}: ${primaryLut}`}
                variant="outlined"
                className={styles.modeChip}
              />
            )}
          </Box>

          <Divider className={styles.divider} />

          {/* Secondary LUTs */}
          <Box className={styles.field}>
            <Typography variant="caption" className={styles.label}>
              {t('merge_lut_secondary_label')}
            </Typography>
            {primaryLut ? (
              <FormGroup>
                {availableSecondary.map((name) => (
                  <FormControlLabel
                    key={name}
                    control={
                      <Checkbox
                        size="small"
                        checked={secondaryLuts.includes(name)}
                        onChange={() => toggleSecondary(name)}
                      />
                    }
                    label={<Typography variant="body2">{name}</Typography>}
                  />
                ))}
              </FormGroup>
            ) : (
              <Typography variant="caption" color="text.secondary">
                {t('merge_primary_hint')}
              </Typography>
            )}
            {secondaryLuts.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={0.5} className={styles.selectedChips}>
                {secondaryLuts.map((name) => (
                  <Chip
                    key={name}
                    label={name}
                    size="small"
                    onDelete={() => toggleSecondary(name)}
                  />
                ))}
              </Stack>
            )}
          </Box>

          <Divider className={styles.divider} />

          {/* Delta-E */}
          <Box className={styles.field}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" className={styles.label}>
                {t('merge_dedup_label')}: {deltaE}
              </Typography>
            </Stack>
            <Slider
              value={deltaE}
              onChange={(_, v) => setDeltaE(v as number)}
              min={0}
              max={20}
              step={1}
              size="small"
              marks={[
                { value: 0, label: '0' },
                { value: 10, label: '10' },
                { value: 20, label: '20' },
              ]}
            />
            <Typography variant="caption" color="text.secondary">
              {t('merge_dedup_info')}
            </Typography>
          </Box>

          <Divider className={styles.divider} />

          {/* Merge Action */}
          <Box className={styles.field}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<MergeTypeIcon />}
              disabled={!canMerge}
            >
              {t('merge_btn')}
            </Button>
          </Box>

          {/* Status */}
          <Alert severity="info" className={styles.status} icon={false}>
            <Typography variant="caption">{t('merge_status_ready')}</Typography>
          </Alert>
        </Paper>
      </Box>
    </Box>
  )
}

export { LutMergeTab }
