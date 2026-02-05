# 🔒 HTTPS no Localhost - Configurado!

## ✅ O que foi feito

1. **Instalado o plugin `@vitejs/plugin-basic-ssl`**
   - Gera certificados SSL auto-assinados automaticamente
   - Configuração zero, funciona out-of-the-box

2. **Atualizado `vite.config.ts`**
   - Adicionado plugin `basicSsl()` aos plugins do Vite
   - HTTPS será habilitado automaticamente

---

## 🚀 Como usar

### Iniciar o servidor com HTTPS:

```bash
yarn dev
```

O servidor iniciará em:
```
https://localhost:5173
```

---

## ⚠️ Aviso de Segurança do Navegador

Na primeira vez que acessar, você verá um aviso de segurança:

```
"Sua conexão não é particular"
"NET::ERR_CERT_AUTHORITY_INVALID"
```

**Isso é NORMAL!** O certificado é auto-assinado.

### Como proceder:

#### Chrome/Edge:
1. Clique em **"Avançado"**
2. Clique em **"Ir para localhost (não seguro)"**

#### Firefox:
1. Clique em **"Avançado"**
2. Clique em **"Aceitar o risco e continuar"**

#### Safari:
1. Clique em **"Mostrar detalhes"**
2. Clique em **"visitar este site"**

---

## 🔍 Verificar se HTTPS está funcionando

Após aceitar o certificado, você deve ver:

- ✅ URL: `https://localhost:5173`
- ✅ Ícone de cadeado (com aviso de "não seguro")
- ✅ Aplicação funcionando normalmente

---

## 🌐 Atualizar URLs do WordPress

Se o WordPress também estiver em HTTPS, atualize o `.env`:

```env
# Se WordPress estiver em HTTPS
VITE_WORDPRESS_API_URL=https://localhost:10013/wp-json/wp/v2
VITE_WORDPRESS_BASE_URL=https://localhost:10013/
VITE_WOOCOMMERCE_API_URL=https://localhost:10013/wp-json/wc/v3
```

Se WordPress estiver em HTTP, mantenha como está:

```env
# WordPress em HTTP (atual)
VITE_WORDPRESS_API_URL=http://localhost:10013/wp-json/wp/v2
VITE_WORDPRESS_BASE_URL=http://localhost:10013/
VITE_WOOCOMMERCE_API_URL=http://localhost:10013/wp-json/wc/v3
```

**Nota**: Requisições HTTPS → HTTP podem ter problemas de CORS. Recomendo manter ambos em HTTP para desenvolvimento local.

---

## 🔧 Voltar para HTTP (se necessário)

Se quiser voltar para HTTP:

1. Abra `vite.config.ts`
2. Remova a linha: `import basicSsl from '@vitejs/plugin-basic-ssl'`
3. Remova `basicSsl()` dos plugins:
   ```typescript
   plugins: [inspectAttr(), react()], // Sem basicSsl()
   ```
4. Reinicie o servidor

---

## 📝 Comandos Úteis

```bash
# Iniciar servidor HTTPS
yarn dev

# Build para produção
yarn build

# Preview do build
yarn preview
```

---

## 🎯 Por que usar HTTPS no desenvolvimento?

1. **Testar recursos que exigem HTTPS:**
   - Service Workers
   - PWA (Progressive Web Apps)
   - Geolocalização
   - Camera/Microphone
   - Clipboard API
   - Web Bluetooth

2. **Ambiente mais próximo da produção**

3. **Evitar problemas de mixed content**

---

## ⚙️ Configuração Avançada (Opcional)

Se quiser usar certificados personalizados:

```typescript
// vite.config.ts
import fs from 'fs'

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('path/to/key.pem'),
      cert: fs.readFileSync('path/to/cert.pem'),
    },
  },
})
```

---

## 🐛 Problemas Comuns

### "ERR_SSL_PROTOCOL_ERROR"

**Solução:**
- Limpe o cache do navegador
- Reinicie o servidor
- Tente em modo anônimo

### "Porta já em uso"

**Solução:**
```bash
# Mate processos na porta 5173
lsof -ti:5173 | xargs kill -9

# Ou use outra porta
# vite.config.ts
server: {
  port: 3000,
}
```

### "Certificado expirado"

**Solução:**
- Delete a pasta `.vite` no projeto
- Reinicie o servidor (novo certificado será gerado)

---

## ✅ Checklist

- [x] Plugin `@vitejs/plugin-basic-ssl` instalado
- [x] `vite.config.ts` atualizado
- [ ] Servidor iniciado com `yarn dev`
- [ ] Navegador aberto em `https://localhost:5173`
- [ ] Aviso de segurança aceito
- [ ] Aplicação funcionando

---

**Tudo pronto! Agora você tem HTTPS no localhost! 🔒**
