import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import router from "./backend_files/userRouter.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const port = 4000 || process.env.PORT;

mongoose.connect(
  process.env.MONGODB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  (err) => {
    if (err) throw err;
    console.log("MongoDB Connected.");
  }
);

app.use("/users", router);

app.listen(port, () => {
  console.log(`Listening to ${port}`);
});
