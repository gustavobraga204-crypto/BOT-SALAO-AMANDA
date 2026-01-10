# 🐘 Configurar PostgreSQL no Render

## Problema: Dados são perdidos a cada deploy
O Render gratuito não persiste arquivos. Solução: usar PostgreSQL gratuito.

---

## 🚀 Passo a Passo

### 1️⃣ Criar PostgreSQL no Render

1. Acesse: https://render.com/dashboard
2. Clique **"New +" → "PostgreSQL"**
3. Configure:
   - **Name:** `bot-salao-db`
   - **Database:** `bot_salao`
   - **User:** (gerado automaticamente)
   - **Region:** Oregon (mesma do app)
   - **Plan:** **Free**
4. Clique **"Create Database"**
5. Aguarde 1-2 minutos

### 2️⃣ Conectar ao Web Service

1. Vá para o seu Web Service (bot-salao-amanda)
2. Clique em **"Environment"** (menu lateral)
3. Clique **"Add Environment Variable"**
4. Adicione:
   - **Key:** `DATABASE_URL`
   - **Value:** *(copie a "Internal Database URL" do PostgreSQL)*
   
   **Como copiar a URL:**
   - Vá no PostgreSQL que você criou
   - Na aba "Info", copie **"Internal Database URL"**
   - Cole como valor da variável `DATABASE_URL`

5. Clique **"Save Changes"**

### 3️⃣ Fazer Redeploy

1. Vá em **"Manual Deploy"**
2. Clique **"Deploy latest commit"**
3. Aguarde 2-3 minutos

---

## ✅ Pronto!

Agora os dados são salvos no PostgreSQL e **persistem entre deploys**!

### Como funciona:

- **Local (seu PC):** Usa `clientes.json` (fácil para desenvolvimento)
- **Render (produção):** Usa PostgreSQL automaticamente

### Verificar se está funcionando:

Vá nos logs do Render, deve aparecer:
```
🐘 Usando PostgreSQL
✅ PostgreSQL inicializado
```

---

## 🔄 Migrar dados existentes (opcional)

Se você tem dados no `clientes.json` local que quer levar para produção:

1. Faça os agendamentos manualmente pelo painel web
2. Ou use um script de migração (mais complexo)

---

## 💡 Vantagens:

✅ Dados não são perdidos mais
✅ Suporta múltiplas instâncias
✅ Backup automático
✅ Melhor performance
✅ Preparado para crescer

---

## 🆘 Problemas?

### "Cannot connect to database"
- Verifique se copiou a **Internal Database URL**
- Verifique se a variável `DATABASE_URL` foi salva
- Faça redeploy após adicionar a variável

### "Dados ainda são perdidos"
- Confirme que `DATABASE_URL` está configurada
- Verifique os logs: deve aparecer "🐘 Usando PostgreSQL"

### "Agendamentos não aparecem"
- O sistema migrou! Antigos dados em JSON não aparecem
- Faça novos agendamentos pelo bot ou painel
