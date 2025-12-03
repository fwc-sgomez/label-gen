function lbTypeChange(idx) {
    updateSetting("lbType", idx)
    clearSubsections()
    cleanMidsection()
    const ccdiv = gebi('ccdiv')
    const ncrdiv = gebi('ncrdiv')
    const expdiv = gebi('expdiv')
    const empdiv = gebi('empdiv')
    const qtydiv = gebi('qtydiv')
    ccdiv.hidden = false
    ncrdiv.hidden = true
    expdiv.hidden = true
    empdiv.hidden = true
    qtydiv.hidden = false
    document.getElementsByClassName('hrNoTBMargin')[1].classList.remove('hide')
    switch (idx) {
        case 1: // machWip
            createSubsections(['WO Number', 'Employee ID', 'Quantity'])
            ccdiv.hidden = true
            empdiv.hidden = false
            break;
        case 3: // invLtdShelf
            createSubsections(['Exp Date', 'Quantity'])
            expdiv.hidden = false
            break;
        case 4: // invWipFg
            createSubsections(['Employee ID', 'Quantity'])
            empdiv.hidden = false
            break;
        case 5: // invRec
            createSubsections(['Quantity'])
            break;
        case 7: // qcpass
            qcSubsections('pass')
            break;
        case 8: // qcfail
            qcSubsections('fail')
            ncrdiv.hidden = false
            break;
        case 9: // qcfai
            qcSubsections('fai')
            break;
        case 10: // qc insp
            qcSubsections('qci')
            break;
        case 12:
            qtydiv.hidden = true
            ccdiv.hidden = true
            srSections('std')
            break;
        default:
            showWarningMessage('invalid label type selection!')
    }
}

function srSections(type){
    if (type == 'std'){
        gebi('subsections').classList.add('hide')
        document.getElementsByClassName('hrNoTBMargin')[1].classList.add('hide')
    }
}

function cleanMidsection() {
    const ms = gebi('midsection')

    // all divs *should* be appended, so child 1 should always be the original div, child 0 is the p element with the "lot" text.
    for (let i = 0; i < ms.children.length; i++) { // HTMLCollection does not support forEach 
        if (i > 1){
            ms.children[i].remove()
        } else if (i == 1) {
            ms.children[i].className = 'barcodeContainer'
        }
    }
}

function qcSubsections(type) {
    const parent = gebi('subsections')
    const indexOfBarcodeDiv = 1
    updateLotBarcode()
    if (type == 'pass') {
        // pass
        parent.append(createLargeQcText('*QC PASS*', 'ss23', true))

        parent.append(createStdSubsection('ssTri', 'Quantity', false, true))

    } else if (type == 'fail') {
        // fail
        const ms = document.getElementById('midsection')
        ms.children[indexOfBarcodeDiv].className += ' ss23 vr'
        ms.append(createStdSubsection('ssTri', 'Quantity', false, true))
        
        parent.append(createLargeQcText('*QC FAIL*', 'ss23', true))
        parent.append(createStdSubsection('ssTri', 'NCR #', false, true))
    } else if (type == 'fai') {
        const ms = document.getElementById('midsection')
        ms.children[indexOfBarcodeDiv].className += ' ss23 vr'
        ms.append(createStdSubsection('ssTri', 'Quantity', false, true))

        parent.append(createLargeQcText('********FAI********', 'ssMono', false))

        // parent.append(createStdSubsection('ssTri', 'NCR #', false, true))
    } else if (type == 'qci') {
        const ms = document.getElementById('midsection')
        ms.children[indexOfBarcodeDiv].className += ' ss23 vr'
        ms.append(createStdSubsection('ssTri', 'Quantity', false, true))

        parent.append(createLargeQcText('QC INSPECTION', 'ssMono', false))
    }
}

/**
 * 
 * @param {string} text 
 * @param {'ssMono' | 'ssBi' | 'ssTri' | 'ss23'} type 
 * @param {boolean} vr 
 */
function createLargeQcText(text, type, vr) {
    const ss = document.createElement('div')
    ss.className = `subsection flex ${vr ? ' vr' : ''} ${type}`

    const lb = document.createElement('p')
    lb.className = 'note largerer boldborder'
    lb.innerHTML = text

    ss.append(lb)
    return ss
}

/**
 * 
 * @param {Array<string>} labels array of labels to use
 */
function createSubsections(labels) {
    const parent = document.getElementById('subsections')
    const types =  ['ssMono', 'ssBi', 'ssTri']

    let idx = 0
    labels.forEach(label => {
        let vr = true
        let larger = true
        if (idx == (labels.length - 1)) vr = false
        if (label == 'WO Number') larger = false
        parent.append(createStdSubsection(types[labels.length - 1], label, vr, larger))
        idx++
    })
}

/**
 * create subsection div for last section in label
 * @param {'ssMono' | 'ssBi' | 'ssTri' | 'ss23'} type determine div split
 * @param {string} label text of label
 * @param {boolean} vr use vertical rule
 * @param {boolean} vr use larger font. default false
 */
function createStdSubsection(type, label, vr, larger) {
    const ss = document.createElement('div')
    ss.className = `subsection ${type}${vr ? ' vr' : ''}`

    // remove all characters not alphanumerical (and spaces)
    const lbId = label.replace(/[^a-zA-Z0-9.,_-]/g, '').toLowerCase()
    
    const p1 = document.createElement('p')
    p1.className = 'note'
    p1.innerHTML = label
    ss.append(p1)

    const p2 = document.createElement('p')
    p2.id = `sslb${lbId}`
    if (larger) p2.className = 'larger'
    ss.append(p2)

    return ss
}

function clearSubsections() {
    const ss = document.getElementById('subsections')
    ss.innerHTML = ''
    ss.classList.remove('hide')
}

function addParameterOption(name, placeholder, validationReq){
    const parent = gebi('form')
    const div = document.createElement('div')
    const cleanName = `${name.replace(/[^a-zA-Z0-9.,_-]/g, '').toLowerCase()}`
    div.id = cleanName+'div'

    const lb = document.createElement('label')
    lb.setAttribute('for', cleanName)
    lb.textContent = `${name}:`
    div.append(lb)

    const input = document.createElement('input')
    input.type = 'text'
    input.name = cleanName
    input.id = cleanName
    input.placeholder = placeholder
    input.oninput = function() {
        gebi(`sslb${cleanName}`).textContent = input.value
    }
    div.append(input)

    parent.append(div)
}