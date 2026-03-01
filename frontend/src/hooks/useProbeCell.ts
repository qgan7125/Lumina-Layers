import { useMutation } from '@tanstack/react-query'
import type { ProbeCellRequest } from '../api/generated/types.gen'
import { probeCellApiExtractorProbeCellPost } from '../api/generated/sdk.gen'

export const useProbeCell = () =>
  useMutation({
    mutationFn: (body: ProbeCellRequest) =>
      probeCellApiExtractorProbeCellPost({ body, throwOnError: true }).then((r) => r.data),
  })
