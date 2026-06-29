# Community Hero 🚀

## Overview
A modern React application built with **Vite** that showcases a community‑driven issue reporting platform. Users can register, log in, view a dashboard, report issues, and see real‑time safety alerts on an interactive map.

## Tech Stack
- **Frontend**: React 18, Vite, custom CSS (styled components)
- **Backend**: Node.js/Express (`backend/server.js`)
- **Database**: JSON file (`backend/db.json`) – **NOTE**: this file is ignored in version control.
- **Assets**: SVG icons, hero images, and WebP uploads.

## Getting Started
```bash
# Clone the repo
git clone https://github.com/kartik23-2/Community-Hero.git
cd Community-Hero

# Install dependencies
npm install

# Development server
npm run dev   # Vite dev server (http://localhost:5173)
```

## Scripts
- `npm run dev` – Starts Vite development server with hot‑module reloading.
- `npm run build` – Produces a production‑ready bundle in `dist/`.
- `npm run lint` – Runs Oxlint based on `.oxlintrc.json`.

## Environment & Secrets
Sensitive files such as `db.json`, `.env*`, `credentials.json`, `config.json`, `secret.key`, and the `auth/` folder are listed in **.gitignore** to keep them out of the repository.
Create a `.env` (or `.env.local`) for any required runtime configuration (e.g., API keys). This file is ignored by default.

## Development Tips
- UI components live under `src/components` and pages under `src/pages`.
- Global styles are in `src/index.css` and `src/App.css`.
- The authentication context is defined in `src/context/AuthContext.jsx`.
- Map visualizations use the `MapSelector` component.

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome‑feature`).
3. Commit your changes and push to your fork.
4. Open a Pull Request targeting `main`.

## Screenshots

## Screenshots

![Homepage mockup](public/screenshots/homepage_mockup.png)

## Additional Screenshots

![Dashboard mockup](public/screenshots/dashboard_mockup.png)






## License
MIT – feel free to use, modify, and distribute.
