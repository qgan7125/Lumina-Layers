import { useQuery } from '@tanstack/react-query'
import { mergeStatusApiLutMergeStatusJobIdGet } from '../api/generated/sdk.gen'

export const useLutMergeStatus = (jobId: string | null) =>
  useQuery({
    queryKey: ['lut', 'merge-status', jobId],
    queryFn: () =>
      mergeStatusApiLutMergeStatusJobIdGet({ path: { job_id: jobId! }, throwOnError: true }).then(
        (r) => r.data,
      ),
    enabled: !!jobId,
    refetchInterval: (query) =>
      query.state.data?.status === 'done' || query.state.data?.status === 'error' ? false : 1000,
  })
