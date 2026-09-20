import type { Request, Response, NextFunction } from "express";
import { books, getNextBookId, type Book } from "../model/books.js";
import { authors } from "../model/author.js";

function authorExists(id: number) {
  return authors.some((a) => a.id === id);
}

// same title (ignoring upper/lower case) by the same author
function titleTaken(title: string, authorId: number, ignoreId?: number) {
  return books.some(
    (b) =>
      b.authorId === authorId &&
      b.title.toLowerCase() === title.toLowerCase() &&
      b.id !== ignoreId
  );
}

// "1987-11-12" gives 1987
function getYear(book: Book) {
  if (!book.publishedDate) return undefined;
  return Number(book.publishedDate.slice(0, 4));
}

// filter, sort and paginate a list of books
export function filterBooks(list: Book[], query: Request["query"]) {
  let result = [...list];

  // filtering
  const search = query.q || query.title;
  if (typeof search === "string") {
    result = result.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));
  }

  if (typeof query.author === "string") {
    const text = query.author.toLowerCase();
    const authorIds = authors
      .filter((a) => a.name.toLowerCase().includes(text))
      .map((a) => a.id);
    result = result.filter((b) => authorIds.includes(b.authorId));
  }

  if (query.year) {
    const year = Number(query.year);
    result = result.filter((b) => getYear(b) === year);
  }
  if (query.yearMin) {
    const min = Number(query.yearMin);
    result = result.filter((b) => {
      const y = getYear(b);
      return y !== undefined && y >= min;
    });
  }
  if (query.yearMax) {
    const max = Number(query.yearMax);
    result = result.filter((b) => {
      const y = getYear(b);
      return y !== undefined && y <= max;
    });
  }

  // sorting
  const order = query.sortOrder === "desc" ? -1 : 1;
  if (query.sortBy === "title") {
    result.sort((a, b) => a.title.localeCompare(b.title) * order);
  } else if (query.sortBy === "publishedDate") {
    result.sort((a, b) => (a.publishedDate || "").localeCompare(b.publishedDate || "") * order);
  } else {
    result.sort((a, b) => (a.id - b.id) * order);
  }

  // pagination
  let page = Math.floor(Number(query.page)) || 1;
  let pageSize = Math.floor(Number(query.pageSize)) || 10;
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 10;
  if (pageSize > 100) pageSize = 100;

  const total = result.length;
  const start = (page - 1) * pageSize;
  const data = result.slice(start, start + pageSize);

  return {
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export function getAllBooks(req: Request, res: Response, _next: NextFunction) {
  res.status(200).json(filterBooks(books, req.query));
}

export function getBookById(req: Request, res: Response, _next: NextFunction) {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.status(200).json(book);
}

export function createBook(req: Request, res: Response, _next: NextFunction) {
  const { title, authorId, publishedDate } = req.body;

  if (!authorExists(authorId)) {
    res.status(404).json({ error: "Author not found" });
    return;
  }
  if (titleTaken(title.trim(), authorId)) {
    res.status(409).json({ error: "This author already has a book with that title" });
    return;
  }

  const newBook: Book = {
    id: getNextBookId(),
    title: title.trim(),
    authorId,
    publishedDate,
  };
  books.push(newBook);
  res.status(201).json(newBook);
}

export function updateBook(req: Request, res: Response, _next: NextFunction) {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  const { title, authorId, publishedDate } = req.body;

  if (authorId !== undefined && !authorExists(authorId)) {
    res.status(404).json({ error: "Author not found" });
    return;
  }

  const newTitle = title !== undefined ? title.trim() : book.title;
  const newAuthorId = authorId !== undefined ? authorId : book.authorId;

  if (titleTaken(newTitle, newAuthorId, book.id)) {
    res.status(409).json({ error: "This author already has a book with that title" });
    return;
  }

  book.title = newTitle;
  book.authorId = newAuthorId;
  book.publishedDate = publishedDate ?? book.publishedDate;
  res.status(200).json(book);
}

export function deleteBook(req: Request, res: Response, _next: NextFunction) {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  books.splice(index, 1);
  res.status(204).send();
}