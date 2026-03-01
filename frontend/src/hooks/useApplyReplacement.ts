import { useMutation } from '@tanstack/react-query'
import type { ApplyReplacementRequest } from '../api/generated/types.gen'
import { applyReplacementApiConverterApplyReplacementPost } from '../api/generated/sdk.gen'

export const useApplyReplacement = () =>
  useMutation({
    mutationFn: (body: ApplyReplacementRequest) =>
      applyReplacementApiConverterApplyReplacementPost({ body, throwOnError: true }).then(
        (r) => r.data,
      ),
  })
