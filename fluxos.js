import { obterSessao, atualizarSessao, limparSessao } from './sessoes.js';
import { mensagens } from './mensagens.js';
import { servicos, promocoes, horarios } from './dados.js';
import { cadastrarCliente, buscarCliente, salvarAgendamento, buscarAgendamento, cancelarAgendamento, horarioDisponivel } from './database.js';

export async function fluxos(de, texto, temImagem = false) {
    const sessao = obterSessao(de);
    const entrada = texto.toLowerCase();

    // Início automático - Verifica cadastro primeiro
    // Sem verificação de palavras-chave, apenas fluxo automático

    // FLUXO CADASTRO
    if (sessao.etapa === 'cadastro_nome') {
        atualizarSessao(de, 'cadastro_telefone', { nome: texto });
        return mensagens.cadastro.solicitarTelefone;
    }

    if (sessao.etapa === 'cadastro_telefone') {
        sessao.dados.telefone = texto;
        sessao.cadastrado = true;
        
        // Salva cadastro na database
        await cadastrarCliente(de, sessao.dados.nome);
        
        atualizarSessao(de, 'menu', sessao.dados);
        return mensagens.cadastro.sucesso(sessao.dados.nome) + '\n\n' + mensagens.boasVindas;
    }

    // Verifica se já está cadastrado antes de acessar menu
    if (!sessao.cadastrado && !['cadastro_nome', 'cadastro_telefone'].includes(sessao.etapa)) {
        // Busca novamente no banco para garantir
        const clienteCadastrado = buscarCliente(de);
        if (clienteCadastrado) {
            atualizarSessao(de, 'menu', { 
                nome: clienteCadastrado.nome, 
                telefone: de,
                cadastrado: true 
            });
            sessao.cadastrado = true;
            return mensagens.boasVindasRetorno(clienteCadastrado.nome);
        } else {
            atualizarSessao(de, 'cadastro_nome');
            return mensagens.cadastro.solicitarNome;
        }
    }

    // Menu principal
    if (sessao.etapa === 'menu') {
        if (entrada === '1') {
            atualizarSessao(de, 'agendamento_servico', { nome: sessao.dados.nome, telefone: sessao.dados.telefone });
            return `Ótimo, ${sessao.dados.nome}!\n\n` + mensagens.listarServicos('agendamento');
        }
        if (entrada === '2') {
            atualizarSessao(de, 'servicos');
            return mensagens.listarServicos();
        }
        if (entrada === '3') {
            atualizarSessao(de, 'promocoes');
            return mensagens.listarPromocoes();
        }
        if (entrada === '4') {
            atualizarSessao(de, 'atendente');
            return mensagens.transferirAtendente;
        }
        if (entrada === '5') {
            atualizarSessao(de, 'menu');
            return mensagens.endereco;
        }
        if (entrada === '6') {
            limparSessao(de);
            return mensagens.encerrar;
        }
        if (entrada === '7') {
            const agendamento = buscarAgendamento(de);
            if (agendamento) {
                atualizarSessao(de, 'cancelar_confirmacao', { agendamento });
                return mensagens.cancelamento.confirmar(agendamento);
            } else {
                return mensagens.cancelamento.naoEncontrado;
            }
        }
        if (entrada === '8') {
            const agendamento = buscarAgendamento(de);
            if (agendamento) {
                atualizarSessao(de, 'reagendar_opcao', { agendamentoAnterior: agendamento });
                return mensagens.reagendamento.opcoes;
            } else {
                return mensagens.reagendamento.naoEncontrado;
            }
        }
    }

    // FLUXO AGENDAMENTO
    if (sessao.etapa === 'agendamento_nome') {
        // Usa o nome do cadastro automaticamente
        atualizarSessao(de, 'agendamento_servico', { nome: sessao.dados.nome, telefone: sessao.dados.telefone });
        return `Ótimo, ${sessao.dados.nome}!\n\n` + mensagens.listarServicos('agendamento');
    }

    if (sessao.etapa === 'agendamento_servico') {
        const numServico = parseInt(entrada);
        if (numServico > 0 && numServico <= servicos.length) {
            atualizarSessao(de, 'agendamento_adicionais', { 
                servico: servicos[numServico - 1],
                nome: sessao.dados.nome,
                telefone: sessao.dados.telefone
            });
            return mensagens.agendamento.solicitarAdicionais;
        }
        return 'Opção inválida. Digite o número do serviço.';
    }

    if (sessao.etapa === 'agendamento_adicionais') {
        if (entrada === '0') {
            atualizarSessao(de, 'agendamento_data', { adicionais: [] });
        } else {
            const nomesAdicionais = ['Francesinha', 'Pedrarias', 'Nail art', 'Esmaltação', 'Cutilagem'];
            const nums = entrada.split(',').map(n => parseInt(n.trim()));
            const adicionaisSelecionados = nums.filter(n => n > 0 && n <= 5).map(n => nomesAdicionais[n - 1]);
            atualizarSessao(de, 'agendamento_data', { adicionais: adicionaisSelecionados });
        }
        return mensagens.agendamento.solicitarData;
    }

    if (sessao.etapa === 'agendamento_data') {
        atualizarSessao(de, 'agendamento_horario', { data: texto });
        return mensagens.agendamento.solicitarHorario;
    }

    if (sessao.etapa === 'agendamento_horario') {
        const numHorario = parseInt(entrada);
        if (numHorario > 0 && numHorario <= horarios.length) {
            const horarioSelecionado = horarios[numHorario - 1];
            const dataSelecionada = sessao.dados.data;
            const duracaoServico = sessao.dados.servico.duracao;
            
            // Verifica se o horário está disponível considerando a duração
            if (!await horarioDisponivel(dataSelecionada, horarioSelecionado, duracaoServico)) {
                return `❌ Desculpe! O horário ${horarioSelecionado} no dia ${dataSelecionada} não está disponível para um serviço de ${duracaoServico}.\n\n` +
                       `Por favor, escolha outro horário:\n\n` + mensagens.agendamento.solicitarHorario;
            }
            
            sessao.dados.horario = horarioSelecionado;
            
            const resumo = `
📋 *RESUMO DO AGENDAMENTO*

👤 Nome: ${sessao.dados.nome}
📱 Telefone: ${sessao.dados.telefone}
💅 Serviço: ${sessao.dados.servico.nome}
💰 Valor: ${sessao.dados.servico.valor}
✨ Adicionais: ${sessao.dados.adicionais.length > 0 ? sessao.dados.adicionais.join(', ') : 'Nenhum'}
📅 Data: ${sessao.dados.data}
🕐 Horário: ${sessao.dados.horario}

Digite *1* para CONFIRMAR ou *0* para CANCELAR.`;
            
            atualizarSessao(de, 'agendamento_confirmacao', sessao.dados);
            return resumo;
        }
        return 'Horário inválido. Digite o número do horário.';
    }

    if (sessao.etapa === 'agendamento_confirmacao') {
        if (entrada === '1') {
            // Extrai o valor do serviço e calcula o sinal de 20%
            const valorTexto = sessao.dados.servico.valor;
            const valorMatch = valorTexto.match(/R\$\s*([0-9,\.]+)/);
            
            if (valorMatch) {
                const valorNumerico = parseFloat(valorMatch[1].replace(',', '.'));
                const sinalValor = (valorNumerico * 0.20).toFixed(2).replace('.', ',');
                
                const mensagemSinal = `
💰 *SINAL DE CONFIRMAÇÃO*

Para confirmar seu agendamento, é necessário o pagamento de um sinal de 20%:

📊 Valor do serviço: R$ ${valorNumerico.toFixed(2).replace('.', ',')}
💵 Valor do sinal (20%): R$ ${sinalValor}

🏦 *Dados para pagamento:*
📱 PIX (Celular): (11) 98642-3634
👤 Nome: Amanda Nails Designer

📸 *Envie a foto do comprovante* que o agendamento será confirmado automaticamente!

Ou digite *0* para cancelar o agendamento`;
                
                atualizarSessao(de, 'aguardando_pagamento', { 
                    ...sessao.dados,
                    sinalValor: sinalValor
                });
                return mensagemSinal;
            } else {
                // Se não conseguir extrair o valor, continua normalmente
                const agendamentoSalvo = {
                    servico: sessao.dados.servico,
                    adicionais: sessao.dados.adicionais,
                    data: sessao.dados.data,
                    horario: sessao.dados.horario
                };
                await salvarAgendamento(de, agendamentoSalvo);
                limparSessao(de);
                return mensagens.agendamento.sucesso + '\n\n✅ Agendamento concluído! Até breve! 👋';
            }
        }
        if (entrada === '0') {
            atualizarSessao(de, 'menu');
            return 'Agendamento cancelado.\n\n' + mensagens.boasVindas;
        }
    }

    // FLUXO PAGAMENTO DO SINAL
    if (sessao.etapa === 'aguardando_pagamento') {
        // Detecta automaticamente quando uma imagem é enviada
        if (temImagem) {
            // Salva o agendamento no banco de dados
            const agendamentoSalvo = {
                servico: sessao.dados.servico,
                adicionais: sessao.dados.adicionais,
                data: sessao.dados.data,
                horario: sessao.dados.horario,
                sinalPago: true,
                valorSinal: sessao.dados.sinalValor,
                dataComprovante: new Date().toISOString()
            };
            await salvarAgendamento(de, agendamentoSalvo);
            
            // Limpa a sessão após confirmar o agendamento
            limparSessao(de);
            
            return `✅ *COMPROVANTE RECEBIDO!*\n\n` + 
                   `Seu comprovante foi recebido e está sendo analisado pela nossa equipe.\n\n` +
                   mensagens.agendamento.sucesso + 
                   `\n\n💰 Sinal: R$ ${sessao.dados.sinalValor}\n` +
                   `📋 Agendamento confirmado!\n` +
                   `📅 Data: ${sessao.dados.data}\n` +
                   `🕐 Horário: ${sessao.dados.horario}\n\n` +
                   `📱 Em caso de dúvidas sobre o pagamento, entraremos em contato.\n\n` +
                   `Até breve! 👋`;
        }
        if (entrada === '0') {
            atualizarSessao(de, 'menu');
            return 'Agendamento cancelado. O sinal não foi cobrado.\n\n' + mensagens.boasVindas;
        }
        return '📸 Por favor, *envie a imagem do comprovante* de pagamento do sinal.\n\nOu digite *0* para cancelar o agendamento.';
    }

    // FLUXO SERVIÇOS
    if (sessao.etapa === 'servicos') {
        const num = parseInt(entrada);
        if (num > 0 && num <= servicos.length) {
            const servico = servicos[num - 1];
            atualizarSessao(de, 'agendamento_servico', { nome: sessao.dados.nome, telefone: sessao.dados.telefone });
            return `Ótimo, ${sessao.dados.nome}!\n\n` + mensagens.listarServicos('agendamento');
        }
    }

    // FLUXO PROMOÇÕES - redirecionado automaticamente
    if (sessao.etapa === 'promocoes') {
        atualizarSessao(de, 'menu');
        return mensagens.boasVindas;
    }

    // ATENDENTE
    if (sessao.etapa === 'atendente') {
        atualizarSessao(de, 'menu');
        return 'Retornando ao menu...\n\n' + mensagens.boasVindas;
    }

    // FLUXO CANCELAMENTO
    if (sessao.etapa === 'cancelar_confirmacao') {
        if (entrada === '1') {
            if (cancelarAgendamento(de)) {
                atualizarSessao(de, 'menu');
                return mensagens.cancelamento.sucesso;
            } else {
                atualizarSessao(de, 'menu');
                return mensagens.cancelamento.erro;
            }
        }
        if (entrada === '0') {
            atualizarSessao(de, 'menu');
            return mensagens.cancelamento.mantido;
        }
    }

    // FLUXO REAGENDAMENTO
    if (sessao.etapa === 'reagendar_opcao') {
        if (entrada === '1') {
            // Alterar data
            atualizarSessao(de, 'reagendar_data', sessao.dados);
            return mensagens.agendamento.solicitarData;
        }
        if (entrada === '2') {
            // Alterar horário
            atualizarSessao(de, 'reagendar_horario', sessao.dados);
            return mensagens.agendamento.solicitarHorario;
        }
        if (entrada === '3') {
            // Alterar data e horário
            atualizarSessao(de, 'reagendar_data_completa', sessao.dados);
            return mensagens.agendamento.solicitarData;
        }
        if (entrada === '0') {
            // Cancelar reagendamento
            atualizarSessao(de, 'menu');
            return 'Reagendamento cancelado.\n\n' + mensagens.boasVindas;
        }
    }

    if (sessao.etapa === 'reagendar_data') {
        const agendamento = buscarAgendamento(de);
        if (agendamento) {
            agendamento.data = texto;
            await salvarAgendamento(de, agendamento);
            atualizarSessao(de, 'menu');
            return mensagens.reagendamento.sucesso(agendamento);
        }
    }

    if (sessao.etapa === 'reagendar_horario') {
        const numHorario = parseInt(entrada);
        if (numHorario > 0 && numHorario <= horarios.length) {
            const agendamento = buscarAgendamento(de);
            if (agendamento) {
                agendamento.horario = horarios[numHorario - 1];
                await salvarAgendamento(de, agendamento);
                atualizarSessao(de, 'menu');
                return mensagens.reagendamento.sucesso(agendamento);
            }
        }
        return 'Horário inválido. Digite o número do horário.';
    }

    if (sessao.etapa === 'reagendar_data_completa') {
        atualizarSessao(de, 'reagendar_horario_completo', { novaData: texto });
        return mensagens.agendamento.solicitarHorario;
    }

    if (sessao.etapa === 'reagendar_horario_completo') {
        const numHorario = parseInt(entrada);
        if (numHorario > 0 && numHorario <= horarios.length) {
            const agendamento = buscarAgendamento(de);
            if (agendamento) {
                agendamento.data = sessao.dados.novaData;
                agendamento.horario = horarios[numHorario - 1];
                await salvarAgendamento(de, agendamento);
                atualizarSessao(de, 'menu');
                return mensagens.reagendamento.sucesso(agendamento);
            }
        }
        return 'Horário inválido. Digite o número do horário.';
    }

    return 'Opção não reconhecida.\n\n' + mensagens.boasVindas;
}
