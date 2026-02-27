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
                <h1 className="legal-page__title">Legal Notice (Draft)</h1>
                <p className="legal-page__updated">Status: Draft template - legal review required before publishing</p>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Required Publisher Information</h2>
                  <p className="legal-page__text">
                    TODO: Add legally valid publisher details required for your legal setup.
                    Do not publish fake, incomplete, or placeholder legal identity details.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Address and Contact</h2>
                  <p className="legal-page__text">
                    TODO: Add a legally serviceable address (if required in your jurisdiction) and
                    valid contact channel(s).
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Editorial Responsibility</h2>
                  <p className="legal-page__text">
                    TODO: Add responsible person details for editorial content if applicable.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Regulatory and Tax Information</h2>
                  <p className="legal-page__text">
                    TODO: Add VAT/tax or professional-regulatory information only if actually required
                    for your situation.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Dispute Resolution</h2>
                  <p className="legal-page__text">
                    TODO: Add your final position on participation in consumer dispute resolution,
                    if legally required.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Liability and Copyright</h2>
                  <p className="legal-page__text">
                    TODO: Add your final, legally reviewed liability and copyright notice text.
                  </p>
                </section>
              </>
            ) : (
              <>
                <h1 className="legal-page__title">Impressum (Entwurf)</h1>
                <p className="legal-page__updated">Status: Entwurfsvorlage - rechtliche Prüfung vor Veröffentlichung erforderlich</p>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Pflichtangaben Anbieterkennzeichnung</h2>
                  <p className="legal-page__text">
                    TODO: Rechtlich erforderliche Anbieterangaben entsprechend Ihrer konkreten
                    Situation ergänzen. Keine unvollständigen oder falschen Rechtsangaben veröffentlichen.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Anschrift und Kontakt</h2>
                  <p className="legal-page__text">
                    TODO: Ladungsfähige Anschrift (falls erforderlich) und valide Kontaktkanäle ergänzen.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Verantwortlichkeit für redaktionelle Inhalte</h2>
                  <p className="legal-page__text">
                    TODO: Verantwortliche Person für redaktionelle Inhalte ergänzen, sofern anwendbar.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Steuer- und Regulierungsangaben</h2>
                  <p className="legal-page__text">
                    TODO: Umsatzsteuer-/Berufsregulierungsangaben nur dann ergänzen, wenn für Ihre
                    tatsächliche Situation verpflichtend.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Streitbeilegung</h2>
                  <p className="legal-page__text">
                    TODO: Endgültige Angabe zur Teilnahme/Nichtteilnahme an
                    Verbraucherstreitbeilegungsverfahren ergänzen, falls erforderlich.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Haftung und Urheberrecht</h2>
                  <p className="legal-page__text">
                    TODO: Finalen, rechtlich geprüften Haftungs- und Urheberrechtstext ergänzen.
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
