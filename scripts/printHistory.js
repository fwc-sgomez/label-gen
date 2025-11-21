function saveToPrintHistory() {
    const prints = lsReadJson('prints')
    const settings = lsReadJson('settings')
    
    const data = {
        lbType: settings.lbType,
        id: prints.length,
        company: gebi('company').selectedIndex,
        part: gebi('part').value,
        rev: gebi('rev').value,
        wo: gebi('wonum').value,
        empId: gebi('emp').value,
        qty: gebi('qty').value,
        lot: lotCode, // lot code is generated in updateLotBarcode() and itn't accessible elsewhere so i made lotCode global instead...
        fullPart: fullPn, // same thing as lot- made global
        date: Date.now(),
        ncr: gebi('ncr').value,
        cc: gebi('cc').value,
        exp: gebi('exp').valueAsNumber || 0
    }
    console.log(data)

    prints.push(data)
    lsStore('prints', prints)
}

function loadPrintHistory() {
    clearPrintHistory()
    const parent = gebi('prints')

    const hs = lsRead('prints')
    let history;
    if (hs){
        history = JSON.parse(hs)
    } else {
        return;
    }

    let idx = 0
    history.forEach(print => {
        const date = new Date(print.date)
        const div_label = document.createElement('div')
        div_label.className = 'phLabel'
        div_label.addEventListener('click', (e) => {
            reloadPrint(print.id)
        })
        
        let sec1 = document.createElement('div')
        sec1.className = 'phSec'
        let sec2 = document.createElement('div')
        sec2.className = 'phSec'
        let sec3 = document.createElement('div')
        sec3.className = 'phSec'

        sec1.append(hsCreatePEl(`PN: ${print.part}-${print.rev}`, true))
        sec1.append(hsCreatePEl('Lot: '+print.lot))
        div_label.append(sec1)

        // div_label.append(document.createElement('br'))
        div_label.append(document.createElement('hr'))
        sec2.append(hsCreatePEl('WO: '+print.wo, true))
        sec2.append(hsCreatePEl('Emp: '+print.empId, true))
        sec2.append(hsCreatePEl('Qty: '+print.qty))
        div_label.append(sec2)

        // div_label.append(document.createElement('br'))
        div_label.append(document.createElement('hr'))
        sec3.append(hsCreatePEl('Printed: '+date.toLocaleString()))
        div_label.append(sec3)
        parent.prepend(div_label) // prepend so that newest is on top
        idx++
    })
}

function hsCreatePEl(text, vr = false) {
    const p = document.createElement('p')
    p.className = `phText${vr ? ' phVr' : ''}`
    p.innerHTML = `${text}${vr ? ' ' : ''}`
    return p
}

function clearPrintHistory() {
    gebi('prints').innerHTML = ''
}

function reloadPrint(id) {
    const prints = lsReadJson('prints')
    const print = prints[id]

    gebi('labelType').selectedIndex = print.lbType
    lbTypeChange(print.lbType)
    
    gebi('part').value = print.part
    gebi('rev').value = print.rev
    gebi('lot').value = print.lot
    gebi('wonum').value = print.wo
    gebi('cc').value = print.cc
    gebi('company').selectedIndex = print.company
    
    gebi('qty').value = print.qty
    const lbqty = gebi('sslbquantity')
    if (lbqty) lbqty.textContent = print.qty
    
    gebi('emp').value = print.empId
    const lbeid = gebi('sslbemployeeid')
    if (lbeid) lbeid.textContent = print.empId

    gebi('ncr').value = print.ncr
    const lbncr = gebi('sslbncr')
    if (lbncr) lbncr.textContent = print.ncr

    const expDate = new Date(print.exp).toISOString().split('T')[0]
    gebi('exp').value = expDate
    const lbexp = gebi('sslbexpdate')
    if (lbexp) lbexp.textContent = reformatDatePicker(expDate)

    updatePnBarcode()
    updateLotBarcode()
    updateCompany()
}