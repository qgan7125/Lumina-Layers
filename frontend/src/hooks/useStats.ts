import { useQuery } from '@tanstack/react-query'
import { getStatsApiSettingsStatsGet } from '../api/generated/sdk.gen'

export const useStats = () =>
  useQuery({
    queryKey: ['settings', 'stats'],
    queryFn: () => getStatsApiSettingsStatsGet({ throwOnError: true }).then((r) => r.data),
  })
