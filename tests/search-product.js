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
const wccoUrl = (envConfig.VITE_WCCO_API_URL || '').replace(/\/$/, '');
const key = envConfig.VITE_WOOCOMMERCE_CONSUMER_KEY;
const secret = envConfig.VITE_WOOCOMMERCE_CONSUMER_SECRET;

const auth = Buffer.from(`${key}:${secret}`).toString('base64');

async function searchProduct() {
    console.log('🔍 Searching for "ARMANI"...');
    try {
        const res = await fetch(`${wooUrl}/products?search=ARMANI`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        console.log(`Response status: ${res.status} ${res.statusText}`);
        const text = await res.text();
        let products;
        try {
            products = JSON.parse(text);
        } catch (err) {
            console.error('Failed to parse response as JSON. Response body preview:');
            console.error(text.substring(0, 1000));
            return;
        }
        for (const p of products) {
            console.log(`Product: ${p.name} (ID: ${p.id})`);
            console.log(`  Price: ${p.price} | Regular Price: ${p.regular_price}`);
            if (p.variations && p.variations.length > 0) {
                console.log(`  Variations: ${p.variations.join(', ')}`);
                // Let's fetch the first variation
                const varRes = await fetch(`${wooUrl}/products/${p.id}/variations/${p.variations[0]}`, {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });
                const variation = await varRes.json();
                console.log(`  Sample Variation ID ${variation.id}: price=${variation.price}`);
            }
            
            // Let's check WCCO options
            const wccoRes = await fetch(`${wccoUrl}/options/${p.id}`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            if (wccoRes.ok) {
                const options = await wccoRes.json();
                console.log(`  WCCO Options (count: ${options.length}):`);
                options.forEach((opt, idx) => {
                    console.log(`    - ${opt.title} (type: ${opt.type})`);
                    opt.options.forEach(o => {
                        console.log(`      * ${o.label} -> price: ${o.price}, price_mode: ${o.price_mode || o.mode}`);
                    });
                });
            } else {
                console.log(`  WCCO Options: Request failed with status ${wccoRes.status}`);
            }
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

searchProduct();
