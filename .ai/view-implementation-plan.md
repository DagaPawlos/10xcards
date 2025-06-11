# API Endpoint Implementation Plan: GET /flashcards

## 1. Przegląd punktu końcowego

Endpoint służy do pobierania paginowanej, filtrowalnej i sortowalnej listy fiszek dla zalogowanego użytkownika. Umożliwia elastyczne przeglądanie kolekcji fiszek z możliwością dostosowania wyników poprzez parametry paginacji, sortowania i filtrowania. Endpoint wykorzystuje Row Level Security (RLS) Supabase do zapewnienia, że użytkownicy mają dostęp tylko do własnych fiszek.

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **URL**: `/flashcards`
- **Parametry**:
  - **Opcjonalne**:
    - `page` (number, default: 1) - numer strony
    - `limit` (number, default: 10) - liczba wyników na stronę
    - `sort` (string) - pole do sortowania (np. 'created_at', 'updated_at')
    - `order` ('asc' lub 'desc') - kierunek sortowania
    - `source` (string) - filtrowanie po źródle fiszki
    - `generation_id` (number) - filtrowanie po ID generacji
- **Przykład URL**: `/flashcards?page=2&limit=20&sort=created_at&order=desc&source=manual`

## 3. Wykorzystywane typy

```typescript
// Response DTO dla pojedynczej fiszki
type FlashcardDto = {
  id: number;
  front: string;
  back: string;
  source: string;
  generation_id: number | null;
  created_at: string;
  updated_at: string;
};

// DTO dla informacji o paginacji
interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}

// DTO dla pełnej odpowiedzi
interface FlashcardsListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}
```

## 4. Szczegóły odpowiedzi

- **Sukces (HTTP 200)**:

  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "Question",
        "back": "Answer",
        "source": "manual",
        "generation_id": null,
        "created_at": "2024-03-21T12:00:00Z",
        "updated_at": "2024-03-21T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
  ```

- **Kody statusu**:
  - 200: Pomyślne pobranie listy
  - 400: Nieprawidłowe parametry zapytania
  - 401: Brak autoryzacji
  - 500: Błąd serwera

## 5. Przepływ danych

1. Walidacja parametrów zapytania:

   - Konwersja i walidacja `page` i `limit`
   - Walidacja dozwolonych wartości dla `sort` i `order`
   - Walidacja opcjonalnych filtrów

2. Wywołanie serwisu `flashcard.service`:

   - Budowa zapytania Supabase z uwzględnieniem filtrów
   - Pobranie liczby wszystkich pasujących rekordów (total)
   - Zastosowanie paginacji i sortowania
   - Pobranie wynikowej listy fiszek

3. Przygotowanie odpowiedzi:
   - Mapowanie danych do DTO
   - Utworzenie obiektu paginacji
   - Zwrócenie sformatowanej odpowiedzi

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja**:

  - Wykorzystanie Supabase Auth do weryfikacji tokena
  - Row Level Security (RLS) w bazie danych
  - Polityki RLS ograniczające dostęp do własnych fiszek użytkownika

- **Walidacja danych**:

  - Sanityzacja parametrów zapytania
  - Walidacja zakresów liczbowych dla paginacji
  - Walidacja dozwolonych wartości dla sortowania i filtrowania

- **Ochrona przed nadużyciami**:
  - Limit maksymalnej liczby wyników na stronę
  - Parametryzowane zapytania do bazy danych
  - Logowanie nietypowych wzorców dostępu

## 7. Obsługa błędów

- **Błędy walidacji (400)**:

  - Nieprawidłowy format parametrów numerycznych
  - Niedozwolone wartości sortowania lub filtrowania
  - Przekroczenie limitów paginacji

- **Błędy autoryzacji (401)**:

  - Brak tokena uwierzytelniającego
  - Nieprawidłowy token
  - Token wygasł

- **Błędy serwera (500)**:
  - Problemy z bazą danych
  - Nieoczekiwane błędy serwera
  - Błędy w logice biznesowej

## 8. Rozważania dotyczące wydajności

- **Optymalizacja zapytań**:

  - Indeksy na kolumnach używanych do sortowania i filtrowania
  - Limit maksymalnej liczby wyników na stronę
  - Optymalizacja count() dla dużych zbiorów danych

- **Cachowanie**:
  - Możliwość cachowania wyników dla popularnych kombinacji parametrów
  - Invalidacja cache przy modyfikacji fiszek

## 9. Etapy wdrożenia

1. Utworzenie pliku endpointu w `/src/pages/api/flashcards.ts`:

   ```typescript
   export const prerender = false;

   // Schemat walidacji parametrów
   const queryParamsSchema = z.object({
     page: z.coerce.number().positive().default(1),
     limit: z.coerce.number().min(1).max(100).default(10),
     sort: z.enum(["created_at", "updated_at"]).optional(),
     order: z.enum(["asc", "desc"]).default("desc"),
     source: z.enum(["ai-full", "ai-edited", "manual"]).optional(),
     generation_id: z.coerce.number().optional(),
   });
   ```

2. Rozszerzenie serwisu w `/src/lib/services/flashcard.service.ts`:

   ```typescript
   async getFlashcards(params: {
     page: number;
     limit: number;
     sort?: string;
     order?: 'asc' | 'desc';
     source?: string;
     generation_id?: number;
   }): Promise<FlashcardsListResponseDto> {
     // Implementacja pobierania fiszek
   }
   ```

3. Implementacja logiki endpointu:

   - Walidacja parametrów zapytania
   - Obsługa błędów
   - Integracja z serwisem
   - Formatowanie odpowiedzi

4. Dodanie testów:

   - Testy jednostkowe endpointu
   - Testy jednostkowe serwisu
   - Testy integracyjne z bazą danych
   - Testy wydajnościowe dla dużych zbiorów danych

5. Dokumentacja i przegląd:
   - Aktualizacja dokumentacji API
   - Code review
   - Testy wydajnościowe
   - Weryfikacja zgodności z zasadami implementacji

# API Endpoint Implementation Plan: GET /flashcards/{id}

## 1. Przegląd punktu końcowego

Endpoint służy do pobierania szczegółowych informacji o pojedynczej fiszce na podstawie jej identyfikatora. Endpoint wymaga uwierzytelnienia i zapewnia, że użytkownicy mogą uzyskać dostęp tylko do własnych fiszek.

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **URL**: /flashcards/{id}
- **Parametry**:
  - **Wymagane**:
    - `id`: Identyfikator fiszki (parametr ścieżki)
  - **Opcjonalne**: brak
- **Headers**:
  - `Authorization`: Bearer token (wymagany)

## 3. Wykorzystywane typy

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
    "front": "Question",
    "back": "Answer",
    "source": "manual",
    "generation_id": null,
    "created_at": "2024-03-21T12:00:00Z",
    "updated_at": "2024-03-21T12:00:00Z"
  }
  ```

