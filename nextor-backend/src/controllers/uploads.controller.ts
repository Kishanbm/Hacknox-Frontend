import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const uploadAvatar = async (req: Request, res: Response): Promise<any> => {
  try {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Build a public URL for the uploaded file
    const host = req.protocol + '://' + req.get('host');
    const publicUrl = `${host}/uploads/avatars/${file.filename}`;

    return res.status(200).json({ message: 'Upload successful', url: publicUrl });
  } catch (err: any) {
    console.error('Upload error:', err?.message || err);
    return res.status(500).json({ message: 'Upload failed', error: err?.message });
  }
};

export const uploadBanner = async (req: Request, res: Response): Promise<any> => {
  try {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const host = req.protocol + '://' + req.get('host');
    const publicUrl = `${host}/uploads/banners/${file.filename}`;

    return res.status(200).json({ message: 'Upload successful', url: publicUrl });
  } catch (err: any) {
    console.error('Upload banner error:', err?.message || err);
    return res.status(500).json({ message: 'Upload failed', error: err?.message });
  }
};
