# 🔧 PASSO A PASSO: Corrigir Erro 401

## ❌ Erro Atual

```
woocommerce_rest_cannot_view
Sem permissão para listar recursos.
Status: 401
```

---

## ✅ SOLUÇÃO (3 minutos)

### Passo 1: Acessar WordPress Admin

Abra uma nova aba no navegador:

```
http://localhost:10013/wp-admin
```

Faça login com suas credenciais de administrador.

---

### Passo 2: Navegar até REST API

No menu lateral esquerdo:

```
WooCommerce → Configurações → Avançado → REST API
```

---

### Passo 3: Deletar Chave Antiga

Se houver uma chave existente:
1. Clique no ícone de **lixeira** ou **revogar**
2. Confirme a exclusão

---

### Passo 4: Criar Nova Chave

1. Clique no botão **"Adicionar chave"**

2. Preencha o formulário:

   **Descrição:**
   ```
   Frontend React App
   ```

   **Usuário:**
   - Selecione um usuário com perfil **ADMINISTRADOR**
   - ⚠️ Não selecione usuários com perfis inferiores

   **Permissões:**
   - ⚠️ Selecione: **Leitura/Gravação** (Read/Write)
   - ❌ NÃO selecione: "Somente leitura" (Read only)

3. Clique em **"Gerar chave da API"**

---

### Passo 5: Copiar Credenciais

Você verá uma tela com:

```
Consumer key:
ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

Consumer secret:
cs_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

⚠️ **IMPORTANTE**: 
- Você só verá isso **UMA VEZ**!
- Copie **AMBAS** as chaves agora
- Não feche a página até copiar

---

### Passo 6: Atualizar .env

1. Abra o arquivo `.env` no seu editor

2. Localize estas linhas:
   ```env
   VITE_WOOCOMMERCE_CONSUMER_KEY=ck_35f033d9b19ece373958bc4473517a74bb2e1418
   VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_a32050c585299c4b8a25f69df951410adcdc85d2
   ```

3. Substitua pelos novos valores:
   ```env
   VITE_WOOCOMMERCE_CONSUMER_KEY=ck_SUA_NOVA_KEY_AQUI
   VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_SEU_NOVO_SECRET_AQUI
   ```

4. **Salve o arquivo** (Ctrl+S)

---

### Passo 7: Testar Credenciais (Opcional)

No terminal, execute:

```bash
bash scripts/test-woocommerce.sh
```

Você verá:
- ✅ **"SUCESSO! Credenciais funcionando"** - Prossiga para o Passo 8
- ❌ **"ERRO 401"** - Refaça os passos 4-6

---

### Passo 8: Reiniciar Servidor

No terminal onde o servidor está rodando:

1. Pressione **Ctrl+C** para parar
2. Execute novamente:
   ```bash
   yarn dev
   ```

---

### Passo 9: Recarregar Página

No navegador:

1. Pressione **F5** ou **Ctrl+R**
2. Aguarde alguns segundos

---

### Passo 10: Verificar Console

Abra o Console do navegador (F12) e procure por:

✅ **Mensagens de sucesso:**
```
✅ Resposta WooCommerce: 10 itens
✅ Produtos em destaque carregados: 10
```

❌ **Se ainda houver erro 401:**
- Verifique se copiou as credenciais corretamente (sem espaços extras)
- Verifique se selecionou "Leitura/Gravação" (não "Somente leitura")
- Verifique se o usuário é ADMINISTRADOR
- Tente gerar novas credenciais novamente

---

## 🎯 Checklist

Marque cada item conforme completa:

- [ ] Acessei http://localhost:10013/wp-admin
- [ ] Naveguei até WooCommerce → Configurações → Avançado → REST API
- [ ] Deletei a chave antiga (se existia)
- [ ] Criei nova chave
- [ ] Selecionei usuário ADMINISTRADOR
- [ ] Selecionei permissões "Leitura/Gravação" (Read/Write)
- [ ] Copiei Consumer Key
- [ ] Copiei Consumer Secret
- [ ] Atualizei arquivo .env
- [ ] Salvei o arquivo .env
- [ ] Testei com scripts/test-woocommerce.sh (opcional)
- [ ] Reiniciei o servidor (Ctrl+C + yarn dev)
- [ ] Recarreguei a página (F5)
- [ ] Verifiquei o console (F12)
- [ ] Produtos aparecem na página ✅

---

## 🐛 Troubleshooting

### "Não consigo acessar wp-admin"

**Verifique:**
- WordPress está rodando em http://localhost:10013
- XAMPP/servidor está ligado
- MySQL está rodando

### "Não vejo a opção REST API"

**Solução:**
- Certifique-se de que WooCommerce está instalado e ativado
- Vá em: Plugins → Plugins instalados
- Verifique se "WooCommerce" está ativo

### "Erro persiste após seguir todos os passos"

**Tente:**
1. Gerar novas credenciais novamente
2. Copiar manualmente (sem Ctrl+C/V) para evitar caracteres invisíveis
3. Verificar se não há espaços no início ou fim das chaves
4. Usar um usuário diferente (outro admin)

---

## 📞 Ainda com Problemas?

Se após seguir TODOS os passos ainda houver erro:

1. **Capture um screenshot** da tela de criação de chave
2. **Copie o conteúdo** do arquivo .env (sem as credenciais)
3. **Copie o erro** do console do navegador

---

**Boa sorte! Após seguir estes passos, tudo funcionará! 🚀**
