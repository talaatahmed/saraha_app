import { compareSync, hash, hashSync } from "bcrypt";
import User from "../../../DB/Models/user.model.js";
import {
  asymmetricDecryption,
  asymmetricEncryption,
} from "../../../Utils/encryption.utils.js";
import { emmiter, sendEmail } from "../../../Utils/send_email.utils.js";
import { customAlphabet } from "nanoid";
import { v4 as uuidv4 } from "uuid";
import { verifyToken, generateToken } from "../../../Utils/token.utils.js";
import BlackListedTokens from "../../../DB/Models/black-listed-token.model.js";
import Message from "../../../DB/Models/message.model.js";
import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";
import { ProvidersEnum } from "../../../Common/enums/user.enum.js";
import {
  DeleteFileFromCloudinary,
  uploadFileOnCloudinary,
  uploadManyFilesOnCloudinary,
} from "../../../Common/services/cloudinary.service.js";
import fs from "node:fs";

const uniqueString = customAlphabet("123456789", 6);

export const SignUpService = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, age, gender, phoneNumber } =
      req.body;
    console.log("email", email);

    const isEmailExist = await User.findOne({
      $or: [{ email }, { firstName, lastName }],
      provider: ProvidersEnum.Local,
    });
    console.log("isEmailExist ", isEmailExist);

    if (isEmailExist) {
      return res.status(409).json({
        message:
          "Email or the compination of the first name and last name is already exists",
        success: false,
      });
    }

    //encrypt phone
    const encryptedPhone = asymmetricEncryption(phoneNumber);
    // console.log("the encrypted phone: ", encryptedPhone);

    //hash for password
    const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);
    const otp = uniqueString();

    //create method
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      gender,
      phoneNumber: encryptedPhone,
      otps: { confirmation: hashSync(otp, +process.env.SALT_ROUNDS) },
    });
    //end create method

    emmiter.emit("sendEmail", {
      to: email,
      subject: "Confirmation Email",
      content: `<h1>your otp is ${otp}</h1> `,
    });

    //return the response
    return res.status(201).json({
      message: "user created successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal Server Error UserService SignUpService",
      err: error.stack,
    });
  }
};

export const SignupServiceGmail = async (req, res, next) => {
  let newUser;

  const { idToken } = req.body;

  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.WEB_CLIENT_ID,
  });

  const { email, given_name, family_name, email_verified, sub } =
    ticket.getPayload();

  if (!email_verified) {
    return res
      .status(400)
      .json({ message: "Email is not verified", success: false });
  }

  const isUserExist = await User.findOne({
    googleSub: sub,
    provider: ProvidersEnum.Google,
  });

  if (!isUserExist) {
    newUser = await User.create({
      firstName: given_name,
      lastName: family_name || " ",
      email,
      provider: ProvidersEnum.Google,
      isConfirmed: true,
      password: hashSync(uniqueString(), +process.env.SALT_ROUNDS),
      googleSub: sub,
    });
  } else {
    newUser = isUserExist;
    newUser.email = email;
    newUser.firstName = given_name;
    newUser.lastName = family_name || " ";
    await newUser.save();
  }

  //Generate access token for loggenIn User
  const accessToken = generateToken(
    { _id: newUser._id, email: newUser.email },
    process.env.JWT_ACCESS_SECRET,
    {
      jwtid: uuidv4(),
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    }
  );

  //Generate refresh token
  const refreshToken = generateToken(
    { _id: newUser._id, email: newUser.email },
    process.env.JWT_REFRESH_SECRET,
    {
      jwtid: uuidv4(),
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    }
  );

  return res.status(200).json({
    message: "user signed in successfully",
    success: true,
    tokens: { accessToken, refreshToken },
  });
};

export const ConfirmEmailService = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email, isConfirmed: false });
  if (!user) {
    return res.status(400).json({
      message: "user not found of already confiremed",
      succuss: false,
    });
  }
  const isOtpMatched = compareSync(otp, user.otps?.confirmation);
  if (!isOtpMatched) {
    return res.status(400).json({ message: "otp is invalid", success: false });
  }
  user.isConfirmed = true;
  user.otps.confirmation = undefined;
  await user.save();
  return res.status(200).json({
    message: "user confirmed successfully",
    success: true,
    data: user,
  });
};

export const SignInService = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid email or password", success: false });
    }

    const isPasswordMatched = compareSync(password, user.password);
    if (!isPasswordMatched) {
      return res
        .status(404)
        .json({ message: "Invalid email or password", success: false });
    }

    //Generate access token for loggenIn User
    const accessToken = generateToken(
      { _id: user._id, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      {
        jwtid: uuidv4(),
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
      }
    );

    //Generate refresh token
    const refreshToken = generateToken(
      { _id: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      {
        jwtid: uuidv4(),
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      }
    );

    return res.status(200).json({
      message: "user signed in successfully",
      success: true,
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error UserService signInService",
      err: error.stack,
    });
  }
};

