import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listLutsApiLutListGet, uploadLutApiLutUploadPost } from '../../../api/generated'

export function useLut() {
  const queryClient = useQueryClient()

  const {
    data: lutList,
    isLoading: isLutListLoading,
    isFetching: isLutListFetching,
  } = useQuery({
    queryKey: ['lut', 'list'],
    queryFn: () => listLutsApiLutListGet({ throwOnError: true }).then((r) => r.data),
  })

  const { mutateAsync: updateLutFile, isPending: isUploadLutPending } = useMutation({
    mutationFn: (file: File) =>
      uploadLutApiLutUploadPost({
        body: { file },
        throwOnError: true,
      }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lut', 'list'] }),
  })

  return { lutList, isLutListLoading, isLutListFetching, updateLutFile, isUploadLutPending }
}
