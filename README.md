# NerchukovAI — Chrome Extension

NerchukovAI is a Chrome extension popup that scrapes coding problems (targeting LeetCode problem pages), sends the scraped data to a local backend which calls Google Gemini, and displays either a full solution or up to 10 guided hints in the popup.

---

## Key features

- Scrapes problem heading, description and code from supported pages.
- Requests either a full solution or up to 10 hints from a backend that calls Google Gemini.
- Popup UI:
  - Initial state shows two buttons: Solution and Hint.
  - Hint flow: first click shows hint #1; subsequent navigation exposes Next / Previous controls. Only first 10 hints are exposed.
  - Solution flow shows the full generated solution.
  - Copy button copies current panel content; Hide button collapses the panel while preserving layout.
- Dark monospace panel for code/hints; reserved space to avoid layout jumps.

---

## Quick links

- Frontend popup UI: frontend/src/App.jsx
- Content script (scrapes page): frontend/src/content.js
- Background service worker: frontend/src/background.js
- Backend Gemini proxy: backend/server.js
- Manifest: frontend/public/manifest.json

---

## Prerequisites

- Node.js (14+ recommended)
- npm
- Chrome browser

---

## Install & run

1. Clone repository.
2. Frontend:
   - cd frontend
   - npm install
   - Development: npm run dev (for local UI work; to test extension features load built files)
   - Build: npm run build (produces `dist` used for extension)
3. Backend:
   - cd backend
   - npm install
   - Start: node server.js (or nodemon server.js)
   - Default listens on http://localhost:3000

---

## Configuration / Environment

- Backend should keep the Gemini API key server-side:
  - backend/.env
    - GEMINI_API_KEY=your_api_key_here
- Do not store API keys in frontend or manifest.

---

## Endpoints (backend)

- POST /gemini/getSolution — expects scraped payload; returns solution JSON.
- POST /gemini/getHints — expects scraped payload; returns array of hints (up to 10).

(See backend/server.js for exact payload/response shape.)

---

## Architecture & data flow

1. Popup sends messages to the background service worker:
   - GET_QUESTION — get scraped heading & question.
   - GET_ANSWER — request full solution.
   - GET_HINT — request hints.
2. Background ensures content script is present, sends SCRAPE_DATA to the active tab, receives scraped data.
3. Background forwards scraped data to backend endpoints (getSolution/getHints).
4. Backend calls Google Gemini API, parses response, and returns structured JSON to background → popup.

---

## Frontend notes

- App.jsx handles UI state: idle / hint / solution, hint navigation, copy and hide.
- Panel uses a fixed/reserved height inside the popup to avoid layout jumps after showing/hiding content.
- Copy functionality uses navigator.clipboard and shows temporary feedback.
- Content script must be injected on the target page (manifest match or programmatic injection).

---

## Manifest & permissions

- Required permissions (example):
  - "scripting", "activeTab", "tabs"
- Content script match example:
  - "https://leetcode.com/problems/*"
- Ensure you load the built `dist` folder when adding unpacked extension.

---

## Debugging tips

- "Could not establish connection. Receiving end does not exist." — usually means no content script on the active tab:
  - Confirm content script is loaded on the target page (not chrome://, webstore, file://).
  - Inspect the page console for content script logs.
  - Inspect service worker console via chrome://extensions → Inspect views → service worker for background logs.
- Use console.log in App.jsx, background.js, and content.js to trace flow.

---

## UI behavior details

- Hints limited to 10; Next hidden at 10th, Previous hidden at 1st.
- Initial UI shows only Solution and Hint buttons.
- When Hint is opened, UI updates to show navigation and hint index.
- Hide collapses content but preserves reserved panel height to prevent jumps.
- Copy button sits next to Hide button and copies the visible panel text.

---

## Security & production

- Keep Gemini API key server-side only.
- Add authentication, rate-limiting, and logging on the backend before production use.
- Validate and sanitize scraped data if needed.

---

## File structure (high level)

- frontend/
  - src/
    - App.jsx
    - content.js
    - background.js
  - public/
    - manifest.json
  - dist/ (build output)
- backend/
  - server.js
  - .env

---

## License

MIT
