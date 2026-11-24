# Mobilium — Gestão de Oficina Mecânica (Electron)

Aplicação desktop para gerenciar **ordens de serviço** de uma oficina mecânica.
É a reconstrução em Electron do sistema desenvolvido em JavaFX, mantendo a mesma entidade, os mesmos campos e a mesma tela, mas agora com separação entre processos, comunicação por IPC, recursos nativos do sistema operacional e persistência em arquivo JSON.

Disciplina **Programação Desktop**.

## Funcionalidades

- Cadastrar uma ordem de serviço (cliente, veículo, serviço e valor)
- Listar todas as ordens, com o valor formatado em R$
- Editar uma ordem existente (o mesmo formulário serve para cadastrar e editar)
- Excluir uma ordem, com confirmação em **diálogo nativo** do sistema
- Validação dos campos obrigatórios e máscara no campo de valor (até 2 casas decimais)
- Menu nativo com atalhos de teclado
- Dados salvos automaticamente em arquivo JSON a cada alteração

## Tecnologias

- [Electron](https://www.electronjs.org/)
- HTML, CSS e JavaScript (sem frameworks)
- Node.js (`fs/promises`, `path`)

## Como executar

Pré-requisitos: [Node.js](https://nodejs.org/) (versão LTS) e Git.

```bash
git clone https://github.com/felipedvd2025/oficina-electron.git
cd oficina-electron
npm install
npm start
```

## Atalhos de teclado

| Atalho | Ação |
|---|---|
| `Ctrl + N` | Nova ordem (limpa o formulário e foca no campo Cliente) |
| `Ctrl + Q` | Sair da aplicação |
| `Enter` | Cadastrar / salvar o formulário |

## Estrutura do projeto

```text
oficina-electron/
├── package.json      # dados do projeto, script de execução e dependências
├── main.js           # processo principal: janela, menu e handlers de IPC
├── preload.js        # expõe o window.api para a tela com contextBridge
├── repositorio.js    # leitura e gravação do arquivo JSON
├── README.md
└── src/
    ├── index.html    # estrutura da tela
    ├── style.css     # estilo visual
    └── renderer.js   # lógica da tela (usa apenas o window.api)
```

## Arquitetura

O Electron separa a aplicação em dois tipos de processo:

- **Processo principal (`main.js`)** — tem acesso ao sistema operacional. Cria a janela, monta o menu nativo, abre o diálogo de confirmação e responde aos pedidos da tela. Os handlers apenas recebem e **delegam** ao `repositorio.js`.
- **Processo de renderização (`src/`)** — a tela, que funciona como uma página web. Por segurança, roda com `contextIsolation: true` e `nodeIntegration: false`: não usa `require`, `fs` nem nada do Node.
- **Preload (`preload.js`)** — a ponte entre os dois. Usa `contextBridge` para expor na tela somente as funções necessárias, no objeto `window.api`.

```text
renderer.js ──window.api──► preload.js ──IPC──► main.js ──► repositorio.js ──► ordens.json
```

### Canais IPC

| Canal | Sentido | Função no `window.api` | O que faz |
|---|---|---|---|
| `ordens:listar` | tela → principal | `listar()` | Devolve todas as ordens |
| `ordens:cadastrar` | tela → principal | `cadastrar(dados)` | Cria uma ordem com número automático |
| `ordens:editar` | tela → principal | `editar(ordem)` | Atualiza uma ordem pelo número |
| `ordens:excluir` | tela → principal | `excluir(numero)` | Pede confirmação no diálogo nativo e exclui |
| `menu:nova-ordem` | principal → tela | `aoNovaOrdem(callback)` | Avisa a tela que o Ctrl+N foi acionado |

A comunicação tela → principal usa `ipcRenderer.invoke` / `ipcMain.handle`. O aviso do menu (principal → tela) usa `webContents.send` / `ipcRenderer.on`.


## Equipe
| Felipe da Costa Mota
| Vitor Sâmile Silva Santos 
| Luís Felype Monteiro da Silva Sousa
| Luan Lucas Oliveira Sousa

