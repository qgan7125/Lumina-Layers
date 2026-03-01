import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type RejectReason = 'type' | 'size' | 'multipleNotAllowed'

export type RejectedFile = {
  file: File
  reason: RejectReason
}

export type FileUploadVariant = 'icon' | 'dropzone' | 'button'

export type FileUploadProps = {
  variant: FileUploadVariant

  accept?: readonly string[]
  multiple?: boolean
  maxSizeBytes?: number

  disabled?: boolean
  loading?: boolean

  /** Called with accepted files */
  onFiles: (files: File[]) => void | Promise<void>

  /** Optional callback for rejected files */
  onReject?: (rejected: RejectedFile[]) => void

  /** Optional common text for dropzone/button variants */
  label?: string
  hint?: string

  /** Variant-specific UI */
  icon?: ReactNode // used for variant="icon"
  iconAriaLabel?: string

  buttonText?: string // used for variant="button"
}

function fileMatchesAccept(file: File, accept: readonly string[]) {
  if (accept.length === 0) return true

  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()

  return accept.some((raw) => {
    const p = raw.toLowerCase().trim()

    if (p.startsWith('.')) return name.endsWith(p) // extension
    if (p.endsWith('/*')) return type.startsWith(p.slice(0, -1)) // image/*
    return type === p // exact mime
  })
}

export const FileUpload = ({
  variant,
  accept,
  multiple = false,
  maxSizeBytes,
  disabled = false,
  loading = false,
  onFiles,
  onReject,
  label,
  hint,
  icon,
  iconAriaLabel,
  buttonText,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const acceptList = useMemo(() => (accept ? [...accept] : []), [accept])
  const acceptAttr = useMemo(() => acceptList.join(','), [acceptList])

  const openPicker = useCallback(() => {
    if (disabled || loading) return
    inputRef.current?.click()
  }, [disabled, loading])

  const validate = useCallback(
    (files: File[]) => {
      const accepted: File[] = []
      const rejected: RejectedFile[] = []

      if (!multiple && files.length > 1) {
        // keep only first as accepted, mark others rejected
        accepted.push(files[0])
        for (const extra of files.slice(1)) {
          rejected.push({ file: extra, reason: 'multipleNotAllowed' })
        }
        return { accepted, rejected }
      }

      for (const file of files) {
        if (!fileMatchesAccept(file, acceptList)) {
          rejected.push({ file, reason: 'type' })
          continue
        }
        if (typeof maxSizeBytes === 'number' && file.size > maxSizeBytes) {
          rejected.push({ file, reason: 'size' })
          continue
        }
        accepted.push(file)
      }

      return { accepted, rejected }
    },
    [acceptList, maxSizeBytes, multiple],
  )

  const handleFiles = useCallback(
    async (files: File[]) => {
      const { accepted, rejected } = validate(files)

      if (rejected.length > 0) onReject?.(rejected)
      if (accepted.length === 0) return

      await onFiles(accepted)
    },
    [onFiles, onReject, validate],
  )

  const onInputChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget
      const files = input.files ? Array.from(input.files) : []
      if (files.length > 0) await handleFiles(files)

      // allow selecting the same file again
      input.value = ''
    },
    [handleFiles],
  )

  // Drag & drop handlers
  const onDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onDragEnter = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled && !loading) setIsDragging(true)
    },
    [disabled, loading],
  )

  const onDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    async (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled || loading || !e.dataTransfer) return

      const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : []
      if (files.length > 0) await handleFiles(files)
    },
    [disabled, loading, handleFiles],
  )

  // Shared hidden input
  const inputEl = (
    <input
      ref={inputRef}
      type="file"
      hidden
      accept={acceptAttr}
      multiple={multiple}
      onChange={onInputChange}
    />
  )

  if (variant === 'icon') {
    return (
      <IconButton
        size="small"
        component="span"
        onClick={openPicker}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        disabled={disabled || loading}
        aria-label={iconAriaLabel}
        sx={{
          outline: isDragging ? '1px dashed' : 'none',
          outlineColor: isDragging ? 'primary.main' : 'transparent',
        }}
      >
        {loading ? <CircularProgress size={14} /> : icon}
        {inputEl}
      </IconButton>
    )
  }

  if (variant === 'button') {
    return (
      <Button
        variant="outlined"
        size="small"
        onClick={openPicker}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        disabled={disabled || loading}
      >
        {loading ? <CircularProgress size={14} /> : buttonText}
        {inputEl}
      </Button>
    )
  }

  // variant === "dropzone"
  return (
    <Box
      onClick={openPicker}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openPicker()
      }}
      sx={{
        border: '1px dashed',
        borderColor: isDragging ? 'primary.main' : 'divider',
        borderRadius: 2,
        p: 2,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        userSelect: 'none',
      }}
      aria-label={label}
    >
      <Stack spacing={0.5}>
        {label ? <Typography variant="caption">{label}</Typography> : null}
        <Typography variant="body2" color="text.secondary">
          {loading
            ? 'Uploading…'
            : isDragging
              ? 'Drop files to upload'
              : (hint ?? 'Drop a file here or click to upload')}
        </Typography>
        {inputEl}
      </Stack>
    </Box>
  )
}
