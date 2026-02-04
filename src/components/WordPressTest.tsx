/**
 * Script de Teste para WordPress API
 * Use este componente para testar a conexão com WordPress
 */

import { useState } from 'react';
import {
    checkWordPressConnection,
    isWooCommerceConfigured,
    getAPIConfig
} from '../services/wordpress';
import {
    getProducts,
    getProductCategories,
    getPosts,
    getCategories
} from '../services/wordpress';

export default function WordPressTest() {
    const [testResults, setTestResults] = useState<{
        wordpress: boolean | null;
        woocommerce: boolean | null;
        products: any;
        categories: any;
        posts: any;
        wpCategories: any;
    }>({
        wordpress: null,
        woocommerce: null,
        products: null,
        categories: null,
        posts: null,
        wpCategories: null,
    });

    const [loading, setLoading] = useState(false);
    const config = getAPIConfig();

    const runTests = async () => {
        setLoading(true);
        const results: any = {};

        // Teste 1: Conexão com WordPress
        console.log('🔍 Testando conexão com WordPress...');
        try {
            results.wordpress = await checkWordPressConnection();
            console.log('✅ WordPress conectado!');
        } catch (error) {
            console.error('❌ Erro ao conectar com WordPress:', error);
            results.wordpress = false;
        }

        // Teste 2: Configuração WooCommerce
        console.log('🔍 Verificando configuração WooCommerce...');
        results.woocommerce = isWooCommerceConfigured();
        console.log(results.woocommerce ? '✅ WooCommerce configurado!' : '⚠️ WooCommerce não configurado');

        // Teste 3: Buscar produtos
        if (results.woocommerce) {
            console.log('🔍 Buscando produtos...');
            try {
                const productsData = await getProducts({ per_page: 5 });
                results.products = {
                    success: true,
                    count: productsData.data.length,
                    total: productsData.total,
                    sample: productsData.data[0] || null,
                };
                console.log(`✅ ${productsData.data.length} produtos encontrados!`);
            } catch (error: any) {
                console.error('❌ Erro ao buscar produtos:', error);
                results.products = {
                    success: false,
                    error: error.message,
                };
            }
        }

        // Teste 4: Buscar categorias de produtos
        if (results.woocommerce) {
            console.log('🔍 Buscando categorias de produtos...');
            try {
                const categoriesData = await getProductCategories({ per_page: 10 });
                results.categories = {
                    success: true,
                    count: categoriesData.data.length,
                    total: categoriesData.total,
                    sample: categoriesData.data[0] || null,
                };
                console.log(`✅ ${categoriesData.data.length} categorias encontradas!`);
            } catch (error: any) {
                console.error('❌ Erro ao buscar categorias:', error);
                results.categories = {
                    success: false,
                    error: error.message,
                };
            }
        }

        // Teste 5: Buscar posts
        console.log('🔍 Buscando posts...');
        try {
            const postsData = await getPosts({ per_page: 5 });
            results.posts = {
                success: true,
                count: postsData.data.length,
                total: postsData.total,
                sample: postsData.data[0] || null,
            };
            console.log(`✅ ${postsData.data.length} posts encontrados!`);
        } catch (error: any) {
            console.error('❌ Erro ao buscar posts:', error);
            results.posts = {
                success: false,
                error: error.message,
            };
        }

        // Teste 6: Buscar categorias do WordPress
        console.log('🔍 Buscando categorias do WordPress...');
        try {
            const wpCategoriesData = await getCategories({ per_page: 10 });
            results.wpCategories = {
                success: true,
                count: wpCategoriesData.data.length,
                total: wpCategoriesData.total,
                sample: wpCategoriesData.data[0] || null,
            };
            console.log(`✅ ${wpCategoriesData.data.length} categorias encontradas!`);
        } catch (error: any) {
            console.error('❌ Erro ao buscar categorias:', error);
            results.wpCategories = {
                success: false,
                error: error.message,
            };
        }

        setTestResults(results);
        setLoading(false);
        console.log('🎉 Testes concluídos!');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900">
                        🧪 Teste de Integração WordPress
                    </h1>

                    {/* Configuração Atual */}
                    <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h2 className="font-semibold text-lg mb-3 text-blue-900">
                            📋 Configuração Atual
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div>
                                <strong>WordPress API:</strong>{' '}
                                <code className="bg-blue-100 px-2 py-1 rounded">
                                    {config.wordpressApiUrl}
                                </code>
                            </div>
                            <div>
                                <strong>WordPress Base:</strong>{' '}
                                <code className="bg-blue-100 px-2 py-1 rounded">
                                    {config.wordpressBaseUrl}
                                </code>
                            </div>
                            <div>
                                <strong>WooCommerce API:</strong>{' '}
                                <code className="bg-blue-100 px-2 py-1 rounded">
                                    {config.woocommerceApiUrl}
                                </code>
                            </div>
                            <div>
                                <strong>WooCommerce Configurado:</strong>{' '}
                                <span className={config.woocommerceConfigured ? 'text-green-600' : 'text-red-600'}>
                                    {config.woocommerceConfigured ? '✅ Sim' : '❌ Não'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Botão de Teste */}
                    <button
                        onClick={runTests}
                        disabled={loading}
                        className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-8"
                    >
                        {loading ? '🔄 Executando testes...' : '▶️ Executar Testes'}
                    </button>

                    {/* Resultados */}
                    {testResults.wordpress !== null && (
                        <div className="space-y-4">
                            <h2 className="font-semibold text-xl mb-4">📊 Resultados dos Testes</h2>

                            {/* Teste WordPress */}
                            <TestResult
                                title="Conexão WordPress"
                                success={testResults.wordpress}
                                details={
                                    testResults.wordpress
                                        ? 'Conexão estabelecida com sucesso'
                                        : 'Não foi possível conectar ao WordPress'
                                }
                            />

                            {/* Teste WooCommerce */}
                            <TestResult
                                title="Configuração WooCommerce"
                                success={testResults.woocommerce}
                                details={
                                    testResults.woocommerce
                                        ? 'Consumer Key e Secret configurados'
                                        : 'Configure VITE_WOOCOMMERCE_CONSUMER_KEY e VITE_WOOCOMMERCE_CONSUMER_SECRET no arquivo .env'
                                }
                            />

                            {/* Teste Produtos */}
                            {testResults.products && (
                                <TestResult
                                    title="Produtos WooCommerce"
                                    success={testResults.products.success}
                                    details={
                                        testResults.products.success
                                            ? `${testResults.products.count} produtos encontrados de ${testResults.products.total} total`
                                            : testResults.products.error
                                    }
                                    data={testResults.products.sample}
                                />
                            )}

                            {/* Teste Categorias */}
                            {testResults.categories && (
                                <TestResult
                                    title="Categorias de Produtos"
                                    success={testResults.categories.success}
                                    details={
                                        testResults.categories.success
                                            ? `${testResults.categories.count} categorias encontradas de ${testResults.categories.total} total`
                                            : testResults.categories.error
                                    }
                                    data={testResults.categories.sample}
                                />
                            )}

                            {/* Teste Posts */}
                            {testResults.posts && (
                                <TestResult
                                    title="Posts WordPress"
                                    success={testResults.posts.success}
                                    details={
                                        testResults.posts.success
                                            ? `${testResults.posts.count} posts encontrados de ${testResults.posts.total} total`
                                            : testResults.posts.error
                                    }
                                    data={testResults.posts.sample}
                                />
                            )}

                            {/* Teste Categorias WP */}
                            {testResults.wpCategories && (
                                <TestResult
                                    title="Categorias WordPress"
                                    success={testResults.wpCategories.success}
                                    details={
                                        testResults.wpCategories.success
                                            ? `${testResults.wpCategories.count} categorias encontradas de ${testResults.wpCategories.total} total`
                                            : testResults.wpCategories.error
                                    }
                                    data={testResults.wpCategories.sample}
                                />
                            )}
                        </div>
                    )}

                    {/* Instruções */}
                    <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold mb-2">💡 Dicas</h3>
                        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                            <li>Verifique se o WordPress está rodando e acessível</li>
                            <li>Configure as variáveis de ambiente no arquivo .env</li>
                            <li>Certifique-se de que o CORS está habilitado no WordPress</li>
                            <li>Verifique se há produtos e posts publicados</li>
                            <li>Abra o console do navegador para ver logs detalhados</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Componente auxiliar para exibir resultados
function TestResult({
    title,
    success,
    details,
    data,
}: {
    title: string;
    success: boolean;
    details: string;
    data?: any;
}) {
    const [showData, setShowData] = useState(false);

    return (
        <div
            className={`p-4 rounded-lg border-2 ${success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                        {success ? '✅' : '❌'} {title}
                    </h3>
                    <p className="text-sm text-gray-700">{details}</p>
                </div>
                {data && (
                    <button
                        onClick={() => setShowData(!showData)}
                        className="text-sm text-blue-600 hover:text-blue-800 ml-4"
                    >
                        {showData ? 'Ocultar' : 'Ver'} dados
                    </button>
                )}
            </div>
            {showData && data && (
                <pre className="mt-3 p-3 bg-gray-900 text-green-400 rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
}
