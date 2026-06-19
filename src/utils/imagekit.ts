import sharp from "sharp";
import { toFile } from "@imagekit/nodejs";
import { imagekit } from "../config/imagekit";

const AVATAR_WIDTH = 1024;
const AVATAR_HEIGHT = 1024;
const AVATAR_QUALITY = 95;
const AVATAR_FOLDER = "/avatars";

export interface AvatarUploadResult {
  url: string;
  fileId: string;
}

export const uploadAvatar = async (
  buffer: Buffer,
  fileName: string
): Promise<AvatarUploadResult> => {
  const resizedBuffer = await sharp(buffer)
    .resize(AVATAR_WIDTH, AVATAR_HEIGHT, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality: AVATAR_QUALITY })
    .toBuffer();

  const fileToUpload = await toFile(resizedBuffer, `${fileName}.webp`, {
    type: "image/webp",
  });

  const result = await imagekit.files.upload({
    file: fileToUpload,
    fileName: `${fileName}.webp`,
    folder: AVATAR_FOLDER,
  });

  return {
    url: result.url || "",
    fileId: result.fileId || "",
  };
};

export const deleteImage = async (fileId: string): Promise<void> => {
  try {
    await imagekit.files.delete(fileId);
  } catch (error) {
    console.error("Failed to delete image from ImageKit:", error);
  }
};
