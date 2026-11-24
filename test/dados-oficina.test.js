const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const contexto = vm.createContext({ Intl });
vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/dados-oficina.js'), 'utf8'), contexto);
const dados = contexto.MobiliumDados;
const simples = (resultado) => JSON.parse(JSON.stringify(resultado));
const ordens = [
    { numero: 8, cliente: 'João Silva', veiculo: 'Gol 2015', servico: 'Troca de óleo', valor: 150 },
    { numero: 2, cliente: ' Maria Souza ', veiculo: 'Onix 2020', servico: 'Alinhamento', valor: '120.50' },
    { numero: 11, cliente: ' JOAO SILVA ', veiculo: 'Polo 2019', servico: 'troca de oleo', valor: 220 },
    { numero: 5, cliente: 'Maria Souza', veiculo: 'onix 2020', servico: 'Revisão', valor: 400 },
];

test('uma oficina sem ordens tem resumo e consultas vazios', () => {
    assert.deepEqual(simples(dados.resumirOrdens([])), { quantidade: 0, clientes: 0, total: 0, recentes: [], servicos: [] });
    assert.deepEqual(simples(dados.filtrarOrdens([], '')), []);
});

test('resumo conta clientes e agrupa serviços sem alterar as ordens originais', () => {
    const antes = JSON.stringify(ordens);
    const resumo = simples(dados.resumirOrdens(ordens));
    assert.equal(resumo.quantidade, 4);
    assert.equal(resumo.clientes, 2);
    assert.equal(resumo.total, 890.5);
    assert.deepEqual(resumo.recentes.map((ordem) => ordem.numero), [11, 8, 5, 2]);
    assert.equal(resumo.servicos[0].quantidade, 2);
    assert.equal(resumo.servicos[0].total, 370);
    assert.equal(JSON.stringify(ordens), antes);
});

test('últimas ordens respeitam a numeração e o limite de cinco, mesmo após exclusões', () => {
    const massa = [2, 30, 5, 7, 11, 6, 19].map((numero) => ({ numero, cliente: 'Maria', servico: 'Revisão', valor: 1 }));
    assert.deepEqual(simples(dados.resumirOrdens(massa).recentes.map((ordem) => ordem.numero)), [30, 19, 11, 7, 6]);
});

test('busca aceita acentos, maiúsculas, veículo, serviço e número; limpar restaura a lista', () => {
    assert.deepEqual(simples(dados.filtrarOrdens(ordens, 'joao').map((ordem) => ordem.numero)), [8, 11]);
    assert.equal(dados.filtrarOrdens(ordens, 'ONIX').length, 2);
    assert.equal(dados.filtrarOrdens(ordens, 'revisao').length, 1);
    assert.equal(dados.filtrarOrdens(ordens, '11').length, 1);
    assert.equal(dados.filtrarOrdens(ordens, 'inexistente').length, 0);
    assert.equal(dados.filtrarOrdens(ordens, '').length, 4);
});
