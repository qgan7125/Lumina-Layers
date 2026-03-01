import { useQuery } from '@tanstack/react-query'
import { lutColorsApiLutLutNameColorsGet } from '../api/generated/sdk.gen'

export const useLutColors = (lutName: string | null) =>
  useQuery({
    queryKey: ['lut', 'colors', lutName],
    queryFn: () =>
      lutColorsApiLutLutNameColorsGet({ path: { lut_name: lutName! }, throwOnError: true }).then(
        (r) => r.data,
      ),
    enabled: !!lutName,
  })