export const UpdateAccountService = async (req, res, next) => {
  try {
    const { _id } = req.loggedInUser;
    console.log(req.loggedInUser);

    const { firstName, lastName, email, age, gender } = req.body;

    const user = await User.findByIdAndUpdate(
      _id,
      { $set: { firstName, lastName, email, age, gender } },
      { new: true } // return updated doc
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "There is no user with this id", success: false });
    }

    return res.status(200).json({
      message: "user updated successfully",
      success: true,
      // data: { user, decodedData },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error UserService updateAccountService",
      err: error.message,
    });
  }
};

export const DeleteAccountService = async (req, res, next) => {
  //start session
  const session = await mongoose.startSession();
  req.session = session;

  const {
    user: { _id },
  } = req.loggedInUser;

  //start Transaction
  session.startTransaction();

  const deletedResult = await User.findByIdAndDelete(_id, { session });
  if (!deletedResult) {
    return res.status(404).json({
      message: "There is no user with this id",
      success: false,
      deletedResult,
    });
  }

  //delete the user profile pic from host
  await DeleteFileFromCloudinary(deletedResult.profilePictue.public_id);

  //delete the user profile pic from local
  fs.unlinkSync(deletedResult.profilePictue);

  //delete the messages belongs to the user
  await Message.deleteMany({ receiverId: _id }, { session });

  //commit transaction
  await session.commitTransaction();
  //end session
  session.endSession();
  console.log("the transaction is commited");

  return res.status(200).json({
    message: "user deleted successfully",
    success: true,
    data: deletedResult,
  });
};

export const DeleteAccountByEmailService = async (req, res, next) => {
  try {
    const { email } = req.body;
    //findByIdAndDelete method
    const deletedResult = await User.findOneAndDelete(email);
    if (!deletedResult) {
      return res.status(404).json({
        message: "There is no user with this email",
        success: false,
        deletedResult,
      });
    }
    //end findByIdAndDelete method
    return res.status(200).json({
      message: "user deleted successfully",
      success: true,
      data: deletedResult,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error UserService deleteAccountService",
      err: error.message,
    });
  }
};

export const GetAllUsersService = async (req, res, next) => {
  try {
    let users = await User.find().populate("messages");

    // users = users.map((user) => {
    //   return {
    //     ...user._doc,
    //     phoneNumber: asymmetricDecryption(user.phoneNumber),
    //   };
    // });

    // users = users.map((user) => ({
    //   ...user.toObject(), // أو user.toJSON()
    //   phoneNumber: asymmetricDecryption(user.phoneNumber),
    // }));

    users.forEach((user) => {
      user.phoneNumber = asymmetricDecryption(user.phoneNumber);
    });

    // console.log(users);

    return res.status(200).json({
      message: "users retrieved successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error UserService getAllUsersService",
      err: error.stack,
    });
  }
};

//black listed token
export const LogoutService = async (req, res, next) => {
  const {
    token: { tokenId, expirationDate },
    user: { _id },
  } = req.loggedInUser;

  BlackListedTokens.create({
    tokenId,
    expirationDate: new Date(expirationDate * 1000),
    userId: _id,
  });
  return res
    .status(200)
    .json({ message: "user logged out successfully", success: true });
};

export const RefreshTokenService = async (req, res, next) => {
  const { refreshtoken } = req.headers;
  const decodedData = verifyToken(refreshtoken, process.env.JWT_REFRESH_SECRET);

  //Generate access token for loggenIn User
  const accessToken = generateToken(
    { _id: decodedData._id, email: decodedData.email },
    process.env.JWT_ACCESS_SECRET,
    {
      jwtid: uuidv4(),
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    }
  );

  return res.status(201).json({
    message: "user access token is refreshed successfully",
    data: { accessToken },
  });
};

//upload file
export const UploadProfileService = async (req, res, next) => {
  // console.log("the req.body after multer => ", req.body);
  // console.log("the file info after uploading req.file => ", req.file);

  const {
    user: { _id },
  } = req.loggedInUser;
  const { path } = req.file;
  const user = await User.findByIdAndUpdate(
    _id,
    {
      profilePictue: { secure_url: path },
    },
    { new: true }
  );
  return res.status(200).json({ message: "Profile upload successfully", user });
};

export const UploadCoverService = (req, res, next) => {
  console.log("the req.body after multer => ", req.body);
  console.log("the file info after uploading req.file => ", req.file);
  return res.status(200).json({ message: "Cover upload successfully" });
};

export const UploadProfileHostService = async (req, res, next) => {
  const {
    user: { _id },
  } = req.loggedInUser;
  const { path } = req.file;

  const uploadResult = await uploadFileOnCloudinary(path, {
    folder: "Saraha_App/Users/Profiles",
    resource_type: "image",
    use_filename: true,
    unique_filemane: true,
  });

  const user = await User.findByIdAndUpdate(
    _id,
    {
      profilePictue: {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json({ message: "Profile upload successfully", uploadResult, user });
};

//delete file from host
export const DeleteFileFromCloudinaryService = async (req, res, next) => {
  const { public_id } = req.body;
  const result = await DeleteFileFromCloudinary(public_id);
  return res
    .status(200)
    .json({ message: "file deleted successfully", success: true, result });
};

export const UpdatePasswordService = async (req, res, next) => {};
