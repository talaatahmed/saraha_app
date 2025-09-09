import Joi from "joi";
import { gernalRules } from "../../Utils/general-rules.utils.js";

export const SignUpSchema2 = {
  body: Joi.object({
    firstName: gernalRules.name,

    lastName: gernalRules.name,

    email: gernalRules.email,

    password: gernalRules.password,

    confirmPassword: gernalRules.confirmPassword,

    gender: gernalRules.gender,

    phoneNumber: gernalRules.phoneNumber,

    age: gernalRules.age,

    // userId: gernalRules.userId,

    couponType: gernalRules.couponType,
    couponAmount: gernalRules.couponAmount,
  })
    .options({ presence: "required" })
    .with("email", "password"),
};
