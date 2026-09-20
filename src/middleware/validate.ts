import type { Request, Response, NextFunction } from "express";

function isDate(value: any) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

//Authors (POST and PUT)
export function validateAuthor(req: Request, res: Response, next: NextFunction) {
  const body = req.body || {};
  const { name, bio, birthDate } = body;

  if (typeof name !== "string" || name.trim() === "") {
    res.status(400).json({ error: "name is required and must be a non-empty string" });
    return;
  }
  if (bio !== undefined && typeof bio !== "string") {
    res.status(400).json({ error: "bio must be a string" });
    return;
  }
  if (birthDate !== undefined && !isDate(birthDate)) {
    res.status(400).json({ error: "birthDate must be a date like 1948-04-28" });
    return;
  }
  next();
}

//Books: POST 
export function validateCreateBook(req: Request, res: Response, next: NextFunction) {
  const body = req.body || {};
  const { title, authorId, publishedDate } = body;

  if (typeof title !== "string" || title.trim() === "") {
    res.status(400).json({ error: "title is required and must be a non-empty string" });
    return;
  }
  if (!Number.isInteger(authorId) || authorId < 1) {
    res.status(400).json({ error: "authorId is required and must be a positive whole number" });
    return;
  }
  if (publishedDate !== undefined && !isDate(publishedDate)) {
    res.status(400).json({ error: "publishedDate must be a date like 1987-11-12" });
    return;
  }
  next();
}

//Books: PUT (send at least one field)
export function validateUpdateBook(req: Request, res: Response, next: NextFunction) {
  const body = req.body || {};
  const { title, authorId, publishedDate } = body;

  if (title === undefined && authorId === undefined && publishedDate === undefined) {
    res.status(400).json({ error: "send at least one of: title, authorId, publishedDate" });
    return;
  }
  if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
    res.status(400).json({ error: "title must be a non-empty string" });
    return;
  }
  if (authorId !== undefined && (!Number.isInteger(authorId) || authorId < 1)) {
    res.status(400).json({ error: "authorId must be a positive whole number" });
    return;
  }
  if (publishedDate !== undefined && !isDate(publishedDate)) {
    res.status(400).json({ error: "publishedDate must be a date like 1987-11-12" });
    return;
  }
  next();
}