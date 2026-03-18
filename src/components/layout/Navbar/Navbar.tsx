import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSiteLanguage } from '../../../context/LanguageContext'
import type { Theme } from '../../../hooks/useTheme'
import './Navbar.css'

const navItems = [
  {
    to: '/',
    label: { en: 'HOME', de: 'HOME' },
  },
  {
    to: '/work',
    label: { en: 'WORK', de: 'WORK' },
  },
  {
    to: '/freetime',
    label: { en: 'FREETIME', de: 'FREIZEIT' },
    isComingSoon: true,
  },
  {
    to: '/info',
    label: { en: 'INFO', de: 'INFO' },
  },
]

const navbarText = {
  en: {
    closeNavigationMenu: 'Close navigation menu',
    openNavigationMenu: 'Open navigation menu',
    primaryNavigation: 'Primary',
    comingSoon: 'COMING SOON!',
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode',
    openIntroduction: 'Open introduction',
    languageToggleAria: 'Site language',
    aboutDialogLabel: 'About Ricardo Timm',
    aboutTitle: 'PASSIONATE DESIGNER AND DEVELOPER',
    aboutBody:
      'Ricardo Timm is a designer and front-end developer focused on clean, intentional digital experiences. His work blends precise UI craft with motion and interaction that feel calm, structured, and human. With a detail-driven mindset shaped by endurance sports, he builds products that are consistent, refined, and built to last. This portfolio was designed and developed by Ricardo Timm.',
  },
  de: {
    closeNavigationMenu: 'Navigationsmenue schliessen',
    openNavigationMenu: 'Navigationsmenue oeffnen',
    primaryNavigation: 'Hauptnavigation',
    comingSoon: 'BALD VERFUEGBAR!',
    switchToDark: 'Zum dunklen Modus wechseln',
    switchToLight: 'Zum hellen Modus wechseln',
    openIntroduction: 'Einleitung oeffnen',
    languageToggleAria: 'Seitensprache',
    aboutDialogLabel: 'Ueber Ricardo Timm',
    aboutTitle: 'LEIDENSCHAFTLICHER DESIGNER UND ENTWICKLER',
    aboutBody:
      'Ricardo Timm ist Designer und Frontend-Entwickler mit Fokus auf klare, bewusst gestaltete digitale Erlebnisse. Seine Arbeit verbindet praezises UI-Handwerk mit Motion und Interaktion, die ruhig, strukturiert und menschlich wirken. Mit einem detailorientierten Mindset, gepraegt durch Ausdauersport, entwickelt er Produkte, die konsistent, hochwertig und nachhaltig sind. Dieses Portfolio wurde von Ricardo Timm gestaltet und entwickelt.',
  },
} as const

type NavbarProps = {
  theme: Theme
  onToggleTheme: () => void
}

