const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, 'sw-template/firebase-messaging-sw.zip');
const destDir = path.resolve(__dirname, 'dist/sw-template');
const dest = path.resolve(destDir, 'firebase-messaging-sw.zip');

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
