const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stoptBtn = document.getElementById('stoptBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');

startBtn.onclick = e => {
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
};

stopBtn.onclick = e => {
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};


videoSelectBtn.onclick = getVideoSources;

const { desktopCapturer, remote } = require('electron')
const { dialog, Menu } = remote;

async function getVideoSources(){
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptions = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );

    videoOptions.popup();
};

let mediaRecorder;
const recordedParts = [];


async function selectSource(source){
    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio : false,
        video : {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId : source.id
            }
        }
    };

const stream = await navigator.mediaDevices.getUserMedia(constraints);
videoElement.srcObject = stream;
videoElement.play();

const options  = { mimeType: 'video/webm; codecs=vp9'};
mediaRecorder = new MediaRecorder(stream, options)

mediaRecorder.ondataavailable = handleDataAvailable;
mediaRecorder.onstop = handleStop

}

function handleDataAvailable(e) {
    console.log('video data available')
    recordedParts.push(e.data);
}

const { writeFIle } = require('fs');

async function handleStop(e) {
    const blob = new Blob (recordedParts, {
        type: 'video/webm; codecs=vp9'
    });
    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save Video',
        defaultPath: `vid-${Date.now()}.webm`
    });

    console.log(filePath);
    writeFIle(filePath, buffer, () => console.log('video saved successfully!'));
 }