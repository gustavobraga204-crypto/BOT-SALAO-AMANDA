// === SISTEMA DE AUTENTICAÇÃO ===
let tokenAuth = localStorage.getItem('tokenAuth');

// Verifica autenticação ao carregar página
document.addEventListener('DOMContentLoaded', async () => {
    if (tokenAuth) {
        try {
            const response = await fetch('/api/verificar-auth', {
                headers: { 'Authorization': `Bearer ${tokenAuth}` }
            });
            
            if (response.ok) {
                mostrarPainel();
                return;
            }
        } catch (erro) {
            console.error('Erro ao verificar autenticação:', erro);
        }
    }
    
    mostrarLogin();
});

// Form de login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const btnLogin = e.target.querySelector('.btn-login');
    const loginTexto = document.getElementById('loginTexto');
    const loginSpinner = document.getElementById('loginSpinner');
    const loginErro = document.getElementById('loginErro');
    
    // Desabilita botão
    btnLogin.disabled = true;
    loginTexto.style.display = 'none';
    loginSpinner.style.display = 'block';
    loginErro.classList.remove('show');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            tokenAuth = data.token;
            localStorage.setItem('tokenAuth', tokenAuth);
            mostrarPainel();
        } else {
            loginErro.textContent = '❌ ' + (data.erro || 'Erro ao fazer login');
            loginErro.classList.add('show');
        }
    } catch (erro) {
        console.error('Erro no login:', erro);
        loginErro.textContent = '❌ Erro de conexão. Tente novamente.';
        loginErro.classList.add('show');
    } finally {
        btnLogin.disabled = false;
        loginTexto.style.display = 'block';
        loginSpinner.style.display = 'none';
    }
});

// Botão sair
document.getElementById('btnSair')?.addEventListener('click', () => {
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('tokenAuth');
        tokenAuth = null;
        window.location.reload();
    }
});

function mostrarLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('painelPrincipal').style.display = 'none';
}

function mostrarPainel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('painelPrincipal').style.display = 'block';
    inicializarPainel();
}

// === LÓGICA DO PAINEL ===
function inicializarPainel() {
    // Conecta ao WebSocket após autenticação
    conectarWebSocket();
    
    // Carrega dados iniciais
    carregarAgendamentos();
}

async function carregarAgendamentos() {
    try {
        const response = await fetch('/api/agendamentos', {
            headers: { 'Authorization': `Bearer ${tokenAuth}` }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('tokenAuth');
                window.location.reload();
            }
            throw new Error('Erro ao carregar agendamentos');
        }
        
        todosAgendamentos = await response.json();
        renderizarCalendario();
    } catch (erro) {
        console.error('Erro ao carregar agendamentos:', erro);
    }
}

