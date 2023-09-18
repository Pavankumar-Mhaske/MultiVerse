import jwt from "jsonwebtoken";
import { User } from "../../../models/apps/auth/user.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
  emailVerificationMailgenContent,
  sendEmail,
} from "../../../utils/mail.js";

const registerUser = asyncHandler(async (req, res) => {
  // TODO: setup validator middleware or logic to handle data validation

  const { email, username, password, role } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists", []);
  }

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
    role: role || "USER",
  });

  // TODO: Add method in userSchema to generate email verification token and verify the email based on that token with expiry
  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `https://localhost:8080/api/v1/users/verify-email/email__verification__token` // NOTE: This is a dummy url
    ),
  });

  user.password = undefined;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user },
        "Users registered successfully and verification email has been sent on your email."
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Compare the incoming password with hashed password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // TODO: Save the refresh token with the user model to only allow refresh token which is not used
  // attach refresh token to the user document to avoid refreshing the access token with multiple refresh tokens
  user.refreshToken = refreshToken;
  user.password = undefined;
  user.save();
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // TODO: Add more options to make cookie more secure and reliable
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
    .json(
      new ApiResponse(
        200,
        { user: createdUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
        "Users registered successfully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    // TODO: Once refresh token save in user model done add check to see if incoming refresh token is associated with the user
    if (!user) {
      // 498: expired or otherwise invalid token.
      throw new ApiError(498, "Invalid refresh token");
    }

    // check if incoming refresh token is same as the refresh token attached in the user document
    // This shows that the refresh token is used or not
    // Once it is used, we are replacing it with new refresh token below

    if (incomingRefreshToken !== user?.refreshToken) {
      // If token is valid but is used already
      // 498: expired or otherwise invalid token.
      throw new ApiError(498, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken(); // generate new refresh token as well
    // TODO: Save the refresh token with the user model to only allow refresh token which is not used
    // TODO: Once used remove/replace the token with the new token in user model

    user.refreshToken = newRefreshToken; // assign new refresh token to the user document
    user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    // 498: expired or otherwise invalid token.
    throw new ApiError(498, error?.message || "Invalid refresh token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

export { registerUser, loginUser, getCurrentUser, refreshAccessToken };
