
// renderer.js — a tela. Toda comunicação passa pelo window.api

// Elementos da página
const corpoTabela = document.getElementById('corpo-tabela');
const listaVazia = document.getElementById('lista-vazia');

// Estado da tela
let ordens = [];
let numeroSelecionado = null;

// Desenha as ordens na tabela
function renderizar() {
    corpoTabela.innerHTML = '';
    listaVazia.hidden = ordens.length > 0;

    for (const ordem of ordens) {
        const linha = document.createElement('tr');

        if (ordem.numero === numeroSelecionado) {
            linha.classList.add('selecionada');
        }

        const dados = [
            ordem.numero,
            ordem.cliente,
            ordem.veiculo,
            ordem.servico,
            ordem.valor
        ];

        for (const dado of dados) {
            const coluna = document.createElement('td');
            coluna.textContent = dado;
            linha.appendChild(coluna);
        }

        linha.addEventListener('click', () => {
            numeroSelecionado = ordem.numero;
            renderizar();
        });

        corpoTabela.appendChild(linha);
    }
}

// Carrega as ordens salvas
async function carregarOrdens() {
    ordens = await window.api.listar();
    renderizar();
}

carregarOrdens();
