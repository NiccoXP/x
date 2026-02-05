const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat_media',
    allowed_formats: ['jpg', 'png', 'gif', 'mp4'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Auto-resize
  },
});

module.exports = multer({ storage });
