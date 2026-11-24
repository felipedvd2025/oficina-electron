// A tela usa somente a API exposta pelo preload. As consultas são derivadas das ordens.
const $ = (id) => document.getElementById(id);
const { resumirOrdens, filtrarOrdens } = MobiliumDados;
const corpoTabela = $('corpo-tabela');
const formulario = $('form-ordem');
const campoCliente = $('campo-cliente');
const campoVeiculo = $('campo-veiculo');
const campoServico = $('campo-servico');
const campoValor = $('campo-valor');
const campos = [campoCliente, campoVeiculo, campoServico, campoValor];
const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatoNumero = new Intl.NumberFormat('pt-BR');
let ordens = [];
let numeroSelecionado = null;
let numeroEmEdicao = null;
let ocupado = false;
let dadosCarregados = false;

function elemento(tag, texto, classe) {
    const no = document.createElement(tag);
    if (texto !== undefined) no.textContent = String(texto);
    if (classe) no.className = classe;
    return no;
}
function celula(linha, texto, classe) {
    const no = elemento('td', texto, classe);
    linha.appendChild(no);
    return no;
}
function quantidade(numero, singular, plural) {
    return formatoNumero.format(numero) + ' ' + (numero === 1 ? singular : plural);
}
function mensagem(texto) {
    $('mensagem').textContent = texto;
    $('mensagem').hidden = !texto;
}
function mostrarErro(texto, recarregar = false) {
    $('erro-texto').textContent = texto;
    $('erro').hidden = !texto;
    $('tentar-carregar').hidden = !recarregar;
}
function atualizarBotoes() {
    $('botao-salvar').disabled = ocupado || !dadosCarregados;
    $('nova-ordem').disabled = ocupado || !dadosCarregados;
    $('botao-editar').disabled = ocupado || numeroSelecionado === null;
    $('botao-excluir').disabled = ocupado || numeroSelecionado === null;
    document.querySelectorAll('[data-nova-ordem]').forEach((botao) => { botao.disabled = ocupado || !dadosCarregados; });
}