// Conecta ao WebSocket
function conectarWebSocket() {
    // Socket já está definido globalmente
}

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
    document.getElementById('currentMonthDisplay').textContent = `${meses[mes]} de ${ano}`;
    
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
        const dataFormatada = formatarDataParaBD(data);
        const agendamentosDia = todosAgendamentos.filter(ag => ag.agendamento.data === dataFormatada);
        
        const isHoje = data.getTime() === hoje.getTime();
        const isPast = data < hoje;
        
        let diaHTML = '';
        
        if (isPast) {
            // Dia passado - não clicável
            diaHTML += `<div class="calendar-day past ${isHoje ? 'hoje' : ''}">`;
            diaHTML += `<div class="day-number">${dia}</div>`;
        } else if (agendamentosDia.length > 0) {
            // Dia com agendamentos - clique para ver ou adicionar mais
            diaHTML += `<div class="calendar-day occupied ${isHoje ? 'hoje' : ''}" onclick="abrirDiaParaAgendar('${dataFormatada}')">`;
            diaHTML += `<div class="day-number">${dia}</div>`;
            diaHTML += `<div class="day-content">`;
            agendamentosDia.forEach(ag => {
                diaHTML += `<div class="appointment-item" onclick="event.stopPropagation(); abrirModalCancelamento(${JSON.stringify(ag).replace(/"/g, '&quot;')})">`;
                diaHTML += `<span class="time">${ag.agendamento.horario}</span> `;
                diaHTML += `<span class="name">${ag.nome}</span>`;
                diaHTML += `</div>`;
            });
            diaHTML += `</div>`;
        } else {
            // Dia livre - clique para agendar
            diaHTML += `<div class="calendar-day available ${isHoje ? 'hoje' : ''}" onclick="abrirModalAgendamentoComData('${dataFormatada}')">`;
            diaHTML += `<div class="day-number">${dia}</div>`;
            diaHTML += `<div class="day-label">✨ Clique para agendar</div>`;
        }
        
        diaHTML += `</div>`;
        html += diaHTML;
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
        <div class="mb-3">
            <h5 class="text-primary">${agendamento.nome}</h5>
            <p class="text-muted mb-0"><i class="bi bi-telephone"></i> ${formatarTelefone(agendamento.telefone)}</p>
        </div>
        <div class="row mb-2">
            <div class="col-6">
                <small class="text-muted"><i class="bi bi-calendar"></i> Data:</small>
                <p class="mb-0">${agendamento.agendamento.data}</p>
            </div>
            <div class="col-6">
                <small class="text-muted"><i class="bi bi-clock"></i> Horário:</small>
                <p class="mb-0">${agendamento.agendamento.horario}</p>
            </div>
        </div>
        <div class="card border-primary mb-3">
            <div class="card-body">
                <h6 class="card-title text-primary">${agendamento.agendamento.servico.nome}</h6>
                <p class="card-text small">${agendamento.agendamento.servico.descricao}</p>
                <div class="d-flex justify-content-between">
                    <span class="text-success fw-bold">${agendamento.agendamento.servico.valor}</span>
                    <span class="text-muted"><i class="bi bi-clock"></i> ${agendamento.agendamento.servico.duracao}</span>
                </div>
            </div>
        </div>
        ${agendamento.agendamento.adicionais && agendamento.agendamento.adicionais.length > 0 ? `
            <div class="mb-3">
                <strong>Adicionais:</strong><br>
                ${agendamento.agendamento.adicionais.map(a => `<span class="badge bg-secondary me-1">${a}</span>`).join('')}
            </div>
        ` : ''}
    `;
    
    const modalEl = document.getElementById('modal');
    let modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalEl, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
    }
    
    setTimeout(() => {
        modalInstance.show();
    }, 100);
}

// Modal com opção de cancelamento
function abrirModalCancelamento(agendamento) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="mb-3">
            <h5 class="text-primary">${agendamento.nome}</h5>
            <p class="text-muted mb-0"><i class="bi bi-telephone"></i> ${formatarTelefone(agendamento.telefone)}</p>
        </div>
        <div class="row mb-2">
            <div class="col-6">
                <small class="text-muted"><i class="bi bi-calendar"></i> Data:</small>
                <p class="mb-0">${agendamento.agendamento.data}</p>
            </div>
            <div class="col-6">
                <small class="text-muted"><i class="bi bi-clock"></i> Horário:</small>
                <p class="mb-0">${agendamento.agendamento.horario}</p>
            </div>
        </div>
        <div class="card border-primary mb-3">
            <div class="card-body">
                <h6 class="card-title text-primary">${agendamento.agendamento.servico.nome}</h6>
                <p class="card-text small">${agendamento.agendamento.servico.descricao}</p>
                <div class="d-flex justify-content-between">
                    <span class="text-success fw-bold">${agendamento.agendamento.servico.valor}</span>
                    <span class="text-muted"><i class="bi bi-clock"></i> ${agendamento.agendamento.servico.duracao}</span>
                </div>
            </div>
        </div>
        ${agendamento.agendamento.adicionais && agendamento.agendamento.adicionais.length > 0 ? `
            <div class="mb-3">
                <strong>Adicionais:</strong><br>
                ${agendamento.agendamento.adicionais.map(a => `<span class="badge bg-secondary me-1">${a}</span>`).join('')}
            </div>
        ` : ''}
        <div class="d-grid">
            <button onclick="cancelarAgendamentoPainel('${agendamento.telefone}', '${agendamento.nome}')" class="btn btn-danger">
                <i class="bi bi-x-circle"></i> Cancelar Agendamento
            </button>
        </div>
    `;
    
    const modalEl = document.getElementById('modal');
    let modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalEl, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
    }
    
    setTimeout(() => {
        modalInstance.show();
    }, 100);
}

