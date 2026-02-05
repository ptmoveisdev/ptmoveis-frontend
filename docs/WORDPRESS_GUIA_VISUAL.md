# 🎯 Guia Visual: Configuração WordPress Passo a Passo

Este guia mostra exatamente onde clicar e o que fazer no WordPress para configurar a API REST.

---

## 📋 Parte 1: Configuração Inicial do WordPress

### Passo 1: Instalar WordPress

1. **Download**
   - Acesse: https://br.wordpress.org/download/
   - Baixe a versão mais recente

2. **Instalação Local (XAMPP)**
   - Extraia na pasta: `C:\xampp\htdocs\wordpress`
   - Acesse: http://localhost/wordpress
   - Siga o instalador

3. **Criar Banco de Dados**
   - Acesse: http://localhost/phpmyadmin
   - Clique em "Novo"
   - Nome: `wordpress`
   - Clique em "Criar"

4. **Configurar WordPress**
   - Nome do banco: `wordpress`
   - Usuário: `root`
   - Senha: (deixe em branco no XAMPP)
   - Host: `localhost`

---

## 🛒 Parte 2: Instalar WooCommerce

### Passo 1: Acessar Plugins

```
Painel WordPress → Plugins → Adicionar Novo
```

### Passo 2: Buscar WooCommerce

```
Digite "WooCommerce" na caixa de busca
```

### Passo 3: Instalar

```
Clique em "Instalar Agora" no plugin WooCommerce
Aguarde a instalação
Clique em "Ativar"
```

### Passo 4: Configurar WooCommerce

O assistente de configuração será exibido:

1. **Detalhes da Loja**
   - País: Brasil
   - Endereço: (preencha)
   - Moeda: Real Brasileiro (R$)

2. **Tipo de Negócio**
   - Selecione o tipo da sua loja
   - Clique em "Continuar"

3. **Produtos**
   - Selecione o que você vai vender
   - Clique em "Continuar"

4. **Temas**
   - Escolha um tema ou pule
   - Clique em "Continuar"

5. **Finalizar**
   - Clique em "Criar produtos"

---

## 🔗 Parte 3: Configurar Permalinks (IMPORTANTE!)

### Por que é importante?
Sem permalinks amigáveis, a API REST não funcionará!

### Como configurar:

```
Painel WordPress → Configurações → Links Permanentes
```

**Selecione uma destas opções:**
- ✅ Nome do post (RECOMENDADO)
- ✅ Estrutura personalizada: `/%postname%/`

**NÃO use:**
- ❌ Simples (`?p=123`)

**Clique em:** `Salvar alterações`

---

## 🌐 Parte 4: Habilitar CORS

### Opção 1: Plugin (MAIS FÁCIL)

```
Painel WordPress → Plugins → Adicionar Novo
```

1. Busque: `WP REST API - Allow All CORS`
2. Clique em: `Instalar Agora`
3. Clique em: `Ativar`
4. Pronto! CORS habilitado ✅

### Opção 2: Código Manual

```
Painel WordPress → Aparência → Editor de Arquivos de Tema
```

⚠️ **ATENÇÃO**: Faça backup antes!

1. Selecione: `Funções do Tema (functions.php)`
2. Adicione no final do arquivo:

```php
// Habilitar CORS para WordPress REST API
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        return $value;
    });
}, 15);
```

3. Clique em: `Atualizar Arquivo`

---

## 🔑 Parte 5: Gerar Credenciais da API (CRUCIAL!)

### Passo 1: Acessar Configurações

```
Painel WordPress → WooCommerce → Configurações
```

### Passo 2: Ir para REST API

```
Clique na aba: Avançado
Clique em: REST API
```

### Passo 3: Adicionar Chave

```
Clique em: Adicionar chave
```

### Passo 4: Configurar Chave

Preencha os campos:

```
Descrição: Frontend React App
Usuário: Selecione um usuário administrador
Permissões: Somente leitura (Read)
```

### Passo 5: Gerar

