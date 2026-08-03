import { useMemo, useRef, useState } from 'react'

export default function PasswordInput({
  value,
  onChange,
  placeholder = '••••••••',
  minLength,
  required,
  autoComplete,
}) {
  const [reveal, setReveal] = useState(false)
  const inputRef = useRef(null)

  const display = useMemo(() => {
    const v = String(value || '')
    if (!v) return placeholder
    return reveal ? v : '•'.repeat(v.length)
  }, [value, reveal, placeholder])

  const isEmpty = !String(value || '').length

  return (
    <div
      style={{ position: 'relative' }}
      onMouseLeave={() => setReveal(false)}
    >
      <input
        ref={inputRef}
        className="input-field"
        type={reveal ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        minLength={minLength}
        required={required}
        autoComplete={autoComplete}
        spellCheck={false}
        // When hidden we mask via overlay; keep caret visible for editing.
        style={{ color: reveal ? '#16181d' : 'transparent', caretColor: '#16181d' }}
      />

      <span
        onMouseEnter={() => setReveal(true)}
        onPointerDown={(e) => {
          // Focus the real input on click/tap without revealing when the user clicks outside the dots.
          // If they're clicking the dots area, revealing is already true via hover (desktop).
          e.preventDefault()
          inputRef.current?.focus()
        }}
        style={{
          position: 'absolute',
          left: 14,
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'block',
          pointerEvents: reveal ? 'none' : 'auto',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: isEmpty ? '#8a8f98' : '#16181d',
          cursor: 'default',
          opacity: reveal ? 0 : 1,
        }}
        title={reveal && !isEmpty ? 'Password (revealed while hovering dots)' : undefined}
      >
        {display}
      </span>
    </div>
  )
}
