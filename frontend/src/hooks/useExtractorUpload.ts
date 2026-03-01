import { useMutation } from '@tanstack/react-query'
import { uploadExtractorImageApiExtractorUploadPost } from '../api/generated/sdk.gen'
import { useExtractorStore } from '../stores/extractorStore'

export const useExtractorUpload = () => {
  const store = useExtractorStore()
  return useMutation({
    mutationFn: (file: File) =>
      uploadExtractorImageApiExtractorUploadPost({ body: { file }, throwOnError: true }).then(
        (r) => r.data,
      ),
    onSuccess: (data) => {
      store.reset()
      store.setSessionId(data.session_id)
      store.setImageUrl(`/api/files/session/${data.session_id}/${data.image_path.split('/').pop()}`)
    },
  })
}
