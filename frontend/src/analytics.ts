import { IS_DEMO } from './config'

// Google Analytics, on the hosted demo only: a local run is someone's own
// machine, and the domains they search stay there.
const GA_ID = 'G-GGX2VVDC9K'

declare global {
    interface Window {
        dataLayer?: unknown[]
        gtag?: (...args: unknown[]) => void
    }
}

export const initAnalytics = () => {
    if (!IS_DEMO) return
    window.dataLayer = window.dataLayer || []
    // gtag.js expects the `arguments` object itself, not an array
    window.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', GA_ID)

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(script)
}

export const track = (name: string, params?: Record<string, unknown>) => {
    window.gtag?.('event', name, params)
}
