<img src="https://socialify.git.ci/siyamthandagwamanda/Library_API/image?language=1&owner=1&name=1&stargazers=1&theme=Light" alt="Library_API" width="640" height="320" />

# Library System API

TypeScript + Express REST API for managing Authors and Books.

## Quick Start

- Install deps: `npm install`
- Dev server: `npm run dev`
- Type-check: `npm run typecheck`
- Build: `npm run build`
- Start built app: `npm start`

Server runs on `http://localhost:3000` by default.

## Tech Stack

- Node.js, Express, TypeScript
- In-memory data store (no external DB)

## Project Structure

```
src/
  app.ts
  server.ts
  config/
  middleware/
    errorHandler.ts
    logger.ts
    validate.ts
  model/
    author.ts
    books.ts
  routes/
    authorRoute.ts
    bookRoute.ts
  controllers/
    authorsController.ts
    booksController.ts
```

## Endpoints

### Authors

- POST `/authors`
  - Body: `{ "name": string, "bio"?: string, "birthDate"?: "YYYY-MM-DD" }`
  - 201 Created → Author
  - 400 Bad Request
- GET `/authors`
  - 200 OK → Author[]
- GET `/authors/:id`
  - 200 OK → Author
  - 404 Not Found
- PUT `/authors/:id`
  - Body: `{ "name": string, "bio"?: string, "birthDate"?: "YYYY-MM-DD" }`
  - 200 OK → Author
  - 400 Bad Request | 404 Not Found
- DELETE `/authors/:id`
  - 204 No Content
  - 404 Not Found | 409 Conflict (author still has books)
- GET `/authors/:id/books`
  - Lists books for the author. Supports filters/sort/pagination (see below).
  - 200 OK → `{ data: Book[], meta }`
  - 404 Not Found (author does not exist)

### Books

- POST `/books`
  - Body: `{ "title": string, "authorId": number, "publishedDate"?: "YYYY-MM-DD" }`
  - 201 Created → Book
  - 400 Bad Request | 404 Not Found (invalid author) | 409 Conflict (duplicate title for author)
- GET `/books`
  - Supports filters/sort/pagination (see below).
  - 200 OK → `{ data: Book[], meta }`
- GET `/books/:id`
  - 200 OK → Book | 404 Not Found
- PUT `/books/:id`
  - Body: any subset of `{ "title": string, "authorId": number, "publishedDate": "YYYY-MM-DD" }` (at least one field)
  - 200 OK → Book
  - 400 Bad Request | 404 Not Found (book or author) | 409 Conflict (duplicate title for author)
- DELETE `/books/:id`
  - 204 No Content | 404 Not Found

## Data Models

```
Author { id: number, name: string, bio?: string, birthDate?: string }
Book   { id: number, title: string, authorId: number, publishedDate?: string }
```

IDs are assigned by the server and never reused while the server is running.

## Filtering, Sorting, Pagination

Available on:

- `GET /books`
- `GET /authors/:id/books`

Query parameters:

- Filtering
  - `q` or `title`: case-insensitive substring match on title
  - `author`: substring match on author name (only for `/books`)
  - `year`: exact year of `publishedDate`
  - `yearMin`, `yearMax`: inclusive range on the year of `publishedDate`
- Sorting
  - `sortBy`: one of `id`, `title`, `publishedDate` (default `id`)
  - `sortOrder`: `asc` (default) or `desc`
- Pagination
  - `page`: default `1`
  - `pageSize`: default `10`, max `100`

Example:

```
GET /books?q=stone&author=rowling&yearMin=1990&yearMax=2000&sortBy=publishedDate&sortOrder=desc&page=1&pageSize=5
```

Response shape for list endpoints:

```
{
  "data": [ /* items */ ],
  "meta": { "page": 1, "pageSize": 5, "total": 12, "totalPages": 3 }
}
```

Books without a `publishedDate` are excluded by year filters and sorted last.

## Validation

- Authors: `name` required, non-empty string. `bio` optional string. `birthDate` optional, valid date in `YYYY-MM-DD` format.
- Books: `title` required, non-empty string. `authorId` required positive integer that matches an existing author. `publishedDate` optional, valid date in `YYYY-MM-DD` format.
- On PUT, fields are validated only if sent, and at least one field must be sent.
- Invalid payloads are rejected by validation middleware before reaching the controller.

## Error Handling

Centralized error responses:

- 400 Bad Request: invalid input or malformed JSON
- 404 Not Found: resource or route not found, or `authorId` does not exist
- 409 Conflict: duplicate book title for the same author, or deleting an author who still has books
- 500 Internal Server Error: unexpected errors

Error body format:

```
{ "error": "Message" }
```

## Sample Requests

Create author:

```
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{"name":"Terry Pratchett","birthDate":"1948-04-28"}'
```

Create book (use the `id` returned for the author):

```
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Mort","publishedDate":"1987-11-12","authorId":1}'
```

List books with filters:

```
curl "http://localhost:3000/books?q=mort&sortBy=title&sortOrder=asc&page=1&pageSize=5"
```

List one author's books:

```
curl "http://localhost:3000/authors/1/books?yearMin=1980"
```

## Notes

- Data is in-memory; restarting the server resets data (including on every file save in `npm run dev`).
- Logger middleware prints method and URL for each request.
- `PUT` accepts partial bodies by design (only the fields sent are updated).
