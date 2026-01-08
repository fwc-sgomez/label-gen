function lbTypeChange(value) {
    if (getSetting('lbType') == 'invconsumables') {
        restoreFromInvC()
    }
    updateSetting("lbType", value)
    clearSubsections()
    cleanMidsection()

    gebi('ptndiv').hidden = true
    gebi('descdiv').hidden = true
    gebi('riddiv').hidden = true
    gebi('deptdiv').hidden = true

    const ccdiv = gebi('ccdiv')
    const ncrdiv = gebi('ncrdiv')
    const expdiv = gebi('expdiv')
    const empdiv = gebi('empdiv')
    const qtydiv = gebi('qtydiv')
    const wodiv = gebi('wodiv')
    const wopo = gebi('wopo')
    ccdiv.hidden = false
    ncrdiv.hidden = true
    expdiv.hidden = true
    empdiv.hidden = true
    qtydiv.hidden = false
    wodiv.hidden = false
    wopo.textContent = 'Work Order:'
    document.getElementsByClassName('hrNoTBMargin')[1].classList.remove('hide')
    switch (value) {
        case 'machwip': // machWip
            createSubsections(['WO Number', 'Employee ID', 'Quantity'])
            ccdiv.hidden = true
            empdiv.hidden = false
            break;
        case 'invltdshelf': // invLtdShelf
            createSubsections(['Exp Date', 'Quantity'])
            expdiv.hidden = false
            wopo.textContent = 'PO Number:'
            break;
        case 'invwipfg': // invWipFg
            createSubsections(['Employee ID', 'Quantity'])
            empdiv.hidden = false
            break;
        case 'invrec': // invRec
            createSubsections(['Quantity'])
            wopo.textContent = 'PO Number:'
            break;
        case 'invconsumables':
            invConsumables()
            wodiv.hidden = true
            empdiv.hidden = true
            ccdiv.hidden = true
            break;
        case 'qcpass': // qcpass
            qcSubsections('pass')
            wopo.textContent = 'PO Number:'
            break;
        case 'qcfail': // qcfail
            qcSubsections('fail')
            ncrdiv.hidden = false
            wopo.textContent = 'PO Number:'
            break;
        case 'qcfai': // qcfai
            qcSubsections('fai')
            wopo.textContent = 'PO Number:'
            break;
        case 'qcinsp': // qc insp
            qcSubsections('qci')
            wopo.textContent = 'PO Number:'
            break;
        case 'srstd':
            // qtydiv.hidden = true
            ccdiv.hidden = true
            srSections('std')
            wopo.textContent = 'PO Number:'
            break;
        default:
            showWarningMessage('invalid label type selection!')
    }
}

function invConsumables() {
    // each row has max length of 142 characters
    // ss23 can hold up to about 96 characters
    // this label type kina hijacks the entire label
    const topSsName = 'Part/Tool Number'
    const midSsItemDesc = 'Item Description'
    const msParent = gebi('midsection')
    const lsParent = gebi('lowersection')

    gebi('ptndiv').hidden = false
    gebi('descdiv').hidden = false
    gebi('riddiv').hidden = false
    gebi('deptdiv').hidden = false

    clearSubsections('topsection')
    createSubsections([topSsName], 'topsection', false)
    const tss = gebi(getSubsectionName(topSsName))
    tss.classList.add('noTBMargin')

    clearSubsections('midsection')
    msParent.append(getStdSubsection('ss23', midSsItemDesc, true, false))
    msParent.append(getStdSubsection('ssTri', 'Req ID', false, true))
    const mss = gebi(getSubsectionName(midSsItemDesc))
    mss.classList.add('noTBMargin')
    mss.classList.add('padLeft')

    clearSubsections('lowersection')
    lsParent.append(getStdSubsection('ss23', 'Department', true, true))
    lsParent.append(getStdSubsection('ssTri', 'Quantity', false, true))

    gebi('part').disabled = true
    gebi('rev').disabled = true
    gebi('lot').disabled = true
}

function restoreFromInvC() {
    clearSubsections('topsection')
    // clearSubsections('midsectoin')
    loadStdTopsection()
    loadStdMidsection()
    gebi('part').disabled = false
    gebi('rev').disabled = false
    gebi('lot').disabled = false
    updateLotBarcode()
    updatePnBarcode()
}

