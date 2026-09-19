import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "../../config/env.js";

// Grava o arquivo em disco com um nome aleatório (nunca o nome original),
// evitando colisões e vazamento de informação pelo próprio nome do arquivo.
const storage = multer.diskStorage({
  destination: env.uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
});
