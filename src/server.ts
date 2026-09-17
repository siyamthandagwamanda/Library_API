import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Professer Snap!")
})


app.listen(PORT, () => {
    console.log(`Express is running on http://localhost:3000`)
})