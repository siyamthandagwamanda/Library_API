import type { Request, Response, NextFunction } from "express";


export function notFound(_req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({ error: "Route not found" });
}


export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {

  if (err.status === 400) {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
}