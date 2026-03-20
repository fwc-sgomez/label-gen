class LabelRenderer {
    constructor(canvas, labelsStorageKey) {
        this.canvas = canvas
        this.labelsStorageKey = labelsStorageKey

        // defaults
        this.defaultFont = this.#pGetFontString()
        this.defaultText = '#000'
        this.canvasScale = 3

        if (this.canvas.nodeName !== 'CANVAS') throw new Error('type of labelCan must be canvas');
        if (!this.labelsStorageKey) throw new Error('no key provided for labelsStorageKey');

        this.canvas2d = this.canvas.getContext('2d')

        this.#pInitCanvas()
        this.#pLoadLabelsFromStore()
    }

    #pGetFontString(bold = 1, px = 32, family = 'Arial, Helvetica, sans-serif') {
        let str = '';
        if (bold == 1) {
            str += 'bold '
        } else if (bold > 1) {
            str += 'bolder '
            if (bold > 2) this.#log(`>> pGetFontString: arg "bold" (given: ${bold}) > 2, setting to 2`)
        }
        str += `${px}px `
        str += family
        this.#log(`>> pGetFontString: returned "${str}"`)
        return str
    }

    #pInitCanvas() {
        //initial values
        this.canvas.width = 300 * this.canvasScale
        this.canvas.height = 150 * this.canvasScale

        this.#pClearCanvas()

        const im = new Image()
        im.src = './img/fw.png'
        im.onload = () => {
            this.canvas2d.save()
            this.canvas2d.translate(this.canvas2d.width/2, this.canvas2d.height/2)
            this.canvas2d.rotate(this.#degToRad(270))
            this.canvas2d.drawImage(im, -300, 100)
            this.canvas2d.restore()
        }
        this.#pDrawLine(200, 0, 200, 200)
        this.#pDrawLine(0, 200, 200, 200)

        this.#pDrawText('Loading labels...', (this.canvas.width/2), (this.canvas.height/2))
        // this.#pDrawText('Loading...', (this.canvas.width/2), (this.canvas.height/2), this.#pGetFontString(1, 64))
        // this.#pDrawLine(0, (this.canvas.height/3), this.canvas.width, (this.canvas.height/3), 6)
        // this.#pDrawLine(0, (this.canvas.height/3)*2, this.canvas.width, (this.canvas.height/3)*2, 6)
        // this.#pDrawLine(10, 10, 10, 50, 6)
        // this.#pDrawLine((this.canvas.width/3), (this.canvas.height/3), (this.canvas.width/3), ((this.canvas.height/3)*2), 6)
    }

    #pDrawLine(startX, startY, endX, endY, thickness = (2 * this.canvasScale)) {
        this.canvas2d.beginPath()
        this.canvas2d.moveTo(startX, startY)
        this.canvas2d.lineTo(endX, endY)
        this.canvas2d.lineWidth = thickness
        this.canvas2d.strokeStyle = '#000'
        this.canvas2d.stroke()
    }

    #pDrawText(text, x, y, font = this.defaultFont, color = this.defaultText, anchor = 'center') {
        this.canvas2d.font = font
        this.canvas2d.fillStyle = color
        this.canvas2d.textAlign = anchor
        this.canvas2d.fillText(text, x, y)
    }

    #pClearCanvas() {
        this.canvas2d.fillStyle = '#FFF'
        this.canvas2d.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    #pLoadLabelsFromStore() {
        let parsedLabels = []
        const lsLabels = localStorage.getItem(this.labelsStorageKey)
        if (!lsLabels) throw new Error('no labels in storage');

        this.#log(lsLabels)
        
        const labels = JSON.parse(lsLabels)
        this.#log(`attempting to load ${labels.length} labels. label data:`)
        this.#log(labels)

        labels.forEach(labelData => {
            const lb = new Label(labelData)
            parsedLabels.push(new Label(labelData))

        })
        
    }

    set (defaultFont) {
        // this.defaultFont = this.#pGetFontString()
        this.#log(defaultFont)
    }

    render() {

    }

    #log(item) {
        const verbose = localStorage.getItem('v')
        if (verbose){
            console.log(item)
        }
    }

    #degToRad(deg) {
        return (deg * Math.PI/180)
    }

}

class Label {
    constructor(obj) {
        
    }

    get name() {
        return this.labelName
    }
}