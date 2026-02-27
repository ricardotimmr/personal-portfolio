import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './LegalPages.css'

type LegalNoticeLocale = 'en' | 'de'

function LegalNoticePage() {
  const [locale, setLocale] = useState<LegalNoticeLocale>('en')
  const isEnglish = locale === 'en'

  return (
    <main className="legal-page">
      <div className="legal-page__content">
        <div className="legal-page__lang-toggle" role="group" aria-label="Language selection">
          <button
            type="button"
            className={`legal-page__lang-button ${isEnglish ? 'is-active' : ''}`}
            onClick={() => setLocale('en')}
            aria-pressed={isEnglish}
          >
            EN
          </button>
          <button
            type="button"
            className={`legal-page__lang-button ${!isEnglish ? 'is-active' : ''}`}
            onClick={() => setLocale('de')}
            aria-pressed={!isEnglish}
          >
            DE
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={locale}
            className="legal-page__locale-content"
            role="region"
            aria-live="polite"
            aria-label={isEnglish ? 'Legal notice in English' : 'Impressum auf Deutsch'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {isEnglish ? (
              <>
                <h1 className="legal-page__title">Legal Notice</h1>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Information according to Section 5 TMG</h2>
                  <p className="legal-page__text">
                    Ricardo Timm
                    <br />
                    Hauptstraße 15
                    <br />
                    51674 Wiehl
                    <br />
                    Germany
                  </p>
                  <p className="legal-page__text">
                    E-Mail: ricardo.timmr@gmail.com
                    <br />
                    Website: https://ricardo-timm.com
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Responsible for Content under Section 55 para. 2 RStV</h2>
                  <p className="legal-page__text">
                    Ricardo Timm
                    <br />
                    Address as above
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Liability for Content</h2>
                  <p className="legal-page__text">
                    As a service provider, I am responsible for my own content on these pages in accordance with
                    Section 7 para. 1 TMG and general laws.
                  </p>
                  <p className="legal-page__text">
                    According to Sections 8 to 10 TMG, however, I am not obliged to monitor transmitted or stored
                    third-party information.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Liability for Links</h2>
                  <p className="legal-page__text">
                    This website contains links to external third-party websites (e.g. GitHub, LinkedIn).
                  </p>
                  <p className="legal-page__text">
                    The respective provider or operator is always responsible for the content of linked pages.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Copyright</h2>
                  <p className="legal-page__text">
                    The content and works created by the site operator on these pages are subject to German copyright
                    law.
                  </p>
                  <p className="legal-page__text">
                    Reproduction or use requires the written consent of the respective author.
                  </p>
                </section>
              </>
            ) : (
              <>
                <h1 className="legal-page__title">Impressum</h1>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Angaben gemäß § 5 TMG</h2>
                  <p className="legal-page__text">
                    Ricardo Timm
                    <br />
                    Hauptstraße 15
                    <br />
                    51674 Wiehl
                    <br />
                    Deutschland
                  </p>
                  <p className="legal-page__text">
                    E-Mail: ricardo.timmr@gmail.com
                    <br />
                    Website: https://ricardo-timm.com
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
                  <p className="legal-page__text">
                    Ricardo Timm
                    <br />
                    Anschrift wie oben
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Haftung für Inhalte</h2>
                  <p className="legal-page__text">
                    Als Diensteanbieter bin ich gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
                    allgemeinen Gesetzen verantwortlich.
                  </p>
                  <p className="legal-page__text">
                    Nach §§ 8 bis 10 TMG bin ich jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                    Informationen zu überwachen.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Haftung für Links</h2>
                  <p className="legal-page__text">
                    Diese Website enthält Links zu externen Websites Dritter (z. B. GitHub, LinkedIn).
                  </p>
                  <p className="legal-page__text">
                    Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
                    verantwortlich.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Urheberrecht</h2>
                  <p className="legal-page__text">
                    Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
                    deutschen Urheberrecht.
                  </p>
                  <p className="legal-page__text">
                    Eine Vervielfältigung oder Verwendung bedarf der schriftlichen Zustimmung des jeweiligen Autors.
                  </p>
                </section>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}

export default LegalNoticePage
