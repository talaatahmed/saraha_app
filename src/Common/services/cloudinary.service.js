import { v2 as cloudinaryV2 } from "cloudinary";

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFileOnCloudinary = async (file, options) => {
  const result = await cloudinaryV2.uploader.upload(file, options);
  return result;
};

export const uploadManyFilesOnCloudinary = async (files, options) => {
  const result = [];
  for (const file of files) {
    const [secure_url, public_id] = await uploadFileOnCloudinary(file, options);
    result.push({ secure_url, public_id });
  }
};

export const DeleteFileFromCloudinary = async (public_id) => {
  const result = await cloudinaryV2.uploader.destroy(public_id);
  return result;
};
