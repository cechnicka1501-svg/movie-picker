/**
 * LegalScreen — reusable scrollable viewer for legal documents.
 *
 * Props:
 *   title    — string shown in the header
 *   content  — raw text string; lines starting with "## " render as section
 *              headings, double-newlines become paragraph breaks
 *   onBack   — called when the user taps the back arrow
 */
export function LegalScreen({ title, content, onBack }) {
  const blocks = parseContent(content)

  return (
    <div className="screen legal-screen">
      {/* Header */}
      <div className="legal-header">
        <button type="button" className="legal-header__back" onClick={onBack} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="legal-header__title">{title}</h1>
      </div>

      {/* Body */}
      <div className="legal-body">
        {blocks.map((block, i) =>
          block.type === 'heading' ? (
            <p key={i} className="legal-heading">{block.text}</p>
          ) : (
            <p key={i} className="legal-paragraph">{block.text}</p>
          )
        )}
      </div>
    </div>
  )
}

/**
 * Split raw content string into typed blocks for rendering.
 * Lines starting with "## " → heading block.
 * Runs of non-empty lines → paragraph block.
 * Empty lines are used as separators only.
 */
function parseContent(content) {
  const blocks = []
  const lines = content.split('\n')
  let buffer = []

  function flush() {
    const text = buffer.join(' ').trim()
    if (text) blocks.push({ type: 'paragraph', text })
    buffer = []
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (line.startsWith('## ')) {
      flush()
      blocks.push({ type: 'heading', text: line.slice(3) })
    } else if (line === '') {
      flush()
    } else {
      // Strip bold markdown (**text**) down to plain text for simplicity
      buffer.push(line.replace(/\*\*(.+?)\*\*/g, '$1'))
    }
  }
  flush()

  return blocks
}
