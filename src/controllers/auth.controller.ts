import { User } from "../models/user.model";

import express from "express";
import { asyncHandler, sendError, sendSuccess } from "../utils/function";
import { CONSTANT_LIST } from "../constants/global.constants";
import { Login } from "../models/login.model";
import { LoginBody } from "../helpers/user.helper";
import { redisClient } from "../config/redis";

const generateAccessAndRefreshToken = async (
  userId: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Sorry, no user found");
  }
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  return { accessToken, refreshToken };
};

export const login = asyncHandler(
  async (
    req: express.Request<{}, {}, LoginBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS) || 5; //5 attempts
      const LOCK_TIME = Number(process.env.LOCK_TIME) || 900; // seconds - 15 minutes = 15 * 60
      const { userNameOrEmail, password } = req.body;
      const userDetail = await User.findOne({
        $or: [
          {
            userName: userNameOrEmail,
          },
          {
            email: { $regex: userNameOrEmail, $options: "i" },
          },
        ],
      });
      if (!userDetail) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry no user found with the given userName or email"
        );
      }
      if (userDetail.isDeleted) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, your account has been disabled by admin"
        );
      }

      const lockKey = `lock_user_${userDetail?._id}`;
      const isLocked = await redisClient.get(lockKey);
      if (isLocked) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          403,
          "Your account has been locked by entering the wrong password multiple times. Please try after 15 minutes to login."
        );
      }

      const isMatch = await userDetail?.comparePassword(password);
      if (!isMatch) {
        const failKey = `Failed_user_${userDetail?._id}`;
        const attempts = (await redisClient.incr(failKey)) || 1;
        if (attempts === 1) {
          // const lockTime = process.env.LOCK_TIME || 15 * 60;
          await redisClient.expire(failKey, LOCK_TIME);
        }

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          await redisClient.set(lockKey, "1", "EX", LOCK_TIME);
          await redisClient.del(failKey);
          return sendError(
            res,
            CONSTANT_LIST.STATUS_ERROR,
            403,
            "Account locked due to multiple failed attempts"
          );
        }
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          401,
          "Invalid credentials"
        );
      }
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        userDetail?._id
      );

      await redisClient.del(`fail_user_${userDetail?._id}`);
      await redisClient.del(lockKey);
      await Login.create({
        userId: userDetail?._id,
        email: userDetail?.email,
        accessToken,
        refreshToken,
      });
      const loginUser = await User.findById(userDetail?._id).select(
        "-password"
      );
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "Login user detail",
        {
          loginUser,
          accessToken,
          refreshToken,
        }
      );
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

export const logout = asyncHandler(
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const user = req.user?.userId;
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "No user found"
        );
      }

      const token: string | undefined = req
        .header("Authorization")
        ?.replace("Bearer", "")
        .trim();

      const deleteUserFromLogin = await Login.findOneAndDelete({
        userId: user,
        accessToken: token,
      });
      if (deleteUserFromLogin) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "User has been logout successfully",
          {}
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry the user can not be logout"
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
