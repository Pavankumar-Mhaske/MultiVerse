import { Router } from "express";
import {
  forgotPasswordRequest,
  resetForgottenPassword,
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  refreshAccessToken,
  registerUser,
  verifyEmail,
  resendEmailVerification,
} from "../../../controllers/apps/auth/user.controllers.js";
import {
  userChangeCurrentPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userForgotPasswordValidator,
  userResetForgottenPasswordValidator,
} from "../../../validators/auth/user.validators.js";

import { validate } from "../../../validators/validate.js";
import { verifyJWT } from "../../../middlewares/auth.middlewares.js";

const router = Router();

// Unsecured route
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").post(verifyEmail);
router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router
  .route("/reset-password/:resetToken")
  .post(
    userResetForgottenPasswordValidator(),
    validate,
    resetForgottenPassword
  );

// Secured routes
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/change-password")
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword
  );
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

export default router;