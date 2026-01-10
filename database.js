import { readFileSync, writeFileSync, existsSync } from 'fs';
import { 
    inicializarBancoPG, 
    salvarClientePG, 
    salvarAgendamentoPG, 
    obterAgendamentosPG,
    cancelarAgendamentoPG,
    clienteExistePG,
    horarioDisponivelPG
} from './database-pg.js';

const DB_FILE = './clientes.json';
const usarPostgreSQL = !!process.env.DATABASE_URL;

// Variável para armazenar a função de notificação do servidor
let funcaoNotificarServidor = null;

// Função para registrar callback de notificação
export function registrarNotificacaoServidor(funcao) {
    funcaoNotificarServidor = funcao;
}

// Estrutura: { telefone: { nome, telefone, dataRegistro, ultimoAcesso } }
let clientes = {};

// Carrega dados do arquivo ou inicializa PostgreSQL
export async function carregarDatabase() {
    if (usarPostgreSQL) {
        console.log('🐘 Usando PostgreSQL');
        await inicializarBancoPG();
        return;
    }
    
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
export async function clienteExiste(telefone) {
    const numeroLimpo = limparTelefone(telefone);
    
    if (usarPostgreSQL) {
        return await clienteExistePG(numeroLimpo);
    }
    
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
export async function cadastrarCliente(telefone, nome) {
    const numeroLimpo = limparTelefone(telefone);
    
    if (usarPostgreSQL) {
        await salvarClientePG(numeroLimpo, nome);
        console.log(`✅ Cliente cadastrado: ${nome} (${numeroLimpo})`);
        return;
    }
    
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
export async function salvarAgendamento(telefone, agendamento) {
    const numeroLimpo = limparTelefone(telefone);
    
    if (usarPostgreSQL) {
        const sucesso = await salvarAgendamentoPG(numeroLimpo, agendamento);
        if (sucesso) {
            console.log(`📅 Agendamento salvo no PostgreSQL`);
            if (funcaoNotificarServidor) {
                funcaoNotificarServidor();
                console.log('🔄 Painel atualizado');
            }
        }
        return sucesso;
    }
    
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
export async function cancelarAgendamento(telefone) {
    const numeroLimpo = limparTelefone(telefone);
    
    if (usarPostgreSQL) {
        const sucesso = await cancelarAgendamentoPG(numeroLimpo);
        if (sucesso) {
            console.log(`❌ Agendamento cancelado`);
            if (funcaoNotificarServidor) {
                funcaoNotificarServidor();
                console.log('🔄 Painel atualizado');
            }
        }
        return sucesso;
    }
    
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
export async function obterAgendamentos() {
    if (usarPostgreSQL) {
        return await obterAgendamentosPG();
    }
    
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
export async function horarioDisponivel(data, horario) {
    if (usarPostgreSQL) {
        return await horarioDisponivelPG(data, horario);
    }
    
    const agendamentos = await obterAgendamentos();
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
