import { useMutation } from '@tanstack/react-query'
import { uploadImageApiConverterUploadImagePost } from '../../../../../../api/generated/sdk.gen'
import { useConverterStore } from '../../../../../../stores/converterStore'

export function useImageUpload() {
  const store = useConverterStore()

  const upload = useMutation({
    mutationFn: (file: File) =>
      uploadImageApiConverterUploadImagePost({ body: { file }, throwOnError: true }).then(
        (r) => r.data,
      ),
    onSuccess: (data) => {
      store.reset()
      store.setSessionId(data.session_id)
    },
  })

  return { upload }
}
