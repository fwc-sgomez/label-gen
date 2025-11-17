function lbTypeChange(idx) {
    updateSetting("lbType", idx)
    clearSubsections()
    const ccdiv = gebi('ccdiv')
    const ncrdiv = gebi('ncrdiv')
    const expdiv = gebi('expdiv')
    ccdiv.hidden = false
    ncrdiv.hidden = true
    expdiv.hidden = true
    switch (idx) {
        case 0: // machWip
            createSubsections(['WO Number', 'Employee ID', 'Quantity'])
            ccdiv.hidden = true
            break;
        case 1: // invLtdShelf
            createSubsections(['Exp Date', 'Quantity'])
            expdiv.hidden = false
            break;
        case 2: // invWipFg
            createSubsections(['Employee ID', 'Quantity'])
            break;
        case 3: // invRec
            createSubsections(['Quantity'])
            break;
        case 4: // qcpass
            qcSubsections('pass')
            break;
        case 5: // qcfail
            qcSubsections('fail')
            ncrdiv.hidden = false
            break;
        case 6: // qcfai
            qcSubsections('fai')
            break;
        case 7: // qc insp
            qcSubsections('qci')
            break;
        default:
            showWarningMessage('invalid selection!')
    }
}

function qcSubsections(pf) {
    const parent = gebi('subsections')
    updateLotBarcode()
    if (pf == 'pass') {
        // pass
        parent.append(createLargeQcText('*QC PASS*', 'ss23', true))

        parent.append(createStdSubsection('ssTri', 'Quantity', false, true))

    } else if (pf == 'fail') {
        // fail
        parent.append(createLargeQcText('*QC FAIL*', 'ss23', true))

        parent.append(createStdSubsection('ssTri', 'NCR #', false, true))
    } else if (pf == 'fai') {
        parent.append(createLargeQcText('********FAI********', 'ssMono', false))

        // parent.append(createStdSubsection('ssTri', 'NCR #', false, true))
    } else if (pf == 'qci') {
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
    document.getElementById('subsections').innerHTML = ''
}