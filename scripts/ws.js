const wsUri = "ws://127.0.0.1:21845/";
let ws;
let wsImageData;
let wsStartAttemps = 0;
let wsMaxAttempts = 5;

function wsSetImage(imageData) {
    wsImageData = imageData;
}

function wsStart(){
    wsStartAttemps++
    ws = new WebSocket(wsUri);
    ws.onopen = (e) => {
        ws.send(wsImageData);
        wsStartAttemps = 0;
    }
    
    ws.onmessage = (e) => {
        console.log(`response: ${e.data}`);
    }
    
    ws.onerror = (e) => {
        // showWarningMessage(`error connecting to FWCPrintApp: ${e.data}\nattempt ${wsStartAttemps} of 3`);
        if (wsStartAttemps < wsMaxAttempts){
            console.log(`[${new Date().toLocaleTimeString()}] failed to connect. attempt ${wsStartAttemps} of ${wsMaxAttempts}`)
            setTimeout(() => {
                wsStart()
            }, 1000)
        } else {
            showWarningMessage(`Unable to connect to the print app after ${wsMaxAttempts} attempts. Make sure the app is installed.`)
            showWarningMessage('<a href=\'docs?doc=appinstall\'>Click here to learn how to install it.</a>')
            wsStartAttemps = 0
        }
    }
}
