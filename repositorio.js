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

module.exports = { carregar };