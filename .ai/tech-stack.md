Frontend - Astro z RCI/CD i Hosting:

- Github Actions do tworzenia pipeline'ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker

## Technologie Testowe

### Testy Jednostkowe i Integracyjne

- **Vitest** - Szybki runner testów z natywnym wsparciem TypeScript
- **React Testing Library** - Testowanie komponentów React z perspektywy użytkownika
- **@testing-library/jest-dom** - Dodatkowe matchery dla asercji DOM
- **Supertest** - Testowanie HTTP API endpoints
- **testcontainers-node** - Izolowane środowiska bazodanowe w Docker

### Testy End-to-End

- **Playwright** - Wieloprzeglądarkowe testy E2E z pełnym wsparciem dla nowoczesnych aplikacji webowych
- **@playwright/test** - Test runner z wbudowanymi asercjami i fixturami

### Testy Wydajnościowe

- **K6** - Testy obciążeniowe i benchmarking wydajności
- **Lighthouse CI** - Automatyczne audyty wydajności aplikacji webowych
- **Web Vitals** - Monitoring Core Web Vitals

### Testy Bezpieczeństwa

- **OWASP ZAP** - Skanowanie vulnerabilities bezpieczeństwa
- **npm audit** - Sprawdzanie podatności w dependencjach
- **Supabase RLS** - Testowanie polityk Row Level Security

### Testy Dostępności

- **axe-core** - Silnik automatycznych testów dostępności
- **Pa11y** - Narzędzie commandline do testowania dostępności
- **@axe-core/playwright** - Integracja axe-core z Playwright

### Mockowanie i Test Data

- **MSW (Mock Service Worker)** - Mockowanie zewnętrznych API w testach
- **Test Factories** - Generowanie dynamicznych danych testowych
- **Seed Data** - Predefiniowane zestawy danych testowych

### Reporting i Monitoring Jakości

- **Vitest UI** - Interaktywny dashboard testów
- **Codecov** - Analiza pokrycia kodu testami
- **Allure** - Bogate raporty z testów
- **c8** - Raportowanie pokrycia kodu (wbudowane w Vitest)

### Środowiska Testowe

- **Docker** - Konteneryzacja środowisk testowych
- **GitHub Actions** - CI/CD z automatycznym uruchamianiem testów
- **PostgreSQL** - Baza danych testowa w kontenerach dla komponentów interaktywnych:

- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:

- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:

- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

CI/CD i Hosting:

- Github Actions do tworzenia pipeline’ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker
