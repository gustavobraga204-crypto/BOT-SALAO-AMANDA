import { servicos, promocoes, horarios } from './dados.js';

export const mensagens = {
    cadastro: {
        solicitarNome: `💅 *BEM-VINDA À AMANDA NAILS DESIGNER!* 💅\n\nPara começar, preciso fazer um cadastro rápido.\n\n👤 Por favor, qual é o seu nome completo?`,
        
        solicitarTelefone: `📱 Agora digite seu telefone com DDD:\n(Ex: 11999999999)`,
        
        sucesso: (nome) => `✅ Cadastro realizado com sucesso!\n\nSeja bem-vinda, ${nome}! 💖`
    },

    boasVindasRetorno: (nome) => `💖 *OLÁ NOVAMENTE, ${nome.toUpperCase()}!* 💖\n\n✨ Que prazer ter você de volta! ✨\n\nComo posso te ajudar hoje?\n\n1️⃣ Fazer agendamento\n2️⃣ Ver serviços e valores\n3️⃣ Ver promoções\n4️⃣ Falar com atendente\n5️⃣ Endereço e horário\n6️⃣ Encerrar atendimento\n7️⃣ Cancelar agendamento\n8️⃣ Reagendar\n\nDigite o número da opção desejada.`,

    boasVindas: `💅 *BEM-VINDA À AMANDA NAILS DESIGNER!* 💅\n\nEscolha uma opção:\n\n1️⃣ Fazer agendamento\n2️⃣ Ver serviços e valores\n3️⃣ Ver promoções\n4️⃣ Falar com atendente\n5️⃣ Endereço e horário\n6️⃣ Encerrar atendimento\n7️⃣ Cancelar agendamento\n8️⃣ Reagendar\n\nDigite o número da opção desejada.`,

    agendamento: {
        solicitarAdicionais: `✨ Deseja adicionar algo?

1️⃣ Francesinha
2️⃣ Pedrarias
3️⃣ Nail art
4️⃣ Esmaltação
5️⃣ Cutilagem

Digite os números separados por vírgula (ex: 1,3)
Digite *0* para pular`,

        solicitarData: '📅 Qual data você prefere? (ex: 15/01/2026)',
        
        solicitarHorario: `🕐 Escolha o horário:

${horarios.map((h, i) => `${i + 1}️⃣ ${h}`).join('\n')}

Digite o número do horário:`,

        sucesso: `✅ *AGENDAMENTO CONFIRMADO!*

Em breve entraremos em contato para confirmar.

Um lembrete será enviado 1 dia antes.

Obrigada pela preferência! 💅✨

Digite *MENU* para retornar ao início.`
    },

    listarServicos: (tipo = 'consulta') => {
        let msg = `💅 *NOSSOS SERVIÇOS*\n\n`;
        servicos.forEach((s, i) => {
            msg += `${i + 1}️⃣ *${s.nome}*\n   ${s.valor}\n\n`;
        });
        
        if (tipo === 'agendamento') {
            msg += 'Digite o número do serviço desejado:';
        } else {
            msg += 'Digite o número para ver detalhes ou *MENU* para voltar.';
        }
        
        return msg;
    },

    listarPromocoes: () => {
        let msg = `🎉 *PROMOÇÕES DO MÊS*\n\n`;
        promocoes.forEach((p, i) => {
            msg += `${i + 1}️⃣ *${p.nome}*\n   ${p.descricao}\n   ${p.valor}\n\n`;
        });
        msg += 'Digite *AGENDAR* ou *MENU* para voltar.';
        return msg;
    },

    transferirAtendente: `👩‍💼 Transferindo para atendente...

Aguarde que em breve alguém irá te atender!

Enquanto isso, digite *MENU* para retornar.`,

    endereco: `📍 *ENDEREÇO E HORÁRIO*

📍 Rua das Flores, 123 - Centro
    São Paulo, SP

🕐 Horário de funcionamento:
Segunda a Sexta: 9h às 19h
Sábado: 9h às 17h
Domingo: Fechado

Digite *MENU* para voltar.`,

    encerrar: `Obrigada pelo contato! 💖

Será um prazer te atender em breve.

Até logo! 👋`,

    cancelamento: {
        confirmar: (agendamento) => `❌ *CANCELAR AGENDAMENTO*

Você tem um agendamento marcado:

💅 Serviço: ${agendamento.servico.nome}
📅 Data: ${agendamento.data}
🕐 Horário: ${agendamento.horario}

⚠️ Deseja realmente cancelar este agendamento?

Digite *SIM* para confirmar ou *NÃO* para manter.`,

        sucesso: `✅ *AGENDAMENTO CANCELADO*

Seu agendamento foi cancelado com sucesso.

Esperamos te ver em breve! 💖

Digite *MENU* para voltar ao menu principal.`,

        erro: `❌ Erro ao cancelar agendamento.

Por favor, tente novamente ou fale com um atendente.

Digite *MENU* para voltar.`,

        mantido: `✅ Agendamento mantido!

Seu agendamento continua confirmado. 💅

Digite *MENU* para voltar ao menu principal.`,

        naoEncontrado: `ℹ️ Você não possui agendamentos ativos.

Para fazer um novo agendamento, digite *1*.

Digite *MENU* para ver todas as opções.`
    },

    reagendamento: {
        opcoes: `🔄 *REAGENDAR ATENDIMENTO*

O que você deseja alterar?

1️⃣ Apenas a data
2️⃣ Apenas o horário
3️⃣ Data e horário
0️⃣ Cancelar reagendamento

Digite o número da opção:`,

        sucesso: (agendamento) => `✅ *REAGENDAMENTO CONFIRMADO!*

Novo agendamento:

💅 Serviço: ${agendamento.servico.nome}
📅 Data: ${agendamento.data}
🕐 Horário: ${agendamento.horario}

Um lembrete será enviado 1 dia antes. 💖

Digite *MENU* para voltar ao menu principal.`,

        naoEncontrado: `ℹ️ Você não possui agendamentos ativos para reagendar.

Para fazer um novo agendamento, digite *1*.

Digite *MENU* para ver todas as opções.`
    }
};
