import { Menu, app, shell, MenuItemConstructorOptions, BrowserWindow, ipcMain } from 'electron';

const isMac = process.platform === 'darwin';

export function buildCustomMenu(){

  const template: MenuItemConstructorOptions[] = [
    {
      label: '程序',
      submenu: [
        isMac ? { role: 'close', label:'退出' } : { role: 'quit', label:'退出' },
        { role: 'reload' , label:'刷新'},
        { role: 'forceReload' , label:'强制刷新'},
        { type: 'separator'},
        { role: 'toggleDevTools' , label:'打开开发工具'}   
      ]
    },

    {
      label: '窗口',
      submenu: [
        { role: 'minimize' , label:'最小化'},
        { role: 'togglefullscreen' , label:'切换全屏模式'},  
        { role: 'close', label:'关闭'}
      ]
    },

    {
        label: '帮助',
        submenu:[
            {
                label: '关于',
                click:()=>{
                    const win = BrowserWindow.getFocusedWindow();
                    win.webContents.send('show-copyright-modal');
                }
            }
        ]
    }
  ];  

  // 构建菜单
  const menu = Menu.buildFromTemplate(template);
  return menu;
}

