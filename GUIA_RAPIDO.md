# 🚀 Guia Rápido - Novos Recursos

## 🛒 Fluxo do Carrinho de Compras

### 1. Adicionar ao Carrinho
- Clique no botão **"ADICIONAR AO CARRINHO"** em qualquer card de produto
- O badge do carrinho no header anima mostrando o novo total
- Feedback visual: botão anima com efeito "pop"

### 2. Ver Carrinho
- Clique no ícone do carrinho 🛒 no header
- Sidebar desliza da direita com todos os produtos
- Veja miniaturas, nomes, preços e quantidades

### 3. Gerenciar Itens
- **Aumentar quantidade**: Botão `+`
- **Diminuir quantidade**: Botão `-`
- **Remover item**: Ícone da lixeira 🗑️
- Total atualiza automaticamente

### 4. Finalizar
- Clique em **"FINALIZAR COMPRA"** (botão dourado)
- Ou continue comprando clicando em "Continuar Comprando"

---

## 👁️ Visualizar Detalhes do Produto

### Opção 1: Clique no Card
- Clique em qualquer parte do card do produto
- Modal abre com todos os detalhes

### Opção 2: Botão Quick View
- Passe o mouse sobre o card
- Clique no ícone do olho 👁️ que aparece
- Modal abre instantaneamente

### No Modal:
- **Galeria**: Clique nas miniaturas para trocar a imagem principal
- **Favoritar**: Clique no coração ❤️
- **Quantidade**: Use os botões +/- para selecionar
- **Adicionar**: Botão dourado "ADICIONAR AO CARRINHO"
- **Fechar**: Clique no X ou fora do modal

---

## 🎨 Novos Recursos Visuais

### Cards de Produtos
- **Hover**: Passa o mouse para ver efeitos
  - Imagem dá zoom
  - Card levanta com sombra
  - Botões de ação aparecem
  - Avaliação aparece

### Animações
- **Entrada**: Cards aparecem com animação de revelação
- **Badges**: Deslizam da esquerda com rotação
- **Preços**: Linha dourada anima ao passar o mouse
- **Botões**: Efeito shimmer ao passar o mouse

### Layout Assimétrico
- Alguns cards ficam mais altos
- Outros mais baixos
- Cria ritmo visual interessante

---

## 📱 Responsividade

### Mobile (Celular)
- 1 produto por linha
- Sidebar ocupa tela inteira
- Modal ocupa tela inteira

### Tablet
- 2 produtos por linha
- Sidebar 480px de largura
- Modal com margens

### Desktop
- 3 produtos por linha
- Layout assimétrico ativo
- Todas as animações ativas

---

## 🎯 Atalhos Úteis

### Teclado
- `ESC` - Fecha modal ou sidebar
- `Tab` - Navega entre elementos
- `Enter` - Ativa botões focados

### Mouse
- **Clique no card** → Abre detalhes
- **Clique no carrinho** → Abre sidebar
- **Clique fora** → Fecha modal/sidebar
- **Hover no card** → Mostra ações rápidas

---

## 🔧 Para Desenvolvedores

### Adicionar Novo Produto
Edite `src/data/products.ts`:

```typescript
{
  id: '10',
  name: 'Novo Produto',
  slug: 'novo-produto',
  price: 299.00,
  oldPrice: 399.00,
  image: '/novo-produto.jpg',
  images: ['/novo-produto.jpg', '/novo-produto-2.jpg'],
  badge: 'NOVO',
  badgeColor: 'bg-[#D4AF37]',
  category: 'Sofás',
  description: 'Descrição detalhada...',
  features: [
    'Característica 1',
    'Característica 2',
  ],
  specifications: [
    { label: 'Dimensões', value: '200x100cm' },
    { label: 'Material', value: 'Tecido premium' },
  ],
  inStock: true,
  rating: 4.8,
  reviewCount: 50
}
```

### Usar o Carrinho em Outro Componente
```typescript
import { useCart } from '@/contexts/CartContext';

function MeuComponente() {
  const { 
    items,           // Array de produtos
    totalItems,      // Total de itens
    totalPrice,      // Preço total
    addToCart,       // Função para adicionar
    removeFromCart,  // Função para remover
    updateQuantity,  // Função para atualizar
    clearCart        // Função para limpar
  } = useCart();
  
  // Use conforme necessário
}
```

### Customizar Cores
Edite `src/index.css`:

```css
:root {
  --pt-gold: 45 65% 52%;      /* Dourado */
  --pt-blue: 213 52% 24%;     /* Azul */
  /* Altere os valores HSL */
}
```

---

## ⚡ Performance

### Otimizações Ativas
- ✅ Imagens com lazy loading
- ✅ Animações CSS puras (sem JavaScript)
- ✅ Debounce em eventos de scroll
- ✅ Re-renders otimizados com React hooks

### Acessibilidade
- ✅ Navegação por teclado
- ✅ Labels ARIA
- ✅ Contraste de cores adequado
- ✅ Suporte a leitores de tela
- ✅ Modo de movimento reduzido

---

## 🐛 Troubleshooting

### Carrinho não atualiza?
- Verifique se o `CartProvider` está envolvendo o `App` em `main.tsx`
- Confira o console do navegador por erros

### Imagens não aparecem?
- Certifique-se que as imagens estão em `/public`
- Verifique os nomes dos arquivos em `products.ts`

### Animações não funcionam?
- Verifique se o CSS foi compilado corretamente
- Confira se não há erros no console
- Teste em outro navegador

### Modal não abre?
- Verifique se o produto tem todos os campos obrigatórios
- Confira se `onViewDetails` está sendo passado para `ProductCard`

---

## 📚 Arquivos Importantes

```
src/
├── components/
│   ├── ProductCard.tsx          # Card de produto
│   ├── CartSidebar.tsx          # Sidebar do carrinho
│   └── ProductDetailModal.tsx   # Modal de detalhes
├── contexts/
│   └── CartContext.tsx          # Gerenciamento do carrinho
├── data/
│   └── products.ts              # Dados dos produtos
├── index.css                    # Estilos e animações
├── App.tsx                      # Aplicação principal
└── main.tsx                     # Entry point
```

---

## 🎉 Próximos Passos Sugeridos

1. **Adicionar mais produtos** em `products.ts`
2. **Adicionar imagens reais** na pasta `/public`
3. **Implementar busca** de produtos
4. **Adicionar filtros** por categoria/preço
5. **Persistir carrinho** com localStorage
6. **Implementar checkout** completo
7. **Adicionar reviews** de usuários

---

## 💡 Dicas

- **Teste em diferentes dispositivos** para ver a responsividade
- **Experimente as animações** passando o mouse sobre os elementos
- **Adicione produtos ao carrinho** para ver o fluxo completo
- **Abra o modal** para ver todos os detalhes
- **Customize as cores** para combinar com sua marca

---

**Desenvolvido com ❤️ seguindo as melhores práticas de design e desenvolvimento**
