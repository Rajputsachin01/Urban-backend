const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
// AWS Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();
// Allowed File Types
const allowedTypes = ['image/jpeg', 'image/png',"image/webp", 'image/jpg', 'application/pdf', 'video/mp4', 'video/mpeg', 'video/avi'];

// File Filter for Validation
const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Allowed types: JPG, PNG, PDF, MP4, MPEG, AVI'));
  }
  cb(null, true);
};

// Configure Local Storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/temp'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Configure Memory Storage for S3
const s3Storage = multer.memoryStorage();

// Select Upload Type
const upload = (storageType) =>
  multer({
    storage: storageType === 's3' ? s3Storage : localStorage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB Limit
  });

// Upload to S3 for only single file
// const uploadToS3 = async (file, folderName = 'general') => {
//   try {
//     const fileName = `${folderName}/${Date.now()}-${file.originalname}`;
//     const uploadParams = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key: fileName,
//       Body: file.buffer,
//       ContentType: file.mimetype,
//     };

//     const result = await s3.upload(uploadParams).promise();
//     return result.Location;
//   } catch (error) {
//     console.error('S3 Upload Error:', error);
//     throw new Error('Failed to upload to S3');
//   }
// };

// Upload Multiple Files to S3
const uploadToS3 = async (files, folderName = 'general') => {
  try {
    const uploadResults = [];

    for (const file of files) {
      const fileName = `${folderName}/${Date.now()}-${file.originalname}`;
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer, 
        ContentType: file.mimetype,
      };

      const result = await s3.upload(uploadParams).promise();
      uploadResults.push(result.Location);
    }

    return uploadResults; 
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload to S3');
  }
};



module.exports = { upload, uploadToS3 };
