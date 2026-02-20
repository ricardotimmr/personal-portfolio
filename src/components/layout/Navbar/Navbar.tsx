import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

const navItems = [
  { label: 'HOME', to: '/' },
  { label: 'WORK', to: '/work' },
  { label: 'FREETIME', to: '/freetime' },
  { label: 'INFO', to: '/info' },
]

function Navbar() {
  const [isHidden, setIsHidden] = useState(false)
  const [isYearOverlayOpen, setIsYearOverlayOpen] = useState(false)
  const [activeIndicatorY, setActiveIndicatorY] = useState(0)
  const [hasActiveIndicator, setHasActiveIndicator] = useState(false)
  const previousScrollYRef = useRef(0)
  const menuRef = useRef<HTMLElement | null>(null)
  const location = useLocation()

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

          <nav className="site-navbar__menu" aria-label="Primary" ref={menuRef}>
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
                className={({ isActive }) =>
                  `nav-menu-link ${isActive ? 'is-active' : ''}`
                }
              >
                <span className="nav-menu-link__label nav-text-swap">
                  <span className="nav-text-swap__primary">{item.label}</span>
                  <span className="nav-text-swap__secondary" aria-hidden="true">
                    {item.label}
                  </span>
                </span>
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="site-navbar__year nav-text-swap"
            onClick={() => setIsYearOverlayOpen(true)}
            aria-label="Open introduction"
          >
            <span className="nav-text-swap__primary">[2026]</span>
            <span className="nav-text-swap__secondary" aria-hidden="true">
              [2026]
            </span>
          </button>
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
          aria-label="About Ricardo Timm"
          onClick={(event) => event.stopPropagation()}
        >
          <h2 className="site-year-overlay__title">PASSIONATE DESIGNER AND DEVELOPER</h2>
          <p className="site-year-overlay__text">
            Ricardo Timm is a designer and front-end developer focused on clean, intentional
            digital experiences. His work blends precise UI craft with motion and interaction that
            feel calm, structured, and human. With a detail-driven mindset shaped by endurance
            sports, he builds products that are consistent, refined, and built to last. This
            portfolio was designed and developed by Ricardo Timm.
          </p>
        </section>
      </div>
    </>
  )
}

export default Navbar
