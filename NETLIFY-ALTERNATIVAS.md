# ⚠️ Netlify não é adequado para este projeto

O **Netlify** é uma excelente plataforma, mas é otimizada para **sites estáticos e serverless functions**, não para aplicações que precisam rodar continuamente como este bot.

## Por que Netlify não funciona aqui:

❌ **Bot WhatsApp precisa estar sempre rodando** - Netlify não suporta processos persistentes
❌ **Conexão WebSocket precisa ser mantida** - Netlify Functions têm timeout de 10 segundos
❌ **Sessão do WhatsApp requer processo contínuo** - Netlify não mantém estado entre requisições
❌ **Express server precisa estar ativo 24/7** - Netlify é para sites estáticos ou APIs serverless

## ✅ Alternativas Gratuitas Recomendadas

### 1. **Render.com** (Mais fácil, 100% gratuito)

**Vantagens:**
- ✅ Totalmente gratuito (não precisa cartão)
- ✅ Deploy direto do GitHub
- ✅ Suporta aplicações Node.js persistentes
- ✅ HTTPS automático
- ✅ Interface muito simples

**Limitação:** Dorme após 15 min sem uso (acorda em ~30s quando receber mensagem)

#### Passos:

1. **Criar conta:** https://render.com

2. **Criar repositório Git:**
```bash
git init
git add .
git commit -m "Bot de agendamento"
```

3. **Subir para GitHub** (criar repositório em https://github.com/new)

4. **No Render:**
   - Clique "New +" → "Web Service"
   - Connect GitHub repository
   - Configurações:
     - **Name:** bot-salao-amanda
     - **Runtime:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free
   - Clique "Create Web Service"

5. **Após deploy:**
   - Vá em "Logs" e copie o QR Code
   - Escaneie com WhatsApp
   - Acesse a URL fornecida para ver o painel

---

### 2. **Fly.io** (Sempre ativo, gratuito)

**Vantagens:**
- ✅ Gratuito sem limites de "sono"
- ✅ Melhor performance
- ✅ Aplicação fica ativa 24/7

**Desvantagem:** Requer CLI e é um pouco mais técnico

#### Passos:

```bash
# Instalar Fly CLI
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Fechar e reabrir terminal

# Login
fly auth login

# Criar app
fly launch

# Seguir o assistente:
# - App name: bot-salao-amanda
# - Region: São Paulo (gru)
# - PostgreSQL: No
# - Redis: No

# Deploy
fly deploy
```

---

### 3. **Railway.app** (Melhor opção, $5 crédito gratuito)

Conforme já configurado - veja [DEPLOY.md](DEPLOY.md)

---

### 4. **Glitch.com** (Mais rápido para testar)

**Vantagens:**
- ✅ Zero configuração
- ✅ Editor online
- ✅ Deploy instantâneo

**Desvantagem:** Menos estável para produção

1. Acesse: https://glitch.com
2. "New Project" → "Import from GitHub"
3. Cole URL do repositório
4. Pronto!

---

## 🎯 Minha Recomendação

Para o seu caso, sugiro **Render.com** porque:

1. **100% gratuito** (não precisa cadastrar cartão)
2. **Interface mais simples** que Railway
3. **Deploy fácil** via GitHub
4. **Adequado para bots** que não precisam resposta instantânea

A única desvantagem é que o bot "dorme" após 15 minutos sem uso, mas **acorda automaticamente** quando recebe uma mensagem (demora ~30 segundos).

Se precisa que o bot responda **instantaneamente 24/7**, use **Fly.io** ou **Railway.app**.

---

## Configuração já está pronta!

O código já foi ajustado para funcionar em qualquer uma dessas plataformas:
- ✅ Porta dinâmica (`process.env.PORT`)
- ✅ Script de start correto
- ✅ Dependencies no package.json
- ✅ .gitignore configurado

Escolha a plataforma e siga os passos acima! 🚀
