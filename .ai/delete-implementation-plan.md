# API Endpoint Implementation Plan: DELETE /flashcards/{id}

## 1. Przegląd punktu końcowego

Endpoint służy do usuwania pojedynczej fiszki na podstawie jej identyfikatora. Operacja jest nieodwracalna i wymaga uwierzytelnienia. Endpoint zapewnia, że użytkownicy mogą usuwać tylko własne fiszki, wykorzystując Row Level Security (RLS) Supabase.

## 2. Szczegóły żądania

- **Metoda HTTP**: DELETE
- **URL**: /flashcards/{id}
- **Parametry**:
  - **Wymagane**:
    - `id`: Identyfikator fiszki (parametr ścieżki)
  - **Opcjonalne**: brak
- **Headers**:
  - `Authorization`: Bearer token (wymagany)

## 3. Szczegóły odpowiedzi

- **Sukces (HTTP 200)**:

  ```json
  {
    "message": "Flashcard successfully deleted",
    "id": 123
  }
  ```

- **Kody statusu**:
  - 200: Pomyślne usunięcie fiszki
  - 400: Nieprawidłowy format ID
  - 401: Brak autoryzacji
  - 404: Fiszka nie znaleziona
  - 500: Błąd serwera

## 4. Przepływ danych

1. Walidacja parametru ID w ścieżce URL
2. Sprawdzenie uwierzytelnienia użytkownika
3. Weryfikacja istnienia fiszki
4. Usunięcie fiszki z bazy danych przez FlashcardService
5. Zwrócenie potwierdzenia usunięcia

## 5. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja**:

  - Wykorzystanie Supabase Auth do weryfikacji tokena
  - Row Level Security (RLS) w bazie danych do izolacji danych użytkowników
  - Walidacja właściciela fiszki przed usunięciem

- **Walidacja danych**:

  - Sprawdzenie poprawności formatu ID
  - Sanityzacja parametrów URL

- **Ochrona przed nadużyciami**:
  - Rate limiting na poziomie endpointu
  - Logowanie operacji usuwania
  - Brak możliwości cofnięcia operacji (należy poinformować użytkownika)

## 6. Obsługa błędów

- **Błędy walidacji (400)**:

  - Nieprawidłowy format ID (nie jest liczbą całkowitą)
  - ID jest ujemne lub zero

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

## 7. Rozważania dotyczące wydajności

- **Optymalizacja zapytań**:

  - Indeks na kolumnie id w tabeli flashcards
  - Pojedyncze zapytanie do bazy danych
  - Wykorzystanie RLS do filtrowania na poziomie bazy danych

- **Transakcje**:
  - Operacja usuwania powinna być atomowa
  - W przypadku powiązanych danych, należy użyć kaskadowego usuwania lub SET NULL

## 8. Etapy wdrożenia

1. Rozszerzenie FlashcardService o metodę deleteFlashcard:

   ```typescript
   async deleteFlashcard(id: number): Promise<void> {
     const { error } = await this.supabase
       .from("flashcards")
       .delete()
       .eq("id", id);

     if (error) {
       if (error.code === "PGRST116") {
         throw new Error("Flashcard not found");
       }
       console.error("Error deleting flashcard:", {
         error,
         operation: "delete_flashcard",
         flashcard_id: id,
       });
       throw error;
     }
   }
   ```

2. Utworzenie pliku endpointu w `/src/pages/api/flashcards/[id].ts`:

   ```typescript
   // Schemat walidacji parametru ID
   const paramsSchema = z.object({
     id: z.coerce.number().positive("Flashcard ID must be a positive number").int("Flashcard ID must be an integer"),
   });

   export const DELETE: APIRoute = async ({ params, locals }): Promise<Response> => {
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
       await flashcardService.deleteFlashcard(validationResult.data.id);

       return new Response(
         JSON.stringify({
           message: "Flashcard successfully deleted",
           id: validationResult.data.id,
         }),
         {
           status: 200,
           headers: { "Content-Type": "application/json" },
         }
       );
     } catch (error) {
       if (error instanceof Error && error.message === "Flashcard not found") {
         return new Response(
           JSON.stringify({
             error: "Flashcard not found",
             message: "The requested flashcard does not exist or you don't have access to it",
           }),
           {
             status: 404,
             headers: { "Content-Type": "application/json" },
           }
         );
       }

       console.error("Error processing flashcard deletion:", {
         error,
         params,
         operation: "delete_flashcard",
       });

       return new Response(
         JSON.stringify({
           error: "Internal server error",
           message: "Failed to delete flashcard",
         }),
         {
           status: 500,
           headers: { "Content-Type": "application/json" },
         }
       );
     }
   };
   ```

3. Dodanie testów w `test-flashcard-delete.sh`:

   - Test usuwania istniejącej fiszki
   - Test usuwania nieistniejącej fiszki
   - Test nieprawidłowego formatu ID
   - Test braku autoryzacji

4. Aktualizacja dokumentacji API:

   - Dodanie nowego endpointu do dokumentacji
   - Przykłady użycia
   - Opis kodów błędów

5. Code review i testy:
   - Przegląd implementacji
   - Testy jednostkowe
   - Testy integracyjne
   - Testy bezpieczeństwa
