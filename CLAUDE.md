# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue.js 3 e-commerce frontend application built with Vite. The application is configured for deployment to GitHub Pages with custom build output to the `docs` directory.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build` 
- **Preview production build**: `npm run preview`
- **Deploy to GitHub Pages**: `npm run deploy`
- **Update Facebook Feed**: `npm run update-facebook-feed`
- **Test local environment**: `npm run test:local`

## Environment Configuration

### Local Development
- **URL**: `http://localhost:3000/ecommerce-frontend/`
- **Base Path**: `/ecommerce-frontend/` (與線上環境一致)
- **Port**: 3000 (固定端口)

### Production Environment  
- **URL**: `https://samchang72.github.io/ecommerce-frontend/`
- **Base Path**: `/ecommerce-frontend/`
- **Deployment**: GitHub Pages (docs/ 目錄)

## Architecture

### Tech Stack
- **Frontend Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **State Management**: Pinia (for cart functionality)
- **Routing**: Vue Router 4
- **Styling**: CSS with responsive design

### Project Structure
- `src/pages/` - Vue page components (HomePage, ProductPage, CartPage, CheckoutPage)
- `src/store/cart.js` - Pinia store for cart state management
- `src/router/index.js` - Vue Router configuration
- `src/assets/products.json` - Product data
- `public/image/` - Static product images

### Key Configuration
- **Base Path**: `/ecommerce-frontend/` (configured for GitHub Pages)
- **Build Output**: `docs/` directory (instead of default `dist/`)
- **GitHub Pages URL**: https://samchang72.github.io/ecommerce-frontend/

### State Management Pattern
The application uses Pinia with the Composition API pattern. The cart store (`src/store/cart.js`) uses `ref()` and returns reactive state and methods.

### Important Notes
- The current `App.vue` contains a mix of legacy implementation (inline products array) and the newer architecture (separate pages and Pinia store)
- Product images are stored in `public/image/` and referenced with relative paths
- The application includes responsive CSS with mobile-first design breakpoints at 768px and 480px