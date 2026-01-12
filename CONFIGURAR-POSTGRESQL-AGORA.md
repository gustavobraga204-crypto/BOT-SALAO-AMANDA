# 📋 COMO CONFIGURAR O POSTGRESQL

## ✅ Configuração já realizada

O sistema já está preparado para usar PostgreSQL. Agora só falta configurar a conexão!

## 🔧 Passos para configurar

### 1. Configure o arquivo .env

Edite o arquivo `.env` na raiz do projeto e adicione a URL de conexão do seu banco PostgreSQL:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database
```

**Exemplo com dados reais:**
```env
DATABASE_URL=postgresql://admin:minhasenha123@localhost:5432/salao_amanda
```

### 2. Onde conseguir o DATABASE_URL

#### Opção A - PostgreSQL Local
Se você tem PostgreSQL instalado localmente:
```env
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/salao_amanda
```

#### Opção B - Render.com (RECOMENDADO)
1. Acesse https://render.com
2. Crie um novo PostgreSQL Database
3. Copie a "External Database URL"
4. Cole no arquivo .env

#### Opção C - Neon.tech (Gratuito)
1. Acesse https://neon.tech
2. Crie um banco gratuito
3. Copie a Connection String
4. Cole no arquivo .env

### 3. Inicie o servidor

```bash
npm start
```

## 📊 Verificação

Quando o servidor iniciar, você verá uma das mensagens:

- **Com PostgreSQL:** `🐘 Usando PostgreSQL`
- **Sem PostgreSQL:** `📊 Base de dados carregada: X clientes` (usando JSON)

## 🔄 Como os dados funcionam

### ✅ COM DATABASE_URL configurada:
- ✅ Clientes salvos no PostgreSQL
- ✅ Agendamentos salvos no PostgreSQL
- ✅ Painel e WhatsApp usam o mesmo banco
- ✅ Dados persistem mesmo após reiniciar

### ❌ SEM DATABASE_URL:
- ❌ Clientes salvos em `clientes.json`
- ❌ Agendamentos em memória (perdem ao reiniciar)
- ❌ Dados não compartilhados com produção

## 🚀 Deploy em produção (Render.com)

No Render, você NÃO precisa configurar nada!
O Render já fornece automaticamente a variável `DATABASE_URL` quando você:

1. Criar um PostgreSQL Database no Render
2. Fazer deploy do seu Web Service
3. Conectar os dois serviços

Tudo funciona automaticamente! 🎉
