
// renderer.js — a tela. Toda comunicação passa pelo window.api

// Elementos da página
const corpoTabela = document.getElementById('corpo-tabela');
const listaVazia = document.getElementById('lista-vazia');
const formulario = document.getElementById('form-ordem');
const campoCliente = document.getElementById('campo-cliente');
const campoVeiculo = document.getElementById('campo-veiculo');
const campoServico = document.getElementById('campo-servico');
const campoValor = document.getElementById('campo-valor');
const tituloFormulario = document.getElementById('titulo-formulario');
const botaoSalvar = document.getElementById('botao-salvar');
const botaoEditar = document.getElementById('botao-editar');
const botaoExcluir = document.getElementById('botao-excluir');



// Estado da tela
let ordens = [];
let numeroSelecionado = null;
let numeroEmEdicao = null; // número da ordem que está sendo editada

// Formata um número como moeda brasileira
const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatarMoeda(valor) {
    return formatoMoeda.format(valor);
}

// Máscara do campo Valor: vazio, ou até 9 dígitos e opcionalmente vírgula ou ponto com até 2 casas decimais
const regraValor = /^$|^\d{1,9}([,.]\d{0,2})?$/;

campoValor.addEventListener('beforeinput', (evento) => {
    if (evento.data === null) return; // apagar com Backspace/Delete é sempre permitido

    // Monta como o texto ficaria se a tecla fosse aceita
    const inicio = campoValor.selectionStart;
    const fim = campoValor.selectionEnd;
    const textoNovo = campoValor.value.slice(0, inicio) + evento.data + campoValor.value.slice(fim);

    // Se não seguir a regra, cancela a digitação
    if (!regraValor.test(textoNovo)) {
        evento.preventDefault();
    }
});
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
            formatarMoeda(ordem.valor)
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

    // Editar só fica disponível quando há uma linha selecionada
botaoEditar.disabled = numeroSelecionado === null;
botaoExcluir.disabled = numeroSelecionado === null;

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


// Volta o formulário ao modo de cadastro
function limparFormulario() {
    formulario.reset();
    numeroEmEdicao = null;
    numeroSelecionado = null;
    tituloFormulario.textContent = 'Nova ordem de serviço';
    botaoSalvar.textContent = 'Cadastrar';
    renderizar();
}

// Preenche o formulário com a ordem selecionada
function onEditar() {
    const ordem = ordens.find((o) => o.numero === numeroSelecionado);
    if (!ordem) return;

    numeroEmEdicao = ordem.numero;
    campoCliente.value = ordem.cliente;
    campoVeiculo.value = ordem.veiculo;
    campoServico.value = ordem.servico;
    campoValor.value = String(ordem.valor).replace('.', ',');

    tituloFormulario.textContent = `Editando ordem nº ${ordem.numero}`;
    botaoSalvar.textContent = 'Salvar';
    campoCliente.focus();
}

// Cadastra ou salva a edição
async function onSalvar(evento) {
    evento.preventDefault();

    const dados = lerFormulario();
    if (!validar(dados)) return;

    if (numeroEmEdicao === null) {
        await window.api.cadastrar(dados);
    } else {
        await window.api.editar({ numero: numeroEmEdicao, ...dados });
    }

    limparFormulario();
    await carregarOrdens();
}

formulario.addEventListener('submit', onSalvar);
botaoEditar.addEventListener('click', onEditar);

// Botão Excluir: pede confirmação no diálogo nativo e, se confirmar, exclui
async function onExcluir() {
    if (numeroSelecionado === null) return;

    const excluiu = await window.api.excluir(numeroSelecionado);
    if (!excluiu) return; // clicou em "Cancelar": nada muda

    limparFormulario();
    await carregarOrdens();
}

botaoExcluir.addEventListener('click', onExcluir);

// Ctrl+N (menu Arquivo > Nova ordem): volta para "Nova ordem" e foca no Cliente
window.api.aoNovaOrdem(() => {
    limparFormulario();
    campoCliente.focus();
});

carregarOrdens();
