import { useQuery } from '@tanstack/react-query'
import { jobStatusApiExtractorJobStatusJobIdGet } from '../api/generated/sdk.gen'

export const useExtractJobStatus = (jobId: string | null) =>
  useQuery({
    queryKey: ['extractor', 'job', jobId],
    queryFn: () =>
      jobStatusApiExtractorJobStatusJobIdGet({ path: { job_id: jobId! }, throwOnError: true }).then(
        (r) => r.data,
      ),
    enabled: !!jobId,
    refetchInterval: (query) =>
      query.state.data?.status === 'done' || query.state.data?.status === 'error' ? false : 1000,
  })
