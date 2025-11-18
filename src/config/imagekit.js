const ImageKit = require('imagekit');

// Only initialize ImageKit if credentials are provided
let imagekit = null;

if (process.env.IMAGEKIT_PUBLIC_KEY && 
    process.env.IMAGEKIT_PRIVATE_KEY && 
    process.env.IMAGEKIT_URL_ENDPOINT) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
  });
  console.log('✅ ImageKit initialized successfully');
} else {
  console.warn('⚠️  ImageKit credentials not configured. File upload features will be disabled.');
}

module.exports = imagekit;

