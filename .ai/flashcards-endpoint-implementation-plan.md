# API Endpoint Implementation Plan: POST /flashcards

## 1. Przegląd punktu końcowego

Endpoint służy do tworzenia jednej lub wielu fiszek jednocześnie. Fiszki mogą pochodzić z ręcznego wprowadzania lub być wynikiem wcześniejszej generacji AI. Endpoint zapewnia walidację danych wejściowych i zapisuje fiszki w bazie danych z odpowiednim powiązaniem z użytkownikiem.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **URL**: /flashcards
- **Parametry**:
  - **Wymagane**:
    - `flashcards`: Tablica obiektów typu FlashcardCreateDto
  - **Opcjonalne**: brak
- **Przykład Request Body**:
  ```json
  {
    "flashcards": [
      {
        "front": "Question 1",
        "back": "Answer 1",
        "source": "manual",
        "generation_id": null
      },
      {
        "front": "Question 2",
        "back": "Answer 2",
        "source": "ai-full",
        "generation_id": 123
      }
    ]
  }
  ```

## 3. Wykorzystywane typy

- **FlashcardCreateDto**: Model pojedynczej fiszki do utworzenia
  ```typescript
  {
    front: string;
    back: string;
    source: "ai-full" | "ai-edited" | "manual";
    generation_id: number | null;
  }
  ```
- **FlashcardsCreateCommand**: Model żądania
  ```typescript
  {
    flashcards: FlashcardCreateDto[];
  }
  ```
- **FlashcardDto**: Model odpowiedzi dla pojedynczej fiszki
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

- **Sukces (HTTP 201)**:

  ```json
  {
    "flashcards": [
      {
        "id": 1,
        "front": "Question 1",
        "back": "Answer 1",
        "source": "manual",
        "generation_id": null,
        "created_at": "2024-03-21T12:00:00Z",
        "updated_at": "2024-03-21T12:00:00Z"
      }
    ]
  }
  ```

- **Kody statusu**:
  - 201: Pomyślne utworzenie fiszek
  - 400: Błędne dane wejściowe
  - 401: Brak autoryzacji
  - 500: Błąd serwera

## 5. Przepływ danych

1. Odbiór żądania POST z tablicą fiszek do utworzenia.
2. Walidacja danych wejściowych za pomocą biblioteki `zod`:
   - Sprawdzenie, czy tablica nie jest pusta
   - Dla każdej fiszki:
     - Walidacja długości pól `front` (max 200 znaków) i `back` (max 500 znaków)
     - Walidacja pola `source` (dozwolone wartości: "ai-full", "ai-edited", "manual")
     - Walidacja `generation_id` (wymagane dla "ai-full" i "ai-edited", null dla "manual")
3. Wywołanie dedykowanego serwisu (`flashcard.service`), który:
   - Sprawdza istnienie `generation_id` w bazie danych (jeśli podane)
   - Tworzy nowe rekordy w tabeli `flashcards`
   - Przypisuje fiszki do zalogowanego użytkownika
4. Zwrócenie odpowiedzi do klienta z utworzonymi fiszkami.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja**:

  - Endpoint wymaga uwierzytelnienia przez Supabase Auth
  - Użycie Row Level Security (RLS) w bazie danych do izolacji danych użytkowników
  - Walidacja `generation_id` tylko dla fiszek danego użytkownika

- **Walidacja danych**:

  - Dokładna walidacja wszystkich pól wejściowych
  - Sanityzacja danych tekstowych
  - Sprawdzanie limitów długości pól

- **Ochrona przed nadużyciami**:
  - Rozważenie implementacji rate limitingu
  - Ograniczenie maksymalnej liczby fiszek w jednym żądaniu

## 7. Obsługa błędów

- **Błędy walidacji (400)**:

  - Nieprawidłowa długość pól
  - Niedozwolona wartość source
  - Brak wymaganego generation_id
  - Nieprawidłowy format danych

- **Błędy autoryzacji (401)**:

  - Brak lub nieprawidłowy token uwierzytelniający

- **Błędy serwera (500)**:
  - Problemy z bazą danych
  - Nieoczekiwane błędy serwera

## 8. Rozważania dotyczące wydajności

- **Operacje bazodanowe**:

  - Użycie transakcji do zapewnienia atomowości operacji
  - Zoptymalizowane zapytania do bazy danych
  - Indeksy na często używanych polach

- **Walidacja**:
  - Szybkie sprawdzenie podstawowych warunków przed szczegółową walidacją
  - Efektywna walidacja tablicy fiszek

## 9. Etapy wdrożenia

1. Utworzenie pliku endpointu w `/src/pages/api/flashcards.ts`:

   ```typescript
   export const prerender = false;

   // Schemat walidacji
   const flashcardCreateSchema = z.object({
     front: z.string().max(200),
     back: z.string().max(500),
     source: z.enum(["ai-full", "ai-edited", "manual"]),
     generation_id: z.number().nullable(),
   });

   const flashcardsCreateSchema = z.object({
     flashcards: z
       .array(flashcardCreateSchema)
       .min(1)
       .refine((cards) =>
         cards.every(
           (card) =>
             (card.source === "manual" && card.generation_id === null) ||
             (["ai-full", "ai-edited"].includes(card.source) && card.generation_id !== null)
         )
       ),
   });
   ```

2. Utworzenie serwisu w `/src/lib/services/flashcard.service.ts`:

   ```typescript
   export class FlashcardService {
     constructor(private supabase: SupabaseClient) {}

     async createFlashcards(flashcards: FlashcardCreateDto[]): Promise<FlashcardDto[]> {
       // Implementacja logiki tworzenia fiszek
     }
   }
   ```

3. Implementacja logiki endpointu:

   - Walidacja żądania
   - Obsługa błędów
   - Integracja z serwisem
   - Zwracanie odpowiedzi

4. Dodanie testów jednostkowych i integracyjnych:

   - Testy walidacji
   - Testy tworzenia fiszek
   - Testy obsługi błędów

5. Dokumentacja i przegląd kodu:
   - Aktualizacja dokumentacji API
   - Code review
   - Testy wydajnościowe
