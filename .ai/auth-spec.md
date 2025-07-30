# Specyfikacja architektury modułu autentykacji użytkownika

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### Struktura stron i komponentów

#### Nowe strony Astro (`src/pages`)

- `/login.astro` – strona logowania.
- `/register.astro` – strona rejestracji.
- `/reset-password.astro` – strona inicjowania resetu hasła (formularz e-mail).
- `/reset-password/[token].astro` – strona ustawiania nowego hasła po kliknięciu w link z e-maila.
- `/logout.ts` – endpoint do wylogowania (przekierowuje na stronę główną po wylogowaniu).

#### Zmiany w istniejących stronach

- `/index.astro` oraz inne strony publiczne: wyświetlanie przycisku "Zaloguj się" lub "Wyloguj" w zależności od stanu sesji.
- `/generate.astro` oraz widoki generowania/przeglądania fiszek:
  - Dla niezalogowanych: możliwość generowania i edycji fiszek w sesji tymczasowej (bez zapisu).
  - Dla zalogowanych: możliwość trwałego zapisu fiszek do konta.

#### Komponenty React (`src/components`)

- `AuthForm.tsx` – uniwersalny komponent obsługujący logowanie i rejestrację (przełączany przez props).
- `PasswordResetForm.tsx` – komponent do inicjowania resetu hasła.
- `SetNewPasswordForm.tsx` – komponent do ustawiania nowego hasła.
- `UserMenu.tsx` – menu użytkownika w layoucie (z opcją wylogowania).
- Rozszerzenie istniejących komponentów o obsługę błędów i komunikatów walidacyjnych.

#### Komponenty UI (`src/components/ui`)

- Wykorzystanie gotowych komponentów Shadcn/ui: `input`, `label`, `form`, `button`, `alert`, `card`, `dialog` do budowy formularzy i komunikatów.

#### Layout (`src/layouts/Layout.astro`)

- Dynamiczne renderowanie przycisków "Zaloguj się" / "Wyloguj" oraz menu użytkownika na podstawie stanu autentykacji (pobieranego z Supabase Auth).

### Odpowiedzialność warstw

- **Strony Astro**: odpowiadają za routing, SSR, pobieranie stanu sesji, przekazywanie props do komponentów React.
- **Komponenty React**: obsługują logikę formularzy, walidację, komunikację z Supabase Auth (przez client-side SDK), wyświetlanie komunikatów.
- **Komunikacja z backendem**:
  - Rejestracja, logowanie, reset hasła – bezpośrednio przez Supabase Auth JS SDK (client-side).
  - Zapis/przegląd fiszek – przez API aplikacji, z tokenem użytkownika (jeśli zalogowany).

### Walidacja i obsługa błędów

- Walidacja po stronie klienta (np. poprawność e-maila, długość hasła, zgodność haseł przy rejestracji).
- Walidacja po stronie Supabase (np. unikalność e-maila, poprawność tokenu resetu).
- Komunikaty błędów i sukcesu wyświetlane w komponentach React (`alert` z Shadcn/ui).
- Obsługa przypadków: błędne dane logowania, nieistniejący e-mail, nieprawidłowy token resetu, zbyt słabe hasło, próba rejestracji na już istniejący e-mail.

### Scenariusze użytkownika

- **Logowanie**: użytkownik podaje e-mail i hasło, po sukcesie przekierowanie do `/generate` lub strony docelowej.
- **Rejestracja**: użytkownik podaje e-mail, hasło, powtórzenie hasła; po sukcesie automatyczne logowanie lub informacja o konieczności potwierdzenia e-maila (jeśli włączone).
- **Reset hasła**: użytkownik podaje e-mail, otrzymuje link, ustawia nowe hasło.
- **Wylogowanie**: po kliknięciu "Wyloguj" sesja jest usuwana, użytkownik przekierowany na stronę główną.

---

## 2. LOGIKA BACKENDOWA

### Endpointy API (`src/pages/api`)

- **Brak własnych endpointów do rejestracji/logowania** – całość obsługuje Supabase Auth (SDK po stronie klienta).
- **API do zarządzania fiszkami** (`flashcards.ts`, `generations.ts`):
  - Rozszerzenie o autoryzację – sprawdzanie tokena użytkownika (JWT z Supabase) w nagłówku.
  - Odrzucanie żądań zapisu/przeglądu fiszek bez ważnej sesji (dla operacji wymagających autoryzacji).

### Modele danych

- **Użytkownicy**: zarządzani przez Supabase Auth (brak własnej tabeli users w bazie, korzystamy z wbudowanej).
- **Fiszki**: powiązane z `user_id` (UUID z Supabase Auth).
- **Sesje**: zarządzane przez Supabase (tokeny JWT, cookies).

### Walidacja i obsługa wyjątków

- Walidacja danych wejściowych po stronie API (np. czy `user_id` z tokena zgadza się z żądaniem).
- Obsługa błędów autoryzacji (401 Unauthorized, 403 Forbidden).
- Zwracanie czytelnych komunikatów błędów do klienta.

