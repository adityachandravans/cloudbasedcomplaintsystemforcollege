import path from 'path';
import fs from 'fs';

export interface StorageFile {
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
}

export class StorageService {
  private static uploadDir = path.join(process.cwd(), 'uploads');

  public static init() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public static getFileUrl(filename: string): string {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5000';
    // If running in cloud storage mode (e.g., S3/Cloudinary), return direct cloud URL
    if (process.env.CLOUD_STORAGE_URL) {
      return `${process.env.CLOUD_STORAGE_URL}/${filename}`;
    }
    return `${baseUrl}/uploads/${filename}`;
  }

  public static formatFile(file: Express.Multer.File): StorageFile {
    return {
      filename: file.filename,
      originalName: file.originalname,
      url: this.getFileUrl(file.filename),
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
