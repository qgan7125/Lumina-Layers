import { useMutation } from '@tanstack/react-query'
import type { GenerateCalibrationRequest } from '../api/generated/types.gen'
import { generateCalibrationApiCalibrationGeneratePost } from '../api/generated/sdk.gen'

export const useCalibration = () =>
  useMutation({
    mutationFn: (body: GenerateCalibrationRequest) =>
      generateCalibrationApiCalibrationGeneratePost({ body, throwOnError: true }).then(
        (r) => r.data,
      ),
  })
