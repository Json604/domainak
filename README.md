# Domainak

A domain availability comparison tool that lets you search once and compare prices across multiple registrars instantly.

## What it does

Enter a domain name and Domainak checks availability and pricing across 6 major registrars simultaneously:
- GoDaddy
- Namecheap
- Porkbun
- Dynadot
- Hostinger
- Spaceship

Results are displayed with filtering (available only) and sorting (by price or name) options.

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- React Router
- Motion (animations)

**Backend**
- Express 5 + TypeScript
- Puppeteer Real Browser (web scraping with anti-bot bypass)
- Rate limiting (15 req/min per IP)

## Project Structure

```
domainak/
├── frontend/          # React SPA
│   └── src/
│       ├── pages/     # Landing + Results pages
│       └── components/
├── backend/           # Express API
│   └── src/
│       ├── controllers/
│       ├── services/
│       │   └── registrars/  # Scraper for each registrar
│       └── routes/
```

## Run it (one command)

Registrars block cloud servers, so the hosted site at [domainak.netlify.app](https://domainak.netlify.app) is a staged demo. For real prices, run it on your machine:

```bash
git clone https://github.com/Json604/domainak && cd domainak && npm start
```

On Windows PowerShell, use `;` instead of `&&`:

```powershell
git clone https://github.com/Json604/domainak; cd domainak; npm start
```

That installs everything (first run only), builds, starts the app and opens `http://localhost:8000`. You need **Git**, **Node.js 18+** and **Google Chrome**. While Domainak runs, a real Chrome sits minimized in your Dock/taskbar: each search happens there in a background window, so nothing pops up or steals focus. The results page shows the search live as each registrar answers.

`npm start -- --no-open` skips opening the browser.

## Development

```bash
cd backend && npm install && npm run dev     # API on http://localhost:8000
cd frontend && npm install && npm run dev    # UI on http://localhost:5173
```

`VITE_APP_MODE` switches the frontend between `live` (real backend, the default) and `demo` (the staged story, used in production via `frontend/.env.production`).

## API

**GET /search?q={domain}&country={CC}**

Search for domain availability across all registrars. `country` (optional, ISO code like `IN`) picks Hostinger's site for that country so its price is local; GoDaddy picks its country site from your IP by itself. The other four registrars price in USD worldwide. The results page sends the country it reads from your browser's timezone.

Example:
```
GET /search?q=example.com
```

Response (`result` holds one settled promise per registrar):
```json
{
  "success": true,
  "data": {
    "domain": "example.com",
    "result": [
      {
        "status": "fulfilled",
        "value": {
          "registrar": "Spaceship",
          "status": "Available",
          "price": "$8.88",
          "amount": 8.88,
          "currency": "USD"
        }
      }
    ]
  }
}
```

`price` is what the registrar displays; `amount` + `currency` (ISO 4217) are the same price in machine-readable form.

**GET /rates**

Daily exchange rates (units per 1 USD, cached 12h) that the results page uses to show every price in the visitor's currency, guessed from the browser's timezone and language and changeable with the picker. Rates by [Exchange Rate API](https://www.exchangerate-api.com).

**GET /search/stream?q={domain}**

The same search as Server-Sent Events: `progress` events (`queued`, `stage`, per-registrar `phase` and `result`) as it runs, then `done` with the full result or `failure`. The results page uses this for the live story.

## Scripts

**Frontend**
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

**Backend**
- `npm run dev` - Start with hot reload
- `npm run start` - Production mode

**Repo root**
- `npm start` - Install, build and run everything locally

## License

MIT
