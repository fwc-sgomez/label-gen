function detectBrowser() {
    const uaData = navigator.userAgentData;
    const b = uaData.brands.find(brand => brand.brand == 'Microsoft Edge')
    if (b) {
        showWarningMessage('For Edge browser only: When printing, set "Layout" to "Portrait"', 20, )
    } 
    //uaData.brands.forEach(brand => {
    //    if (brand.brand == 'Microsoft Edge') {
    //        showWarningMessage('For Edge browser only: When printing, set "Layout" to "Portrait"', 20)
    //    } else if (brand.brand != "Chromium") {
    //        showWarningMessage('Please consider switching to Chrome as this app may not print correctly with other browsers.')
    //    }
    //});
}

function firstTime(){

}

/**
 * shorthand lazy for document.getElementById
 * @param {string} elementId id of element
 * @returns HTMLElement
 */
function gebi(elementId) {
    return document.getElementById(elementId)
}


let lastWarningMessage = ''
let lastWmTime;
/**
 * show a warning/alert message to the user.
 * @param {string} message text to display in the warning message
 * @param {number} duration duration in seconds to show message. default is 5s
 * @param {string} color background color of message box. default is 'red'
 * @returns void
 */
function showWarningMessage(message, duration = 5, color = 'red') {

    const timeDelta = ((Date.now() - lastWmTime) / 1000)
    console.warn(message, Date.now().toString()) // log the message just in case
    if ((lastWarningMessage == message) && timeDelta < 3) return;
    lastWarningMessage = message
    lastWmTime = Date.now()
    const parent = gebi('warnings')
    const warningDiv = document.createElement('div')
    warningDiv.className = 'warning'
    warningDiv.style.backgroundColor = color

    const warnMsg = document.createElement('p')
    warnMsg.className = 'warningMessage'
    warnMsg.textContent = message

    warningDiv.append(warnMsg)
    if (duration > 0){
        setTimeout(() => {
            warningDiv.remove()
        }, (duration * 1000));
    }

    parent.append(warningDiv)
}