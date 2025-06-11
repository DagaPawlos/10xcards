#!/bin/bash

echo "Setup: Creating a test flashcard"
CREATE_RESPONSE=$(curl -X POST "http://localhost:3000/api/flashcards" \
-H "Content-Type: application/json" \
-d '{
  "flashcards": [{
    "front": "Test Question",
    "back": "Test Answer",
    "source": "manual",
    "generation_id": null
  }]
}')
echo "Create Response:"
echo "$CREATE_RESPONSE"
echo -e "\n"

# Extract the ID of the created flashcard
FLASHCARD_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Created flashcard ID: $FLASHCARD_ID"
echo -e "\n"

echo "Test 1: Get the created flashcard"
curl -X GET "http://localhost:3000/api/flashcards/$FLASHCARD_ID" \
-H "Content-Type: application/json"
echo -e "\n\n"

echo "Test 2: Invalid ID format (string instead of number)"
curl -X GET "http://localhost:3000/api/flashcards/abc" \
-H "Content-Type: application/json"
echo -e "\n\n"

echo "Test 3: Invalid ID (negative number)"
curl -X GET "http://localhost:3000/api/flashcards/-1" \
-H "Content-Type: application/json"
echo -e "\n\n"

echo "Test 4: Non-existent flashcard ID"
curl -X GET "http://localhost:3000/api/flashcards/99999" \
-H "Content-Type: application/json"
echo -e "\n\n"

echo "Test 5: Invalid ID (decimal number)"
curl -X GET "http://localhost:3000/api/flashcards/1.5" \
-H "Content-Type: application/json"
echo -e "\n\n" 