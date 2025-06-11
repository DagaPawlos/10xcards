# API Endpoint Implementation Plan: PUT /flashcards/{id}

## 1. Przegląd punktu końcowego

Endpoint służy do aktualizacji istniejącej fiszki. Umożliwia częściową aktualizację danych fiszki (partial update), gdzie można zaktualizować dowolne z dostępnych pól. Podczas aktualizacji następuje walidacja uprawnień użytkownika oraz poprawności wprowadzanych danych. Pole `updated_at` jest automatycznie aktualizowane przez trigger bazy danych.

## 2. Szczegóły żądania

- **Metoda HTTP**: PUT
- **URL**: `/flashcards/{id}`
- **Parametry**:
  - **Wymagane**:
    - `id` (path parameter) - identyfikator fiszki
  - **Opcjonalne** (w request body):
    - `front` (string, max 200 znaków)
    - `back` (string, max 500 znaków)
    - `source` ("ai-edited" lub "manual")
- **Przykład Request Body**:
  ```json
  {
    "front": "Updated question",
    "back": "Updated answer",
    "source": "manual"
  }
  ```

## 3. Wykorzystywane typy

- **FlashcardUpdateDto**: Model aktualizacji
  ```typescript
  {
    front?: string;
    back?: string;
    source?: "ai-edited" | "manual";
  }
  ```
- **FlashcardDto**: Model odpowiedzi
  ```typescript
  {
    id: number;
    front: string;
    back: string;
    source: string;
    generation_id: number | null;
    created_at: string;
    updated_at: string;
  }
  ```

## 4. Szczegóły odpowiedzi

- **Sukces (HTTP 200)**:

  ```json
  {
    "id": 1,
    "front": "Updated question",
    "back": "Updated answer",
    "source": "manual",
    "generation_id": null,
    "created_at": "2024-03-21T12:00:00Z",
    "updated_at": "2024-03-21T12:30:00Z"
  }
  ```

- **Kody statusu**:
  - 200: Pomyślna aktualizacja
  - 400: Błędne dane wejściowe
  - 401: Brak autoryzacji
  - 404: Fiszka nie znaleziona
  - 500: Błąd serwera

## 5. Przepływ danych

1. Odbiór żądania PUT z ID fiszki i opcjonalnymi danymi do aktualizacji.
2. Walidacja ID fiszki (konwersja na number).
3. Walidacja danych wejściowych za pomocą biblioteki `zod`:
   - Sprawdzenie długości pól tekstowych
   - Walidacja dozwolonych wartości source
4. Wywołanie serwisu `flashcard.service`:
   - Sprawdzenie istnienia fiszki
   - Weryfikacja właściciela fiszki
   - Aktualizacja danych
   - Automatyczna aktualizacja `updated_at` przez trigger bazy danych
5. Zwrócenie zaktualizowanej fiszki.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja**:

  - Endpoint wymaga uwierzytelnienia przez Supabase Auth
  - Weryfikacja właściciela fiszki przed aktualizacją
  - Row Level Security (RLS) w bazie danych

- **Walidacja danych**:

  - Sanityzacja pól tekstowych
  - Sprawdzanie limitów długości
  - Walidacja dozwolonych wartości source

- **Ochrona przed nadużyciami**:
  - Weryfikacja właściciela zasobu
  - Logowanie nieudanych prób dostępu

## 7. Obsługa błędów

- **Błędy walidacji (400)**:

  - Nieprawidłowy format ID
  - Przekroczenie maksymalnej długości pól
  - Niedozwolona wartość source

- **Błędy autoryzacji (401)**:

  - Brak lub nieprawidłowy token uwierzytelniający

- **Błędy dostępu (404)**:

  - Fiszka nie istnieje
  - Fiszka należy do innego użytkownika

- **Błędy serwera (500)**:
  - Problemy z bazą danych
  - Nieoczekiwane błędy serwera

## 8. Rozważania dotyczące wydajności

- **Operacje bazodanowe**:

  - Wykorzystanie indeksu na kolumnie id
  - Wykorzystanie indeksu na kolumnie user_id
  - Trigger updated_at zoptymalizowany dla częstych aktualizacji

- **Walidacja**:
  - Szybkie sprawdzenie podstawowych warunków przed szczegółową walidacją
  - Efektywna walidacja pól opcjonalnych

## 9. Etapy wdrożenia

1. Utworzenie pliku endpointu w `/src/pages/api/flashcards/[id].ts`:

   ```typescript
   export const prerender = false;

   // Schemat walidacji
   const flashcardUpdateSchema = z.object({
     front: z.string().max(200).optional(),
     back: z.string().max(500).optional(),
     source: z.enum(["ai-edited", "manual"]).optional(),
   });
   ```

2. Rozszerzenie serwisu w `/src/lib/services/flashcard.service.ts`:

   ```typescript
   async updateFlashcard(id: number, data: FlashcardUpdateDto): Promise<FlashcardDto> {
     // Implementacja aktualizacji fiszki
   }
   ```

3. Implementacja logiki endpointu:

   - Walidacja parametrów
   - Obsługa błędów
   - Integracja z serwisem
   - Zwracanie odpowiedzi

4. Dodanie testów:

   - Testy jednostkowe endpointu
   - Testy jednostkowe serwisu
   - Testy integracyjne z bazą danych

5. Dokumentacja i przegląd:
   - Aktualizacja dokumentacji API
   - Code review
   - Testy wydajnościowe
