/**
 * Script para listar todas as rotas REST API disponíveis no WordPress
 * Isso ajuda a identificar quais plugins estão registrados
 */

const BASE_URL = 'https://api.ptmoveis.pt';

async function listAvailableRoutes() {
    console.log('🔍 Listando rotas REST API disponíveis...\n');
    console.log('📍 Ambiente:', BASE_URL);
    console.log('---\n');
    
    try {
        const response = await fetch(`${BASE_URL}/wp-json/`);
        
        if (!response.ok) {
            console.error(`❌ Erro: ${response.status} ${response.statusText}`);
            return;
        }
        
        const data = await response.json();
        
        console.log('✅ Rotas disponíveis:\n');
        
        // Organizar rotas por namespace
        const namespaces = data.namespaces || [];
        const routes = data.routes || {};
        
        console.log('📦 Namespaces registrados:');
        namespaces.forEach(ns => {
            console.log(`  - ${ns}`);
        });
        
        console.log('\n---\n');
        
        // Procurar por rotas relacionadas a plugins de opções/customização
        console.log('🔍 Procurando rotas relacionadas a opções de categoria...\n');
        
        const relevantKeywords = ['wcco', 'option', 'category', 'custom', 'addon', 'extra'];
        let foundRelevant = false;
        
        Object.keys(routes).forEach(route => {
            const routeLower = route.toLowerCase();
            if (relevantKeywords.some(keyword => routeLower.includes(keyword))) {
                console.log(`  ✓ ${route}`);
                console.log(`    Métodos: ${routes[route].methods?.join(', ') || 'N/A'}`);
                foundRelevant = true;
            }
        });
        
        if (!foundRelevant) {
            console.log('  ❌ Nenhuma rota relacionada a opções de categoria encontrada');
        }
        
        console.log('\n---\n');
        
        // Listar todas as rotas WooCommerce
        console.log('🛒 Rotas WooCommerce disponíveis:\n');
        
        Object.keys(routes).forEach(route => {
            if (route.startsWith('/wc/')) {
                console.log(`  - ${route}`);
            }
        });
        
        console.log('\n---\n');
        
        // Verificar se há rotas de produtos com extensões
        console.log('📦 Rotas de produtos com possíveis extensões:\n');
        
        Object.keys(routes).forEach(route => {
            if (route.includes('/products/') && route.split('/').length > 5) {
                console.log(`  - ${route}`);
                console.log(`    Métodos: ${routes[route].methods?.join(', ') || 'N/A'}`);
            }
        });
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

listAvailableRoutes();
