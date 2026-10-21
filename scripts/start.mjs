// One command to run Domainak locally with real results:
// installs dependencies (first run only), builds both apps in live mode,
// starts the server and opens the browser (skip that with `npm start -- --no-open`).
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const backend = `${root}backend`
const frontend = `${root}frontend`
const PORT = process.env.PORT || '8000'
const URL_ = `http://localhost:${PORT}`
const isWindows = process.platform === 'win32'

const step = (msg) => console.log(`\n\x1b[38;5;214m●\x1b[0m ${msg}`)

function npm(cwd, args, env = {}) {
    const r = spawnSync('npm', args, { cwd, stdio: 'inherit', shell: isWindows, env: { ...process.env, ...env } })
    if (r.status !== 0) {
        console.error(`\n✖ "npm ${args.join(' ')}" failed in ${cwd}`)
        process.exit(r.status ?? 1)
    }
}

const quiet = ['--no-audit', '--no-fund', '--loglevel=error']
for (const [name, dir] of [['backend', backend], ['frontend', frontend]]) {
    if (!existsSync(`${dir}/node_modules`)) {
        step(`Installing ${name} dependencies (first run only)…`)
        npm(dir, ['ci', ...quiet], { PUPPETEER_SKIP_DOWNLOAD: 'true' })
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
process.on('SIGINT', () => server.kill('SIGINT'))

// Open the browser once the server answers
for (let i = 0; i < 40 && !process.argv.includes('--no-open'); i++) {
    try {
        await fetch(URL_)
        const [cmd, args] = isWindows ? ['cmd', ['/c', 'start', '', URL_]]
            : process.platform === 'darwin' ? ['open', [URL_]]
            : ['xdg-open', [URL_]]
        spawn(cmd, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref()
        break
    } catch {
        await new Promise((r) => setTimeout(r, 250))
    }
}
