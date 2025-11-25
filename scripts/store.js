
const ver = '1.1.0'
const debug = false

const defaultSettings = {
    init: true,
    lbType: 1,
    ver: ver,
    cmp: 0,
    printType: 0,
    neverShowPaperTypeMsg: false
}

function init() {
    const settings = lsReadJson('settings')
    if (!settings.init) {
        console.log('initialising settings!')
        lsStore('settings', defaultSettings)
        lsStore('prints', '[]') // init empty array
    }
} init()

/**
 * store data into a key
 * @param {string} key key of data to store data to
 * @param {string | JSON} data json or string to store
 * @returns nothing
 */
function lsStore(key, data) {
    consoleDbg(`WRITE KEY: ${key}\nWRITE DATA: ${data}`) // [object Object]
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

function lsReadJson(key) {
    const data = lsRead(key)
    if (!data){
        return {}
    } else {
        return JSON.parse(data)
    }
}

function consoleDbg(data) {
    if (debug){
        console.log(data)
    }
}

function dbgForceInit() {
    updateSetting('init', false)
    init()
    window.location.reload()
}