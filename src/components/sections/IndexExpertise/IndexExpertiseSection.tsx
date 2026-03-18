import { Link } from 'react-router-dom'
import personalPic from '../../../assets/images/personalpicSW-optimized.jpg'
import { useSiteLanguage } from '../../../context/LanguageContext'

const expertiseText = {
  en: {
    portraitAlt: 'Ricardo Timm portrait',
    titleLineOneA: 'ENDURANCE IN ',
    titleLineOneB: 'mOTIoN',
    titleLineTwo: 'PRECISION OVER NOISE',
    paragraphOne:
      "Design, to me, is endurance. It's the discipline of refining small details until they disappear into something effortless. I build interfaces where emotion and function move together - precise, purposeful, and quietly impactful.",
    paragraphTwo:
      "Whether in code or on the road, I'm drawn to progress measured in consistency. Triathlon taught me that meaningful results aren't loud. They're built step by step - and felt long after the moment has passed.",
    cta: 'MY STORY',
    servicesLabel: '[EXPERTISE & SERVICES]',
    serviceOne: 'FRONTEND DEVELOPMENT',
    serviceTwo: 'UI & VISUAL DESIGN',
    serviceThree: 'USER EXPERIENCE DESIGN',
  },
  de: {
    portraitAlt: 'Portraet von Ricardo Timm',
    titleLineOneA: 'AUSDAUER IN ',
    titleLineOneB: 'bEwEGUnG',
    titleLineTwo: 'PRAEZISION STATT RAUSCHEN',
    paragraphOne:
      'Design ist fuer mich Ausdauer. Es ist die Disziplin, kleine Details so lange zu verfeinern, bis sie selbstverstaendlich wirken. Ich entwickle Interfaces, in denen Emotion und Funktion zusammenlaufen - praezise, zielgerichtet und ruhig wirksam.',
    paragraphTwo:
      'Ob im Code oder auf der Strecke: Mich motiviert Fortschritt, der aus Konstanz entsteht. Der Triathlon hat mich gelehrt, dass echte Ergebnisse nicht laut sind. Sie entstehen Schritt fuer Schritt - und wirken lange nach dem Moment.',
    cta: 'MEIN WEG',
    servicesLabel: '[EXPERTISE & LEISTUNGEN]',
    serviceOne: 'FRONTEND-ENTWICKLUNG',
    serviceTwo: 'UI- & VISUAL DESIGN',
    serviceThree: 'USER EXPERIENCE DESIGN',
  },
} as const

function IndexExpertiseSection() {
  const { language } = useSiteLanguage()
  const text = expertiseText[language]

  return (
    <section className="index-section section--expertise">
      <div className="expertise-layout">
        <div className="expertise-left">
          <img className="expertise-photo" src={personalPic} alt={text.portraitAlt} />

          <div className="expertise-content">
            <h2 className="expertise-title">
              <span className="expertise-title__line">
                <span>{text.titleLineOneA}</span>
                <span className="expertise-title__motion">{text.titleLineOneB}</span>
              </span>
              <span className="expertise-title__line">{text.titleLineTwo}</span>
            </h2>

            <div className="expertise-copy">
              <p>{text.paragraphOne}</p>
              <p>{text.paragraphTwo}</p>
            </div>

            <Link className="expertise-cta" to="/info">
              <span className="expertise-cta__swap">
                <span className="expertise-cta__primary">{text.cta}</span>
                <span className="expertise-cta__secondary" aria-hidden="true">
                  {text.cta}
                </span>
              </span>
            </Link>
          </div>
        </div>
        <div className="expertise-right">
          <p className="expertise-services-label">{text.servicesLabel}</p>

          <div className="expertise-services-list">
            <p className="expertise-services-item">
              <span className="expertise-services-swap">
                <span className="expertise-services-swap__primary">{text.serviceOne}</span>
                <span className="expertise-services-swap__secondary" aria-hidden="true">
                  {text.serviceOne}
                </span>
              </span>
            </p>
            <p className="expertise-services-item">
              <span className="expertise-services-swap">
                <span className="expertise-services-swap__primary">{text.serviceTwo}</span>
                <span className="expertise-services-swap__secondary" aria-hidden="true">
                  {text.serviceTwo}
                </span>
              </span>
            </p>
            <p className="expertise-services-item">
              <span className="expertise-services-swap">
                <span className="expertise-services-swap__primary">{text.serviceThree}</span>
                <span className="expertise-services-swap__secondary" aria-hidden="true">
                  {text.serviceThree}
                </span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default IndexExpertiseSection
