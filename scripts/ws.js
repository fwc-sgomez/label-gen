const wsUri = "ws://127.0.0.1/";
let ws;
let wsImageData;

function wsSetImage(imageData) {
    wsImageData = imageData;
}

function wsStart(){
    ws = new WebSocket(wsUri);
    ws.onopen = (e) => {
        ws.send(wsImageData)
    }
    
    ws.onmessage = (e) => {
        console.log(`response: ${e.data}`);
    }
    
    ws.onerror = (e) => {
        showWarningMessage(`server error: ${e.data}`);
    }
}
