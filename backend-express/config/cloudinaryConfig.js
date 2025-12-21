import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary with the CLOUDINARY_URL environment variable
// (It automatically picks up CLOUDINARY_URL from process.env)
cloudinary.config({
  secure: true
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nagaratharmatrimony_uploads', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    // transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional resize
  },
});

export { cloudinary, storage };
