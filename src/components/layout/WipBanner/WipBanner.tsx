import { useSiteLanguage } from '../../../context/LanguageContext'
import './WipBanner.css'

function WipBanner() {
  const { language } = useSiteLanguage()

  return (
    <aside className="wip-banner" role="status" aria-live="polite">
      <p className="wip-banner__text">
        {language === 'de'
          ? 'WORK IN PROGRESS · PORTFOLIO WIRD AKTUELL VERFEINERT'
          : 'WORK IN PROGRESS · PORTFOLIO IS CURRENTLY BEING REFINED'}
      </p>
    </aside>
  )
}

export default WipBanner
