// Conecta ao WebSocket
const socket = io();

let todosAgendamentos = [];
let mesAtual = new Date();

// Horários de funcionamento
const HORARIOS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00'
];

// Serviços disponíveis
const SERVICOS = [
    {
        nome: 'Alongamento Fibra',
        descricao: 'Alongamento em fibra de vidro, natural e resistente',
        valor: 'R$ 150,00',
        duracao: '2h'
    },
    {
        nome: 'Alongamento Gel',
        descricao: 'Alongamento em gel, acabamento perfeito',
        valor: 'R$ 180,00',
        duracao: '2h30'
    },
    {
        nome: 'Manutenção',
        descricao: 'Manutenção de alongamento (15-20 dias)',
        valor: 'R$ 80,00',
        duracao: '1h30'
    },
    {
        nome: 'Esmaltação em Gel',
        descricao: 'Esmaltação com gel, longa duração',
        valor: 'R$ 60,00',
        duracao: '1h'
    },
    {
        nome: 'Manicure Completa',
        descricao: 'Manicure com cutilagem e esmaltação',
        valor: 'R$ 40,00',
        duracao: '45min'
    }
];

const ADICIONAIS = [
    'Cutilagem',
    'Nail Art',
    'Pedrarias',
    'Francesinha',
    'Ombré'
];

// Status de conexão
socket.on('connect', () => {
    atualizarStatus(true);
});

socket.on('disconnect', () => {
    atualizarStatus(false);
});

// Recebe atualizações de agendamentos
socket.on('agendamentos', (agendamentos) => {
    todosAgendamentos = agendamentos;
    renderizarCalendario();
    atualizarEstatisticas();
});

function atualizarStatus(conectado) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (conectado) {
        statusDot.classList.add('connected');
        statusText.textContent = 'Online';
    } else {
        statusDot.classList.remove('connected');
        statusText.textContent = 'Desconectado';
    }
}

