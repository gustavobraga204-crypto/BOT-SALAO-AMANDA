import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

async function testarEConfigurar() {
    console.log('🔧 Testando e configurando banco de dados...\n');
    
    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        // Testa conexão
        console.log('📡 Testando conexão...');
        await pool.query('SELECT NOW()');
        console.log('✅ Conexão estabelecida!\n');
        
        // Cria tabela de clientes
        console.log('📋 Criando tabela de clientes...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                telefone VARCHAR(20) PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela clientes criada!\n');
        
        // Cria tabela de agendamentos
        console.log('📋 Criando tabela de agendamentos...');
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
        console.log('✅ Tabela agendamentos criada!\n');
        
        // Verifica quantos registros existem
        const clientes = await pool.query('SELECT COUNT(*) FROM clientes');
        const agendamentos = await pool.query('SELECT COUNT(*) FROM agendamentos');
        
        console.log('📊 Status do banco:');
        console.log(`   - Clientes: ${clientes.rows[0].count}`);
        console.log(`   - Agendamentos: ${agendamentos.rows[0].count}`);
        
        console.log('\n✅ Banco de dados configurado com sucesso!');
        
        await pool.end();
    } catch (erro) {
        console.error('❌ Erro:', erro.message);
        process.exit(1);
    }
}

testarEConfigurar();
