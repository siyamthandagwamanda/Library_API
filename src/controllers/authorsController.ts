import type { Request, Response, NextFunction } from "express";
import { authors, getNextAuthorId, type Author } from "../model/author.js";
import { books } from "../model/books.js";
import { filterBooks } from "./booksController.js";

export function getAuthors(_req: Request, res: Response, _next: NextFunction) {
  res.status(200).json(authors);
}

export function getAuthorById(req: Request, res: Response, _next: NextFunction) {
  const author = authors.find((a) => a.id === Number(req.params.id));
  if (!author) {
    res.status(404).json({ error: "Author not found" });
    return;
  }
  res.status(200).json(author);
}

export function createAuthor(req: Request, res: Response, _next: NextFunction) {
  const { name, bio, birthDate } = req.body;

  const newAuthor: Author = {
    id: getNextAuthorId(),
    name: name.trim(),
    bio,
    birthDate,
  };
  authors.push(newAuthor);
  res.status(201).json(newAuthor);
}

export function updateAuthor(req: Request, res: Response, _next: NextFunction) {
  const author = authors.find((a) => a.id === Number(req.params.id));
  if (!author) {
    res.status(404).json({ error: "Author not found" });
    return;
  }

  const { name, bio, birthDate } = req.body;
  author.name = name.trim();
  author.bio = bio ?? author.bio;
  author.birthDate = birthDate ?? author.birthDate;
  res.status(200).json(author);
}

export function deleteAuthor(req: Request, res: Response, _next: NextFunction) {
  const id = Number(req.params.id);
  const index = authors.findIndex((a) => a.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Author not found" });
    return;
  }


  const hasBooks = books.some((b) => b.authorId === id);
  if (hasBooks) {
    res.status(409).json({ error: "Author still has books. Delete the books first." });
    return;
  }

  authors.splice(index, 1);
  res.status(204).send();
}

export function getAuthorBooks(req: Request, res: Response, _next: NextFunction) {
  const id = Number(req.params.id);
  const author = authors.find((a) => a.id === id);
  if (!author) {
    res.status(404).json({ error: "Author not found" });
    return;
  }

  const authorBooks = books.filter((b) => b.authorId === id);
  res.status(200).json(filterBooks(authorBooks, req.query));
}