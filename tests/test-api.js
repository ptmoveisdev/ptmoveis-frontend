import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Manual .env parser
function parseEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf-8');
    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim();
        }
    });
    return env;
}

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = parseEnv(envPath);

const url = (envConfig.VITE_WOOCOMMERCE_API_URL || '').replace(/\/$/, '') + '/products';
const key = envConfig.VITE_WOOCOMMERCE_CONSUMER_KEY;
const secret = envConfig.VITE_WOOCOMMERCE_CONSUMER_SECRET;

console.log('Testing URL:', url);
// console.log('Key:', key);
// console.log('Secret:', secret);

if (!key || !secret) {
    console.error('Missing credentials');
    process.exit(1);
}

const auth = Buffer.from(`${key}:${secret}`).toString('base64');

console.log('Fetching...');

fetch(url, {
    headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
})
    .then(async res => {
        console.log('Status:', res.status);
        console.log('Status Text:', res.statusText);
        if (!res.ok) {
            console.log('Response:', await res.text());
        } else {
            const data = await res.json();
            console.log('Success! Found', Array.isArray(data) ? data.length : '?', 'products');
        }
    })
    .catch(err => console.error('Error:', err));