### Renderowanie server-side

- W plikach `.astro` SSR pobiera stan sesji z Supabase (np. przez cookies lub SDK).
- Przekazywanie informacji o użytkowniku do layoutu i stron (np. do wyświetlania menu użytkownika).

---

## 3. SYSTEM AUTENTYKACJI

### Supabase Auth + Astro

- **Rejestracja, logowanie, reset hasła**: realizowane przez Supabase Auth JS SDK (client-side).
- **Wylogowanie**: usuwanie sesji przez SDK, przekierowanie na stronę główną.
- **Ochrona stron**:
  - Strony wymagające autoryzacji (np. kolekcje, sesja nauki) sprawdzają obecność sesji po stronie serwera (SSR) i przekierowują niezalogowanych na `/login`.
  - API sprawdza ważność tokena JWT w nagłówku Authorization.

### Integracja z Astro

- **SSR**: pobieranie sesji użytkownika w getServerSideProps lub analogicznej funkcji Astro (np. w middleware).
- **Client-side**: komponenty React korzystają z Supabase Auth JS SDK do obsługi sesji i akcji użytkownika.
- **Middleware**: opcjonalnie, do globalnej ochrony wybranych ścieżek (np. `/collections`, `/study-session`).

### Bezpieczeństwo

- Hasła nigdy nie są przesyłane ani przechowywane w aplikacji – całość obsługuje Supabase.
- Tokeny JWT przechowywane w httpOnly cookies.
- Brak zewnętrznych providerów logowania (Google, GitHub itp.).
- Obsługa RODO: użytkownik może usunąć konto i powiązane fiszki (Supabase API + usuwanie powiązanych rekordów).

---

## Kluczowe komponenty i kontrakty

- **Komponenty React**: `AuthForm`, `PasswordResetForm`, `SetNewPasswordForm`, `UserMenu`
- **Strony Astro**: `/login.astro`, `/register.astro`, `/reset-password.astro`, `/reset-password/[token].astro`
- **API**: Rozszerzenie istniejących endpointów o autoryzację JWT
- **Supabase Auth**: rejestracja, logowanie, reset hasła, usuwanie konta
- **SSR/Middleware**: ochrona stron wymagających autoryzacji

---

## Uwagi końcowe

- Całość architektury jest zgodna z wymaganiami PRD (w tym US-003, US-004) oraz stackiem technologicznym.
- Nie narusza istniejącego działania aplikacji – użytkownicy niezalogowani mogą generować i edytować fiszki w sesji tymczasowej, ale zapis wymaga logowania.
- System jest skalowalny, bezpieczny i zgodny z RODO.

---

# Diagramy i przepływy

## 1. Przepływ rejestracji i logowania (diagram sekwencji)

- Przepływ POST /api/auth/signup oraz /api/auth/login obejmuje:
  - Walidację danych wejściowych (email, hasło) po stronie klienta i serwera.
  - Obsługę błędów (np. email zajęty, nieprawidłowe dane) z odpowiednimi komunikatami.
  - Po udanej rejestracji/logowaniu: ustawienie tokena JWT w httpOnly cookie, inicjalizację globalnego store (np. Zustand), przekierowanie do odpowiedniego widoku.
  - Obsługę wygasania/odświeżania tokena oraz wylogowania (usunięcie cookie, przekierowanie).

## 2. Przepływ dostępów i stanów aplikacji (diagram stanów)

- Użytkownik niezalogowany:
  - Ma dostęp do podstawowej funkcjonalności (tworzenie i podgląd fiszek, ale bez zapisu kolekcji).
  - Próba zapisu kolekcji lub wejścia w funkcje wymagające autoryzacji skutkuje przekierowaniem do logowania lub komunikatem "Wymagane logowanie".
- Użytkownik zalogowany:
  - Ma pełny dostęp do zarządzania kolekcjami (tworzenie, edycja, usuwanie, zapis kolekcji).
  - Może się wylogować, co skutkuje powrotem do ograniczonego widoku.

## 3. Walidacja i obsługa błędów

- Walidacja po stronie klienta: format email, długość hasła, zgodność haseł.
- Walidacja po stronie serwera: unikalność emaila, poprawność danych logowania.
- Komunikaty błędów zgodne z design systemem.

## 4. Przekierowania i ochrona zasobów

- Middleware oraz SSR sprawdzają ważność tokena JWT przy próbie dostępu do chronionych zasobów.
- W przypadku braku lub wygaśnięcia tokena – przekierowanie do /auth/login.
- Po odświeżeniu tokena – kontynuacja żądania, w przeciwnym razie – wylogowanie.

## 5. Integracja z UI

- Komponenty Topbar, Sidebar, Panel użytkownika dynamicznie reagują na stan autoryzacji (props z SSR/store Zustand).
- Przycisk logowania/rejestracji widoczny tylko dla niezalogowanych, przycisk wylogowania i panel kolekcji – tylko dla zalogowanych.
