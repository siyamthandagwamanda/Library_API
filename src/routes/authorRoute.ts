import { Router } from "express";
import {createAuthor, getAuthors, getAuthorById, updateAuthor, deleteAuthor, getAuthorBooks,} from "../controllers/authorsController.js";
import { validateAuthor } from "../middleware/middleware.js";

const authorRoute = Router();

authorRoute.get("/", getAuthors);
authorRoute.get("/:id", getAuthorById);
authorRoute.get("/:id/books", getAuthorBooks);
authorRoute.post("/", validateAuthor, createAuthor);
authorRoute.put("/:id", validateAuthor, updateAuthor);
authorRoute.delete("/:id", deleteAuthor);

export default authorRoute;