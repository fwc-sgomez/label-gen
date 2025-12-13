const wsUri = "ws://127.0.0.1:21845/";
let ws;
let wsImageData;
let wsStartAttemps = 0;

function wsSetImage(imageData) {
    wsImageData = imageData;
}

function wsStart(){
    wsStartAttemps++
    ws = new WebSocket(wsUri);
    ws.onopen = (e) => {
        ws.send(wsImageData);
    }
    
    ws.onmessage = (e) => {
        console.log(`response: ${e.data}`);
    }
    
    ws.onerror = (e) => {
        showWarningMessage(`error connecting to FWCPrintApp: ${e.data}\nattempt ${wsStartAttemps} of 3`);
        if (wsStartAttemps < 3){
            wsStart()
        } else {
            showWarningMessage('Unable to connect to the print app.')
            wsStartAttemps = 0
        }
    }
}
