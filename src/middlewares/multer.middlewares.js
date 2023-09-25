import multer from "multer";

/**
 * multer.diskStorage() is a method provided by the multer library for configuring the storage engine used to store uploaded files.
 * types of the storage engines:
 * 1. Disk storage engine
 * 2. Memory storage engine
 * 3. Cloud storage engines
 * 4. Database storage engines
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // This storage needs public/images folder in the root directory
    // Else it will throw an error saying cannot find path public/images
    // TODO: Add try catch block to handle the error
    cb(null, "./public/images");
    /**
     * The cb function is used to indicate that the destination directory has been determined,
     *  and to pass that information back to multer. The cb function takes two arguments: an error object (or null if there is no error), and the destination directory.
     */
  },
  // Store file in a .png/.jpeg/.jpg format instead of binary
  filename: function (req, file, cb) {
    let fileExtension = "";
    if (file.originalname.split(".").length > 1) {
      fileExtension = file.originalname.substring(
        file.originalname.lastIndexOf(".")
      );
      /**
       * For example, if file.originalname is "my-picture.jpg" and file.originalname.lastIndexOf(".") returns 10 (indicating that the last dot is at index 10),
       * then file.originalname.substring(10) would extract the substring starting from index 10 to the end of the string, resulting in ".jpg."
       */
    }

    const filenameWithoutExtension = file.originalname // Get the original filename
      .toLowerCase() // Convert the filename to lowercase
      .split(" ") // Split it by spaces
      .join("-") // Join the parts with hyphens
      ?.split(".")[0]; // Optional: Split by dots and take the first part
    /**
     * If the string contains a dot, the splitting operation proceeds as expected, and the first part is obtained.
     * However, if the string does not contain a dot, the optional chaining operator prevents an error from occurring. Instead of throwing an error, it simply returns undefined because there is nothing to split.
     */
    cb(
      null,
      filenameWithoutExtension +
        Date.now() +
        Math.ceil(Math.random() * 1e5) + // avoid rare name conflict
        fileExtension
    );
    /**
     * The cb function is used to indicate that the filename has been determined,
     * and to pass that information back to multer. The cb function takes two arguments: an error object (or null if there is no error), and the filename.
     */
  },
});

// Middleware responsible to read form data and upload the File object to the mentioned path
export const upload = multer({
  storage,
});
