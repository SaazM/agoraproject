import { supabase } from './supabase.js'

export const NO_PROGRAM = ''

/**
 * The programs Agora serves today. Used as the dropdown's options whenever the
 * programs table hasn't been loaded (or the schema hasn't been run yet); the
 * names must match the seed rows in supabase-schema.sql exactly.
 */
export const DEFAULT_PROGRAMS = [
  { id: 'east-orange-public-library', name: 'East Orange Public Library' },
  { id: 'citysquash', name: 'CitySquash' },
]

/**
 * Programs are the unit tutors are scoped to (one tutor login sees exactly one
 * program's students; the admin sees every program). The list lives in the
 * public.programs table and is readable without signing in so the signup form
 * can offer it as a dropdown.
 *
 * Resolves to { programs: [{ id, name }], available } where `available` is
 * false when the table doesn't exist yet (schema not run); ProgramSelect then
 * falls back to DEFAULT_PROGRAMS so the dropdown still works.
 */
export async function fetchPrograms() {
  if (!supabase) return { programs: [], available: false }
  try {
    const { data, error } = await supabase.from('programs').select('id,name').order('name', { ascending: true })
    if (error) return { programs: [], available: false }
    const programs = (data || [])
      .map((p) => ({ id: p.id, name: String(p.name || '').trim() }))
      .filter((p) => p.name)
    return { programs, available: true }
  } catch {
    return { programs: [], available: false }
  }
}

/** Case/whitespace-insensitive lookup of the canonical program name. */
export function canonicalProgramName(programs, raw) {
  const key = String(raw || '').trim().toLowerCase()
  if (!key) return ''
  const hit = (programs || []).find((p) => p.name.trim().toLowerCase() === key)
  return hit ? hit.name : String(raw || '').trim()
}
