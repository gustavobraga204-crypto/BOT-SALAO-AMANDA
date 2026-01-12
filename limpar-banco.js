import { readFileSync, writeFileSync, existsSync } from 'fs';
import pg from 'pg';
const { Pool } = pg;

// Verifica se está usando PostgreSQL
const usarPostgreSQL = !!process.env.DATABASE_URL;

async function limparBanco() {
    console.log('🗑️  LIMPANDO BANCO DE DADOS...\n');
    
    if (usarPostgreSQL) {
        // Limpa PostgreSQL (Render)
        console.log('🐘 Limpando PostgreSQL...');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        
        try {
            await pool.query('DELETE FROM agendamentos');
            console.log('✅ Agendamentos removidos');
            
            await pool.query('DELETE FROM clientes');
            console.log('✅ Clientes removidos');
            
            await pool.end();
            console.log('\n✅ Banco PostgreSQL limpo com sucesso!');
        } catch (erro) {
            console.error('❌ Erro ao limpar PostgreSQL:', erro.message);
            process.exit(1);
        }
    } else {
        // Limpa arquivo JSON local
        console.log('📄 Limpando arquivo JSON local...');
        
        if (existsSync('./clientes.json')) {
            // Backup antes de limpar
            const backup = readFileSync('./clientes.json', 'utf-8');
            writeFileSync(`./clientes-backup-${Date.now()}.json`, backup);
            console.log('💾 Backup criado');
            
            // Limpa o arquivo
            writeFileSync('./clientes.json', '{}');
            console.log('✅ Arquivo clientes.json limpo');
            console.log('\n✅ Banco local limpo com sucesso!');
        } else {
            console.log('⚠️  Arquivo clientes.json não encontrado');
        }
    }
}

limparBanco().catch(console.error);
