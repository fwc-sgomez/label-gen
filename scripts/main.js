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

    attemptPrint()
}

function attemptPrint(){
    document.location = 'fwcpa://print?img=data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gODIK/9sAQwAGBAQFBAQGBQUFBgYGBwkOCQkICAkSDQ0KDhUSFhYVEhQUFxohHBcYHxkUFB0nHR8iIyUlJRYcKSwoJCshJCUk/9sAQwEGBgYJCAkRCQkRJBgUGCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQk/8AAEQgAlgCWAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A+qaKKKACiiigAooooAKKKKACiiigAooooAKKKbJIsUbSOQqqCST2FAGP4lvHEMenwH99cnBx2Xv+f+NaWn2aWNpHAg+6Ofc1j6JG2qahNqsykLnbED2FdBQAUUUUAFFFFABRRRQAUUUUAFFV59RsrVts93bwn0kkCn9TUX9t6X/0ErL/AL/r/jQBdoql/bel/wDQSsv+/wCv+NH9t6X/ANBKy/7/AK/40AXaKpf23pf/AEErL/v+v+NH9t6X/wBBKy/7/r/jQBdopEdZEV0YMrDIIOQR60tABWH4kuXlMOlwH95cEF8dl/z/ACrZnmS2heaRtqIpYn2rndDnguLqfVbueFGkOIw7gbRQNJvY37O2Szto4EGAgxU1VDq+mr11C0H1mX/Gk/tnTP8AoI2f/f5f8aXMi/ZT/lZcoqqNW049L+0P/bZf8aUanYnpe23/AH9X/Gi6F7OfZlmimRTRTruikSRemVYEUUyGrbj6KKy/FHiKz8KaDeazfH9zaxlto6u3RVHuSQPxoAzPHfxC0fwBpwudQcy3EmRBaRkeZKf6L6k/qeK+bvF3xk8WeLJXX7c+m2Z4W2s2KDH+0w+Zv5e1c54o8Tah4u1u41fUpS80zcKD8sa9kUdgP/r9ayaRSQru0jFnYsx5JJyTSUUUDCiiigArrPhh4Mbxv4utNPdT9jjPn3bDtEp5H4nC/j7VydfVPwL8E/8ACK+EkvrqLbqGqbZ5MjlI8fIn5HJ929qBM9GjjSKNY41VEQBVVRgADsKdRVDX9btfDmjXmr3rbbe0iMj+px0A9ycAe5pt21CMXJqMd2eP/tFeNGSO18IWMxEk+Li8KnogPyIfqRuP0HrXi6rsUKOgFS6hq134j1m91y/Obi8lMhHZR2UewGAPpUdfPYmt7SbZ+15BlqwOFjD7T1fqFFFFc57YUUV1PgLwBqPjfVI444pItPRgbi6Iwqr3APdj2FVCDm+WO5hicTTw9N1artFHufwV019O+H9i0gKtcvJcYPoWwPzAB/Giu1tLWGxtYbW3QRwwoI40HRVAwB+VFfSU4ckVHsfhGNxLxOInXf2m397Ja8I/ab8Quq6T4fifCvuvJgO+PlT/ANn/AEr3evln9oW9+1fEeeLORa20MX0yN/8A7PVs5keaUUUUij0f4e/BTVfHmlHVjfw6dZlykTPGXaUjgkAEYGeM56g11f8Awy9df9DRB/4Bn/4ul8BfHXw54R8I6bok+m6pJNaxkSPGke1mLFiRlgeproP+GmfC/wD0CtZ/74j/APi6CdTnv+GXrr/oaIP/AADP/wAXR/wy9df9DRB/4Bn/AOLrfP7TXhgdNI1g/wDAY/8A4uk/4aa8Nf8AQH1j8o//AIugNTO0X9mhbHVrS61DXYry1hlWSS3FsV80DnbnceD39q9yAAGBwK8gH7TPhjHOk6yD/uR//F11fgH4qaX8Q7q7g02xv4PsiK7vcKgHJwAMMeeD+VMGdpXgn7RXjI3V3a+D7OT5Yytze7T3/gQ/h8x+q17L4r8R2vhPw9fazdkeXaxlgucGRuiqPckgfjXx/Ne3WsahdatfOZLq8laV29yc8e1cOOrckOVbs+u4Ryv6zifbzXuw/P8A4H+R3fwz+Fdz42Ju7mV7TSoW2GRR88rd1TPH1P8AOvbdN+E/gzTIgiaJbzsOr3JMrN788fkK1/CGjJoHhnTdNRAhgt1Dgd3Iyx/Fia16uhhYQirq7OPOOIcViq8lTm4wTsknbTztuc//AMK+8JD/AJlzSv8AwGX/AApw8A+Ex08OaT/4Cp/hW9RXR7OHZHjfXsT/AM/JfezGj8F+GYjlPD2kqfUWkf8AhWtDDFbxrFDGkcajCqgAA+gFPoqlFLZGNStUqfHJv1YUUUUzMK+Ovixe/b/iPr82c7bpof8AvgBP/Za+xTwK+HdevP7R13Ub0nP2i6lmz67nJ/rSY0UKKKKCgooooAKKKACSABkntQAV9N/s6+GZNH8HzarcIUl1WXemRz5ScL+ZLH6EV5r8M/glqvie7hv9ct5rDR1IYiQFZbkf3VHUA/3j+Ht794y8R2XgHwhc6j5caJaxCK2gAwGfGEQD06fQA0m0ldlQhKpNU4K7eh41+0L4x/tbWrfwpZyZt7Eia7KnhpSPlX/gKn829q4rwRpS6x4s0jTyuY5blN49UBy36A1giae9uJ7+7kaW5upGlldurMxyT+Zr0b4E6f8AbfH0UxGRaW8s35gJ/wCz14cp+2rr1P1+lho5VlM+XdRb+dv8z6Uooor3j8bCiiigAooooAKKKKAM/wARXv8AZugale5x9ntZZc/7qE/0r4er7D+Ld79g+G+vzZxutjD/AN9kJ/7NXx5SZSCun+Gei2/iHx3o2m3cKz2802ZY26OqqWIP4LXMV6n+zppDX3jxr8r+70+1d93oz/IB+Rb8qAPb/wDhUXgX/oWrL/x7/Gj/AIVH4F/6Fqy/8e/xrr6KZJyH/CovAuQf+EasuP8Ae/xrW0rwX4b0RxJpuhabayDpJHbqH/76xmtmigAr5t+PnjH/AISHxPF4dtJM2WlHM2Dw85HP/fI4+pavoXWNQGm2Mk38f3UHqx6V8jeJLOSz8T6us4PmteSu2evLE/1rhx9Rxp2XU+u4NwcK+Mc5/ZV/0M4DAxXe/BfxLaeG/GIN/IsVveQNbGVjhUYspUk9hlcfjXB0V49ObhJSXQ/UMbhIYqhPDz2krH2sCGAIIIPcUV8kaP4/8UaDCsOna3dwwrwsbMHRforZArch+N3jeL72pwy/79tH/QCvWjmNPqmfm9XgbGJ/u5xa87p/k/zPpuivm1Pjz4yXrJYN9bf/AANP/wCF+eMPTTf+/B/+Kqv7QpeZzvgrMf7v3/8AAPo+ivm8/Hvxge+nD6QH/Gm/8L48Zf8APWx/8B//AK9H9oUvMP8AUrMf7v3/APAPpKisbwZfahqfhbTb7VChvLmETPsXaPm5HH0Iorti7pM+VrU3SnKm902vuOM/aHvfsvw5lhzj7VdQxfXBL/8AslfLVfR37SUd7e6No1hZWtxctJcvKywxs5G1cDOP9+vHtG+E/jXXJFW38P3sKt/y0uk8hQPX58Z/DNBKOSAJIAGSe1fV3wS8DSeDfCnm3sRj1HUWE86kcxrj5EPuAST7sR2rK+G/wHsvC1xFquuzRajqUZDRRKP3MDeozyzDsTgD0716xQJsKKKKYgoorP1zUP7OsHdT+9f5Ix7nv+FAGbcE63rohHNtafe9Gbv/AIV498evCkuneIE16GMm0v1VZGA4SVRjB+qgH8DXuOgad9gsV3f62T5nNTavpFlrunzafqNulxbTDa6N/MehHY1hiKPtYcp6+SZo8uxSr2utmvL+tT41or1nxR8ANVtJnm8PXEd9bk5WCZgkq+2T8rfXj6VxF18OvF1mxWXw7qRx1McJkH5rmvDnh6kHZo/XcLnWBxMVKnVXo3Z/cznaK05PC+vQ8y6Jqcf+9auP6VENB1Y9NLvj/wBsH/wrLlfY71XpPVSX3lGitJfDOuuMroupEe1q/wDhT4/CniGVtsehao59BaSH+lPkl2E8TSW8196Mqui8BeEZ/GXiO309Eb7MpElzIOiRg88+p6D3NbPhz4M+KtcnT7TZtpdsT8810MMB7J1J+uPrXv8A4Q8HaX4L0sWOnRnLfNLM/wB+ZvUn+Q7V14bBynK81ZHzGe8T0MLSdPDSUqj7apebf6G1FEkMaxxqFRAFVR0AHQUU6ivcPyQKKKKACiiigAooooAK50f8TzXS3W1s+B6M3c/59Kv+INQNjYlYz+/mPlxgdfc1JounjTrFI8fO3zOfegC/RRRQAUUUUAFFFFABRiiigAooooAKKKKACiiigAooooAKKKyfEd81taC3hP7+5OxcdQO5/wA+tAFO1zrmtvdHm2tvlj9CfWuiqnpNiun2UcIHzYyx9TVygAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACud0/wD4m+vXF1J9y3OyND2xRRQB0VFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/2Q=='
    setTimeout(() => {
        showWarningMessage('PrintApp is not installed. Falling back to built-in printing.')
        print()
    }, 500)
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

