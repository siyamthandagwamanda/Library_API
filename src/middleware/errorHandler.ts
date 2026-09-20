import { error } from "console";
import type { Request, Response, NextFunction } from "express";
import { stat } from "fs";

export function notFound(_req: Request, res: Response, _next: NextFunction){
    res.status(404).json({ error: "Route not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction){
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = (err as any)?.statusCode ?? 500;
    res.status(status).json({error: message});
}