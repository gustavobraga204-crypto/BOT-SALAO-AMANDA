# 🚀 Deploy no Fly.io - Guia Completo

## ✅ Vantagens do Fly.io

- ✅ **100% Gratuito** para este projeto (dentro do plano gratuito)
- ✅ **Sempre ativo 24/7** (não dorme)
- ✅ **Servidor em São Paulo** (baixa latência)
- ✅ **Resposta instantânea** do bot
- ✅ **Volumes persistentes** para dados

---

## 📋 Passo a Passo

### 1️⃣ Instalar Fly CLI

No PowerShell do VS Code:

```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**Importante:** Feche e reabra o terminal após a instalação para o comando `fly` funcionar.

### 2️⃣ Criar Conta no Fly.io

```powershell
fly auth signup
```

Ou se já tem conta:

```powershell
fly auth login
```

Isso abrirá o navegador para você fazer login/criar conta.

### 3️⃣ Criar Volume Persistente (para dados do WhatsApp)

```powershell
# Criar volume para salvar sessões e dados
fly volumes create bot_data --region gru --size 1
```

### 4️⃣ Fazer Deploy

```powershell
# Fazer deploy da aplicação
fly deploy
```

O Fly.io irá:
1. Ler o arquivo `fly.toml` (já configurado)
2. Construir a imagem Docker
3. Fazer upload e deploy
4. Fornecer uma URL (ex: `https://bot-salao-amanda.fly.dev`)

**Tempo estimado:** 2-3 minutos

### 5️⃣ Conectar WhatsApp (Obter QR Code)

```powershell
# Ver logs em tempo real
fly logs
```

Procure pelo **QR Code** nos logs. Escaneie com:
- WhatsApp → ⚙️ Configurações → Dispositivos Conectados → Conectar um Dispositivo

### 6️⃣ Acessar Painel Web

```powershell
# Abrir aplicação no navegador
fly open
```

Ou acesse: `https://bot-salao-amanda.fly.dev`

---

## 🔧 Comandos Úteis

### Ver status da aplicação
```powershell
fly status
```

### Ver logs em tempo real
```powershell
fly logs
```

### Restartar aplicação
```powershell
fly apps restart bot-salao-amanda
```

### Abrir console SSH na aplicação
```powershell
fly ssh console
```

### Ver uso de recursos
```powershell
fly dashboard
```

### Atualizar após mudanças no código
```powershell
fly deploy
```

---

## 📊 Monitoramento

### Ver métricas
```powershell
fly dashboard
```

Isso abrirá o painel web com:
- CPU e memória usadas
- Requisições por segundo
- Uptime
- Créditos usados

---

## 🔄 Persistência de Dados

Os arquivos importantes são salvos automaticamente:
- ✅ Sessões WhatsApp em `/app/auth/` → **persistidos no volume**
- ✅ Agendamentos em `clientes.json` → **persistidos no volume**

O volume `bot_data` garante que os dados não sejam perdidos entre deploys.

---

## 💰 Custos

**Plano Gratuito do Fly.io inclui:**
- ✅ Até 3 máquinas VM compartilhadas
- ✅ 256MB RAM por máquina
- ✅ 3GB de volume persistente
- ✅ 160GB de transferência/mês

**Este bot usa:**
- 1 máquina VM (256MB RAM)
- 1GB de volume
- ~5-10GB transferência/mês

**Custo:** $0/mês (dentro do free tier) 🎉

---

## ⚠️ Solução de Problemas

### "Error: failed to fetch an image or build from source"
- Verifique se o Docker está instalado (Fly.io usa Docker)
- Execute: `fly doctor` para diagnosticar

### QR Code não aparece nos logs
```powershell
# Reiniciar aplicação
fly apps restart bot-salao-amanda

# Ver logs novamente
fly logs
```

### Bot desconecta do WhatsApp
```powershell
# SSH na aplicação
fly ssh console

# Remover credenciais antigas
rm -rf auth/*

# Sair do SSH
exit

# Reiniciar
fly apps restart bot-salao-amanda

# Ver novo QR Code
fly logs
```

### Aplicação não responde
```powershell
# Verificar status
fly status

# Ver logs de erro
fly logs

# Reiniciar
fly apps restart bot-salao-amanda
```

### Atingiu limite gratuito
- Fly.io notifica por email
- Você pode adicionar cartão para continuar
- Ou otimizar recursos (diminuir RAM se necessário)

---

## 🔐 Segurança

### Variáveis de Ambiente (se precisar)
```powershell
fly secrets set NOME_VARIAVEL="valor"
```

### Ver secrets configurados
```powershell
fly secrets list
```

---

## 🎯 Checklist Final

Após deploy, verifique:

- [ ] Aplicação rodando: `fly status`
- [ ] Logs sem erros: `fly logs`
- [ ] QR Code escaneado com WhatsApp
- [ ] Painel web acessível: `fly open`
- [ ] Bot responde a mensagens
- [ ] Agendamentos aparecem no painel em tempo real
- [ ] Dados persistem após restart

---

## 🆘 Suporte

- **Documentação:** https://fly.io/docs/
- **Community:** https://community.fly.io/
- **Status:** https://status.fly.io/

---

## 🚀 Está Pronto!

Seu bot agora está rodando 24/7 no Fly.io gratuitamente!

- **URL do Painel:** `https://bot-salao-amanda.fly.dev`
- **Bot WhatsApp:** Sempre ativo e respondendo instantaneamente
- **Dados Seguros:** Salvos em volume persistente

Qualquer atualização no código, basta executar:
```powershell
fly deploy
```
