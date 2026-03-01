import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert, { type AlertColor } from '@mui/material/Alert'

export type NotifyOptions = {
  /** "success" | "error" | "warning" | "info" */
  severity?: AlertColor
  /** Auto close ms; set null to disable auto-close */
  autoHideDuration?: number | null
  /** Snackbar position */
  anchorOrigin?: {
    vertical: 'top' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
  }
  /** MUI Alert variant */
  variant?: 'standard' | 'filled' | 'outlined'
}

type NotifyFn = (message: string, options?: NotifyOptions) => void

type NotificationState = {
  open: boolean
  message: string
  severity: AlertColor
  autoHideDuration: number | null
  anchorOrigin: {
    vertical: 'top' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
  }
  variant: 'standard' | 'filled' | 'outlined'
}

const DEFAULT_STATE: Omit<NotificationState, 'open' | 'message'> = {
  severity: 'info',
  autoHideDuration: 3000,
  anchorOrigin: { vertical: 'top', horizontal: 'right' },
  variant: 'filled',
}

const NotificationsContext = createContext<NotifyFn | null>(null)

export function useNotify(): NotifyFn {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotify must be used within <NotificationsProvider />')
  }
  return ctx
}

export const NotificationsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<NotificationState>({
    open: false,
    message: '',
    ...DEFAULT_STATE,
  })

  // Used to ensure consecutive identical messages still show
  const lastIdRef = useRef(0)

  const notify = useCallback<NotifyFn>((message, options) => {
    lastIdRef.current += 1
    setState({
      open: true,
      message,
      severity: options?.severity ?? DEFAULT_STATE.severity,
      autoHideDuration: options?.autoHideDuration ?? DEFAULT_STATE.autoHideDuration,
      anchorOrigin: options?.anchorOrigin ?? DEFAULT_STATE.anchorOrigin,
      variant: options?.variant ?? DEFAULT_STATE.variant,
      // we keep an internal id via ref; state update always triggers render anyway
    })
  }, [])

  const handleClose = useCallback((_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return
    setState((prev) => ({ ...prev, open: false }))
  }, [])

  const value = useMemo(() => notify, [notify])

  return (
    <NotificationsContext.Provider value={value}>
      {children}

      <Snackbar
        open={state.open}
        autoHideDuration={state.autoHideDuration ?? undefined}
        onClose={handleClose}
        anchorOrigin={state.anchorOrigin}
        key={lastIdRef.current} // ensures re-open animation for same message
      >
        <Alert onClose={handleClose} severity={state.severity} variant={state.variant}>
          {state.message}
        </Alert>
      </Snackbar>
    </NotificationsContext.Provider>
  )
}
