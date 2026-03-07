/**
 * Script para testar o endpoint do plugin WooCommerce Category Options
 * 
 * Como usar:
 * 1. node test-wcco-endpoint.js
 * 2. Verifique os resultados no console
 */

const BASE_URL = 'https://api.ptmoveis.pt';
const CONSUMER_KEY = 'ck_f72484e730ad6ad7858232fd6af4fddda9cfd248';
const CONSUMER_SECRET = 'cs_31973f8571e2eae301b3e93f814a316e98bf1869';

async function testWCCOEndpoint() {
    console.log('🧪 Testando endpoint WCCO...\n');
    console.log('📍 Ambiente:', BASE_URL);
    console.log('---\n');
    
    // Passo 1: Listar produtos para pegar IDs válidos
    console.log('📍 Passo 1: Listando produtos disponíveis...');
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    try {
        const productsUrl = `${BASE_URL}/wp-json/wc/v3/products?per_page=10`;
        const productsResponse = await fetch(productsUrl, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            }
        });
        
        if (!productsResponse.ok) {
            console.error(`❌ Erro ao listar produtos: ${productsResponse.status} ${productsResponse.statusText}`);
            return;
        }
        
        const products = await productsResponse.json();
        
        if (!Array.isArray(products) || products.length === 0) {
            console.error('❌ Nenhum produto encontrado');
            return;
        }
        
        console.log(`✅ ${products.length} produtos encontrados:\n`);
        products.forEach((p, i) => {
            console.log(`  ${i + 1}. ID: ${p.id} | Nome: ${p.name}`);
            console.log(`     Categorias: ${p.categories.map(c => c.name).join(', ')}`);
        });
        
        console.log('\n---\n');
        
        // Passo 2: Testar endpoints WCCO para cada produto
        console.log('📍 Passo 2: Testando endpoints WCCO...\n');
        
        const possibleEndpoints = [
            '/wp-json/wcco/v1/options',
            '/wp-json/wc/v3/products/{id}/category-options',
            '/wp-json/wp/v2/product-category-options',
        ];
        
        for (const product of products.slice(0, 3)) { // Testa apenas os 3 primeiros
            console.log(`\n🔍 Testando produto: ${product.name} (ID: ${product.id})`);
            
            for (const endpoint of possibleEndpoints) {
                const url = `${BASE_URL}${endpoint.replace('{id}', product.id)}/${product.id}`;
                
                try {
                    console.log(`  Tentando: ${endpoint}`);
                    const response = await fetch(url, {
                        headers: {
                            'Authorization': `Basic ${auth}`,
                            'Content-Type': 'application/json',
                        }
                    });
                    
                    console.log(`    Status: ${response.status} ${response.statusText}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log(`    ✅ SUCESSO! Dados recebidos:`);
                        console.log(JSON.stringify(data, null, 2));
                        console.log('\n    🎉 Endpoint correto encontrado:', endpoint);
                        return; // Encontrou o endpoint correto
                    } else if (response.status === 404) {
                        console.log(`    ⚠️  Endpoint não encontrado (404)`);
                    } else if (response.status === 401) {
                        console.log(`    ⚠️  Não autorizado (401) - verificar credenciais`);
                    } else {
                        const errorText = await response.text();
                        console.log(`    ❌ Erro: ${errorText.substring(0, 100)}`);
                    }
                } catch (error) {
                    console.log(`    ❌ Erro de conexão: ${error.message}`);
                }
            }
        }
        
        console.log('\n---\n');
        console.log('📍 Passo 3: Verificando meta_data dos produtos...\n');
        
        // Passo 3: Verificar se as opções estão em meta_data
        for (const product of products.slice(0, 3)) {
            console.log(`\n🔍 Meta data do produto: ${product.name} (ID: ${product.id})`);
            
            if (product.meta_data && product.meta_data.length > 0) {
                console.log('  Meta data encontrada:');
                product.meta_data.forEach(meta => {
                    if (meta.key.toLowerCase().includes('option') || 
                        meta.key.toLowerCase().includes('wcco') ||
                        meta.key.toLowerCase().includes('category')) {
                        console.log(`    - ${meta.key}:`, meta.value);
                    }
                });
            } else {
                console.log('  ⚠️  Nenhuma meta_data encontrada');
            }
        }
        
        console.log('\n---\n');
        console.log('📍 Conclusão:\n');
        console.log('❌ Nenhum endpoint WCCO funcionou.');
        console.log('\nPossíveis causas:');
        console.log('  1. Plugin não está instalado em produção');
        console.log('  2. Plugin não está ativado');
        console.log('  3. Plugin usa um endpoint diferente');
        console.log('  4. Plugin requer configuração adicional');
        console.log('\nPróximos passos:');
        console.log('  1. Verificar se o plugin está instalado: ' + BASE_URL + '/wp-admin/plugins.php');
        console.log('  2. Verificar rotas disponíveis: ' + BASE_URL + '/wp-json/');
        console.log('  3. Consultar documentação do plugin');
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

testWCCOEndpoint();
