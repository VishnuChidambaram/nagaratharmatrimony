import fs from 'fs';
const content = fs.readFileSync('backend-express/routes/userRoutes.js', 'utf8');
const lines = content.split('\n');
for (let i = 87; i <= 170; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
