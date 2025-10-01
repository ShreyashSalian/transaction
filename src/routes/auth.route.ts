import express from "express";
import { loginValidation } from "../validations/login.validation";
import { validateAPI } from "../middlewares/validate.middleware";

import { login, logout } from "../controllers/auth.controller";
import { verifyUser } from "../middlewares/auth.middleware";
import { rateLimiterMiddleware } from "../middlewares/rateLimiter";

const authRouter = express.Router();

authRouter.post(
  "/login",
  loginValidation(),
  validateAPI,
  rateLimiterMiddleware,
  login
);

authRouter.get("/logout", verifyUser, logout);

export default authRouter;
