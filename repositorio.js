//  todo o código de ler e gravar o arquivo JSON
const { app } = require('electron');
const fs = require('fs/promises');
const path = require('path');

// Caminho do arquivo: pasta de dados do app + ordens.json
function caminhoArquivo() {
    return path.join(app.getPath('userData'), 'ordens.json');
}

// Lê as ordens salvas. Na primeira execução o arquivo não existe: devolve lista vazia.
async function carregar() {
    try {
        const conteudo = await fs.readFile(caminhoArquivo(), 'utf-8');
        return JSON.parse(conteudo);
    } catch (erro) {
        if (erro.code === 'ENOENT') {
            return [];
        }
        throw erro;
    }
}


// Grava a lista inteira no arquivo 
async function salvar(ordens) {
    const texto = JSON.stringify(ordens, null, 2);
    await fs.writeFile(caminhoArquivo(), texto, 'utf-8');
}

// Próximo número = maior número existente + 1 
function proximoNumero(ordens) {
    if (ordens.length === 0) {
        return 1;
    }

    const numeros = ordens.map((ordem) => ordem.numero);
    return Math.max(...numeros) + 1;
}

// Cadastra uma nova ordem e grava na hora
async function cadastrar(dados) {
    const ordens = await carregar();

    const novaOrdem = {
        numero: proximoNumero(ordens),
        cliente: dados.cliente,
        veiculo: dados.veiculo,
        servico: dados.servico,
        valor: Number(dados.valor),
    };

    ordens.push(novaOrdem);
    await salvar(ordens);

    return novaOrdem;
}

// Atualiza uma ordem existente (procurada pelo número) e grava na hora
async function editar(ordemEditada) {
    const ordens = await carregar();

    const indice = ordens.findIndex((ordem) => ordem.numero === ordemEditada.numero);
    if (indice === -1) {
        throw new Error(`Ordem nº ${ordemEditada.numero} não encontrada.`);
    }

    ordens[indice] = {
        numero: ordens[indice].numero, // o número nunca muda
        cliente: ordemEditada.cliente,
        veiculo: ordemEditada.veiculo,
        servico: ordemEditada.servico,
        valor: Number(ordemEditada.valor),
    };

    await salvar(ordens);
    return ordens[indice];
}

module.exports = { carregar, cadastrar, editar };
