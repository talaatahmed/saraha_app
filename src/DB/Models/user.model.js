import mongoose from "mongoose";

import {
  GenderEnum,
  ProvidersEnum,
  RolesEnum,
} from "../../Common/enums/user.enum.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [3],
      maxLength: 20,
      lowercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      lowercase: true,
    },
    age: {
      type: Number,
      min: [18, "min age must be 18"],
      max: [60, "max age must be 60"],
      index: {
        name: "idx_age", //path level
      },
    },
    gender: {
      type: String,
      required: true,
      // enum: ["male", "female"],
      enum: Object.values(GenderEnum),
      default: "male",
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      index: {
        name: "idx_email_unique",
        unique: true,
      },
    },
    password: {
      type: String,
      required: true,
    },
    otps: {
      confirmation: String,
      resetPassword: String,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      // enum: ["user", "admin"],
      enum: Object.values(RolesEnum),
      default: "user",
    },
    provider: {
      type: String,
      enum: Object.values(ProvidersEnum),
      default: ProvidersEnum.Local,
    },
    googleSub: {
      type: String,
    },
    profilePictue: {
      secure_url: String,
      public_id: String,
    },
  },
  {
    //options
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    virtuals: {
      fullName: {
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
      },
    },
    methods: {
      getFullName() {
        return `${this.firstName} ${this.lastName}`;
      },
      getDoubleAge() {
        return this.age * 2;
      },
    },
  }
);

//schema level - create index
userSchema.index(
  { firstName: 1, lastName: 1 },
  { name: "idx_first_last_name", unique: true }
);

//virtual
userSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "receiverId",
});

const User = mongoose.model("User", userSchema);
export default User;
