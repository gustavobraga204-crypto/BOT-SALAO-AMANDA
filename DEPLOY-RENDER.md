# 🚀 Deploy no Render.com - Guia Rápido

## ✅ Por que Render.com?

- ✅ **100% Gratuito** (não precisa cartão)
- ✅ **Deploy fácil** via GitHub
- ✅ **Interface simples**
- ✅ **HTTPS automático**

**Única limitação:** Aplicação "dorme" após 15 minutos sem uso (acorda em ~30s quando recebe mensagem)

---

## 📋 Passo a Passo Completo

### 1️⃣ Criar Repositório no GitHub

#### Opção A - Via GitHub Desktop (Mais Fácil)
1. Baixe GitHub Desktop: https://desktop.github.com/
2. Abra GitHub Desktop
3. File → Add Local Repository → Selecione esta pasta
4. Clique em "Publish repository"
5. Nome: `bot-salao-amanda`
6. Desmarque "Keep this code private" (ou deixe marcado se quiser privado)
7. Clique "Publish repository"

#### Opção B - Via Terminal
```powershell
# Inicializar git
git init

# Adicionar arquivos
git add .

# Criar commit
git commit -m "Configuração inicial do bot"

# Criar repositório no GitHub via navegador:
# https://github.com/new
# Nome: bot-salao-amanda

# Conectar ao repositório (substitua seu-usuario)
git remote add origin https://github.com/seu-usuario/bot-salao-amanda.git

# Enviar código
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy no Render

1. **Criar conta:** https://render.com
   - Clique "Get Started for Free"
   - Use sua conta do GitHub para login

2. **Criar Web Service:**
   - No dashboard, clique "New +" → "Web Service"
   - Clique "Connect GitHub Account" se necessário
   - Selecione o repositório `bot-salao-amanda`
   - Clique "Connect"

3. **Configurar Service:**
   - **Name:** `bot-salao-amanda`
   - **Region:** Oregon (US West)
   - **Branch:** main
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
   
4. **Criar Web Service:**
   - Clique "Create Web Service"
   - Aguarde 2-3 minutos para o deploy

### 3️⃣ Conectar WhatsApp

1. **Ver logs:**
   - No Render dashboard, clique no serviço
   - Vá na aba "Logs"

2. **Procure o QR Code** nos logs

3. **Escaneie com WhatsApp:**
   - WhatsApp → Configurações → Dispositivos Conectados
   - Conectar um Dispositivo
   - Escaneie o QR Code

### 4️⃣ Acessar Painel

No Render dashboard, você verá a URL do seu serviço:
- Ex: `https://bot-salao-amanda.onrender.com`

Acesse essa URL para ver o painel administrativo!

---

## 🔧 Comandos Úteis

### Atualizar código após mudanças

```powershell
# Adicionar mudanças
git add .

# Commit
git commit -m "Atualização do bot"

# Enviar
git push
```

Render fará **deploy automático** após o push!

---

## ⚠️ Importante - Aplicação "Dorme"

No plano gratuito, o Render coloca a aplicação para dormir após **15 minutos de inatividade**.

**O que isso significa:**
- ✅ Bot continua funcionando normalmente quando ativo
- ⏰ Após 15 min sem mensagens, dorme
- 🔄 Quando recebe mensagem, acorda em ~30 segundos
- ✅ Primeira mensagem pode demorar, próximas são instantâneas

**Como manter sempre ativo (opcional):**

Use um serviço de "ping" como UptimeRobot:
1. Acesse: https://uptimerobot.com (gratuito)
2. Crie monitor HTTP(s)
3. URL: `https://bot-salao-amanda.onrender.com`
4. Intervalo: 14 minutos

Isso "acorda" o bot antes dele dormir completamente.

---

## 📊 Monitoramento

### Ver Logs em Tempo Real
- No dashboard do Render
- Clique no serviço → Aba "Logs"

### Ver Métricas
- Aba "Metrics" mostra:
  - CPU e memória
  - Requests por segundo
  - Tempo de resposta

### Reiniciar Manualmente
- Aba "Settings" → "Manual Deploy" → "Deploy latest commit"

---

## 🔐 Variáveis de Ambiente (se precisar)

Na aba "Environment":
1. Clique "Add Environment Variable"
2. Key: `NOME_DA_VARIAVEL`
3. Value: `valor`
4. Save Changes

---

## 🆘 Solução de Problemas

### QR Code não aparece nos logs
- Vá em Settings → Manual Deploy → "Clear build cache & deploy"

### Bot desconecta do WhatsApp
Os arquivos auth/ não são persistidos no Render gratuito. Soluções:

**Opção 1 - Reconectar manualmente:**
- Delete a pasta auth/ local
- Faça novo commit e push
- Escaneie novo QR Code

**Opção 2 - Usar banco de dados (avançado):**
- Migrar de arquivo JSON para PostgreSQL

### Aplicação não responde
- Verifique logs para erros
- Manual Deploy → "Clear build cache & deploy"

### Dados são perdidos
O Render gratuito não persiste arquivos. Seus dados em `clientes.json` serão resetados a cada deploy.

**Solução:** Use PostgreSQL (gratuito no Render) para persistência real.

---

## 💰 Custos

**Render Free Tier:**
- ✅ 750 horas/mês gratuitas
- ✅ 100GB transferência
- ✅ Sleeping após inatividade
- ✅ 512MB RAM

**Custo:** $0/mês 🎉

---

## ✅ Checklist Final

Após deploy:
- [ ] Repositório criado no GitHub
- [ ] Deploy concluído no Render (sem erros)
- [ ] Logs mostram "Servidor rodando"
- [ ] QR Code escaneado com WhatsApp
- [ ] Painel web acessível
- [ ] Bot responde a mensagens de teste
- [ ] Agendamentos aparecem no painel

---

## 🎯 Está Pronto!

Seu bot está online em:
**https://bot-salao-amanda.onrender.com**

Qualquer atualização, apenas:
```powershell
git add .
git commit -m "atualização"
git push
```

Render faz deploy automático! 🚀
