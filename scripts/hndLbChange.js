function lbTypeChange(idx) {
    updateSetting("lbType", idx)
    clearSubsections()

    switch (idx) {
        case 0: // machWip
            createSubsections(['WO Number', 'Employee ID', 'Quantity'])
            break;
        case 1: // invLtdShelf
            createSubsections(['Exp Date', 'Quantity'])
            break;
        case 2: // invWipFg
            createSubsections(['Employee ID', 'Quantity'])
            break;
        case 3: // invRec
            createSubsections(['Quantity'])
            break;
    }
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
        parent.append(createSubsection(types[labels.length - 1], label, vr, larger))
        idx++
    })
}

/**
 * create subsection div for last section in label
 * @param {'ssMono' | 'ssBi' | 'ssTri'} type determine div split
 * @param {string} label text of label
 * @param {boolean} vr use vertical rule
 * @param {boolean} vr use larger font. default false
 */
function createSubsection(type, label, vr, larger) {
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