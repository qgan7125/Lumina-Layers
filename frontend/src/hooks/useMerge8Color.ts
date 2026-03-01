import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Merge8ColorRequest } from '../api/generated/types.gen'
import { merge8ColorApiExtractorMerge8ColorPost } from '../api/generated/sdk.gen'

export const useMerge8Color = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Merge8ColorRequest) =>
      merge8ColorApiExtractorMerge8ColorPost({ body, throwOnError: true }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lut', 'list'] }),
  })
}
