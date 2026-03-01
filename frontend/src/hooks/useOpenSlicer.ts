import { useMutation } from '@tanstack/react-query'
import type { OpenInSlicerRequest } from '../api/generated/types.gen'
import { openInSlicerApiSettingsOpenInSlicerPost } from '../api/generated/sdk.gen'

export const useOpenSlicer = () =>
  useMutation({
    mutationFn: (body: OpenInSlicerRequest) =>
      openInSlicerApiSettingsOpenInSlicerPost({ body, throwOnError: true }).then((r) => r.data),
  })