function loadStdTopsection() {
    const parent = gebi('topsection')
    parent.innerHTML = `
        <p class='bcNote'>PN</p>
        <div class='barcodeContainer'>
            <svg class='barcode' id='pn'></svg>
        </div>
    `
}

function loadStdMidsection() {
    const parent = gebi('midsection')
    parent.innerHTML = `
        <div class="subsection ssMono">
            <p class="note">LOT</p>
            <p id="sslblot" class="large"></p>
        </div>
    `
}


function getSubsectionName(name) {
    return ('sslb' + name.replace(/[^a-zA-Z0-9.,_-]/g, '').toLowerCase())
}

function srSections(type) {
    if (type == 'std'){
        const ms = gebi('midsection')
        gebi('lowersection').classList.add('hide')
        document.getElementsByClassName('hrNoTBMargin')[1].classList.add('hide')
        ms.append(getStdSubsection('ssTri', 'Quantity', false, true))
        ms.children[0].classList.add('ss23')
        ms.children[0].classList.add('vr')
    }
}

function cleanMidsection() {
    const ms = gebi('midsection')

    // all divs *should* be appended, so child 1 should always be the original div, child 0 is the p element with the "lot" text.
    for (let i = 0; i < ms.children.length; i++) { // HTMLCollection does not support forEach 
        if (i > 0){
            ms.children[i].remove()
        } else if (i == 0) {
            ms.children[i].className = 'subsection ssMono'
        }
    }
}

function qcSubsections(type) {
    const parent = gebi('lowersection')
    const indexOfBarcodeDiv = 0
    updateLotBarcode()
    if (type == 'pass') {
        // pass
        parent.append(createLargeQcText('*QC PASS*', 'ss23', true))

        parent.append(getStdSubsection('ssTri', 'Quantity', false, true))

    } else if (type == 'fail') {
        // fail
        const ms = document.getElementById('midsection')
        ms.children[indexOfBarcodeDiv].className += ' ss23 vr'
        ms.append(getStdSubsection('ssTri', 'Quantity', false, true))
        
        parent.append(createLargeQcText('*QC FAIL*', 'ss23', true))
        parent.append(getStdSubsection('ssTri', 'NCR #', false, true))
    } else if (type == 'fai') {
        const ms = document.getElementById('midsection')
        ms.children[indexOfBarcodeDiv].className += ' ss23 vr'
        ms.append(getStdSubsection('ssTri', 'Quantity', false, true))

        parent.append(createLargeQcText('********FAI********', 'ssMono', false))

        // parent.append(createStdSubsection('ssTri', 'NCR #', false, true))
    } else if (type == 'qci') {
        const ms = document.getElementById('midsection')
        ms.children[indexOfBarcodeDiv].className += ' ss23 vr'
        ms.append(getStdSubsection('ssTri', 'Quantity', false, true))

        parent.append(createLargeQcText('QC INSPECTION', 'ssMono', false))
        
    }
}

/**
 * 
 * @param {string} text - String to show 
 * @param {'ssMono' | 'ssBi' | 'ssTri' | 'ss23'} type - Size of subsection
 * @param {boolean} vr - Use vertical rule
 * @returns HTMLDivElement
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
 * create subsections
 * @param {Array<string>} labels label text, doubles as its id
 * @param {string} section choose which section to use, as element id string
 */
function createSubsections(labels, section = 'lowersection', largerFont = true) {
    const parent = document.getElementById(section)
    const types =  ['ssMono', 'ssBi', 'ssTri']

    let idx = 0
    labels.forEach(label => {
        let vr = true
        let larger = largerFont
        if (idx == (labels.length - 1)) vr = false
        if (label == 'WO Number') larger = false
        parent.append(getStdSubsection(types[labels.length - 1], label, vr, larger))
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
function getStdSubsection(type, label, vr, larger) {
    const ss = document.createElement('div')
    ss.className = `subsection ${type}${vr ? ' vr' : ''}`

    // remove all characters not alphanumerical (and spaces)
    const lbId = getSubsectionName(label)
    
    const p1 = document.createElement('p')
    p1.className = 'note'
    p1.innerHTML = label
    ss.append(p1)

    const p2 = document.createElement('p')
    p2.id = lbId
    if (larger) p2.className = 'larger'
    ss.append(p2)

    return ss
}

function clearSubsections(section = 'lowersection') {
    const ss = document.getElementById(section)
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