function renderizarCalendario() {
    const container = document.querySelector('.calendar-container');
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    
    // Atualiza display do mês
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('currentMonthDisplay').textContent = `${meses[mes]} ${ano}`;
    
    // Primeiro e último dia do mês
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    // Dia da semana que começa o mês (0 = domingo)
    const diaSemanaInicio = primeiroDia.getDay();
    
    // Dias do mês anterior para preencher
    const mesAnterior = new Date(ano, mes, 0);
    const diasMesAnterior = mesAnterior.getDate();
    
    // Cria estrutura do calendário
    let html = '<div class="calendar-grid">';
    
    // Cabeçalho dos dias da semana
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    diasSemana.forEach(dia => {
        html += `<div class="calendar-day-header">${dia}</div>`;
    });
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Dias do mês anterior
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
        const dia = diasMesAnterior - i;
        html += `<div class="calendar-day outro-mes"><div class="day-number">${dia}</div></div>`;
    }
    
    // Dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const data = new Date(ano, mes, dia);
        data.setHours(0, 0, 0, 0);
        const dataStr = formatarDataParaBD(data);
        const agendamentosDia = todosAgendamentos.filter(ag => ag.agendamento.data === dataStr);
        
        const isHoje = data.getTime() === hoje.getTime();
        
        html += `
            <div class="calendar-day ${isHoje ? 'hoje' : ''}" onclick="abrirDiaDetalhado('${dataStr}')">
                <div class="day-number">${dia}</div>
                <div class="day-agendamentos">
                    ${agendamentosDia.slice(0, 3).map(ag => `
                        <div class="agendamento-item" onclick="event.stopPropagation(); abrirModal(${JSON.stringify(ag).replace(/"/g, '&quot;')})">
                            <div class="agendamento-horario">${ag.agendamento.horario}</div>
                            <div class="agendamento-cliente">${ag.nome}</div>
                        </div>
                    `).join('')}
                </div>
                ${agendamentosDia.length > 0 ? `
                    <div class="day-count has-agendamentos">
                        ${agendamentosDia.length} agendamento${agendamentosDia.length > 1 ? 's' : ''}
                    </div>
                ` : '<div class="day-count">Sem agendamentos</div>'}
            </div>
        `;
    }
    
    // Dias do próximo mês para completar a grade
    const totalCelulas = diaSemanaInicio + ultimoDia.getDate();
    const celulasRestantes = totalCelulas % 7 === 0 ? 0 : 7 - (totalCelulas % 7);
    for (let dia = 1; dia <= celulasRestantes; dia++) {
        html += `<div class="calendar-day outro-mes"><div class="day-number">${dia}</div></div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function formatarDataParaBD(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function formatarTelefone(tel) {
    const numero = tel.replace(/\D/g, '');
    if (numero.length === 13) {
        return `+${numero.slice(0, 2)} (${numero.slice(2, 4)}) ${numero.slice(4, 9)}-${numero.slice(9)}`;
    }
    return tel;
}

function parseData(dataStr) {
    const [dia, mes, ano] = dataStr.split('/').map(Number);
    return new Date(ano, mes - 1, dia);
}

function atualizarEstatisticas() {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    primeiroDia.setHours(0, 0, 0, 0);
    ultimoDia.setHours(23, 59, 59, 999);
    
    const agendamentosMes = todosAgendamentos.filter(ag => {
        const dataAg = parseData(ag.agendamento.data);
        return dataAg >= primeiroDia && dataAg <= ultimoDia;
    });
    
    document.getElementById('totalAgendamentos').textContent = agendamentosMes.length;
    
    // Calcula horários livres (dias úteis do mês * horários por dia)
    const diasUteis = ultimoDia.getDate();
    const totalHorarios = diasUteis * HORARIOS.length;
    const horariosOcupados = agendamentosMes.length;
    const horariosLivres = totalHorarios - horariosOcupados;
    document.getElementById('horariosLivres').textContent = horariosLivres;
}

// Abrir detalhes de um dia específico
function abrirDiaDetalhado(dataStr) {
    const agendamentosDia = todosAgendamentos.filter(ag => ag.agendamento.data === dataStr);
    
    if (agendamentosDia.length === 0) {
        return;
    }
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    const [dia, mes, ano] = dataStr.split('/');
    const data = new Date(ano, mes - 1, dia);
    const diaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][data.getDay()];
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-cliente-nome">${diaSemana}, ${dataStr}</div>
            <div class="modal-telefone">${agendamentosDia.length} agendamento${agendamentosDia.length > 1 ? 's' : ''}</div>
        </div>
        <div class="modal-body-content">
            ${agendamentosDia.map(ag => `
                <div class="modal-servico-box" style="cursor: pointer; margin-bottom: 15px;" onclick="abrirModal(${JSON.stringify(ag).replace(/"/g, '&quot;')})">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <div style="font-weight: bold; color: var(--primary); font-size: 1.1em;">${ag.agendamento.horario}</div>
                            <div style="color: var(--text); font-weight: 600; margin-top: 5px;">${ag.nome}</div>
                        </div>
                    </div>
                    <div style="color: var(--text-light); font-size: 0.9em; margin-bottom: 8px;">${ag.agendamento.servico.nome}</div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--success); font-weight: bold;">${ag.agendamento.servico.valor}</span>
                        <span style="color: var(--text-light);">⏱️ ${ag.agendamento.servico.duracao}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Modal de detalhes de agendamento