```
Clique em: Gerar chave da API
```

### Passo 6: COPIAR CREDENCIAIS (IMPORTANTE!)

⚠️ **ATENÇÃO**: Você só verá isso UMA VEZ!

Você verá algo assim:

```
Consumer key:
ck_1234567890abcdef1234567890abcdef12345678

Consumer secret:
cs_1234567890abcdef1234567890abcdef12345678
```

**COPIE AMBAS** e guarde em local seguro!

---

## 📦 Parte 6: Adicionar Produtos de Teste

### Passo 1: Criar Categoria

```
Painel WordPress → Produtos → Categorias
```

1. Nome: `Eletrônicos`
2. Slug: `eletronicos`
3. Clique em: `Adicionar nova categoria`

Repita para outras categorias:
- `Móveis`
- `Decoração`
- `Iluminação`

### Passo 2: Adicionar Produto

```
Painel WordPress → Produtos → Adicionar Novo
```

1. **Nome do Produto**: `Notebook Dell Inspiron`

2. **Descrição**: 
   ```
   Notebook Dell Inspiron 15 com processador Intel Core i5,
   8GB RAM, 256GB SSD. Ideal para trabalho e estudos.
   ```

3. **Descrição Curta**:
   ```
   Notebook Dell i5, 8GB RAM, 256GB SSD
   ```

4. **Dados do Produto** (barra lateral direita):
   - Preço normal: `3500`
   - Preço promocional: `2999` (opcional)

5. **Categorias**:
   - Marque: `Eletrônicos`

6. **Imagem do Produto**:
   - Clique em: `Definir imagem do produto`
   - Faça upload de uma imagem
   - Clique em: `Definir imagem do produto`

7. **Galeria do Produto**:
   - Clique em: `Adicionar imagens à galeria`
   - Selecione 3-5 imagens
   - Clique em: `Adicionar à galeria`

8. **Estoque**:
   - Gerenciar estoque: ✅ Marque
   - Quantidade em estoque: `10`

9. **Publicar**:
   - Clique em: `Publicar`

### Passo 3: Adicionar Mais Produtos

Repita o processo acima para criar pelo menos 5-10 produtos de teste.

---

## ✅ Parte 7: Testar a API

### Teste 1: API do WordPress

Abra no navegador:

```
http://localhost/wordpress/wp-json/wp/v2/posts
```

**Resultado esperado**: JSON com lista de posts

### Teste 2: API do WooCommerce

Abra no navegador (substitua XXX e YYY pelas suas credenciais):

```
http://localhost/wordpress/wp-json/wc/v3/products?consumer_key=ck_XXX&consumer_secret=cs_YYY
```

**Resultado esperado**: JSON com lista de produtos

### Teste 3: Categorias

```
http://localhost/wordpress/wp-json/wc/v3/products/categories?consumer_key=ck_XXX&consumer_secret=cs_YYY
```

**Resultado esperado**: JSON com lista de categorias

---

## ⚙️ Parte 8: Configurar Frontend

### Passo 1: Abrir Projeto

```bash
cd /home/dev/projetos/VVprojetos/ptmoveis-v2
```

### Passo 2: Editar .env

Abra o arquivo `.env` e configure:

```env
VITE_WORDPRESS_API_URL=http://localhost/wordpress/wp-json/wp/v2
VITE_WORDPRESS_BASE_URL=http://localhost/wordpress
VITE_WOOCOMMERCE_API_URL=http://localhost/wordpress/wp-json/wc/v3
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_sua_consumer_key_aqui
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_sua_consumer_secret_aqui
```

**Substitua**:
- `ck_sua_consumer_key_aqui` → Sua Consumer Key
- `cs_sua_consumer_secret_aqui` → Sua Consumer Secret

### Passo 3: Iniciar Servidor

```bash
npm run dev
```

### Passo 4: Testar no Frontend

Edite `src/App.tsx`:

```tsx
import WordPressTest from './components/WordPressTest';

function App() {
  return <WordPressTest />;
}

export default App;
```

