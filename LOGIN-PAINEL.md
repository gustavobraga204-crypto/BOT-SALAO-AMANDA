# 🔐 Login do Painel Administrativo

## ✅ Sistema de Autenticação Implementado

O painel administrativo agora possui um **sistema de login seguro** para proteger o acesso aos dados e agendamentos.

---

## 🔑 Credenciais Padrão

**Usuário:** `admin`  
**Senha:** `amanda2026`

> ⚠️ **IMPORTANTE:** Altere essas credenciais em produção!

---

## 🌐 Como Configurar as Credenciais

### **Opção 1: Variáveis de Ambiente (Recomendado para Produção)**

No **Render.com**, adicione estas variáveis de ambiente:

1. Vá em **Environment** no dashboard do seu serviço
2. Adicione as seguintes variáveis:

```
ADMIN_USER=seu_usuario_aqui
ADMIN_PASS=sua_senha_segura_aqui
```

### **Opção 2: Editar o Código (Desenvolvimento)**

Edite o arquivo `servidor.js`:

```javascript
// Linha ~15
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'amanda2026';
```

Altere os valores padrão conforme desejado.

---

## 🛡️ Funcionalidades de Segurança

✅ **Autenticação obrigatória** - Todas as rotas da API requerem login  
✅ **Token de sessão** - Gerado após login bem-sucedido  
✅ **Armazenamento local** - Token salvo no navegador por 24h  
✅ **Expiração automática** - Sessão expira após 24 horas  
✅ **Logout seguro** - Botão para sair e limpar sessão  
✅ **Proteção contra acesso não autorizado** - Redireciona para login se token inválido  

---

## 📱 Como Usar

### **1. Acesse o painel:**
```
https://bot-salao-amanda.onrender.com
```

### **2. Faça login:**
- Digite o usuário e senha
- Clique em **Entrar**

### **3. Navegue no painel:**
- Após login, acesso completo à agenda
- Botão **🚪 Sair** no canto superior direito

---

## ⚙️ Configuração Avançada

### **Render.com - Adicionar Variáveis de Ambiente**

```bash
# Via Render Dashboard
1. Dashboard → Seu serviço → Environment
2. Add Environment Variable:
   - Key: ADMIN_USER
   - Value: seu_usuario
3. Add Environment Variable:
   - Key: ADMIN_PASS
   - Value: sua_senha_segura
4. Save Changes
```

### **Via render.yaml (Automático)**

Adicione no arquivo `render.yaml`:

```yaml
services:
  - type: web
    name: bot-salao-amanda
    env: node
    envVars:
      - key: ADMIN_USER
        value: admin
      - key: ADMIN_PASS
        generateValue: true  # Gera senha aleatória automaticamente
```

---

## 🔒 Dicas de Segurança

1. **Use senhas fortes**
   - Mínimo 12 caracteres
   - Combine letras, números e símbolos
   - Ex: `Amanda@2026!Nails#Seguro`

2. **Nunca compartilhe credenciais**
   - Não envie por WhatsApp/Email
   - Não anote em lugares públicos

3. **Troque a senha regularmente**
   - Recomendado: a cada 3-6 meses

4. **Use variáveis de ambiente**
   - Nunca coloque senhas no código
   - Use `process.env` sempre

---

## 🆘 Problemas Comuns

### **"Usuário ou senha inválidos"**
- Verifique se digitou corretamente
- Credenciais são case-sensitive (maiúsculas/minúsculas importam)
- Padrão: `admin` / `amanda2026`

### **"Não autorizado" após login**
- Limpe o cache do navegador
- Faça logout e login novamente
- Verifique se as variáveis de ambiente estão corretas no Render

### **Esqueci a senha**
- Acesse o Render Dashboard
- Edite a variável `ADMIN_PASS`
- Salve e reinicie o serviço

---

## 🎯 Próximos Passos

Para maior segurança em produção, considere:

- [ ] Implementar recuperação de senha por email
- [ ] Adicionar autenticação de dois fatores (2FA)
- [ ] Criar múltiplos usuários com diferentes permissões
- [ ] Usar banco de dados para armazenar credenciais (com hash)
- [ ] Implementar rate limiting para evitar força bruta

---

📌 **Criado em:** 11/01/2026  
🔐 **Segurança:** Login obrigatório implementado  
✅ **Status:** Funcional e pronto para uso
