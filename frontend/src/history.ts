import { useSyncExternalStore } from 'react'
import type { PromiseResult } from './types'

// Past searches with their results, kept in this browser only
const STORAGE_KEY = 'domainak:history'
const CHANGE_EVENT = 'domainak:history'
const MAX_ENTRIES = 20

export interface HistoryEntry {
    domain: string
    at: number
    result: PromiseResult[]
}

// useSyncExternalStore needs the same array back until storage actually changes
let snapshot: { raw: string | null, entries: HistoryEntry[] } = { raw: null, entries: [] }

const readHistory = (): HistoryEntry[] => {
    let raw: string | null
    try {
        raw = localStorage.getItem(STORAGE_KEY)
    } catch {
        return snapshot.entries
    }
    if (raw === snapshot.raw) return snapshot.entries

    let entries: HistoryEntry[] = []
    try {
        const parsed: unknown = JSON.parse(raw ?? '[]')
        if (Array.isArray(parsed)) {
            entries = parsed.filter((e): e is HistoryEntry =>
                typeof e?.domain === 'string' && typeof e?.at === 'number' && Array.isArray(e?.result))
        }
    } catch {
        // Corrupt entry: start over
    }
    snapshot = { raw, entries }
    return entries
}

const writeHistory = (entries: HistoryEntry[] | null) => {
    try {
        if (entries) localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
        else localStorage.removeItem(STORAGE_KEY)
    } catch {
        // Storage full or blocked: history is a nicety
    }
    window.dispatchEvent(new Event(CHANGE_EVENT))
}

// Newest first, one entry per domain
export const saveToHistory = (domain: string, result: PromiseResult[]) => {
    const key = domain.toLowerCase()
    const rest = readHistory().filter((e) => e.domain.toLowerCase() !== key)
    writeHistory([{ domain, at: Date.now(), result }, ...rest].slice(0, MAX_ENTRIES))
}

export const findInHistory = (domain: string) =>
    readHistory().find((e) => e.domain.toLowerCase() === domain.toLowerCase()) ?? null

export const clearHistory = () => writeHistory(null)

const subscribe = (onChange: () => void) => {
    window.addEventListener(CHANGE_EVENT, onChange)
    // Searches made in other tabs
    window.addEventListener('storage', onChange)
    return () => {
        window.removeEventListener(CHANGE_EVENT, onChange)
        window.removeEventListener('storage', onChange)
    }
}

export const useHistory = () => useSyncExternalStore(subscribe, readHistory)

export const availableCount = (entry: HistoryEntry) => entry.result.filter((r) => {
    if (r.status !== 'fulfilled') return false
    const s = r.value.status
    const str = typeof s === 'string' ? s.toLowerCase() : ''
    return s === true || str === 'available' || str.includes('aftermarket')
}).length

// "5 minutes ago", "yesterday"
export const timeAgo = (at: number) => {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
    const minutes = Math.round((at - Date.now()) / 60000)
    if (Math.abs(minutes) < 1) return 'just now'
    if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')
    const hours = Math.round(minutes / 60)
    if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
    return rtf.format(Math.round(hours / 24), 'day')
}
