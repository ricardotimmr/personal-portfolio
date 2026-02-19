import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../components/layout/SiteFooter/SiteFooter'
import GallerySection from '../components/sections/GallerySection/GallerySection'
import personalPic from '../assets/images/personalpicSW-optimized.jpg'

function IndexPage() {
  const heroSectionRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    let rafId: number | null = null

    const updateHeroParallax = () => {
      rafId = null

      const hero = heroSectionRef.current
      if (!hero) {
        return
      }

      const rect = hero.getBoundingClientRect()
      const heroHeight = rect.height || 1
      const progress = Math.min(1, Math.max(0, -rect.top / heroHeight))

      const maxOffsetPx = (window.innerHeight || 1) * 0.22
      const parallaxOffset = -progress * maxOffsetPx
      hero.style.setProperty('--hero-parallax-y', `${parallaxOffset.toFixed(2)}px`)
    }

    const requestParallaxUpdate = () => {
      if (rafId !== null) {
        return
      }

      rafId = window.requestAnimationFrame(updateHeroParallax)
    }

    requestParallaxUpdate()
    window.addEventListener('scroll', requestParallaxUpdate, { passive: true })
    window.addEventListener('resize', requestParallaxUpdate)

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      window.removeEventListener('scroll', requestParallaxUpdate)
      window.removeEventListener('resize', requestParallaxUpdate)
    }
  }, [])

  return (
    <main className="index-page">
      <section ref={heroSectionRef} className="index-section section--hero" />
      <GallerySection />
      <section className="index-section section--expertise">
        <div className="expertise-layout">
          <div className="expertise-left">
            <img className="expertise-photo" src={personalPic} alt="Ricardo Timm portrait" />

            <div className="expertise-content">
              <h2 className="expertise-title">
                <span className="expertise-title__line">
                  <span>ENDURANCE IN </span>
                  <span className="expertise-title__motion">mOTIoN</span>
                </span>
                <span className="expertise-title__line">PRECISION OVER NOISE</span>
              </h2>

              <div className="expertise-copy">
                <p>
                  Design, to me, is endurance. It&apos;s the discipline of refining small details
                  until they disappear into something effortless. I build interfaces where emotion
                  and function move together — precise, purposeful, and quietly impactful.
                </p>
                <p>
                  Whether in code or on the road, I&apos;m drawn to progress measured in consistency.
                  Triathlon taught me that meaningful results aren&apos;t loud. They&apos;re built step
                  by step — and felt long after the moment has passed.
                </p>
              </div>

              <Link className="expertise-cta" to="/info">
                <span className="expertise-cta__swap">
                  <span className="expertise-cta__primary">MY STORY</span>
                  <span className="expertise-cta__secondary" aria-hidden="true">
                    MY STORY
                  </span>
                </span>
              </Link>
            </div>
          </div>
          <div className="expertise-right">
            <p className="expertise-services-label">[EXPERTISE &amp; SERVICES]</p>

            <div className="expertise-services-list">
              <p className="expertise-services-item">
                <span className="expertise-services-swap">
                  <span className="expertise-services-swap__primary">FRONTEND DEVELOPMENT</span>
                  <span className="expertise-services-swap__secondary" aria-hidden="true">
                    FRONTEND DEVELOPMENT
                  </span>
                </span>
              </p>
              <p className="expertise-services-item">
                <span className="expertise-services-swap">
                  <span className="expertise-services-swap__primary">UI &amp; VISUAL DESIGN</span>
                  <span className="expertise-services-swap__secondary" aria-hidden="true">
                    UI &amp; VISUAL DESIGN
                  </span>
                </span>
              </p>
              <p className="expertise-services-item">
                <span className="expertise-services-swap">
                  <span className="expertise-services-swap__primary">USER EXPERIENCE DESIGN</span>
                  <span className="expertise-services-swap__secondary" aria-hidden="true">
                    USER EXPERIENCE DESIGN
                  </span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

export default IndexPage
