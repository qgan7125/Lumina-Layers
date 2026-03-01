import { useQuery } from '@tanstack/react-query'
import { jobStatusApiConverterJobStatusJobIdGet } from '../api/generated/sdk.gen'

export const useConverterJobStatus = (jobId: string | null) =>
  useQuery({
    queryKey: ['converter', 'job', jobId],
    queryFn: () =>
      jobStatusApiConverterJobStatusJobIdGet({ path: { job_id: jobId! }, throwOnError: true }).then(
        (r) => r.data,
      ),
    enabled: !!jobId,
    refetchInterval: (query) =>
      query.state.data?.status === 'done' || query.state.data?.status === 'error' ? false : 1000,
  })
