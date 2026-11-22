// preload.js Expõe de forma segura as funções que a tela (renderer) pode chamar no processo principal
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // CRUD das ordens de serviço (tela -> processo principal)
    listar: () => ipcRenderer.invoke('ordens:listar'),
    cadastrar: (dados) => ipcRenderer.invoke('ordens:cadastrar', dados),
    editar: (ordem) => ipcRenderer.invoke('ordens:editar', ordem),
    excluir: (numero) => ipcRenderer.invoke('ordens:excluir', numero),

    // Atalho do menu (processo principal -> tela):
    aoNovaOrdem: (callback) => ipcRenderer.on('menu:nova-ordem', () => callback()),
});