import mongoose, { Types } from "mongoose";

export interface UserDetails {
  userId: Types.ObjectId;
  email: string;
  accessToken: string;
}

import * as express from "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      user?: UserDetails;
    }
  }
}