function mostrarTela(rota, focar = true) {
    const destino = ['visao-geral', 'ordens'].includes(rota) ? rota : 'visao-geral';
    document.querySelectorAll('.tela').forEach((tela) => { tela.hidden = tela.id !== 'tela-' + destino; });
    document.querySelectorAll('[data-rota]').forEach((link) => {
        if (link.dataset.rota === destino) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
    document.title = ({ 'visao-geral': 'Visão geral', ordens: 'Ordens de serviço' })[destino] + ' | Mobilium';
    if (focar) $('titulo-' + destino).focus();
}
function navegar(rota, focar = true) {
    if (location.hash !== '#' + rota) history.pushState(null, '', '#' + rota);
    mostrarTela(rota, focar);
}
document.querySelectorAll('[data-rota], .marca').forEach((link) => {
    link.addEventListener('click', (evento) => {
        evento.preventDefault();
        navegar(link.getAttribute('href').slice(1));
    });
});
window.addEventListener('hashchange', () => {
    if (location.hash === '#conteudo') return;
    mostrarTela(location.hash.slice(1));
});

function botaoEditarOrdem(ordem) {
    const botao = elemento('button', 'Editar', 'botao-texto');
    botao.type = 'button';
    botao.setAttribute('aria-label', 'Editar ordem nº ' + ordem.numero);
    botao.addEventListener('click', () => abrirEdicao(ordem.numero));
    return botao;
}
function renderizarResumo() {
    const resumo = resumirOrdens(ordens);
    $('resumo-ordens').textContent = formatoNumero.format(resumo.quantidade);
    $('resumo-clientes').textContent = formatoNumero.format(resumo.clientes);
    $('resumo-valor').textContent = formatoMoeda.format(resumo.total);
    $('resumo-vazio').hidden = resumo.quantidade > 0;
    $('recentes-tabela').hidden = resumo.quantidade === 0;
    $('servicos-vazio').hidden = resumo.servicos.length > 0;
    $('ordens-recentes').replaceChildren();
    for (const ordem of resumo.recentes) {
        const linha = elemento('tr');
        celula(linha, ordem.numero);
        const cliente = celula(linha);
        cliente.append(elemento('strong', ordem.cliente), elemento('span', ordem.veiculo, 'texto-apoio'));
        celula(linha, formatoMoeda.format(ordem.valor), 'valor');
        celula(linha).appendChild(botaoEditarOrdem(ordem));
        $('ordens-recentes').appendChild(linha);
    }
    $('resumo-servicos').replaceChildren();
    for (const servico of resumo.servicos) {
        const item = elemento('li');
        const detalhes = elemento('div', undefined, 'servico-detalhe');
        detalhes.append(elemento('span', quantidade(servico.quantidade, 'ordem', 'ordens')), elemento('span', formatoMoeda.format(servico.total)));
        item.append(elemento('span', servico.nome, 'servico-nome'), detalhes);
        $('resumo-servicos').appendChild(item);
    }
}

function renderizarOrdens() {
    const visiveis = filtrarOrdens(ordens, $('busca-ordens').value);
    corpoTabela.replaceChildren();
    for (const ordem of visiveis) {
        const linha = elemento('tr');
        linha.tabIndex = 0;
        linha.setAttribute('aria-selected', String(ordem.numero === numeroSelecionado));
        if (ordem.numero === numeroSelecionado) linha.classList.add('selecionada');
        const dados = [ordem.numero, ordem.cliente, ordem.veiculo, ordem.servico, formatoMoeda.format(ordem.valor)];
        dados.forEach((dado, indice) => celula(linha, dado, indice === 4 ? 'valor' : undefined));
        function selecionar() {
            numeroSelecionado = ordem.numero;
            renderizarOrdens();
            Array.from(corpoTabela.rows).find((row) => row.getAttribute('aria-selected') === 'true')?.focus({ preventScroll: true });
        }
        linha.addEventListener('click', selecionar);
        linha.addEventListener('keydown', (evento) => {
            if (evento.key === 'Enter' || evento.key === ' ') { evento.preventDefault(); selecionar(); }
        });
        corpoTabela.appendChild(linha);
    }
    $('contador-ordens').textContent = quantidade(ordens.length, 'ordem', 'ordens');
    $('lista-vazia').hidden = visiveis.length > 0;
    $('lista-vazia').textContent = ordens.length === 0 ? 'Nenhuma ordem cadastrada.' : 'Nenhuma ordem encontrada. Tente outro termo de busca.';
    $('orientacao-selecao').textContent = numeroSelecionado === null ? 'Selecione uma ordem na tabela para editar ou excluir.' : 'Ordem nº ' + numeroSelecionado + ' selecionada.';
    atualizarBotoes();
}

function renderizar() {
    renderizarOrdens();
    renderizarResumo();
}
async function carregarOrdens() {
    ocupado = true;
    $('conteudo').setAttribute('aria-busy', 'true');
    $('carregando').hidden = false;
    mostrarErro('');
    atualizarBotoes();
    try {
        ordens = await window.api.listar();
        dadosCarregados = true;
        if (!ordens.some((ordem) => ordem.numero === numeroSelecionado)) numeroSelecionado = null;
        renderizar();
        return true;
    } catch {
        mostrarErro('Não foi possível carregar as ordens de serviço. Tente novamente.', true);
        return false;
    } finally {
        ocupado = false;
        $('carregando').hidden = true;
        $('conteudo').setAttribute('aria-busy', 'false');
        atualizarBotoes();
    }
}

// A máscara mantém a mesma regra do cadastro original.
const regraValor = /^$|^\d{1,9}([,.]\d{0,2})?$/;
campoValor.addEventListener('beforeinput', (evento) => {
    if (evento.data === null) return;
    const texto = campoValor.value.slice(0, campoValor.selectionStart) + evento.data + campoValor.value.slice(campoValor.selectionEnd);
    if (!regraValor.test(texto)) evento.preventDefault();
});
function avisar(campo, texto) {
    campo.setCustomValidity(texto);
    campo.reportValidity();
    campo.addEventListener('input', () => campo.setCustomValidity(''), { once: true });
}
function lerFormulario() {
    return { cliente: campoCliente.value.trim(), veiculo: campoVeiculo.value.trim(), servico: campoServico.value.trim(), valor: campoValor.value.trim().replace(',', '.') };
}
function validar(dados) {
    if (!dados.cliente) { avisar(campoCliente, 'Preencha o cliente.'); return false; }
    if (!dados.veiculo) { avisar(campoVeiculo, 'Preencha o veículo.'); return false; }
    if (!dados.servico) { avisar(campoServico, 'Preencha o serviço.'); return false; }
    if (dados.valor === '' || isNaN(Number(dados.valor))) { avisar(campoValor, 'Informe um valor válido.'); return false; }
    return true;
}
function limparFormulario() {
    formulario.reset();
    campos.forEach((campo) => campo.setCustomValidity(''));
    numeroEmEdicao = null;
    numeroSelecionado = null;
    $('busca-ordens').value = '';
    $('titulo-formulario').textContent = 'Nova ordem de serviço';
    $('botao-salvar').textContent = 'Cadastrar';
    $('cancelar-edicao').hidden = true;
    renderizarOrdens();
}
function iniciarNovaOrdem() {
    if (ocupado || !dadosCarregados) return;
    limparFormulario();
    mensagem('');
    mostrarErro('');
    navegar('ordens', false);
    campoCliente.focus();
}
function abrirEdicao(numero) {
    if (ocupado) return;
    const ordem = ordens.find((item) => item.numero === numero);
    if (!ordem) return;
    numeroSelecionado = numero;
    numeroEmEdicao = numero;
    campos.forEach((campo) => campo.setCustomValidity(''));
    campoCliente.value = ordem.cliente;
    campoVeiculo.value = ordem.veiculo;
    campoServico.value = ordem.servico;
    campoValor.value = String(ordem.valor).replace('.', ',');
    $('busca-ordens').value = '';
    $('titulo-formulario').textContent = 'Editando ordem nº ' + numero;
    $('botao-salvar').textContent = 'Salvar';
    $('cancelar-edicao').hidden = false;
    mensagem('');
    navegar('ordens', false);
    renderizarOrdens();
    campoCliente.focus();
}
async function onSalvar(evento) {
    evento.preventDefault();
    if (ocupado) return;
    const dados = lerFormulario();
    if (!validar(dados)) return;
    const editando = numeroEmEdicao !== null;
    ocupado = true;
    atualizarBotoes();
    mostrarErro('');
    mensagem('');
    try {
        if (editando) await window.api.editar({ numero: numeroEmEdicao, ...dados });
        else await window.api.cadastrar(dados);
        limparFormulario();
        if (await carregarOrdens()) mensagem(editando ? 'Alterações salvas.' : 'Ordem cadastrada.');
    } catch {
        mostrarErro('Não foi possível salvar a ordem. Seus dados continuam no formulário.');
    } finally { ocupado = false; atualizarBotoes(); }
}
async function onExcluir() {
    if (ocupado || numeroSelecionado === null) return;
    ocupado = true;
    atualizarBotoes();
    mostrarErro('');
    mensagem('');
    try {
        const excluiu = await window.api.excluir(numeroSelecionado);
        if (!excluiu) return;
        limparFormulario();
        if (await carregarOrdens()) mensagem('Ordem excluída.');
    } catch {
        mostrarErro('Não foi possível excluir a ordem. Tente novamente.');
    } finally { ocupado = false; atualizarBotoes(); }
}
formulario.addEventListener('submit', onSalvar);
$('botao-editar').addEventListener('click', () => abrirEdicao(numeroSelecionado));
$('botao-excluir').addEventListener('click', onExcluir);
$('cancelar-edicao').addEventListener('click', () => iniciarNovaOrdem());
$('nova-ordem').addEventListener('click', () => iniciarNovaOrdem());
document.querySelectorAll('[data-nova-ordem]').forEach((botao) => botao.addEventListener('click', () => iniciarNovaOrdem()));
$('tentar-carregar').addEventListener('click', carregarOrdens);
$('busca-ordens').addEventListener('input', () => { numeroSelecionado = null; renderizarOrdens(); });
window.api.aoNovaOrdem(() => iniciarNovaOrdem());
mostrarTela(location.hash.slice(1), false);
atualizarBotoes();
carregarOrdens();
