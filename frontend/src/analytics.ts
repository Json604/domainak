// Google Analytics events. The gtag snippet itself lives in index.html.
declare global {
    interface Window {
        gtag?: (command: 'event', name: string, params?: Record<string, unknown>) => void
    }
}

export const track = (name: string, params?: Record<string, unknown>) => {
    window.gtag?.('event', name, params)
}
