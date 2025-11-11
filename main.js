document.addEventListener('DOMContentLoaded', () => {
    checkUrlParams()
    updatePnBarcode()
    updateLotBarcode()
})

function checkUrlParams(){
    const url = window.location.search
    const sp = new URLSearchParams(url)
    const pn = sp.get('p')
    const wo = sp.get('w')

    if (!pn && !wo) return; // do nothing if they're both missing
    
    if (pn){
        const partEl = document.getElementById('part')
        const revEl = document.getElementById('rev')
        // it's likely that the pn has a rev number added or it's a pn with hyphens in it.
        const pnType = pn.match(/-/g)?.length
        if ((pnType == 0) || (pnType == undefined)){  // if pn does not have any '-' pn.match() returns undefinied.
            // pn only likely 
            addWarningMessage('No rev number found. Adjust part number and part revision as needed.', 10)
            partEl.value = pn
            revEl.value = '??' // don't assume rev 00
        } else if (pnType == 1) {
            // pn with one '-'
            const part = pn.split('-')
            partEl.value = part[0]
            revEl.value = part[1]
        } else { // likely a ven number with many hyphens
            part = pn.split('-')

            // check to see if last characters in array are 2 characters.
            // if not, chances are there is no rev number.
            if (part[part.length - 1].length != 2){
                // no rev
                addWarningMessage('No rev number found. Adjust part number and part revision as needed.', 10)
                partEl.value = part.join('-')
                revEl.value = '??' // idk if pn has rev num or not...
            } else {
                // rev num detected
                const rev = part.pop()
                partEl.value = part.join('-')
                revEl.value = rev

            }
        }
    }
    
    if (wo) {
        document.getElementById('wonum').value = wo
    } else {
        addWarningMessage('No work order found. Adjust work order number as needed, or enter "None" if there is no work order.', 10)
    }
}

function updatePnBarcode(){
    const pn = document.getElementById('part').value
    const rev = document.getElementById('rev').value
    const fullPn = generatePartNumber(pn, rev)
    generateBarcode('#pn', fullPn, 1.25)
}

// using alert() for now. i would like to implement a more elegant and less annoying version later
function generatePartNumber(pn, rev){
    pn = pn.replaceAll(' ', '')
    rev = rev.replaceAll(' ', '')
    if (pn.length > 17){
        addWarningMessage('Part number is greater than 17 characters. Check part number is correct.')
        return;
    } else if (pn.length < 1) {
        addWarningMessage('Part number is less than 1 character.')
        return;
    }
    if (rev.length > 3){
        addWarningMessage('Rev number is greater than 3 characters. Check rev number is correct.')
        return;
    } else if (rev.length < 1) {
        addWarningMessage('Rev number is less than 1 character. Check rev number is correct.')
        // return;
    }

    let part, revn;
    if (rev.length < 1) {
        // if no rev number, pn stays at whatever it was with 0 trailing spaces.
        part = pn
        revn = ''
    } else {
        // if rev number exists, pn is 20 char, part 17 and rev 3.
        part = (pn + ' '.repeat(17 - pn.length))
        revn = (rev + ' '.repeat(3 - rev.length))
    }
    return (part+revn)
}

function updateCompany(){
    const select = document.getElementById('company').value
    document.getElementById('logo').src = `./img/${select}.png`
}

function updateLotBarcode(){
    const input = document.getElementById('lot').value
    const wo = document.getElementById('wonum').value
    const cleanWo = wo.replaceAll('-', '')
    const d = new Date()
    const date = (d.getMonth() + 1).toString()+d.getDate().toString()+d.getFullYear().toString().slice(2, 4) // remove the first 2 characters...

    document.getElementById('lbWoNum').textContent = wo

    let lotCode = cleanWo + date
    if (input) {
        lotCode = input
    }

    if (lotCode.length > 15) {
        addWarningMessage('Lot code is longer than 15 characters! This may not be accepted in GSS.')
    }
    generateBarcode('#lotBc', lotCode, 2)
}

function generateBarcode(element, text, cWidth){
    JsBarcode(element, text.toUpperCase(), {
        width: cWidth,
        height: 30, 
        displayValue: true,
        font: 'arial',
        margin: 5,
        fontSize: 16
    })
}

let lastWarningMessage = ''
let lastWmTime;

function addWarningMessage(message, duration = 5) {
    const timeDelta = ((Date.now() - lastWmTime) / 1000)
    if ((lastWarningMessage == message) && timeDelta < 3) return;
    lastWarningMessage = message
    lastWmTime = Date.now()
    console.warn(message) // log the message just in case
    const parent = document.getElementById('warnings')
    const warningDiv = document.createElement('div')
    warningDiv.className = 'warning'

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

function handlePrint() {
    const pn = document.getElementById('part').value
    const rev = document.getElementById('rev').value
    const wo = document.getElementById('wonum').value
    const empId = document.getElementById('emp').value
    const qty = document.getElementById('qty').value

    let confirmed = false
    if (!pn || (pn == '00000XX0000')) {
        // confirm('no part number, or ')
        addWarningMessage('Cannot print: part number is empty or is template part number. Use Ctrl+P to bypass.')
        return;
    }
    if (rev.contains('?')) {
        addWarningMessage('Cannot print: rev number is empty or is unknown. Use Ctrl+P to bypass.')
        return;
    } else if (!rev) {
        confirmed = confirm('Rev number is empty. Print regardless?')
        if (!confirmed) return;
    }
    if (!wo) {
        confirmed = confirm('No work order number is entered. Print regardless?')
        if (!confirmed) return;
    }
    if (!empId) {
        confirmed = confirm('No employee ID is entered. Print regardless?')
        if (!confirmed) return;
    }
    if (!qty) {
        confirmed = confirm('No qty is entered. Print regardless?')
        if (!confirmed) return;
    }

    print()
}