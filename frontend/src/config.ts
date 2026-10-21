// "demo": the deployed site plays a staged story (registrars block server IPs).
// "live": running on your own machine, results come from the real backend.
export const IS_DEMO = import.meta.env.VITE_APP_MODE === 'demo'

// Empty means same origin, which is how `npm start` at the repo root serves it
export const API_URL: string = import.meta.env.VITE_API_URL ?? ''

export const REPO_URL = 'https://github.com/Json604/domainak'
