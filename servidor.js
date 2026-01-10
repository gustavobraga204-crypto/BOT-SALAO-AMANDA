import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { carregarDatabase, obterTodosClientes, obterAgendamentos, cadastrarCliente, salvarAgendamento, clienteExiste, cancelarAgendamento } from './database.js';
import { registrarNotificacao } from './bot-integrado.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Porta dinâmica para produção
const PORT = process.env.PORT || 3000;

// Middleware para JSON
app.use(express.json());

// Carrega database
carregarDatabase();

// Servir arquivos estáticos
app.use(express.static('public'));

// API para obter todos os agendamentos
app.get('/api/agendamentos', (req, res) => {
    const agendamentos = obterAgendamentos();
    res.json(agendamentos);
});

// API para verificar disponibilidade
app.post('/api/verificar-disponibilidade', (req, res) => {
    const { data, horario } = req.body;
    const agendamentos = obterAgendamentos();
    const ocupado = agendamentos.some(ag => 
        ag.agendamento.data === data && ag.agendamento.horario === horario
    );
    res.json({ disponivel: !ocupado });
});

// API para criar novo agendamento (admin)
app.post('/api/agendamentos', (req, res) => {
    try {
        const { nome, telefone, servico, adicionais, data, horario } = req.body;
        
        // Valida campos obrigatórios
        if (!nome || !telefone || !servico || !data || !horario) {
            return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
        }
        
        // Verifica se horário está disponível
        const agendamentos = obterAgendamentos();
        const ocupado = agendamentos.some(ag => 
            ag.agendamento.data === data && ag.agendamento.horario === horario
        );
        
        if (ocupado) {
            return res.status(400).json({ erro: 'Horário já está ocupado' });
        }
        
        // Limpa telefone
        const telefoneLimpo = telefone.replace(/\D/g, '');
        
        // Cadastra cliente se não existir
        if (!clienteExiste(telefoneLimpo)) {
            cadastrarCliente(telefoneLimpo, nome);
        }
        
        // Salva agendamento
        const agendamento = {
            servico,
            adicionais: adicionais || [],
            data,
            horario
        };
        
        salvarAgendamento(telefoneLimpo, agendamento);
        
        // Notifica mudança
        notificarMudanca();
        
        res.json({ sucesso: true, mensagem: 'Agendamento criado com sucesso!' });
    } catch (erro) {
        console.error('Erro ao criar agendamento:', erro);
        res.status(500).json({ erro: 'Erro ao criar agendamento' });
    }
});

// API para cancelar agendamento
app.delete('/api/agendamentos/:telefone', (req, res) => {
    try {
        const { telefone } = req.params;
        const sucesso = cancelarAgendamento(telefone);
        
        if (sucesso) {
            notificarMudanca();
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
io.on('connection', (socket) => {
    console.log('📱 Cliente conectado ao painel');
    
    // Envia dados iniciais
    socket.emit('agendamentos', obterAgendamentos());
    
    socket.on('disconnect', () => {
        console.log('📱 Cliente desconectado do painel');
    });
});

// Função para notificar mudanças
export function notificarMudanca() {
    io.emit('agendamentos', obterAgendamentos());
    console.log('🔄 Painel atualizado');
}

// Registra a função de notificação no bot
registrarNotificacao(notificarMudanca);

// Inicia servidor
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Painel disponível em: http://localhost:${PORT}`);
});
