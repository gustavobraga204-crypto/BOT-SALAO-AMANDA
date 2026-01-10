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

// Middleware para JSON
app.use(express.json());

// Carrega database (aguarda se for async)
await carregarDatabase();

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

// API para obter todos os agendamentos
app.get('/api/agendamentos', async (req, res) => {
    const agendamentos = await obterAgendamentos();
    res.json(agendamentos);
});

// API para verificar disponibilidade
app.post('/api/verificar-disponibilidade', async (req, res) => {
    const { data, horario } = req.body;
    const agendamentos = await obterAgendamentos();
    const ocupado = agendamentos.some(ag => 
        ag.agendamento.data === data && ag.agendamento.horario === horario
    );
    res.json({ disponivel: !ocupado });
});

// API para criar novo agendamento (admin)
app.post('/api/agendamentos', async (req, res) => {
    try {
        const { nome, telefone, servico, adicionais, data, horario } = req.body;
        
        // Valida campos obrigatórios
        if (!nome || !telefone || !servico || !data || !horario) {
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
        
        // Cadastra cliente se não existir
        if (!(await clienteExiste(telefoneLimpo))) {
            await cadastrarCliente(telefoneLimpo, nome);
        }
        
        // Salva agendamento
        const agendamento = {
            servico,
            adicionais: adicionais || [],
            data,
            horario
        };
        
        await salvarAgendamento(telefoneLimpo, agendamento);
        
        // Notifica mudança
        await notificarMudanca();
        
        res.json({ sucesso: true, mensagem: 'Agendamento criado com sucesso!' });
    } catch (erro) {
        console.error('Erro ao criar agendamento:', erro);
        res.status(500).json({ erro: 'Erro ao criar agendamento' });
    }
});

// API para cancelar agendamento
app.delete('/api/agendamentos/:telefone', async (req, res) => {
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
