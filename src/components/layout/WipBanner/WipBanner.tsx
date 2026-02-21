import './WipBanner.css'

function WipBanner() {
  return (
    <aside className="wip-banner" role="status" aria-live="polite">
      <p className="wip-banner__text">WORK IN PROGRESS · PORTFOLIO IS CURRENTLY BEING REFINED</p>
    </aside>
  )
}

export default WipBanner
