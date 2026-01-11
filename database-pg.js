import pg from 'pg';
import { calcularHorariosBloqueados } from './dados.js';
const { Pool } = pg;

// Configuração do PostgreSQL (usa variável de ambiente DATABASE_URL do Render)
const pool = process.env.DATABASE_URL ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
}) : null;

// Inicializa tabela no PostgreSQL
export async function inicializarBancoPG() {
    if (!pool) return false;
    
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                telefone VARCHAR(20) PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS agendamentos (
                id SERIAL PRIMARY KEY,
                telefone VARCHAR(20) UNIQUE REFERENCES clientes(telefone) ON DELETE CASCADE,
                servico_nome VARCHAR(255) NOT NULL,
                servico_descricao TEXT,
                servico_valor VARCHAR(50),
                servico_duracao VARCHAR(50),
                adicionais TEXT[],
                data VARCHAR(20) NOT NULL,
                horario VARCHAR(10) NOT NULL,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ PostgreSQL inicializado');
        return true;
    } catch (erro) {
        console.error('❌ Erro ao inicializar PostgreSQL:', erro.message);
        return false;
    }
}

// Salva cliente no PostgreSQL
export async function salvarClientePG(telefone, nome) {
    if (!pool) return false;
    
    try {
        await pool.query(
            `INSERT INTO clientes (telefone, nome) 
             VALUES ($1, $2) 
             ON CONFLICT (telefone) 
             DO UPDATE SET ultimo_acesso = CURRENT_TIMESTAMP`,
            [telefone, nome]
        );
        return true;
    } catch (erro) {
        console.error('Erro ao salvar cliente PG:', erro.message);
        return false;
    }
}

// Salva agendamento no PostgreSQL
export async function salvarAgendamentoPG(telefone, agendamento) {
    if (!pool) return false;
    
    try {
        await pool.query(
            `INSERT INTO agendamentos (
                telefone, servico_nome, servico_descricao, servico_valor, 
                servico_duracao, adicionais, data, horario
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (telefone) 
            DO UPDATE SET 
                servico_nome = $2,
                servico_descricao = $3,
                servico_valor = $4,
                servico_duracao = $5,
                adicionais = $6,
                data = $7,
                horario = $8,
                data_criacao = CURRENT_TIMESTAMP`,
            [
                telefone,
                agendamento.servico.nome,
                agendamento.servico.descricao,
                agendamento.servico.valor,
                agendamento.servico.duracao,
                agendamento.adicionais || [],
                agendamento.data,
                agendamento.horario
            ]
        );
        return true;
    } catch (erro) {
        console.error('Erro ao salvar agendamento PG:', erro.message);
        return false;
    }
}

// Busca todos os agendamentos do PostgreSQL
export async function obterAgendamentosPG() {
    if (!pool) return [];
    
    try {
        const result = await pool.query(`
            SELECT 
                c.nome,
                c.telefone,
                a.servico_nome,
                a.servico_descricao,
                a.servico_valor,
                a.servico_duracao,
                a.adicionais,
                a.data,
                a.horario,
                a.data_criacao
            FROM agendamentos a
            JOIN clientes c ON a.telefone = c.telefone
            ORDER BY a.data, a.horario
        `);
        
        return result.rows.map(row => ({
            nome: row.nome,
            telefone: row.telefone,
            agendamento: {
                servico: {
                    nome: row.servico_nome,
                    descricao: row.servico_descricao,
                    valor: row.servico_valor,
                    duracao: row.servico_duracao
                },
                adicionais: row.adicionais || [],
                data: row.data,
                horario: row.horario,
                dataCriacao: row.data_criacao
            }
        }));
    } catch (erro) {
        console.error('Erro ao obter agendamentos PG:', erro.message);
        return [];
    }
}

// Cancela agendamento no PostgreSQL
export async function cancelarAgendamentoPG(telefone) {
    if (!pool) return false;
    
    try {
        await pool.query('DELETE FROM agendamentos WHERE telefone = $1', [telefone]);
        return true;
    } catch (erro) {
        console.error('Erro ao cancelar agendamento PG:', erro.message);
        return false;
    }
}

// Verifica se cliente existe no PostgreSQL
export async function clienteExistePG(telefone) {
    if (!pool) return false;
    
    try {
        const result = await pool.query('SELECT telefone FROM clientes WHERE telefone = $1', [telefone]);
        return result.rows.length > 0;
    } catch (erro) {
        return false;
    }
}

// Verifica disponibilidade de horário no PostgreSQL considerando duração
export async function horarioDisponivelPG(data, horario, duracaoServico = '1h30') {
    if (!pool) return true;
    
    try {
        // Busca todos os agendamentos da data
        const result = await pool.query(
            'SELECT horario, servico FROM agendamentos WHERE data = $1',
            [data]
        );
        
        // Calcula todos os horários ocupados (incluindo slots bloqueados)
        const horariosOcupados = [];
        result.rows.forEach(ag => {
            const duracao = ag.servico?.duracao || '1h30';
            const bloqueados = calcularHorariosBloqueados(ag.horario, duracao);
            horariosOcupados.push(...bloqueados);
        });
        
        // Verifica se o horário desejado e seus slots necessários estão livres
        const horariosBloqueados = calcularHorariosBloqueados(horario, duracaoServico);
        return !horariosBloqueados.some(h => horariosOcupados.includes(h));
    } catch (erro) {
        console.error('Erro ao verificar horário:', erro);
        return true;
    }
}

export { pool };
