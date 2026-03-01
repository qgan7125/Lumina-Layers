import { useMutation } from '@tanstack/react-query'
import type { LutMergeRequest } from '../api/generated/types.gen'
import { mergeLutsApiLutMergePost } from '../api/generated/sdk.gen'

export const useLutMerge = () =>
  useMutation({
    mutationFn: (body: LutMergeRequest) =>
      mergeLutsApiLutMergePost({ body, throwOnError: true }).then((r) => r.data),
  })
