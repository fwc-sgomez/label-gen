document.addEventListener('DOMContentLoaded', () => { // hmm
    checkUrlParams() // check params first, then update other elements.
    updatePnBarcode()
    updateLotBarcode()
    updateCompany()
    detectBrowser()
    loadPrintHistory()
})

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
    const select = gebi('company').value
    gebi('logo').src = `./img/${select}.png`
}

let lotCode;
function updateLotBarcode(){
    const input = gebi('lot').value
    const wo = gebi('wonum').value

    gebi('lbWoNum').textContent = wo

    lotCode = generateMachLot(wo)
    if (input) {
        lotCode = input
    }

    if (wo.length > 10) {
        showWarningMessage('Unusually long work order number. Check work order number is correct.')
    }

    generateBarcode('#lotBc', lotCode, 2)
}

function generateMachLot(woNum){
    const cleanWo = woNum.replaceAll('-', '')
    return cleanWo+generateDate('MMDDYY')

}

function updateEmpId(text) {
    gebi('lbEmpId').textContent = text

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
        addWarningMessage('Cannot print: rev number is unknown. Use Ctrl+P to bypass.')
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

let printData;
function serialisePrintData() {
    printData = new Print()

    printData.Company = gebi('company').selectedIndex
    printData.Part = gebi('part').value
    printData.Rev = gebi('rev').value
    printData.WO = gebi('wonum').value
    printData.EmpId = gebi('emp').value
    printData.Qty = gebi('qty').value
    printData.Lot = lotCode // lot code is generated in updateLotBarcode() and itn't accessible elsewhere so i made lotCode global instead...
    printData.FullPart = fullPn // same thing as lot- made global
}



/**
 * returns current date as MMDDYYYY by default.
 * @param { string } formatOverride
 * accepts MM, DD, and/or YYYY | YY only. default is MMDDYYYY but can be something like MM-DD-YYYY
 * @param { Date | number | string | undefined } date 
 */
function generateDate(formatOverride = '', date = 0){
    const d = new Date(date ? date : Date.now())
    let fmt = formatOverride.toUpperCase() || 'MMDDYYYY'
    let day = d.getDate().toString() 
    let month = (d.getMonth() + 1).toString()
    let year = d.getFullYear().toString()
    let yearShort = year.slice(2, 4)

    if (day.length < 2) {day = ('0' + day)}
    if (month.length < 2) {month = ('0' + month)}

    fmt = fmt.replaceAll('DD', day)
    fmt = fmt.replaceAll('MM', month)
    fmt = fmt.replaceAll('YYYY', year)
    fmt = fmt.replaceAll('YY', yearShort)

    return fmt
}