# 10x-cards

## Table of Contents

- [10x-cards](#10x-cards)
  - [Table of Contents](#table-of-contents)
  - [Project Description](#project-description)
  - [Tech Stack](#tech-stack)
  - [Getting Started Locally](#getting-started-locally)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Available Scripts](#available-scripts)
  - [Testing Strategy](#testing-strategy)
    - [Testing Frameworks](#testing-frameworks)
    - [Testing Tools \& Services](#testing-tools--services)
    - [Coverage Requirements \& Standards](#coverage-requirements--standards)
    - [Test Environments](#test-environments)
  - [Project Scope](#project-scope)
    - [MVP Features](#mvp-features)
    - [Out of Scope (MVP)](#out-of-scope-mvp)
  - [Project Status](#project-status)
  - [License](#license)

---

## Project Description

**10x-cards** is a web application designed to help users create and manage sets of educational flashcards. The app leverages Large Language Models (LLMs) via API to generate flashcard suggestions based on user-provided text, significantly reducing the time and effort required for high-quality flashcard creation. The platform supports both automatic and manual flashcard management, integrates a spaced repetition algorithm for effective learning, and ensures user data privacy and security.

---

## Tech Stack

- **Frontend:**
  - [Astro 5](https://astro.build/) – Fast, minimal-JS static site generator
  - [React 19](https://react.dev/) – Interactive UI components
  - [TypeScript 5](https://www.typescriptlang.org/) – Static typing
  - [Tailwind CSS 4](https://tailwindcss.com/) – Utility-first CSS framework
  - [Shadcn/ui](https://ui.shadcn.com/) – Accessible React UI components
- **Backend:**
  - [Supabase](https://supabase.com/) – PostgreSQL database, authentication, and backend-as-a-service
- **AI Integration:**
  - [Openrouter.ai](https://openrouter.ai/) – Access to multiple LLM providers (OpenAI, Anthropic, Google, etc.) with cost control
- **CI/CD & Hosting:**
  - [GitHub Actions](https://github.com/features/actions) – CI/CD pipelines
  - [DigitalOcean](https://www.digitalocean.com/) – Docker-based hosting

---

## Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v22.14.0 (see `.nvmrc`)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
$ git clone <repo-url>
$ cd 10xcards

# 2. Install dependencies
$ npm install

# 3. Start the development server
$ npm run dev
```

> **Note:** If environment variables or API keys are required (e.g., for Supabase or Openrouter.ai), please refer to the documentation or project maintainers for setup instructions.

---

## Available Scripts

| Script          | Description                             |
| --------------- | --------------------------------------- |
| `dev`           | Start the Astro development server      |
| `build`         | Build the project for production        |
| `preview`       | Preview the production build            |
| `astro`         | Run Astro CLI commands                  |
| `lint`          | Run ESLint on the codebase              |
| `lint:fix`      | Run ESLint and automatically fix issues |
| `format`        | Format code using Prettier              |
| `test`          | Run unit tests with Vitest              |
| `test:watch`    | Run unit tests in watch mode            |
| `test:ui`       | Run unit tests with Vitest UI           |
| `test:e2e`      | Run end-to-end tests with Playwright    |
| `test:coverage` | Run tests with coverage report          |

Run scripts using `npm run <script>`.

---

## Testing Strategy

The project implements comprehensive testing strategy including:

### Testing Frameworks

- **Unit Tests**: Vitest + React Testing Library
- **Integration Tests**: Vitest + Supertest + Testcontainers (PostgreSQL)
- **End-to-End Tests**: Playwright
- **API Testing**: Supertest for endpoint validation
- **Performance Tests**: K6 + Lighthouse CI
- **Security Tests**: OWASP ZAP
- **Accessibility Tests**: axe-core + Pa11y (WCAG 2.1 AA compliance)

### Testing Tools & Services

- **Test Isolation**: testcontainers-node for PostgreSQL database isolation
- **API Mocking**: MSW (Mock Service Worker) for external API mocking
- **Reporting**: Vitest UI, Allure reports, Codecov for coverage analysis
- **Monitoring**: Lighthouse CI for performance metrics

### Coverage Requirements & Standards

- Minimum 80% code coverage for business logic
- All critical user scenarios covered by E2E tests
- API endpoints tested with real database integration
- Security and accessibility compliance verified
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- API response times < 2s (95th percentile)

### Test Environments

- **Local Development**: Node.js 18+, Supabase Local (Docker), OpenRouter sandbox
- **CI/CD**: GitHub Actions with PostgreSQL containers and headless browsers
- **Staging**: DigitalOcean with Supabase Cloud and OpenRouter test keys

For detailed testing information, scenarios, and implementation guide, see [Test Plan](.ai/test-plan.md).

---

## Project Scope

### MVP Features

- **Automatic flashcard generation:** Paste text, generate flashcards using LLMs, review and accept/edit/reject suggestions.
- **Manual flashcard management:** Create, edit, and delete flashcards via forms and lists.
- **User authentication:** Register, log in, and delete account (with all associated data).
- **Spaced repetition integration:** Study sessions powered by an open-source algorithm.
- **Statistics:** Track number of flashcards generated and accepted.
- **GDPR compliance:** Data access and deletion on user request.

### Out of Scope (MVP)

- Custom repetition algorithms (uses open-source solution)
- Gamification features
- Mobile applications (web only)
- Importing documents (PDF, DOCX, etc.)
- Public API
- Flashcard sharing between users
- Advanced notifications
- Advanced search

---

## Project Status

MVP in development. Core features are being implemented according to the product requirements document. For up-to-date progress, see the [issues](https://github.com/<repo-url>/issues) and [project board](https://github.com/<repo-url>/projects).

---

## License

**Not specified.** Please contact the project maintainers for licensing information or see future updates.
