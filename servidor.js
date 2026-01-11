import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import QRCode from 'qrcode';
import { carregarDatabase, obterTodosClientes, obterAgendamentos, cadastrarCliente, salvarAgendamento, clienteExiste, cancelarAgendamento, registrarNotificacaoServidor } from './database.js';
import { registrarNotificacao, qrCodeAtual } from './bot-integrado.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Porta dinâmica para produção
const PORT = process.env.PORT || 3000;

// Credenciais de login (em produção, usar variáveis de ambiente)
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'amanda2026';

// Armazena tokens de sessão (em produção, usar Redis ou banco)
const sessoes = new Map();

// Gera token aleatório
function gerarToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Middleware para verificar autenticação
function verificarAuth(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    
    if (!token || !sessoes.has(token)) {
        return res.status(401).json({ erro: 'Não autorizado' });
    }
    
    next();
}

// Middleware para JSON
app.use(express.json());

// Carrega database (aguarda se for async)
await carregarDatabase();

// Rota de login
app.post('/api/login', (req, res) => {
    const { usuario, senha } = req.body;
    
    if (usuario === ADMIN_USER && senha === ADMIN_PASS) {
        const token = gerarToken();
        sessoes.set(token, { usuario, data: new Date() });
        
        // Remove sessões antigas (após 24h)
        setTimeout(() => sessoes.delete(token), 24 * 60 * 60 * 1000);
        
        res.json({ sucesso: true, token });
    } else {
        res.status(401).json({ erro: 'Usuário ou senha inválidos' });
    }
});

// Rota para verificar se está autenticado
app.get('/api/verificar-auth', verificarAuth, (req, res) => {
    res.json({ autenticado: true });
});

// Servir arquivos estáticos
app.use(express.static('public'));

// Rota para exibir QR Code no navegador
app.get('/qrcode', async (req, res) => {
    if (!qrCodeAtual) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>QR Code - WhatsApp</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                    .container {
                        text-align: center;
                        background: white;
                        padding: 3rem;
                        border-radius: 20px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        color: #333;
                    }
                    h1 { margin: 0 0 1rem 0; color: #667eea; }
                    p { font-size: 1.1rem; margin: 0.5rem 0; }
                    .status { 
                        display: inline-block;
                        padding: 0.5rem 1rem;
                        background: #10b981;
                        color: white;
                        border-radius: 10px;
                        margin-top: 1rem;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ WhatsApp Conectado!</h1>
                    <p>O bot já está funcionando.</p>
                    <p>Não é necessário escanear o QR Code novamente.</p>
                    <div class="status">🟢 Online</div>
                </div>
            </body>
            </html>
        `);
    }
    
    try {
        const qrCodeImage = await QRCode.toDataURL(qrCodeAtual, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>QR Code - WhatsApp</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                    .container {
                        text-align: center;
                        background: white;
                        padding: 3rem;
                        border-radius: 20px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    }
                    h1 {
                        margin: 0 0 1rem 0;
                        color: #667eea;
                        font-size: 2rem;
                    }
                    .qr-container {
                        background: white;
                        padding: 1.5rem;
                        border-radius: 15px;
                        display: inline-block;
                        margin: 2rem 0;
                    }
                    img {
                        display: block;
                        width: 400px;
                        height: 400px;
                    }
                    .instructions {
                        background: #f3f4f6;
                        padding: 1.5rem;
                        border-radius: 10px;
                        margin-top: 2rem;
                        color: #333;
                    }
                    .instructions h3 {
                        margin: 0 0 1rem 0;
                        color: #667eea;
                    }
                    .instructions ol {
                        text-align: left;
                        margin: 0;
                        padding-left: 1.5rem;
                    }
                    .instructions li {
                        margin: 0.5rem 0;
                        line-height: 1.6;
                    }
                    .refresh-note {
                        margin-top: 2rem;
                        font-size: 0.9rem;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>📱 Conectar WhatsApp</h1>
                    <p style="color: #666;">Escaneie o QR Code abaixo com seu WhatsApp</p>
                    
                    <div class="qr-container">
                        <img src="${qrCodeImage}" alt="QR Code WhatsApp">
                    </div>
                    
                    <div class="instructions">
                        <h3>📋 Como Conectar:</h3>
                        <ol>
                            <li>Abra o <strong>WhatsApp</strong> no seu celular</li>
                            <li>Toque em <strong>Configurações ⚙️</strong></li>
                            <li>Toque em <strong>Dispositivos Conectados</strong></li>
                            <li>Toque em <strong>Conectar um Dispositivo</strong></li>
                            <li><strong>Escaneie</strong> o QR Code acima</li>
                        </ol>
                    </div>
                    
                    <p class="refresh-note">
                        ⏱️ Este QR Code expira em 30 segundos.<br>
                        Atualize a página se precisar de um novo código.
                    </p>
                </div>
                
                <script>
                    // Auto-refresh a cada 25 segundos para pegar novo QR Code
                    setTimeout(() => {
                        location.reload();
                    }, 25000);
                </script>
            </body>
            </html>
        `);
    } catch (erro) {
        res.status(500).send('Erro ao gerar QR Code');
    }
});

