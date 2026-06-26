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

const apiUrl = (envConfig.VITE_WOOCOMMERCE_API_URL || '').replace(/\/$/, '');
const key = envConfig.VITE_WOOCOMMERCE_CONSUMER_KEY;
const secret = envConfig.VITE_WOOCOMMERCE_CONSUMER_SECRET;
const auth = Buffer.from(`${key}:${secret}`).toString('base64');

async function getRecentOrders() {
    try {
        const res = await fetch(`${apiUrl}/orders?per_page=5`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const orders = await res.json();
        orders.forEach(o => {
            console.log(`Order ID: ${o.id} | Status: ${o.status} | Total: ${o.total} | Subtotal: ${o.prices_include_tax ? 'inc' : 'exc'} | Payment Method: ${o.payment_method}`);
            console.log(`  Shipping Total: ${o.shipping_total}`);
            o.line_items.forEach(item => {
                console.log(`  Line Item: ${item.name} (Product ID: ${item.product_id}, Variation ID: ${item.variation_id})`);
                console.log(`    Price: ${item.price} | Subtotal: ${item.subtotal} | Total: ${item.total}`);
                console.log(`    Meta:`, JSON.stringify(item.meta_data.map(m => ({ key: m.key, value: m.value })), null, 2));
            });
            if (o.fee_lines && o.fee_lines.length > 0) {
                console.log(`  Fees:`, JSON.stringify(o.fee_lines.map(f => ({ name: f.name, total: f.total })), null, 2));
            }
            console.log('--------------------------------------------------');
        });
    } catch (e) {
        console.error(e);
    }
}

getRecentOrders();
