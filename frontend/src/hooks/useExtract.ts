import { useMutation } from '@tanstack/react-query'
import type { ExtractRequest } from '../api/generated/types.gen'
import { extractApiExtractorExtractPost } from '../api/generated/sdk.gen'
import { useExtractorStore } from '../stores/extractorStore'

export const useExtract = () => {
  const store = useExtractorStore()
  return useMutation({
    mutationFn: (body: ExtractRequest) =>
      extractApiExtractorExtractPost({ body, throwOnError: true }).then((r) => r.data),
    onSuccess: (data) => store.setExtractJobId(data.job_id),
  })
}
