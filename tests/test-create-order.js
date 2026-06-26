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

async function testCreateOrder() {
    try {
        const payload = {
            payment_method: 'paypal',
            payment_method_title: 'PayPal',
            set_paid: true,
            billing: {
                first_name: 'Test',
                last_name: 'User',
                address_1: 'Rua de Teste, 123',
                city: 'Porto',
                postcode: '4000-000',
                country: 'PT',
                email: 'test@example.com',
                phone: '912345678'
            },
            shipping: {
                first_name: 'Test',
                last_name: 'User',
                address_1: 'Rua de Teste, 123',
                city: 'Porto',
                postcode: '4000-000',
                country: 'PT'
            },
            line_items: [
                {
                    product_id: 74, // CAMA ARMANI
                    quantity: 1,
                    subtotal: '459.00',
                    total: '459.00',
                    meta_data: [
                        {
                            key: "CAMA+ESTRADO+COLCHÃO ORIGINAL (ECONÓMICO):",
                            value: "200X180 (+399 €)"
                        },
                        {
                            key: "MICRO-FIBRA",
                            value: "BEGE"
                        },
                        {
                            key: "SISTEMA ELEVATÓRIO",
                            value: "SISTEMA ELEVATÓRIO SEM FUNDO EM MADEIRA  (+50 €)"
                        },
                        {
                            key: "MONTAGEM ",
                            value: "MONTAGEM  (+10 €)"
                        },
                        {
                            key: "RECOMENDAÇÃO PARA COLCHÃO",
                            value: "( DISPONIVEL APENAS NO CONJUNTO COMPLETO )COLCHÃO PT MAXVISCO 26KILOS VISCOELÁSTICO (+100 €)"
                        }
                    ]
                }
            ],
            fee_lines: [
                {
                    name: 'RECOMENDAÇÃO PARA COLCHÃO',
                    total: '100.00',
                    tax_status: 'none'
                }
            ],
            shipping_lines: [
                {
                    method_id: 'flat_rate',
                    method_title: 'Envio',
                    total: '50.00'
                }
            ]
        };

        console.log('Sending payload to create order...');
        const res = await fetch(`${apiUrl}/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            console.log(`✅ Order Created Successfully! ID: ${data.id}`);
            console.log(`  Order Total: ${data.total}`);
            data.line_items.forEach(item => {
                console.log(`  Line Item: ${item.name}`);
                console.log(`    Price: ${item.price} | Subtotal: ${item.subtotal} | Total: ${item.total}`);
            });
            
            // Delete test order to keep database clean
            console.log('Cleaning up: deleting test order...');
            await fetch(`${apiUrl}/orders/${data.id}?force=true`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            console.log('Test order deleted.');
        } else {
            console.error('❌ Error creating order:', data);
        }
    } catch (e) {
        console.error(e);
    }
}

testCreateOrder();
