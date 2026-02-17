
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../temp_user_data.json');

try {
  // Read as utf-8
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(content);
} catch (e) {
  console.error("Error reading file:", e);
}
