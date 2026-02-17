import fs from 'fs';
const buffer = fs.readFileSync('backend-express/routes/userRoutes.js');
for (let i = 0; i < buffer.length - 1; i++) {
  if (buffer[i] === 0x0D && buffer[i+1] !== 0x0A) {
    console.log(`Standalone \\r found at offset ${i}`);
  }
}
// Also look for "currentUser" and see if there are weird bytes in it
const content = buffer.toString('utf8');
const search = 'currentUser';
let lastIndex = -1;
while ((lastIndex = content.indexOf('currentUser', lastIndex + 1)) !== -1) {
  // Check the bytes around this index
  const slice = buffer.slice(lastIndex, lastIndex + search.length);
  console.log(`Found "currentUser" at ${lastIndex}, bytes:`, slice);
}
// Check if "cur" followed by something else exists
const part = 'cur\r';
if (content.includes(part)) {
    console.log('Found "cur\\r"!');
}
