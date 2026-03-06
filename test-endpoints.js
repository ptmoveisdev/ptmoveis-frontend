import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const wooUrl = (envConfig.VITE_WOOCOMMERCE_API_URL || '').replace(/\/$/, '');
const wpBase = (envConfig.VITE_WORDPRESS_BASE_URL || '').replace(/\/$/, '');
const key = envConfig.VITE_WOOCOMMERCE_CONSUMER_KEY;
const secret = envConfig.VITE_WOOCOMMERCE_CONSUMER_SECRET;

const auth = Buffer.from(`${key}:${secret}`).toString('base64');

async function testWoo() {
    console.log('\n--- Testing WooCommerce POST /customers ---');
    try {
        const res = await fetch(`${wooUrl}/customers`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                email: 'test_register_error@ptmoveis.pt',
                first_name: 'Test',
                last_name: 'Error',
                username: 'test_register_error@ptmoveis.pt',
                password: 'password123'
            })
        });
        console.log('Woo Status:', res.status, res.statusText);
        const data = await res.json();
        console.log('Woo Response:', data);
    } catch (e) {
        console.error('Woo Error:', e);
    }
}

async function testJWT() {
    console.log('\n--- Testing JWT POST /wp-json/jwt-auth/v1/token ---');
    try {
        const res = await fetch(`${wpBase}/wp-json/jwt-auth/v1/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                username: 'test_register_error@ptmoveis.pt',
                password: 'password123'
            })
        });
        console.log('JWT Status:', res.status, res.statusText);
        const data = await res.json();
        console.log('JWT Response:', data);
    } catch (e) {
        console.error('JWT Error:', e);
    }
}

async function main() {
    await testWoo();
    await testJWT();
}

main();
