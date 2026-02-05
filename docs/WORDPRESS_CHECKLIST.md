# ✅ Checklist de Configuração WordPress API

Use este checklist para garantir que tudo está configurado corretamente.

---

## 📋 Fase 1: Instalação do WordPress

- [ ] WordPress baixado de [wordpress.org](https://wordpress.org)
- [ ] WordPress instalado (local ou servidor)
- [ ] Banco de dados MySQL criado
- [ ] WordPress configurado e rodando
- [ ] Acesso ao painel administrativo funcionando
- [ ] Usuário administrador criado

**Teste**: Acesse `http://localhost/wordpress/wp-admin` e faça login

---

## 📋 Fase 2: Instalação do WooCommerce

- [ ] Plugin WooCommerce instalado
- [ ] Plugin WooCommerce ativado
- [ ] Assistente de configuração concluído
- [ ] Moeda configurada para Real Brasileiro (R$)
- [ ] País configurado para Brasil

**Teste**: Vá em `WooCommerce → Configurações` e verifique as configurações

---

## 📋 Fase 3: Configuração de Permalinks

- [ ] Acessei `Configurações → Links Permanentes`
- [ ] Selecionei "Nome do post" ou estrutura personalizada
- [ ] Cliquei em "Salvar alterações"
- [ ] Permalinks amigáveis funcionando

**Teste**: Acesse `http://localhost/wordpress/wp-json/wp/v2/posts`
- ✅ Deve retornar JSON
- ❌ Se retornar 404, refaça a configuração de permalinks

---

## 📋 Fase 4: Habilitar CORS

### Opção A: Plugin (Recomendado)
- [ ] Instalei plugin "WP REST API - Allow All CORS"
- [ ] Ativei o plugin

### Opção B: Código Manual
- [ ] Adicionei código CORS ao `functions.php`
- [ ] Salvei o arquivo sem erros

**Teste**: Abra o console do navegador e execute:
```javascript
fetch('http://localhost/wordpress/wp-json/wp/v2/posts')
  .then(res => res.json())
  .then(data => console.log('CORS OK:', data))
  .catch(err => console.error('CORS Error:', err));
```
- ✅ Deve exibir "CORS OK" e dados
- ❌ Se der erro CORS, verifique a configuração

---

## 📋 Fase 5: Gerar Credenciais da API

- [ ] Acessei `WooCommerce → Configurações → Avançado → REST API`
- [ ] Cliquei em "Adicionar chave"
- [ ] Configurei descrição: "Frontend React App"
- [ ] Selecionei usuário administrador
- [ ] Configurei permissões: "Somente leitura"
- [ ] Cliquei em "Gerar chave da API"
- [ ] Copiei a Consumer Key
- [ ] Copiei a Consumer Secret
- [ ] Guardei as credenciais em local seguro

**⚠️ IMPORTANTE**: Você só verá as credenciais UMA VEZ!

**Teste**: Substitua XXX e YYY pelas suas credenciais e acesse:
```
http://localhost/wordpress/wp-json/wc/v3/products?consumer_key=ck_XXX&consumer_secret=cs_YYY
```
- ✅ Deve retornar JSON com produtos
- ❌ Se der erro, gere novas credenciais

---

## 📋 Fase 6: Adicionar Conteúdo de Teste

### Categorias
- [ ] Criei pelo menos 3 categorias de produtos
- [ ] Categorias têm nomes descritivos
- [ ] Categorias têm slugs corretos

### Produtos
- [ ] Criei pelo menos 5 produtos
- [ ] Produtos têm nomes
- [ ] Produtos têm descrições
- [ ] Produtos têm descrições curtas
- [ ] Produtos têm preços
- [ ] Produtos têm imagens principais
- [ ] Produtos têm galerias de imagens (3-5 fotos)
- [ ] Produtos têm categorias atribuídas
- [ ] Produtos têm status "Publicado"
- [ ] Produtos têm estoque configurado

### Produtos Especiais (Opcional)
- [ ] Criei pelo menos 2 produtos em promoção (com preço promocional)
- [ ] Marquei pelo menos 2 produtos como "Destaque"

**Teste**: Acesse `Produtos → Todos os produtos` e verifique a lista

---

## 📋 Fase 7: Testar Endpoints da API

### WordPress REST API
- [ ] Testei: `/wp-json/wp/v2/posts`
- [ ] Testei: `/wp-json/wp/v2/categories`
- [ ] Testei: `/wp-json/wp/v2/media`

### WooCommerce REST API
- [ ] Testei: `/wp-json/wc/v3/products` (com credenciais)
- [ ] Testei: `/wp-json/wc/v3/products/categories` (com credenciais)

**Como testar**: Cole as URLs no navegador (adicione consumer_key e consumer_secret para WooCommerce)

---

## 📋 Fase 8: Configurar Frontend

### Arquivo .env
- [ ] Abri o arquivo `.env` na raiz do projeto
- [ ] Configurei `VITE_WORDPRESS_API_URL`
- [ ] Configurei `VITE_WORDPRESS_BASE_URL`
- [ ] Configurei `VITE_WOOCOMMERCE_API_URL`
- [ ] Configurei `VITE_WOOCOMMERCE_CONSUMER_KEY`
- [ ] Configurei `VITE_WOOCOMMERCE_CONSUMER_SECRET`
- [ ] Salvei o arquivo

**Exemplo de .env correto**:
```env
VITE_WORDPRESS_API_URL=http://localhost/wordpress/wp-json/wp/v2
VITE_WORDPRESS_BASE_URL=http://localhost/wordpress
VITE_WOOCOMMERCE_API_URL=http://localhost/wordpress/wp-json/wc/v3
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_1234567890abcdef
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_1234567890abcdef
```

---

## 📋 Fase 9: Testar Integração no Frontend

### Iniciar Servidor
- [ ] Executei `npm run dev`
- [ ] Servidor iniciou sem erros
- [ ] Acessei `http://localhost:5173`

### Componente de Teste
- [ ] Importei `WordPressTest` no `App.tsx`
- [ ] Componente renderizou corretamente
- [ ] Cliquei em "Executar Testes"
- [ ] Teste de conexão WordPress: ✅ Passou
- [ ] Teste de configuração WooCommerce: ✅ Passou
- [ ] Teste de produtos: ✅ Passou
- [ ] Teste de categorias: ✅ Passou
- [ ] Teste de posts: ✅ Passou
- [ ] Teste de categorias WP: ✅ Passou

### Console do Navegador
- [ ] Abri o console (F12)
- [ ] Não há erros de CORS
- [ ] Não há erros de autenticação
- [ ] Logs mostram dados sendo carregados

---

## 📋 Fase 10: Testar Componente de Exemplo

- [ ] Importei `WordPressExample` no `App.tsx`
- [ ] Componente renderizou
- [ ] Produtos aparecem na tela
- [ ] Imagens dos produtos carregam
- [ ] Preços estão formatados corretamente
- [ ] Categorias aparecem
- [ ] Paginação funciona
- [ ] Botões "Anterior" e "Próxima" funcionam

---

## 📋 Fase 11: Validação Final

### Funcionalidades Básicas
- [ ] Listagem de produtos funciona
- [ ] Listagem de categorias funciona
- [ ] Filtro por categoria funciona
- [ ] Paginação funciona
- [ ] Loading states aparecem
- [ ] Tratamento de erros funciona

### Performance
- [ ] Produtos carregam em menos de 3 segundos
- [ ] Imagens carregam corretamente
- [ ] Não há travamentos na interface

### Dados
- [ ] Produtos têm todas as informações necessárias
- [ ] Imagens têm boa qualidade
- [ ] Preços estão corretos
- [ ] Categorias estão corretas

---

## 📋 Fase 12: Segurança

- [ ] Arquivo `.env` está no `.gitignore`
- [ ] Não commitei credenciais no Git
- [ ] Usei permissões "Somente leitura" nas chaves da API
- [ ] Em produção, usarei HTTPS
- [ ] Senhas do WordPress são fortes

---

## 📋 Fase 13: Documentação

- [ ] Li o `WORDPRESS_README.md`
- [ ] Li o `WORDPRESS_API_CONFIG.md`
- [ ] Consultei `WORDPRESS_EXAMPLES.md`
- [ ] Entendi como usar os hooks
- [ ] Entendi como usar as funções utilitárias

---

## 🎯 Resumo do Status

### ✅ Tudo Funcionando
Se você marcou TODOS os itens acima, parabéns! Sua integração está completa e funcionando perfeitamente! 🎉

### ⚠️ Alguns Problemas
Se alguns itens não foram marcados, consulte:
- `WORDPRESS_GUIA_VISUAL.md` - Guia passo a passo
- `WORDPRESS_API_CONFIG.md` - Troubleshooting detalhado

### ❌ Muitos Problemas
Se muitos itens não foram marcados, recomendo:
1. Começar do zero seguindo `WORDPRESS_GUIA_VISUAL.md`
2. Verificar cada passo cuidadosamente
3. Usar o componente `WordPressTest` para diagnóstico

---

## 📊 Estatísticas

Total de itens: **~80 checkboxes**

Itens marcados: _____ / 80

Porcentagem de conclusão: _____ %

---

## 🚀 Próximos Passos

Após completar este checklist:

1. ✅ Remova os componentes de teste do `App.tsx`
2. ✅ Comece a desenvolver sua aplicação
3. ✅ Use os hooks e utilitários fornecidos
4. ✅ Consulte `WORDPRESS_EXAMPLES.md` para referência
5. ✅ Divirta-se desenvolvendo! 🎉

---

## 💾 Salvar Progresso

**Data de conclusão**: _______________

**Notas adicionais**:
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**Desenvolvido com ❤️ para facilitar sua integração WordPress + React**
