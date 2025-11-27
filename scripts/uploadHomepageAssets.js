const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;
const homepageDir = path.join(__dirname, '../../iit-frontend/public/homepage');

// Helper function to get content type based on file extension
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.webp': 'image/webp'
  };
  return contentTypes[ext] || 'application/octet-stream';
}

// Upload a single file to S3
async function uploadFile(filePath, s3Key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const contentType = getContentType(filePath);
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType
      // ACL removed - bucket uses bucket policy for public access
    });

    await s3Client.send(command);
    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    console.log(`✅ Uploaded: ${path.basename(filePath)} -> ${url}`);
    return url;
  } catch (error) {
    console.error(`❌ Failed to upload ${filePath}:`, error.message);
    throw error;
  }
}

// Upload all files in the homepage directory
async function uploadAllHomepageAssets() {
  try {
    console.log('🚀 Starting upload of homepage assets to S3...\n');
    
    if (!fs.existsSync(homepageDir)) {
      console.error(`❌ Homepage directory not found: ${homepageDir}`);
      console.log('Please ensure the homepage folder exists at: iit-frontend/public/homepage/');
      process.exit(1);
    }

    const files = fs.readdirSync(homepageDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webp'].includes(ext);
    });

    if (imageFiles.length === 0) {
      console.log('⚠️  No image or video files found in homepage directory');
      process.exit(0);
    }

    console.log(`Found ${imageFiles.length} files to upload\n`);

    const uploadPromises = imageFiles.map(file => {
      const filePath = path.join(homepageDir, file);
      const s3Key = `homepage/${file}`;
      return uploadFile(filePath, s3Key);
    });

    const urls = await Promise.all(uploadPromises);

    console.log('\n✅ All files uploaded successfully!\n');
    console.log('📋 Uploaded URLs:');
    urls.forEach(url => console.log(`   ${url}`));
    
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env file with:');
    console.log(`   VITE_HOMEPAGE_ASSETS_URL=https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/homepage`);
    console.log('\n2. The images will now load from S3 in production!');
    
  } catch (error) {
    console.error('\n❌ Upload failed:', error.message);
    process.exit(1);
  }
}

// Run the upload
uploadAllHomepageAssets();

