import express from "express";
import userRouter from "./Src/Presnetation Layer/userRoutes/users.ts"

const app = express();
const port = 3000;

app.use("/uploads", express.static("uploads"));
app.use(express.json());


app.use("/api", userRouter);

app.get("/check", (req, res) => {
  res.status(200).json("Everything is okay");
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
