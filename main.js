// main.js — processo principal: cria a janela e controla o ciclo de vida do app
const { app, BrowserWindow } = require('electron');
const path = require('path');

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
  criarJanela();
});
//fechar todas as janelas encerra o app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});