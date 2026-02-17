import fs from 'fs';

function tailFile(path, lines = 20) {
    if (!fs.existsSync(path)) {
        console.log(`File not found: ${path}`);
        return;
    }
    const content = fs.readFileSync(path, 'utf8');
    const allLines = content.split('\n');
    console.log(`--- Last ${lines} lines of ${path} ---`);
    console.log(allLines.slice(-lines).join('\n'));
}

tailFile('backend-express/logs/error.log');
tailFile('backend-express/logs/combined.log');
