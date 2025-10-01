import express from "express";
import { userValidation } from "../validations/user.validation";
import { validateAPI } from "../middlewares/validate.middleware";
import {
  addNewUser,
  addOrDeductBalance,
  getLoginUserDetail,
  getUserOtherThanLogin,
  transferAmountToOther,
} from "../controllers/user.controller";
import { verifyUser } from "../middlewares/auth.middleware";
import { addOrDeductBalanceValidation } from "../validations/addOrDeductBalance.valiation";
import { transferAmountValidation } from "../validations/transferAmount.validation";

const userRouter = express.Router();

userRouter.post("/", userValidation(), validateAPI, addNewUser);
userRouter.get("/", verifyUser, getLoginUserDetail);
userRouter.post(
  "/add-or-deduct-balance",
  verifyUser,
  addOrDeductBalanceValidation(),
  validateAPI,
  addOrDeductBalance
);
userRouter.get("/userlist", verifyUser, getUserOtherThanLogin);
userRouter.post(
  "/transfer-amount",
  verifyUser,
  transferAmountValidation(),
  validateAPI,
  transferAmountToOther
);
export default userRouter;
