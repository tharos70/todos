const electron = require("electron");

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(`file://${__dirname}/main.html`);
  mainWindow.on("closed", () => app.quit());
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add new todo",
    webPreferences: {
      nodeIntegration: true
    }
  });
  addWindow.loadURL(`file://${__dirname}/add.html`);
  addWindow.on('closed', () => addWindow = null); // GARBAGE COLLECTING WHEN CLOSING
  if (process.env.NODE_ENV === 'production') {
    addWindow.setMenuBarVisibility(false);
  }
}

ipcMain.on('todo:add', (event, todo) => {
    mainWindow.webContents.send('todo:add', todo);
    addWindow.close();
});

const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "New Todo",
        click() {
          createAddWindow();
        }
      },
      {
        label: "Clear todos",
        click() {
            mainWindow.webContents.send('todo:clear');
        }
      },
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
        // O IN ALTERNATIVA:
        /*(() => {
                    // shortcut per il click method
                    if (process.platform === 'darwin') {
                        return 'Command+Q'
                    } else {
                        return 'Ctrl+Q' 
                    }
                })(),*/
        click() {
          app.quit();
        }
      }
    ]
  }
];

if (process.platform === "darwin") {
  menuTemplate.unshift({}); // PATCH PER OSX, il menu conterrà un noto ulteriore all'inizio per pushare il menuTemplate dopo la voce electron
}

if (process.env.NODE_ENV !== "production") {
  // 'production'
  // 'development'
  // 'staging'
  // 'test'
  menuTemplate.push({
    label: "View",
    submenu: [
      {
        role: 'reload' // shortchut di electron per il refresh del codice
      },
      {
        label: "Toggle developer tools",
        accelerator:
          process.platform === "darwin" ? "Command+Alt+I" : "Ctrl+Shift+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
 
}
