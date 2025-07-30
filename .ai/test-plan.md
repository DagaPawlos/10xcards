# Plan Testów dla 10x Cards - Aplikacja AI do Generowania Fiszek

## 1. Wprowadzenie i Cele Testowania

### 1.1 Cel Projektu

Aplikacja 10x Cards to nowoczesna platforma do generowania fiszek edukacyjnych z wykorzystaniem sztucznej inteligencji. Umożliwia użytkownikom wprowadzenie tekstu źródłowego, automatyczne wygenerowanie propozycji fiszek przez AI oraz ich edycję i zapisanie.

### 1.2 Cele Testowania

- Zapewnienie bezpieczeństwa danych użytkowników i prawidłowej autoryzacji
- Weryfikacja poprawności integracji z zewnętrznymi serwisami AI (OpenRouter)
- Walidacja logiki biznesowej generowania i zarządzania fiszkami
- Sprawdzenie wydajności i niezawodności aplikacji
- Zapewnienie wysokiej jakości doświadczenia użytkownika (UX/UI)
- Weryfikacja zgodności z wymaganiami dostępności (WCAG 2.1)

## 2. Zakres Testów

### 2.1 Komponenty w Zakresie Testów

- **API Endpoints**: `/api/generations`, `/api/flashcards`, `/api/auth/*`
- **Serwisy Biznesowe**: `GenerationService`, `FlashcardService`, `OpenRouterService`
- **Komponenty React**: `FlashcardGenerationView`, `SavedFlashcardsList`, `EditFlashcardDialog`
- **Middleware**: Autoryzacja i sesje użytkowników
- **Baza Danych**: Migracje, RLS policies, triggers
- **Integracje Zewnętrzne**: OpenRouter AI API

### 2.2 Komponenty Poza Zakresem Testów

- Komponenty statyczne Astro (`.astro` files)
- Biblioteki trzecich stron (Shadcn/ui, Tailwind CSS)
- Konfiguracja środowiskowa (nie testujemy samej konfiguracji Astro/Vite)

## 3. Typy Testów do Przeprowadzenia

### 3.1 Testy Jednostkowe (Unit Tests)

**Framework**: Vitest + React Testing Library
**Pokrycie**: Minimum 80% dla logiki biznesowej

**Komponenty do testowania**:

- Serwisy (`GenerationService`, `FlashcardService`)
- Utilities i helpery (`src/lib/utils`)
- Hooks React (`useCurrentUser`)
- Walidatory Zod (schemas w API routes)

### 3.2 Testy Integracyjne (Integration Tests)

**Framework**: Vitest + Supertest + Testcontainers (PostgreSQL)

**Obszary testowania**:

- API endpoints z rzeczywistą bazą danych
- Przepływy autentykacji end-to-end
- Integracja z Supabase (auth + database)
- Middleware i session handling

### 3.3 Testy End-to-End (E2E)

**Framework**: Playwright

**Scenariusze testowania**:

- Pełny przepływ generowania fiszek (gość + zalogowany użytkownik)
- Zarządzanie kontami użytkowników
- Edycja i usuwanie fiszek
- Responsywność aplikacji

### 3.4 Testy Wydajnościowe (Performance Tests)

**Framework**: K6 + Lighthouse CI

**Metryki**:

- Czas odpowiedzi API endpoints (< 2s dla generowania fiszek)
- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Obciążenie bazy danych (concurrent users)

### 3.5 Testy Bezpieczeństwa (Security Tests)

**Framework**: OWASP ZAP + custom scripts

**Obszary testowania**:

- SQL Injection w API endpoints
- XSS w komponentach React
- CSRF protection
- Row Level Security (RLS) policies
- Rate limiting na API endpoints

### 3.6 Testy Dostępności (Accessibility Tests)

**Framework**: axe-core + Pa11y

**Standardy**: WCAG 2.1 AA
**Komponenty**: Wszystkie interfejsy użytkownika

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

