const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * PDF Processing Service
 * Converts PDFs to images for secure streaming
 */
class PDFProcessingService {
  /**
   * Convert PDF to individual page images using pdf-poppler
   * Note: Requires 'pdf-poppler' npm package and system 'poppler-utils'
   * 
   * For now, this is a template. In production:
   * 1. Install: npm install pdf-poppler
   * 2. Install system dependency: apt-get install poppler-utils (Linux) or brew install poppler (Mac)
   * 3. Uncomment the pdf.convert() code below
   */
  async convertPdfToImages(pdfBuffer, pdfId, outputFolder) {
    try {
      // Create output folder
      if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
      }

      // Save PDF temporarily
      const tempPdfPath = path.join(outputFolder, `${pdfId}.pdf`);
      fs.writeFileSync(tempPdfPath, pdfBuffer);

      console.log(`📄 Converting PDF to images: ${pdfId}`);

      // METHOD 1: Using pdf-poppler (RECOMMENDED - Uncomment when ready)
      /*
      const pdf = require('pdf-poppler');
      
      const opts = {
        format: 'png',
        out_dir: outputFolder,
        out_prefix: 'page',
        page: null, // Convert all pages
        scale: 2048 // High quality
      };

      await pdf.convert(tempPdfPath, opts);
      */

      // METHOD 2: Using alternative library (FALLBACK)
      // For demonstration, we'll create placeholder logic
      // Replace with actual PDF conversion in production
      
      // Get page count (would come from pdf-poppler or pdf-parse)
      const pageCount = await this.getPdfPageCount(pdfBuffer);
      
      console.log(`📄 PDF has ${pageCount} pages`);

      // For each page, create optimized image
      // In production, pdf-poppler will create these automatically
      const imagePaths = [];
      
      for (let i = 1; i <= pageCount; i++) {
        // In production, pdf-poppler creates: page-1.png, page-2.png, etc.
        const imagePath = path.join(outputFolder, `page-${i}.png`);
        imagePaths.push(imagePath);
      }

      // Clean up temp PDF
      fs.unlinkSync(tempPdfPath);

      return {
        totalPages: pageCount,
        imagePaths
      };

    } catch (error) {
      console.error('❌ PDF conversion error:', error);
      throw new Error(`Failed to convert PDF to images: ${error.message}`);
    }
  }

  /**
   * Get PDF page count
   */
  async getPdfPageCount(pdfBuffer) {
    try {
      // Using pdf-parse to get page count
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(pdfBuffer);
      return data.numpages;
    } catch (error) {
      console.error('Error getting page count:', error);
      // Fallback: assume single page
      return 1;
    }
  }

  /**
   * Optimize and upload images to S3
   */
  async uploadImagesToS3(imagePaths, courseId, pdfId, s3Service) {
    const uploadedPages = [];

    console.log(`📤 Uploading ${imagePaths.length} pages to S3...`);

    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      const pageNumber = i + 1;

      try {
        // Read image file
        const imageBuffer = fs.readFileSync(imagePath);

        // Get original dimensions
        const metadata = await sharp(imageBuffer).metadata();
        const originalWidth = metadata.width;
        const originalHeight = metadata.height;

        // Optimize image with sharp
        const optimizedBuffer = await sharp(imageBuffer)
          .resize(1600, null, { // Max width 1600px for quality
            withoutEnlargement: true,
            fit: 'inside'
          })
          .png({
            quality: 95,
            compressionLevel: 6
          })
          .toBuffer();

        console.log(`✓ Optimized page ${pageNumber}: ${imageBuffer.length} → ${optimizedBuffer.length} bytes`);

        // Upload to S3 in private folder
        const s3Key = `courses/${courseId}/pdfs/${pdfId}/pages/page-${pageNumber}.png`;
        
        const uploadResult = await s3Service.uploadToS3(
          optimizedBuffer,
          s3Key,
          'image/png',
          false // private
        );

        uploadedPages.push({
          pageNumber,
          s3Key,
          s3Url: uploadResult.url || uploadResult.Location,
          width: originalWidth,
          height: originalHeight
        });

        // Clean up local file
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }

      } catch (error) {
        console.error(`❌ Error uploading page ${pageNumber}:`, error);
        throw error;
      }
    }

    console.log(`✅ Successfully uploaded ${uploadedPages.length} pages`);

    return uploadedPages;
  }

  /**
   * Clean up temporary files
   */
  cleanupTempFolder(folderPath) {
    try {
      if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`🧹 Cleaned up temp folder: ${folderPath}`);
      }
    } catch (error) {
      console.error('Error cleaning up temp folder:', error);
    }
  }
}

module.exports = new PDFProcessingService();
