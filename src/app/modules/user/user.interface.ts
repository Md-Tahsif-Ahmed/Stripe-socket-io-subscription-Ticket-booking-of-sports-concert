import { Model } from "mongoose";
import { USER_ROLES } from "../../../enums/user";

export type IUser = {
  fullName: string;
  role: USER_ROLES;
  countryCode: string;
  email: string;
  phone?: string;
  profileImage?: string;
  password: string;
  verified: boolean;
  agreedToTerms?: boolean;
  // stripe ....
  connectedAccountId?: string;
  onboardingCompleted?: boolean;
  payoutsEnabled?: boolean;
  // .... stripe

  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isAccountCreated(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
