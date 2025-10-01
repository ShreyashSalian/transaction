import express from "express";
import { asyncHandler, sendError, sendSuccess } from "../utils/function";
import { User } from "../models/user.model";
import { CONSTANT_LIST } from "../constants/global.constants";
import { userBody } from "../helpers/user.helper";

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
  }
);
