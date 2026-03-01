import { type SyntheticEvent } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../../stores/appStore'
import i18n from '../../../i18n/config'
import styles from './AppHeader.module.scss'

const TABS = [
  { key: 'tab_converter', path: '/' },
  { key: 'tab_calibration', path: '/calibration' },
  { key: 'tab_extractor', path: '/extractor' },
  { key: 'tab_advanced', path: '/advanced' },
  { key: 'tab_merge', path: '/merge' },
  { key: 'tab_settings', path: '/settings' },
] as const

const AppHeader: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { isDark, toggleTheme, lang, setLang } = useAppStore()

  const activeTab = TABS.findIndex((tab) => tab.path === pathname)

  const handleTabChange = (_: SyntheticEvent, idx: number) => {
    navigate({ to: TABS[idx].path })
  }

  const handleLangToggle = () => {
    const next = lang === 'zh' ? 'en' : 'zh'
    setLang(next)
    i18n.changeLanguage(next)
  }

  return (
    <AppBar position="sticky" className={styles.appBar} elevation={1}>
      <Toolbar className={styles.toolbar} disableGutters>
        <Typography variant="h6" className={styles.logo} noWrap>
          {t('app_title')}
        </Typography>

        <Tabs
          value={activeTab === -1 ? 0 : activeTab}
          onChange={handleTabChange}
          className={styles.tabs}
          textColor="inherit"
          indicatorColor="secondary"
        >
          {TABS.map((tab) => (
            <Tab key={tab.path} label={t(tab.key)} className={styles.tab} />
          ))}
        </Tabs>

        <div className={styles.actions}>
          <IconButton
            onClick={handleLangToggle}
            size="small"
            color="inherit"
            title={lang === 'zh' ? t('lang_btn_en') : t('lang_btn_zh')}
            className={styles.langBtn}
          >
            <Typography variant="caption" className={styles.langLabel}>
              {lang === 'zh' ? 'EN' : '中'}
            </Typography>
          </IconButton>

          <IconButton
            onClick={toggleTheme}
            size="small"
            color="inherit"
            title={isDark ? t('theme_toggle_day') : t('theme_toggle_night')}
          >
            {isDark ? (
              <Brightness7Icon fontSize="small" />
            ) : (
              <Brightness4Icon fontSize="small" />
            )}
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  )
}

export { AppHeader }
