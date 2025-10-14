import multer from "multer";
import path from "path";

// Storage config
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "uploads/"); // folder where image will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // unique filename
  },
});

// File filter (optional: only allow images)
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

// Export middleware
export const upload = multer({ storage, fileFilter });
