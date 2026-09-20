import type { Request, Response, NextFunction } from "express";
import { books, getNextBookId, type Book } from "../model/books.js";
import { authors } from "../model/author.js";

const authorExists = (id: number) => authors.some((a) => a.id === id);

export function getAllBooks(_req: Request, res: Response, _next: NextFunction) {
  res.status(200).json({ data: books });
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

  const newBook: Book = { id: getNextBookId(), title: title.trim(), authorId, publishedDate,};
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