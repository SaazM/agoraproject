import { useEffect, useState } from 'react'
import { fetchPrograms } from '../lib/programs.js'

/** Loads the program list once; `available` is false until/unless the table exists. */
export function usePrograms() {
  const [state, setState] = useState({ programs: [], available: false, loading: true })
  useEffect(() => {
    let cancelled = false
    fetchPrograms().then((res) => {
      if (!cancelled) setState({ ...res, loading: false })
    })
    return () => { cancelled = true }
  }, [])
  return state
}
