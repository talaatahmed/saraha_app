import multer from "multer";
import fs from "node:fs";
import {
  allowedFileExtensions,
  fileTypes,
} from "../Common/constants/files.constant.js";

// function checkOrCreateDir(folderPath) {
//   if (!fs.existsSync(folderPath)) {
//     fs.mkdirSync(folderPath, { recursive: true });
//   }
// }

function checkOrCreateDir(folderPath) {
  console.log("🔎 Checking folder:", folderPath);

  if (!fs.existsSync(folderPath)) {
    console.log("⚠️ Folder not found, creating:", folderPath);
    fs.mkdirSync(folderPath, { recursive: true });
    console.log("✅ Folder created:", folderPath);
  } else {
    console.log("✅ Folder already exists:", folderPath);
  }
}

export const localUpload = ({ folderPath = "samples" }, limits = {}) => {
  const fileDir = `Uploads/${folderPath}`;
  checkOrCreateDir(fileDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fileDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now();
      cb(null, uniqueSuffix + "__" + file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    //file.mimetype = 'img/png'
    const fileKey = file.mimetype.split("/")[0];
    const fileType = fileTypes[fileKey];
    if (!fileType) {
      return cb(new Error("Invalid file type"), false);
    }

    const fileExtention = file.mimetype.split("/")[1];
    if (!allowedFileExtensions[fileKey].includes(fileExtention)) {
      return cb(new Error("Invalid file extention"), false);
    }

    return cb(null, true);
  };

  return multer({ fileFilter, storage, limits });
};

export const hostUpload = ({ limits = {} }) => {
  const storage = multer.diskStorage({
    filename: (req, file, cb) => {
      // const uniqueSuffix = Date.now();
      // cb(null, uniqueSuffix + "__" + file.originalname);
      cb(null, file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    //file.mimetype = 'img/png'
    const fileKey = file.mimetype.split("/")[0];
    const fileType = fileTypes[fileKey];
    if (!fileType) {
      return cb(new Error("Invalid file type"), false);
    }

    const fileExtention = file.mimetype.split("/")[1];
    if (!allowedFileExtensions[fileKey].includes(fileExtention)) {
      return cb(new Error("Invalid file extention"), false);
    }

    return cb(null, true);
  };

  return multer({ limits, fileFilter, storage });
};
