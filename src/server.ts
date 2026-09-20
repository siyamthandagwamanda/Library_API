import express from "express";
import router from "./app.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/", router);

// 404 + Error handlers
app.use(notFound);
app.use(errorHandler);

// Config
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
export default app;