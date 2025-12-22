import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyAuthToken } from '../middlewares/authMiddleware';
import { uploadAvatar } from '../controllers/uploads.controller';

const router = express.Router();

// Ensure uploads folders exist for avatars and banners
const avatarsRoot = path.join(process.cwd(), 'uploads', 'avatars');
const bannersRoot = path.join(process.cwd(), 'uploads', 'banners');
fs.mkdirSync(avatarsRoot, { recursive: true });
fs.mkdirSync(bannersRoot, { recursive: true });

// Multer storage for avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarsRoot),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});

// Multer storage for banners (separate folder)
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, bannersRoot),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});

const avatarUpload = multer({ storage: avatarStorage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
const bannerUpload = multer({ storage: bannerStorage, limits: { fileSize: 8 * 1024 * 1024 } }); // 8MB for banners

// POST /api/uploads/avatar
router.post('/avatar', verifyAuthToken, avatarUpload.single('avatar'), uploadAvatar);

// POST /api/uploads/banner
// Accepts form field `banner` and returns public URL
router.post('/banner', verifyAuthToken, bannerUpload.single('banner'), (req, res, next) => {
  const { uploadBanner } = require('../controllers/uploads.controller');
  return uploadBanner(req, res, next);
});

export default router;