- **Kody statusu**:
  - 200: Pomyślne pobranie fiszki
  - 401: Brak autoryzacji
  - 404: Fiszka nie znaleziona
  - 500: Błąd serwera

## 5. Przepływ danych

1. Walidacja parametru ID w ścieżce URL
2. Sprawdzenie uwierzytelnienia użytkownika
3. Pobranie fiszki z bazy danych przez FlashcardService
4. Weryfikacja właściciela fiszki (RLS w Supabase)
5. Transformacja danych do formatu DTO
6. Zwrócenie odpowiedzi

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja**:

  - Wykorzystanie Supabase Auth do weryfikacji tokena
  - Row Level Security (RLS) w bazie danych do izolacji danych użytkowników
  - Walidacja właściciela fiszki przed zwróceniem danych

- **Walidacja danych**:

  - Sprawdzenie poprawności formatu ID
  - Sanityzacja parametrów URL

- **Ochrona przed nadużyciami**:
  - Rate limiting na poziomie endpointu
  - Logowanie nieudanych prób dostępu

## 7. Obsługa błędów

- **Błędy autoryzacji (401)**:

  - Brak tokena uwierzytelniającego
  - Nieprawidłowy token
  - Token wygasł

- **Błędy zasobu (404)**:

  - Fiszka o podanym ID nie istnieje
  - Fiszka należy do innego użytkownika

- **Błędy serwera (500)**:
  - Problemy z bazą danych
  - Nieoczekiwane błędy serwera

## 8. Rozważania dotyczące wydajności

- **Optymalizacja zapytań**:

  - Indeks na kolumnie id w tabeli flashcards
  - Pojedyncze zapytanie do bazy danych
  - Wykorzystanie RLS do filtrowania na poziomie bazy danych

- **Cachowanie**:
  - Możliwość implementacji cachowania po stronie klienta (ETag)
  - Cachowanie zapytań do bazy danych

## 9. Etapy wdrożenia

1. Utworzenie pliku endpointu w `/src/pages/api/flashcards/[id].ts`:

   ```typescript
   export const prerender = false;

   // Schemat walidacji parametru ID
   const paramsSchema = z.object({
     id: z.coerce.number().positive("ID must be a positive number"),
   });

   export const GET: APIRoute = async ({ params, locals }) => {
     try {
       // Walidacja parametru ID
       const validationResult = paramsSchema.safeParse(params);
       if (!validationResult.success) {
         return new Response(
           JSON.stringify({
             error: "Invalid flashcard ID",
             details: validationResult.error.errors,
           }),
           {
             status: 400,
             headers: { "Content-Type": "application/json" },
           }
         );
       }

       const flashcardService = new FlashcardService(locals.supabase);
       const flashcard = await flashcardService.getFlashcardById(validationResult.data.id);

       if (!flashcard) {
         return new Response(
           JSON.stringify({
             error: "Flashcard not found",
           }),
           {
             status: 404,
             headers: { "Content-Type": "application/json" },
           }
         );
       }

       return new Response(JSON.stringify(flashcard), {
         status: 200,
         headers: { "Content-Type": "application/json" },
       });
     } catch (error) {
       console.error("Error fetching flashcard:", error);
       return new Response(
         JSON.stringify({
           error: "Internal server error",
           message: "Failed to fetch flashcard",
         }),
         {
           status: 500,
           headers: { "Content-Type": "application/json" },
         }
       );
     }
   };
   ```

2. Dodanie metody `getFlashcardById` do `FlashcardService`:

   ```typescript
   async getFlashcardById(id: number): Promise<FlashcardDto | null> {
     const { data, error } = await this.supabase
       .from("flashcards")
       .select("*")
       .eq("id", id)
       .single();

     if (error) {
       console.error("Error fetching flashcard:", error);
       throw error;
     }

     return data ? this.mapToDto(data) : null;
   }
   ```

3. Dodanie testów jednostkowych i integracyjnych:

   - Test pobierania istniejącej fiszki
   - Test obsługi nieistniejącej fiszki
   - Test autoryzacji
   - Test walidacji parametrów

4. Aktualizacja dokumentacji API:

   - Dodanie nowego endpointu do dokumentacji
   - Przykłady użycia
   - Opis kodów błędów

5. Code review i testy:
   - Przegląd implementacji
   - Testy wydajnościowe
   - Testy bezpieczeństwa
