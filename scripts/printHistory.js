function saveToPrintHistory() {
    const printsData = lsRead('prints')
    let printsJson;
    if (printsData) {
        printsJson = JSON.parse(printsData)
    } else {
        printsJson = []
    }
    
    const settingsData = lsRead('settings')
    let settingsJson;
    if (settingsData) {
        settingsJson = JSON.parse(settingsData)
    } else {
        init()
        // ?
    }

    const data = {
        lbType: settingsData.lbType,
        id: printsJson.length,
        company: gebi('company').selectedIndex,
        part: gebi('part').value,
        rev: gebi('rev').value,
        wo: gebi('wonum').value,
        empId: gebi('emp').value,
        qty: gebi('qty').value,
        lot: lotCode, // lot code is generated in updateLotBarcode() and itn't accessible elsewhere so i made lotCode global instead...
        fullPart: fullPn, // same thing as lot- made global
        date: Date.now()
    }
    console.log(data)

    printsJson.push(data)
    lsStore('prints', printsJson)
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
            loadPrint(print.id)
        })
        

        let sec1 = document.createElement('div')
        sec1.className = 'phSec'
        let sec2 = document.createElement('div')
        sec2.className = 'phSec'
        let sec3 = document.createElement('div')
        sec3.className = 'phSec'

        sec1.append(hsCreatePEl('PN: '+print.part+print.rev, true))
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

function loadPrint(id) {
    const data = lsRead('prints')
    let json;
    if (!data) {
        return;
    } else {
        json = JSON.parse(data)
    }
    console.log(json[id])
    
}