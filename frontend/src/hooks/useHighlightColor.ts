import { useMutation } from '@tanstack/react-query'
import type { HighlightColorRequest } from '../api/generated/types.gen'
import { highlightColorApiConverterHighlightColorPost } from '../api/generated/sdk.gen'

export const useHighlightColor = () =>
  useMutation({
    mutationFn: (body: HighlightColorRequest) =>
      highlightColorApiConverterHighlightColorPost({ body, throwOnError: true }).then(
        (r) => r.data,
      ),
  })
