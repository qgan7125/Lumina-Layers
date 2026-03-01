import { useMutation } from '@tanstack/react-query'
import { autoDetectColorsApiConverterAutoDetectColorsPost } from '../../../../../../api/generated/sdk.gen'

export function useColorDetail() {
  const autoDetect = useMutation({
    mutationFn: (sessionId: string) =>
      autoDetectColorsApiConverterAutoDetectColorsPost({
        body: { session_id: sessionId },
        throwOnError: true,
      }).then((r) => r.data),
  })

  return { autoDetect }
}
