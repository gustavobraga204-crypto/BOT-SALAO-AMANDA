# Bot de Agendamento - Amanda Nails Designer

Sistema completo de agendamento via WhatsApp com painel web em tempo real.

## 🚀 Recursos

- ✅ Bot WhatsApp automatizado para agendamentos
- 🌐 Painel web visual para acompanhar agendamentos
- 🔄 Atualização em tempo real via WebSocket
- 📱 Cadastro de clientes automático
- 📅 Gerenciamento de horários e serviços

## 📦 Instalação

```bash
npm install
```

## 🎯 Como usar

### Opção 1: Apenas o bot WhatsApp
```bash
npm start
```

### Opção 2: Bot + Painel Web (Recomendado)
```bash
npm run painel
```

Depois acesse: http://localhost:3000

## 🖥️ Painel Web

O painel web oferece:
- 📊 Visualização de todos os agendamentos
- 🔍 Filtros por data (Hoje, Amanhã, Semana)
- 🔄 Atualização automática em tempo real
- 📱 Design responsivo
- 💅 Interface moderna e intuitiva

### Funcionalidades do Painel:
- **Cards de Agendamento**: Mostra todos os detalhes de cada cliente
- **Estatísticas**: Total de agendamentos e clientes
- **Status de Conexão**: Indicador visual de conexão
- **Filtros**: Visualize agendamentos por período

## 📁 Estrutura do Projeto

```
├── bot.js                 # Bot WhatsApp standalone
├── bot-integrado.js       # Bot com integração ao painel
├── servidor.js            # Servidor web Express + WebSocket
├── iniciar.js            # Inicia bot + servidor juntos
├── database.js           # Gerenciamento de dados
├── fluxos.js             # Lógica de conversação
├── mensagens.js          # Templates de mensagens
├── sessoes.js            # Gerenciamento de sessões
├── dados.js              # Dados de serviços
├── clientes.json         # Base de dados
├── public/               # Arquivos do painel web
│   ├── index.html
│   ├── style.css
│   └── script.js
└── auth/                 # Autenticação WhatsApp
```

## 🌐 Como Hospedar (24/7)

### Railway.app (Recomendado)
1. Crie conta em https://railway.app
2. Conecte com GitHub
3. Deploy automático

### Render.com
1. Crie conta em https://render.com
2. Faça upload do projeto
3. Configure variável PORT

### VPS (DigitalOcean, Linode, etc)
```bash
# Instale Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone o projeto
# Instale dependências
npm install

# Use PM2 para manter rodando
npm install -g pm2
pm2 start iniciar.js --name bot-salao
pm2 save
pm2 startup
```

## 🔧 Configuração

### Porta do Servidor
Por padrão usa a porta 3000. Para mudar:
```bash
PORT=8080 npm run painel
```

### Primeira Execução
1. Execute `npm run painel`
2. Escaneie o QR Code com o WhatsApp
3. Acesse http://localhost:3000
4. Pronto! 🎉

## 📱 Como Funciona

1. Cliente envia mensagem no WhatsApp
2. Bot processa e salva agendamento
3. Sistema notifica o painel web em tempo real
4. Painel atualiza automaticamente
5. Você acompanha tudo pela interface web

## 🎨 Personalização

### Alterar cores do painel
Edite `public/style.css` nas variáveis CSS:
```css
:root {
    --primary: #FF69B4;      /* Cor principal */
    --secondary: #FFC0CB;    /* Cor secundária */
    /* ... */
}
```

## 📞 Suporte

Em caso de dúvidas ou problemas, verifique:
- ✅ Node.js instalado (v16+)
- ✅ Dependências instaladas (`npm install`)
- ✅ WhatsApp conectado (QR Code escaneado)
- ✅ Porta 3000 disponível

---

Desenvolvido com 💅 para Amanda Nails Designer
