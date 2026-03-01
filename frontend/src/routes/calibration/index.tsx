import { createFileRoute } from '@tanstack/react-router'
import { CalibrationTab } from './_components/CalibrationTab'

export const Route = createFileRoute('/calibration/')({
  component: CalibrationTab,
})
