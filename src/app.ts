import { Router } from "express";
import authorRouter from "./routes/authorRoute.js";

const router = Router();

router.get("/", (_req, res) => {
    res.json({message: "Welcome to Library API"})
});

//add routed to main router
router.use("/author", authorRouter);

export default router