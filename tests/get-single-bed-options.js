import fs from 'fs';
import path from 'path';

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

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = parseEnv(envPath);

const wccoUrl = (envConfig.VITE_WCCO_API_URL || '').replace(/\/$/, '');
const key = envConfig.VITE_WOOCOMMERCE_CONSUMER_KEY;
const secret = envConfig.VITE_WOOCOMMERCE_CONSUMER_SECRET;
const auth = Buffer.from(`${key}:${secret}`).toString('base64');

async function getProduct934() {
    try {
        const wccoRes = await fetch(`${wccoUrl}/options/934`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const options = await wccoRes.json();
        console.log(JSON.stringify(options, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

getProduct934();
