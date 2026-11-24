// Consultas derivadas das ordens, sem alterar o arquivo de dados.
globalThis.MobiliumDados = (() => {
    const normalizar = (texto) => String(texto ?? '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
    const valor = (ordem) => Number.isFinite(Number(ordem.valor)) ? Number(ordem.valor) : 0;

    function resumirOrdens(ordens) {
        const servicos = new Map();
        for (const ordem of ordens) {
            const nome = String(ordem.servico ?? '').trim() || 'Serviço não informado';
            const chave = normalizar(nome);
            if (!servicos.has(chave)) servicos.set(chave, { nome, quantidade: 0, total: 0 });
            const servico = servicos.get(chave);
            servico.quantidade++;
            servico.total += valor(ordem);
        }
        return {
            quantidade: ordens.length,
            clientes: new Set(ordens.map((ordem) => normalizar(ordem.cliente))).size,
            total: ordens.reduce((soma, ordem) => soma + valor(ordem), 0),
            recentes: [...ordens].sort((a, b) => b.numero - a.numero).slice(0, 5),
            servicos: [...servicos.values()].sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, 'pt-BR')).slice(0, 5),
        };
    }

    function filtrarOrdens(ordens, busca) {
        const termo = normalizar(busca);
        return ordens.filter((ordem) => [ordem.numero, ordem.cliente, ordem.veiculo, ordem.servico].some((campo) => normalizar(campo).includes(termo)));
    }

    return Object.freeze({ resumirOrdens, filtrarOrdens });
})();
