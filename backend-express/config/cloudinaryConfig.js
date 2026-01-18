import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary explicitly with credentials
cloudinary.config({
  cloud_name: 'dhmgufbst',
  api_key: '462847565411784',
  api_secret: 'YTAtaB6PvBLcVfdd3km8Hjuerew',
  secure: true
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nagaratharmatrimony_uploads', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'pdf'],
    // transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional resize
  },
});

export { cloudinary, storage };
