import { useQuery } from '@tanstack/react-query'
import { getSlicersApiSettingsSlicersGet } from '../api/generated/sdk.gen'

export const useSlicers = () =>
  useQuery({
    queryKey: ['settings', 'slicers'],
    queryFn: () => getSlicersApiSettingsSlicersGet({ throwOnError: true }).then((r) => r.data),
  })
