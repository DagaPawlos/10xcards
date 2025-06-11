#!/bin/bash

echo "Test 1: Valid update"
curl -X PUT http://localhost:3000/api/flashcards/1 \
-H "Content-Type: application/json" \
-d '{
  "front": "Updated question",
  "back": "Updated answer",
  "source": "manual"
}'
echo -e "\n\n"

echo "Test 2: Invalid data (text too long)"
curl -X PUT http://localhost:3000/api/flashcards/1 \
-H "Content-Type: application/json" \
-d "{
  \"front\": \"$(printf 'x%.0s' {1..250})\",
  \"back\": \"Short answer\"
}"
echo -e "\n\n"

echo "Test 3: Non-existent flashcard"
curl -X PUT http://localhost:3000/api/flashcards/99999 \
-H "Content-Type: application/json" \
-d '{
  "front": "Test question",
  "back": "Test answer"
}'
echo -e "\n\n"

echo "Test 4: Invalid ID format"
curl -X PUT http://localhost:3000/api/flashcards/invalid_id \
-H "Content-Type: application/json" \
-d '{
  "front": "Test question",
  "back": "Test answer"
}'
echo -e "\n\n"

echo "Test 5: Invalid source value"
curl -X PUT http://localhost:3000/api/flashcards/1 \
-H "Content-Type: application/json" \
-d '{
  "front": "Test question",
  "source": "invalid_source"
}'
echo -e "\n\n" 