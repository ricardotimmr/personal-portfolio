import { useRef } from 'react'
import SiteFooter from '../components/layout/SiteFooter/SiteFooter'
import GallerySection from '../components/sections/GallerySection/GallerySection'
import IndexExpertiseSection from '../components/sections/IndexExpertise/IndexExpertiseSection'
import { useHeroParallax } from '../hooks/useHeroParallax'
import './IndexPage.css'

function IndexPage() {
  const heroSectionRef = useRef<HTMLElement | null>(null)

  useHeroParallax(heroSectionRef, 0.22)

  return (
    <main className="index-page">
      <section ref={heroSectionRef} className="index-section section--hero" />
      <GallerySection />
      <IndexExpertiseSection />
      <SiteFooter />
    </main>
  )
}

export default IndexPage
