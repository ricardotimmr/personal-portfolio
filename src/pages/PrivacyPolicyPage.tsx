import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './LegalPages.css'

type PrivacyLocale = 'de' | 'en'

function PrivacyPolicyPage() {
  const [locale, setLocale] = useState<PrivacyLocale>('de')
  const isGerman = locale === 'de'

  return (
    <main className="legal-page">
      <div className="legal-page__content">
        <div className="legal-page__lang-toggle" role="group" aria-label="Sprachauswahl">
          <button
            type="button"
            className={`legal-page__lang-button ${isGerman ? 'is-active' : ''}`}
            onClick={() => setLocale('de')}
            aria-pressed={isGerman}
          >
            DE
          </button>
          <button
            type="button"
            className={`legal-page__lang-button ${!isGerman ? 'is-active' : ''}`}
            onClick={() => setLocale('en')}
            aria-pressed={!isGerman}
          >
            EN
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={locale}
            className="legal-page__locale-content"
            role="region"
            aria-live="polite"
            aria-label={isGerman ? 'Datenschutzerklärung auf Deutsch' : 'Privacy Policy in English'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {isGerman ? (
              <>
                <h1 className="legal-page__title">Datenschutzerklärung</h1>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">1. Allgemeine Hinweise</h2>
                  <p className="legal-page__text">
                    Diese Datenschutzerklärung informiert über Art, Umfang und Zweck der Verarbeitung
                    personenbezogener Daten auf dieser Website.
                  </p>
                  <p className="legal-page__text">
                    Verantwortlicher im Sinne der DSGVO:
                    <br />
                    Ricardo Timm
                    <br />
                    Hauptstraße 15
                    <br />
                    51674 Wiehl
                    <br />
                    Deutschland
                    <br />
                    E-Mail: ricardo.timmr@gmail.com
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">2. Hosting</h2>
                  <p className="legal-page__text">
                    Diese Website wird bei folgendem Anbieter gehostet:
                    <br />
                    Vercel Inc.
                    <br />
                    340 S Lemon Ave #4133
                    <br />
                    Walnut, CA 91789
                    <br />
                    USA
                  </p>
                  <p className="legal-page__text">
                    Beim Aufruf der Website erfasst der Hosting-Anbieter automatisch Informationen in sogenannten
                    Server-Logfiles. Dazu gehören insbesondere:
                  </p>
                  <ul className="legal-page__list">
                    <li className="legal-page__list-item">IP-Adresse</li>
                    <li className="legal-page__list-item">Datum und Uhrzeit des Zugriffs</li>
                    <li className="legal-page__list-item">Browsertyp und -version</li>
                    <li className="legal-page__list-item">Betriebssystem</li>
                    <li className="legal-page__list-item">Referrer-URL</li>
                  </ul>
                  <p className="legal-page__text">
                    Diese Daten dienen ausschließlich der technischen Bereitstellung und Sicherheit der Website.
                  </p>
                  <p className="legal-page__text">
                    Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherem Betrieb der
                    Website).
                  </p>
                  <p className="legal-page__text">
                    Es kann nicht ausgeschlossen werden, dass Daten in die USA übertragen werden.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">3. Google Fonts</h2>
                  <p className="legal-page__text">
                    Auf dieser Website werden Google Fonts verwendet, die von Google bereitgestellt werden.
                  </p>
                  <p className="legal-page__text">
                    Anbieter:
                    <br />
                    Google Ireland Limited
                    <br />
                    Gordon House, Barrow Street
                    <br />
                    Dublin 4, Irland
                  </p>
                  <p className="legal-page__text">
                    Beim Aufruf einer Seite lädt Ihr Browser die benötigten Schriftarten direkt von Google-Servern.
                    Dabei wird Ihre IP-Adresse an Google übermittelt.
                  </p>
                  <p className="legal-page__text">
                    Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer einheitlichen und
                    ansprechenden Darstellung).
                  </p>
                  <p className="legal-page__text">
                    Weitere Informationen:{' '}
                    <a className="legal-page__link" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                      https://policies.google.com/privacy
                    </a>
                  </p>
                  <p className="legal-page__text">
                    Hinweis: Um eine Übertragung personenbezogener Daten an Google zu vermeiden, können Schriftarten
                    lokal auf dem Server gehostet werden.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">4. Kontaktaufnahme per E-Mail</h2>
                  <p className="legal-page__text">
                    Wenn Sie mich per E-Mail kontaktieren, werden die übermittelten personenbezogenen Daten
                    (z. B. Name, E-Mail-Adresse, Nachricht) ausschließlich zur Bearbeitung Ihrer Anfrage verwendet.
                  </p>
                  <p className="legal-page__text">Eine Weitergabe an Dritte erfolgt nicht.</p>
                  <p className="legal-page__text">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">5. Externe Links</h2>
                  <p className="legal-page__text">
                    Diese Website enthält Links zu externen Plattformen wie GitHub oder LinkedIn. Beim Anklicken
                    dieser Links gelten die Datenschutzbestimmungen der jeweiligen Anbieter.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">6. Ihre Rechte</h2>
                  <p className="legal-page__text">Sie haben folgende Rechte gemäß DSGVO:</p>
                  <ul className="legal-page__list">
                    <li className="legal-page__list-item">Recht auf Auskunft (Art. 15 DSGVO)</li>
                    <li className="legal-page__list-item">Recht auf Berichtigung (Art. 16 DSGVO)</li>
                    <li className="legal-page__list-item">Recht auf Löschung (Art. 17 DSGVO)</li>
                    <li className="legal-page__list-item">Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                    <li className="legal-page__list-item">Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                    <li className="legal-page__list-item">Recht auf Widerspruch (Art. 21 DSGVO)</li>
                  </ul>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">7. Beschwerderecht</h2>
                  <p className="legal-page__text">
                    Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren.
                  </p>
                  <p className="legal-page__text">
                    Zuständig für Nordrhein-Westfalen:
                    <br />
                    Landesbeauftragte für Datenschutz und Informationsfreiheit NRW
                    <br />
                    Kavalleriestr. 2-4
                    <br />
                    40213 Düsseldorf
                    <br />
                    <a className="legal-page__link" href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer">
                      https://www.ldi.nrw.de
                    </a>
                  </p>
                </section>
              </>
            ) : (
              <>
                <h1 className="legal-page__title">Privacy Policy</h1>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">1. General Information</h2>
                  <p className="legal-page__text">
                    This privacy policy explains the type, scope, and purpose of processing personal data on this
                    website.
                  </p>
                  <p className="legal-page__text">
                    Controller under GDPR:
                    <br />
                    Ricardo Timm
                    <br />
                    Hauptstraße 15
                    <br />
                    51674 Wiel
                    <br />
                    Germany
                    <br />
                    Email: ricardo.timmr@gmail.com
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">2. Hosting</h2>
                  <p className="legal-page__text">
                    This website is hosted by:
                    <br />
                    Vercel Inc.
                    <br />
                    340 S Lemon Ave #4133
                    <br />
                    Walnut, CA 91789
                    <br />
                    USA
                  </p>
                  <p className="legal-page__text">
                    When accessing the site, the hosting provider automatically collects information in server log
                    files, including:
                  </p>
                  <ul className="legal-page__list">
                    <li className="legal-page__list-item">IP address</li>
                    <li className="legal-page__list-item">Date and time of access</li>
                    <li className="legal-page__list-item">Browser type and version</li>
                    <li className="legal-page__list-item">Operating system</li>
                    <li className="legal-page__list-item">Referrer URL</li>
                  </ul>
                  <p className="legal-page__text">
                    These data are used solely for technical delivery and website security.
                  </p>
                  <p className="legal-page__text">
                    Legal basis: Art. 6 para. 1 lit. f GDPR (legitimate interest in secure operation of the website).
                  </p>
                  <p className="legal-page__text">Data transfer to the USA cannot be ruled out.</p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">3. Google Fonts</h2>
                  <p className="legal-page__text">
                    This website uses Google Fonts provided by Google.
                  </p>
                  <p className="legal-page__text">
                    Provider:
                    <br />
                    Google Ireland Limited
                    <br />
                    Gordon House, Barrow Street
                    <br />
                    Dublin 4, Ireland
                  </p>
                  <p className="legal-page__text">
                    When opening a page, your browser loads required fonts directly from Google servers. In that
                    process, your IP address is transmitted to Google.
                  </p>
                  <p className="legal-page__text">
                    Legal basis: Art. 6 para. 1 lit. f GDPR (legitimate interest in consistent and appealing
                    presentation).
                  </p>
                  <p className="legal-page__text">
                    More information:{' '}
                    <a className="legal-page__link" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                      https://policies.google.com/privacy
                    </a>
                  </p>
                  <p className="legal-page__text">
                    Note: To avoid transmission of personal data to Google, fonts can be hosted locally on the server.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">4. Contact via Email</h2>
                  <p className="legal-page__text">
                    If you contact me by email, transmitted personal data (e.g., name, email address, message) are
                    used exclusively to process your request.
                  </p>
                  <p className="legal-page__text">No data are shared with third parties.</p>
                  <p className="legal-page__text">Legal basis: Art. 6 para. 1 lit. b GDPR.</p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">5. External Links</h2>
                  <p className="legal-page__text">
                    This website contains links to external platforms such as GitHub or LinkedIn. Their privacy
                    policies apply when those links are opened.
                  </p>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">6. Your Rights</h2>
                  <p className="legal-page__text">You have the following rights under GDPR:</p>
                  <ul className="legal-page__list">
                    <li className="legal-page__list-item">Right of access (Art. 15 GDPR)</li>
                    <li className="legal-page__list-item">Right to rectification (Art. 16 GDPR)</li>
                    <li className="legal-page__list-item">Right to erasure (Art. 17 GDPR)</li>
                    <li className="legal-page__list-item">Right to restriction of processing (Art. 18 GDPR)</li>
                    <li className="legal-page__list-item">Right to data portability (Art. 20 GDPR)</li>
                    <li className="legal-page__list-item">Right to object (Art. 21 GDPR)</li>
                  </ul>
                </section>

                <section className="legal-page__section">
                  <h2 className="legal-page__heading">7. Right to Lodge a Complaint</h2>
                  <p className="legal-page__text">
                    You have the right to lodge a complaint with a data protection supervisory authority.
                  </p>
                  <p className="legal-page__text">
                    Competent authority for North Rhine-Westphalia:
                    <br />
                    State Commissioner for Data Protection and Freedom of Information NRW
                    <br />
                    Kavalleriestr. 2-4
                    <br />
                    40213 Dusseldorf
                    <br />
                    <a className="legal-page__link" href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer">
                      https://www.ldi.nrw.de
                    </a>
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
