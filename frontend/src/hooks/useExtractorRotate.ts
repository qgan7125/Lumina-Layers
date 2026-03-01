import { useMutation } from '@tanstack/react-query'
import { rotateApiExtractorRotatePost } from '../api/generated/sdk.gen'
import { useExtractorStore } from '../stores/extractorStore'

export const useExtractorRotate = () => {
  const store = useExtractorStore()
  return useMutation({
    mutationFn: ({ session_id, direction }: { session_id: string; direction: string }) =>
      rotateApiExtractorRotatePost({ body: { session_id, direction }, throwOnError: true }).then(
        (r) => r.data,
      ),
    onSuccess: (data, { session_id }) => {
      store.setImageUrl(
        `/api/files/session/${session_id}/${data.image_path.split('/').pop()}`,
      )
    },
  })
}