function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const { language, setLanguage } = useSiteLanguage()
  const [isHidden, setIsHidden] = useState(false)
  const [isYearOverlayOpen, setIsYearOverlayOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)
  const [activeIndicatorY, setActiveIndicatorY] = useState(0)
  const [hasActiveIndicator, setHasActiveIndicator] = useState(false)
  const previousScrollYRef = useRef(0)
  const menuRef = useRef<HTMLElement | null>(null)
  const themeToggleRef = useRef<HTMLButtonElement | null>(null)
  const location = useLocation()
  const text = navbarText[language]

  useEffect(() => {
    previousScrollYRef.current = window.scrollY

    const onScroll = () => {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - previousScrollYRef.current

      if (currentScrollY <= 12) {
        setIsHidden(false)
      } else if (delta > 5) {
        setIsHidden(true)
      } else if (delta < -5) {
        setIsHidden(false)
      }

      previousScrollYRef.current = currentScrollY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const updateActiveIndicator = () => {
      const menu = menuRef.current
      if (!menu) {
        return
      }

      const activeLink = menu.querySelector('.nav-menu-link.is-active') as HTMLElement | null
      if (!activeLink) {
        setHasActiveIndicator(false)
        return
      }

      const nextY = activeLink.offsetTop + (activeLink.offsetHeight - 5) / 2
      setActiveIndicatorY(nextY)
      setHasActiveIndicator(true)
    }

    updateActiveIndicator()
    window.addEventListener('resize', updateActiveIndicator)

    return () => {
      window.removeEventListener('resize', updateActiveIndicator)
    }
  }, [location.pathname])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isYearOverlayOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsYearOverlayOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isYearOverlayOpen])

  useEffect(() => {
    let animationFrameId = 0
    let targetX = 0
    let targetY = 0

    const updatePupilOffset = () => {
      animationFrameId = 0
      const toggle = themeToggleRef.current
      if (!toggle) {
        return
      }

      const maxOffsetX = 2.2
      const maxOffsetY = 1.8
      const rect = toggle.getBoundingClientRect()
      const centerX = rect.left + rect.width * 0.5
      const centerY = rect.top + rect.height * 0.5
      const deltaX = targetX - centerX
      const deltaY = targetY - centerY
      const distance = Math.hypot(deltaX, deltaY) || 1
      const normalizedX = deltaX / distance
      const normalizedY = deltaY / distance

      toggle.style.setProperty('--theme-pupil-x', `${normalizedX * maxOffsetX}px`)
      toggle.style.setProperty('--theme-pupil-y', `${normalizedY * maxOffsetY}px`)
    }

    const onMouseMove = (event: MouseEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      if (!animationFrameId) {
        animationFrameId = window.requestAnimationFrame(updatePupilOffset)
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId)
      }
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  useEffect(() => {
    if (theme === 'dark') {
      return
    }

    let blinkTimeoutId = 0
    let pauseTimeoutId = 0
    let isFirstBlink = true

    const scheduleBlink = () => {
      const nextBlinkDelay = isFirstBlink ? 1400 + Math.random() * 1800 : 5200 + Math.random() * 6200
      isFirstBlink = false
      blinkTimeoutId = window.setTimeout(() => {
        setIsBlinking(true)
        pauseTimeoutId = window.setTimeout(() => {
          setIsBlinking(false)
          scheduleBlink()
        }, 170)
      }, nextBlinkDelay)
    }

    scheduleBlink()

    return () => {
      window.clearTimeout(blinkTimeoutId)
      window.clearTimeout(pauseTimeoutId)
    }
  }, [theme])

  return (
    <>
      <header className={`site-navbar ${isHidden ? 'is-hidden' : ''}`}>
        <div className="site-navbar__layout">
          <Link to="/" className="nav-brand nav-text-swap">
            <span className="nav-text-swap__primary">RICARDO TIMM</span>
            <span className="nav-text-swap__secondary" aria-hidden="true">
              RICARDO TIMM
            </span>
          </Link>

          <button
            type="button"
            className={`site-navbar__burger ${isMobileMenuOpen ? 'is-open' : ''}`}
            aria-label={isMobileMenuOpen ? text.closeNavigationMenu : text.openNavigationMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="site-navbar-menu"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            <span className="site-navbar__burger-line site-navbar__burger-line--top" />
            <span className="site-navbar__burger-line site-navbar__burger-line--bottom" />
          </button>

          <nav
            id="site-navbar-menu"
            className={`site-navbar__menu ${isMobileMenuOpen ? 'is-open' : ''}`}
            aria-label={text.primaryNavigation}
            ref={menuRef}
          >
            <span
              className={`site-navbar__active-indicator ${hasActiveIndicator ? 'is-visible' : ''}`}
              style={{ transform: `translateY(${activeIndicatorY}px)` }}
              aria-hidden="true"
            />
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={(event) => {
                  if (item.isComingSoon) {
                    event.preventDefault()
                    return
                  }
                  setIsMobileMenuOpen(false)
                }}
                onKeyDown={
                  item.isComingSoon
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                        }
                      }
                    : undefined
                }
                className={({ isActive }) =>
                  `nav-menu-link ${isActive ? 'is-active' : ''}${item.isComingSoon ? ' is-coming-soon' : ''}`
                }
                aria-disabled={item.isComingSoon ? true : undefined}
              >
                {item.isComingSoon ? (
                  <span className="nav-menu-link__coming-soon" aria-hidden="true">
                    {text.comingSoon}
                  </span>
                ) : null}
                <span className="nav-menu-link__label nav-text-swap">
                  <span className="nav-text-swap__primary">{item.label[language]}</span>
                  <span className="nav-text-swap__secondary" aria-hidden="true">
                    {item.label[language]}
                  </span>
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="site-navbar__actions">
            <div className="site-navbar__language-switch" role="group" aria-label={text.languageToggleAria}>
              <button
                type="button"
                className={`site-navbar__language-button ${language === 'en' ? 'is-active' : ''}`}
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
              >
                EN
              </button>
              <button
                type="button"
                className={`site-navbar__language-button ${language === 'de' ? 'is-active' : ''}`}
                onClick={() => setLanguage('de')}
                aria-pressed={language === 'de'}
              >
                DE
              </button>
            </div>

            <button
              type="button"
              className={`site-navbar__theme-toggle ${theme === 'light' && isBlinking ? 'is-blinking' : ''}`}
              onClick={onToggleTheme}
              ref={themeToggleRef}
              aria-label={theme === 'light' ? text.switchToDark : text.switchToLight}
              title={theme === 'light' ? text.switchToDark : text.switchToLight}
            >
              <span className="site-navbar__theme-eyes" aria-hidden="true">
                <span className="site-navbar__theme-eye">
                  <span className="site-navbar__theme-pupil" />
                </span>
                <span className="site-navbar__theme-eye">
                  <span className="site-navbar__theme-pupil" />
                </span>
              </span>
            </button>

            <button
              type="button"
              className="site-navbar__year nav-text-swap"
              onClick={() => setIsYearOverlayOpen(true)}
              aria-label={text.openIntroduction}
            >
              <span className="nav-text-swap__primary">[2026]</span>
              <span className="nav-text-swap__secondary" aria-hidden="true">
                [2026]
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`site-year-overlay ${isYearOverlayOpen ? 'is-open' : ''}`}
        onClick={() => setIsYearOverlayOpen(false)}
        aria-hidden={!isYearOverlayOpen}
      >
        <section
          className="site-year-overlay__panel"
          role="dialog"
          aria-modal="true"
          aria-label={text.aboutDialogLabel}
          onClick={(event) => event.stopPropagation()}
        >
          <h2 className="site-year-overlay__title">{text.aboutTitle}</h2>
          <p className="site-year-overlay__text">{text.aboutBody}</p>
        </section>
      </div>
    </>
  )
}

export default Navbar
