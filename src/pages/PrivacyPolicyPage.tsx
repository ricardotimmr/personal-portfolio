import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './LegalPages.css'

type PrivacyLocale = 'en' | 'de'

function PrivacyPolicyPage() {
  const [locale, setLocale] = useState<PrivacyLocale>('en')
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
            aria-label={isEnglish ? 'Privacy policy in English' : 'Datenschutzerklärung auf Deutsch'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {isEnglish ? (
              <>
                <h1 className="legal-page__title">Privacy Policy (Draft)</h1>
                <p className="legal-page__updated">Status: Draft template - legal review required before publishing</p>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Controller</h2>
                  <p className="legal-page__text">
                    TODO: Add your legally valid controller details (name/business identity and contact channel).
                    Do not publish placeholder or incorrect legal information.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Scope of Processing</h2>
                  <p className="legal-page__text">
                    This portfolio may process personal data when technically required for website delivery,
                    when users contact you, and if optional features are enabled (e.g. contact forms,
                    analytics, consent tools, media embeds).
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Hosting and Server Logs</h2>
                  <p className="legal-page__text">
                    TODO: Add your actual hosting provider and the exact log categories retained.
                    Include retention period and legal basis verified for your setup.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Contact Requests</h2>
                  <p className="legal-page__text">
                    If users contact you (email, LinkedIn, form), data is processed to handle requests.
                    TODO: Define storage period and legal basis matching your workflow.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Cookies and Similar Technologies</h2>
                  <p className="legal-page__text">
                    This website should only set non-essential cookies/trackers after consent.
                    TODO: Document all active cookies/tools and consent mechanism once implemented.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Your Rights</h2>
                  <ul className="legal-page__list">
                    <li className="legal-page__list-item">Access, rectification, erasure, restriction, portability, objection</li>
                    <li className="legal-page__list-item">Withdrawal of consent for future processing</li>
                    <li className="legal-page__list-item">Complaint to a supervisory authority</li>
                  </ul>
                  <p className="legal-page__text">
                    TODO: Add the correct supervisory authority reference for your legal setup.
                  </p>
                </section>
              </>
            ) : (
              <>
                <h1 className="legal-page__title">Datenschutzerklärung (Entwurf)</h1>
                <p className="legal-page__updated">Status: Entwurfsvorlage - rechtliche Prüfung vor Veröffentlichung erforderlich</p>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Verantwortlicher</h2>
                  <p className="legal-page__text">
                    TODO: Rechtlich korrekte Angaben zum Verantwortlichen ergänzen (Name/Unternehmensidentität
                    und Kontaktkanal). Keine Platzhalter oder falschen Rechtsangaben veröffentlichen.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Umfang der Verarbeitung</h2>
                  <p className="legal-page__text">
                    Dieses Portfolio kann personenbezogene Daten verarbeiten, soweit dies technisch für den
                    Betrieb erforderlich ist, bei Kontaktaufnahme durch Nutzer oder bei aktivierten Zusatzfunktionen
                    (z. B. Kontaktformular, Analyse-Tools, Consent-Tool, externe Einbettungen).
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Hosting und Server-Logs</h2>
                  <p className="legal-page__text">
                    TODO: Tatsächlichen Hosting-Anbieter, konkrete Logdaten, Aufbewahrungsdauer und Rechtsgrundlage
                    entsprechend der realen Konfiguration ergänzen.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Kontaktanfragen</h2>
                  <p className="legal-page__text">
                    Bei Kontaktaufnahme (E-Mail, LinkedIn, Formular) werden Daten zur Bearbeitung verarbeitet.
                    TODO: Speicherdauer und Rechtsgrundlage passend zum tatsächlichen Ablauf festlegen.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Cookies und ähnliche Technologien</h2>
                  <p className="legal-page__text">
                    Nicht technisch erforderliche Cookies/Tracker sollten nur nach Einwilligung gesetzt werden.
                    TODO: Alle tatsächlich eingesetzten Cookies/Tools inkl. Consent-Mechanismus dokumentieren.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">Ihre Rechte</h2>
                  <ul className="legal-page__list">
                    <li className="legal-page__list-item">Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit, Widerspruch</li>
                    <li className="legal-page__list-item">Widerruf erteilter Einwilligungen für die Zukunft</li>
                    <li className="legal-page__list-item">Beschwerde bei einer Aufsichtsbehörde</li>
                  </ul>
                  <p className="legal-page__text">
                    TODO: Zuständige Aufsichtsbehörde korrekt entsprechend Ihrer rechtlichen Situation ergänzen.
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

export default PrivacyPolicyPage
