# Mezon Automation Framework

Comprehensive test automation framework built with **Playwright + BDD** pattern for
## 🚀 Quick Start
### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd mezon-automation

# Install dependencies
npm install

# Install browsers
npx playwright install
```

### Environment Setup

```bash
# Default environment variables (in playwright.config.ts)
BASE_URL=https://dev-mezon.nccsoft.vn
NODE_ENV=development
```

## 🧪 Running Tests

### BDD Test Commands

```bash
# Run all BDD tests (recommended)
npm run test

# Run authentication setup
npm run test:setup

# Run specific test groups
npm run test:bdd:login       # Login flow tests (no auth required)
npm run test:bdd             # All BDD tests

# Run traditional tests (with auth)
npm run test:traditional

# Debug mode
npm run test:debug
npm run test:ui
```