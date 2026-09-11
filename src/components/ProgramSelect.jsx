import { canonicalProgramName, DEFAULT_PROGRAMS } from '../lib/programs.js'

/**
 * Dropdown of programs (East Orange Public Library, CitySquash, …).
 * Always renders a <select>: it uses the list from the programs table when
 * that's loaded and falls back to DEFAULT_PROGRAMS otherwise, so students
 * never have to type a school name by hand. `value` is the program's name.
 */
export default function ProgramSelect({
  value,
  onChange,
  programs = [],
  loading = false,
  disabled = false,
  noneLabel = 'Select your program',
  className,
  style,
  id,
}) {
  const current = String(value || '')
  const list = programs.length > 0 ? programs : DEFAULT_PROGRAMS
  const canonical = canonicalProgramName(list, current)
  const known = list.some((p) => p.name === canonical)
  return (
    <select
      id={id}
      className={className}
      style={style}
      value={known ? canonical : (current ? '__legacy__' : '')}
      disabled={disabled || loading}
      onChange={(e) => onChange(e.target.value === '__legacy__' ? current : e.target.value)}
    >
      <option value="">{loading ? 'Loading programs…' : noneLabel}</option>
      {list.map((p) => (
        <option key={p.id || p.name} value={p.name}>{p.name}</option>
      ))}
      {current && !known && <option value="__legacy__">{current} (not a listed program)</option>}
    </select>
  )
}
