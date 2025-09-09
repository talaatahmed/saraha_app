import Joi from "joi";
import { isValidObjectId } from "mongoose";
import { GenderEnum } from "../Common/enums/user.enum.js";

function objectIdValidation(value, helper) {
  return isValidObjectId(value) ? value : helper.message("Invalid Object Id");
}

export const gernalRules = {
  name: Joi.string().min(2).max(20).required(),

  email: Joi.string().email({
    tlds: {
      allow: ["com", "net", "org"],
      deny: ["edu", "eg"],
    },
    maxDomainSegments: 2,
  }),

  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character",
    }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),

  gender: Joi.string()
    .valid(...Object.values(GenderEnum))
    .required(),

  phoneNumber: Joi.string().optional(),

  age: Joi.number().min(18).max(60).required(),

  userId: Joi.custom(objectIdValidation).required(),

  couponType: Joi.string().valid("fixed", "precentage"),

  couponAmount: Joi.when("couponType", {
    is: Joi.string().valid("precentage"),
    then: Joi.number().greater(0).max(100),
    otherwise: Joi.number().integer(),
  }),
};
