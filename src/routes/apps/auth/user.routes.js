import { Router } from "express";
import {
  assignRole,
  forgotPasswordRequest,
  resetForgottenPassword,
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  verifyEmail,
  resendEmailVerification,
} from "../../../controllers/apps/auth/user.controllers.js";
import { verifyJWT } from "../../../middlewares/auth.middlewares.js";

import {
  userAssignRoleValidator,
  userChangeCurrentPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userForgotPasswordValidator,
  userResetForgottenPasswordValidator,
  userPathVariableValidator,
} from "../../../validators/apps/auth/user.validators.js";

import { validate } from "../../../validators/validate.js";

const router = Router();

// Unsecured route
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);
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
router.route("/logout").post(verifyJWT, logoutUser);
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

router
  .route("/assign-role/:userId")
  .post(
    verifyJWT,
    userPathVariableValidator(),
    userAssignRoleValidator(),
    validate,
    assignRole
  );

export default router;
