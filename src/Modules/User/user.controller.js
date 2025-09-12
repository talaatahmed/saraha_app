import { Router } from "express";
import * as UserService from "./Services/user.service.js";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";
import { authorizationMiddleware } from "../../Middleware/authorization.middleware.js";
import { RolesEnum } from "../../Common/enums/user.enum.js";
import { vlidationMiddeware } from "../../Middleware/validation.middleware.js";
import { SignUpSchema2 } from "../../Validators/Schemas/user.schema.js";
import { hostUpload, localUpload } from "../../Middleware/multer.middleware.js";

const router = Router();

//Authentication Routes
router.post(
  "/sgin-up",
  vlidationMiddeware(SignUpSchema2),
  UserService.SignUpService
);
router.post("/sign-up-gmail", UserService.SignupServiceGmail);
router.put("/confirm", UserService.ConfirmEmailService);
router.post("/signIn", UserService.SignInService);
router.post("/logout", authenticationMiddleware, UserService.LogoutService);
router.get("/refresh-token", UserService.RefreshTokenService);

//Account Routes
router.put(
  "/update",
  authenticationMiddleware,
  UserService.UpdateAccountService
);

router.delete(
  "/delete",
  authenticationMiddleware,
  UserService.DeleteAccountService
);

router.delete("/delete-by-email", UserService.DeleteAccountByEmailService);

router.post(
  "/upload-profile",
  authenticationMiddleware,
  localUpload({ folderPath: "profiles" }, { files: 1 }).single("profile"),
  UserService.UploadProfileService
);

router.post(
  "/upload-profile-host",
  authenticationMiddleware,
  hostUpload({}).single("profile"),
  UserService.UploadProfileHostService
);

router.post(
  "/upload-cover",
  localUpload({ folderPath: "covers" }).single("cover"),
  UserService.UploadCoverService
);

router.delete("/delete-profile", UserService.DeleteFileFromCloudinaryService);

//Admin Routes
router.get(
  "/all",
  authenticationMiddleware,
  authorizationMiddleware([
    RolesEnum.Super_Admin,
    RolesEnum.Admin,
    RolesEnum.User,
  ]),
  UserService.GetAllUsersService
);

export default router;
