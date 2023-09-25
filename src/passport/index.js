import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/apps/auth/user.models.js";
import { UserLoginType, UserRolesEnum } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";
import { Strategy as GitHubStrategy } from "passport-github2";

try {
  /*** Serialization is the process of converting a complex data structure, like a user object in this case, into a format that can be easily stored or transmitted */
  passport.serializeUser((user, next) => {
    next(null, user._id);
  });

  /** Deserialization is the process of taking the serialized data and reconstructing the original complex data structure, like a user object, from it. It's the reverse process of serialization. */
  passport.deserializeUser(async (id, next) => {
    try {
      const user = await User.findById(id);
      if (user) next(null, user); // return user of exist
      else next(new ApiError(404, "User does not exist"), null); // throw an error if user does not exist
    } catch (error) {
      next(
        new ApiError(
          500,
          "Something went wrong while deserializing the user. Error: " + error
        ),
        null
      );
    }
  });

  passport.use(
    new GoogleStrategy(
      /**
       * These values are typically obtained by registering your application with the Google Developer Console.
       * @param {*} clientID : The client ID of the application you created in the Google Developer Console.
       * @param {*} clientSecret : The client secret of the application you created in the Google Developer Console.
       * @param {*} callbackURL : The URL to which Google will redirect the user after they grant/deny permission to the application.
       */
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },

      /**
       *
       * @param {*} _ : The first parameter is not used in the function (hence, it's named _), as it typically represents the request object, and you're not using it here.
       * @param {*} __ : The second parameter is also not used and represents the response object.
       * @param {*} profile : This parameter contains the user's profile information received from Google after a successful authentication.
       * @param {*} next : This is a callback function that you'll use to either pass the user information if authentication is successful or handle errors if authentication fails.
       */

      async (_, __, profile, next) => {
        // Check if the user with email already exist
        const user = await User.findOne({ email: profile._json.email });
        if (user) {
          // if user exists, check if user has registered with the GOOGLE SSO
          if (user.loginType !== UserLoginType.GOOGLE) {
            // If user is registered with some other method, we will ask him/her to use the same method as registered.
            // TODO: We can redirect user to appropriate frontend urls which will show users what went wrong instead of sending response from the backend
            next(
              new ApiError(
                400,
                "You have previously registered using " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  ". Please use the " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  " login option to access your account."
              ),
              null
            );
          } else {
            // If user is registered with the same login method we will send the saved user
            next(null, user);
          }
        } else {
          // If user with email does not exists, means the user is coming for the first time
          const createdUser = await User.create({
            email: profile._json.email,
            // There is a check for traditional logic so the password does not matter in this login method
            password: profile._json.sub, // Set user's password as sub (coming from the google)
            username: profile._json.email?.split("@")[0], // as email is unique, this username will be unique
            isEmailVerified: true, // email will be already verified
            role: UserRolesEnum.USER,
            avatar: {
              url: profile._json.picture,
              localPath: "",
            }, // set avatar as user's google picture
            loginType: UserLoginType.GOOGLE,
          });
          if (createdUser) {
            next(null, createdUser);
          } else {
            next(new ApiError(500, "Error while registering the user"), null);
          }
        }
      }
    )
  );

  passport.use(
    /**
     * These values are typically obtained by registering your application with the Google Developer Console.
     * @param {*} clientID : The client ID of the application you created in the Google Developer Console.
     * @param {*} clientSecret : The client secret of the application you created in the Google Developer Console.
     * @param {*} callbackURL : The URL to which Google will redirect the user after they grant/deny permission to the application.
     */
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },

      /**
       *
       * @param {*} _ : The first parameter is not used in the function (hence, it's named _), as it typically represents the request object, and you're not using it here.
       * @param {*} __ : The second parameter is also not used and represents the response object.
       * @param {*} profile : This parameter contains the user's profile information received from Google after a successful authentication.
       * @param {*} next : This is a callback function that you'll use to either pass the user information if authentication is successful or handle errors if authentication fails.
       */

      async (_, __, profile, next) => {
        const user = await User.findOne({ email: profile._json.email });
        if (user) {
          if (user.loginType !== UserLoginType.GITHUB) {
            // TODO: We can redirect user to appropriate frontend urls which will show users what went wrong instead of sending response from the backend
            next(
              new ApiError(
                400,
                "You have previously registered using " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  ". Please use the " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  " login option to access your account."
              ),
              null
            );
          } else {
            next(null, user);
          }
        } else {
          if (!profile._json.email) {
            next(
              new ApiError(
                400,
                "User does not have a public email associated with their account. Please try another login method"
              ),
              null
            );
          } else {
            // check of user with username same as github profile username already exist
            const userNameExist = await User.findOne({
              username: profile?.username,
            });

            const createdUser = await User.create({
              email: profile._json.email,
              password: profile._json.node_id, // password is redundant for the SSO
              username: userNameExist
                ? // if username already exist, set the emails first half as the username
                  profile._json.email?.split("@")[0]
                : profile?.username,
              isEmailVerified: true, // email will be already verified
              role: UserRolesEnum.USER,
              avatar: {
                url: profile._json.avatar_url,
                localPath: "",
              },
              loginType: UserLoginType.GITHUB,
            });
            if (createdUser) {
              next(null, createdUser);
            } else {
              next(new ApiError(500, "Error while registering the user"), null);
            }
          }
        }
      }
    )
  );
} catch (error) {
  console.error("PASSPORT ERROR: ", error);
}
