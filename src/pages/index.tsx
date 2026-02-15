import { ArrowRight } from 'lucide-react'
import GallerySection from '../components/GallerySection'
import { Link } from 'react-router-dom'

function IndexPage() {
  return (
    <main className="index-page">
      <section className="index-section section--hero" />
      <GallerySection />
      <section className="index-section section--expertise" />
      <footer className="index-section section--footer">
        <div className="footer-panel">
          <Link className="footer-cta-link" to="/info">
            <span>ReADy</span>
            <span>wHeN</span>
            <span>yOu</span>
            <span>Are</span>
          </Link>

          <p className="footer-meta footer-meta--left">[RICARDO TIMM]</p>
          <p className="footer-meta footer-meta--right">[© 2026]</p>

          <a
            className="footer-link footer-link--left"
            href="https://www.linkedin.com/in/ricardo-timm-1652811b0/"
            target="_blank"
            rel="noreferrer"
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
            rel="noreferrer"
          >
            <span className="footer-link-swap">
              <span className="footer-link-swap__primary">GITHUB</span>
              <span className="footer-link-swap__secondary" aria-hidden="true">
                GITHUB
              </span>
            </span>
            <ArrowRight className="footer-link__icon" size={32} />
          </a>
        </div>
      </footer>
    </main>
  )
}

export default IndexPage
