import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
    methods: "POST,DELETE,PUT,PATCH,DELETE,GET,DELETE",
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(path.resolve(), "public")));
app.use("/images", express.static("/public/images"));
app.use(helmet());
app.set("view engine", "hbs");
app.set("views", "./src/views");

export default app;
