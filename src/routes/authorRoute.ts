import { Router } from "express";
import { createAuthor, getAuthors, getAuthorById, updateAuthor, deleteAuthor } from "../controllers/authorsController.js";

const authorRoute = Router();

authorRoute.get("/", getAuthors);
authorRoute.get("/:id", getAuthorById);
authorRoute.post("/", createAuthor);
authorRoute.put("/:id", updateAuthor);
authorRoute.delete("/:id", deleteAuthor);

export default authorRoute;