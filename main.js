
// main.js — processo principal: cria a janela e controla o ciclo de vida do app
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const repositorio = require('./repositorio');

function criarJanela() {
  const janela = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 800,
    minHeight: 600,
    title: 'Mobilium - Oficina e Ordens de Serviço',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  janela.loadFile(path.join(__dirname, 'src', 'index.html'));
}

// Diálogo nativo de confirmação (igual ao Alert CONFIRMATION da N1)
async function confirmarExclusao(janela, ordem) {
  const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const resposta = await dialog.showMessageBox(janela, {
    type: 'warning',
    title: 'Confirmar exclusão',
    message: 'Deseja excluir esta ordem de serviço?',
    detail:
      `Nº: ${ordem.numero}\n` +
      `Cliente: ${ordem.cliente}\n` +
      `Veículo: ${ordem.veiculo}\n` +
      `Serviço: ${ordem.servico}\n` +
      `Valor: ${moeda.format(ordem.valor)}`,
    buttons: ['Excluir', 'Cancelar'],
    defaultId: 1, // Enter cai em "Cancelar" (mais seguro)
    cancelId: 1,  // Esc / fechar o diálogo = "Cancelar"
  });

  return resposta.response === 0; // 0 = clicou em "Excluir"
}

app.whenReady().then(() => {
  // Handlers de IPC: só recebem o pedido da tela e delegam ao repositório
  ipcMain.handle('ordens:listar', () => repositorio.carregar());
  ipcMain.handle('ordens:cadastrar', (evento, dados) => repositorio.cadastrar(dados));
  ipcMain.handle('ordens:editar', (evento, ordem) => repositorio.editar(ordem));
  ipcMain.handle('ordens:excluir', async (evento, numero) => {
    const janela = BrowserWindow.fromWebContents(evento.sender);
    const ordens = await repositorio.carregar();
    const ordem = ordens.find((o) => o.numero === numero);
    if (!ordem) return false;

    const confirmou = await confirmarExclusao(janela, ordem);
    if (!confirmou) return false;

    await repositorio.excluir(numero);
    return true;
  });

  criarJanela();
});

//fechar todas as janelas encerra o app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
