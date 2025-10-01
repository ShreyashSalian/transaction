import mongoose, { Types, Document, Schema } from "mongoose";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface UserDocument extends Document {
  _id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  role: string;
  // failedLoginAttempts: number;
  // lockUntil?: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

enum USERROLE {
  USER = "user",
  ADMIN = "admin",
}
const userSchema = new Schema<UserDocument>(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // failedLoginAttempts: {
    //   type: Number,
    //   default: 0,
    // },
    // lockUntil: {
    //   type: Date,
    //   default: null,
    // },
    role: {
      type: String,
      enum: Object.values(USERROLE),
      default: USERROLE.USER,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) {
    return next();
  }
  try {
    user.password = await bcrypt.hash(user.password, 10);
  } catch (err: any) {
    throw new Error(err);
  }
});

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  const user = this as UserDocument;
  return await bcrypt.compare(password, user.password);
};

userSchema.methods.generateAccessToken = function (): string {
  const user = this as UserDocument;
  const token = process.env.ACCESS_TOKEN;
  if (!token) {
    throw new Error("No refresh token founf");
  }
  return jwt.sign(
    {
      userId: user?._id,
      email: user?.email,
      firstName: user?.firstName,
    },
    token,
    {
      expiresIn: "4h",
    }
  );
};
userSchema.methods.generateRefreshToken = function (): string {
  const user = this as UserDocument;
  const token = process.env.REFRESH_TOKEN;
  if (!token) {
    throw new Error("No refresh token found");
  }
  return jwt.sign(
    {
      userId: user?._id,
      email: user?.email,
      firstName: user?.firstName,
    },
    token,
    {
      expiresIn: "10d",
    }
  );
};

export const User = mongoose.model<UserDocument>("User", userSchema);
