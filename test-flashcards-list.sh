#!/bin/bash

echo "Test 1: Basic list (default pagination)"
curl -X GET "http://localhost:3000/api/flashcards" \
-H "Content-Type: application/json"
echo -e "\n\n"

echo "Test 2: Custom pagination (page 2, limit 5)"
curl -X GET "http://localhost:3000/api/flashcards?page=2&limit=5" \
-H "Content-Type: application/json"
echo -e "\n\n"

echo "Test 3: Sorting (by created_at desc)"
curl -X GET "http://localhost:3000/api/flashcards?sort=created_at&order=desc" \
-H "Content-Type: application/json"
echo -e "\n\n"

echo "Test 4: Filtering by source"
curl -X GET "http://localhost:3000/api/flashcards?source=manual" \
-H "Content-Type: application/json"
echo -e "\n\n"

echo "Test 5: Invalid pagination (negative page)"
curl -X GET "http://localhost:3000/api/flashcards?page=-1" \
-H "Content-Type: application/json"
echo -e "\n\n"

echo "Test 6: Invalid sort field"
curl -X GET "http://localhost:3000/api/flashcards?sort=invalid_field" \
-H "Content-Type: application/json"
echo -e "\n\n"

echo "Test 7: Invalid source value"
curl -X GET "http://localhost:3000/api/flashcards?source=invalid_source" \
-H "Content-Type: application/json"
echo -e "\n\n"

echo "Test 8: Combined filters (manual source, sorted by updated_at)"
curl -X GET "http://localhost:3000/api/flashcards?source=manual&sort=updated_at&order=asc" \
-H "Content-Type: application/json"
echo -e "\n\n"

echo "Test 9: Filter by generation_id"
curl -X GET "http://localhost:3000/api/flashcards?generation_id=1" \
-H "Content-Type: application/json"
echo -e "\n\n" 