// API de debug - Ver dados do banco (apenas desenvolvimento)
app.get('/api/debug/database', async (req, res) => {
    try {
        const agendamentos = await obterAgendamentos();
        const clientes = await obterTodosClientes();
        
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Debug - Banco de Dados</title>
                <style>
                    body {
                        font-family: 'Courier New', monospace;
                        padding: 20px;
                        background: #1e1e1e;
                        color: #d4d4d4;
                    }
                    h1 { color: #4ec9b0; }
                    h2 { color: #dcdcaa; margin-top: 30px; }
                    .info { color: #608b4e; margin-bottom: 20px; }
                    .data {
                        background: #252526;
                        border: 1px solid #3c3c3c;
                        border-radius: 5px;
                        padding: 15px;
                        margin: 10px 0;
                        overflow-x: auto;
                    }
                    pre {
                        margin: 0;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                    .count {
                        background: #0e639c;
                        color: white;
                        padding: 5px 15px;
                        border-radius: 20px;
                        display: inline-block;
                        font-weight: bold;
                    }
                    .empty {
                        color: #ce9178;
                        font-style: italic;
                    }
                    .refresh {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 10px 20px;
                        background: #0e639c;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                    }
                    .refresh:hover {
                        background: #1177bb;
                    }
                </style>
            </head>
            <body>
                <button class="refresh" onclick="location.reload()">🔄 Atualizar</button>
                
                <h1>🔍 Debug - Banco de Dados</h1>
                <div class="info">
                    📊 Usando: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'JSON Local'}<br>
                    🕐 Atualizado em: ${new Date().toLocaleString('pt-BR')}
                </div>
                
                <h2>📅 Agendamentos <span class="count">${agendamentos.length}</span></h2>
                ${agendamentos.length > 0 ? `
                    ${agendamentos.map((ag, i) => `
                        <div class="data">
                            <strong>Agendamento #${i + 1}</strong>
                            <pre>${JSON.stringify(ag, null, 2)}</pre>
                        </div>
                    `).join('')}
                ` : '<div class="empty">Nenhum agendamento encontrado</div>'}
                
                <h2>👥 Clientes <span class="count">${clientes.length}</span></h2>
                ${clientes.length > 0 ? `
                    ${clientes.map((cliente, i) => `
                        <div class="data">
                            <strong>Cliente #${i + 1}</strong>
                            <pre>${JSON.stringify(cliente, null, 2)}</pre>
                        </div>
                    `).join('')}
                ` : '<div class="empty">Nenhum cliente encontrado</div>'}
            </body>
            </html>
        `);
    } catch (erro) {
        res.status(500).send(`
            <h1>❌ Erro ao buscar dados</h1>
            <pre>${erro.message}\n\n${erro.stack}</pre>
        `);
    }
});

// API para obter todos os agendamentos (protegida)
app.get('/api/agendamentos', verificarAuth, async (req, res) => {
    const agendamentos = await obterAgendamentos();
    res.json(agendamentos);
});

// API para verificar disponibilidade (protegida)
app.post('/api/verificar-disponibilidade', verificarAuth, async (req, res) => {
    const { data, horario } = req.body;
    const agendamentos = await obterAgendamentos();
    const ocupado = agendamentos.some(ag => 
        ag.agendamento.data === data && ag.agendamento.horario === horario
    );
    res.json({ disponivel: !ocupado });
});

// API para criar novo agendamento (admin - protegida)
app.post('/api/agendamentos', verificarAuth, async (req, res) => {
    try {
        console.log('📥 Recebido pedido de agendamento:', req.body);
        const { nome, telefone, servico, adicionais, data, horario } = req.body;
        
        // Valida campos obrigatórios
        if (!nome || !telefone || !servico || !data || !horario) {
            console.log('❌ Campos obrigatórios faltando');
            return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
        }
        
        // Verifica se horário está disponível
        const agendamentos = await obterAgendamentos();
        const ocupado = agendamentos.some(ag => 
            ag.agendamento.data === data && ag.agendamento.horario === horario
        );
        
        if (ocupado) {
            return res.status(400).json({ erro: 'Horário já está ocupado' });
        }
        
        // Limpa telefone
        const telefoneLimpo = telefone.replace(/\D/g, '');
        console.log('📞 Telefone limpo:', telefoneLimpo);
        
        // Cadastra cliente se não existir
        if (!(await clienteExiste(telefoneLimpo))) {
            console.log('👤 Cadastrando novo cliente:', nome);
            await cadastrarCliente(telefoneLimpo, nome);
        }
        
        // Salva agendamento
        const agendamento = {
            servico,
            adicionais: adicionais || [],
            data,
            horario
        };
        
        console.log('💾 Salvando agendamento:', agendamento);
        const sucesso = await salvarAgendamento(telefoneLimpo, agendamento);
        
        if (!sucesso) {
            console.log('❌ Falha ao salvar agendamento');
            return res.status(500).json({ erro: 'Falha ao salvar no banco de dados' });
        }
        
        console.log('✅ Agendamento salvo com sucesso!');
        
        // Notifica mudança
        await notificarMudanca();
        
        res.json({ sucesso: true, mensagem: 'Agendamento criado com sucesso!' });
    } catch (erro) {
        console.error('Erro ao criar agendamento:', erro);
        res.status(500).json({ erro: 'Erro ao criar agendamento' });
    }
});

// API para cancelar agendamento (protegida)
app.delete('/api/agendamentos/:telefone', verificarAuth, async (req, res) => {
    try {
        const { telefone } = req.params;
        const sucesso = await cancelarAgendamento(telefone);
        
        if (sucesso) {
            await notificarMudanca();
            res.json({ sucesso: true, mensagem: 'Agendamento cancelado' });
        } else {
            res.status(404).json({ erro: 'Agendamento não encontrado' });
        }
    } catch (erro) {
        console.error('Erro ao cancelar agendamento:', erro);
        res.status(500).json({ erro: 'Erro ao cancelar agendamento' });
    }
});

// WebSocket - conexão de clientes
io.on('connection', async (socket) => {
    console.log('📱 Cliente conectado ao painel');
    
    // Envia dados iniciais
    socket.emit('agendamentos', await obterAgendamentos());
    
    socket.on('disconnect', () => {
        console.log('📱 Cliente desconectado do painel');
    });
});

// Função para notificar mudanças
export async function notificarMudanca() {
    io.emit('agendamentos', await obterAgendamentos());
    console.log('🔄 Painel atualizado');
}

// Registra a função de notificação no bot
registrarNotificacao(notificarMudanca);

// Registra a função de notificação no database
registrarNotificacaoServidor(notificarMudanca);

// Inicia servidor
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Painel disponível em: http://localhost:${PORT}`);
});
