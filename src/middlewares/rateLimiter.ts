import { RateLimiterRedis } from "rate-limiter-flexible";
import { redisClient } from "../config/redis";
import { asyncHandler, sendError } from "../utils/function";
import express from "express";
import { CONSTANT_LIST } from "../constants/global.constants";

//Limit per IP:50 Login attempt per minutes
const maxAttemptsPerMinutes = 50;

export const loginRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "Login_ip",
  points: maxAttemptsPerMinutes,
  duration: 60, //1 minutes
  blockDuration: 60 * 15, //15 minutes
});

export const rateLimiterMiddleware = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> => {
    try {
      const ip = req.ip;
      if (!ip) {
        return sendError(res, CONSTANT_LIST.STATUS_ERROR, 401, "No ip found");
      }
      await loginRateLimiter.consume(req.ip);
      next();
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
