import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteLutApiLutLutNameDelete } from '../api/generated/sdk.gen'

export const useLutDelete = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lutName: string) =>
      deleteLutApiLutLutNameDelete({ path: { lut_name: lutName }, throwOnError: true }).then(
        (r) => r.data,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lut', 'list'] }),
  })
}
