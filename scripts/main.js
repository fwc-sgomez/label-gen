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
    gebi('printType').selectedIndex = settings.printType
    setPrintType(settings.printType)
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
        showWarningMessage('Rev number is less than 1 character. Check rev number is correct.', 5 ,'yellow')
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
    const ccHidden = gebi('ccdiv').hidden
    let width = 2 // full width
    if ((lbType > 7) && (lbType < 11) || (lbType == 12)) width = 1.25 // range, labels 5 thru 7 req midsection to be shorter

    lbwo = gebi('sslbwonumber')
    if (lbwo) lbwo.textContent = wo

    lotCode = generateMachLot(wo, ccHidden ? '' : cc)
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

function updateLabel() {
    updatePnBarcode()
    updatePnBarcode()
    updateEmpId()
    // need addl. stuff
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
    const pt = gebi('printType').selectedIndex
    const bt = gebi('btnPrint')
    
    // prevent accidental double clicks
    bt.disabled = true
    setTimeout(() => {
        bt.disabled = false
    }, 500)

    if (!printDataValidation()) return;
    if (pt == 0) {
        // print app
        printUsingApp()
    } else if (pt == 1) {
        // built-in
        printBuiltIn()
    } else {
        showWarningMessage('Invalid PrintType selection.')
    }
}

async function printUsingApp() {
    await convertToPng()
    console.log('sending data:')
    console.log(imgData)
    console.log(imgData.length)
    
    open(`fwcpa://print`)
    wsSetImage(imgData) // set imgdata
    wsStart() // start the server and send data once connected

    saveToPrintHistory()
    loadPrintHistory()
    showWarningMessage('If nothing happened, change "Print using" to "Built-in"', 5, 'yellow')
}

async function legacyPrintUsingApp() {
    await convertToPng()
    console.log('opening with data:')
    console.log(imgData)
    console.log(imgData.length)
    if (imgData.length > 30000) { // if data is longer than a certain amount, the app won't be opened/called/anything. silent fail
        console.warn('data length > 30k !!')
    }
    open(`fwcpa://print?img=${imgData}`)
    saveToPrintHistory()
    loadPrintHistory()
    showWarningMessage('If nothing happened, change "Print using" to "Built-in"', 5, 'yellow')
}

function printBuiltIn() {
    print()
}

let oneTimeSkipPnValid = false;
function printDataValidation() {
    const pn = gebi('part').value
    const rev = gebi('rev').value
    const wo = gebi('wonum').value
    const empId = gebi('emp').value
    const empIdDivHidden = gebi('empdiv').hidden
    const qty = gebi('qty').value
    const qtyDivHidden = gebi('qtydiv').hidden
    
    if (!validatePn(pn)) return;
    if (!validateWoNum(wo)) return;

    let confirmed = false;

    if (pn.length > 17) {
        showWarningMessage('Cannot print: part number is too long and barcode has not been updated. Use Ctrl+P to bypass.')
        return false;
    }
    if (rev.includes('?')) {
        showWarningMessage('Cannot print: rev number is unknown. Use Ctrl+P to bypass.')
        return false;
    } else if (!rev) {
        confirmed = (confirm('Rev number is empty. Print regardless?'));
        if (!confirmed) return false;
    }
    if (!empId && !empIdDivHidden) {
        confirmed = (confirm('No employee ID is entered. Print regardless?'))
        if (!confirmed) return false;
    }
    if (!qty && !qtyDivHidden) {
        confirmed = (confirm('No qty is entered. Print regardless?'))
        if (!confirmed) return false;
    }
    return true;
}

function validatePn(pn) {
    // /[0-9]{5}[A-Za-z]{2}[0-9]{4}-[0-9]{2}/gm (match nnnnnxxnnnn-nn)
    // /[A-Za-z]{3}-[0-9]{2}-[A-Za-z]{2}-[0-9]{5}/gm (match xxx-nn-xx-xxxxx)
    
    // allow bypassing pn validation in case i missed something
    if (oneTimeSkipPnValid) {
        oneTimeSkipPnValid = false
        return true;
    }

    if (pn.length == 11){
        // likely part number
        const reg = new RegExp(/[0-9]{5}[A-Za-z]{2}[0-9]{4}/gm)
        const regType2 = new RegExp(/[A-Za-z]{3}[0-9]{2}[A-Za-z]{2}[0-9]{4}/gm)
        if (reg.test(pn)){
            return true;
        } else if (regType2.test(pn)) {
            return true
        } else {
            showWarningMessage('Part number failed validation check. Make sure it\'s in the correct format.')
            // return false;
        }
        
    } else if (pn.length == 15) {
        // likely ven number
        const reg = new RegExp(/[A-Za-z]{3}-[0-9]{2}-[A-Za-z]{2}-[0-9]{5}/gm)
        if (reg.test(pn)){
            return true;
        } else {
            showWarningMessage('Part number failed validation check. Make sure it\'s in the correct format.')
            // return false;
        }
    } else {
        showWarningMessage('Part number failed validation check. Make sure it\'s in the correct format.')
        // return false
    }
    showWarningMessage('<p onclick="oneTimeSkipPnValid=true; handlePrint()">Click this message to skip part number validation and try again.</p>', 10, 'orange')
    return false;
}


// todo: add ability to check if wo is actaully a po number...
let oneTimeSkipWoValid
function validateWoNum(wo) {
    if (!wo) {
        return confirm('No WO number is entered. Print regardless?')
    }
    if (oneTimeSkipWoValid){
        oneTimeSkipWoValid = false
        return true;
    }
    if (gebi('wopo').textContent.includes('PO Number')){
        return true;
    }
    const reg = new RegExp(/[0-9]{6}-[0-9]{3}/gm)
    if (reg.test(wo)){
        return true
    } else {
        showWarningMessage('Work order number failed validation check. Make sure it\'s in the correct format.')
    }

    showWarningMessage('<p onclick="oneTimeSkipWoValid=true; handlePrint()">Click this message to skip part number validation and try again.</p>', 10, 'orange')
    return false
}

let imgData;
async function convertToPng() {
    const label = gebi('label')
    label.classList.add('scale2')
    await html2canvas(label).then((canvas) => {
        label.classList.remove('scale2')
        // document.body.appendChild(canvas)
        imgData = canvas.toDataURL('image/webp')
    });
}

window.addEventListener("afterprint", (event) => {
    // console.log(event)
    saveToPrintHistory()
    loadPrintHistory()
});

function setPrintType(idx) {
    updateSetting('printType', idx)
    const hide = getSetting('neverShowPaperTypeMsg')
    const p = gebi('printBtnText')

    if ((idx == 1) && (!hide)){
        // set to built-in printing. show a message about setting printer.
        showWarningMessage('When using built-in printing, make sure to add and set the DYMO printer as a printer within the printing settings.', 30, 'yellow')
        showWarningMessage('Set paper size to "99014 Shipping" for 2 1/8" x 4" labels.', 30, 'yellow')
        showWarningMessage('<p onclick=\'neverShowPaperTypeMsg()\'>Click this message to never show these reminders again.</p>', 30, 'yellow')
    }
    p.textContent = (idx == 0 ? 'Print with FWCPrintApp' : 'Print')
}

function neverShowPaperTypeMsg() {
    updateSetting('neverShowPaperTypeMsg', true)
    showWarningMessage('Saved preference for next time.', )
}