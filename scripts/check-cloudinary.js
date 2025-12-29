
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

console.log('Checking Cloudinary Config...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'OK' : 'MISSING');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'OK' : 'MISSING');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'OK' : 'MISSING');

// Fallback: Check if CLOUDINARY_URL is set
if (process.env.CLOUDINARY_URL) {
    console.log('CLOUDINARY_URL found.');
}

// User provided keys manually
const MANUAL_API_KEY = 'sFqPNUBTVTkzPOiUT42viPL8ndw';
const MANUAL_CLOUD_NAME = 'dphbnwjtx';

// Try to upload a sample if we have a secret (assuming it might be in env even if we can't see it)
if (process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: MANUAL_CLOUD_NAME,
        api_key: MANUAL_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('Configured with manual key + env secret.');
} else if (process.env.CLOUDINARY_URL) {
    // cloudinary auto-configures from url
    console.log('Configured from CLOUDINARY_URL.');
} else {
    console.log('NO SECRET AND NO URL FOUND. Cannot upload.');
}

const imagesDir = path.join(process.cwd(), 'public/images/services');
// ... logic to upload would go here
