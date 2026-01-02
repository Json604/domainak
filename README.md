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

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
npm install
```

Create `.env.development.local`:
```
PORT=8000
NODE_ENV=development
```

Start the server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8000`.

## API

**GET /search?q={domain}**

Search for domain availability across all registrars.

Example:
```
GET /search?q=example.com
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "registrar": "Namecheap",
      "status": "available",
      "price": 799,
      "currency": "₹"
    }
  ]
}
```

## Scripts

**Frontend**
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

**Backend**
- `npm run dev` - Start with hot reload
- `npm run start` - Production mode

## License

MIT
