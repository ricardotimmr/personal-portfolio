import { useEffect, useState, type FormEvent } from 'react'
import { ArrowRight, ArrowUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import './SiteFooter.css'

function SiteFooter() {
  const [isContactOverlayOpen, setIsContactOverlayOpen] = useState(false)

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!isContactOverlayOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsContactOverlayOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isContactOverlayOpen])

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsContactOverlayOpen(false)
  }

  return (
    <>
      <footer className="footer-section section--footer">
        <div className="footer-panel">
          <button type="button" className="footer-cta-link" onClick={() => setIsContactOverlayOpen(true)}>
            <span>ReADy</span>
            <span>wHeN</span>
            <span>yOu</span>
            <span>Are</span>
          </button>

          <p className="footer-meta footer-meta--left">[RICARDO TIMM]</p>
          <p className="footer-meta footer-meta--right">[© 2026]</p>

          <a
            className="footer-link footer-link--left"
            href="https://www.linkedin.com/in/ricardo-timm-1652811b0/"
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
          >
            <span className="footer-link-swap">
              <span className="footer-link-swap__primary">LINKEDIN</span>
              <span className="footer-link-swap__secondary" aria-hidden="true">
                LINKEDIN
              </span>
            </span>
            <ArrowRight className="footer-link__icon" size={32} />
          </a>

          <a
            className="footer-link footer-link--right"
            href="https://github.com/ricardotimmr"
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
          >
            <span className="footer-link-swap">
              <span className="footer-link-swap__primary">GITHUB</span>
              <span className="footer-link-swap__secondary" aria-hidden="true">
                GITHUB
              </span>
            </span>
            <ArrowRight className="footer-link__icon" size={32} />
          </a>

          <nav className="footer-legal" aria-label="Legal">
            <Link className="footer-legal__link" to="/privacy-policy">
              Datenschutz
            </Link>
            <span className="footer-legal__divider" aria-hidden="true">
              ·
            </span>
            <Link className="footer-legal__link" to="/legal-notice">
              Impressum
            </Link>
          </nav>

          <button
            className="footer-scroll-top"
            type="button"
            onClick={handleScrollToTop}
            aria-label="Scroll to top"
          >
            <ArrowUp size={32} />
          </button>
        </div>
      </footer>

      <div
        className={`footer-contact-overlay ${isContactOverlayOpen ? 'is-open' : ''}`}
        onClick={() => setIsContactOverlayOpen(false)}
        aria-hidden={!isContactOverlayOpen}
      >
        <section
          className="footer-contact-overlay__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Contact Ricardo Timm"
          onClick={(event) => event.stopPropagation()}
        >
          <h2 className="footer-contact-overlay__title">GET IN TOUCH</h2>
          <form className="footer-contact-form" onSubmit={handleContactSubmit}>
            <label className="footer-contact-form__label" htmlFor="footer-contact-name">
              NAME
            </label>
            <input
              id="footer-contact-name"
              name="name"
              className="footer-contact-form__field"
              type="text"
              autoComplete="name"
              required
            />

            <label className="footer-contact-form__label" htmlFor="footer-contact-email">
              EMAIL
            </label>
            <input
              id="footer-contact-email"
              name="email"
              className="footer-contact-form__field"
              type="email"
              autoComplete="email"
              required
            />

            <label className="footer-contact-form__label" htmlFor="footer-contact-message">
              MESSAGE
            </label>
            <textarea
              id="footer-contact-message"
              name="message"
              className="footer-contact-form__field footer-contact-form__field--message"
              required
            />

            <div className="footer-contact-form__actions">
              <button type="submit" className="footer-contact-form__button">
                SEND MESSAGE
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}

export default SiteFooter
