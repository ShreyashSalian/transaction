import express from "express";
import authRouter from "./auth.route";
import userRouter from "./user.route";

// import client from "prom-client";

// const collectDefaultMetrics = client.collectDefaultMetrics;

// collectDefaultMetrics({ register: client.register });
const indexRouter = express.Router();

indexRouter.use("/api/v1/auth", authRouter);
indexRouter.use("/api/v1/users", userRouter);
indexRouter.get("/api/v1/", (req: express.Request, res: express.Response) => {
  res.status(200).json({ message: "The server is running properly." });
});

// indexRouter.get(
//   "/api/v1/metrics",
//   async (req: express.Request, res: express.Response) => {
//     res.setHeader("Content-Type", client.register.contentType);
//     const metrics = await client.register.metrics();
//     res.send(metrics);
//   }
// );

export default indexRouter;
