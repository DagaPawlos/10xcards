# API Endpoint Implementation Plan: GET /generations

## 1. Overview

The endpoint retrieves a paginated list of generation requests. Each generation includes metadata about the AI generation process and its results. For now, we'll skip authorization and return all generations.

## 2. Request Details

- **HTTP Method**: GET
- **URL**: /generations
- **Query Parameters**:

  - **Optional**:
    - `page` (default: 1): Page number for pagination
    - `limit` (default: 10, max: 100): Number of items per page
    - `sort` (default: "created_at"): Field to sort by
    - `order` (default: "desc"): Sort order ("asc" or "desc")

- **Example Request**:
  ```
  GET /generations?page=1&limit=10&sort=created_at&order=desc
  ```

## 3. Types Used

- **Generation**: Base database type

  ```typescript
  {
    id: number;
    user_id: string;
    model: string;
    generated_count: number;
    accepted_unedited_count: number;
    accepted_edited_count: number;
    source_text_hash: string;
    source_text_length: number;
    generation_duration: number;
    created_at: string;
    updated_at: string;
  }
  ```

- **PaginationDto**: Pagination metadata

  ```typescript
  {
    page: number;
    limit: number;
    total: number;
  }
  ```

- **GenerationsListResponseDto**: Response model
  ```typescript
  {
    data: Generation[];
    pagination: PaginationDto;
  }
  ```

## 4. Response Details

- **Success (HTTP 200)**:

  ```json
  {
    "data": [
      {
        "id": 1,
        "user_id": "123",
        "model": "gpt-4",
        "generated_count": 5,
        "accepted_unedited_count": 3,
        "accepted_edited_count": 1,
        "source_text_hash": "abc123",
        "source_text_length": 1500,
        "generation_duration": 2500,
        "created_at": "2024-03-21T12:00:00Z",
        "updated_at": "2024-03-21T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50
    }
  }
  ```

- **Status Codes**:
  - 200: Successful retrieval
  - 400: Invalid query parameters
  - 500: Server error

## 5. Data Flow

1. Receive GET request with optional query parameters
2. Validate query parameters using `zod`:
   - `page`: Positive integer
   - `limit`: Integer between 1 and 100
   - `sort`: One of allowed fields
   - `order`: "asc" or "desc"
3. Call dedicated service (`generation.service`) to:
   - Count total number of generations
   - Fetch paginated list of generations
4. Return response with generations and pagination metadata

## 6. Error Handling

- **Query Parameter Validation (400)**:

  - Invalid page number
  - Invalid limit
  - Invalid sort field
  - Invalid sort order

- **Server Errors (500)**:
  - Database errors
  - Unexpected server errors

## 7. Performance Considerations

- **Database Operations**:

  - Use efficient pagination queries
  - Add indexes on commonly sorted fields
  - Optimize count query for large datasets

- **Response Size**:
  - Enforce reasonable page size limits
  - Consider implementing cursor-based pagination for large datasets

## 8. Implementation Steps

1. Create endpoint file in `/src/pages/api/generations/index.ts`:

   ```typescript
   // Validation schema
   const listGenerationsSchema = z.object({
     page: z.coerce.number().positive().default(1),
     limit: z.coerce.number().min(1).max(100).default(10),
     sort: z.enum(["created_at", "updated_at"]).default("created_at"),
     order: z.enum(["asc", "desc"]).default("desc"),
   });
   ```

2. Add method to `GenerationService`:

   ```typescript
   async getGenerations(params: ListGenerationsParams): Promise<GenerationsListResponseDto> {
     // Implementation of pagination and sorting logic
   }
   ```

3. Implement endpoint logic:

   - Parameter validation
   - Error handling
   - Service integration
   - Response formatting

4. Add tests:

   - Parameter validation
   - Pagination
   - Sorting
   - Error cases

5. Documentation and review:
   - Update API documentation
   - Code review
   - Performance testing
