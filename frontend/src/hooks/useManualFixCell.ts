import { useMutation } from '@tanstack/react-query'
import type { ManualFixCellRequest } from '../api/generated/types.gen'
import { manualFixCellApiExtractorManualFixCellPost } from '../api/generated/sdk.gen'

export const useManualFixCell = () =>
  useMutation({
    mutationFn: (body: ManualFixCellRequest) =>
      manualFixCellApiExtractorManualFixCellPost({ body, throwOnError: true }).then((r) => r.data),
  })
