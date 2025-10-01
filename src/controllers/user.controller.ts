import express from "express";
import { asyncHandler, sendError, sendSuccess } from "../utils/function";
import { User } from "../models/user.model";
import { CONSTANT_LIST } from "../constants/global.constants";
import { userBody } from "../helpers/user.helper";
import mongoose from "mongoose";

export const getLoginUserDetail = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const user = req.user?.userId;
      const userDetail = await User.findById(user).select("-password");
      if (userDetail) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "login user detail",
          userDetail
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "No user found"
        );
      }
    } catch (err: any) {
      console.log(err);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    }
  }
);

export const addNewUser = asyncHandler(
  async (
    req: express.Request<{}, {}, userBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const { firstName, lastName, email, contactNumber, password, userName } =
        req.body;

      const userAlreadyExist = await User.findOne({
        $and: [
          {
            email: email,
          },
          {
            userName: userName,
          },
        ],
      });
      if (userAlreadyExist) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "User already exist with the given email or userName"
        );
      }
      const userCreation = await User.create({
        firstName,
        lastName,
        email,
        password,
        contactNumber,
        userName,
        role: "user",
      });
      if (userCreation) {
        const userDetail = await User.findById(userCreation?._id).select(
          "-password"
        );
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "User added successfully.",
          userDetail
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the user can not be deleted."
        );
      }
    } catch (err: any) {
      console.log(err);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    }
  }
);

export const addOrDeductBalance = asyncHandler(
  async (
    req: express.Request<{}, {}, { balance: number; option: string }>,
    res: express.Response
  ): Promise<express.Response> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const loggedInUser = req.user?.userId;
      const { balance, option } = req.body;
      if (!loggedInUser) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "Unauthorized user"
        );
      }
      const user = await User.findById(loggedInUser).session(session);
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_DATA_FOUND,
          "User not found."
        );
      }
      //Ensure the balance is a number;
      const amount = Number(balance);
      if (option === "add") {
        user.balance += amount;
      } else if (option === "deduct") {
        if (user.balance < amount) {
          return sendError(
            res,
            CONSTANT_LIST.STATUS_ERROR,
            CONSTANT_LIST.BAD_REQUEST,
            "Insufficient balance."
          );
        }
        user.balance -= amount;
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Invalid option, use 'add' or deduct."
        );
      }
      await user.save({ session });
      await session.commitTransaction();
      session.endSession();
      const userData = await User.findById(loggedInUser)
        .select("-password")
        .lean();
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        `Balance ${option === "add" ? "added" : "deducted"} successfully.`,
        userData
      );
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();
      console.log(err);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    } finally {
      session.endSession();
    }
  }
);

export const getUserOtherThanLogin = asyncHandler(
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const loggedInUser = req.user?.userId;
      if (!loggedInUser) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "Unauthorized user"
        );
      }
      const getAllUser = await User.find({
        _id: {
          $ne: loggedInUser,
        },
      }).select("-password");

      if (getAllUser.length === 0) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_CONTENT_FOUND,
          "No user found"
        );
      } else {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "User list",
          getAllUser
        );
      }
    } catch (err: any) {
      console.log(err);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    }
  }
);

export const transferAmountToOther = asyncHandler(
  async (
    req: express.Request<{}, {}, { receiverId: string; amount: number }>,
    res: express.Response
  ): Promise<express.Response> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const senderId = req.user?.userId;
      const { receiverId, amount } = req.body;
      if (!senderId) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "Unauthorized user."
        );
      }

      if (senderId.toString() === receiverId.toString()) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "You can not transfer money to yourself."
        );
      }

      const sender = await User.findById(senderId).session(session);
      const receiver = await User.findById(receiverId).session(session);

      if (!sender || !receiver) {
        await session.abortTransaction();
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_DATA_FOUND,
          "User nont found"
        );
      }

      //Check balance
      let transferAmount = Number(amount);
      if (sender.balance < transferAmount) {
        await session.abortTransaction();
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Insufficient balance"
        );
      }
      sender.balance -= transferAmount;
      receiver.balance += transferAmount;
      await sender.save({ session });
      await receiver.save({ session });

      await session.commitTransaction();
      session.endSession();

      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "Amount transfered successfully",
        {
          senderBalance: sender.balance,
          receiverBalance: receiver.balance,
        }
      );
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();

      console.log(err);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE
      );
    }
  }
);
