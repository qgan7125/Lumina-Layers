import { useMutation } from '@tanstack/react-query'
import type {
  Generate3MfRequest,
  GeneratePreviewRequest,
} from '../../../../../../api/generated/types.gen'
import {
  generate3MfApiConverterGenerate3MfPost,
  generatePreviewApiConverterGeneratePreviewPost,
} from '../../../../../../api/generated/sdk.gen'
import { useConverterStore } from '../../../../../../stores/converterStore'

export function useConvertActions() {
  const store = useConverterStore()

  const generatePreview = useMutation({
    mutationFn: (body: GeneratePreviewRequest) =>
      generatePreviewApiConverterGeneratePreviewPost({ body, throwOnError: true }).then(
        (r) => r.data,
      ),
    onSuccess: (data) => store.setPreviewJobId(data.job_id),
  })

  const generate3mf = useMutation({
    mutationFn: (body: Generate3MfRequest) =>
      generate3MfApiConverterGenerate3MfPost({ body, throwOnError: true }).then((r) => r.data),
    onSuccess: (data) => store.setGenerate3mfJobId(data.job_id),
  })

  return {
    generatePreview,
    generate3mf,
    sessionId: store.sessionId,
    replacementMap: store.replacementMap,
    clearReplacements: store.clearReplacements,
  }
}
