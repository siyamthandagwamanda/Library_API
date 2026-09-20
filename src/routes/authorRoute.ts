import { Router } from "express";
import { createAuthor, getAuthors, getAuthorById, updateAuthor, deleteAuthor } from "../controllers/authorsController.js";
import { validateAuthor } from "../middleware/validate.js";

const authorRoute = Router();

authorRoute.get("/", getAuthors);
authorRoute.get("/:id", getAuthorById);
authorRoute.post("/",validateAuthor, createAuthor);
authorRoute.put("/:id",validateAuthor, updateAuthor);
authorRoute.delete("/:id", deleteAuthor);

export default authorRoute;