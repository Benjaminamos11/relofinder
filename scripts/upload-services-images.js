
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// specific credentials provided by user
cloudinary.config({
    cloud_name: 'dphbnwjtx',
    api_key: '839435264768824',
    api_secret: 'sFqPNUBTVTkzPOiUT42viPL8ndw',
    secure: true
});

const imagesDir = path.join(process.cwd(), 'public/images/services');

async function uploadImages() {
    try {
        const files = fs.readdirSync(imagesDir);

        console.log('Found files:', files);

        for (const file of files) {
            if (file.match(/\.(png|jpg|jpeg|webp)$/i)) {
                const filePath = path.join(imagesDir, file);
                console.log(`Uploading ${file}...`);

                try {
                    const result = await cloudinary.uploader.upload(filePath, {
                        folder: 'services', // Folder in Cloudinary
                        use_filename: true,
                        unique_filename: false,
                        overwrite: true
                    });

                    console.log(`SUCCESS: ${file} -> ${result.secure_url}`);
                } catch (err) {
                    console.error(`FAILED to upload ${file}:`, err.message);
                }
            }
        }
    } catch (e) {
        console.error('Error reading directory:', e);
    }
}

uploadImages();
