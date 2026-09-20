import type { Request, Response, NextFunction } from "express";

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "";

const isPositiveInt = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v > 0;

const isValidDate = (v: unknown): boolean =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

function fail(res: Response, errors: string[]) {
  res.status(400).json({ error: errors.join("; ") });
}

//Authors (POST and PUT)
export function validateAuthor(req: Request, res: Response, next: NextFunction) {
  const { name, bio, birthDate } = req.body ?? {};
  const errors: string[] = [];

  if (!isNonEmptyString(name)) errors.push("name is required and must be a non-empty string");
  if (bio !== undefined && typeof bio !== "string") errors.push("bio must be a string");
  if (birthDate !== undefined && !isValidDate(birthDate))
    errors.push("birthDate must be a valid date in YYYY-MM-DD format");

  if (errors.length > 0) {
    fail(res, errors);
    return;
  }
  next();
}

// Books 
function bookErrors(body: any, isCreate: boolean): string[] {
  const { title, authorId, publishedDate } = body ?? {};
  const errors: string[] = [];

  // POST: title and authorId required.
  // PUT: checked only if sent.
  if ((isCreate || title !== undefined) && !isNonEmptyString(title))
    errors.push("title is required and must be a non-empty string");
  if ((isCreate || authorId !== undefined) && !isPositiveInt(authorId))
    errors.push("authorId is required and must be a positive integer");
  if (publishedDate !== undefined && !isValidDate(publishedDate))
    errors.push("publishedDate must be a valid date in YYYY-MM-DD format");

  if (!isCreate && [title, authorId, publishedDate].every((v) => v === undefined))
    errors.push("provide at least one of: title, authorId, publishedDate");

  return errors;
}

export function validateCreateBook(req: Request, res: Response, next: NextFunction) {
  const errors = bookErrors(req.body, true);
  if (errors.length > 0) {
    fail(res, errors);
    return;
  }
  next();
}

export function validateUpdateBook(req: Request, res: Response, next: NextFunction) {
  const errors = bookErrors(req.body, false);
  if (errors.length > 0) {
    fail(res, errors);
    return;
  }
  next();
}