### Passo 5: Executar Testes

1. Abra: http://localhost:5173
2. Clique em: `Executar Testes`
3. Verifique se todos os testes passam ✅

---

## 🎯 Checklist Final

Marque cada item conforme completa:

### WordPress
- [ ] WordPress instalado e rodando
- [ ] Acesso ao painel administrativo funcionando
- [ ] Banco de dados criado e conectado

### WooCommerce
- [ ] Plugin WooCommerce instalado
- [ ] Plugin WooCommerce ativado
- [ ] Configuração inicial concluída
- [ ] Pelo menos 5 produtos criados
- [ ] Produtos têm imagens
- [ ] Categorias criadas

### Configuração da API
- [ ] Permalinks configurados (Nome do post)
- [ ] CORS habilitado (plugin ou código)
- [ ] Credenciais da API geradas
- [ ] Consumer Key copiada
- [ ] Consumer Secret copiada

### Testes
- [ ] Endpoint `/wp-json/wp/v2/posts` funcionando
- [ ] Endpoint `/wp-json/wc/v3/products` funcionando
- [ ] Endpoint `/wp-json/wc/v3/products/categories` funcionando

### Frontend
- [ ] Arquivo `.env` configurado
- [ ] Consumer Key adicionada ao `.env`
- [ ] Consumer Secret adicionada ao `.env`
- [ ] Servidor de desenvolvimento rodando
- [ ] Componente WordPressTest funcionando
- [ ] Todos os testes passando ✅

---

## 🚨 Problemas Comuns e Soluções

### ❌ "404 Not Found" ao acessar API

**Causa**: Permalinks não configurados

**Solução**:
1. Vá em: `Configurações → Links Permanentes`
2. Selecione: `Nome do post`
3. Clique em: `Salvar alterações`
4. Tente novamente

### ❌ "CORS policy" error no console

**Causa**: CORS não habilitado

**Solução**:
1. Instale plugin: `WP REST API - Allow All CORS`
2. Ative o plugin
3. Limpe cache do navegador
4. Tente novamente

### ❌ "Consumer key is invalid"

**Causa**: Credenciais incorretas ou não configuradas

**Solução**:
1. Verifique se copiou Consumer Key E Secret
2. Verifique se colou corretamente no `.env`
3. Verifique se não há espaços extras
4. Gere novas credenciais se necessário
5. Reinicie o servidor: `npm run dev`

### ❌ Produtos não aparecem

**Causa**: Produtos não publicados ou sem categoria

**Solução**:
1. Vá em: `Produtos → Todos os produtos`
2. Verifique se status é: `Publicado`
3. Edite o produto
4. Adicione uma categoria
5. Clique em: `Atualizar`

### ❌ Imagens não carregam

**Causa**: Imagens não adicionadas ou permissões incorretas

**Solução**:
1. Edite o produto
2. Adicione imagem do produto
3. Adicione galeria de imagens
4. Verifique permissões da pasta `wp-content/uploads`
5. Clique em: `Atualizar`

---

## 📞 Onde Buscar Ajuda

### Documentação
- `WORDPRESS_README.md` - Guia rápido
- `WORDPRESS_API_CONFIG.md` - Configuração detalhada
- `WORDPRESS_EXAMPLES.md` - Exemplos de código
- `WORDPRESS_SETUP_COMPLETO.md` - Resumo completo

### Ferramentas de Teste
- Componente `WordPressTest.tsx` - Teste automático
- Console do navegador - Logs detalhados
- Postman - Testar endpoints manualmente

### Recursos Online
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [WooCommerce REST API Docs](https://woocommerce.github.io/woocommerce-rest-api-docs/)

---

## 🎉 Parabéns!

Se você completou todos os passos, sua integração WordPress está funcionando! 🚀

**Próximo passo**: Comece a desenvolver sua aplicação usando os hooks e componentes criados!

---

**Desenvolvido com ❤️ para facilitar sua vida**
