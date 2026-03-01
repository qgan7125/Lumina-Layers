import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  clearCacheApiSettingsClearCachePost,
  resetCountersApiSettingsResetCountersPost,
} from '../api/generated/sdk.gen'

export const useSettingsActions = () => {
  const queryClient = useQueryClient()
  const invalidateStats = () => queryClient.invalidateQueries({ queryKey: ['settings', 'stats'] })

  const clearCache = useMutation({
    mutationFn: () =>
      clearCacheApiSettingsClearCachePost({ throwOnError: true }).then((r) => r.data),
    onSuccess: invalidateStats,
  })

  const resetCounters = useMutation({
    mutationFn: () =>
      resetCountersApiSettingsResetCountersPost({ throwOnError: true }).then((r) => r.data),
    onSuccess: invalidateStats,
  })

  return { clearCache, resetCounters }
}
