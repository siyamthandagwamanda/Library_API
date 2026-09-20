import { Router } from "express";
import {getAllBooks, getBookById, createBook, updateBook, deleteBook} from "../controllers/booksController.js";
import { validateCreateBook, validateUpdateBook } from "../middleware/validate.js";

const bookRouter = Router();

bookRouter.get("/", getAllBooks);
bookRouter.get("/:id", getBookById);
bookRouter.post("/",validateCreateBook, createBook);
bookRouter.put("/:id",validateUpdateBook, updateBook);
bookRouter.delete("/:id", deleteBook);

export default bookRouter;