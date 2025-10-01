import express from "express";
import jwt, { Jwt, JwtPayload } from "jsonwebtoken";
import { asyncHandler, sendError } from "../utils/function";

import { Login } from "../models/login.model";
import { User } from "../models/user.model";
import { CONSTANT_LIST } from "../constants/global.constants";

export const verifyUser = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void | express.Response> => {
    try {
      const token: string | undefined = req
        .header("Authorization")
        ?.replace("Bearer", "")
        .trim();
      if (!token) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "UnAuthorized request"
        );
      }
      const secretKey: string | undefined = process.env.ACCESS_TOKEN;
      if (!secretKey) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "UnAuthorized request"
        );
      }
      const decodeToken = jwt.verify(token, secretKey) as JwtPayload;
      console.log(decodeToken);
      const userDetail = await Login.findOne({
        userId: decodeToken?.userId,
        email: decodeToken?.email,
        accessToken: token,
      });
      if (userDetail) {
        req.user = userDetail;
        next();
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "UnAuthorized request"
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

export const checkAdmin = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void | express.Response> => {
    try {
      const user = req.user?.userId;
      const userDetail = await User.findById(user);
      if (!userDetail) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.FORBIDDEN_ERROR,
          "Unauthorized request."
        );
      }
      if (userDetail.role === "admin") {
        return next();
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.FORBIDDEN_ERROR,
          "Unauthorized request."
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