// Função para cancelar agendamento
async function cancelarAgendamentoPainel(telefone, nome) {
    if (!confirm(`Deseja realmente cancelar o agendamento de ${nome}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/agendamentos/${telefone}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${tokenAuth}`
            }
        });
        
        if (response.ok) {
            const modalElement = bootstrap.Modal.getInstance(document.getElementById('modal'));
            if (modalElement) {
                modalElement.hide();
            }
            alert('✅ Agendamento cancelado com sucesso!');
            // Atualiza a lista
            carregarAgendamentos();
        } else {
            const error = await response.json();
            alert('❌ Erro ao cancelar: ' + (error.erro || 'Tente novamente'));
        }
    } catch (erro) {
        console.error('Erro ao cancelar agendamento:', erro);
        alert('❌ Erro ao cancelar agendamento. Tente novamente.');
    }
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

// Abre modal de agendamento para dias com horários livres
function abrirModalAgendamentoComData(dataStr) {
    abrirModalAgendamento();
    
    // Converte data BR para formato do input (YYYY-MM-DD)
    const [dia, mes, ano] = dataStr.split('/');
    const dataInput = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    
    document.getElementById('dataAgendamento').value = dataInput;
    atualizarHorariosDisponiveis(dataInput);
}

// Abre opções para dia com agendamentos (ver ou adicionar novo)
function abrirDiaParaAgendar(dataStr) {
    const agendamentosDia = todosAgendamentos.filter(ag => ag.agendamento.data === dataStr);
    const horariosOcupados = agendamentosDia.map(ag => ag.agendamento.horario);
    const horariosDisponiveis = HORARIOS.filter(h => !horariosOcupados.includes(h));
    
    if (horariosDisponiveis.length > 0) {
        // Se ainda tem horários livres, abre modal de agendamento
        abrirModalAgendamentoComData(dataStr);
    } else {
        // Se todos ocupados, mostra detalhes
        abrirDiaDetalhado(dataStr);
    }
}

// Navegação de meses
document.getElementById('prevMonth').addEventListener('click', () => {
    mesAtual.setMonth(mesAtual.getMonth() - 1);
    renderizarCalendario();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    mesAtual.setMonth(mesAtual.getMonth() + 1);
    renderizarCalendario();
});

// Modal de novo agendamento
function abrirModalAgendamento() {
    // Popula serviços
    const servicoSelect = document.getElementById('servicoSelect');
    servicoSelect.innerHTML = '<option value="">Selecione um serviço</option>';
    SERVICOS.forEach((servico, index) => {
        servicoSelect.innerHTML += `<option value="${index}">${servico.nome} - ${servico.valor}</option>`;
    });
    
    // Popula adicionais
    const adicionaisContainer = document.getElementById('adicionaisContainer');
    adicionaisContainer.innerHTML = ADICIONAIS.map(adicional => `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" name="adicional" value="${adicional}" id="adicional_${adicional}">
            <label class="form-check-label" for="adicional_${adicional}">
                ${adicional}
            </label>
        </div>
    `).join('');
    
    // Popula horários inicialmente
    atualizarHorariosDisponiveis();
    
    // Define data mínima como hoje
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataAgendamento').min = hoje;
    
    // Abre o modal Bootstrap
    const modalEl = document.getElementById('modalAgendamento');
    let modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalEl, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
    }
    
    // Garantir que o modal apareça corretamente
    setTimeout(() => {
        modalInstance.show();
        
        // Forçar foco no modal após abrir
        setTimeout(() => {
            const firstInput = modalEl.querySelector('input:not([type="checkbox"]), select');
            if (firstInput) {
                firstInput.focus();
            }
        }, 300);
    }, 100);
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
    const modalElement = bootstrap.Modal.getInstance(document.getElementById('modalAgendamento'));
    if (modalElement) {
        modalElement.hide();
    }
    document.getElementById('formAgendamento').reset();
}

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
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAuth}`
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
    if (!tokenAuth) return;
    
    fetch('/api/agendamentos', {
        headers: { 'Authorization': `Bearer ${tokenAuth}` }
    })
        .then(res => {
            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('tokenAuth');
                    window.location.reload();
                }
                throw new Error('Erro na requisição');
            }
            return res.json();
        })
        .then(agendamentos => {
            todosAgendamentos = agendamentos;
            renderizarCalendario();
        })
        .catch(err => console.error('Erro ao atualizar:', err));
}, 30000);
