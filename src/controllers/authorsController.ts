import type { Request, Response, NextFunction } from "express";
import { authors, getNextAuthorId, type Author } from "../model/author.js";
import { queryBooks } from "./booksController.js";
import { books } from "../model/books.js";
export function getAuthors(_req: Request, res: Response, _next: NextFunction) {
  res.status(200).json(authors);
}
export function getAuthorBooks(req: Request, res: Response, _next: NextFunction) {
  const id = Number(req.params.id);

  if (!authors.some((a) => a.id === id)) {
    res.status(404).json({ error: "Author not found" });
    return;
  }

  res.status(200).json(queryBooks(books.filter((b) => b.authorId === id), req.query));
}

export function getAuthorById(req: Request, res: Response, _next: NextFunction) {
  const author = authors.find((a) => a.id === Number(req.params.id));
  if (!author) return res.status(404).json({ error: "Author not found" });
  res.status(200).json(author);
}

export function createAuthor(req: Request, res: Response, _next: NextFunction) {
  const { name, bio, birthDate } = req.body ?? {};
  const newAuthor: Author = { id: getNextAuthorId(), name, bio, birthDate };
  authors.push(newAuthor);
  res.status(201).json(newAuthor);
}

export function updateAuthor(req: Request, res: Response, _next: NextFunction) {
  const author = authors.find((a) => a.id === Number(req.params.id));
  if (!author) return res.status(404).json({ error: "Author not found" });

  const { name, bio, birthDate } = req.body ?? {};
  author.name = name ?? author.name;
  author.bio = bio ?? author.bio;
  author.birthDate = birthDate ?? author.birthDate;
  res.status(200).json(author);
}

export function deleteAuthor(req: Request, res: Response, _next: NextFunction) {
  const index = authors.findIndex((a) => a.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Author not found" });

  authors.splice(index, 1);
  res.status(204).send();
}