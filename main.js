
// main.js — processo principal: cria a janela e controla o ciclo de vida do app
const { app, BrowserWindow, ipcMain } = require('electron');
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

app.whenReady().then(() => {
  // Handlers de IPC: só recebem o pedido da tela e delegam ao repositório
  ipcMain.handle('ordens:listar', () => repositorio.carregar());
  ipcMain.handle('ordens:cadastrar', (evento, dados) => repositorio.cadastrar(dados));
  ipcMain.handle('ordens:editar', (evento, ordem) => repositorio.editar(ordem));

  criarJanela();
});

//fechar todas as janelas encerra o app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
