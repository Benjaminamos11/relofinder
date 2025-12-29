
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({
    cloud_name: 'dphbnwjtx',
    api_key: '839435264768824',
    api_secret: 'sFqPNUBTVTkzPOiUT42viPL8ndw',
    secure: true
});

const homeImagesDir = path.join(process.cwd(), 'src/assets/images/home');
const imagesToUpload = [
    'swiss-lake-drone-hero.png',
    'swiss-boutique-hero-color.png',
    'swiss-modern-dark-interior.jpg',
    'swiss-map-white-orange.jpg'
];

async function uploadHomeImages() {
    console.log('--- STARTING HOME IMAGE UPLOAD ---');
    for (const file of imagesToUpload) {
        const filePath = path.join(homeImagesDir, file);
        if (!fs.existsSync(filePath)) {
            console.error(`MISSING: ${file} not found at ${filePath}`);
            continue;
        }

        console.log(`Uploading ${file}...`);
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder: 'home',
                use_filename: true,
                unique_filename: false,
                overwrite: true
            });
            console.log(`SUCCESS: ${file} -> ${result.secure_url}`);
        } catch (err) {
            console.error(`FAILED: ${file}:`, err.message);
        }
    }
    console.log('--- FINISHED ---');
}

uploadHomeImages();
