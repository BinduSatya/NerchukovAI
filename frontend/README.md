# NerchukovAI Chrome Extension

NerchukovAI is a Chrome extension that uses Google's Gemini API to assist with coding questions. It can extract question details and code from supported web pages, then provide answers or hints using generative AI.

## Features

- Extracts question heading, text, and code from the current page.
- Sends extracted data to Gemini API for AI-powered answers or hints.
- Popup UI for interacting with the extension.
- Background and content scripts for data extraction and communication.

## Getting Started

### Prerequisites

- Node.js and npm installed
- Chrome browser

### Installation

1. Clone this repository.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Build the extension:

   ```sh
   npm run build
   ```

4. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Configuration

- The Gemini API key should be set in the `GEMINI_API_KEY` constant in `src/background.js`.

## Usage

- Click the extension icon to open the popup.
- Use "Run Gemini" to get a complete answer for the coding question.
- Use "Get Hint" to receive hints for completing the code.

## Development

- Start the development server:

  ```sh
  npm run dev
  ```

- Lint the code:

  ```sh
  npm run lint
  ```

## File Structure

- `src/background.js`: Handles background tasks and Gemini API requests.
- `src/content.js`: Extracts data from the current tab.
- `src/App.jsx`: Popup UI logic.
- `src/api.js`: Gemini API utility (alternative usage).
- `public/manifest.json`: Chrome extension manifest.

##