### 4.1 Generowanie Fiszek z AI

#### Scenariusz 1: Pomyślne generowanie fiszek (użytkownik zalogowany)

**Warunki wstępne**: Użytkownik zalogowany, tekst 1000-10000 znaków
**Kroki**:

1. Wprowadź tekst źródłowy
2. Kliknij "Generate Flashcards"
3. Sprawdź wygenerowane propozycje
4. Zaakceptuj wybrane fiszki
5. Zapisz do bazy danych

**Oczekiwany rezultat**: Fiszki zostają wygenerowane i zapisane, `generation_id` jest przypisane

#### Scenariusz 2: Generowanie fiszek (użytkownik anonimowy)

**Warunki wstępne**: Użytkownik niezalogowany
**Kroki**:

1. Wprowadź tekst źródłowy
2. Wygeneruj fiszki
3. Spróbuj zapisać

**Oczekiwany rezultat**: Fiszki są generowane, ale zapis wymaga logowania

#### Scenariusz 3: Błąd integracji AI

**Warunki wstępne**: OpenRouter API niedostępne/błędny klucz
**Kroki**:

1. Wprowadź tekst
2. Próba generowania

**Oczekiwany rezultat**: Błąd jest logowany do `generation_error_logs`, użytkownik otrzymuje komunikat o błędzie

### 4.2 Zarządzanie Fiszkami

#### Scenariusz 4: Edycja zapisanej fiszki

**Warunki wstępne**: Użytkownik ma zapisane fiszki
**Kroki**:

1. Otwórz listę zapisanych fiszek
2. Kliknij edytuj na wybranej fiszce
3. Zmień treść front/back
4. Zapisz zmiany

**Oczekiwany rezultat**: Fiszka jest zaktualizowana, `updated_at` jest ustawione

#### Scenariusz 5: Usuwanie fiszki

**Warunki wstępne**: Użytkownik ma zapisane fiszki
**Kroki**:

1. Wybierz fiszkę do usunięcia
2. Potwierdź usunięcie

**Oczekiwany rezultat**: Fiszka jest trwale usunięta z bazy danych

### 4.3 Autentykacja i Autoryzacja

#### Scenariusz 6: Rejestracja nowego użytkownika

**Kroki**:

1. Wprowadź email i hasło
2. Potwierdź rejestrację
3. Sprawdź email weryfikacyjny

**Oczekiwany rezultat**: Konto zostaje utworzone, email weryfikacyjny wysłany

#### Scenariusz 7: Reset hasła

**Kroki**:

1. Kliknij "Forgot Password"
2. Wprowadź email
3. Kliknij link w emailu
4. Ustaw nowe hasło

**Oczekiwany rezultat**: Hasło zostaje zmienione, użytkownik może się zalogować

### 4.4 Bezpieczeństwo i Walidacja

#### Scenariusz 8: Próba dostępu do cudzych fiszek

**Warunki wstępne**: Dwóch użytkowników z fiszkami
**Kroki**:

1. Zaloguj się jako użytkownik A
2. Spróbuj dostępu do fiszki użytkownika B przez API

**Oczekiwany rezultat**: Dostęp jest odmówiony (403/404), RLS działa poprawnie

#### Scenariusz 9: Walidacja danych wejściowych

**Kroki**:

1. Wyślij nieprawidłowe dane do API (za długi tekst, nieprawidłowy format)
2. Sprawdź odpowiedź

**Oczekiwany rezultat**: API zwraca błąd walidacji z opisem problemu

## 5. Środowisko Testowe

### 5.1 Środowiska Testowe

#### 5.1.1 Lokalne Środowisko Deweloperskie

- **Node.js**: 18+
- **Database**: Supabase Local (Docker)
- **AI Service**: OpenRouter sandbox/mock
- **Port**: 3000 (development server)

#### 5.1.2 Środowisko CI/CD

