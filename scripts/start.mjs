// One command to run Domainak locally with real results:
// installs dependencies (first run only), builds both apps in live mode,
// starts the server and opens the browser (skip that with `npm start -- --no-open`).
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const backend = `${root}backend`
const frontend = `${root}frontend`
const PORT = process.env.PORT || '8000'
const URL_ = `http://localhost:${PORT}`
const isWindows = process.platform === 'win32'

const step = (msg) => console.log(`\n\x1b[38;5;214m●\x1b[0m ${msg}`)

// Vite 7 needs Node 20.19+ or 22.12+; say so plainly instead of failing mid-build
const [major, minor] = process.versions.node.split('.').map(Number)
if (!((major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22)) {
    console.error(`\n✖ Domainak needs Node.js 20.19+ or 22.12+, and this is ${process.version}.`)
    console.error('  Install the current LTS from https://nodejs.org and run npm start again.\n')
    process.exit(1)
}

function npm(cwd, args, env = {}) {
    const r = spawnSync('npm', args, { cwd, stdio: 'inherit', shell: isWindows, env: { ...process.env, ...env } })
    if (r.status !== 0) {
        console.error(`\n✖ "npm ${args.join(' ')}" failed in ${cwd}`)
        process.exit(r.status ?? 1)
    }
}

// Install on first run, and again whenever package-lock.json changed since the
// last install (e.g. after a git pull), so new dependencies are never missing
const needsInstall = (dir) => {
    const installed = `${dir}/node_modules/.package-lock.json`
    return !existsSync(installed) || statSync(`${dir}/package-lock.json`).mtimeMs > statSync(installed).mtimeMs
}

const quiet = ['--no-audit', '--no-fund', '--loglevel=error']
for (const [name, dir] of [['backend', backend], ['frontend', frontend]]) {
    if (needsInstall(dir)) {
        step(`Installing ${name} dependencies…`)
        // --include=dev: the builds need dev tools even if the shell has NODE_ENV=production
        npm(dir, ['ci', '--include=dev', ...quiet], { PUPPETEER_SKIP_DOWNLOAD: 'true' })
    }
}

step('Building…')
npm(frontend, ['run', 'build', '--silent', '--', '--logLevel', 'error'], { VITE_APP_MODE: 'live' })
npm(backend, ['run', 'build', '--silent'])

step(`Starting Domainak on ${URL_}`)
console.log('  A real Chrome runs minimized in your Dock/taskbar while Domainak is open.')
console.log('  Searches happen there, so nothing pops up or steals focus.')
console.log('  Press Ctrl+C to stop.\n')
const server = spawn(process.execPath, ['dist/app.js'], {
    cwd: backend,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production', PORT },
})
server.on('exit', (code) => process.exit(code ?? 0))
// Ctrl+C in a terminal reaches the server too; forwarding covers a plain `kill`.
// Not on Windows, where kill() terminates it before it can close Chrome.
process.on('SIGINT', () => { if (!isWindows) server.kill('SIGINT') })

// Open the browser once Domainak answers: it starts after Chrome, which can be slow
// the first time, and checking /health means some other app on the port never gets opened
const isUp = async () => {
    try {
        const res = await fetch(`http://127.0.0.1:${PORT}/health`)
        return (await res.json()).app === 'domainak'
    } catch {
        return false
    }
}

let up = false
for (let i = 0; i < 240 && !(up = await isUp()); i++) {
    await new Promise((r) => setTimeout(r, 250))
}
if (!up) {
    console.log(`\n  Still starting. Open ${URL_} once it says "Server running".`)
} else if (!process.argv.includes('--no-open')) {
    const [cmd, args] = isWindows ? ['cmd', ['/c', 'start', '', URL_]]
        : process.platform === 'darwin' ? ['open', [URL_]]
        : ['xdg-open', [URL_]]
    spawn(cmd, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref()
}
