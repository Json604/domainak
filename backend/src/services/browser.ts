import { connect } from "puppeteer-real-browser";
import type { NativeError } from "../types/index.ts";

type Browser = Awaited<ReturnType<typeof connect>>['browser']
type BrowserContext = Awaited<ReturnType<Browser['createBrowserContext']>>
type Page = Awaited<ReturnType<Browser['newPage']>>

// One Chrome for the whole server lifetime. Launching is the only moment Chrome
// grabs focus, so it happens at startup; every search then works in its own
// minimized background window that never comes forward.
// (Headless doesn't work: the registrars block it.)
let browserPromise: Promise<Browser> | null = null

export const getBrowser = () => {
    if (!browserPromise) {
        browserPromise = launch().catch((err) => {
            browserPromise = null
            throw err
        })
    }
    return browserPromise
}

const launch = async () => {
    console.log('🔵 Launching Chrome...');
    const { browser, page } = await connect({
        headless: false,
        args: [],
        customConfig: {},
        turnstile: true,
        connectOption: {},
        disableXvfb: false,
        ignoreAllFlags: false,
    })
    browser.on('disconnected', () => { browserPromise = null })

    // Chrome starts with one visible window: tuck it into the Dock/taskbar
    try {
        const session = await page.createCDPSession()
        const { windowId } = await session.send('Browser.getWindowForTarget')
        await session.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'minimized' } })
    } catch (error) {
        // No window manager (e.g. Linux under Xvfb): nothing visible to hide anyway
        console.log('🟡 Could not minimize Chrome:', (error as NativeError).message);
    }

    console.log('🟢 Chrome ready (minimized)');
    return browser
}

// Opens `count` tabs in a fresh, isolated context whose window starts minimized
// and in the background, so nothing pops up while a search runs.
export const openSearchPages = async (count: number) => {
    const browser = await getBrowser()
    const context = await browser.createBrowserContext()
    const cdp = await browser.target().createCDPSession()

    // `windowState` is newer than the bundled protocol types
    const minimizedWindow = { newWindow: true, windowState: 'minimized' } as { newWindow: boolean }

    const pages: Page[] = []
    for (let i = 0; i < count; i++) {
        const params = { url: 'about:blank', browserContextId: context.id!, background: true }
        let targetId: string
        try {
            // The first tab creates the context's window: ask for it minimized
            ({ targetId } = await cdp.send('Target.createTarget', i === 0 ? { ...params, ...minimizedWindow } : params))
        } catch {
            ({ targetId } = await cdp.send('Target.createTarget', params))
        }
        // `_targetId` isn't public API, but it's the only link back from CDP to the Page
        const target = await browser.waitForTarget((t) => (t as unknown as { _targetId: string })._targetId === targetId)
        const page = (await target.page())!
        // Pages behave as if focused even though the window is minimized
        const session = await page.createCDPSession()
        await session.send('Emulation.setFocusEmulationEnabled', { enabled: true })
        pages.push(page)
    }
    await cdp.detach()

    return { context, pages }
}

export const closeSearchContext = async (context: BrowserContext | null) => {
    try {
        await context?.close()
    } catch (error) {
        console.error('🔴 Failed to close search window:', (error as NativeError).message);
    }
}

export const closeBrowser = async () => {
    const browser = await browserPromise?.catch(() => null)
    await browser?.close().catch(() => {})
}
