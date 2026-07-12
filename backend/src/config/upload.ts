import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "./cloudinary";
import path from "path";

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf", ".docx"];

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "PrepStackai-questions",
    resource_type: "raw",
  } as any,
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `File type ${ext} is not supported. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
        ),
      );
    }
  },
});
