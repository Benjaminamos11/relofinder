
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Error: Cloudinary credentials missing in .env');
    console.error('Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set.');
    process.exit(1);
}

console.log(`✅ Cloudinary configured for cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);

// Configuration
const PUBLIC_DIR = path.join(__dirname, '../public');
const ASSETS_DIRS = ['images', 'assets']; // Folders to scan

// Helper to crawl directories
function getFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getFiles(filePath, fileList);
        } else {
            // Filter for images
            if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

async function uploadImage(filePath) {
    try {
        const relativePath = path.relative(PUBLIC_DIR, filePath);
        // Create a public ID that mirrors the folder structure
        // e.g., assets/icons/logo.png -> assets/icons/logo
        const publicId = relativePath.replace(/\.[^/.]+$/, "");

        console.log(`Uploading: ${relativePath}...`);

        const result = await cloudinary.uploader.upload(filePath, {
            public_id: publicId,
            overwrite: false, // Don't re-upload if exists
            resource_type: 'auto'
        });

        return {
            localPath: '/' + relativePath,
            cloudinaryUrl: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error(`❌ Failed to upload ${filePath}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🚀 Starting asset upload...');

    let allFiles = [];
    ASSETS_DIRS.forEach(subDir => {
        const fullPath = path.join(PUBLIC_DIR, subDir);
        allFiles = allFiles.concat(getFiles(fullPath));
    });

    console.log(`Found ${allFiles.length} images to process.`);

    const results = [];

    // Process in chunks to avoid rate limits
    for (const file of allFiles) {
        const result = await uploadImage(file);
        if (result) results.push(result);
    }

    // Save mapping to a file
    const mappingPath = path.join(__dirname, 'asset-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(results, null, 2));

    console.log(`\n✅ Upload complete! Mapping saved to ${mappingPath}`);
    console.log(`Total Uploaded/Checked: ${results.length}`);
}

main().catch(console.error);