function abrirModal(agendamento) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-cliente-nome">${agendamento.nome}</div>
            <div class="modal-telefone">📱 ${formatarTelefone(agendamento.telefone)}</div>
        </div>
        <div class="modal-body-content">
            <div class="modal-info-row">
                <span class="modal-label">📅 Data:</span>
                <span class="modal-value">${agendamento.agendamento.data}</span>
            </div>
            <div class="modal-info-row">
                <span class="modal-label">🕐 Horário:</span>
                <span class="modal-value">${agendamento.agendamento.horario}</span>
            </div>
            <div class="modal-servico-box">
                <div class="modal-servico-nome">${agendamento.agendamento.servico.nome}</div>
                <div class="modal-servico-desc">${agendamento.agendamento.servico.descricao}</div>
                <div class="modal-servico-details">
                    <span class="modal-valor">${agendamento.agendamento.servico.valor}</span>
                    <span class="modal-duracao">⏱️ ${agendamento.agendamento.servico.duracao}</span>
                </div>
            </div>
            ${agendamento.agendamento.adicionais && agendamento.agendamento.adicionais.length > 0 ? `
                <div style="margin-top: 15px;">
                    <strong>Adicionais:</strong><br>
                    ${agendamento.agendamento.adicionais.map(a => `<span class="adicional-tag">${a}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Fechar modal
document.querySelector('.close').onclick = function() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Navegação de meses
document.getElementById('prevMonth').addEventListener('click', () => {
    mesAtual.setMonth(mesAtual.getMonth() - 1);
    renderizarCalendario();
    atualizarEstatisticas();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    mesAtual.setMonth(mesAtual.getMonth() + 1);
    renderizarCalendario();
    atualizarEstatisticas();
});

// Modal de novo agendamento
function abrirModalAgendamento() {
    const modal = document.getElementById('modalAgendamento');
    
    // Popula serviços
    const servicoSelect = document.getElementById('servicoSelect');
    servicoSelect.innerHTML = '<option value="">Selecione um serviço</option>';
    SERVICOS.forEach((servico, index) => {
        servicoSelect.innerHTML += `<option value="${index}">${servico.nome} - ${servico.valor}</option>`;
    });
    
    // Popula adicionais
    const adicionaisContainer = document.getElementById('adicionaisContainer');
    adicionaisContainer.innerHTML = ADICIONAIS.map(adicional => `
        <label>
            <input type="checkbox" name="adicional" value="${adicional}">
            <span>${adicional}</span>
        </label>
    `).join('');
    
    // Popula horários inicialmente
    atualizarHorariosDisponiveis();
    
    // Define data mínima como hoje
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataAgendamento').min = hoje;
    
    modal.style.display = 'block';
}

// Atualiza horários disponíveis baseado na data selecionada
async function atualizarHorariosDisponiveis(dataSelecionada = null) {
    const horarioSelect = document.getElementById('horarioSelect');
    
    if (!dataSelecionada) {
        // Se não tem data, mostra todos os horários
        horarioSelect.innerHTML = '<option value="">Selecione uma data primeiro</option>';
        HORARIOS.forEach(horario => {
            horarioSelect.innerHTML += `<option value="${horario}">${horario}</option>`;
        });
        return;
    }
    
    // Formata data para DD/MM/YYYY
    const [ano, mes, dia] = dataSelecionada.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;
    
    // Busca agendamentos do dia
    const agendamentosDia = todosAgendamentos.filter(ag => ag.agendamento.data === dataFormatada);
    const horariosOcupados = agendamentosDia.map(ag => ag.agendamento.horario);
    
    // Filtra horários disponíveis
    const horariosDisponiveis = HORARIOS.filter(h => !horariosOcupados.includes(h));
    
    // Atualiza o select
    horarioSelect.innerHTML = horariosDisponiveis.length > 0 
        ? '<option value="">Selecione um horário</option>'
        : '<option value="">Sem horários disponíveis</option>';
    
    horariosDisponiveis.forEach(horario => {
        horarioSelect.innerHTML += `<option value="${horario}">${horario}</option>`;
    });
    
    // Mostra mensagem se não há horários
    if (horariosDisponiveis.length === 0) {
        horarioSelect.innerHTML += '<option value="" disabled>❌ Todos os horários estão ocupados</option>';
    }
}

// Evento de mudança de data
document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('dataAgendamento');
    if (dataInput) {
        dataInput.addEventListener('change', (e) => {
            atualizarHorariosDisponiveis(e.target.value);
        });
    }
});

function fecharModalAgendamento() {
    document.getElementById('modalAgendamento').style.display = 'none';
    document.getElementById('formAgendamento').reset();
}

// Evento do botão novo agendamento
document.getElementById('novoAgendamento').addEventListener('click', abrirModalAgendamento);

// Fechar modal de agendamento
document.querySelector('.close-agendamento').onclick = fecharModalAgendamento;

// Submeter formulário
document.getElementById('formAgendamento').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('clienteNome').value;
    const telefone = document.getElementById('clienteTelefone').value;
    const servicoIndex = document.getElementById('servicoSelect').value;
    const data = document.getElementById('dataAgendamento').value;
    const horario = document.getElementById('horarioSelect').value;
    
    // Pega adicionais selecionados
    const adicionaisSelecionados = Array.from(document.querySelectorAll('input[name="adicional"]:checked'))
        .map(cb => cb.value);
    
    // Formata data para DD/MM/YYYY
    const [ano, mes, dia] = data.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;
    
    // Dados do agendamento
    const agendamento = {
        nome,
        telefone,
        servico: SERVICOS[servicoIndex],
        adicionais: adicionaisSelecionados,
        data: dataFormatada,
        horario
    };
    
    try {
        const response = await fetch('/api/agendamentos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(agendamento)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('✅ Agendamento criado com sucesso!');
            fecharModalAgendamento();
        } else {
            alert('❌ Erro: ' + result.erro);
        }
    } catch (erro) {
        console.error('Erro ao criar agendamento:', erro);
        alert('❌ Erro ao criar agendamento. Tente novamente.');
    }
});

// Atualização automática a cada 30 segundos
setInterval(() => {
    fetch('/api/agendamentos')
        .then(res => res.json())
        .then(agendamentos => {
            todosAgendamentos = agendamentos;
            renderizarCalendario();
            atualizarEstatisticas();
        })
        .catch(err => console.error('Erro ao atualizar:', err));
}, 30000);
