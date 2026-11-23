
// renderer.js — a tela. Toda comunicação passa pelo window.api

// Elementos da página
const corpoTabela = document.getElementById('corpo-tabela');
const listaVazia = document.getElementById('lista-vazia');
const formulario = document.getElementById('form-ordem');
const campoCliente = document.getElementById('campo-cliente');
const campoVeiculo = document.getElementById('campo-veiculo');
const campoServico = document.getElementById('campo-servico');
const campoValor = document.getElementById('campo-valor');


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

// Mostra um aviso quando o campo está inválido
function avisar(campo, mensagem) {
    campo.setCustomValidity(mensagem);
    campo.reportValidity();
    campo.addEventListener('input', () => campo.setCustomValidity(''), { once: true });
}

// Lê os dados do formulário
function lerFormulario() {
    return {
        cliente: campoCliente.value.trim(),
        veiculo: campoVeiculo.value.trim(),
        servico: campoServico.value.trim(),
        valor: campoValor.value.trim().replace(',', '.')
    };
}

// Verifica se os dados são válidos
function validar(dados) {
    if (!dados.cliente) {
        avisar(campoCliente, 'Preencha o cliente.');
        return false;
    }

    if (!dados.veiculo) {
        avisar(campoVeiculo, 'Preencha o veículo.');
        return false;
    }

    if (!dados.servico) {
        avisar(campoServico, 'Preencha o serviço.');
        return false;
    }

    if (dados.valor === '' || isNaN(Number(dados.valor))) {
        avisar(campoValor, 'Informe um valor válido.');
        return false;
    }

    return true;
}

// Cadastra uma nova ordem de serviço
async function onCadastrar(evento) {
    evento.preventDefault();

    const dados = lerFormulario();

    if (!validar(dados)) {
        return;
    }

    await window.api.cadastrar(dados);

    formulario.reset();
    await carregarOrdens();
}

formulario.addEventListener('submit', onCadastrar);

carregarOrdens();
