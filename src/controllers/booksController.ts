import type { Request, Response, NextFunction } from "express";
import { books, getNextBookId, type Book } from "../model/books.js";
import { authors } from "../model/author.js";

const authorExists = (id: number) => authors.some((a) => a.id === id);

const str = (v: unknown) => (typeof v === "string" ? v : undefined);

const num = (v: unknown) => {
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};


const yearOf = (b: Book) => (b.publishedDate ? Number(b.publishedDate.slice(0, 4)) : undefined);

export function queryBooks(source: Book[], query: Request["query"]) {
  const q = (str(query.q) ?? str(query.title))?.toLowerCase();
  const authorQ = str(query.author)?.toLowerCase();
  const year = num(query.year);
  const yearMin = num(query.yearMin);
  const yearMax = num(query.yearMax);


  let result = source.filter((b) => {
    const y = yearOf(b);
    return (
      (q === undefined || b.title.toLowerCase().includes(q)) &&
      (year === undefined || y === year) &&
      (yearMin === undefined || (y !== undefined && y >= yearMin)) &&
      (yearMax === undefined || (y !== undefined && y <= yearMax))
    );
  });

  if (authorQ) {
    const ids = authors.filter((a) => a.name.toLowerCase().includes(authorQ)).map((a) => a.id);
    result = result.filter((b) => ids.includes(b.authorId));
  }

  
  const sortBy = str(query.sortBy);
  const dir = str(query.sortOrder) === "desc" ? -1 : 1;
  const key = (b: Book): string | number | undefined =>
    sortBy === "title" ? b.title.toLowerCase()
    : sortBy === "publishedDate" ? b.publishedDate
    : b.id;

  result = [...result].sort((a, b) => {
    const x = key(a);
    const y = key(b);
    if (x === undefined && y === undefined) return 0;
    if (x === undefined) return 1;   // missing values sort last
    if (y === undefined) return -1;
    const cmp =
      typeof x === "string" && typeof y === "string" ? x.localeCompare(y) : Number(x) - Number(y);
    return cmp * dir;
  });


  const page = Math.max(1, Math.floor(num(query.page) ?? 1));
  const pageSize = Math.min(100, Math.max(1, Math.floor(num(query.pageSize) ?? 10)));
  const total = result.length;
  const data = result.slice((page - 1) * pageSize, page * pageSize);

  return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

export function getAllBooks(req: Request, res: Response, _next: NextFunction) {
  res.status(200).json(queryBooks(books, req.query));
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

  const newBook: Book = { id: getNextBookId(), title: title.trim(), authorId, publishedDate };
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

  book.title = title !== undefined ? title.trim() : book.title;
  book.authorId = authorId ?? book.authorId;
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