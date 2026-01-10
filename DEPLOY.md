# 🚀 Deploy Gratuito - Bot Agendamento Salão

## Opção 1: Railway.app (Recomendado) ⭐

Railway oferece $5 de crédito gratuito por mês, suficiente para manter o bot rodando 24/7.

### Passo a Passo:

#### 1. Criar Conta no Railway
- Acesse: https://railway.app
- Clique em "Start a New Project"
- Faça login com GitHub

#### 2. Preparar o Repositório Git
No terminal do VS Code, execute:

```bash
# Inicializar git (se ainda não tiver)
git init

# Adicionar todos os arquivos
git add .

# Criar commit inicial
git commit -m "Configuração inicial do bot"

# Criar repositório no GitHub e conectar
# (ou use a interface do GitHub Desktop)
```

#### 3. Deploy no Railway

**Opção A - Via GitHub:**
1. No Railway, clique em "New Project" → "Deploy from GitHub repo"
2. Selecione o repositório do bot
3. Railway detectará automaticamente o projeto Node.js
4. Aguarde o deploy (2-3 minutos)

**Opção B - Via Railway CLI:**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Fazer login
railway login

# Iniciar projeto
railway init

# Deploy
railway up
```

#### 4. Configurar Variáveis de Ambiente (Opcional)
No painel do Railway:
- Settings → Variables
- Adicione se necessário: `NODE_ENV=production`

#### 5. Obter URL do Painel
- Após deploy, Railway fornecerá uma URL (ex: `https://seu-bot.up.railway.app`)
- Acesse esta URL para ver o painel administrativo

### ⚠️ Importante - Persistência de Dados

Railway pode resetar arquivos a cada deploy. Para evitar perder dados:

1. **Usar Volume Persistente:**
   - No Railway: Settings → Volumes → Add Volume
   - Mount Path: `/app/auth` (para sessões WhatsApp)
   - Mount Path: `/app/clientes.json` (para dados)

2. **Ou Usar Banco de Dados:**
   - Railway oferece PostgreSQL gratuito
   - Precisaria migrar de `clientes.json` para PostgreSQL

### 🔄 Manter Bot Ativo

Railway não coloca aplicações para dormir no plano gratuito (dentro do crédito de $5).

---

## Opção 2: Render.com

Render tem plano gratuito mas com limitações (dorme após 15 min de inatividade).

### Passos:

1. **Criar Conta:** https://render.com
2. **New → Web Service**
3. **Conectar repositório GitHub**
4. **Configurações:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

⚠️ **Limitação:** No plano gratuito, o serviço dorme após 15 minutos sem requisições, demorando ~30s para acordar.

---

## Opção 3: Glitch.com

Boa para testes rápidos, mas menos estável para produção.

### Passos:

1. Acesse: https://glitch.com
2. **New Project → Import from GitHub**
3. Cole a URL do repositório
4. Glitch fará deploy automaticamente

⚠️ **Limitação:** Projeto pode dormir após inatividade e tem limites de recursos.

---

## Opção 4: Fly.io

Plano gratuito com boas especificações.

### Passos:

```bash
# Instalar Fly CLI
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Fazer login
fly auth login

# Criar aplicação
fly launch

# Deploy
fly deploy
```

---

## 📱 Primeiro Acesso - Autenticação WhatsApp

Após o deploy:

1. Acesse os **logs da aplicação** no painel do serviço escolhido
2. Procure pelo **QR Code** gerado no terminal
3. Escaneie com WhatsApp: Dispositivos Conectados → Conectar um Dispositivo
4. Após conectar, a sessão será salva em `auth/`

**Dica:** No Railway, vá em "Deployments" → clique no deploy ativo → "View Logs"

---

## ✅ Verificação

Depois do deploy:

1. **Painel Web:** Acesse a URL fornecida (ex: `https://seu-bot.up.railway.app`)
2. **Bot WhatsApp:** Envie mensagem de teste após escanear QR Code
3. **Sincronização:** Verifique se agendamentos aparecem em tempo real no painel

---

## 🆘 Solução de Problemas

### Bot não conecta ao WhatsApp
- Verifique os logs
- Se necessário, delete pasta `auth/` e reconecte

### Painel não carrega
- Verifique se a porta está configurada corretamente (`process.env.PORT`)
- Confirme que o serviço está rodando nos logs

### Dados são perdidos após deploy
- Configure volume persistente ou migre para banco de dados

### Excedeu créditos gratuitos Railway
- Monitore uso em Settings → Usage
- $5/mês geralmente é suficiente para este bot
- Se necessário, considere Render ou Fly.io

---

## 💡 Recomendação Final

**Railway.app** é a melhor opção gratuita para este bot porque:
- ✅ $5 crédito mensal (suficiente para 24/7)
- ✅ Não dorme automaticamente
- ✅ Suporta volumes persistentes
- ✅ Deploy fácil via GitHub
- ✅ Logs acessíveis
- ✅ Bom desempenho

**Custo estimado:** $0 a $3/mês (dentro do crédito gratuito)
