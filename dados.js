export const servicos = [
    {
        nome: 'Baby Boomer - Decoração',
        descricao: 'Técnica de decoração sofisticada com degradê',
        valor: 'a partir de R$ 50,00',
        duracao: '1h30'
    },
    {
        nome: 'Banho de Gel',
        descricao: 'Fortalecimento e brilho intenso para as unhas',
        valor: 'a partir de R$ 130,00',
        duracao: '2h'
    },
    {
        nome: 'Blindagem',
        descricao: 'Proteção e fortalecimento das unhas',
        valor: 'a partir de R$ 70,00',
        duracao: '1h30'
    },
    {
        nome: 'Esmaltação em Gel (Mão)',
        descricao: 'Esmaltação com gel de longa duração para as mãos',
        valor: 'a partir de R$ 60,00',
        duracao: '1h30'
    },
    {
        nome: 'Esmaltação em Gel (Pé)',
        descricao: 'Esmaltação com gel de longa duração para os pés',
        valor: 'a partir de R$ 70,00',
        duracao: '1h30'
    },
    {
        nome: 'Fibra de Vidro',
        descricao: 'Alongamento em fibra de vidro, natural e resistente',
        valor: 'a partir de R$ 180,00',
        duracao: '2h30'
    },
    {
        nome: 'Manicure',
        descricao: 'Manicure completa com cutilagem e esmaltação',
        valor: 'a partir de R$ 30,00',
        duracao: '40min'
    },
    {
        nome: 'Manicure e Pedicure',
        descricao: 'Combo completo de manicure e pedicure',
        valor: 'a partir de R$ 70,00',
        duracao: '1h30'
    },
    {
        nome: 'Manutenção Fibra (15 a 20 dias)',
        descricao: 'Manutenção de fibra de vidro até 20 dias',
        valor: 'a partir de R$ 130,00',
        duracao: '1h30'
    },
    {
        nome: 'Manutenção Fibra (21 a 30 dias)',
        descricao: 'Manutenção de fibra de vidro entre 21 e 30 dias',
        valor: 'a partir de R$ 160,00',
        duracao: '1h30'
    },
    {
        nome: 'Nail Art Mão Toda',
        descricao: 'Decoração artística completa em todas as unhas',
        valor: 'a partir de R$ 130,00',
        duracao: '1h'
    },
    {
        nome: 'Pedicure',
        descricao: 'Pedicure completa com cutilagem e esmaltação',
        valor: 'a partir de R$ 40,00',
        duracao: '1h'
    },
    {
        nome: 'Remoção',
        descricao: 'Remoção de esmaltação em gel ou fibra',
        valor: 'a partir de R$ 40,00',
        duracao: '25min'
    },
    {
        nome: 'Reparo',
        descricao: 'Reparo de unhas quebradas ou danificadas',
        valor: 'a partir de R$ 15,00',
        duracao: '15min'
    }
];

export const promocoes = [
    {
        nome: 'Pacote Noiva',
        descricao: 'Alongamento + Nail Art + Pedrarias',
        valor: 'R$ 250,00 (economia de R$ 80)',
        validade: '31/01/2026'
    },
    {
        nome: 'Combo Mãos e Pés',
        descricao: 'Manicure + Pedicure completas',
        valor: 'R$ 70,00 (economia de R$ 20)',
        validade: '31/01/2026'
    },
    {
        nome: 'Cliente Nova',
        descricao: 'Primeira vez na Amanda Nails Designer? Ganhe 20% OFF',
        valor: 'Desconto de 20% em qualquer serviço',
        validade: '31/01/2026'
    }
];

export const horarios = [
    '09:00',
    '10:30',
    '12:00',
    '14:00',
    '15:30',
    '17:00',
    '18:30'
];

// Função para converter duração em minutos
export function duracaoEmMinutos(duracao) {
    // Exemplos: '1h30', '2h', '40min', '25min', '15min'
    const match = duracao.match(/(\d+)h(?:(\d+))?|(\d+)min/);
    if (!match) return 90; // Default 1h30
    
    if (match[3]) {
        // Apenas minutos (ex: '40min')
        return parseInt(match[3]);
    }
    
    const horas = parseInt(match[1]) || 0;
    const minutos = parseInt(match[2]) || 0;
    return (horas * 60) + minutos;
}

// Função para adicionar minutos a um horário
export function adicionarMinutos(horario, minutos) {
    const [h, m] = horario.split(':').map(Number);
    const data = new Date(2000, 0, 1, h, m);
    data.setMinutes(data.getMinutes() + minutos);
    return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}

// Função para calcular todos os horários bloqueados por um serviço
export function calcularHorariosBloqueados(horarioInicio, duracao) {
    const durMinutos = duracaoEmMinutos(duracao);
    const bloqueados = [horarioInicio];
    
    // Cada slot tem 1h30 (90 minutos)
    const intervaloSlot = 90;
    let minutosRestantes = durMinutos - intervaloSlot;
    let proximoHorario = horarioInicio;
    
    // Bloqueia os próximos slots necessários
    while (minutosRestantes > 0) {
        proximoHorario = adicionarMinutos(proximoHorario, intervaloSlot);
        if (horarios.includes(proximoHorario)) {
            bloqueados.push(proximoHorario);
        }
        minutosRestantes -= intervaloSlot;
    }
    
    return bloqueados;
}

// Função para verificar se um horário e sua duração estão livres
export function horarioEDuracaoDisponiveis(horarioInicio, duracao, horariosOcupados) {
    const horariosBloqueados = calcularHorariosBloqueados(horarioInicio, duracao);
    return !horariosBloqueados.some(h => horariosOcupados.includes(h));
}
