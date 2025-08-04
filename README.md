# Mezon Automation Framework
A comprehensive test automation framework built with **Playwright + Page Object Model** pattern for Mezon web application testing.

## 🎯 Framework Features

- **Pure Playwright** - No BDD complexity, just clean TypeScript tests
- **Page Object Model** - Organized, maintainable page objects with component composition
- **Component-Based Architecture** - Reusable UI components (Button, Input, Dropdown, Navigation)
- **Factory Pattern** - Dynamic test data generation with Faker.js
- **Environment Management** - Support for multiple environments (dev, staging, prod)
- **Cross-Browser Testing** - Chrome, Firefox, Safari, Edge support
- **Mobile Testing** - Responsive testing on mobile devices
- **Rich Reporting** - HTML reports, screenshots, videos, traces
- **CI/CD Ready** - Optimized for continuous integration

## 🏗️ Project Structure

```
src/
├── pages/                  # Page Object Models
│   ├── BasePage.ts        # Base page with common methods
│   ├── HomePage.ts        # Homepage page object
│   ├── LoginPage.ts       # Login/Signup page object
│   └── RegistrationPage.ts # Registration page object
├── components/             # Reusable UI Components
│   ├── BaseComponent.ts   # Base component class
│   ├── ButtonComponent.ts # Button interactions
│   ├── InputComponent.ts  # Input field handling
│   ├── DropdownComponent.ts # Dropdown selections
│   └── NavigationComponent.ts # Navigation elements
├── data/                   # Test Data Management
│   ├── factories/         # Dynamic data generation
│   │   └── UserFactory.ts # User data factory
│   └── static/            # Static test data
│       └── TestUsers.ts   # Predefined test users
├── utils/                  # Utility Functions
│   └── waitHelpers.ts     # Wait strategies and helpers
├── config/                 # Configuration Files
│   ├── environment.ts     # Environment configurations
│   ├── global.setup.ts    # Global test setup
│   └── global.teardown.ts # Global test cleanup
└── tests/                  # Test Suites
    ├── e2e/               # End-to-end tests
    │   ├── homepage.spec.ts
    │   └── mezon-auth.spec.ts
    ├── api/               # API tests
    ├── visual/            # Visual regression tests
    └── mobile/            # Mobile tests
```

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
# or
yarn install

# Install browsers
npx playwright install
```

### Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
NODE_ENV=development
BASE_URL=https://dev-mezon.nccsoft.vn
HEADLESS=false
```

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests
yarn test

# Run with UI mode
yarn test:ui

# Run in headed mode (browser visible)
yarn test:headed

# Run specific test file
yarn test src/tests/e2e/homepage.spec.ts
yarn test src/tests/e2e/mezon-auth.spec.ts

# Run with UI mode for specific file
yarn test src/tests/e2e/mezon-auth.spec.ts --ui

# Run with headed mode for specific file  
yarn test src/tests/e2e/mezon-auth.spec.ts --headed

# Run with debug mode
yarn test:debug
```

### Test Categories

```bash
# Run smoke tests
yarn test:smoke

# Run regression tests  
yarn test:regression

# Run specific test with tags
yarn test src/tests/e2e/mezon-auth.spec.ts --grep @smoke
yarn test src/tests/e2e/mezon-auth.spec.ts --grep @regression

# Run specific browser
yarn test --project=chromium
yarn test --project=firefox
yarn test --project=webkit
```

### Reports and Debugging

```bash
# Show HTML report
yarn report

# Clean test artifacts
yarn clean
```

## 📝 Writing Tests

### Example Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Mezon Authentication Flow', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
  });

  test('should complete authentication with OTP @regression', async () => {
    // Navigate to homepage and click login
    await homePage.navigate();
    await homePage.clickLogin();
    
    // Verify login page and perform OTP authentication
    await loginPage.verifyOnLoginPage();
    await loginPage.performOTPAuthentication();
    
    // Verify authentication success
    await homePage.verifyAuthenticationSuccess();
  });
});
```

### Page Object Example

```typescript
import { BasePage } from './BasePage';
import { ButtonComponent } from '../components/ButtonComponent';

export class MyPage extends BasePage {
  private readonly button: ButtonComponent;

  constructor(page: Page) {
    super(page);
    this.button = new ButtonComponent(page);
  }

  async performAction(): Promise<void> {
    await this.button.clickByText('Submit');
    await this.waitForPageLoad();
  }
}
```

## 🔧 Configuration

### Playwright Config

Main configuration in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './src/tests',
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.BASE_URL || 'https://dev-mezon.nccsoft.vn',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
```

### Environment Variables

- `BASE_URL` - Target application URL
- `HEADLESS` - Run browser in headless mode
- `RETRIES` - Number of test retries
- `WORKERS` - Parallel test execution
- `TIMEOUT` - Default test timeout

## 🎨 Best Practices

### 1. Page Objects
- Use composition over inheritance
- Keep page objects focused and single-responsibility
- Use meaningful method names

### 2. Test Data
- Use factories for dynamic data
- Isolate test data per test
- Clean up data after tests

### 3. Waiting Strategies
- Use explicit waits over implicit waits
- Wait for specific conditions, not arbitrary timeouts
- Leverage built-in Playwright waiting

### 4. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Tag tests with @smoke, @regression

### 5. Error Handling
- Use proper assertions with expect()
- Handle timeouts gracefully
- Provide meaningful error messages

## 📊 Test Reporting

### HTML Report
```bash
yarn report
```
## 🐛 Troubleshooting

### Common Issues

1. **Browser not found** - Run `npx playwright install`
2. **Timeout errors** - Increase timeout or improve wait strategies
3. **Flaky tests** - Add proper waits and stable selectors
4. **Permission issues** - Check file permissions and CI setup

### Debug Mode

```bash
# Run with debug information
DEBUG=pw:api yarn test

# Run with browser developer tools
yarn test:debug
```