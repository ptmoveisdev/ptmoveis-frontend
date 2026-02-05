# 🏠 PT Móveis - E-commerce de Móveis

E-commerce moderno e responsivo para venda de móveis, desenvolvido com React, TypeScript e Vite, integrado com WordPress/WooCommerce como backend headless.

---

## 🚀 Início Rápido

```bash
# Instalar dependências
yarn install

# Iniciar servidor de desenvolvimento
yarn dev

# Build para produção
yarn build

# Preview do build
yarn preview
```

O servidor estará disponível em:
- **HTTP**: `http://localhost:5173`
- **HTTPS**: `https://localhost:5173` (configurado)

---

## 📚 Documentação

Toda a documentação está organizada na pasta **[`docs/`](./docs/README.md)**:

### 📖 Guias Principais
- **[Guia Rápido](./docs/GUIA_RAPIDO.md)** - Comece aqui
- **[Integração WordPress](./docs/WORDPRESS_README.md)** - Setup WordPress/WooCommerce
- **[HTTPS no Localhost](./docs/HTTPS_LOCALHOST.md)** - Configurar HTTPS

### 🐛 Troubleshooting
- **[Erro 401 WooCommerce](./docs/PASSO_A_PASSO_ERRO_401.md)** - Solução passo a passo
- **[Solução Completa Erro 401](./docs/SOLUCAO_ERRO_401.md)** - Troubleshooting detalhado

### 📦 WordPress/WooCommerce
- **[Configuração da API](./docs/WORDPRESS_API_CONFIG.md)**
- **[Guia Visual](./docs/WORDPRESS_GUIA_VISUAL.md)**
- **[Exemplos de Código](./docs/WORDPRESS_EXAMPLES.md)**
- **[Checklist de Validação](./docs/WORDPRESS_CHECKLIST.md)**

**[📚 Ver toda a documentação →](./docs/README.md)**

---

## 🛠️ Tecnologias

- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **Radix UI** - Componentes acessíveis
- **WordPress/WooCommerce** - Backend headless CMS
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

---

## 📁 Estrutura do Projeto

```
ptmoveis-v2/
├── docs/                           # 📚 Documentação completa
├── public/                         # Arquivos públicos
├── src/
│   ├── components/                 # Componentes React
│   │   ├── ui/                    # Componentes UI base (shadcn)
│   │   ├── WordPressFeaturedProducts.tsx
│   │   ├── WordPressProducts.tsx
│   │   └── ...
│   ├── contexts/                   # Contextos React
│   ├── data/                       # Dados estáticos
│   ├── hooks/                      # React Hooks customizados
│   │   └── useWordPress.ts        # Hooks WordPress
│   ├── lib/                        # Bibliotecas e utils
│   ├── services/                   # Serviços de API
│   │   └── wordpress.ts           # Serviço WordPress/WooCommerce
│   ├── types/                      # Tipos TypeScript
│   │   └── wordpress.ts           # Tipos WordPress
│   ├── utils/                      # Funções utilitárias
│   │   └── wordpress.ts           # Utils WordPress
│   ├── App.tsx                     # Componente principal
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Estilos globais
├── .env                            # Variáveis de ambiente
├── .env.example                    # Exemplo de .env
├── vite.config.ts                  # Configuração Vite
├── tailwind.config.js              # Configuração Tailwind
├── tsconfig.json                   # Configuração TypeScript
└── package.json                    # Dependências
```

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# WordPress REST API
VITE_WORDPRESS_API_URL=http://localhost:10013/wp-json/wp/v2
VITE_WORDPRESS_BASE_URL=http://localhost:10013/

# WooCommerce REST API
VITE_WOOCOMMERCE_API_URL=http://localhost:10013/wp-json/wc/v3
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_sua_consumer_key
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_seu_consumer_secret
```

### 2. WordPress/WooCommerce

Siga o guia completo: **[docs/WORDPRESS_GUIA_VISUAL.md](./docs/WORDPRESS_GUIA_VISUAL.md)**

### 3. Testar Integração

```bash
# Testar credenciais WooCommerce
bash test-woocommerce.sh
```

---

## 🎨 Features

- ✅ Design moderno e responsivo
- ✅ Integração WordPress/WooCommerce
- ✅ Carrinho de compras funcional
- ✅ Modal de detalhes do produto
- ✅ Filtros e busca de produtos
- ✅ Paginação
- ✅ Loading states e error handling
- ✅ HTTPS configurado
- ✅ Animações suaves
- ✅ SEO otimizado
- ✅ Acessibilidade (a11y)

---

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
yarn dev                    # Inicia servidor de desenvolvimento

# Build
yarn build                  # Build para produção
yarn preview                # Preview do build

# Linting
yarn lint                   # Executa ESLint

# Testes
bash test-woocommerce.sh    # Testa credenciais WooCommerce
```

---

## 🐛 Troubleshooting

### Erro 401 - WooCommerce

Veja: **[docs/PASSO_A_PASSO_ERRO_401.md](./docs/PASSO_A_PASSO_ERRO_401.md)**

### Produtos não aparecem

1. Verifique se WordPress está rodando
2. Verifique credenciais no `.env`
3. Execute `bash test-woocommerce.sh`
4. Veja logs no console do navegador (F12)

### Erro de CORS

Instale plugin "WP REST API - Allow All CORS" no WordPress

---

## 📦 Dependências Principais

```json
{
  "react": "^19.0.0",
  "typescript": "^5.7.3",
  "vite": "^7.3.1",
  "tailwindcss": "^4.1.0",
  "@radix-ui/react-*": "^1.x",
  "react-hook-form": "^7.54.2",
  "zod": "^3.24.1"
}
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 📞 Suporte

- **Documentação**: [docs/README.md](./docs/README.md)
- **Issues**: Abra uma issue no GitHub
- **Email**: contato@ptmoveis.pt

---

## 🎯 Roadmap

- [ ] Implementar sistema de favoritos
- [ ] Adicionar comparação de produtos
- [ ] Implementar reviews de clientes
- [ ] Adicionar filtros avançados
- [ ] Implementar checkout completo
- [ ] Adicionar integração com pagamento
- [ ] Implementar painel de administração
- [ ] Adicionar PWA support

---

**Desenvolvido com ❤️ para PT Móveis**
