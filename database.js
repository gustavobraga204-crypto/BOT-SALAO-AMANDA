import { readFileSync, writeFileSync, existsSync } from 'fs';

const DB_FILE = './clientes.json';

// Variável para armazenar a função de notificação do servidor
let funcaoNotificarServidor = null;

// Função para registrar callback de notificação
export function registrarNotificacaoServidor(funcao) {
    funcaoNotificarServidor = funcao;
}

// Estrutura: { telefone: { nome, telefone, dataRegistro, ultimoAcesso } }
let clientes = {};

// Carrega dados do arquivo
export function carregarDatabase() {
    try {
        if (existsSync(DB_FILE)) {
            const dados = readFileSync(DB_FILE, 'utf-8');
            clientes = JSON.parse(dados);
            console.log(`📊 Base de dados carregada: ${Object.keys(clientes).length} clientes`);
        } else {
            console.log('📊 Nova base de dados criada');
            salvarDatabase();
        }
    } catch (erro) {
        console.error('❌ Erro ao carregar database:', erro.message);
        clientes = {};
    }
}

// Salva dados no arquivo
export function salvarDatabase() {
    try {
        writeFileSync(DB_FILE, JSON.stringify(clientes, null, 2));
    } catch (erro) {
        console.error('❌ Erro ao salvar database:', erro.message);
    }
}

// Verifica se cliente existe
export function clienteExiste(telefone) {
    const numeroLimpo = limparTelefone(telefone);
    return clientes.hasOwnProperty(numeroLimpo);
}

// Busca cliente
export function buscarCliente(telefone) {
    const numeroLimpo = limparTelefone(telefone);
    if (clientes[numeroLimpo]) {
        // Atualiza último acesso
        clientes[numeroLimpo].ultimoAcesso = new Date().toISOString();
        salvarDatabase();
        return clientes[numeroLimpo];
    }
    return null;
}

// Cadastra novo cliente
export function cadastrarCliente(telefone, nome) {
    const numeroLimpo = limparTelefone(telefone);
    clientes[numeroLimpo] = {
        nome,
        telefone: numeroLimpo,
        dataRegistro: new Date().toISOString(),
        ultimoAcesso: new Date().toISOString()
    };
    salvarDatabase();
    console.log(`✅ Cliente cadastrado: ${nome} (${numeroLimpo})`);
}

// Atualiza dados do cliente
export function atualizarCliente(telefone, dados) {
    const numeroLimpo = limparTelefone(telefone);
    if (clientes[numeroLimpo]) {
        clientes[numeroLimpo] = {
            ...clientes[numeroLimpo],
            ...dados,
            ultimoAcesso: new Date().toISOString()
        };
        salvarDatabase();
    }
}

// Remove caracteres não numéricos do telefone
function limparTelefone(telefone) {
    return telefone.replace(/\D/g, '');
}

// Total de clientes
export function totalClientes() {
    return Object.keys(clientes).length;
}

// Salva agendamento do cliente
export function salvarAgendamento(telefone, agendamento) {
    const numeroLimpo = limparTelefone(telefone);
    if (clientes[numeroLimpo]) {
        clientes[numeroLimpo].agendamento = {
            ...agendamento,
            dataCriacao: new Date().toISOString()
        };
        salvarDatabase();
        console.log(`📅 Agendamento salvo para ${clientes[numeroLimpo].nome}`);
        
        // Notifica o painel web
        if (funcaoNotificarServidor) {
            funcaoNotificarServidor();
            console.log('🔄 Painel atualizado');
        }
        
        return true;
    }
    return false;
}

// Busca agendamento do cliente
export function buscarAgendamento(telefone) {
    const numeroLimpo = limparTelefone(telefone);
    if (clientes[numeroLimpo] && clientes[numeroLimpo].agendamento) {
        return clientes[numeroLimpo].agendamento;
    }
    return null;
}

// Cancela agendamento do cliente
export function cancelarAgendamento(telefone) {
    const numeroLimpo = limparTelefone(telefone);
    if (clientes[numeroLimpo] && clientes[numeroLimpo].agendamento) {
        delete clientes[numeroLimpo].agendamento;
        salvarDatabase();
        console.log(`❌ Agendamento cancelado para ${clientes[numeroLimpo].nome}`);
        
        // Notifica o painel web
        if (funcaoNotificarServidor) {
            funcaoNotificarServidor();
            console.log('🔄 Painel atualizado');
        }
        
        return true;
    }
    return false;
}

// Retorna todos os clientes com agendamento
export function obterAgendamentos() {
    return Object.values(clientes)
        .filter(cliente => cliente.agendamento)
        .sort((a, b) => {
            // Ordena por data e horário
            const dataA = parseDataBR(a.agendamento.data);
            const dataB = parseDataBR(b.agendamento.data);
            return dataA - dataB;
        });
}

// Verifica se horário está disponível
export function horarioDisponivel(data, horario) {
    const agendamentos = obterAgendamentos();
    return !agendamentos.some(ag => 
        ag.agendamento.data === data && ag.agendamento.horario === horario
    );
}

// Retorna todos os clientes
export function obterTodosClientes() {
    return Object.values(clientes);
}

// Parse data no formato brasileiro DD/MM/YYYY
function parseDataBR(dataStr) {
    const [dia, mes, ano] = dataStr.split('/').map(Number);
    return new Date(ano, mes - 1, dia);
}
