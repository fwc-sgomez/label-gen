document.addEventListener('DOMContentLoaded', () => { // hmm
    // setup stuff
    setFromSettings() // prepares defaults

    checkUrlParams() // then check url params so the rest can be updated accordingly

    updatePnBarcode()
    updateLotBarcode()
    updateCompany()
    detectBrowser()
    loadPrintHistory()
})

const Companies = {
    Fwc: 'fwc',
    Cf: 'cf'
}

const LabelTypes = [
    'machwip',
    'invltdshelf',
    'invwipfg',
    'invrec'
]

function setFromSettings() {
    const settings = lsReadJson('settings')
    gebi('labelType').selectedIndex = settings.lbType
    lbTypeChange(settings.lbType)
    gebi('company').selectedIndex = settings.cmp
}

function checkUrlParams(){
    const params = new URLSearchParams(window.location.search)
    const urlPart = params.get('p')
    const urlWo = params.get('w')
    const urlCmp = params.get('cmp')
    const urlSrc = params.get('src')
    
    // part number parsing stuff
    // I may be overcomplicating this line below. might need some updating the the handlePnParam function...
    if ((urlPart && urlWo) || (urlPart && !urlWo)) {
        handlePnParam(urlPart)
    }
    
    // work order number stuff
    if (urlWo) {
        gebi('wonum').value = urlWo
    } else if (!urlWo && urlPart) {
        showWarningMessage('No work order found. Adjust work order number as needed, or enter "None" if there is no work order.', 10)
    }

    // kinda jank, but index 0 = fwc; 1 = cf
    if (urlCmp){
        const cmp = urlCmp.toLowerCase()
        const select = gebi('company')
        if (cmp == 'fwc') {
            select.selectedIndex = 0 // fwc
        } else if (cmp == 'cf') {
            select.selectedIndex = 1 // cf
        } else {
            showWarningMessage('Company provided in URL but failed to determine company. Select company as necessary.', 10)
        }
    }

    if (urlSrc) {
        // not used yet, but some options would be like mach schedule
        // would be used to determine label type/format.
    }
}

function handlePnParam(partNumber) {
    if (!partNumber) {
        showWarningMessage('No part number found. Manually add the part number to the part number text box.', 10)
        return;
    }

    const partEl = gebi('part')
    const revEl = gebi('rev')
    // it's likely that the pn has a rev number added or it's a pn with hyphens in it.
    const pnType = partNumber.match(/-/g)?.length

    if ((pnType == 0) || (pnType == undefined)){  // if pn does not have any '-' pn.match() returns undefinied.
        // pn only likely 
        showWarningMessage('No rev number found. Adjust part number and part revision as needed.', 10)
        partEl.value = partNumber
        revEl.value = '??' // don't assume rev 00
    } else if (pnType == 1) {
        // pn with one '-'
        const part = partNumber.split('-')
        partEl.value = part[0]
        revEl.value = part[1]
    } else { // likely a ven number with many hyphens
        part = partNumber.split('-')
        // check to see if last characters in array are 2 characters.
        // if not, chances are there is no rev number.
        if (part[part.length - 1].length != 2){
            // no rev
            showWarningMessage('No rev number found. Adjust part number and part revision as needed.', 10)
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

let fullPn;
function updatePnBarcode(){
    const pn = gebi('part').value
    const rev = gebi('rev').value
    fullPn = generatePartNumber(pn, rev)
    generateBarcode('#pn', fullPn, 1.25)
}

// using alert() for now. i would like to implement a more elegant and less annoying version later
function generatePartNumber(pn, rev){
    pn = pn.replaceAll(' ', '')
    rev = rev.replaceAll(' ', '')
    if (pn.length > 17){
        showWarningMessage('Part number is greater than 17 characters. Check part number is correct.')
        return;
    } else if (pn.length < 1) {
        showWarningMessage('Part number is less than 1 character.')
        return;
    }
    if (rev.length > 3){
        showWarningMessage('Rev number is greater than 3 characters. Check rev number is correct.')
        return;
    } else if (rev.length < 1) {
        showWarningMessage('Rev number is less than 1 character. Check rev number is correct.')
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
    const select = gebi('company')
    gebi('logo').src = `./img/${select.value}.png`
    updateSetting('cmp', select.selectedIndex)
}

let lotCode;
function updateLotBarcode(){
    const input = gebi('lot').value
    const wo = gebi('wonum').value
    const cc = gebi('cc').value
    const lbType = gebi('labelType').selectedIndex
    let width = 2 // full width
    if ((lbType > 7) && (lbType < 11)) width = 1.25 // range, labels 5 thru 7 req midsection to be shorter

    lbwo = gebi('sslbwonumber')
    if (lbwo) lbwo.textContent = wo

    lotCode = generateMachLot(wo, cc)
    if (input) {
        lotCode = input
        gebi('lotNote').hidden = false
    } else {
        gebi('lotNote').hidden = true
    }

    if (wo.length > 10) {
        showWarningMessage('Unusually long work order number. Check work order number is correct.')
    }

    if (lotCode.length > 15) {
        showWarningMessage('Lot code is longer than 15 characters! This may not be accepted in GSS.')
    }

    generateBarcode('#lotBc', lotCode, width)
}

function generateMachLot(woNum, cc = false){
    const cleanWo = woNum.replaceAll('-', '')
    let date;
    if (cc) {
        date = generateDate('MMDD')
    } else {
        date = generateDate('MMDDYY')
    }
    return cleanWo+date+cc
}

function updateEmpId(text) {
    gebi('sslbemployeeid').textContent = text

    if (text.length > 4) {
        showWarningMessage('Employee ID is usually 4 digits long.')
    }
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

function handlePrint() {
    const pn = gebi('part').value
    const rev = gebi('rev').value
    const wo = gebi('wonum').value
    const empId = gebi('emp').value
    const qty = gebi('qty').value


    if (!pn || (pn == '00000XX0000')) {
        // confirm('no part number, or ')
        showWarningMessage('Cannot print: part number is empty or is template part number. Use Ctrl+P to bypass.')
        return;
    } else if (pn.length > 17) {
        showWarningMessage('Cannot print: part number is too long and barcode has not been updated. Use Ctrl+P to bypass.')
        return;
    }
    if (rev.includes('?')) {
        showWarningMessage('Cannot print: rev number is unknown. Use Ctrl+P to bypass.')
        return;
    } else if (!rev) {
        if (!confirm('Rev number is empty. Print regardless?')) return;
    }
    if (!wo) {
        if (!confirm('No work order number is entered. Print regardless?')) return;
    }
    if (!empId) {
        if (!confirm('No employee ID is entered. Print regardless?')) return;
    }
    if (!qty) {
        if (!confirm('No qty is entered. Print regardless?')) return;
    }

    print()
}

window.addEventListener("afterprint", (event) => {
    console.log(event)
    saveToPrintHistory()
    loadPrintHistory()
});

function updateSetting(setting, value) {
    const settings = lsReadJson('settings')
    if (settings.hasOwnProperty(setting)) {
        settings[setting] = value

        lsStore('settings', settings)
    } else {
        console.warn(`key ${setting} does not exist in settings.`)
    }
}