- **Platform**: GitHub Actions
- **Database**: PostgreSQL w kontenerze
- **Mock Services**: Zewnętrzne API (OpenRouter)
- **Browser**: Headless Chrome/Firefox dla E2E

#### 5.1.3 Środowisko Staging

- **Hosting**: DigitalOcean
- **Database**: Supabase Cloud (staging instance)
- **AI Service**: OpenRouter (test keys)
- **SSL**: Enabled

### 5.2 Dane Testowe

- **Użytkownicy testowi**: 10 kont z różnymi rolami
- **Fiszki**: 100+ przykładowych fiszek
- **Teksty źródłowe**: Zbiór tekstów różnej długości i tematyki
- **Błędne dane**: Przypadki graniczne i nieprawidłowe formaty

## 6. Narzędzia do Testowania

### 6.1 Framework Testowy

- **Vitest**: Testy jednostkowe i integracyjne
- **React Testing Library**: Testowanie komponentów React
- **Playwright**: Testy E2E
- **Supertest**: Testowanie API endpoints

### 6.2 Narzędzia Wspomagające

- **testcontainers-node**: Izolowane środowisko bazy danych
- **MSW (Mock Service Worker)**: Mockowanie zewnętrznych API
- **K6**: Testy wydajnościowe i obciążeniowe
- **axe-core**: Testowanie dostępności
- **OWASP ZAP**: Skanowanie bezpieczeństwa

### 6.3 Reporting i Monitoring

- **Vitest UI**: Dashboard dla testów jednostkowych
- **Allure**: Raporty dla testów E2E
- **Codecov**: Analiza pokrycia kodu
- **Lighthouse CI**: Metryki wydajności

## 7. Harmonogram Testów

### 7.1 Faza 1: Przygotowanie (Tydzień 1)

- Konfiguracja środowisk testowych
- Przygotowanie danych testowych
- Instalacja i konfiguracja narzędzi

### 7.2 Faza 2: Testy Podstawowe (Tydzień 2-3)

- Testy jednostkowe serwisów
- Testy integracyjne API endpoints
- Podstawowe testy komponentów React

### 7.3 Faza 3: Testy Zaawansowane (Tydzień 4)

- Testy E2E kluczowych przepływów
- Testy bezpieczeństwa
- Testy wydajnościowe

### 7.4 Faza 4: Finalizacja (Tydzień 5)

- Testy dostępności
- Regresja po poprawkach
- Dokumentacja wyników

## 8. Kryteria Akceptacji Testów

### 8.1 Kryteria Funkcjonalne

- ✅ Wszystkie krytyczne scenariusze biznesowe przechodzą
- ✅ API endpoints zwracają poprawne kody odpowiedzi
- ✅ Integracja AI działa stabilnie (success rate > 95%)
- ✅ Autoryzacja i RLS policies działają poprawnie

### 8.2 Kryteria Jakościowe

- ✅ Pokrycie kodu testami jednostkowymi > 80%
- ✅ Zero krytycznych luk bezpieczeństwa
- ✅ Zgodność z WCAG 2.1 AA
- ✅ Core Web Vitals w zielonych przedziałach

### 8.3 Kryteria Wydajnościowe

- ✅ Czas odpowiedzi API < 2s (95% percentyl)
- ✅ Czas ładowania strony < 3s
- ✅ Aplikacja działa z 100 jednoczesnymi użytkownikami
- ✅ Baza danych obsługuje 1000 operacji/minutę

## 9. Role i Odpowiedzialności w Procesie Testowania

### 9.1 Lead Developer

- **Odpowiedzialność**: Strategia testowania, code review
- **Zadania**: Definiowanie standardów, mentoring zespołu
- **Narzędzia**: GitHub, Slack, dokumentacja techniczna

### 9.2 Frontend Developer

- **Odpowiedzialność**: Testy komponentów React, E2E UI
- **Zadania**: React Testing Library, Playwright scenarios
- **Narzędzia**: Vitest, Playwright, axe-core

