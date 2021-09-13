const { ipcRenderer } = require('electron')
const { $ ,convertDuraction} = require("./helper")
let musicAudio = new Audio()
let allTracks
let currentTrack
// document.getElementById('add-music-button').addEventListener('click', () => {
//     ipcRenderer.send('add-music-window')
// })
$('add-music-button').addEventListener('click', () => {
    ipcRenderer.send('add-music-window')
})
const renderListHTML = (tracks)=>{
    const tracksList = $('tracksList')
    const trackListHTML = tracks.reduce((html,track)=>{
        html += `<li class="row music-track list-group-item ">
        <div class="col-10">
          <i class="bi bi-music-note-beamed"></i>
          <b>${track.fileName}</b>
        </div>
        <div class="col-2">
          <i class="bi bi-file-play me-3 fas" data-id="${track.id}"></i>
          <i class="bi bi-trash fas" data-id="${track.id}"></i>
        </div>
      </li>`
        return html
    },'')
    const emptyTrackHTML = '<div class="alert alert-primary">还没有添加任何音乐</div>'
    tracksList.innerHTML=tracks.length?`<ul class='list-group'>${trackListHTML}</ul>`:emptyTrackHTML
    // tracksList.innerHTML = `<ul class='list-group'>${trackListHTML}</ul>`
}
const renderPlayerHTML =(name,duration)=>{
  const player = $('player-status')
  const html = `<div class='col font-weight-bold padd '>
    正在播放:${name}
    <span id="current-seeker">00:00</span>/${convertDuraction(duration)}
  </div>
  `
  player.innerHTML = html
}
const updateProgressHTML = (cuurrentTime,duration)=>{
  // 计算progress进度条
  const progress = Math.floor(cuurrentTime/duration*100)
  const bar = $('player-progress')
  bar.innerHTML = progress + '%'
  bar.style.width = progress + '%'
  const seeker = $('current-seeker')
  seeker.innerHTML = convertDuraction(cuurrentTime)
}
ipcRenderer.on('getTracks',(event,tracks)=>{
    allTracks = tracks
    console.log(tracks);
    renderListHTML(tracks)
})
musicAudio.addEventListener("loadedmetadata",()=>{
  // 渲染播放器状态
  renderPlayerHTML(currentTrack.fileName,musicAudio.duration)
})
musicAudio.addEventListener("timeupdate",()=>{
  // 渲染播放器状态
  updateProgressHTML(musicAudio.currentTime,musicAudio.duration)
})
$('tracksList').addEventListener('click',(event)=>{
  event.preventDefault()
  const {dataset,classList} = event.target
  const id = dataset&&dataset.id
  if(id && classList.contains('bi-file-play')){
    // 播放音乐
    if(currentTrack&& currentTrack.id ===id){
      // 继续播放
      musicAudio.play()
    }else {
      // 播放新的歌曲,注意还原之前的图标
      currentTrack = allTracks.find(track =>track.id === id)
      musicAudio.src = currentTrack.path
      musicAudio.play()
      const resetIconEle = document.querySelector(".bi-pause")
      if(resetIconEle){
        resetIconEle.classList.replace('bi-pause','bi-file-play')
      }
    }
    classList.replace('bi-file-play','bi-pause')
  }else if(id && classList.contains('bi-pause')){
    // 暂停
    musicAudio.pause()
    classList.replace('bi-pause','bi-file-play')
  }else if(id && classList.contains('bi-trash')){
    // 发送时间
    ipcRenderer.send('delete-tracks',id)
  }
})
