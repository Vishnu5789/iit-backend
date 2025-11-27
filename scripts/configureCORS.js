const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ["*"],
      AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
      AllowedOrigins: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://isaactechie.com",
        "https://*.isaactechie.com",
        "https://*.vercel.app"
      ],
      ExposeHeaders: [
        "ETag",
        "x-amz-server-side-encryption",
        "x-amz-request-id",
        "x-amz-id-2"
      ],
      MaxAgeSeconds: 3000
    }
  ]
};

async function configureCORS() {
  try {
    console.log('🔧 Configuring CORS for S3 bucket:', bucketName);
    console.log('');

    // First, try to get existing CORS config
    try {
      const getCommand = new GetBucketCorsCommand({ Bucket: bucketName });
      const existing = await s3Client.send(getCommand);
      console.log('📋 Existing CORS configuration:');
      console.log(JSON.stringify(existing.CORSRules, null, 2));
      console.log('');
    } catch (error) {
      if (error.name === 'NoSuchCORSConfiguration') {
        console.log('ℹ️  No existing CORS configuration found');
      }
      console.log('');
    }

    // Apply new CORS configuration
    const putCommand = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration
    });

    await s3Client.send(putCommand);

    console.log('✅ CORS configuration applied successfully!');
    console.log('');
    console.log('📋 New CORS configuration:');
    console.log(JSON.stringify(corsConfiguration.CORSRules, null, 2));
    console.log('');
    console.log('🎉 You can now upload large files (>100MB) directly to S3!');
    console.log('');
    console.log('⏱️  Wait 1-2 minutes for changes to propagate, then try uploading again.');

  } catch (error) {
    console.error('❌ Failed to configure CORS:', error.message);
    console.error('');
    console.error('💡 Make sure your AWS credentials have s3:PutBucketCors permission');
    process.exit(1);
  }
}

configureCORS();

