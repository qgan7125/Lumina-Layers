import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { Trans, useTranslation } from 'react-i18next'
import { useLut } from './hooks/useLut'
import styles from './LutSelect.module.scss'
import { useNotify } from '../Notification'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import { FileUpload, type RejectedFile } from '../FileUpload/FileUpload'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import CheckBoxIcon from '@mui/icons-material/CheckBox'

const ACCEPTED_EXTS = ['.npy', '.npz'] as const

interface LutSelectProps {
  lutFileName: string
  changeLutFileName: (lut: string) => void
}

const LutSelect = ({ lutFileName, changeLutFileName }: LutSelectProps) => {
  const { t } = useTranslation()
  const { lutList, updateLutFile, isUploadLutPending } = useLut()
  const notify = useNotify()

  const handleLutFilenameChange = (e: SelectChangeEvent<string>) => {
    changeLutFileName(e.target.value)
  }

  const handleLutUpload = async (files: File[]) => {
    const file = files[0]
    if (!file) return

    try {
      await updateLutFile(file)
      notify('Upload successfully', { severity: 'success' })
    } catch {
      notify('Failed to upload', { severity: 'error' })
    }
  }
  const handleLutReject = (rejected: RejectedFile[]) => {
    if (rejected.length > 0) notify('Failed to upload', { severity: 'error' })
  }

  return (
    <Paper elevation={2} className={styles.card}>
      <Box className={styles.section}>
        <Chip
          className={styles.label}
          color="primary"
          label={<Typography variant="caption">{t('conv_lut_dropdown')}</Typography>}
        />

        <Stack direction="row" gap={1} alignItems="center">
          <Select
            className={styles.select}
            value={lutFileName}
            onChange={handleLutFilenameChange}
            displayEmpty
            size="small"
            renderValue={(selected) =>
              selected ? (
                <Typography component="span">{selected}</Typography>
              ) : (
                <Typography component="span">{t('conv_lut_info')}</Typography>
              )
            }
            inputProps={{ 'aria-label': t('conv_lut_dropdown') }}
          >
            <MenuItem value="">
              <Typography>
                <em>{t('conv_lut_info')}</em>
              </Typography>
            </MenuItem>

            {lutList?.luts.map((entry) => (
              <MenuItem key={entry.name} value={entry.name}>
                <Typography>{entry.name}</Typography>
              </MenuItem>
            ))}
          </Select>

          <FileUpload
            variant="icon"
            icon={
              <Tooltip
                arrow
                title={
                  <Typography variant="caption" color="text.secondary">
                    {t('conv_lut_status_default')}
                  </Typography>
                }
              >
                <FileUploadIcon />
              </Tooltip>
            }
            iconAriaLabel={t('conv_lut_upload_button_aria', { defaultValue: 'Upload LUT file' })}
            accept={ACCEPTED_EXTS}
            loading={isUploadLutPending}
            onFiles={handleLutUpload}
            onReject={handleLutReject}
          />
        </Stack>

        {lutFileName && (
          <Stack direction="column">
            <Stack direction="row">
              <CheckBoxIcon color="success" fontSize="medium" />
              <Trans id="selected">Selected</Trans>
            </Stack>
            <Typography variant="body1" color="textPrimary">
              {lutFileName}
            </Typography>
          </Stack>
        )}
      </Box>
    </Paper>
  )
}

export default LutSelect
