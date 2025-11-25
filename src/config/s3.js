const { S3Client } = require('@aws-sdk/client-s3');

// Initialize S3 client only if credentials are provided
let s3Client = null;

if (process.env.AWS_ACCESS_KEY_ID && 
    process.env.AWS_SECRET_ACCESS_KEY && 
    process.env.AWS_S3_BUCKET_NAME &&
    process.env.AWS_REGION) {
  
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  console.log('✅ AWS S3 initialized successfully');
} else {
  console.warn('⚠️  AWS S3 credentials not configured. File upload features will be disabled.');
}

module.exports = {
  s3Client,
  bucketName: process.env.AWS_S3_BUCKET_NAME,
  region: process.env.AWS_REGION,
  bucketUrl: process.env.AWS_S3_BUCKET_NAME ? 
    `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com` : 
    null
};

