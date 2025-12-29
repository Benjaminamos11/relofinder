
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAPPING_FILE = path.join(__dirname, 'asset-mapping.json');
const CONTENT_DIRS = [
    path.join(__dirname, '../src/content/companies'),
    path.join(__dirname, '../src/content/blog')
];

if (!fs.existsSync(MAPPING_FILE)) {
    console.error('❌ Mapping file not found!');
    process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
console.log(`Loaded ${mapping.length} asset mappings.`);

// Create a map for faster lookup: localPath -> cloudinaryUrl
const urlMap = new Map();
mapping.forEach(item => {
    urlMap.set(item.localPath, item.cloudinaryUrl);
});

let totalReplacements = 0;
let filesUpdated = 0;

CONTENT_DIRS.forEach(dir => {
    if (!fs.existsSync(dir)) {
        console.warn(`⚠️ Directory not found: ${dir}`);
        return;
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let fileReplacements = 0;

        // Check each mapped URL
        // We do a simple string replacement. 
        // Optimization: Check if the file contains the localPath string.

        // Iterate over the map to ensure we catch everything
        urlMap.forEach((cloudinaryUrl, localPath) => {
            // Create a regex to match the path inside quotes or just the path string if simple check
            // escaping special regex chars in localPath
            if (content.includes(localPath)) {
                // Use global replace
                const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapeRegExp(localPath), 'g');

                content = content.replace(regex, cloudinaryUrl);
                fileReplacements++;
            }
        });

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated ${file} (${fileReplacements} replacements)`);
            filesUpdated++;
            totalReplacements += fileReplacements;
        }
    });
});

console.log(`\n🎉 DONE! Updated ${filesUpdated} files with ${totalReplacements} URL replacements.`);
