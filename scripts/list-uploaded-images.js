
import { v2 as cloudinary } from 'cloudinary';

// specific credentials
cloudinary.config({
    cloud_name: 'dphbnwjtx',
    api_key: '839435264768824',
    api_secret: 'sFqPNUBTVTkzPOiUT42viPL8ndw',
    secure: true
});

async function listImages() {
    try {
        // List resources in the 'services' folder
        const result = await cloudinary.search
            .expression('folder:services')
            .sort_by('public_id', 'desc')
            .max_results(50)
            .execute();

        console.log('--- FOUND IMAGES ---');
        result.resources.forEach(res => {
            console.log(`FILE: ${res.filename}.${res.format} URL: ${res.secure_url}`);
        });
        console.log('--- END ---');

    } catch (e) {
        console.error('Error listing images:', e);
    }
}

listImages();
