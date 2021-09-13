const { app,BrowserWindow,ipcMain ,dialog} = require('electron')
const DataStore = require("./renderer/MusicDataStore")
const myStore = new DataStore({
  'name':'Music Data'
})


class AppWindow extends BrowserWindow {
  constructor(config,fileLocation) {
    const basicConfig = {
      width:800,
      height:600,
      webPreferences:{
        nodeIntegration:true,
        contextIsolation: false,
        enableRemoteModule:true
      }
    }
    // const  finalConfig = Object.assign(basicConfig,config)
    const finalConfig = {...basicConfig,...config}
    super(finalConfig)
    this.loadFile(fileLocation)
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}
app.on('ready', () =>{
  const mainWindow = new AppWindow({},'./renderer/index.html')
  mainWindow.webContents.on('did-finish-load',()=>{
    mainWindow.send("getTracks",myStore.getTracks())
  })
  ipcMain.on('add-music-window',()=>{
    const addWindow = new AppWindow({
      width:500,
      height:400,
      webPreferences:{
        nodeIntegration:true,
        contextIsolation:false,
        enableRemoteModule:true
      },
      parent:mainWindow
    },'./renderer/add.html')
    
  })
  ipcMain.on('add-tracks',(event,tracks)=>{
    const updateTracks = myStore.addTracks(tracks).getTracks()
    mainWindow.send('getTracks',updateTracks)
  })
  ipcMain.on('delete-tracks',(event,id)=>{
    const updateTracks = myStore.deleteTrack(id).getTracks()
    mainWindow.send('getTracks',updateTracks)
  })
  ipcMain.on('open-music-file',(event)=>{
    dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters:[  { name: 'Music', extensions: ['mp3'] }]
    }).then(result => {
      const files = result.filePaths;
      if(files){
        event.sender.send('selected-files',files)
      } 
    }).catch(err => {
      console.log(err)
    })
  })
})