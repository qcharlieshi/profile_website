# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website built with React, Redux, Express, Sequelize/PostgreSQL. Uses HashRouter for client-side routing with three main sections: Home, Portfolio, and About.

## Architecture

### Frontend (React/Redux)
- **Entry point**: `app/main.jsx` - Renders the Provider with Redux store and HashRouter
- **Root container**: `app/containers/AppContainer.js` - Manages global scroll state via throttled scroll listener, renders NavbarComponent and route-based containers
- **Redux store**: `app/store.jsx` - Configured with redux-logger and redux-thunk middleware
- **Routing**: Uses HashRouter with routes for `/home`, `/portfolio`, `/about` (defaults to `/home`)
- **Components**: Split into reusable components (`app/components/`) and container components (`app/containers/`)

### Backend (Express)
- **Entry point**: `server/start.js` - Express server with passport auth, cookie sessions, body-parser
- **API routes**: `/api` endpoints defined in `server/api.js`
- **Static files**: Served from `public/` directory
- **Catch-all route**: Returns `app/main.jsx` for client-side routing

### Database (Sequelize/PostgreSQL)
- **Connection**: `db/index.js` - Auto-creates database if missing (dev only), handles sync with retry logic
- **Models**: Defined in `db/models/` (includes User, OAuth models with tests)
- **Database name**: Uses `$DATABASE_NAME` env var or package name, appends `_test` for testing

### Build (Webpack)
- **Config**: `webpack.config.js` - Babel transpilation (React, ES2015, stage-2), bundles to `public/bundle.js`
- **Entry**: `app/main.jsx`
- **Loaders**: Babel for JSX/ES6, special noParse for reactstrap-tether

## Development Commands

```bash
# Development
npm start              # Start dev server with nodemon + webpack build (port 1337)
npm run build-watch    # Watch mode webpack build
npm test              # Run all tests (*.test.js, *.test.jsx)
npm test-watch        # Run tests in watch mode

# Database
npm run seed          # Seed database with test data

# Deployment
npm run deploy-heroku # Build and deploy to Heroku
npm run build-branch  # Create deployment branch with compiled assets
```

## Key Patterns

- **Scroll tracking**: AppContainer maintains global scroll state passed to child components for parallax/animation effects
- **Throttling**: Uses custom `app/utils/throttle.js` for scroll event performance
- **Authentication**: Passport setup with local, Google, GitHub, Facebook strategies (see `server/auth.js`)
- **Database auto-creation**: Development mode auto-creates PostgreSQL database if missing
- **Environment detection**: Uses `app.isProduction`, `app.isTesting` from root `index.js` (via `APP` symlink)

## Testing

- **Framework**: Mocha with chai, sinon, enzyme for React components
- **Compilers**: Babel register for JSX/ES6 in tests
- **Test files**: Co-located with source files as `*.test.js` or `*.test.jsx`
