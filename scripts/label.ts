// fake label, ignore
const label: Label = {
    display: 'Inv Label',
    name: 'invlabel',
    type: '99014',
    w: 1,
    h: 2,
    rows: [
        {
            cols: [
                { 
                    type: 'barcode',
                    largeFont: false,
                    width: '1/2'
                },
                { 
                    type: 'barcode',
                    largeFont: false,
                    width: '1/2'
                },
            ]
        },
        {
            cols: [
                { 
                    type: 'barcode',
                    largeFont: false,
                    width: '1/2'
                },
                { 
                    type: 'barcode',
                    largeFont: false,
                    width: '1/2'
                },
            ]
        },
    ]
}

interface Label {
    display: string
    name: string
    type: '99014'
    w: number
    h: number
    rows: LabelRow[]
}

interface LabelRow {
    cols: LabelCol[]
}

interface LabelCol {
    type: 'pnbarcode' | 'barcode' | 'date' | 'input'
    largeFont: boolean
    width: '1' | '1/2' | '1/3' | '2/3'
}