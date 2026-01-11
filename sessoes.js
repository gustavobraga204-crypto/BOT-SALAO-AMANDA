import { clienteExiste, buscarCliente } from './database.js';

// Armazena estado das conversas
export const sessoes = new Map();

export function obterSessao(de) {
    if (!sessoes.has(de)) {
        // Verifica se cliente já está na base de dados
        const cliente = buscarCliente(de);
        if (cliente) {
            console.log(`👤 Cliente retornando: ${cliente.nome}`);
            sessoes.set(de, { 
                etapa: 'menu', 
                dados: { nome: cliente.nome, telefone: cliente.telefone }, 
                cadastrado: true 
            });
        } else {
            sessoes.set(de, { etapa: 'cadastro_nome', dados: {}, cadastrado: false });
        }
    }
    return sessoes.get(de);
}

export function atualizarSessao(de, etapa, dados = {}) {
    const sessao = obterSessao(de);
    const cadastradoAtual = sessao.cadastrado;
    sessao.etapa = etapa;
    sessao.dados = { ...sessao.dados, ...dados };
    sessao.cadastrado = cadastradoAtual || sessao.cadastrado;
    sessoes.set(de, sessao);
}

export function limparSessao(de) {
    sessoes.delete(de);
}

export function limparTodasSessoes() {
    const quantidade = sessoes.size;
    sessoes.clear();
    console.log(`🧹 ${quantidade} sessão(ões) limpa(s)`);
}
