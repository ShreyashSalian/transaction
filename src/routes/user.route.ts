import express from "express";
import { userValidation } from "../validations/user.validation";
import { validateAPI } from "../middlewares/validate.middleware";
import { addNewUser, getLoginUserDetail } from "../controllers/user.controller";
import { verifyUser } from "../middlewares/auth.middleware";

const userRouter = express.Router();

userRouter.post("/", userValidation(), validateAPI, addNewUser);
userRouter.get("/", verifyUser, getLoginUserDetail);

export default userRouter;
