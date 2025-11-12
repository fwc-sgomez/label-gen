
const ver = '1.1.0'
const debug = true

const defaultSettings = {
    init: true,
    lbType: 'machwip',
    ver: ver
}

function init() {
    const settings = JSON.parse(lsRead('settings'))
    if (!settings.ver) {
        console.log('initialising settings!')
        lsStore('settings', defaultSettings)
        lsStore('prints', '[]') // init empty array
    }
} init()

/**
 * store data into a key
 * @param {string} key 
 * @param {string | JSON} data 
 * @returns nothing
 */
function lsStore(key, data) {
    consoleDbg(`WRITE KEY: ${key}\nWRITE DATA: ${data}`)
    if (!key || !data) {
        console.warn('key or data args missing!')
        showWarningMessage('internal error occured!', 5)
        return;
    }
    if (typeof(data) != 'string'){
        if (typeof(data) == 'object'){
            data = JSON.stringify(data)
        } else {
            console.warn('data type unknown!')
        }
    }
    localStorage.setItem(key, data)
}

/**
 * read data in a key
 * @param {string} key 
 * @returns string stored in key
 */
function lsRead(key) {
    consoleDbg(`READ KEY: ${key}`)
    if (!key){
        console.warn('no key to read from was provided!')
        showWarningMessage('internal error occured!', 5)
        return;
    }
    const r = localStorage.getItem(key)
    consoleDbg(`READ RET: ${r}`)
    return r
}



function consoleDbg(data) {
    if (debug){
        console.log(data)
    }
}