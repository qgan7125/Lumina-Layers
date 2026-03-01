import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useConverterStore } from '../../../../../stores/converterStore'
import { FileUpload } from '../../../../../components/FileUpload/FileUpload'
import { useNotify } from '../../../../../components/Notification'
import { useImageUpload } from './hooks/useImageUpload'
import styles from './ImageUpload.module.scss'

const ImageUpload: React.FC = () => {
  const { t } = useTranslation()
  const notify = useNotify()
  const { upload } = useImageUpload()
  const hasSession = !!useConverterStore((s) => s.sessionId)

  const handleFiles = async (files: File[]) => {
    try {
      await upload.mutateAsync(files[0])
      notify(t('conv_image_upload_success'), { severity: 'success' })
    } catch {
      notify(t('conv_image_upload_error'), { severity: 'error' })
    }
  }

  return (
    <Box className={styles.root}>
      <Typography variant="caption" className={styles.label}>
        {t('conv_image_label')}
      </Typography>
      <FileUpload
        variant="dropzone"
        accept={['image/*']}
        loading={upload.isPending}
        label={hasSession ? t('conv_image_replace') : t('upload')}
        onFiles={handleFiles}
      />
      <Button variant="outlined" size="small" fullWidth className={styles.cropBtn} disabled>
        {t('conv_crop_btn')}
      </Button>
    </Box>
  )
}

export default ImageUpload
