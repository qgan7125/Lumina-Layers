import { useQuery } from '@tanstack/react-query'
import { jobStatusApiCalibrationJobStatusJobIdGet } from '../api/generated/sdk.gen'

export const useCalibrationJobStatus = (jobId: string | null) =>
  useQuery({
    queryKey: ['calibration', 'job', jobId],
    queryFn: () =>
      jobStatusApiCalibrationJobStatusJobIdGet({
        path: { job_id: jobId! },
        throwOnError: true,
      }).then((r) => r.data),
    enabled: !!jobId,
    refetchInterval: (query) =>
      query.state.data?.status === 'done' || query.state.data?.status === 'error' ? false : 1000,
  })
