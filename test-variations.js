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

const baseUrl = (envConfig.VITE_WOOCOMMERCE_API_URL || '').replace(/\/$/, '');
const key = envConfig.VITE_WOOCOMMERCE_CONSUMER_KEY;
const secret = envConfig.VITE_WOOCOMMERCE_CONSUMER_SECRET;

if (!key || !secret) {
    console.error('Missing credentials');
    process.exit(1);
}

const auth = Buffer.from(`${key}:${secret}`).toString('base64');

async function fetchProducts() {
    console.log('🔍 Buscando produto "teste variacoes"...\n');

    const url = `${baseUrl}/products?search=teste variacoes`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
        }
    });

    if (!res.ok) {
        console.error('❌ Erro ao buscar produtos:', res.status, res.statusText);
        return;
    }

    const products = await res.json();

    if (products.length === 0) {
        console.log('⚠️ Nenhum produto encontrado com o nome "teste variacoes"');
        return;
    }

    const product = products[0];
    console.log('✅ Produto encontrado:');
    console.log('   ID:', product.id);
    console.log('   Nome:', product.name);
    console.log('   Tipo:', product.type);
    console.log('   Variações IDs:', product.variations);
    console.log('   Atributos:', JSON.stringify(product.attributes, null, 2));
    console.log('\n');

    // Se o produto tem variações, buscar detalhes de cada variação
    if (product.variations && product.variations.length > 0) {
        console.log('📦 Buscando detalhes das variações...\n');

        for (const variationId of product.variations) {
            const variationUrl = `${baseUrl}/products/${product.id}/variations/${variationId}`;

            const varRes = await fetch(variationUrl, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                }
            });

            if (varRes.ok) {
                const variation = await varRes.json();
                console.log(`\n🎨 Variação ID ${variationId}:`);
                console.log('   Preço:', variation.price);
                console.log('   Estoque:', variation.stock_status);
                console.log('   Atributos:', JSON.stringify(variation.attributes, null, 2));
                console.log('   Imagem:', variation.image?.src || 'Sem imagem');

                // Verificar meta_data para swatches do WCBoost
                if (variation.meta_data && variation.meta_data.length > 0) {
                    console.log('   Meta Data (WCBoost):');
                    variation.meta_data.forEach(meta => {
                        if (meta.key.includes('swatch') || meta.key.includes('wcboost')) {
                            console.log(`     ${meta.key}:`, meta.value);
                        }
                    });
                }
            }
        }
    }

    // Salvar resposta completa para análise
    fs.writeFileSync(
        path.join(__dirname, 'product-variations-response.json'),
        JSON.stringify({ product, variations: product.variations }, null, 2)
    );

    console.log('\n✅ Resposta completa salva em product-variations-response.json');
}

fetchProducts().catch(err => console.error('❌ Erro:', err));
