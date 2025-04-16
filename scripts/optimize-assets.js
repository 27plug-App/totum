import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');

async function optimizeAssets() {
  try {
    // Read all files in dist directory
    const files = await fs.readdir(distDir);

    // Process each file
    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.css')) {
        const filePath = path.join(distDir, file);
        const content = await fs.readFile(filePath, 'utf8');

        // Remove comments and whitespace
        let optimizedContent = content
          .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove comments
          .replace(/\s+/g, ' ') // Reduce multiple spaces to single space
          .trim();

        // Write optimized content back
        await fs.writeFile(filePath, optimizedContent);

        console.log(`Optimized ${file}`);
      }
    }

    console.log('Asset optimization complete');
  } catch (error) {
    console.error('Error optimizing assets:', error);
    process.exit(1);
  }
}

optimizeAssets();