### 9.3 Backend Developer

- **Odpowiedzialność**: Testy API, serwisów, integracji
- **Zadania**: Unit tests, integration tests, security tests
- **Narzędzia**: Vitest, Supertest, testcontainers

### 9.4 QA Engineer (opcjonalnie)

- **Odpowiedzialność**: Plan testów, testy manualne, automatyzacja
- **Zadania**: Scenariusze testowe, wykonanie testów, raportowanie
- **Narzędzia**: Wszystkie narzędzia testowe

### 9.5 DevOps Engineer

- **Odpowiedzialność**: CI/CD pipeline, środowiska testowe
- **Zadania**: Automatyzacja wdrożeń, monitoring, infrastruktura
- **Narzędzia**: GitHub Actions, Docker, monitoring tools

## 10. Procedury Raportowania Błędów

### 10.1 Klasyfikacja Błędów

#### Krytyczne (P0)

- **Definicja**: Aplikacja nie działa, brak dostępu, luki bezpieczeństwa
- **SLA**: Naprawa w ciągu 4 godzin
- **Eskalacja**: Natychmiastowa notyfikacja całego zespołu

#### Wysokie (P1)

- **Definicja**: Kluczowe funkcje nie działają, poważne problemy UX
- **SLA**: Naprawa w ciągu 24 godzin
- **Eskalacja**: Notyfikacja lead developera

#### Średnie (P2)

- **Definicja**: Drobne problemy funkcjonalne, błędy wizualne
- **SLA**: Naprawa w ciągu 1 tygodnia
- **Eskalacja**: Standardowy proces review

#### Niskie (P3)

- **Definicja**: Sugestie ulepszeń, drobne inconsistencies
- **SLA**: Do rozważenia w następnej iteracji
- **Eskalacja**: Dokumentacja w backlogu

### 10.2 Szablon Raportu Błędu

```markdown
## Bug Report #[ID]

**Priority**: P0/P1/P2/P3
**Component**: API/Frontend/Database/Integration
**Environment**: Local/Staging/Production

### Summary

[Krótki opis problemu]

### Steps to Reproduce

1. [Krok 1]
2. [Krok 2]
3. [Krok 3]

### Expected Result

[Co powinno się wydarzyć]

### Actual Result

[Co się faktycznie dzieje]

### Evidence

- Screenshots/Videos
- Console logs
- Network requests
- Database queries

### Impact

[Wpływ na użytkowników/biznes]

### Suggested Fix

[Jeśli mamy pomysł na rozwiązanie]
```

### 10.3 Workflow Zarządzania Błędami

1. **Discovery**: Automatyczne wykrycie (testy) lub manual reporting
2. **Triage**: Ocena priorytetu i przypisanie do developera
3. **Investigation**: Analiza przyczyny i oszacowanie czasu naprawy
4. **Fix**: Implementacja rozwiązania z testami regresji
5. **Verification**: Potwierdzenie naprawy na środowisku testowym
6. **Deployment**: Wdrożenie na produkcję
7. **Closure**: Weryfikacja końcowa i zamknięcie ticket'u

### 10.4 Metryki i KPI

#### Metryki Jakości

- **Bug Discovery Rate**: Ilość błędów znalezionych na etapie testów vs produkcja
- **Test Coverage**: Procent pokrycia kodu testami
- **Defect Density**: Ilość błędów na 1000 linii kodu
- **Mean Time to Resolution (MTTR)**: Średni czas naprawy błędów

#### Metryki Efektywności

- **Test Execution Rate**: Procent automatyzacji testów
- **Test Pass Rate**: Procent przechodzących testów
- **Release Velocity**: Częstotliwość bezpiecznych wdrożeń
- **Customer Satisfaction**: Feedback użytkowników po wdrożeniach

---

**Wersja dokumentu**: 1.0  
**Data utworzenia**: Listopad 2024  
**Autor**: AI Assistant  
**Status**: Do przeglądu przez zespół
