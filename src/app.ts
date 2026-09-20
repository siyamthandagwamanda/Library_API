import { Router } from "express";
import authorRouter from "./routes/authorRoute.js";
import bookRouter from "./routes/bookRoute.js";

const router = Router();

router.get("/", (_req, res) => {
    res.json({message: "Welcome to Library API"})
});

//add routed to main router
router.use("/authors", authorRouter);
router.use("/books", bookRouter);

export default router